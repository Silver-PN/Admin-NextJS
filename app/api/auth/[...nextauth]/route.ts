import GithubProvider from 'next-auth/providers/github';
import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import ldap from 'ldapjs';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';

export const authOptions: AuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? '',
      clientSecret: process.env.GITHUB_SECRET ?? ''
    }),
    CredentialsProvider({
      name: 'LDAP',
      credentials: {
        username: { label: 'DN', type: 'text', placeholder: '' },
        password: { label: 'Password', type: 'password' },
        loginType: { label: 'Login Type', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }

        const { username, password, loginType } = credentials;
        try {
          const user = await prisma.user.findFirst({
            where: {
              username,
              method_login_id: Number(loginType)
            },
            include: {
              method_login: true // Use correct relationship name
            }
          });

          if (!user) {
            return null;
          }

          // Handle different authentication methods
          if (user.method_login_id === Number(process.env.LOCAL_LOGIN)) {
            // Local authentication with bcrypt
            const isPasswordValid = await bcrypt.compare(
              password,
              user.password
            );
            if (!isPasswordValid) {
              return null;
            }
          } else if (user.method_login_id === Number(process.env.LDAP_LOGIN)) {
            // LDAP authentication
            let config;
            try {
              config = JSON.parse(user.method_login?.configuration ?? '{}');
            } catch (error) {
              throw new Error('Failed to parse LDAP configuration.');
            }

            const ldapUri = config.ldapUri;
            const baseDn = config.baseDn;

            if (!ldapUri || !baseDn) {
              throw new Error('LDAP configuration is missing required fields.');
            }

            const ldapAuth = new Promise<boolean>((resolve) => {
              const client = ldap.createClient({
                url: ldapUri! // Ensure the URL is valid and not undefined
              });

              client.bind(`uid=${username},${baseDn}`, password, (err) => {
                client.unbind();
                resolve(!err);
              });
            });

            const isAuthenticated = await ldapAuth;
            if (!isAuthenticated) {
              return null;
            }
          }

          // Fetch user with permissions after successful authentication
          const userWithPermissions = await prisma.user.findUnique({
            where: { username },
            include: {
              user_permissions: {
                include: {
                  permission: true
                }
              }
            }
          });

          const permissions =
            userWithPermissions?.user_permissions.map(
              (up) => up.permission.permission_code
            ) || [];

          return { user, permissions };
        } catch (error) {
          // console.error('Error during authentication:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user.user;
        token.permissions = user.permissions;
      }
      // console.log(token);

      return token;
    },
    async session({ session, token }) {
      if (token.user) {
        const { method_login, ...userWithoutMethodLogin } = token.user as any;
        session.user = userWithoutMethodLogin;
        // session.user = token.user;
        // session.permissions = token.permissions;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};

export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

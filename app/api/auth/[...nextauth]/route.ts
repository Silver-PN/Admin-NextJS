import GithubProvider from 'next-auth/providers/github';
import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
// import ldap from 'ldapjs';
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
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials) {
          console.error('No credentials provided');
          return null;
        }

        const { username, password } = credentials;

        try {
          const user = await prisma.user.findUnique({
            where: { username }
          });

          if (!user) {
            console.error(`User not found: ${username}`);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) {
            console.error('Invalid password');
            return null;
          }

          const userWithPermissions = await prisma.user.findUnique({
            where: { username },
            include: {
              permissions: {
                include: {
                  permission: true
                }
              }
            }
          });

          const permissions =
            userWithPermissions?.permissions.map((up) => up.permission.name) ||
            [];

          return { user, permissions };
        } catch (error) {
          console.error('Error during authentication:', error);
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
      return token;
    },
    async session({ session, token }) {
      if (token.user) {
        session.user = token.user;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};

export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

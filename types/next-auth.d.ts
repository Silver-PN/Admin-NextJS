import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  type UserSession = DefaultSession['user'];
  interface User {
    user: UserSession;
    permissions: string[];
  }

  interface Session {
    user: UserSession;
  }

  interface CredentialsInputs {
    username: string;
    password: string;
    loginType: string;
  }
}

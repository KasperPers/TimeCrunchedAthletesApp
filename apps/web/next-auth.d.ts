import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user'];
    accessToken?: string;
    refreshToken?: string;
  }

  interface User {
    stravaId?: number;
    ftp?: number;
    weight?: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    accessToken?: string;
    refreshToken?: string;
  }
}

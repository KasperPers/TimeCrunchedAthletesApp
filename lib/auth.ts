import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    {
      id: 'strava',
      name: 'Strava',
      type: 'oauth',
      authorization: {
        url: 'https://www.strava.com/oauth/authorize',
        params: {
          scope: 'read,activity:read_all,profile:read_all',
          approval_prompt: 'auto',
          response_type: 'code',
        },
      },
      token: 'https://www.strava.com/oauth/token',
      userinfo: 'https://www.strava.com/api/v3/athlete',
      clientId: process.env.STRAVA_CLIENT_ID,
      clientSecret: process.env.STRAVA_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: `${profile.firstname} ${profile.lastname}`,
          email: profile.email,
          image: profile.profile,
          stravaId: profile.id,
          ftp: profile.ftp || null,
          weight: profile.weight || null,
        };
      },
    },
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // Fetch the account to get the access token
        const account = await prisma.account.findFirst({
          where: { userId: user.id, provider: 'strava' },
        });
        if (account) {
          session.accessToken = account.access_token;
          session.refreshToken = account.refresh_token;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
  session: {
    strategy: 'database',
  },
};

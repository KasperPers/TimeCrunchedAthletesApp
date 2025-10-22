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
      token: {
        url: 'https://www.strava.com/oauth/token',
        async request({ client, params, checks, provider }) {
          const response = await fetch('https://www.strava.com/oauth/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              client_id: provider.clientId,
              client_secret: provider.clientSecret,
              code: params.code,
              grant_type: 'authorization_code',
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(`Token exchange failed: ${JSON.stringify(data)}`);
          }

          // Strava returns athlete data in the token response
          // Extract it for later use but don't include it in tokens
          const { athlete, ...tokens } = data;

          // Store athlete_id if provided
          if (athlete?.id) {
            tokens.athlete_id = athlete.id;
          }

          return { tokens };
        },
      },
      userinfo: {
        url: 'https://www.strava.com/api/v3/athlete',
        async request({ tokens, provider }) {
          const response = await fetch('https://www.strava.com/api/v3/athlete', {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
            },
          });

          return await response.json();
        },
      },
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

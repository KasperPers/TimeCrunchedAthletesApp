import axios from 'axios';
import { prisma } from '@/lib/prisma';

/**
 * Refresh Strava access token if expired
 */
export async function refreshStravaToken(account: any): Promise<string> {
  try {
    const response = await axios.post('https://www.strava.com/oauth/token', {
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: account.refresh_token,
    });

    const { access_token, refresh_token, expires_at } = response.data;

    // Update the account with new tokens
    await prisma.account.update({
      where: { id: account.id },
      data: {
        access_token,
        refresh_token,
        expires_at,
      },
    });

    return access_token;
  } catch (error) {
    console.error('Error refreshing Strava token:', error);
    throw new Error('Failed to refresh Strava token. Please reconnect your Strava account.');
  }
}

/**
 * Get valid Strava access token, refreshing if necessary
 */
export async function getValidStravaToken(account: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  // Check if token is expired
  if (account.expires_at && account.expires_at < now) {
    console.log('Access token expired, refreshing...');
    return await refreshStravaToken(account);
  }

  return account.access_token;
}

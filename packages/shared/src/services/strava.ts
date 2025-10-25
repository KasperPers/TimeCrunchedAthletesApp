import axios from 'axios';
import { StravaActivity } from '../types';

const STRAVA_API_BASE = 'https://www.strava.com/api/v3';

export class StravaService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Fetch activities from Strava
   * @param after - Unix timestamp to fetch activities after
   * @param perPage - Number of activities per page (max 200)
   */
  async getActivities(after?: number, perPage: number = 100): Promise<StravaActivity[]> {
    try {
      const params: any = {
        per_page: perPage,
      };

      if (after) {
        params.after = after;
      }

      const response = await axios.get(`${STRAVA_API_BASE}/athlete/activities`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
        params,
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching Strava activities:', error);
      throw new Error('Failed to fetch Strava activities');
    }
  }

  /**
   * Get activities from the last N days
   */
  async getRecentActivities(days: number = 42): Promise<StravaActivity[]> {
    const now = new Date();
    const pastDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const unixTimestamp = Math.floor(pastDate.getTime() / 1000);

    return this.getActivities(unixTimestamp, 200);
  }

  /**
   * Get athlete profile
   */
  async getAthlete() {
    try {
      const response = await axios.get(`${STRAVA_API_BASE}/athlete`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching athlete profile:', error);
      throw new Error('Failed to fetch athlete profile');
    }
  }
}

/**
 * Calculate Training Stress Score (TSS) for an activity
 * TSS = (seconds × NP × IF) / (FTP × 3600) × 100
 * Simplified for activities without power data
 */
export function calculateTSS(
  activity: StravaActivity,
  userFTP: number
): number {
  // If we have power data, use it
  if (activity.average_watts && userFTP) {
    const hours = activity.moving_time / 3600;
    const normalizedPower = activity.average_watts * 1.05; // Rough estimate
    const intensityFactor = normalizedPower / userFTP;
    const tss = (hours * normalizedPower * intensityFactor) / (userFTP) * 100;
    return Math.round(tss);
  }

  // For activities without power data, estimate based on heart rate or time
  if (activity.average_heartrate) {
    const hours = activity.moving_time / 3600;
    // Rough TSS estimation based on heart rate zones
    // This is a simplified model
    const estimatedIntensity = activity.average_heartrate / 170; // Assume max HR ~170
    const tss = hours * 100 * Math.pow(estimatedIntensity, 2);
    return Math.round(tss);
  }

  // Fallback: estimate based on time and activity type
  const hours = activity.moving_time / 3600;
  let intensityMultiplier = 0.5; // Default for easy activities

  if (activity.type === 'Run') {
    intensityMultiplier = 0.7;
  } else if (activity.type === 'Ride' || activity.type === 'VirtualRide') {
    intensityMultiplier = 0.6;
  }

  return Math.round(hours * 100 * intensityMultiplier);
}

/**
 * Determine workout type based on power/heart rate
 */
export function determineWorkoutType(
  activity: StravaActivity,
  userFTP: number
): string {
  if (activity.average_watts && userFTP) {
    const intensity = (activity.average_watts / userFTP) * 100;

    if (intensity < 55) return 'Recovery';
    if (intensity < 75) return 'Endurance';
    if (intensity < 90) return 'Tempo';
    if (intensity < 105) return 'Threshold';
    if (intensity < 120) return 'VO2Max';
    return 'Anaerobic';
  }

  // Fallback to activity name analysis
  const name = activity.name.toLowerCase();
  if (name.includes('recovery') || name.includes('easy')) return 'Recovery';
  if (name.includes('endurance') || name.includes('long')) return 'Endurance';
  if (name.includes('tempo')) return 'Tempo';
  if (name.includes('threshold') || name.includes('ftp')) return 'Threshold';
  if (name.includes('vo2') || name.includes('intervals')) return 'VO2Max';
  if (name.includes('sprint') || name.includes('anaerobic')) return 'Anaerobic';

  return 'Endurance'; // Default
}

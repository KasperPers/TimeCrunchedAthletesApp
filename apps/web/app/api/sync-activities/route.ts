import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { StravaService, calculateTSS, determineWorkoutType } from '@/lib/services/strava';
import { TrainingAnalysisService } from '@/lib/services/analysis';
import { getValidStravaToken, refreshStravaToken } from '@/lib/utils/strava-auth';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's Strava access token
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'strava',
      },
    });

    if (!account?.access_token) {
      return NextResponse.json(
        { error: 'Strava account not connected' },
        { status: 400 }
      );
    }

    // Check if token is expired and refresh if needed
    let accessToken = account.access_token;
    const now = Math.floor(Date.now() / 1000);

    if (account.expires_at && account.expires_at < now) {
      console.log('Access token expired, refreshing...');
      accessToken = await refreshStravaToken(account);
    }

    // Get user's FTP
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    const userFTP = user?.ftp || 200; // Default FTP if not set

    // Fetch recent activities from Strava
    const stravaService = new StravaService(accessToken);

    let activities;
    try {
      activities = await stravaService.getRecentActivities(42); // Last 6 weeks
    } catch (error: any) {
      // If we still get 401, try refreshing token even if it wasn't expired
      if (error.response?.status === 401 || error.message?.includes('401')) {
        console.log('Got 401 error, attempting token refresh...');
        accessToken = await refreshStravaToken(account);
        const stravaServiceRetry = new StravaService(accessToken);
        activities = await stravaServiceRetry.getRecentActivities(42);
      } else {
        throw error;
      }
    }

    // Save or update activities in database
    for (const activity of activities) {
      const tss = calculateTSS(activity, userFTP);
      const workoutType = determineWorkoutType(activity, userFTP);

      await prisma.activity.upsert({
        where: { stravaId: activity.id },
        update: {
          name: activity.name,
          type: activity.type,
          startDate: new Date(activity.start_date),
          distance: activity.distance,
          movingTime: activity.moving_time,
          elapsedTime: activity.elapsed_time,
          totalElevationGain: activity.total_elevation_gain,
          averageSpeed: activity.average_speed,
          maxSpeed: activity.max_speed,
          averageHeartrate: activity.average_heartrate,
          maxHeartrate: activity.max_heartrate,
          averageWatts: activity.average_watts,
          maxWatts: activity.max_watts,
          kilojoules: activity.kilojoules,
          averageCadence: activity.average_cadence,
          sufferScore: activity.suffer_score,
          tss,
          workoutType,
        },
        create: {
          stravaId: activity.id,
          userId: session.user.id,
          name: activity.name,
          type: activity.type,
          startDate: new Date(activity.start_date),
          distance: activity.distance,
          movingTime: activity.moving_time,
          elapsedTime: activity.elapsed_time,
          totalElevationGain: activity.total_elevation_gain,
          averageSpeed: activity.average_speed,
          maxSpeed: activity.max_speed,
          averageHeartrate: activity.average_heartrate,
          maxHeartrate: activity.max_heartrate,
          averageWatts: activity.average_watts,
          maxWatts: activity.max_watts,
          kilojoules: activity.kilojoules,
          averageCadence: activity.average_cadence,
          sufferScore: activity.suffer_score,
          tss,
          workoutType,
        },
      });
    }

    // Calculate training metrics
    const analysisService = new TrainingAnalysisService(activities, userFTP);
    const metrics = analysisService.calculateMetrics();

    return NextResponse.json({
      success: true,
      activitiesSynced: activities.length,
      metrics,
    });
  } catch (error: any) {
    console.error('Error syncing activities:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync activities' },
      { status: 500 }
    );
  }
}

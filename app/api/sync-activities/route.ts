import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { StravaService, calculateTSS, determineWorkoutType } from '@/lib/services/strava';
import { TrainingAnalysisService } from '@/lib/services/analysis';

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

    // Get user's FTP
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    const userFTP = user?.ftp || 200; // Default FTP if not set

    // Fetch recent activities from Strava
    const stravaService = new StravaService(account.access_token);
    const activities = await stravaService.getRecentActivities(42); // Last 6 weeks

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
  } catch (error) {
    console.error('Error syncing activities:', error);
    return NextResponse.json(
      { error: 'Failed to sync activities' },
      { status: 500 }
    );
  }
}

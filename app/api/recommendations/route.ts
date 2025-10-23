import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { StravaService } from '@/lib/services/strava';
import { TrainingAnalysisService } from '@/lib/services/analysis';
import { RecommendationEngine } from '@/lib/services/recommendations';
import { getValidStravaToken, refreshStravaToken } from '@/lib/utils/strava-auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { numSessions, sessionDurations } = body;

    if (!numSessions || !sessionDurations || sessionDurations.length !== numSessions) {
      return NextResponse.json(
        { error: 'Invalid input: numSessions and sessionDurations required' },
        { status: 400 }
      );
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

    const userFTP = user?.ftp || 200;

    // Get valid access token (refresh if expired)
    let accessToken = await getValidStravaToken(account);

    // Fetch recent activities from Strava
    const stravaService = new StravaService(accessToken);

    let activities;
    try {
      activities = await stravaService.getRecentActivities(42);
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

    // Calculate training metrics
    const analysisService = new TrainingAnalysisService(activities, userFTP);
    const metrics = analysisService.calculateMetrics();

    // Generate recommendations
    const recommendationEngine = new RecommendationEngine(
      metrics,
      numSessions,
      sessionDurations
    );
    const recommendations = await recommendationEngine.generateRecommendations();

    // Save weekly plan and recommendations to database
    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)

    const weeklyPlan = await prisma.weeklyPlan.upsert({
      where: {
        userId_weekStartDate: {
          userId: session.user.id,
          weekStartDate: weekStart,
        },
      },
      update: {
        numSessions,
        sessionDurations: JSON.stringify(sessionDurations),
      },
      create: {
        userId: session.user.id,
        weekStartDate: weekStart,
        numSessions,
        sessionDurations: JSON.stringify(sessionDurations),
      },
    });

    // Delete existing recommendations for this week
    await prisma.recommendation.deleteMany({
      where: { weeklyPlanId: weeklyPlan.id },
    });

    // Save new recommendations
    for (const rec of recommendations) {
      await prisma.recommendation.create({
        data: {
          userId: session.user.id,
          weeklyPlanId: weeklyPlan.id,
          sessionNumber: rec.sessionNumber,
          workoutName: rec.workout.name,
          workoutUrl: rec.workout.url,
          workoutDuration: rec.workout.duration,
          workoutType: rec.workout.type,
          workoutTss: rec.workout.tss,
          description: rec.workout.description,
          reason: rec.reason,
        },
      });
    }

    return NextResponse.json({
      success: true,
      recommendations,
      metrics,
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

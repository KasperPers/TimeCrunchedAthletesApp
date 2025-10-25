import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { StravaService } from '@/lib/services/strava';
import { TrainingAnalysisService } from '@/lib/services/analysis';
import { RecommendationEngine } from '@/lib/services/recommendations';
import { getValidStravaToken, refreshStravaToken } from '@/lib/utils/strava-auth';

/**
 * GET /api/recommendations
 * Fetch saved recommendations for the current week
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get start of current week (Sunday)
    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - now.getDay());
    currentWeekStart.setHours(0, 0, 0, 0);

    // Find the weekly plan for current week
    const weeklyPlan = await prisma.weeklyPlan.findFirst({
      where: {
        userId: session.user.id,
        weekStartDate: currentWeekStart,
      },
    });

    if (!weeklyPlan) {
      return NextResponse.json({ recommendations: [] });
    }

    // Fetch recommendations for this week's plan
    const dbRecommendations = await prisma.recommendation.findMany({
      where: {
        weeklyPlanId: weeklyPlan.id,
      },
      orderBy: {
        sessionNumber: 'asc',
      },
    });

    // Fetch full workout details including intervals
    const recommendations = await Promise.all(
      dbRecommendations.map(async (rec) => {
        const workout = await prisma.zwiftWorkout.findFirst({
          where: { url: rec.workoutUrl },
        });

        console.log(`GET /api/recommendations - Workout ${rec.workoutName}:`, {
          foundInDB: !!workout,
          hasIntervals: !!workout?.intervals,
          intervalsLength: workout?.intervals?.length,
        });

        const intervals = workout?.intervals ? JSON.parse(workout.intervals) : undefined;
        console.log(`  Parsed intervals:`, intervals ? `${intervals.length} intervals` : 'none');

        return {
          sessionNumber: rec.sessionNumber,
          workout: {
            name: rec.workoutName,
            url: rec.workoutUrl,
            duration: rec.workoutDuration,
            type: rec.workoutType,
            tss: rec.workoutTss,
            description: rec.description,
            intervals,
            buildInstructions: workout?.buildInstructions || undefined,
          },
          reason: rec.reason,
        };
      })
    );

    console.log(`GET /api/recommendations - Returning ${recommendations.length} recommendations`);
    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/recommendations
 * Generate new workout recommendations based on training data
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { numSessions, sessionDurations } = body;

    if (!numSessions || !sessionDurations) {
      return NextResponse.json(
        { error: 'Invalid input: numSessions and sessionDurations required' },
        { status: 400 }
      );
    }

    // Filter out rest days (0 duration) to get actual workout durations
    const workoutDurations = sessionDurations.filter((d: number) => d > 0);

    if (workoutDurations.length !== numSessions) {
      return NextResponse.json(
        { error: `Invalid input: expected ${numSessions} workout sessions but found ${workoutDurations.length}` },
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

    // Generate recommendations (use workoutDurations, not the full 7-day array)
    const recommendationEngine = new RecommendationEngine(
      metrics,
      numSessions,
      workoutDurations
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

    // Map recommendations to actual day indices (0-6 for Mon-Sun)
    // Find which days have workouts in the sessionDurations array
    const workoutDayIndices: number[] = [];
    sessionDurations.forEach((duration: number, index: number) => {
      if (duration > 0) {
        workoutDayIndices.push(index);
      }
    });

    // Save new recommendations with correct day mapping
    for (let i = 0; i < recommendations.length; i++) {
      const rec = recommendations[i];
      const actualDayIndex = workoutDayIndices[i]; // Map to actual day of week (0-6)

      await prisma.recommendation.create({
        data: {
          userId: session.user.id,
          weeklyPlanId: weeklyPlan.id,
          sessionNumber: actualDayIndex + 1, // Store as 1-7 (Mon-Sun)
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

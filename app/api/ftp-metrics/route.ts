import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { FTPService } from '@/lib/services/ftp';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's activities (last 90 days for FTP calculation)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const activities = await prisma.activity.findMany({
      where: {
        userId: session.user.id,
        startDate: {
          gte: ninetyDaysAgo,
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    // Convert Prisma activities to the format expected by FTPService
    const stravaActivities = activities.map((a) => ({
      id: a.id,
      stravaId: a.stravaId.toString(),
      name: a.name,
      type: a.type,
      startDate: a.startDate.toISOString(),
      distance: a.distance,
      movingTime: a.movingTime,
      elapsedTime: a.elapsedTime,
      totalElevationGain: a.totalElevationGain,
      averageSpeed: a.averageSpeed || undefined,
      maxSpeed: a.maxSpeed || undefined,
      averageHeartrate: a.averageHeartrate || undefined,
      maxHeartrate: a.maxHeartrate || undefined,
      averageWatts: a.averageWatts || undefined,
      maxWatts: a.maxWatts || undefined,
      kilojoules: a.kilojoules || undefined,
      averageCadence: a.averageCadence || undefined,
      sufferScore: a.sufferScore || undefined,
      tss: a.tss || undefined,
      intensity: a.intensity || undefined,
      workoutType: a.workoutType || undefined,
    }));

    // Estimate FTP
    const ftpEstimate = FTPService.estimateFTP(stravaActivities);

    // Calculate training load metrics (CTL, ATL, TSB)
    const trainingLoad = FTPService.calculateTrainingLoad(stravaActivities, ftpEstimate.ftp);

    // Get current week's activities for compliance
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weekActivities = activities.filter((a) => a.startDate >= sevenDaysAgo);

    // Calculate actual TSS and hours for the week
    const actualTSS = weekActivities.reduce((sum, a) => sum + (a.tss || 0), 0);
    const actualHours = weekActivities.reduce((sum, a) => sum + a.movingTime / 3600, 0);

    // Get user's weekly plan (if exists)
    const currentWeekPlan = await prisma.weeklyPlan.findFirst({
      where: {
        userId: session.user.id,
        weekStartDate: {
          lte: new Date(),
        },
      },
      orderBy: {
        weekStartDate: 'desc',
      },
    });

    let compliance;
    let adaptivePlan;

    if (currentWeekPlan) {
      const sessionDurations =
        typeof currentWeekPlan.sessionDurations === 'string'
          ? JSON.parse(currentWeekPlan.sessionDurations)
          : currentWeekPlan.sessionDurations;

      const plannedMinutes = Array.isArray(sessionDurations)
        ? sessionDurations.reduce((sum: number, d: number) => sum + d, 0)
        : 0;
      const plannedHours = plannedMinutes / 60;

      // Estimate planned TSS (rough: 70 TSS per hour at moderate intensity)
      const plannedTSS = plannedHours * 70;

      // Calculate compliance
      compliance = FTPService.calculateCompliance(plannedTSS, actualTSS, plannedHours, actualHours);

      // Assess readiness
      const readiness = FTPService.assessReadiness(trainingLoad, compliance);

      // Generate adaptive plan for next week
      adaptivePlan = FTPService.generateAdaptivePlan(
        currentWeekPlan.numSessions,
        plannedMinutes,
        readiness,
        plannedTSS
      );
    } else {
      // Default compliance (no plan)
      compliance = {
        plannedTSS: 0,
        actualTSS,
        plannedHours: 0,
        actualHours,
        compliancePercentage: 0,
        status: 'on-track' as const,
      };

      // Default readiness
      const readiness = FTPService.assessReadiness(trainingLoad, compliance);

      // Default adaptive plan (4 sessions, 6 hours)
      adaptivePlan = FTPService.generateAdaptivePlan(4, 360, readiness, 300);
    }

    // Assess readiness
    const readiness = FTPService.assessReadiness(
      trainingLoad,
      compliance
    );

    // Generate summary
    const summary = FTPService.generateSummary(ftpEstimate, trainingLoad, readiness);

    return NextResponse.json({
      ftpEstimate,
      trainingLoad,
      compliance,
      readiness,
      adaptivePlan,
      summary,
      activities: stravaActivities,
    });
  } catch (error) {
    console.error('Error calculating FTP metrics:', error);
    return NextResponse.json({ error: 'Failed to calculate metrics' }, { status: 500 });
  }
}

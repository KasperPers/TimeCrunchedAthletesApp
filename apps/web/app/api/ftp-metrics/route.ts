import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { FTPService } from '@/lib/services/ftp';
import { getWeekStart } from '@/lib/utils/weeks';

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

    // Get user's weekly plan for current week (for compliance calculation)
    const currentWeekStart = getWeekStart();
    const currentWeekPlan = await prisma.weeklyPlan.findFirst({
      where: {
        userId: session.user.id,
        weekStartDate: currentWeekStart,
      },
    });

    // Get user's weekly plan for next week (for adaptive plan generation)
    const nextWeekStart = new Date(currentWeekStart);
    nextWeekStart.setDate(currentWeekStart.getDate() + 7);
    const nextWeekPlan = await prisma.weeklyPlan.findFirst({
      where: {
        userId: session.user.id,
        weekStartDate: nextWeekStart,
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

      // Generate adaptive plan for next week using next week's plan if it exists
      const planForNextWeek = nextWeekPlan || currentWeekPlan;
      const nextWeekSessionDurations =
        typeof planForNextWeek.sessionDurations === 'string'
          ? JSON.parse(planForNextWeek.sessionDurations)
          : planForNextWeek.sessionDurations;

      const nextWeekPlannedMinutes = Array.isArray(nextWeekSessionDurations)
        ? nextWeekSessionDurations.reduce((sum: number, d: number) => sum + d, 0)
        : 0;
      const nextWeekPlannedHours = nextWeekPlannedMinutes / 60;
      const nextWeekPlannedTSS = nextWeekPlannedHours * 70;

      adaptivePlan = FTPService.generateAdaptivePlan(
        planForNextWeek.numSessions,
        nextWeekPlannedMinutes,
        readiness,
        nextWeekPlannedTSS
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

      // If next week has a plan, use it; otherwise use default
      if (nextWeekPlan) {
        const nextWeekSessionDurations =
          typeof nextWeekPlan.sessionDurations === 'string'
            ? JSON.parse(nextWeekPlan.sessionDurations)
            : nextWeekPlan.sessionDurations;

        const nextWeekPlannedMinutes = Array.isArray(nextWeekSessionDurations)
          ? nextWeekSessionDurations.reduce((sum: number, d: number) => sum + d, 0)
          : 0;
        const nextWeekPlannedHours = nextWeekPlannedMinutes / 60;
        const nextWeekPlannedTSS = nextWeekPlannedHours * 70;

        adaptivePlan = FTPService.generateAdaptivePlan(
          nextWeekPlan.numSessions,
          nextWeekPlannedMinutes,
          readiness,
          nextWeekPlannedTSS
        );
      } else {
        // Default adaptive plan (4 sessions, 6 hours)
        adaptivePlan = FTPService.generateAdaptivePlan(4, 360, readiness, 300);
      }
    }

    // Assess readiness
    const readiness = FTPService.assessReadiness(
      trainingLoad,
      compliance
    );

    // Generate summary
    const summary = FTPService.generateSummary(ftpEstimate, trainingLoad, readiness);

    // Calculate trend metrics for projections
    const trends = FTPService.calculateTrendMetrics(
      stravaActivities,
      ftpEstimate.ftp,
      trainingLoad.ctl
    );

    // Determine zone mix from adaptive plan
    let zoneMix = { recovery: 0.3, progression: 0.3 }; // default
    if (adaptivePlan && adaptivePlan.sessions) {
      const recoveryCount = adaptivePlan.sessions.filter((s: any) =>
        ['Z1', 'Z2', 'Recovery', 'Endurance'].some(z => s.zone?.includes(z))
      ).length;
      const progressionCount = adaptivePlan.sessions.filter((s: any) =>
        ['Z3', 'Z4', 'Z5', 'Tempo', 'Threshold', 'VO2Max'].some(z => s.zone?.includes(z))
      ).length;
      const total = adaptivePlan.sessions.length || 1;
      zoneMix = {
        recovery: recoveryCount / total,
        progression: progressionCount / total,
      };
    }

    // Calculate days since last ride
    const lastRideDate = stravaActivities.length > 0
      ? new Date(stravaActivities[0].startDate)
      : new Date();
    const daysSinceLastRide = Math.floor(
      (Date.now() - lastRideDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Generate projections
    const projections = FTPService.generateProjections(
      ftpEstimate.ftp,
      trainingLoad.ctl,
      trainingLoad.tsb,
      trends,
      zoneMix,
      ftpEstimate.rideCount,
      daysSinceLastRide
    );

    // Generate projection summary
    const projectionSummary = FTPService.generateProjectionSummary(
      projections,
      ftpEstimate.ftp,
      trainingLoad.ctl,
      trends
    );

    return NextResponse.json({
      ftpEstimate,
      trainingLoad,
      compliance,
      readiness,
      adaptivePlan,
      summary,
      trends,
      projections,
      projectionSummary,
      activities: stravaActivities,
    });
  } catch (error) {
    console.error('Error calculating FTP metrics:', error);
    return NextResponse.json({ error: 'Failed to calculate metrics' }, { status: 500 });
  }
}

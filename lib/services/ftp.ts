import { StravaActivity } from '../types';

export interface FTPEstimate {
  ftp: number;
  accuracy: number;
  rideCount: number;
  lastUpdated: Date;
  source: 'calculated' | 'manual';
}

export interface TrainingLoadMetrics {
  ctl: number; // Chronic Training Load (42-day average)
  atl: number; // Acute Training Load (7-day average)
  tsb: number; // Training Stress Balance (CTL - ATL)
  rampRate: number; // Weekly rate of CTL change
}

export interface ComplianceMetrics {
  plannedTSS: number;
  actualTSS: number;
  plannedHours: number;
  actualHours: number;
  compliancePercentage: number;
  status: 'under' | 'on-track' | 'over';
}

export interface ReadinessStatus {
  status: 'fresh' | 'balanced' | 'fatigued';
  message: string;
  recommendedLoad: number; // multiplier for next week (0.85 - 1.15)
}

export class FTPService {
  /**
   * Estimate FTP from last 90 days of Strava activities
   */
  static estimateFTP(activities: StravaActivity[]): FTPEstimate {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Filter valid rides (power data available, >15min)
    const validRides = activities.filter((a) => {
      const activityDate = new Date(a.startDate);
      return (
        activityDate >= ninetyDaysAgo &&
        a.type.toLowerCase().includes('ride') &&
        a.movingTime > 900 && // >15 minutes
        (a.averageWatts || 0) > 0
      );
    });

    if (validRides.length === 0) {
      return {
        ftp: 200, // default fallback
        accuracy: 0,
        rideCount: 0,
        lastUpdated: new Date(),
        source: 'calculated',
      };
    }

    // Method 1: Use max 20-min power (approximated from average watts)
    // In a perfect world, we'd have normalized/weighted power for 20min
    // Here we use the highest average watts for rides 20-60min
    const twentyMinRides = validRides.filter(
      (a) => a.movingTime >= 1200 && a.movingTime <= 3600
    );

    let estimatedFTP = 200;

    if (twentyMinRides.length > 0) {
      const maxPower = Math.max(...twentyMinRides.map((a) => a.averageWatts || 0));
      estimatedFTP = Math.round(maxPower * 0.95);
    } else {
      // Fallback: use 60% of max 5-min power (rough estimate)
      const maxPower = Math.max(...validRides.map((a) => a.maxWatts || a.averageWatts || 0));
      estimatedFTP = Math.round(maxPower * 0.75);
    }

    // Calculate accuracy/confidence
    const rideCount = validRides.length;
    const daysSinceLastRide = Math.floor(
      (Date.now() - new Date(validRides[0].startDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    let accuracy = Math.min(100, (rideCount / 50) * 100); // 50+ rides = max confidence

    // Boost if recent activity
    if (accuracy > 70 && daysSinceLastRide < 5) {
      accuracy = Math.min(100, accuracy + 10);
    }

    // Reduce if data is old
    if (daysSinceLastRide > 14) {
      accuracy = Math.max(0, accuracy - 15);
    }

    // Reduce if too few rides
    if (rideCount < 10) {
      accuracy = Math.max(0, accuracy - 20);
    }

    accuracy = Math.round(Math.max(0, Math.min(100, accuracy)));

    return {
      ftp: estimatedFTP,
      accuracy,
      rideCount,
      lastUpdated: new Date(),
      source: 'calculated',
    };
  }

  /**
   * Calculate CTL, ATL, TSB from activity history
   */
  static calculateTrainingLoad(
    activities: StravaActivity[],
    userFTP: number
  ): TrainingLoadMetrics {
    const sortedActivities = [...activities].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    const tssHistory = sortedActivities.map((a) => ({
      date: new Date(a.startDate),
      tss: this.calculateTSS(a, userFTP),
    }));

    // Calculate CTL (42-day rolling average)
    const ctl = this.rollingAverageTSS(tssHistory, 42);

    // Calculate ATL (7-day rolling average)
    const atl = this.rollingAverageTSS(tssHistory, 7);

    // TSB = CTL - ATL
    const tsb = ctl - atl;

    // Calculate ramp rate (CTL change per week)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const oldCTL = this.rollingAverageTSS(
      tssHistory.filter((t) => t.date <= fourteenDaysAgo),
      42
    );
    const rampRate = (ctl - oldCTL) / 2; // per week

    return {
      ctl: Math.round(ctl),
      atl: Math.round(atl),
      tsb: Math.round(tsb),
      rampRate: Math.round(rampRate * 10) / 10,
    };
  }

  /**
   * Calculate TSS for a single activity
   */
  static calculateTSS(activity: StravaActivity, ftp: number): number {
    if (!activity.averageWatts || activity.averageWatts === 0) {
      // Estimate from HR if available
      if (activity.averageHeartrate) {
        // Rough estimate: 1 TSS per minute at moderate intensity
        return (activity.movingTime / 60) * 0.7;
      }
      return 0;
    }

    const hours = activity.movingTime / 3600;
    const intensityFactor = activity.averageWatts / ftp;
    const tss = hours * intensityFactor * intensityFactor * 100;

    return Math.round(tss);
  }

  /**
   * Calculate rolling average TSS
   */
  private static rollingAverageTSS(
    tssHistory: { date: Date; tss: number }[],
    days: number
  ): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentTSS = tssHistory.filter((t) => t.date >= cutoffDate);

    if (recentTSS.length === 0) return 0;

    const totalTSS = recentTSS.reduce((sum, t) => sum + t.tss, 0);
    return totalTSS / days; // daily average
  }

  /**
   * Calculate compliance metrics for current week
   */
  static calculateCompliance(
    plannedTSS: number,
    actualTSS: number,
    plannedHours: number,
    actualHours: number
  ): ComplianceMetrics {
    const compliancePercentage = plannedTSS > 0 ? (actualTSS / plannedTSS) * 100 : 0;

    let status: 'under' | 'on-track' | 'over' = 'on-track';
    if (compliancePercentage < 80) status = 'under';
    if (compliancePercentage > 110) status = 'over';

    return {
      plannedTSS,
      actualTSS,
      plannedHours,
      actualHours,
      compliancePercentage: Math.round(compliancePercentage),
      status,
    };
  }

  /**
   * Determine readiness and recommended load adjustment
   */
  static assessReadiness(
    trainingLoad: TrainingLoadMetrics,
    compliance: ComplianceMetrics
  ): ReadinessStatus {
    const { tsb, rampRate, atl } = trainingLoad;
    const { compliancePercentage } = compliance;

    // Fresh: TSB > +10
    if (tsb > 10) {
      return {
        status: 'fresh',
        message: 'Well-rested and ready to build. Consider increasing volume.',
        recommendedLoad: 1.1, // +10%
      };
    }

    // Fatigued: TSB < -10 OR high ATL OR overtraining
    if (tsb < -10 || atl > 100 || compliancePercentage > 120) {
      return {
        status: 'fatigued',
        message: 'Signs of overload detected. Reducing volume for recovery.',
        recommendedLoad: 0.85, // -15%
      };
    }

    // Aggressive ramp (>6 per week)
    if (rampRate > 6) {
      return {
        status: 'fatigued',
        message: 'Training load increasing rapidly. Maintaining volume.',
        recommendedLoad: 1.0,
      };
    }

    // Under-training
    if (compliancePercentage < 80 && tsb > 5) {
      return {
        status: 'fresh',
        message: 'Training volume below target. Slightly increasing load.',
        recommendedLoad: 1.05,
      };
    }

    // Balanced
    return {
      status: 'balanced',
      message: 'Training load is balanced. Maintaining current volume.',
      recommendedLoad: 1.0,
    };
  }

  /**
   * Generate adaptive weekly plan
   */
  static generateAdaptivePlan(
    numSessions: number,
    totalMinutes: number,
    readiness: ReadinessStatus,
    targetTSS: number
  ): {
    sessions: Array<{
      name: string;
      duration: number;
      zone: string;
      estimatedTSS: number;
    }>;
    totalDuration: number;
    totalTSS: number;
  } {
    // Adjust total load based on readiness
    const adjustedMinutes = Math.round(totalMinutes * readiness.recommendedLoad);
    const adjustedTSS = Math.round(targetTSS * readiness.recommendedLoad);

    // Distribute sessions based on fatigue status
    const sessions: Array<{
      name: string;
      duration: number;
      zone: string;
      estimatedTSS: number;
    }> = [];

    if (readiness.status === 'fatigued') {
      // More recovery/endurance focused
      const distribution = [
        { name: 'Recovery Spin', zone: 'Z1', intensity: 0.4 },
        { name: 'Endurance Ride', zone: 'Z2', intensity: 0.6 },
        { name: 'Easy Tempo', zone: 'Z2-Z3', intensity: 0.7 },
        { name: 'Endurance Ride', zone: 'Z2', intensity: 0.6 },
      ];

      for (let i = 0; i < numSessions && i < distribution.length; i++) {
        const duration = Math.round(adjustedMinutes / numSessions);
        const estimatedTSS = Math.round((duration / 60) * distribution[i].intensity * 100);
        sessions.push({
          name: distribution[i].name,
          duration,
          zone: distribution[i].zone,
          estimatedTSS,
        });
      }
    } else if (readiness.status === 'fresh') {
      // Build focused
      const distribution = [
        { name: 'Endurance Ride', zone: 'Z2', intensity: 0.65 },
        { name: 'Tempo Session', zone: 'Z3', intensity: 0.85 },
        { name: 'Threshold Intervals', zone: 'Z4', intensity: 1.0 },
        { name: 'VO2Max Intervals', zone: 'Z5', intensity: 1.2 },
      ];

      for (let i = 0; i < numSessions && i < distribution.length; i++) {
        const duration = Math.round(adjustedMinutes / numSessions);
        const estimatedTSS = Math.round((duration / 60) * distribution[i].intensity * 100);
        sessions.push({
          name: distribution[i].name,
          duration,
          zone: distribution[i].zone,
          estimatedTSS,
        });
      }
    } else {
      // Balanced
      const distribution = [
        { name: 'Endurance Ride', zone: 'Z2', intensity: 0.65 },
        { name: 'Tempo Session', zone: 'Z3', intensity: 0.85 },
        { name: 'Threshold Work', zone: 'Z4', intensity: 1.0 },
        { name: 'Recovery Ride', zone: 'Z1-Z2', intensity: 0.5 },
      ];

      for (let i = 0; i < numSessions && i < distribution.length; i++) {
        const duration = Math.round(adjustedMinutes / numSessions);
        const estimatedTSS = Math.round((duration / 60) * distribution[i].intensity * 100);
        sessions.push({
          name: distribution[i].name,
          duration,
          zone: distribution[i].zone,
          estimatedTSS,
        });
      }
    }

    return {
      sessions,
      totalDuration: adjustedMinutes,
      totalTSS: sessions.reduce((sum, s) => sum + s.estimatedTSS, 0),
    };
  }

  /**
   * Generate motivational summary
   */
  static generateSummary(
    ftpEstimate: FTPEstimate,
    trainingLoad: TrainingLoadMetrics,
    readiness: ReadinessStatus
  ): string {
    const { ftp, accuracy, rideCount } = ftpEstimate;
    const { tsb, rampRate } = trainingLoad;

    const parts: string[] = [];

    // FTP status
    parts.push(
      `🚴 Estimated FTP: ${ftp}W (${accuracy}% confidence from ${rideCount} rides)`
    );

    // Training load status
    if (tsb > 10) {
      parts.push(`💪 TSB: +${tsb} (well-rested)`);
    } else if (tsb < -10) {
      parts.push(`⚠️ TSB: ${tsb} (fatigued)`);
    } else {
      parts.push(`✅ TSB: ${tsb >= 0 ? '+' : ''}${tsb} (balanced)`);
    }

    // Ramp rate
    if (rampRate > 6) {
      parts.push(`📈 Ramp rate: ${rampRate}/week (aggressive - watch recovery)`);
    } else if (rampRate > 3) {
      parts.push(`📈 Ramp rate: ${rampRate}/week (safe build)`);
    } else {
      parts.push(`📊 Ramp rate: ${rampRate}/week (maintenance)`);
    }

    // Readiness message
    parts.push(`\n${readiness.message}`);

    return parts.join('\n');
  }
}

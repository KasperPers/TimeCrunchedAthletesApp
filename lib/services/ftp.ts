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

export interface ProjectionMetrics {
  ftpIn4Weeks: number;
  ftpIn6Weeks: number;
  ctlIn4Weeks: number;
  ctlIn6Weeks: number;
  confidence: number; // 0-100
  confidenceLabel: 'low' | 'medium' | 'high';
  assumptions: string[];
  projectedMonthlyFtpChangePct: number;
  volatility: number;
}

export interface TrendMetrics {
  ftp30dChangePct: number;
  hre30dChangePct: number;
  ctlRampPerWeek: number;
  volatilityFactor: number;
  weeklyTSSMean: number;
  weeklyTSSStdDev: number;
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

  /**
   * Constants for projection calculations
   */
  private static readonly SAFE_RAMP_MIN = 1.0; // CTL/week
  private static readonly SAFE_RAMP_MAX = 6.0; // CTL/week
  private static readonly FTP_MONTHLY_CHANGE_MIN = -3; // %
  private static readonly FTP_MONTHLY_CHANGE_MAX = 5; // %
  private static readonly HRE_BOOST_MIN = -2; // %
  private static readonly HRE_BOOST_MAX = 3; // %
  private static readonly LOAD_BOOST_MIN = -1.5; // %
  private static readonly LOAD_BOOST_MAX = 1.5; // %
  private static readonly PROJECTED_MONTHLY_MIN = -3; // %
  private static readonly PROJECTED_MONTHLY_MAX = 6; // %
  private static readonly FTP_MAX_CHANGE_6W = 0.10; // ±10% max over 6 weeks

  /**
   * Helper: clamp a value between min and max
   */
  private static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Helper: calculate percentage change
   */
  private static pctChange(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Helper: calculate standard deviation
   */
  private static stdDev(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
    const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * Calculate trend metrics for projections
   */
  static calculateTrendMetrics(
    activities: StravaActivity[],
    currentFTP: number,
    currentCTL: number
  ): TrendMetrics {
    // FTP 30-day change
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const recent30d = activities.filter((a) => new Date(a.startDate) >= thirtyDaysAgo);
    const previous30d = activities.filter(
      (a) => new Date(a.startDate) >= sixtyDaysAgo && new Date(a.startDate) < thirtyDaysAgo
    );

    const ftp30dAgo = previous30d.length > 0 ? this.estimateFTP(previous30d).ftp : currentFTP;
    const ftp30dChangePct = this.pctChange(currentFTP, ftp30dAgo);

    // HRE (Heart Rate Efficiency) 30-day change - simplified as HR/power ratio
    const avgHR30d =
      recent30d.reduce((sum, a) => sum + (a.averageHeartrate || 0), 0) / (recent30d.length || 1);
    const avgPower30d =
      recent30d.reduce((sum, a) => sum + (a.averageWatts || 0), 0) / (recent30d.length || 1);
    const hre30d = avgPower30d > 0 ? avgHR30d / avgPower30d : 0;

    const avgHR60d =
      previous30d.reduce((sum, a) => sum + (a.averageHeartrate || 0), 0) /
      (previous30d.length || 1);
    const avgPower60d =
      previous30d.reduce((sum, a) => sum + (a.averageWatts || 0), 0) / (previous30d.length || 1);
    const hre60d = avgPower60d > 0 ? avgHR60d / avgPower60d : 0;

    // Lower HRE is better (same power at lower HR), so invert for change pct
    const hre30dChangePct = hre60d > 0 ? -this.pctChange(hre30d, hre60d) : 0;

    // CTL ramp rate
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const ctl14dAgo = this.rollingAverageTSS(
      activities
        .filter((a) => new Date(a.startDate) <= fourteenDaysAgo)
        .map((a) => ({
          date: new Date(a.startDate),
          tss: this.calculateTSS(a, currentFTP),
        })),
      42
    );
    const ctlRampPerWeek = (currentCTL - ctl14dAgo) / 2;

    // Weekly TSS volatility (last 8 weeks)
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
    const last8Weeks = activities.filter((a) => new Date(a.startDate) >= eightWeeksAgo);

    // Group by week
    const weeklyTSS: number[] = [];
    for (let i = 0; i < 8; i++) {
      const weekStart = new Date(eightWeeksAgo);
      weekStart.setDate(weekStart.getDate() + i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weekActivities = last8Weeks.filter((a) => {
        const date = new Date(a.startDate);
        return date >= weekStart && date < weekEnd;
      });

      const weekTSS = weekActivities.reduce((sum, a) => sum + this.calculateTSS(a, currentFTP), 0);
      weeklyTSS.push(weekTSS);
    }

    const weeklyTSSMean = weeklyTSS.reduce((sum, v) => sum + v, 0) / (weeklyTSS.length || 1);
    const weeklyTSSStdDev = this.stdDev(weeklyTSS);
    const volatilityFactor = weeklyTSSMean > 0 ? weeklyTSSStdDev / weeklyTSSMean : 0;

    return {
      ftp30dChangePct,
      hre30dChangePct,
      ctlRampPerWeek,
      volatilityFactor,
      weeklyTSSMean,
      weeklyTSSStdDev,
    };
  }

  /**
   * Project CTL for future weeks
   */
  static projectCTL(currentCTL: number, rampRate: number, weeks: number): number {
    const clampedRamp = this.clamp(rampRate, this.SAFE_RAMP_MIN, this.SAFE_RAMP_MAX);
    return Math.round(currentCTL + clampedRamp * weeks);
  }

  /**
   * Project FTP for future weeks
   */
  static projectFTP(
    currentFTP: number,
    trends: TrendMetrics,
    zoneMix: { recovery: number; progression: number },
    tsb: number,
    weeks: number
  ): { ftpProjected: number; monthlyChangePct: number } {
    const { ftp30dChangePct, hre30dChangePct, ctlRampPerWeek } = trends;

    // Baseline monthly FTP delta from trend
    const monthlyFtpDeltaPct = this.clamp(
      ftp30dChangePct,
      this.FTP_MONTHLY_CHANGE_MIN,
      this.FTP_MONTHLY_CHANGE_MAX
    );

    // HRE influence (efficiency boost)
    const hreBoostPct = this.clamp(
      hre30dChangePct * 0.5,
      this.HRE_BOOST_MIN,
      this.HRE_BOOST_MAX
    );

    // Load influence (CTL ramp)
    const loadBoostPct = this.clamp(
      (ctlRampPerWeek - 3) * 0.25,
      this.LOAD_BOOST_MIN,
      this.LOAD_BOOST_MAX
    );

    // Zone-aware moderation
    let zoneMod = 0;
    if (zoneMix.recovery >= 0.7) {
      zoneMod = -0.25; // Recovery-heavy reduces gains
    } else if (zoneMix.progression >= 0.5) {
      zoneMod = 0.1; // Progression-heavy increases gains
    }

    // TSB penalty if fatigued
    let tsbPenalty = 0;
    if (tsb < -15) {
      tsbPenalty = -0.15; // 15% reduction if severely fatigued
    } else if (tsb < -10) {
      tsbPenalty = -0.10; // 10% reduction if fatigued
    }

    let projectedMonthlyPct =
      monthlyFtpDeltaPct + hreBoostPct + loadBoostPct + zoneMod * monthlyFtpDeltaPct;
    projectedMonthlyPct = this.clamp(
      projectedMonthlyPct,
      this.PROJECTED_MONTHLY_MIN,
      this.PROJECTED_MONTHLY_MAX
    );

    // Apply TSB penalty
    projectedMonthlyPct *= 1 + tsbPenalty;

    // Scale for weeks (4 weeks ~ 1 month, 6 weeks ~ 1.5 months)
    const monthsFactor = weeks / 4;
    const totalChangePct = projectedMonthlyPct * monthsFactor;

    // Cap total change to ±10% over 6 weeks
    const cappedChangePct = this.clamp(
      totalChangePct,
      -this.FTP_MAX_CHANGE_6W * 100,
      this.FTP_MAX_CHANGE_6W * 100
    );

    const ftpProjected = Math.round(currentFTP * (1 + cappedChangePct / 100));

    return { ftpProjected, monthlyChangePct: projectedMonthlyPct };
  }

  /**
   * Compute projection confidence (0-100)
   */
  static computeProjectionConfidence(
    rideCount: number,
    daysSinceLastRide: number,
    volatility: number
  ): { confidence: number; label: 'low' | 'medium' | 'high' } {
    const volumeScore = this.clamp((rideCount / 60) * 100, 20, 100);
    const recencyScore = this.clamp(100 - daysSinceLastRide * 2, 20, 100);
    const volatilityScore = this.clamp(100 - volatility * 100, 20, 100);

    const confidence = Math.round(
      0.4 * volumeScore + 0.3 * recencyScore + 0.3 * volatilityScore
    );

    let label: 'low' | 'medium' | 'high' = 'medium';
    if (confidence < 60) label = 'low';
    else if (confidence > 80) label = 'high';

    return { confidence, label };
  }

  /**
   * Generate full projection metrics
   */
  static generateProjections(
    currentFTP: number,
    currentCTL: number,
    currentTSB: number,
    trends: TrendMetrics,
    zoneMix: { recovery: number; progression: number },
    rideCount: number,
    daysSinceLastRide: number
  ): ProjectionMetrics {
    // Project CTL
    const ctlIn4Weeks = this.projectCTL(currentCTL, trends.ctlRampPerWeek, 4);
    const ctlIn6Weeks = this.projectCTL(currentCTL, trends.ctlRampPerWeek, 6);

    // Project FTP
    const { ftpProjected: ftpIn4Weeks, monthlyChangePct: monthlyPct4w } = this.projectFTP(
      currentFTP,
      trends,
      zoneMix,
      currentTSB,
      4
    );
    const { ftpProjected: ftpIn6Weeks } = this.projectFTP(
      currentFTP,
      trends,
      zoneMix,
      currentTSB,
      6
    );

    // Confidence
    const { confidence, label: confidenceLabel } = this.computeProjectionConfidence(
      rideCount,
      daysSinceLastRide,
      trends.volatilityFactor
    );

    // Build assumptions
    const assumptions: string[] = [];
    assumptions.push(
      `Current zone mix: ${Math.round(zoneMix.recovery * 100)}% recovery, ${Math.round(zoneMix.progression * 100)}% progression`
    );
    assumptions.push(`CTL ramp rate: +${trends.ctlRampPerWeek.toFixed(1)}/week`);
    assumptions.push(`No illness or injury interruptions`);
    if (trends.volatilityFactor > 0.3) {
      assumptions.push(`⚠️ High training volatility detected`);
    }
    if (rideCount < 20) {
      assumptions.push(`⚠️ Limited data - projections less reliable`);
    }
    if (currentTSB < -15) {
      assumptions.push(`⚠️ Current fatigue limiting projected gains`);
    }

    return {
      ftpIn4Weeks,
      ftpIn6Weeks,
      ctlIn4Weeks,
      ctlIn6Weeks,
      confidence,
      confidenceLabel,
      assumptions,
      projectedMonthlyFtpChangePct: monthlyPct4w,
      volatility: trends.volatilityFactor,
    };
  }

  /**
   * Generate projection summary message
   */
  static generateProjectionSummary(
    projections: ProjectionMetrics,
    currentFTP: number,
    currentCTL: number,
    trends: TrendMetrics
  ): string {
    const { ftpIn6Weeks, confidence, volatility, projectedMonthlyFtpChangePct } = projections;
    const ftpGain = ftpIn6Weeks - currentFTP;
    const { hre30dChangePct, ctlRampPerWeek } = trends;

    const messages: string[] = [];

    // Header with confidence
    if (volatility > 0.35 || confidence < 60) {
      messages.push('⚠️ High Volatility / Low Confidence');
      messages.push(
        `Training variability is high; projection confidence ${confidence}%. Normalize weekly TSS to improve predictability.`
      );
    } else if (ftpGain > 5) {
      messages.push('🔥 Projected Build');
      messages.push(
        `At +${ctlRampPerWeek.toFixed(1)} CTL/wk and ${hre30dChangePct > 0 ? 'improving' : 'stable'} HR efficiency (${hre30dChangePct >= 0 ? '+' : ''}${hre30dChangePct.toFixed(1)}%), FTP is projected +${ftpGain} W in 6 weeks (confidence ${confidence}%).`
      );
      if (projectedMonthlyFtpChangePct > 2) {
        messages.push('Keep the Z2/Z3 base with one Z4 focus day.');
      }
    } else if (Math.abs(ftpGain) <= 2) {
      messages.push('💪 Balanced');
      messages.push(
        `Stable load and efficiency; FTP expected to hold ±${Math.abs(ftpGain)} W in 6 weeks (confidence ${confidence}%). Progress comes from consistency.`
      );
    } else {
      messages.push('📊 Maintenance Phase');
      messages.push(
        `Current training pattern projects ${ftpGain >= 0 ? '+' : ''}${ftpGain} W in 6 weeks. Consider adding stimulus if building is the goal.`
      );
    }

    return messages.join('\n\n');
  }
}

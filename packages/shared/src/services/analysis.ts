import { StravaActivity, TrainingMetrics } from '../types';
import { calculateTSS, determineWorkoutType } from './strava';

export class TrainingAnalysisService {
  private activities: StravaActivity[];
  private userFTP: number;

  constructor(activities: StravaActivity[], userFTP: number = 200) {
    this.activities = activities;
    this.userFTP = userFTP;
  }

  /**
   * Calculate comprehensive training metrics
   */
  calculateMetrics(): TrainingMetrics {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fortyTwoDaysAgo = new Date(now.getTime() - 42 * 24 * 60 * 60 * 1000);

    // Filter activities by time period
    const last7Days = this.activities.filter(
      (a) => new Date(a.start_date) >= sevenDaysAgo
    );
    const last42Days = this.activities.filter(
      (a) => new Date(a.start_date) >= fortyTwoDaysAgo
    );

    // Calculate TSS for different periods
    const weeklyTSS = this.calculateTotalTSS(last7Days);
    const acuteTSS = weeklyTSS; // 7-day TSS
    const chronicTSS = this.calculateTotalTSS(last42Days) / 6; // 42-day average per week

    // Training Load (Acute:Chronic ratio)
    const trainingLoad = chronicTSS > 0 ? acuteTSS / chronicTSS : 1.0;

    // Intensity distribution
    const intensityDistribution = this.calculateIntensityDistribution(last42Days);

    // Total time and distance
    const totalTime = last7Days.reduce((sum, a) => sum + a.moving_time, 0) / 3600; // in hours
    const totalDistance = last7Days.reduce((sum, a) => sum + a.distance, 0) / 1000; // in km

    // Recent workout types
    const recentWorkoutTypes = last7Days
      .map((a) => determineWorkoutType(a, this.userFTP))
      .filter((type, index, self) => self.indexOf(type) === index);

    return {
      weeklyTSS,
      acuteTSS,
      chronicTSS,
      trainingLoad,
      intensityDistribution,
      totalTime,
      totalDistance,
      recentWorkoutTypes,
    };
  }

  /**
   * Calculate total TSS for a set of activities
   */
  private calculateTotalTSS(activities: StravaActivity[]): number {
    return activities.reduce((sum, activity) => {
      return sum + calculateTSS(activity, this.userFTP);
    }, 0);
  }

  /**
   * Calculate intensity distribution based on power zones
   */
  private calculateIntensityDistribution(activities: StravaActivity[]): TrainingMetrics['intensityDistribution'] {
    const distribution = {
      recovery: 0,
      endurance: 0,
      tempo: 0,
      threshold: 0,
      vo2max: 0,
      anaerobic: 0,
    };

    const totalTime = activities.reduce((sum, a) => sum + a.moving_time, 0);

    if (totalTime === 0) {
      return distribution;
    }

    activities.forEach((activity) => {
      const timeRatio = activity.moving_time / totalTime;
      const type = determineWorkoutType(activity, this.userFTP);

      switch (type) {
        case 'Recovery':
          distribution.recovery += timeRatio;
          break;
        case 'Endurance':
          distribution.endurance += timeRatio;
          break;
        case 'Tempo':
          distribution.tempo += timeRatio;
          break;
        case 'Threshold':
          distribution.threshold += timeRatio;
          break;
        case 'VO2Max':
          distribution.vo2max += timeRatio;
          break;
        case 'Anaerobic':
          distribution.anaerobic += timeRatio;
          break;
      }
    });

    return distribution;
  }

  /**
   * Determine what type of training is needed based on current metrics
   */
  static determineTrainingNeeds(metrics: TrainingMetrics): {
    primaryFocus: string;
    secondaryFocus: string;
    reasoning: string;
  } {
    const { trainingLoad, intensityDistribution, weeklyTSS } = metrics;

    // Check for overtraining (high acute:chronic ratio)
    if (trainingLoad > 1.5) {
      return {
        primaryFocus: 'Recovery',
        secondaryFocus: 'Endurance',
        reasoning: 'Training load is high. Focus on recovery to prevent overtraining.',
      };
    }

    // Check for undertraining (low acute:chronic ratio)
    if (trainingLoad < 0.8 && weeklyTSS < 300) {
      return {
        primaryFocus: 'Threshold',
        secondaryFocus: 'Endurance',
        reasoning: 'Training load is low. Time to build fitness with structured intervals.',
      };
    }

    // Check intensity distribution (polarized training model)
    const lowIntensity = intensityDistribution.recovery + intensityDistribution.endurance;
    const highIntensity = intensityDistribution.threshold + intensityDistribution.vo2max + intensityDistribution.anaerobic;

    // Ideal polarized training: ~80% low intensity, ~20% high intensity
    if (highIntensity > 0.3) {
      return {
        primaryFocus: 'Endurance',
        secondaryFocus: 'Recovery',
        reasoning: 'Too much high-intensity work. Need more aerobic base building.',
      };
    }

    if (highIntensity < 0.1 && weeklyTSS > 200) {
      return {
        primaryFocus: 'Threshold',
        secondaryFocus: 'VO2Max',
        reasoning: 'Good aerobic base. Time to add intensity for performance gains.',
      };
    }

    // Check for specific gaps in training
    if (intensityDistribution.threshold < 0.05) {
      return {
        primaryFocus: 'Threshold',
        secondaryFocus: 'Tempo',
        reasoning: 'Missing threshold work. Critical for improving FTP and race performance.',
      };
    }

    if (intensityDistribution.vo2max < 0.05 && weeklyTSS > 250) {
      return {
        primaryFocus: 'VO2Max',
        secondaryFocus: 'Threshold',
        reasoning: 'Need VO2max work to improve top-end fitness and aerobic capacity.',
      };
    }

    // Default: balanced approach
    return {
      primaryFocus: 'Threshold',
      secondaryFocus: 'Endurance',
      reasoning: 'Balanced training plan with mix of intensity and volume.',
    };
  }

  /**
   * Calculate optimal TSS for next workout based on training load
   */
  static calculateOptimalTSS(
    metrics: TrainingMetrics,
    sessionDuration: number
  ): number {
    const { trainingLoad, weeklyTSS } = metrics;

    // Base TSS on session duration (rough guide: 1 hour = ~70 TSS at moderate intensity)
    let baseTSS = (sessionDuration / 60) * 70;

    // Adjust based on training load
    if (trainingLoad > 1.3) {
      // Reduce TSS if training load is high
      baseTSS *= 0.7;
    } else if (trainingLoad < 0.9) {
      // Increase TSS if training load is low
      baseTSS *= 1.2;
    }

    // Ensure TSS is appropriate for duration
    const minTSS = (sessionDuration / 60) * 40; // Easy recovery
    const maxTSS = (sessionDuration / 60) * 120; // Very hard

    return Math.round(Math.max(minTSS, Math.min(maxTSS, baseTSS)));
  }
}

import { ZwiftWorkout } from '../types';

/**
 * Mock Zwift workout library
 * In production, this would be replaced with actual API calls or web scraping
 * from https://whatsonzwift.com/workouts or Zwift's official API
 */

export const ZWIFT_WORKOUTS: ZwiftWorkout[] = [
  // Recovery Workouts
  {
    name: 'Easy Spin',
    url: 'https://whatsonzwift.com/workouts/easy-spin',
    duration: 30,
    type: 'Recovery',
    tss: 20,
    description: 'Light spinning at 50-60% FTP. Perfect for active recovery.',
  },
  {
    name: 'Recovery Ride',
    url: 'https://whatsonzwift.com/workouts/recovery-ride',
    duration: 45,
    type: 'Recovery',
    tss: 28,
    description: 'Easy-paced recovery ride to promote blood flow and adaptation.',
  },

  // Endurance Workouts
  {
    name: 'Foundation',
    url: 'https://whatsonzwift.com/workouts/foundation',
    duration: 60,
    type: 'Endurance',
    tss: 55,
    description: 'Steady endurance ride at 65-75% FTP to build aerobic base.',
  },
  {
    name: 'Long Steady',
    url: 'https://whatsonzwift.com/workouts/long-steady',
    duration: 90,
    type: 'Endurance',
    tss: 75,
    description: 'Extended endurance session for building aerobic capacity.',
  },
  {
    name: 'Aerobic Ride',
    url: 'https://whatsonzwift.com/workouts/aerobic-ride',
    duration: 75,
    type: 'Endurance',
    tss: 65,
    description: 'Comfortable aerobic pace with slight variations in intensity.',
  },

  // Tempo Workouts
  {
    name: 'Tempo Builder',
    url: 'https://whatsonzwift.com/workouts/tempo-builder',
    duration: 60,
    type: 'Tempo',
    tss: 70,
    description: '3x10min at 80-85% FTP. Builds sustainable power.',
  },
  {
    name: 'Sweet Spot Short',
    url: 'https://whatsonzwift.com/workouts/sweet-spot-short',
    duration: 45,
    type: 'Tempo',
    tss: 60,
    description: '2x15min at 88-93% FTP. Efficient fitness building.',
  },
  {
    name: 'Sweet Spot',
    url: 'https://whatsonzwift.com/workouts/sweet-spot',
    duration: 60,
    type: 'Tempo',
    tss: 75,
    description: '3x12min at 88-93% FTP. The sweet spot for time-crunched athletes.',
  },

  // Threshold Workouts
  {
    name: 'FTP Booster',
    url: 'https://whatsonzwift.com/workouts/ftp-booster',
    duration: 45,
    type: 'Threshold',
    tss: 65,
    description: '2x12min at 95-100% FTP. Classic threshold intervals.',
  },
  {
    name: 'Threshold Builder',
    url: 'https://whatsonzwift.com/workouts/threshold-builder',
    duration: 60,
    type: 'Threshold',
    tss: 80,
    description: '3x10min at 95-105% FTP with short recoveries.',
  },
  {
    name: 'Over-Unders',
    url: 'https://whatsonzwift.com/workouts/over-unders',
    duration: 60,
    type: 'Threshold',
    tss: 85,
    description: 'Alternating intervals above and below FTP. Brutal but effective.',
  },
  {
    name: 'FTP Test Prep',
    url: 'https://whatsonzwift.com/workouts/ftp-test-prep',
    duration: 75,
    type: 'Threshold',
    tss: 90,
    description: '2x20min at FTP. Perfect for testing or improving threshold.',
  },

  // VO2Max Workouts
  {
    name: 'VO2 Max Short',
    url: 'https://whatsonzwift.com/workouts/vo2max-short',
    duration: 45,
    type: 'VO2Max',
    tss: 70,
    description: '5x3min at 110-120% FTP. Improves maximal oxygen uptake.',
  },
  {
    name: 'VO2 Booster',
    url: 'https://whatsonzwift.com/workouts/vo2-booster',
    duration: 60,
    type: 'VO2Max',
    tss: 85,
    description: '6x4min at 110-115% FTP. Classic VO2max development.',
  },
  {
    name: 'Tabata Intervals',
    url: 'https://whatsonzwift.com/workouts/tabata',
    duration: 45,
    type: 'VO2Max',
    tss: 75,
    description: '20 seconds hard, 10 seconds easy. The ultimate HIIT workout.',
  },
  {
    name: 'Microbursts',
    url: 'https://whatsonzwift.com/workouts/microbursts',
    duration: 60,
    type: 'VO2Max',
    tss: 80,
    description: '15 seconds on, 15 seconds off at 150% FTP. Develops peak power.',
  },

  // Mixed/Specialty Workouts
  {
    name: 'Time Crunched 30',
    url: 'https://whatsonzwift.com/workouts/time-crunched-30',
    duration: 30,
    type: 'Threshold',
    tss: 45,
    description: 'High-efficiency workout for busy athletes. Mix of tempo and threshold.',
  },
  {
    name: 'Time Crunched 45',
    url: 'https://whatsonzwift.com/workouts/time-crunched-45',
    duration: 45,
    type: 'Mixed',
    tss: 60,
    description: 'Maximum training stimulus in minimum time. Sweet spot and threshold.',
  },
  {
    name: 'Pyramid',
    url: 'https://whatsonzwift.com/workouts/pyramid',
    duration: 60,
    type: 'Mixed',
    tss: 75,
    description: 'Progressive intervals from 1 to 5 minutes and back down.',
  },
  {
    name: 'The Gorby',
    url: 'https://whatsonzwift.com/workouts/gorby',
    duration: 90,
    type: 'Mixed',
    tss: 95,
    description: 'Mix of endurance, tempo, and threshold. Complete workout.',
  },
];

export class ZwiftWorkoutService {
  /**
   * Get workouts filtered by criteria
   */
  static getWorkouts(filters?: {
    type?: string;
    minDuration?: number;
    maxDuration?: number;
    minTSS?: number;
    maxTSS?: number;
  }): ZwiftWorkout[] {
    let workouts = [...ZWIFT_WORKOUTS];

    if (filters) {
      if (filters.type) {
        workouts = workouts.filter(
          (w) => w.type.toLowerCase() === filters.type?.toLowerCase()
        );
      }

      if (filters.minDuration) {
        workouts = workouts.filter((w) => w.duration >= filters.minDuration!);
      }

      if (filters.maxDuration) {
        workouts = workouts.filter((w) => w.duration <= filters.maxDuration!);
      }

      if (filters.minTSS) {
        workouts = workouts.filter((w) => w.tss >= filters.minTSS!);
      }

      if (filters.maxTSS) {
        workouts = workouts.filter((w) => w.tss <= filters.maxTSS!);
      }
    }

    return workouts;
  }

  /**
   * Find best workout match based on requirements
   */
  static findBestMatch(
    targetType: string,
    targetDuration: number,
    targetTSS: number
  ): ZwiftWorkout | null {
    const durationTolerance = 15; // minutes
    const tssTolerance = 20;

    // Filter by type and approximate duration
    let candidates = this.getWorkouts({
      type: targetType,
      minDuration: targetDuration - durationTolerance,
      maxDuration: targetDuration + durationTolerance,
    });

    // If no exact type match, try related types
    if (candidates.length === 0) {
      const relatedTypes = this.getRelatedTypes(targetType);
      candidates = ZWIFT_WORKOUTS.filter(
        (w) =>
          relatedTypes.includes(w.type) &&
          Math.abs(w.duration - targetDuration) <= durationTolerance
      );
    }

    if (candidates.length === 0) {
      return null;
    }

    // Score each candidate based on duration and TSS match
    const scored = candidates.map((workout) => {
      const durationDiff = Math.abs(workout.duration - targetDuration);
      const tssDiff = Math.abs(workout.tss - targetTSS);
      const score = durationDiff + tssDiff;
      return { workout, score };
    });

    // Sort by score and return best match
    scored.sort((a, b) => a.score - b.score);
    return scored[0].workout;
  }

  /**
   * Get related workout types for fallback matching
   */
  private static getRelatedTypes(type: string): string[] {
    const typeMap: Record<string, string[]> = {
      Recovery: ['Recovery', 'Endurance'],
      Endurance: ['Endurance', 'Tempo', 'Recovery'],
      Tempo: ['Tempo', 'Threshold', 'Endurance'],
      Threshold: ['Threshold', 'Tempo', 'VO2Max'],
      VO2Max: ['VO2Max', 'Threshold', 'Mixed'],
      Mixed: ['Mixed', 'Threshold', 'Tempo'],
    };

    return typeMap[type] || [type];
  }

  /**
   * Get workout recommendations for a weekly plan
   */
  static getWeeklyPlan(
    numSessions: number,
    sessionDurations: number[],
    targetTypes: string[]
  ): ZwiftWorkout[] {
    const recommendations: ZwiftWorkout[] = [];

    for (let i = 0; i < numSessions; i++) {
      const duration = sessionDurations[i] || 60;
      const type = targetTypes[i] || 'Endurance';
      const targetTSS = (duration / 60) * 70; // Rough estimate

      const workout = this.findBestMatch(type, duration, targetTSS);
      if (workout) {
        recommendations.push(workout);
      }
    }

    return recommendations;
  }
}

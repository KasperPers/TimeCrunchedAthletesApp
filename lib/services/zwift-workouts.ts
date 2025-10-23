import { ZwiftWorkout } from '../types';
import { prisma } from '../prisma';

/**
 * Zwift Workout Service
 *
 * This service fetches real Zwift workouts from the database.
 * Workouts are imported from whatsonzwift.com using the crawler script.
 *
 * To update the workout library:
 * 1. Run: npx ts-node scripts/crawl-zwift-workouts.ts
 * 2. Import: POST /api/workouts/import
 * 3. Verify: GET /api/workouts/import
 *
 * Or use whatsonzwift.com to browse the full Zwift workout library.
 */

// Fallback workouts if database is empty
export const FALLBACK_WORKOUTS: ZwiftWorkout[] = [
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
   * Get workouts from database with fallback to hardcoded workouts
   */
  static async getWorkouts(filters?: {
    type?: string;
    minDuration?: number;
    maxDuration?: number;
    minTSS?: number;
    maxTSS?: number;
  }): Promise<ZwiftWorkout[]> {
    try {
      // Build database query
      const where: any = {};

      if (filters?.type) {
        // SQLite doesn't support case-insensitive mode
        where.type = filters.type;
      }

      if (filters?.minDuration || filters?.maxDuration) {
        where.duration = {};
        if (filters.minDuration) where.duration.gte = filters.minDuration;
        if (filters.maxDuration) where.duration.lte = filters.maxDuration;
      }

      if (filters?.minTSS || filters?.maxTSS) {
        where.tss = {};
        if (filters.minTSS) where.tss.gte = filters.minTSS;
        if (filters.maxTSS) where.tss.lte = filters.maxTSS;
      }

      // Fetch from database
      const dbWorkouts = await prisma.zwiftWorkout.findMany({
        where,
        orderBy: [{ type: 'asc' }, { duration: 'asc' }],
      });

      // Convert to ZwiftWorkout format
      if (dbWorkouts.length > 0) {
        return dbWorkouts.map((w) => ({
          name: w.name,
          url: w.url,
          duration: w.duration,
          type: w.type,
          tss: w.tss || 0,
          description: w.description || '',
          intervals: w.intervals ? JSON.parse(w.intervals) : undefined,
          buildInstructions: w.buildInstructions || undefined,
        }));
      }

      // Fallback to hardcoded workouts if database is empty
      console.warn('No workouts in database, using fallback workouts');
      return this.getFallbackWorkouts(filters);
    } catch (error) {
      console.error('Error fetching workouts from database:', error);
      return this.getFallbackWorkouts(filters);
    }
  }

  /**
   * Get fallback workouts when database is empty
   */
  private static getFallbackWorkouts(filters?: {
    type?: string;
    minDuration?: number;
    maxDuration?: number;
    minTSS?: number;
    maxTSS?: number;
  }): ZwiftWorkout[] {
    let workouts = [...FALLBACK_WORKOUTS];

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
   * Always returns a workout (never null) by progressively widening search criteria
   */
  static async findBestMatch(
    targetType: string,
    targetDuration: number,
    targetTSS: number
  ): Promise<ZwiftWorkout> {
    let durationTolerance = 15; // minutes
    const tssTolerance = 20;

    // Try 1: Filter by type and approximate duration
    let candidates = await this.getWorkouts({
      type: targetType,
      minDuration: targetDuration - durationTolerance,
      maxDuration: targetDuration + durationTolerance,
    });

    // Try 2: If no exact type match, try related types with same duration tolerance
    if (candidates.length === 0) {
      const relatedTypes = this.getRelatedTypes(targetType);
      const allWorkouts = await this.getWorkouts();
      candidates = allWorkouts.filter(
        (w) =>
          relatedTypes.includes(w.type) &&
          Math.abs(w.duration - targetDuration) <= durationTolerance
      );
    }

    // Try 3: Widen duration tolerance to ±30 minutes for target type
    if (candidates.length === 0) {
      durationTolerance = 30;
      candidates = await this.getWorkouts({
        type: targetType,
        minDuration: targetDuration - durationTolerance,
        maxDuration: targetDuration + durationTolerance,
      });
    }

    // Try 4: Any workout of target type (ignore duration)
    if (candidates.length === 0) {
      candidates = await this.getWorkouts({ type: targetType });
    }

    // Try 5: Last resort - get ALL workouts and pick closest match by duration
    if (candidates.length === 0) {
      console.warn(`No workouts found for type ${targetType}, using any available workout`);
      candidates = await this.getWorkouts();
    }

    // Should never happen unless database is completely empty
    if (candidates.length === 0) {
      throw new Error('No workouts available in database or fallback workouts');
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
  static async getWeeklyPlan(
    numSessions: number,
    sessionDurations: number[],
    targetTypes: string[]
  ): Promise<ZwiftWorkout[]> {
    const recommendations: ZwiftWorkout[] = [];

    for (let i = 0; i < numSessions; i++) {
      const duration = sessionDurations[i] || 60;
      const type = targetTypes[i] || 'Endurance';
      const targetTSS = (duration / 60) * 70; // Rough estimate

      const workout = await this.findBestMatch(type, duration, targetTSS);
      recommendations.push(workout);
    }

    return recommendations;
  }
}

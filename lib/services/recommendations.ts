import { TrainingMetrics, ZwiftWorkout } from '../types';
import { TrainingAnalysisService } from './analysis';
import { ZwiftWorkoutService } from './zwift-workouts';

export interface WorkoutRecommendation {
  workout: ZwiftWorkout;
  reason: string;
  sessionNumber: number;
}

export class RecommendationEngine {
  private metrics: TrainingMetrics;
  private numSessions: number;
  private sessionDurations: number[];

  constructor(
    metrics: TrainingMetrics,
    numSessions: number,
    sessionDurations: number[]
  ) {
    this.metrics = metrics;
    this.numSessions = numSessions;
    this.sessionDurations = sessionDurations;
  }

  /**
   * Generate workout recommendations for the week
   */
  generateRecommendations(): WorkoutRecommendation[] {
    const recommendations: WorkoutRecommendation[] = [];

    // Determine overall training needs
    const needs = TrainingAnalysisService.determineTrainingNeeds(this.metrics);

    // Create workout type distribution for the week
    const workoutTypes = this.distributeWorkoutTypes(needs);

    // Match each session with appropriate workout
    for (let i = 0; i < this.numSessions; i++) {
      const duration = this.sessionDurations[i];
      const targetType = workoutTypes[i];
      const targetTSS = TrainingAnalysisService.calculateOptimalTSS(
        this.metrics,
        duration
      );

      const workout = ZwiftWorkoutService.findBestMatch(
        targetType,
        duration,
        targetTSS
      );

      if (workout) {
        const reason = this.generateReason(
          targetType,
          i + 1,
          this.numSessions,
          needs
        );

        recommendations.push({
          workout,
          reason,
          sessionNumber: i + 1,
        });
      }
    }

    return recommendations;
  }

  /**
   * Distribute workout types across the week based on training needs
   * Follows evidence-based training principles:
   * - Polarized training (80% easy, 20% hard)
   * - Progressive loading
   * - Recovery considerations
   */
  private distributeWorkoutTypes(needs: {
    primaryFocus: string;
    secondaryFocus: string;
    reasoning: string;
  }): string[] {
    const types: string[] = [];

    if (this.numSessions === 1) {
      // Single session: focus on primary need
      types.push(needs.primaryFocus);
    } else if (this.numSessions === 2) {
      // Two sessions: one hard, one easy
      types.push(needs.primaryFocus);
      types.push('Endurance');
    } else if (this.numSessions === 3) {
      // Three sessions: classic hard-easy-hard pattern
      types.push(needs.primaryFocus);
      types.push('Endurance');
      types.push(needs.secondaryFocus);
    } else if (this.numSessions === 4) {
      // Four sessions: two hard, two easy (polarized)
      types.push(needs.primaryFocus);
      types.push('Endurance');
      types.push(needs.secondaryFocus);
      types.push('Recovery');
    } else if (this.numSessions === 5) {
      // Five sessions: follow 80/20 principle
      types.push(needs.primaryFocus); // Hard
      types.push('Endurance'); // Easy
      types.push('Tempo'); // Moderate
      types.push('Endurance'); // Easy
      types.push(needs.secondaryFocus); // Hard
    } else {
      // Six or more sessions: structured week
      types.push(needs.primaryFocus); // Hard
      types.push('Endurance'); // Easy
      types.push('Tempo'); // Moderate
      types.push('Endurance'); // Easy
      types.push(needs.secondaryFocus); // Hard
      types.push('Recovery'); // Recovery

      // Fill remaining with endurance
      while (types.length < this.numSessions) {
        types.push('Endurance');
      }
    }

    // Adjust based on training load
    if (this.metrics.trainingLoad > 1.5) {
      // High fatigue: replace hard sessions with recovery/endurance
      for (let i = 0; i < types.length; i++) {
        if (types[i] === 'Threshold' || types[i] === 'VO2Max') {
          types[i] = i % 2 === 0 ? 'Tempo' : 'Recovery';
        }
      }
    }

    return types;
  }

  /**
   * Generate explanation for why this workout was recommended
   */
  private generateReason(
    workoutType: string,
    sessionNumber: number,
    totalSessions: number,
    needs: { primaryFocus: string; secondaryFocus: string; reasoning: string }
  ): string {
    const reasons: Record<string, string> = {
      Recovery:
        'Active recovery session to promote adaptation and prevent overtraining.',
      Endurance:
        'Aerobic base building. Critical for long-term fitness and recovery between hard sessions.',
      Tempo:
        'Sweet spot training for maximum fitness gains in minimum time. Highly effective for time-crunched athletes.',
      Threshold:
        'FTP development. Improves sustainable power and race performance.',
      VO2Max:
        'High-intensity intervals to improve maximum aerobic capacity and top-end fitness.',
      Mixed:
        'Comprehensive workout combining multiple intensity zones for complete fitness.',
    };

    let reason = reasons[workoutType] || 'Balanced training session.';

    // Add context based on session position
    if (sessionNumber === 1) {
      reason += ' Starting the week strong with a key workout.';
    } else if (sessionNumber === totalSessions) {
      reason += ' Perfect way to finish the week.';
    } else if (sessionNumber === Math.ceil(totalSessions / 2)) {
      reason += ' Mid-week session to maintain training stimulus.';
    }

    // Add training load context
    if (this.metrics.trainingLoad > 1.3) {
      reason += ' Intensity moderated due to accumulated fatigue.';
    } else if (this.metrics.trainingLoad < 0.9) {
      reason += ' Time to push hard and build fitness.';
    }

    return reason;
  }

  /**
   * Validate recommendations meet training principles
   */
  private validateRecommendations(
    recommendations: WorkoutRecommendation[]
  ): boolean {
    const totalTSS = recommendations.reduce((sum, r) => sum + r.workout.tss, 0);

    // Check total weekly TSS is reasonable
    const minTSS = this.numSessions * 20; // Very light week
    const maxTSS = this.numSessions * 120; // Very hard week

    if (totalTSS < minTSS || totalTSS > maxTSS) {
      return false;
    }

    // Check for proper recovery (no back-to-back very hard sessions)
    for (let i = 0; i < recommendations.length - 1; i++) {
      const current = recommendations[i].workout;
      const next = recommendations[i + 1].workout;

      if (
        current.tss > 90 &&
        next.tss > 90 &&
        (current.type === 'VO2Max' || current.type === 'Threshold') &&
        (next.type === 'VO2Max' || next.type === 'Threshold')
      ) {
        return false; // Too much intensity back-to-back
      }
    }

    return true;
  }
}

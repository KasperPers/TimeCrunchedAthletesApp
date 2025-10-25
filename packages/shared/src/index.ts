// Services
export { TrainingAnalysisService } from './services/analysis';
export {
  FTPService,
  type FTPEstimate,
  type TrainingLoadMetrics,
  type ComplianceMetrics,
  type ReadinessStatus,
  type ProjectionMetrics,
  type TrendMetrics
} from './services/ftp';
export { RecommendationEngine } from './services/recommendations';
export { StravaService, calculateTSS, determineWorkoutType } from './services/strava';
export { ZwiftWorkoutService } from './services/zwift-workouts';

// Types
export * from './types';

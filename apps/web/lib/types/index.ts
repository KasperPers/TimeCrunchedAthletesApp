export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  start_date: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  average_speed?: number;
  max_speed?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_watts?: number;
  max_watts?: number;
  kilojoules?: number;
  average_cadence?: number;
  suffer_score?: number;
}

export interface TrainingMetrics {
  weeklyTSS: number;
  acuteTSS: number; // 7-day average
  chronicTSS: number; // 42-day average
  trainingLoad: number; // Acute / Chronic ratio
  intensityDistribution: {
    recovery: number; // < 55% FTP
    endurance: number; // 55-75% FTP
    tempo: number; // 76-90% FTP
    threshold: number; // 91-105% FTP
    vo2max: number; // 106-120% FTP
    anaerobic: number; // > 120% FTP
  };
  totalTime: number; // Total training time in hours
  totalDistance: number; // Total distance in km
  recentWorkoutTypes: string[];
}

export interface WorkoutRecommendationInput {
  metrics: TrainingMetrics;
  sessionDuration: number; // in minutes
  userFTP: number;
  weeklyPlan: {
    numSessions: number;
    sessionNumber: number; // Which session is this?
  };
}

export interface WorkoutInterval {
  type: 'warmup' | 'cooldown' | 'interval' | 'rest' | 'steady';
  duration: number; // in seconds
  powerLow: number; // % of FTP
  powerHigh: number; // % of FTP
  cadence?: number;
  label?: string;
}

export interface ZwiftWorkout {
  name: string;
  url: string;
  duration: number; // in minutes
  type: string; // FTP, Endurance, VO2Max, etc.
  tss: number;
  description: string;
  intervals?: WorkoutInterval[]; // Detailed interval structure
  buildInstructions?: string; // How to build in Zwift
}

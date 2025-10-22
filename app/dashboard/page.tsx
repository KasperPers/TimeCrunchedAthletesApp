'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TrainingMetrics } from '@/lib/types';
import { RecentActivities } from '@/components/RecentActivities';

interface WorkoutRecommendation {
  sessionNumber: number;
  workout: {
    name: string;
    url: string;
    duration: number;
    type: string;
    tss: number;
    description: string;
  };
  reason: string;
}

interface Activity {
  id: string;
  stravaId: string;
  name: string;
  type: string;
  startDate: string;
  distance: number;
  movingTime: number;
  totalElevationGain: number;
  averageWatts?: number;
  averageHeartrate?: number;
  tss?: number;
  workoutType?: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [numSessions, setNumSessions] = useState(3);
  const [sessionDurations, setSessionDurations] = useState<number[]>([60, 60, 60]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [metrics, setMetrics] = useState<TrainingMetrics | null>(null);
  const [recommendations, setRecommendations] = useState<WorkoutRecommendation[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    // Update session durations array when number of sessions changes
    setSessionDurations(Array(numSessions).fill(60));
  }, [numSessions]);

  // Auto-sync on first load
  useEffect(() => {
    if (status === 'authenticated' && initialLoad) {
      setInitialLoad(false);
      syncActivities();
    }
  }, [status, initialLoad]);

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activities');
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities);
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
    }
  };

  const syncActivities = async () => {
    setSyncing(true);
    setError(null);

    try {
      const response = await fetch('/api/sync-activities', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to sync activities');
      }

      const data = await response.json();
      setMetrics(data.metrics);

      // Fetch updated activities list
      await fetchActivities();
    } catch (err) {
      setError('Failed to sync activities. Please try again.');
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  const generateRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          numSessions,
          sessionDurations,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations);
      setMetrics(data.metrics);
    } catch (err) {
      setError('Failed to generate recommendations. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Time Crunched Athletes
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {session?.user?.name}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sync Activities Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold mb-2">Strava Activities</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {syncing
                  ? 'Syncing your activities...'
                  : 'Your activities sync automatically. Click to refresh.'}
              </p>
            </div>
            <button
              onClick={syncActivities}
              disabled={syncing}
              className="bg-strava hover:bg-orange-600 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {syncing && (
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {syncing ? 'Syncing...' : 'Refresh Activities'}
            </button>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="mb-6">
          <RecentActivities activities={activities} />
        </div>

        {/* Training Metrics */}
        {metrics && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Training Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Weekly TSS
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {Math.round(metrics.weeklyTSS)}
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Training Load
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {metrics.trainingLoad.toFixed(2)}
                </div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Weekly Hours
                </div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {metrics.totalTime.toFixed(1)}h
                </div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Weekly Distance
                </div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {metrics.totalDistance.toFixed(0)}km
                </div>
              </div>
            </div>

            {/* Intensity Distribution */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">
                Intensity Distribution
              </h3>
              <div className="space-y-2">
                {Object.entries(metrics.intensityDistribution).map(
                  ([zone, value]) => (
                    <div key={zone}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">{zone}</span>
                        <span>{(value * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${value * 100}%` }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* Session Planning */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Plan Your Week</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Number of sessions this week
              </label>
              <select
                value={numSessions}
                onChange={(e) => setNumSessions(Number(e.target.value))}
                className="w-full md:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-orange-500"
              >
                {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'session' : 'sessions'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Session durations (minutes)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {sessionDurations.map((duration, index) => (
                  <div key={index}>
                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                      Session {index + 1}
                    </label>
                    <input
                      type="number"
                      min="15"
                      max="180"
                      step="15"
                      value={duration}
                      onChange={(e) => {
                        const newDurations = [...sessionDurations];
                        newDurations[index] = Number(e.target.value);
                        setSessionDurations(newDurations);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={generateRecommendations}
              disabled={loading}
              className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium py-3 px-8 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating...' : 'Get Workout Recommendations'}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Your Personalized Workouts</h2>
            {recommendations.map((rec) => (
              <div
                key={rec.sessionNumber}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Session {rec.sessionNumber}
                    </div>
                    <h3 className="text-xl font-bold">{rec.workout.name}</h3>
                  </div>
                  <div className="text-right">
                    <div className="inline-block bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 px-3 py-1 rounded-full text-sm font-medium">
                      {rec.workout.type}
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {rec.workout.description}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Duration:
                    </span>
                    <span className="ml-2 font-medium">
                      {rec.workout.duration} min
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      TSS:
                    </span>
                    <span className="ml-2 font-medium">{rec.workout.tss}</span>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <a
                      href={rec.workout.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View on Zwift →
                    </a>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Why this workout?
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {rec.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

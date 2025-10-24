'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TrainingMetrics, WorkoutInterval } from '@/lib/types';
import { RecentActivities } from '@/components/RecentActivities';
import { WeeklyCalendar } from '@/components/WeeklyCalendar';
import { WeeklyTSSChart } from '@/components/WeeklyTSSChart';
import { ProgressTracking } from '@/components/ProgressTracking';
import { PersonalRecords } from '@/components/PersonalRecords';
import { CalendarView } from '@/components/CalendarView';
import { WorkoutVisualization } from '@/components/WorkoutVisualization';
import { SettingsMenu } from '@/components/SettingsMenu';


interface WorkoutRecommendation {
  sessionNumber: number;
  workout: {
    name: string;
    url: string;
    duration: number;
    type: string;
    tss: number;
    description: string;
    intervals?: WorkoutInterval[];
    buildInstructions?: string;
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

interface WeeklyPlan {
  id?: string;
  weekStartDate: string;
  numSessions: number;
  sessionDurations: number[];
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [metrics, setMetrics] = useState<TrainingMetrics | null>(null);
  const [recommendations, setRecommendations] = useState<WorkoutRecommendation[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyPlan[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Layout customization state
  const defaultLayoutOrder = [
    'training-plan',
    'recent-activities',
    'training-metrics',
    'progress-tracking',
    'personal-records',
    'calendar-view',
    'recommendations',
  ];

  const [layoutOrder, setLayoutOrder] = useState<string[]>(defaultLayoutOrder);

  // Load layout order from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('dashboardLayoutOrder');
    if (saved) {
      try {
        const parsedOrder = JSON.parse(saved);
        setLayoutOrder(parsedOrder);
      } catch {
        // Invalid JSON, keep default
      }
    }
  }, []);

  // Save layout order to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('dashboardLayoutOrder', JSON.stringify(layoutOrder));
  }, [layoutOrder]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  // Auto-sync and load weekly plans on first load
  useEffect(() => {
    if (status === 'authenticated' && initialLoad) {
      setInitialLoad(false);
      syncActivities();
      loadWeeklyPlans();
      loadSavedRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, initialLoad]);

  const loadWeeklyPlans = async () => {
    try {
      const response = await fetch('/api/weekly-plans');
      if (response.ok) {
        const data = await response.json();
        setWeeklyPlans(data.plans);
      }
    } catch (err) {
      console.error('Error loading weekly plans:', err);
    }
  };

  const loadSavedRecommendations = async () => {
    try {
      const response = await fetch('/api/recommendations');
      if (response.ok) {
        const data = await response.json();
        if (data.recommendations && data.recommendations.length > 0) {
          console.log('Dashboard: Loaded saved recommendations:', data.recommendations);
          setRecommendations(data.recommendations);
        }
      }
    } catch (err) {
      console.error('Error loading recommendations:', err);
    }
  };

  const saveWeeklyPlan = async (
    weekStartDate: string,
    numSessions: number,
    sessionDurations: number[]
  ) => {
    try {
      const response = await fetch('/api/weekly-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weekStartDate,
          numSessions,
          sessionDurations,
        }),
      });

      if (response.ok) {
        await loadWeeklyPlans(); // Reload to get updated data
      }
    } catch (err) {
      console.error('Error saving weekly plan:', err);
      setError('Failed to save weekly plan');
    }
  };

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
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to sync activities');
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

  const handleSavePlan = async (sessions: any[]) => {
    try {
      // Save all 7 days - use 0 for rest days to preserve day-of-week info
      const sessionDurations = sessions.map((s: any) => s.duration || 0);
      const numSessions = sessions.filter((s: any) => s.hasWorkout && s.duration).length;

      if (numSessions === 0) {
        return; // Nothing to save
      }

      // Get Monday of current week
      const today = new Date();
      const currentDay = today.getDay();
      const monday = new Date(today);
      const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay;
      monday.setDate(today.getDate() + daysToMonday);
      monday.setHours(0, 0, 0, 0);

      await saveWeeklyPlan(monday.toISOString(), numSessions, sessionDurations);

      // Clear recommendations when plan changes (user needs to regenerate)
      setRecommendations([]);
    } catch (err) {
      console.error('Error saving plan:', err);
      setError('Failed to save weekly plan');
    }
  };

  const handleGenerateWorkouts = async (sessions: any[]) => {
    const sessionsWithWorkouts = sessions.filter((s: any) => s.hasWorkout && s.duration);

    if (sessionsWithWorkouts.length === 0) {
      setError('Please add at least one workout session to your week');
      return;
    }

    const numSessions = sessionsWithWorkouts.length;
    const sessionDurations = sessionsWithWorkouts.map((s: any) => s.duration);

    await generateRecommendations(numSessions, sessionDurations);
  };

  const generateRecommendations = async (
    numSessions: number,
    sessionDurations: number[]
  ) => {
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

      // Scroll to recommendations
      setTimeout(() => {
        const recommendationsElement = document.getElementById('recommendations');
        if (recommendationsElement) {
          recommendationsElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err) {
      setError('Failed to generate recommendations. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Get current week's saved plan
  const getCurrentWeekPlan = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    monday.setDate(today.getDate() + daysToMonday);
    monday.setHours(0, 0, 0, 0);

    const currentWeekPlan = weeklyPlans.find(plan => {
      const planDate = new Date(plan.weekStartDate);
      return planDate.getTime() === monday.getTime();
    });

    if (currentWeekPlan) {
      return {
        numSessions: currentWeekPlan.numSessions,
        // sessionDurations is already parsed by the API route
        sessionDurations: currentWeekPlan.sessionDurations,
      };
    }

    return null;
  };

  // Handle layout order changes
  const handleLayoutOrderChange = (newOrder: string[]) => {
    setLayoutOrder(newOrder);
  };

  // Get the scheduled date for a specific session number
  const getSessionDate = (sessionNumber: number): Date | null => {
    const plan = getCurrentWeekPlan();
    if (!plan) return null;

    // Calculate Monday of current week
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    monday.setDate(today.getDate() + daysToMonday);
    monday.setHours(0, 0, 0, 0);

    // Find which days have workouts scheduled
    const daysWithWorkouts: number[] = [];
    plan.sessionDurations.forEach((duration: number, index: number) => {
      if (duration > 0) {
        daysWithWorkouts.push(index);
      }
    });

    // Map session number (1-based) to day index
    if (sessionNumber <= daysWithWorkouts.length) {
      const dayIndex = daysWithWorkouts[sessionNumber - 1];
      const sessionDate = new Date(monday);
      sessionDate.setDate(monday.getDate() + dayIndex);
      return sessionDate;
    }

    return null;
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
            <SettingsMenu
              userName={session?.user?.name}
              onSignOut={() => signOut({ callbackUrl: '/' })}
              onRefreshActivities={syncActivities}
              isRefreshing={syncing}
              layoutOrder={layoutOrder}
              onLayoutOrderChange={handleLayoutOrderChange}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Render sections based on layoutOrder */}
        {layoutOrder.map((sectionId) => {
          switch (sectionId) {
            case 'training-plan':
              return (
                <div key={sectionId} className="mb-6">
                  <WeeklyCalendar
                    onSavePlan={handleSavePlan}
                    onGenerateRecommendations={handleGenerateWorkouts}
                    recommendations={recommendations}
                    loading={loading}
                    savedPlan={getCurrentWeekPlan()}
                  />
                </div>
              );

            case 'recent-activities':
              return (
                <div key={sectionId} className="mb-6">
                  <RecentActivities activities={activities} />
                </div>
              );

            case 'training-metrics':
              return metrics ? (
                <div key={sectionId} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
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
              ) : null;

            case 'progress-tracking':
              return activities.length > 0 ? (
                <div key={sectionId} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <ProgressTracking activities={activities} />
                  <WeeklyTSSChart activities={activities} />
                </div>
              ) : null;

            case 'personal-records':
              return activities.length > 0 ? (
                <div key={sectionId} className="mb-6">
                  <PersonalRecords activities={activities} />
                </div>
              ) : null;

            case 'calendar-view':
              return activities.length > 0 ? (
                <div key={sectionId} className="mb-6">
                  <CalendarView activities={activities} />
                </div>
              ) : null;

            case 'recommendations':
              return recommendations.length > 0 ? (
                <div key={sectionId} id="recommendations" className="space-y-4 mb-6">
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
                            {(() => {
                              const sessionDate = getSessionDate(rec.sessionNumber);
                              if (sessionDate) {
                                return (
                                  <span className="ml-2">
                                    • {sessionDate.toLocaleDateString('en-US', {
                                      weekday: 'long',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </span>
                                );
                              }
                              return null;
                            })()}
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
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Find in Zwift app → Training → {rec.workout.type}
                          </div>
                        </div>
                      </div>

                      {rec.workout.intervals && rec.workout.intervals.length > 0 && (
                        <div className="mb-4">
                          <WorkoutVisualization
                            intervals={rec.workout.intervals}
                            workoutName={rec.workout.name}
                            workoutType={rec.workout.type}
                            duration={rec.workout.duration}
                            tss={rec.workout.tss}
                          />
                        </div>
                      )}

                      {rec.workout.buildInstructions && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4">
                          <div className="text-xs text-blue-600 dark:text-blue-400 uppercase mb-1 font-semibold">
                            📝 How to build this in Zwift
                          </div>
                          <pre className="text-sm text-blue-900 dark:text-blue-200 whitespace-pre-wrap font-mono">
                            {rec.workout.buildInstructions}
                          </pre>
                        </div>
                      )}

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
              ) : null;

            default:
              return null;
          }
        })}
      </main>
    </div>
  );
}

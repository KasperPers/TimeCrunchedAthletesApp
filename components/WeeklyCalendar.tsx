'use client';

import { useState, useEffect } from 'react';
import { DayCard } from './DayCard';
import { SessionModal } from './SessionModal';
import { WorkoutDetailModal } from './WorkoutDetailModal';
import { WorkoutVisualization } from './WorkoutVisualization';
import { WorkoutInterval } from '@/lib/types';

interface DaySession {
  dayOfWeek: number; // 0-6 (Sun-Sat)
  date: Date;
  duration?: number;
  hasWorkout: boolean;
  workout?: {
    name: string;
    type: string;
    tss: number;
    intervals?: WorkoutInterval[];
    buildInstructions?: string;
  };
}

interface WeeklyCalendarProps {
  onSavePlan: (sessions: DaySession[]) => void;
  onGenerateRecommendations: (sessions: DaySession[]) => void;
  recommendations?: any[];
  loading?: boolean;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function WeeklyCalendar({ onSavePlan, onGenerateRecommendations, recommendations = [], loading = false }: WeeklyCalendarProps) {
  const [sessions, setSessions] = useState<DaySession[]>([]);
  const [selectedDay, setSelectedDay] = useState<DaySession | null>(null);
  const [workoutDetailDay, setWorkoutDetailDay] = useState<DaySession | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Update sessions with recommendations when they arrive
  useEffect(() => {
    if (recommendations.length > 0 && sessions.length > 0) {
      const sessionsWithWorkouts = sessions.filter((s) => s.hasWorkout);

      const updatedSessions = sessions.map((session) => {
        if (!session.hasWorkout) return session;

        // Find matching recommendation by index
        const sessionIndex = sessionsWithWorkouts.findIndex(
          (s) => s.date.getTime() === session.date.getTime()
        );

        const rec = recommendations[sessionIndex];
        if (rec && rec.workout) {
          return {
            ...session,
            workout: {
              name: rec.workout.name,
              type: rec.workout.type,
              tss: rec.workout.tss,
              intervals: rec.workout.intervals,
              buildInstructions: rec.workout.buildInstructions,
            },
          };
        }

        return session;
      });

      setSessions(updatedSessions);
    }
  }, [recommendations]);

  // Initialize with current week (Mon-Sun)
  useEffect(() => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Calculate Monday of current week
    const monday = new Date(today);
    const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    monday.setDate(today.getDate() + daysToMonday);
    monday.setHours(0, 0, 0, 0);

    // Create 7 days (Mon-Sun)
    const weekDays: DaySession[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);

      weekDays.push({
        dayOfWeek: i + 1, // 1-7 (Mon-Sun)
        date,
        duration: undefined,
        hasWorkout: false,
      });
    }

    setSessions(weekDays);
  }, []);

  const handleDayClick = (day: DaySession) => {
    setSelectedDay(day);
  };

  const handleWorkoutClick = (day: DaySession) => {
    setWorkoutDetailDay(day);
  };

  const handleSaveSession = (duration: number) => {
    if (!selectedDay) return;

    const updatedSessions = sessions.map((s) =>
      s.date.getTime() === selectedDay.date.getTime()
        ? { ...s, duration, hasWorkout: duration > 0 }
        : s
    );

    setSessions(updatedSessions);
    setSelectedDay(null);
    setHasChanges(true);
  };

  const handleRemoveSession = () => {
    if (!selectedDay) return;

    const updatedSessions = sessions.map((s) =>
      s.date.getTime() === selectedDay.date.getTime()
        ? { ...s, duration: undefined, hasWorkout: false, workout: undefined }
        : s
    );

    setSessions(updatedSessions);
    setSelectedDay(null);
    setHasChanges(true);
  };

  const handleSavePlan = () => {
    onSavePlan(sessions);
    setHasChanges(false);
  };

  const handleGenerateWorkouts = () => {
    if (hasChanges) {
      handleSavePlan();
    }
    onGenerateRecommendations(sessions);
  };

  const handleResetWeek = () => {
    const resetSessions = sessions.map((s) => ({
      ...s,
      duration: undefined,
      hasWorkout: false,
      workout: undefined,
    }));
    setSessions(resetSessions);
    setHasChanges(true);
  };

  const totalSessions = sessions.filter((s) => s.hasWorkout).length;
  const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Plan Your Training</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Current week • {totalSessions} sessions • {totalDuration} minutes
          </p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <button
              onClick={handleSavePlan}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Save Plan
            </button>
          )}
          <button
            onClick={handleGenerateWorkouts}
            disabled={loading || totalSessions === 0}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating...' : 'Get Workouts'}
          </button>
          <button
            onClick={handleResetWeek}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* 7-Day Grid */}
      <div className="grid grid-cols-7 gap-3">
        {sessions.map((day, index) => (
          <DayCard
            key={day.date.toISOString()}
            day={DAYS[index]}
            dayShort={DAYS_SHORT[index]}
            date={day.date}
            duration={day.duration}
            hasWorkout={day.hasWorkout}
            workout={day.workout}
            isToday={isToday(day.date)}
            onClick={() => handleDayClick(day)}
            onWorkoutClick={() => handleWorkoutClick(day)}
          />
        ))}
      </div>

      {/* Workout Visualizations */}
      {sessions.some((s) => s.workout) && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Your Workouts This Week</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions
              .filter((s) => s.workout)
              .map((day, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">
                      {DAYS[day.dayOfWeek - 1]} - {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </h4>
                  </div>
                  {day.workout?.intervals && (
                    <WorkoutVisualization
                      intervals={day.workout.intervals}
                      workoutName={day.workout.name}
                      workoutType={day.workout.type}
                      duration={day.duration || 60}
                      tss={day.workout.tss}
                    />
                  )}
                  {day.workout?.buildInstructions && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-sm">
                      <div className="text-xs text-blue-600 dark:text-blue-400 uppercase mb-1 font-semibold">
                        📝 Build in Zwift
                      </div>
                      <pre className="text-blue-900 dark:text-blue-200 whitespace-pre-wrap font-mono text-xs">
                        {day.workout.buildInstructions}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Session Edit Modal */}
      {selectedDay && (
        <SessionModal
          day={DAYS[selectedDay.dayOfWeek - 1]}
          date={selectedDay.date}
          initialDuration={selectedDay.duration}
          onSave={handleSaveSession}
          onRemove={handleRemoveSession}
          onClose={() => setSelectedDay(null)}
        />
      )}

      {/* Workout Detail Modal */}
      {workoutDetailDay && workoutDetailDay.workout && (
        <WorkoutDetailModal
          workout={{
            name: workoutDetailDay.workout.name,
            type: workoutDetailDay.workout.type,
            duration: workoutDetailDay.duration || 60,
            tss: workoutDetailDay.workout.tss,
            description: `${workoutDetailDay.duration || 60} minute ${workoutDetailDay.workout.type} workout`,
            intervals: workoutDetailDay.workout.intervals,
            buildInstructions: workoutDetailDay.workout.buildInstructions,
          }}
          dayName={DAYS[workoutDetailDay.dayOfWeek - 1]}
          date={workoutDetailDay.date}
          onClose={() => setWorkoutDetailDay(null)}
        />
      )}
    </div>
  );
}

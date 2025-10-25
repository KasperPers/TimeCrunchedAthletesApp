'use client';

import { useState, useEffect } from 'react';
import { DayCard } from './DayCard';
import { SessionModal } from './SessionModal';
import { WorkoutDetailsModal } from './WorkoutDetailsModal';
import { WorkoutInterval } from '@timecrunchedathletes/shared';

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
  reason?: string;
}

interface WeeklyCalendarProps {
  onSavePlan: (sessions: DaySession[]) => void;
  onGenerateRecommendations: (sessions: DaySession[]) => void;
  recommendations?: any[];
  loading?: boolean;
  savedPlan?: {
    numSessions: number;
    sessionDurations: number[];
  } | null;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function WeeklyCalendar({ onSavePlan, onGenerateRecommendations, recommendations = [], loading = false, savedPlan = null }: WeeklyCalendarProps) {
  const [sessions, setSessions] = useState<DaySession[]>([]);
  const [selectedDay, setSelectedDay] = useState<DaySession | null>(null);
  const [viewingWorkout, setViewingWorkout] = useState<DaySession | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Update sessions with recommendations when they arrive
  useEffect(() => {
    if (recommendations.length > 0) {
      console.log('WeeklyCalendar: Received recommendations:', recommendations);
      setSessions(prevSessions => {
        return prevSessions.map((session) => {
          if (!session.hasWorkout) return session;

          // Find matching recommendation by sessionNumber (day of week)
          // session.dayOfWeek is 1-7 for Mon-Sun
          const rec = recommendations.find((r: any) => r.sessionNumber === session.dayOfWeek);

          if (rec && rec.workout) {
            console.log(`WeeklyCalendar: Mapping workout for day ${session.dayOfWeek}:`, {
              name: rec.workout.name,
              hasIntervals: !!rec.workout.intervals,
              intervalsCount: rec.workout.intervals?.length
            });
            return {
              ...session,
              workout: {
                name: rec.workout.name,
                type: rec.workout.type,
                tss: rec.workout.tss,
                intervals: rec.workout.intervals,
                buildInstructions: rec.workout.buildInstructions,
              },
              reason: rec.reason,
            };
          }

          return session;
        });
      });
    }
  }, [recommendations]);

  // Initialize with current week (Mon-Sun) and load saved plan
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

      // Check if this day has a saved workout
      let duration: number | undefined = undefined;
      let hasWorkout = false;

      if (savedPlan && savedPlan.sessionDurations && i < savedPlan.sessionDurations.length) {
        duration = savedPlan.sessionDurations[i];
        hasWorkout = duration > 0;
      }

      weekDays.push({
        dayOfWeek: i + 1, // 1-7 (Mon-Sun)
        date,
        duration,
        hasWorkout,
      });
    }

    setSessions(weekDays);
  }, [savedPlan]);

  const handleDayClick = (day: DaySession) => {
    // If day has a workout, show workout details; otherwise show session editor
    if (day.hasWorkout && day.workout) {
      setViewingWorkout(day);
    } else {
      setSelectedDay(day);
    }
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
          />
        ))}
      </div>

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

      {/* Workout Details Modal */}
      {viewingWorkout && viewingWorkout.workout && (
        <WorkoutDetailsModal
          workout={viewingWorkout.workout}
          duration={viewingWorkout.duration || 0}
          date={viewingWorkout.date}
          dayName={DAYS[viewingWorkout.dayOfWeek - 1]}
          reason={viewingWorkout.reason}
          onClose={() => setViewingWorkout(null)}
        />
      )}
    </div>
  );
}

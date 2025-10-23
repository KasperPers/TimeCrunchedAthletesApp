'use client';

import { useState, useEffect } from 'react';
import { formatWeekRange, getWeekLabel, isCurrentWeek } from '@/lib/utils/weeks';

interface WeeklyPlanCardProps {
  weekStartDate: string;
  initialNumSessions?: number;
  initialSessionDurations?: number[];
  onSave: (numSessions: number, sessionDurations: number[]) => void;
  onGenerateRecommendations?: (numSessions: number, sessionDurations: number[]) => void;
}

export function WeeklyPlanCard({
  weekStartDate,
  initialNumSessions = 0,
  initialSessionDurations = [],
  onSave,
  onGenerateRecommendations,
}: WeeklyPlanCardProps) {
  const [numSessions, setNumSessions] = useState(initialNumSessions || 3);
  const [sessionDurations, setSessionDurations] = useState<number[]>(
    initialSessionDurations.length > 0 ? initialSessionDurations : [60, 60, 60]
  );
  const [hasChanges, setHasChanges] = useState(false);

  const weekStart = new Date(weekStartDate);
  const isCurrent = isCurrentWeek(weekStart);
  const isEmpty = initialNumSessions === 0;

  // Update state when props change (after save/reload from database)
  useEffect(() => {
    if (initialNumSessions > 0) {
      setNumSessions(initialNumSessions);
    }
    if (initialSessionDurations.length > 0) {
      setSessionDurations(initialSessionDurations);
    }
    setHasChanges(false);
  }, [initialNumSessions, initialSessionDurations]);

  useEffect(() => {
    // Update session durations array when number of sessions changes
    if (sessionDurations.length !== numSessions) {
      const newDurations = Array(numSessions).fill(60);
      // Preserve existing values
      for (let i = 0; i < Math.min(sessionDurations.length, numSessions); i++) {
        newDurations[i] = sessionDurations[i];
      }
      setSessionDurations(newDurations);
      setHasChanges(true);
    }
  }, [numSessions, sessionDurations]);

  const handleDurationChange = (index: number, value: number) => {
    const newDurations = [...sessionDurations];
    newDurations[index] = value;
    setSessionDurations(newDurations);
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(numSessions, sessionDurations);
    setHasChanges(false);
  };

  const handleGenerateRecommendations = () => {
    if (hasChanges) {
      handleSave();
    }
    if (onGenerateRecommendations) {
      onGenerateRecommendations(numSessions, sessionDurations);
    }
  };

  return (
    <div
      className={`border-2 rounded-lg p-6 ${
        isCurrent
          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10'
          : isEmpty
          ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
          : 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/10'
      }`}
    >
      <div className="mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">
              {getWeekLabel(weekStart)}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatWeekRange(weekStart)}
            </p>
          </div>
          {isCurrent && (
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
              Current
            </span>
          )}
          {!isEmpty && !isCurrent && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              Planned
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Number of sessions
          </label>
          <select
            value={numSessions}
            onChange={(e) => {
              setNumSessions(Number(e.target.value));
              setHasChanges(true);
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-orange-500"
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
          <div className="grid grid-cols-2 gap-2">
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
                  onChange={(e) =>
                    handleDurationChange(index, Number(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-orange-500"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          {hasChanges && (
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Save Plan
            </button>
          )}
          {isCurrent && onGenerateRecommendations && (
            <button
              onClick={handleGenerateRecommendations}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Get Workouts
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

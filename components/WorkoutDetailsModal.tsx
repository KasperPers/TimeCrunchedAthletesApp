'use client';

import { WorkoutInterval } from '@/lib/types';
import { WorkoutVisualization } from './WorkoutVisualization';

interface WorkoutDetailsModalProps {
  workout: {
    name: string;
    type: string;
    tss: number;
    intervals?: WorkoutInterval[];
    buildInstructions?: string;
  };
  duration: number;
  date: Date;
  dayName: string;
  reason?: string;
  onClose: () => void;
}

export function WorkoutDetailsModal({
  workout,
  duration,
  date,
  dayName,
  reason,
  onClose,
}: WorkoutDetailsModalProps) {
  const getIntensityColor = (type: string) => {
    const colors: Record<string, string> = {
      Recovery: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
      Endurance: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
      Tempo: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
      Threshold: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200',
      VO2Max: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
      Mixed: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
    };
    return colors[type] || 'bg-gray-100 dark:bg-gray-700';
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700 z-10">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {dayName} • {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <h3 className="text-2xl font-bold mb-2">{workout.name}</h3>
                <div className="flex gap-2 items-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getIntensityColor(workout.type)}`}>
                    {workout.type}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {duration} min • TSS {workout.tss}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Workout Visualization */}
            {workout.intervals && workout.intervals.length > 0 && (
              <div>
                <WorkoutVisualization
                  intervals={workout.intervals}
                  workoutName={workout.name}
                  workoutType={workout.type}
                  duration={duration}
                  tss={workout.tss}
                />
              </div>
            )}

            {/* Build Instructions */}
            {workout.buildInstructions && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="text-sm text-blue-600 dark:text-blue-400 uppercase mb-2 font-semibold flex items-center gap-2">
                  <span>📝</span>
                  <span>How to build this in Zwift</span>
                </div>
                <pre className="text-sm text-blue-900 dark:text-blue-200 whitespace-pre-wrap font-mono">
                  {workout.buildInstructions}
                </pre>
              </div>
            )}

            {/* Workout Reason */}
            {reason && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-2 font-semibold">
                  Why this workout?
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{reason}</p>
              </div>
            )}

            {/* Quick Tips */}
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <div className="text-xs text-orange-600 dark:text-orange-400 uppercase mb-2 font-semibold">
                💡 Quick Tip
              </div>
              <p className="text-sm text-orange-900 dark:text-orange-200">
                Find this workout in Zwift app → Training → {workout.type}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-800 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

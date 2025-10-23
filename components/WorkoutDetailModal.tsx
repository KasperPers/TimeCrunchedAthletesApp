'use client';

import { useEffect } from 'react';
import { WorkoutInterval } from '@/lib/types';
import { WorkoutVisualization } from './WorkoutVisualization';

interface WorkoutDetailModalProps {
  workout: {
    name: string;
    type: string;
    duration: number;
    tss: number;
    description?: string;
    intervals?: WorkoutInterval[];
    buildInstructions?: string;
  };
  dayName: string;
  date: Date;
  onClose: () => void;
}

/**
 * Full-screen modal showing detailed Zwift-style workout visualization
 * Displays power profile, interval breakdown, and build instructions
 */
export function WorkoutDetailModal({
  workout,
  dayName,
  date,
  onClose,
}: WorkoutDetailModalProps) {
  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    // Close modal on Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full my-8 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-medium opacity-90">{dayName}</span>
                <span className="text-sm opacity-75">•</span>
                <span className="text-sm opacity-90">{formatDate(date)}</span>
              </div>
              <h2 className="text-3xl font-bold mb-2">{workout.name}</h2>
              <div className="flex items-center gap-4 text-sm">
                <span className="bg-white/20 px-3 py-1 rounded-full font-medium">
                  {workout.type}
                </span>
                <span>{workout.duration} minutes</span>
                <span>TSS {workout.tss}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 transition-colors rounded-full p-2"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Description */}
          {workout.description && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-2">
                Description
              </h3>
              <p className="text-gray-900 dark:text-gray-100">{workout.description}</p>
            </div>
          )}

          {/* Workout Visualization */}
          {workout.intervals && workout.intervals.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-3">
                Power Profile
              </h3>
              <WorkoutVisualization
                intervals={workout.intervals}
                workoutName={workout.name}
                workoutType={workout.type}
                duration={workout.duration}
                tss={workout.tss}
              />
            </div>
          )}

          {/* Build Instructions */}
          {workout.buildInstructions && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase">
                  How to Build in Zwift
                </h3>
              </div>
              <pre className="text-sm text-blue-900 dark:text-blue-200 whitespace-pre-wrap font-mono leading-relaxed">
                {workout.buildInstructions}
              </pre>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-3 pt-4">
            <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export to Zwift
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

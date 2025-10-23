'use client';

import { useState, useEffect } from 'react';

interface SessionModalProps {
  day: string;
  date: Date;
  initialDuration?: number;
  onSave: (duration: number) => void;
  onRemove: () => void;
  onClose: () => void;
}

const QUICK_DURATIONS = [30, 45, 60, 75, 90, 120];

export function SessionModal({
  day,
  date,
  initialDuration,
  onSave,
  onRemove,
  onClose,
}: SessionModalProps) {
  const [duration, setDuration] = useState(initialDuration || 60);

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSave = () => {
    if (duration > 0) {
      onSave(duration);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold">{day}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {date.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
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
          {/* Duration Input */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Session Duration
            </label>
            <div className="relative">
              <input
                type="number"
                min="15"
                max="300"
                step="15"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-4 py-3 text-2xl font-bold text-center border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg text-gray-500 dark:text-gray-400 font-medium">
                minutes
              </span>
            </div>
          </div>

          {/* Quick Duration Buttons */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Quick Select
            </label>
            <div className="grid grid-cols-3 gap-2">
              {QUICK_DURATIONS.map((mins) => (
                <button
                  key={mins}
                  onClick={() => setDuration(mins)}
                  className={`py-2 px-3 rounded-lg font-medium transition-all ${
                    duration === mins
                      ? 'bg-orange-500 text-white shadow-lg scale-105'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-blue-900 dark:text-blue-200">
                After saving your weekly plan, click "Get Workouts" to receive personalized training recommendations.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          {initialDuration && (
            <button
              onClick={onRemove}
              className="flex-1 px-4 py-3 border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Remove Session
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors shadow-lg"
          >
            Save Session
          </button>
        </div>
      </div>
    </div>
  );
}

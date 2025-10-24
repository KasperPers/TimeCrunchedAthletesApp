'use client';

import { useState } from 'react';

interface SettingsMenuProps {
  userName?: string | null;
  onSignOut: () => void;
  onRefreshActivities: () => void;
  isRefreshing: boolean;
  layoutOrder: string[];
  onLayoutOrderChange: (order: string[]) => void;
}

export function SettingsMenu({
  userName,
  onSignOut,
  onRefreshActivities,
  isRefreshing,
  layoutOrder,
  onLayoutOrderChange,
}: SettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLayoutSettings, setShowLayoutSettings] = useState(false);

  const availableSections = [
    { id: 'training-plan', label: 'Plan Your Training' },
    { id: 'recent-activities', label: 'Recent Activities' },
    { id: 'training-metrics', label: 'Training Metrics' },
    { id: 'progress-tracking', label: 'Progress Tracking' },
    { id: 'personal-records', label: 'Personal Records' },
    { id: 'calendar-view', label: 'Calendar View' },
    { id: 'recommendations', label: 'Workout Recommendations' },
  ];

  const moveUp = (index: number) => {
    if (index > 0) {
      const newOrder = [...layoutOrder];
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      onLayoutOrderChange(newOrder);
    }
  };

  const moveDown = (index: number) => {
    if (index < layoutOrder.length - 1) {
      const newOrder = [...layoutOrder];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      onLayoutOrderChange(newOrder);
    }
  };

  const resetLayout = () => {
    const defaultOrder = availableSections.map(s => s.id);
    onLayoutOrderChange(defaultOrder);
  };

  const getSectionLabel = (id: string) => {
    return availableSections.find(s => s.id === id)?.label || id;
  };

  return (
    <div className="relative">
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <span>{userName}</span>
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
            <div className="p-2">
              {/* Refresh Activities */}
              <button
                onClick={() => {
                  onRefreshActivities();
                  setIsOpen(false);
                }}
                disabled={isRefreshing}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors flex items-center gap-3 disabled:opacity-50"
              >
                <svg
                  className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {isRefreshing ? 'Refreshing...' : 'Refresh Activities'}
              </button>

              {/* Customize Layout */}
              <button
                onClick={() => setShowLayoutSettings(!showLayoutSettings)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors flex items-center gap-3"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
                Customize Layout
              </button>

              <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

              {/* Sign Out */}
              <button
                onClick={() => {
                  onSignOut();
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors flex items-center gap-3"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}

      {/* Layout Settings Modal */}
      {showLayoutSettings && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowLayoutSettings(false)}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">Customize Layout</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Reorder sections to match your workflow
                    </p>
                  </div>
                  <button
                    onClick={() => setShowLayoutSettings(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {layoutOrder.map((sectionId, index) => (
                    <div
                      key={sectionId}
                      className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"
                    >
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                        {index + 1}
                      </span>
                      <span className="flex-1 text-sm font-medium">
                        {getSectionLabel(sectionId)}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => moveUp(index)}
                          disabled={index === 0}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move up"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => moveDown(index)}
                          disabled={index === layoutOrder.length - 1}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move down"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                <button
                  onClick={resetLayout}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Reset to Default
                </button>
                <button
                  onClick={() => setShowLayoutSettings(false)}
                  className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

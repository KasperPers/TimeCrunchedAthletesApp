'use client';

import { FTPEstimate } from '@timecrunchedathletes/shared';

interface FtpEstimationCardProps {
  ftpEstimate: FTPEstimate;
  onUpdateFTP?: (ftp: number) => void;
}

export function FtpEstimationCard({ ftpEstimate, onUpdateFTP }: FtpEstimationCardProps) {
  const { ftp, accuracy, rideCount, source } = ftpEstimate;

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600 dark:text-green-400';
    if (accuracy >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const getAccuracyBgColor = (accuracy: number) => {
    if (accuracy >= 80) return 'bg-green-100 dark:bg-green-900/30';
    if (accuracy >= 60) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-orange-100 dark:bg-orange-900/30';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Functional Threshold Power
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Estimated from last 90 days of riding
          </p>
        </div>
        {source === 'calculated' && (
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-full">
            Auto-calculated
          </span>
        )}
      </div>

      {/* FTP Value */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold text-gray-900 dark:text-white">{ftp}</span>
          <span className="text-2xl text-gray-500 dark:text-gray-400">W</span>
        </div>
      </div>

      {/* Accuracy Meter */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Confidence Score
          </span>
          <span className={`text-sm font-bold ${getAccuracyColor(accuracy)}`}>
            {accuracy}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              accuracy >= 80
                ? 'bg-gradient-to-r from-green-500 to-green-600'
                : accuracy >= 60
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                : 'bg-gradient-to-r from-orange-500 to-orange-600'
            }`}
            style={{ width: `${accuracy}%` }}
          />
        </div>

        {/* Ride Count */}
        <div className={`${getAccuracyBgColor(accuracy)} rounded-lg p-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Based on {rideCount} {rideCount === 1 ? 'activity' : 'activities'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      {accuracy < 80 && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            💡 Tip: {rideCount < 20 ? 'More rides with power data will improve accuracy.' : 'Include more 20-40 minute efforts at threshold for better estimation.'}
          </p>
        </div>
      )}
    </div>
  );
}

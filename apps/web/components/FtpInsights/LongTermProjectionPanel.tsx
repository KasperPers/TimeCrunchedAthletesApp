'use client';

import { ProjectionMetrics } from '@timecrunchedathletes/shared';

interface LongTermProjectionPanelProps {
  projections: ProjectionMetrics;
  currentFTP: number;
  currentCTL: number;
}

export function LongTermProjectionPanel({
  projections,
  currentFTP,
  currentCTL,
}: LongTermProjectionPanelProps) {
  const {
    ftpIn4Weeks,
    ftpIn6Weeks,
    ctlIn4Weeks,
    ctlIn6Weeks,
    confidence,
    confidenceLabel,
    assumptions,
  } = projections;

  const ftpChange4w = ftpIn4Weeks - currentFTP;
  const ftpChange6w = ftpIn6Weeks - currentFTP;
  const ctlChange4w = ctlIn4Weeks - currentCTL;
  const ctlChange6w = ctlIn6Weeks - currentCTL;

  const getConfidenceColor = (label: string) => {
    switch (label) {
      case 'high':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700';
      case 'medium':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700';
      default:
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            🔮 Long-Term Projection
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            4-6 week performance forecast
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full border ${getConfidenceColor(confidenceLabel)}`}>
          <div className="text-xs font-semibold">
            {confidence}% {confidenceLabel.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Projection Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* FTP Forecast */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10 rounded-lg p-5 border-2 border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">⚡</span>
            <h4 className="font-semibold text-gray-900 dark:text-white">FTP Forecast</h4>
          </div>

          <div className="space-y-3">
            {/* 4 weeks */}
            <div className="flex justify-between items-end">
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400">4 weeks</div>
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {ftpIn4Weeks}
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">W</span>
                </div>
              </div>
              <div
                className={`text-sm font-semibold ${
                  ftpChange4w > 0
                    ? 'text-green-600 dark:text-green-400'
                    : ftpChange4w < 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {ftpChange4w > 0 ? '+' : ''}
                {ftpChange4w} W
              </div>
            </div>

            {/* 6 weeks */}
            <div className="flex justify-between items-end pt-3 border-t border-orange-200 dark:border-orange-800">
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400">6 weeks</div>
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {ftpIn6Weeks}
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">W</span>
                </div>
              </div>
              <div
                className={`text-sm font-semibold ${
                  ftpChange6w > 0
                    ? 'text-green-600 dark:text-green-400'
                    : ftpChange6w < 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {ftpChange6w > 0 ? '+' : ''}
                {ftpChange6w} W
              </div>
            </div>
          </div>
        </div>

        {/* CTL Forecast */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 rounded-lg p-5 border-2 border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📈</span>
            <h4 className="font-semibold text-gray-900 dark:text-white">CTL Forecast</h4>
          </div>

          <div className="space-y-3">
            {/* 4 weeks */}
            <div className="flex justify-between items-end">
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400">4 weeks</div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {ctlIn4Weeks}
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                from {currentCTL} ({ctlChange4w > 0 ? '+' : ''}
                {ctlChange4w})
              </div>
            </div>

            {/* 6 weeks */}
            <div className="flex justify-between items-end pt-3 border-t border-purple-200 dark:border-purple-800">
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400">6 weeks</div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {ctlIn6Weeks}
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                from {currentCTL} ({ctlChange6w > 0 ? '+' : ''}
                {ctlChange6w})
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assumptions */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <div className="flex items-start gap-2 mb-2">
          <span className="text-sm">📋</span>
          <div className="flex-1">
            <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-2">
              Projection Assumptions
            </h5>
            <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
              {assumptions.map((assumption, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>{assumption}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400 italic">
        Projections are estimates based on recent training patterns and may vary with actual
        execution.
      </div>
    </div>
  );
}

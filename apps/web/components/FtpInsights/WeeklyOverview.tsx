'use client';

import { ComplianceMetrics } from '@timecrunchedathletes/shared';

interface WeeklyOverviewProps {
  compliance: ComplianceMetrics;
  adaptivePlan?: {
    sessions: Array<{
      name: string;
      duration: number;
      zone: string;
      estimatedTSS: number;
    }>;
    totalDuration: number;
    totalTSS: number;
  };
}

export function WeeklyOverview({ compliance, adaptivePlan }: WeeklyOverviewProps) {
  const { plannedTSS, actualTSS, plannedHours, actualHours, compliancePercentage, status } =
    compliance;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'over':
        return {
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          text: 'text-orange-700 dark:text-orange-300',
          border: 'border-orange-200 dark:border-orange-800',
        };
      case 'under':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          text: 'text-blue-700 dark:text-blue-300',
          border: 'border-blue-200 dark:border-blue-800',
        };
      default:
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          text: 'text-green-700 dark:text-green-300',
          border: 'border-green-200 dark:border-green-800',
        };
    }
  };

  const statusColors = getStatusColor(status);

  return (
    <div className="space-y-6">
      {/* This Week's Compliance */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          This Week's Progress
        </h3>

        {/* Planned vs Actual Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* TSS */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="text-xs text-gray-600 dark:text-gray-400 uppercase mb-2">
              Training Stress
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(actualTSS)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                / {Math.round(plannedTSS)} TSS
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, (actualTSS / plannedTSS) * 100)}%` }}
              />
            </div>
          </div>

          {/* Hours */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="text-xs text-gray-600 dark:text-gray-400 uppercase mb-2">
              Training Time
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {actualHours.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                / {plannedHours.toFixed(1)}h
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, (actualHours / plannedHours) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Compliance Status */}
        <div className={`rounded-lg p-4 border ${statusColors.bg} ${statusColors.border}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-semibold ${statusColors.text}`}>
              {status === 'on-track'
                ? '✅ On Track'
                : status === 'over'
                ? '⚠️ Above Target'
                : '📊 Below Target'}
            </span>
            <span className={`text-2xl font-bold ${statusColors.text}`}>
              {compliancePercentage}%
            </span>
          </div>
          <p className={`text-xs ${statusColors.text}`}>
            {status === 'on-track'
              ? 'Great consistency! Keep up the balanced training approach.'
              : status === 'over'
              ? 'Training volume exceeded plan. Consider extra recovery.'
              : 'Training volume below target. Try to complete remaining sessions.'}
          </p>
        </div>
      </div>

      {/* Next Week's Adaptive Plan */}
      {adaptivePlan && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Next Week's Plan
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {adaptivePlan.sessions.length} sessions • {Math.round(adaptivePlan.totalDuration / 60)}h •{' '}
                {adaptivePlan.totalTSS} TSS target
              </p>
            </div>
            <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs rounded-full font-medium">
              Auto-adapted
            </span>
          </div>

          {/* Session Cards */}
          <div className="space-y-3">
            {adaptivePlan.sessions.map((session, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-700/30 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {session.name}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {session.zone} • {session.duration} min
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-orange-600 dark:text-orange-400">
                      {session.estimatedTSS}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">TSS</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              💡 This plan was automatically adjusted based on your recent training load and
              recovery status.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

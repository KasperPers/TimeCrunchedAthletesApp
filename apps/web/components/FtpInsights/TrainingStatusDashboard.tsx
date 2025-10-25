'use client';

import { TrainingLoadMetrics, ReadinessStatus } from '@timecrunchedathletes/shared';

interface TrainingStatusDashboardProps {
  trainingLoad: TrainingLoadMetrics;
  readiness: ReadinessStatus;
}

export function TrainingStatusDashboard({
  trainingLoad,
  readiness,
}: TrainingStatusDashboardProps) {
  const { ctl, atl, tsb, rampRate } = trainingLoad;

  const getTSBStatus = (tsb: number) => {
    if (tsb > 10) return { label: 'Fresh', color: 'green' };
    if (tsb < -10) return { label: 'Fatigued', color: 'red' };
    return { label: 'Balanced', color: 'blue' };
  };

  const getRampRateStatus = (rate: number) => {
    if (rate > 7) return { label: 'Overload Risk', color: 'red' };
    if (rate > 6) return { label: 'Aggressive', color: 'orange' };
    if (rate > 3) return { label: 'Safe Build', color: 'green' };
    return { label: 'Maintenance', color: 'blue' };
  };

  const getReadinessIcon = (status: string) => {
    switch (status) {
      case 'fresh':
        return '💪';
      case 'fatigued':
        return '⚠️';
      default:
        return '✅';
    }
  };

  const tsbStatus = getTSBStatus(tsb);
  const rampStatus = getRampRateStatus(rampRate);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Training Status
      </h3>

      {/* Load Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* CTL */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 rounded-lg p-4">
          <div className="text-xs text-purple-600 dark:text-purple-400 font-medium uppercase mb-1">
            Fitness (CTL)
          </div>
          <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">{ctl}</div>
          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">42-day avg</div>
        </div>

        {/* ATL */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/30 rounded-lg p-4">
          <div className="text-xs text-orange-600 dark:text-orange-400 font-medium uppercase mb-1">
            Fatigue (ATL)
          </div>
          <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">{atl}</div>
          <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">7-day avg</div>
        </div>

        {/* TSB */}
        <div
          className={`bg-gradient-to-br ${
            tsbStatus.color === 'green'
              ? 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30'
              : tsbStatus.color === 'red'
              ? 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/30'
              : 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30'
          } rounded-lg p-4`}
        >
          <div
            className={`text-xs font-medium uppercase mb-1 ${
              tsbStatus.color === 'green'
                ? 'text-green-600 dark:text-green-400'
                : tsbStatus.color === 'red'
                ? 'text-red-600 dark:text-red-400'
                : 'text-blue-600 dark:text-blue-400'
            }`}
          >
            Form (TSB)
          </div>
          <div
            className={`text-3xl font-bold ${
              tsbStatus.color === 'green'
                ? 'text-green-700 dark:text-green-300'
                : tsbStatus.color === 'red'
                ? 'text-red-700 dark:text-red-300'
                : 'text-blue-700 dark:text-blue-300'
            }`}
          >
            {tsb >= 0 ? '+' : ''}
            {tsb}
          </div>
          <div
            className={`text-xs mt-1 ${
              tsbStatus.color === 'green'
                ? 'text-green-600 dark:text-green-400'
                : tsbStatus.color === 'red'
                ? 'text-red-600 dark:text-red-400'
                : 'text-blue-600 dark:text-blue-400'
            }`}
          >
            {tsbStatus.label}
          </div>
        </div>

        {/* Ramp Rate */}
        <div
          className={`bg-gradient-to-br ${
            rampStatus.color === 'red'
              ? 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/30'
              : rampStatus.color === 'orange'
              ? 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/30'
              : rampStatus.color === 'green'
              ? 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30'
              : 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30'
          } rounded-lg p-4`}
        >
          <div
            className={`text-xs font-medium uppercase mb-1 ${
              rampStatus.color === 'red'
                ? 'text-red-600 dark:text-red-400'
                : rampStatus.color === 'orange'
                ? 'text-orange-600 dark:text-orange-400'
                : rampStatus.color === 'green'
                ? 'text-green-600 dark:text-green-400'
                : 'text-blue-600 dark:text-blue-400'
            }`}
          >
            Ramp Rate
          </div>
          <div
            className={`text-3xl font-bold ${
              rampStatus.color === 'red'
                ? 'text-red-700 dark:text-red-300'
                : rampStatus.color === 'orange'
                ? 'text-orange-700 dark:text-orange-300'
                : rampStatus.color === 'green'
                ? 'text-green-700 dark:text-green-300'
                : 'text-blue-700 dark:text-blue-300'
            }`}
          >
            {rampRate >= 0 ? '+' : ''}
            {rampRate}
          </div>
          <div
            className={`text-xs mt-1 ${
              rampStatus.color === 'red'
                ? 'text-red-600 dark:text-red-400'
                : rampStatus.color === 'orange'
                ? 'text-orange-600 dark:text-orange-400'
                : rampStatus.color === 'green'
                ? 'text-green-600 dark:text-green-400'
                : 'text-blue-600 dark:text-blue-400'
            }`}
          >
            {rampStatus.label}
          </div>
        </div>
      </div>

      {/* Readiness Summary */}
      <div
        className={`rounded-lg p-4 ${
          readiness.status === 'fresh'
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : readiness.status === 'fatigued'
            ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
        }`}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">{getReadinessIcon(readiness.status)}</span>
          <div className="flex-1">
            <div
              className={`text-sm font-semibold mb-1 ${
                readiness.status === 'fresh'
                  ? 'text-green-800 dark:text-green-200'
                  : readiness.status === 'fatigued'
                  ? 'text-red-800 dark:text-red-200'
                  : 'text-blue-800 dark:text-blue-200'
              }`}
            >
              {readiness.status === 'fresh'
                ? 'Ready to Build'
                : readiness.status === 'fatigued'
                ? 'Recovery Needed'
                : 'Balanced Training'}
            </div>
            <p
              className={`text-sm ${
                readiness.status === 'fresh'
                  ? 'text-green-700 dark:text-green-300'
                  : readiness.status === 'fatigued'
                  ? 'text-red-700 dark:text-red-300'
                  : 'text-blue-700 dark:text-blue-300'
              }`}
            >
              {readiness.message}
            </p>
            {readiness.recommendedLoad !== 1.0 && (
              <div
                className={`mt-2 text-xs font-medium ${
                  readiness.status === 'fresh'
                    ? 'text-green-600 dark:text-green-400'
                    : readiness.status === 'fatigued'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`}
              >
                Recommended load adjustment:{' '}
                {readiness.recommendedLoad > 1
                  ? `+${Math.round((readiness.recommendedLoad - 1) * 100)}%`
                  : `${Math.round((readiness.recommendedLoad - 1) * 100)}%`}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <div>
            <span className="font-medium">CTL (Fitness):</span> Long-term training load
          </div>
          <div>
            <span className="font-medium">ATL (Fatigue):</span> Recent training stress
          </div>
          <div>
            <span className="font-medium">TSB (Form):</span> Freshness = CTL - ATL
          </div>
          <div>
            <span className="font-medium">Ramp Rate:</span> Weekly CTL change rate
          </div>
        </div>
      </div>
    </div>
  );
}

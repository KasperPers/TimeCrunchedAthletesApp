'use client';

import { FTPEstimate, TrainingLoadMetrics, ReadinessStatus } from '@timecrunchedathletes/shared';

interface PerformanceSummaryProps {
  ftpEstimate: FTPEstimate;
  trainingLoad: TrainingLoadMetrics;
  readiness: ReadinessStatus;
}

export function PerformanceSummary({
  ftpEstimate,
  trainingLoad,
  readiness,
}: PerformanceSummaryProps) {
  const { ftp, accuracy, rideCount } = ftpEstimate;
  const { tsb, rampRate, ctl } = trainingLoad;

  const generateMotivationalMessage = () => {
    const messages: string[] = [];

    // FTP status
    if (accuracy >= 80) {
      messages.push(`🚴 Your FTP is estimated at ${ftp}W with high confidence (${accuracy}% from ${rideCount} rides).`);
    } else if (accuracy >= 60) {
      messages.push(`🚴 Current FTP estimate: ${ftp}W. Keep logging rides to improve accuracy.`);
    } else {
      messages.push(`🚴 FTP estimate: ${ftp}W. More power data needed for better accuracy.`);
    }

    // Training status
    if (tsb > 10) {
      messages.push(`💪 You're well-rested with TSB at +${tsb}. Great time to push hard!`);
    } else if (tsb < -10) {
      messages.push(`⚠️ TSB at ${tsb} suggests fatigue. Prioritize recovery this week.`);
    } else {
      messages.push(`✅ TSB at ${tsb >= 0 ? '+' : ''}${tsb} shows balanced training load.`);
    }

    // Ramp rate
    if (rampRate > 6) {
      messages.push(`📈 Ramp rate of ${rampRate}/week is aggressive. Watch for overtraining signs.`);
    } else if (rampRate > 3) {
      messages.push(`📈 Ramp rate ${rampRate}/week indicates sustainable fitness growth.`);
    } else if (rampRate > 0) {
      messages.push(`📊 Steady build with ramp rate ${rampRate}/week. Maintain consistency.`);
    } else {
      messages.push(`📊 Maintenance phase detected. Consider adding stimulus to build fitness.`);
    }

    // CTL status
    if (ctl > 80) {
      messages.push(`🔥 Strong fitness base (CTL: ${ctl}). You're in great shape!`);
    } else if (ctl > 50) {
      messages.push(`💪 Good fitness level (CTL: ${ctl}). Keep building!`);
    } else {
      messages.push(`🌱 Building fitness base (CTL: ${ctl}). Stay consistent!`);
    }

    // Readiness advice
    messages.push(`\n${readiness.message}`);

    return messages.join('\n\n');
  };

  const getOverallStatus = () => {
    if (readiness.status === 'fatigued') {
      return { emoji: '⚠️', label: 'Recovery Focus', color: 'red' };
    }
    if (readiness.status === 'fresh' && ctl > 60) {
      return { emoji: '🔥', label: 'Peak Condition', color: 'green' };
    }
    if (readiness.status === 'balanced') {
      return { emoji: '✅', label: 'On Track', color: 'blue' };
    }
    return { emoji: '💪', label: 'Building Fitness', color: 'purple' };
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="bg-gradient-to-br from-orange-50 via-red-50 to-purple-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-lg shadow-lg p-6 border-2 border-orange-200 dark:border-orange-900">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-4xl">{overallStatus.emoji}</span>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Performance Overview
          </h3>
          <p
            className={`text-sm font-medium ${
              overallStatus.color === 'green'
                ? 'text-green-600 dark:text-green-400'
                : overallStatus.color === 'red'
                ? 'text-red-600 dark:text-red-400'
                : overallStatus.color === 'purple'
                ? 'text-purple-600 dark:text-purple-400'
                : 'text-blue-600 dark:text-blue-400'
            }`}
          >
            {overallStatus.label}
          </p>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white dark:bg-gray-700/50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-600 dark:text-gray-400 uppercase mb-1">FTP</div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{ftp}W</div>
        </div>
        <div className="bg-white dark:bg-gray-700/50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-600 dark:text-gray-400 uppercase mb-1">Fitness</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{ctl}</div>
        </div>
        <div className="bg-white dark:bg-gray-700/50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-600 dark:text-gray-400 uppercase mb-1">Form</div>
          <div
            className={`text-2xl font-bold ${
              tsb > 10
                ? 'text-green-600 dark:text-green-400'
                : tsb < -10
                ? 'text-red-600 dark:text-red-400'
                : 'text-blue-600 dark:text-blue-400'
            }`}
          >
            {tsb >= 0 ? '+' : ''}
            {tsb}
          </div>
        </div>
      </div>

      {/* Motivational Message */}
      <div className="bg-white dark:bg-gray-700/50 rounded-lg p-4">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
            {generateMotivationalMessage()}
          </p>
        </div>
      </div>

      {/* Action Items */}
      <div className="mt-4 flex gap-2">
        {readiness.recommendedLoad > 1.0 && (
          <div className="flex-1 bg-green-100 dark:bg-green-900/30 rounded-lg p-3 text-center">
            <div className="text-xs text-green-700 dark:text-green-300 font-medium">
              Recommended
            </div>
            <div className="text-sm font-bold text-green-800 dark:text-green-200">
              ↑ Increase Load
            </div>
          </div>
        )}
        {readiness.recommendedLoad < 1.0 && (
          <div className="flex-1 bg-red-100 dark:bg-red-900/30 rounded-lg p-3 text-center">
            <div className="text-xs text-red-700 dark:text-red-300 font-medium">Recommended</div>
            <div className="text-sm font-bold text-red-800 dark:text-red-200">
              ↓ Reduce Load
            </div>
          </div>
        )}
        {readiness.recommendedLoad === 1.0 && (
          <div className="flex-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 text-center">
            <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">Recommended</div>
            <div className="text-sm font-bold text-blue-800 dark:text-blue-200">
              → Maintain Load
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

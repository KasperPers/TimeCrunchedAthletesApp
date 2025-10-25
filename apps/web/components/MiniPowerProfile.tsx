'use client';

import { WorkoutInterval } from '@timecrunchedathletes/shared';

interface MiniPowerProfileProps {
  intervals: WorkoutInterval[];
  className?: string;
}

/**
 * Miniature power profile visualization for workout intervals
 * Shows a compact horizontal bar chart with color-coded zones
 */
export function MiniPowerProfile({ intervals, className = '' }: MiniPowerProfileProps) {
  // Calculate total duration for proportional widths
  const totalDuration = intervals.reduce((sum, interval) => sum + interval.duration, 0);

  // Get color for interval based on power zone
  const getZoneColor = (interval: WorkoutInterval): string => {
    const avgPower = (interval.powerLow + interval.powerHigh) / 2;

    if (interval.type === 'warmup') return 'bg-blue-400 dark:bg-blue-500';
    if (interval.type === 'cooldown') return 'bg-blue-400 dark:bg-blue-500';
    if (interval.type === 'rest') return 'bg-gray-300 dark:bg-gray-600';

    // Power-based coloring
    if (avgPower < 60) return 'bg-gray-300 dark:bg-gray-600'; // Recovery
    if (avgPower < 75) return 'bg-blue-400 dark:bg-blue-500'; // Endurance
    if (avgPower < 90) return 'bg-green-500 dark:bg-green-600'; // Tempo
    if (avgPower < 105) return 'bg-yellow-500 dark:bg-yellow-600'; // Threshold
    if (avgPower < 120) return 'bg-orange-500 dark:bg-orange-600'; // VO2max
    return 'bg-red-500 dark:bg-red-600'; // Anaerobic
  };

  // Get height based on power intensity
  const getBarHeight = (interval: WorkoutInterval): string => {
    const avgPower = (interval.powerLow + interval.powerHigh) / 2;
    const heightPercent = Math.min(100, Math.max(20, (avgPower / 150) * 100));
    return `${heightPercent}%`;
  };

  return (
    <div className={`flex items-end gap-0.5 h-8 w-full ${className}`}>
      {intervals.map((interval, index) => {
        const widthPercent = (interval.duration / totalDuration) * 100;

        return (
          <div
            key={index}
            className={`${getZoneColor(interval)} transition-all rounded-sm`}
            style={{
              width: `${widthPercent}%`,
              height: getBarHeight(interval),
            }}
            title={`${interval.label || interval.type}: ${Math.round(interval.duration / 60)}min @ ${interval.powerLow}-${interval.powerHigh}% FTP`}
          />
        );
      })}
    </div>
  );
}

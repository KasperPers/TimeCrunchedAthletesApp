'use client';

import { WorkoutInterval } from '@/lib/types';

interface WorkoutVisualizationProps {
  intervals?: WorkoutInterval[];
  workoutName: string;
  workoutType: string;
  duration: number;
  tss: number;
}

export function WorkoutVisualization({
  intervals,
  workoutName,
  workoutType,
  duration,
  tss,
}: WorkoutVisualizationProps) {
  if (!intervals || intervals.length === 0) {
    return null;
  }

  // Calculate total duration in seconds
  const totalDuration = intervals.reduce((sum, interval) => sum + interval.duration, 0);

  // Get color for interval type and power
  const getIntervalColor = (interval: WorkoutInterval): string => {
    const avgPower = (interval.powerLow + interval.powerHigh) / 2;

    if (interval.type === 'rest' || avgPower < 60) {
      return 'bg-gray-300 dark:bg-gray-600'; // Recovery
    } else if (avgPower < 75) {
      return 'bg-blue-400 dark:bg-blue-500'; // Endurance
    } else if (avgPower < 90) {
      return 'bg-green-500 dark:bg-green-600'; // Tempo
    } else if (avgPower < 105) {
      return 'bg-yellow-500 dark:bg-yellow-600'; // Threshold
    } else if (avgPower < 120) {
      return 'bg-orange-500 dark:bg-orange-600'; // VO2max
    } else {
      return 'bg-red-500 dark:bg-red-600'; // Anaerobic
    }
  };

  // Get border color for interval type (for ramp-ups)
  const getBorderColor = (interval: WorkoutInterval): string => {
    if (interval.powerLow !== interval.powerHigh) {
      return 'border-2 border-dashed border-gray-500';
    }
    return '';
  };

  // Format time in minutes:seconds
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${mins}min`;
  };

  // Get max power for scaling
  const maxPower = Math.max(...intervals.map(i => i.powerHigh));
  const scaleFactor = Math.min(100 / maxPower, 1); // Don't scale up, only down

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {workoutName}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {workoutType} • {duration}min • TSS {tss}
          </p>
        </div>
      </div>

      {/* Power Profile Visualization */}
      <div className="space-y-2">
        <div className="flex items-end h-32 gap-px bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
          {intervals.map((interval, index) => {
            const widthPercent = (interval.duration / totalDuration) * 100;
            const avgPower = (interval.powerLow + interval.powerHigh) / 2;
            const heightPercent = avgPower * scaleFactor;
            const color = getIntervalColor(interval);
            const border = getBorderColor(interval);

            return (
              <div
                key={index}
                className="flex flex-col justify-end relative group"
                style={{ width: `${widthPercent}%` }}
              >
                {/* The bar */}
                <div
                  className={`${color} ${border} transition-all duration-200 hover:opacity-80`}
                  style={{ height: `${heightPercent}%` }}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                    <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-lg">
                      <div className="font-semibold">{interval.label || interval.type}</div>
                      <div>{formatTime(interval.duration)}</div>
                      <div>
                        {interval.powerLow === interval.powerHigh
                          ? `${interval.powerLow}% FTP`
                          : `${interval.powerLow}-${interval.powerHigh}% FTP`}
                      </div>
                      {interval.cadence && <div>{interval.cadence} rpm</div>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <span>Recovery</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-400 dark:bg-blue-500 rounded"></div>
            <span>Endurance</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 dark:bg-green-600 rounded"></div>
            <span>Tempo</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 dark:bg-yellow-600 rounded"></div>
            <span>Threshold</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-500 dark:bg-orange-600 rounded"></div>
            <span>VO2max</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 dark:bg-red-600 rounded"></div>
            <span>Anaerobic</span>
          </div>
        </div>

        {/* Interval Breakdown Table */}
        <div className="mt-4 max-h-48 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="pb-2">#</th>
                <th className="pb-2">Interval</th>
                <th className="pb-2">Duration</th>
                <th className="pb-2">Power</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 dark:text-gray-300">
              {intervals.map((interval, index) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-2">{index + 1}</td>
                  <td className="py-2">
                    <span className="font-medium">{interval.label || interval.type}</span>
                    {interval.cadence && (
                      <span className="text-xs text-gray-500 ml-2">@ {interval.cadence}rpm</span>
                    )}
                  </td>
                  <td className="py-2">{formatTime(interval.duration)}</td>
                  <td className="py-2">
                    {interval.powerLow === interval.powerHigh
                      ? `${interval.powerLow}% FTP`
                      : `${interval.powerLow}-${interval.powerHigh}% FTP`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

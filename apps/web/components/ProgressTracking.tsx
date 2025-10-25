'use client';

interface Activity {
  startDate: string;
  distance: number;
  movingTime: number;
  tss?: number;
}

interface ProgressTrackingProps {
  activities: Activity[];
}

export function ProgressTracking({ activities }: ProgressTrackingProps) {
  const calculateWeekStats = (weekOffset: number) => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() - weekOffset * 7);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const weekActivities = activities.filter((a) => {
      const date = new Date(a.startDate);
      return date >= weekStart && date < weekEnd;
    });

    return {
      count: weekActivities.length,
      distance: weekActivities.reduce((sum, a) => sum + a.distance, 0) / 1000, // km
      time: weekActivities.reduce((sum, a) => sum + a.movingTime, 0) / 3600, // hours
      tss: weekActivities.reduce((sum, a) => sum + (a.tss || 0), 0),
    };
  };

  const thisWeek = calculateWeekStats(0);
  const lastWeek = calculateWeekStats(1);

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const ProgressMetric = ({
    label,
    current,
    previous,
    unit,
    decimals = 0,
  }: {
    label: string;
    current: number;
    previous: number;
    unit: string;
    decimals?: number;
  }) => {
    const change = calculateChange(current, previous);
    const isPositive = change > 0;
    const isNeutral = change === 0;

    return (
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          {label}
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold">
            {current.toFixed(decimals)}
            <span className="text-sm font-normal ml-1">{unit}</span>
          </div>
          {!isNeutral && (
            <div
              className={`flex items-center text-sm font-medium ${
                isPositive
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {isPositive ? '↑' : '↓'}
              <span className="ml-1">{Math.abs(change).toFixed(0)}%</span>
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Last week: {previous.toFixed(decimals)} {unit}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Week-over-Week Progress</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ProgressMetric
          label="Activities"
          current={thisWeek.count}
          previous={lastWeek.count}
          unit=""
          decimals={0}
        />
        <ProgressMetric
          label="Distance"
          current={thisWeek.distance}
          previous={lastWeek.distance}
          unit="km"
          decimals={1}
        />
        <ProgressMetric
          label="Time"
          current={thisWeek.time}
          previous={lastWeek.time}
          unit="hrs"
          decimals={1}
        />
        <ProgressMetric
          label="Training Load"
          current={thisWeek.tss}
          previous={lastWeek.tss}
          unit="TSS"
          decimals={0}
        />
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="text-sm text-blue-800 dark:text-blue-200">
          {thisWeek.tss > lastWeek.tss ? (
            <span>
              💪 Great work! You've increased your training load by{' '}
              {Math.round(calculateChange(thisWeek.tss, lastWeek.tss))}% this week.
            </span>
          ) : thisWeek.tss < lastWeek.tss ? (
            <span>
              🛌 You're recovering this week with{' '}
              {Math.abs(Math.round(calculateChange(thisWeek.tss, lastWeek.tss)))}% less
              training load.
            </span>
          ) : (
            <span>📊 Your training load is consistent with last week.</span>
          )}
        </div>
      </div>
    </div>
  );
}

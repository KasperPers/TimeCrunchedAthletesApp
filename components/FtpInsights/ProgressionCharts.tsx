'use client';

interface ActivityDataPoint {
  date: string;
  tss: number;
}

interface ProgressionChartsProps {
  activities: Array<{
    startDate: string;
    tss?: number;
  }>;
}

export function ProgressionCharts({ activities }: ProgressionChartsProps) {
  // Group activities by week
  const getWeeklyData = () => {
    const weeklyMap = new Map<string, number>();

    activities.forEach((activity) => {
      const date = new Date(activity.startDate);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      weekStart.setHours(0, 0, 0, 0);

      const weekKey = weekStart.toISOString().split('T')[0];
      const currentTSS = weeklyMap.get(weekKey) || 0;
      weeklyMap.set(weekKey, currentTSS + (activity.tss || 0));
    });

    return Array.from(weeklyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12) // Last 12 weeks
      .map(([date, tss]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        tss: Math.round(tss),
      }));
  };

  const weeklyData = getWeeklyData();
  const maxTSS = Math.max(...weeklyData.map((d) => d.tss), 100);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly TSS Trend</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Last 12 weeks of training load</p>
      </div>

      {/* Simple Bar Chart */}
      <div className="relative h-48">
        <div className="absolute inset-0 flex items-end justify-between gap-1">
          {weeklyData.map((data, index) => {
            const height = (data.tss / maxTSS) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                {/* Bar */}
                <div className="w-full flex flex-col justify-end h-40">
                  <div
                    className="w-full bg-gradient-to-t from-orange-500 to-red-600 rounded-t transition-all hover:opacity-80 relative group"
                    style={{ height: `${height}%` }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                        {data.tss} TSS
                      </div>
                    </div>
                  </div>
                </div>
                {/* Label */}
                <div className="text-xs text-gray-600 dark:text-gray-400 text-center transform -rotate-45 origin-top-left">
                  {data.date}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-red-600 rounded"></div>
            <span>Weekly Training Stress Score</span>
          </div>
          <span className="font-medium">Avg: {Math.round(weeklyData.reduce((sum, d) => sum + d.tss, 0) / weeklyData.length)} TSS/week</span>
        </div>
      </div>
    </div>
  );
}

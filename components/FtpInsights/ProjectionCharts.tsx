'use client';

import { ProjectionMetrics } from '@/lib/services/ftp';

interface ProjectionChartsProps {
  activities: Array<{
    startDate: string;
    tss?: number;
  }>;
  currentCTL: number;
  projections?: ProjectionMetrics;
}

export function ProjectionCharts({ activities, currentCTL, projections }: ProjectionChartsProps) {
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

    const historicalData = Array.from(weeklyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12) // Last 12 weeks
      .map(([date, tss]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        tss: Math.round(tss),
        isForecast: false,
      }));

    // Add forecast weeks if projections available
    if (projections && historicalData.length > 0) {
      const lastWeek = new Date(
        weeklyMap.size > 0
          ? Array.from(weeklyMap.keys()).sort().reverse()[0]
          : new Date().toISOString()
      );

      // Add 4 forecast weeks based on CTL progression
      const ctlDelta4w = projections.ctlIn4Weeks - currentCTL;
      const weeklyTSSIncrease = (ctlDelta4w / 4) * 7; // Convert CTL to approximate TSS

      for (let i = 1; i <= 4; i++) {
        const forecastWeek = new Date(lastWeek);
        forecastWeek.setDate(lastWeek.getDate() + i * 7);

        const lastHistoricalTSS = historicalData[historicalData.length - 1].tss;
        const forecastTSS = Math.round(lastHistoricalTSS + weeklyTSSIncrease * i);

        historicalData.push({
          date: forecastWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          tss: Math.max(0, forecastTSS),
          isForecast: true,
        });
      }
    }

    return historicalData;
  };

  const weeklyData = getWeeklyData();
  const maxTSS = Math.max(...weeklyData.map((d) => d.tss), 100);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Weekly TSS Trend {projections && '& Forecast'}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Last 12 weeks {projections && '+ 4-week projection'}
        </p>
      </div>

      {/* Chart */}
      <div className="relative h-48">
        <div className="absolute inset-0 flex items-end justify-between gap-1">
          {weeklyData.map((data, index) => {
            const height = (data.tss / maxTSS) * 100;
            const isForecast = data.isForecast;

            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                {/* Bar */}
                <div className="w-full flex flex-col justify-end h-40">
                  <div
                    className={`w-full rounded-t transition-all hover:opacity-80 relative group ${
                      isForecast
                        ? 'bg-gradient-to-t from-blue-300 to-blue-400 dark:from-blue-700 dark:to-blue-600 opacity-60 border-2 border-dashed border-blue-500 dark:border-blue-400'
                        : 'bg-gradient-to-t from-orange-500 to-red-600'
                    }`}
                    style={{ height: `${height}%` }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                        {data.tss} TSS {isForecast && '(forecast)'}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Label */}
                <div
                  className={`text-xs text-center transform -rotate-45 origin-top-left ${
                    isForecast
                      ? 'text-blue-600 dark:text-blue-400 font-medium'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {data.date}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-red-600 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">Actual</span>
            </div>
            {projections && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-400 dark:bg-blue-600 border-2 border-dashed border-blue-500 dark:border-blue-400 rounded opacity-60"></div>
                <span className="text-gray-600 dark:text-gray-400">Forecast</span>
              </div>
            )}
          </div>
          <span className="font-medium text-gray-600 dark:text-gray-400">
            Avg:{' '}
            {Math.round(
              weeklyData.filter((d) => !d.isForecast).reduce((sum, d) => sum + d.tss, 0) /
                weeklyData.filter((d) => !d.isForecast).length
            )}{' '}
            TSS/week
          </span>
        </div>

        {projections && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              💡 Forecast based on projected CTL ramp of{' '}
              {((projections.ctlIn4Weeks - currentCTL) / 4).toFixed(1)}/week. Actual TSS may vary
              based on execution.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

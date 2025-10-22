'use client';

interface Activity {
  startDate: string;
  tss?: number;
}

interface WeeklyTSSChartProps {
  activities: Activity[];
}

export function WeeklyTSSChart({ activities }: WeeklyTSSChartProps) {
  // Group activities by day of week for last 14 days
  const getDailyTSS = () => {
    const dailyTSS: { [key: string]: number } = {};
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    activities.forEach((activity) => {
      const date = new Date(activity.startDate);
      if (date >= fourteenDaysAgo && activity.tss) {
        const dateKey = date.toISOString().split('T')[0];
        dailyTSS[dateKey] = (dailyTSS[dateKey] || 0) + activity.tss;
      }
    });

    return dailyTSS;
  };

  const dailyTSS = getDailyTSS();

  // Get last 14 days
  const days: { date: Date; dateKey: string; dayName: string; tss: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    days.push({
      date,
      dateKey,
      dayName,
      tss: dailyTSS[dateKey] || 0,
    });
  }

  const maxTSS = Math.max(...days.map((d) => d.tss), 100);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Daily Training Load (TSS)</h3>

      <div className="flex items-end justify-between gap-1 h-48">
        {days.map((day, index) => {
          const heightPercentage = (day.tss / maxTSS) * 100;
          const isToday =
            day.dateKey === new Date().toISOString().split('T')[0];

          return (
            <div key={day.dateKey} className="flex-1 flex flex-col items-center">
              <div className="w-full flex items-end justify-center h-40">
                <div
                  className={`w-full rounded-t transition-all ${
                    isToday
                      ? 'bg-orange-500'
                      : day.tss > 0
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                  style={{ height: `${heightPercentage}%` }}
                  title={`${day.dayName}: ${Math.round(day.tss)} TSS`}
                >
                  {day.tss > 0 && (
                    <div className="text-xs text-white font-medium text-center pt-1">
                      {Math.round(day.tss)}
                    </div>
                  )}
                </div>
              </div>
              <div
                className={`text-xs mt-1 ${
                  isToday ? 'font-bold text-orange-600' : 'text-gray-500'
                }`}
              >
                {day.dayName}
              </div>
              <div className="text-xs text-gray-400">
                {day.date.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex justify-between">
          <span>Last 14 days</span>
          <span>
            Total: {Math.round(Object.values(dailyTSS).reduce((a, b) => a + b, 0))} TSS
          </span>
        </div>
      </div>
    </div>
  );
}

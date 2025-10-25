'use client';

import { useState } from 'react';

interface Activity {
  id: string;
  name: string;
  type: string;
  startDate: string;
  tss?: number;
  workoutType?: string;
}

interface CalendarViewProps {
  activities: Activity[];
}

export function CalendarView({ activities }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getMonthStart = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days in month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getActivitiesForDay = (date: Date | null) => {
    if (!date) return [];

    const dateKey = date.toISOString().split('T')[0];
    return activities.filter((a) => {
      const activityDate = new Date(a.startDate).toISOString().split('T')[0];
      return activityDate === dateKey;
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'ride':
      case 'virtualride':
        return '🚴';
      case 'run':
        return '🏃';
      case 'swim':
        return '🏊';
      default:
        return '💪';
    }
  };

  const getWorkoutColor = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'recovery':
        return 'bg-green-100 dark:bg-green-900/30';
      case 'endurance':
        return 'bg-blue-100 dark:bg-blue-900/30';
      case 'tempo':
        return 'bg-yellow-100 dark:bg-yellow-900/30';
      case 'threshold':
        return 'bg-orange-100 dark:bg-orange-900/30';
      case 'vo2max':
        return 'bg-red-100 dark:bg-red-900/30';
      default:
        return 'bg-gray-100 dark:bg-gray-700';
    }
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">{monthName}</h3>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            ←
          </button>
          <button
            onClick={nextMonth}
            className="px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((date, index) => {
          const dayActivities = getActivitiesForDay(date);
          const totalTSS = dayActivities.reduce((sum, a) => sum + (a.tss || 0), 0);

          return (
            <div
              key={index}
              className={`min-h-20 p-1 border border-gray-200 dark:border-gray-700 rounded ${
                date
                  ? isToday(date)
                    ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500'
                    : dayActivities.length > 0
                    ? 'bg-blue-50 dark:bg-blue-900/10'
                    : 'bg-white dark:bg-gray-800'
                  : 'bg-gray-50 dark:bg-gray-900'
              }`}
            >
              {date && (
                <>
                  <div
                    className={`text-xs font-medium mb-1 ${
                      isToday(date)
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {date.getDate()}
                  </div>

                  {dayActivities.length > 0 && (
                    <div className="space-y-1">
                      {dayActivities.slice(0, 2).map((activity) => (
                        <div
                          key={activity.id}
                          className={`text-xs p-1 rounded ${getWorkoutColor(
                            activity.workoutType
                          )}`}
                          title={activity.name}
                        >
                          <div className="flex items-center gap-1">
                            <span>{getActivityIcon(activity.type)}</span>
                            {activity.tss && (
                              <span className="text-xs font-medium">
                                {Math.round(activity.tss)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}

                      {dayActivities.length > 2 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          +{dayActivities.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-orange-500 rounded"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900/30 border border-gray-300 rounded"></div>
          <span>Activities</span>
        </div>
      </div>
    </div>
  );
}

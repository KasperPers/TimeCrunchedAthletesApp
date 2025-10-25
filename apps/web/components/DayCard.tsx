'use client';

import { WorkoutInterval } from '@timecrunchedathletes/shared';

interface DayCardProps {
  day: string;
  dayShort: string;
  date: Date;
  duration?: number;
  hasWorkout: boolean;
  workout?: {
    name: string;
    type: string;
    tss: number;
    intervals?: WorkoutInterval[];
  };
  isToday: boolean;
  onClick: () => void;
}

export function DayCard({
  day,
  dayShort,
  date,
  duration,
  hasWorkout,
  workout,
  isToday,
  onClick,
}: DayCardProps) {
  const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

  // Get intensity color based on workout type
  const getIntensityColor = (type?: string) => {
    if (!type) return 'bg-gray-100 dark:bg-gray-700';

    const colors: Record<string, string> = {
      Recovery: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
      Endurance: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700',
      Tempo: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700',
      Threshold: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700',
      VO2Max: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700',
      Mixed: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700',
    };

    return colors[type] || 'bg-gray-100 dark:bg-gray-700';
  };

  const cardClasses = `
    relative cursor-pointer rounded-lg p-4 transition-all duration-200 border-2
    ${isToday ? 'ring-2 ring-orange-500 ring-offset-2 dark:ring-offset-gray-900' : ''}
    ${hasWorkout ? getIntensityColor(workout?.type) : 'border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'}
    ${isPast ? 'opacity-60' : 'hover:shadow-lg hover:scale-105'}
  `;

  return (
    <div className={cardClasses} onClick={onClick}>
      {/* Day Header */}
      <div className="mb-2">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {dayShort}
            </div>
            <div className="text-lg font-bold">
              {date.getDate()}
            </div>
          </div>
          {isToday && (
            <span className="inline-block w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
          )}
        </div>
      </div>

      {/* Session Info */}
      {hasWorkout ? (
        <div className="space-y-2">
          {workout && (
            <>
              <div className="text-xs font-semibold truncate" title={workout.name}>
                {workout.name}
              </div>
              <div className="text-sm font-medium">
                {duration ? `${duration} min` : 'Set duration'}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 bg-white dark:bg-gray-800 rounded-full font-medium">
                  {workout.type}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  TSS {workout.tss}
                </span>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="text-gray-400 dark:text-gray-500">
            <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <div className="text-xs">Rest day</div>
          </div>
        </div>
      )}
    </div>
  );
}

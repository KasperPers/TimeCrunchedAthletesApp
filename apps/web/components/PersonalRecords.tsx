'use client';

interface Activity {
  id: string;
  name: string;
  type: string;
  startDate: string;
  distance: number;
  movingTime: number;
  averageWatts?: number;
  maxWatts?: number;
  averageSpeed?: number;
  maxSpeed?: number;
}

interface PersonalRecordsProps {
  activities: Activity[];
}

export function PersonalRecords({ activities }: PersonalRecordsProps) {
  // Filter only rides and virtual rides
  const rides = activities.filter(
    (a) => a.type === 'Ride' || a.type === 'VirtualRide'
  );

  if (rides.length === 0) {
    return null;
  }

  // Calculate personal records
  const longestRide = rides.reduce((max, a) =>
    a.distance > max.distance ? a : max
  );

  const longestDuration = rides.reduce((max, a) =>
    a.movingTime > max.movingTime ? a : max
  );

  const highestAvgPower = rides
    .filter((a) => a.averageWatts && a.averageWatts > 0)
    .reduce((max, a) => {
      if (!max.averageWatts) return a;
      return a.averageWatts! > max.averageWatts! ? a : max;
    }, rides[0]);

  const highestMaxPower = rides
    .filter((a) => a.maxWatts && a.maxWatts > 0)
    .reduce((max, a) => {
      if (!max.maxWatts) return a;
      return a.maxWatts! > max.maxWatts! ? a : max;
    }, rides[0]);

  const fastestRide = rides
    .filter((a) => a.averageSpeed && a.averageSpeed > 0)
    .reduce((max, a) => {
      if (!max.averageSpeed) return a;
      return a.averageSpeed! > max.averageSpeed! ? a : max;
    }, rides[0]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const RecordCard = ({
    title,
    value,
    unit,
    activity,
    icon,
  }: {
    title: string;
    value: string | number;
    unit: string;
    activity: Activity;
    icon: string;
  }) => (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
      <div className="flex items-start justify-between mb-2">
        <div className="text-2xl">{icon}</div>
        <span className="text-xs bg-purple-200 dark:bg-purple-700 text-purple-800 dark:text-purple-100 px-2 py-1 rounded-full">
          PR
        </span>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
        {title}
      </div>
      <div className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-1">
        {value}
        <span className="text-sm font-normal ml-1">{unit}</span>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
        {activity.name}
      </div>
      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
        {formatDate(activity.startDate)}
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span>🏆</span>
        <span>Personal Records (Last 14 Days)</span>
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <RecordCard
          title="Longest Distance"
          value={(longestRide.distance / 1000).toFixed(1)}
          unit="km"
          activity={longestRide}
          icon="🚴"
        />

        <RecordCard
          title="Longest Duration"
          value={formatDuration(longestDuration.movingTime)}
          unit=""
          activity={longestDuration}
          icon="⏱️"
        />

        {highestAvgPower.averageWatts && highestAvgPower.averageWatts > 0 && (
          <RecordCard
            title="Highest Avg Power"
            value={Math.round(highestAvgPower.averageWatts)}
            unit="W"
            activity={highestAvgPower}
            icon="⚡"
          />
        )}

        {highestMaxPower.maxWatts && highestMaxPower.maxWatts > 0 && (
          <RecordCard
            title="Peak Power"
            value={Math.round(highestMaxPower.maxWatts)}
            unit="W"
            activity={highestMaxPower}
            icon="💥"
          />
        )}

        {fastestRide.averageSpeed && fastestRide.averageSpeed > 0 && (
          <RecordCard
            title="Fastest Avg Speed"
            value={(fastestRide.averageSpeed * 3.6).toFixed(1)}
            unit="km/h"
            activity={fastestRide}
            icon="🏃"
          />
        )}
      </div>
    </div>
  );
}

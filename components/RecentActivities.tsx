'use client';

import { formatDistanceToNow } from '@/lib/utils/date';

interface Activity {
  id: string;
  stravaId: string;
  name: string;
  type: string;
  startDate: string;
  distance: number;
  movingTime: number;
  totalElevationGain: number;
  averageWatts?: number;
  averageHeartrate?: number;
  tss?: number;
  workoutType?: string;
}

interface RecentActivitiesProps {
  activities: Activity[];
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'ride':
      case 'virtualride':
        return '🚴';
      case 'run':
        return '🏃';
      case 'swim':
        return '🏊';
      case 'walk':
        return '🚶';
      default:
        return '💪';
    }
  };

  const getWorkoutTypeColor = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'recovery':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      case 'endurance':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
      case 'tempo':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
      case 'threshold':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200';
      case 'vo2max':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
      case 'anaerobic':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (activities.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No activities found. Click "Sync Activities" to load your Strava data.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Last 14 Days</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
        </span>
      </div>

      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {activity.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(activity.startDate)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Distance</span>
                    <p className="font-medium">
                      {(activity.distance / 1000).toFixed(1)} km
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Duration</span>
                    <p className="font-medium">{formatDuration(activity.movingTime)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Elevation</span>
                    <p className="font-medium">
                      {Math.round(activity.totalElevationGain)} m
                    </p>
                  </div>
                  {activity.tss && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">TSS</span>
                      <p className="font-medium">{Math.round(activity.tss)}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-3 flex-wrap">
                  {activity.workoutType && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getWorkoutTypeColor(
                        activity.workoutType
                      )}`}
                    >
                      {activity.workoutType}
                    </span>
                  )}
                  {activity.averageWatts && (
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
                      ⚡ {Math.round(activity.averageWatts)}W
                    </span>
                  )}
                  {activity.averageHeartrate && (
                    <span className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300">
                      ❤️ {Math.round(activity.averageHeartrate)} bpm
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

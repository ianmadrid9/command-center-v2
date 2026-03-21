'use client';

import { Activity } from '@/lib/mockData';

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const typeIcons = {
    deploy: '🚀',
    'task-complete': '✅',
    'agent-spawn': '🤖',
    error: '⚠️',
    info: 'ℹ️',
  };

  const typeColors = {
    deploy: 'text-green-400',
    'task-complete': 'text-blue-400',
    'agent-spawn': 'text-purple-400',
    error: 'text-red-400',
    info: 'text-muted',
  };

  function formatTime(timestamp: string) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  }

  return (
    <div className="card p-5 w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Recent Activity</h3>
        <button className="text-xs text-muted hover:text-accent transition-colors">
          View all
        </button>
      </div>
      
      <div className="space-y-3">
        {activities.slice(0, 6).map((activity) => (
          <div key={activity.id} className="flex gap-3 items-start">
            <div className="text-lg">{typeIcons[activity.type]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{activity.message}</p>
              {activity.details && (
                <p className="text-xs text-muted mt-0.5 truncate">{activity.details}</p>
              )}
              <p className="text-xs text-muted mt-1">{formatTime(activity.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

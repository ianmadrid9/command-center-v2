'use client';

interface Activity {
  id: string;
  type: 'deploy' | 'task-complete' | 'agent-spawn' | 'error' | 'info';
  message: string;
  timestamp: string;
  details?: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const typeIcons: Record<string, string> = {
    deploy: '🚀',
    'task-complete': '✅',
    'agent-spawn': '🤖',
    error: '⚠️',
    info: 'ℹ️',
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

  if (!activities || activities.length === 0) {
    return (
      <div className="card p-5 w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Recent Activity</h3>
        </div>
        <div className="text-center py-8 text-muted">
          <p>No recent activity</p>
          <p className="text-xs mt-2">Activity will appear here as you use the dashboard</p>
        </div>
      </div>
    );
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
            <div className="text-lg">{typeIcons[activity.type] || 'ℹ️'}</div>
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

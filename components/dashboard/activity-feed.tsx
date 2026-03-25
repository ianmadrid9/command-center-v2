'use client';

import { useState } from 'react';

interface Activity {
  id: string;
  type: 'deploy' | 'task-complete' | 'agent-spawn' | 'error' | 'info' | 'feature' | 'extraction' | 'deployment';
  message: string;
  timestamp: string;
  details?: string;
  source?: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const typeIcons: Record<string, string> = {
    deploy: '🚀',
    'task-complete': '✅',
    'agent-spawn': '🤖',
    error: '⚠️',
    info: 'ℹ️',
    feature: '✨',
    extraction: '📝',
    deployment: '🚀',
  };

  function formatTime(timestamp: string) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  // Show last 3 inline
  const recentActivities = activities.slice(0, 3);
  // Show up to 10 in modal (paginated)
  const modalActivities = activities.slice(0, 10);
  const totalPages = Math.ceil(activities.length / itemsPerPage);
  const paginatedActivities = activities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const ActivityItem = ({ activity }: { activity: Activity }) => (
    <div className="flex gap-3 items-start py-3 border-b border-border/50 last:border-0">
      <div className="text-lg flex-shrink-0">{typeIcons[activity.type] || 'ℹ️'}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">{activity.message}</p>
        {activity.details && (
          <p className="text-xs text-muted mt-0.5">{activity.details}</p>
        )}
        {activity.source && (
          <p className="text-xs text-muted mt-0.5 font-mono">{activity.source}</p>
        )}
        <p className="text-xs text-muted mt-1">{formatTime(activity.timestamp)}</p>
      </div>
    </div>
  );

  return (
    <>
      <div className="card p-5 w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <h3 className="font-medium">Activity Logs</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted">
              {activities.length} total
            </span>
            {activities.length > 3 && (
              <button
                onClick={() => {
                  setShowModal(true);
                  setCurrentPage(1);
                }}
                className="text-xs text-accent hover:underline transition-colors"
              >
                View all →
              </button>
            )}
          </div>
        </div>
        
        {recentActivities.length === 0 ? (
          <div className="text-center py-8 text-muted">
            <p>No activity yet</p>
            <p className="text-xs mt-2">Activity will appear here as work is done</p>
          </div>
        ) : (
          <div>
            {recentActivities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="card w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-xl">📋</span>
                <h3 className="font-medium">All Activity Logs</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted hover:text-foreground transition-colors text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5">
              {paginatedActivities.length === 0 ? (
                <p className="text-center text-muted py-8">No activity</p>
              ) : (
                <div>
                  {paginatedActivities.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              )}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-5 border-t border-border">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="text-sm px-3 py-1.5 rounded-lg bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                >
                  ← Previous
                </button>
                <span className="text-sm text-muted">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="text-sm px-3 py-1.5 rounded-lg bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

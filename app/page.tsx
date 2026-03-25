'use client';

import { useState, useEffect } from 'react';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { fetchActivities } from '@/lib/api';

export default function Dashboard() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const acts = await fetchActivities();
        setActivities(acts);
      } catch (error) {
        console.error('Failed to load activities:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
    
    // Refresh every 60 seconds
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-muted">Loading activity logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold">Activity Logs</h1>
        <p className="mt-1 text-sm text-muted">Track all development work, features, and decisions</p>
      </div>

      {/* Activity Feed */}
      <div>
        <ActivityFeed activities={activities} />
      </div>
    </div>
  );
}

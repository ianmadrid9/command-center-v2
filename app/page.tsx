'use client';

import { useState, useEffect } from 'react';
import { LifeGoalsKpi } from '@/components/dashboard/life-goals-kpi';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { EventbriteMonitor } from '@/components/dashboard/eventbrite-monitor';
import { TranscriptExtractor } from '@/components/dashboard/transcript-extractor';
import { EventbriteRSVPs } from '@/components/dashboard/eventbrite-rsvps';
import { MyTickets } from '@/components/dashboard/my-tickets';
import { SystemCapacity } from '@/components/dashboard/system-capacity';
import { fetchActivities, fetchSystemHealth } from '@/lib/api';

export default function Dashboard() {
  const [activities, setActivities] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [acts, health] = await Promise.all([
          fetchActivities(),
          fetchSystemHealth(),
        ]);
        setActivities(acts);
        setSystemHealth(health);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
    
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold">Clawmmand Center</h1>
        <p className="mt-1 text-sm text-muted">Your projects. Your conversations. Your progress.</p>
      </div>

      {/* Life Goals */}
      <div>
        <LifeGoalsKpi />
      </div>

      {/* Events & Tickets */}
      <div className="space-y-4">
        <EventbriteMonitor />
        <EventbriteRSVPs />
        <MyTickets />
        <TranscriptExtractor />
      </div>

      {/* System Capacity */}
      <div>
        {systemHealth && <SystemCapacity health={systemHealth} currentAgents={0} />}
      </div>

      {/* Activity Feed */}
      <div>
        <ActivityFeed activities={activities} />
      </div>
    </div>
  );
}

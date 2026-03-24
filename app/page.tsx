'use client';

import { useState, useEffect } from 'react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { DevAgentsKpi } from '@/components/dashboard/dev-agents-kpi';
import { LifeGoalsKpi } from '@/components/dashboard/life-goals-kpi';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { SystemCapacity } from '@/components/dashboard/system-capacity';
import { EventbriteMonitor } from '@/components/dashboard/eventbrite-monitor';
import { TranscriptExtractor } from '@/components/dashboard/transcript-extractor';
import { EventbriteRSVPs } from '@/components/dashboard/eventbrite-rsvps';
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

  function handleQuickAction(action: string) {
    console.log('Quick action:', action);
    alert(`Action "${action}" triggered`);
  }

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Clawmmand Center</h1>
          <p className="mt-1 text-sm text-muted">Your projects. Your conversations. Your progress.</p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
        <StatsCard title="Active Tasks" value="0" subtitle="No active tasks" icon="📋" />
        <StatsCard title="Events" value="Live" subtitle="Check Eventbrite" icon="🎫" />
        <StatsCard title="Deployments" value="12" subtitle="this week" icon="🚀" />
      </div>

      {/* Dev Agents */}
      <div>
        <DevAgentsKpi />
      </div>

      {/* Life Goals */}
      <div>
        <LifeGoalsKpi />
      </div>

      {/* Events & Tickets */}
      <div className="space-y-4">
        <EventbriteMonitor />
        <EventbriteRSVPs />
        <TranscriptExtractor />
      </div>

      {/* System Capacity */}
      <div className="space-y-4">
        {systemHealth && <SystemCapacity health={systemHealth} currentAgents={0} />}
      </div>

      {/* Activity Feed & Quick Actions */}
      <div className="space-y-4">
        <ActivityFeed activities={activities} />
        <QuickActions onAction={handleQuickAction} />
      </div>
    </div>
  );
}

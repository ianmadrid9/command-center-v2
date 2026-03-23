'use client';

import { useState, useEffect } from 'react';
import { EventbriteAgent } from './eventbrite-agent';

interface Agent {
  agentId: string;
  name: string;
  status: 'healthy' | 'warning' | 'error' | 'idle';
  lastRun: string | null;
  nextRun: string | null;
}

export function DevAgentsKpi() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  useEffect(() => {
    async function loadAgents() {
      try {
        const res = await fetch('/api/agents');
        const data = await res.json();
        setAgents(data.agents || []);
      } catch (error) {
        console.error('Failed to load agents:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadAgents();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadAgents, 30000);
    return () => clearInterval(interval);
  }, []);

  function formatTimeAgo(timestamp: string | null): string {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  function getStatusIcon(status: string): string {
    switch (status) {
      case 'healthy': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'idle': return '⏸️';
      default: return '❓';
    }
  }

  if (loading) {
    return (
      <div className="card p-5 w-full">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🤖</span>
          <div>
            <h3 className="font-semibold text-lg">Dev Agents</h3>
            <p className="text-sm text-muted">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5 w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🤖</span>
          <div>
            <h3 className="font-semibold text-lg">Dev Agents</h3>
            <p className="text-sm text-muted">
              {agents.filter(a => a.status === 'healthy').length} healthy • {agents.filter(a => a.status === 'warning' || a.status === 'error').length} need attention
            </p>
          </div>
        </div>
      </div>
      
      {/* Minimalist Agent List */}
      <div className="space-y-2">
        {agents.map((agent) => (
          <div
            key={agent.agentId}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-border/50 hover:border-accent/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{getStatusIcon(agent.status)}</span>
              <span className="font-medium text-sm">{agent.name}</span>
            </div>
            <div className="text-right">
              <span className={`text-xs ${
                agent.status === 'healthy' ? 'text-green-400' :
                agent.status === 'warning' ? 'text-amber-400' :
                agent.status === 'error' ? 'text-red-400' :
                'text-gray-400'
              }`}>
                {formatTimeAgo(agent.lastRun)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
  </div>
        ))}
      </div>

      {selectedAgent === 'eventbrite' && (
        <EventbriteAgent onClose={() => setSelectedAgent(null)} />
      )}
    </div>
  );
}

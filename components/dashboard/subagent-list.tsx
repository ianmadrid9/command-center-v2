'use client';

import { Subagent } from '@/lib/mockData';

interface SubagentListProps {
  subagents: Subagent[];
}

export function SubagentList({ subagents }: SubagentListProps) {
  const statusColors = {
    idle: 'bg-gray-500',
    running: 'bg-green-500 animate-pulse',
    completed: 'bg-blue-500',
    failed: 'bg-red-500',
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Active Subagents</h3>
        <span className="text-xs text-muted">{subagents.filter(s => s.status === 'running').length} running</span>
      </div>
      
      <div className="space-y-3">
        {subagents.map((agent) => (
          <div key={agent.id} className="p-3 rounded-xl bg-slate-900/50 border border-border/50">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${statusColors[agent.status]}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate">{agent.name}</span>
                  {agent.eta && (
                    <span className="text-xs text-muted">{agent.eta}</span>
                  )}
                </div>
                <p className="text-xs text-muted mt-0.5 truncate">{agent.task}</p>
              </div>
            </div>
            
            {agent.status === 'running' && agent.progress < 100 && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-muted mb-1">
                  <span>Progress</span>
                  <span>{agent.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-1.5 rounded-full bg-accent transition-all" 
                    style={{ width: `${agent.progress}%` }} 
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

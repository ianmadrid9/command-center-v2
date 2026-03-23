'use client';

import { useState } from 'react';
import { Subagent } from '@/lib/mockData';
import { SubagentChat } from './subagent-chat';

interface DevAgentsKpiProps {
  subagents: Subagent[];
}

export function DevAgentsKpi({ subagents }: DevAgentsKpiProps) {
  const [showChat, setShowChat] = useState(false);
  
  const total = subagents.length;
  const idle = subagents.filter(s => s.status === 'idle').length;
  const running = subagents.filter(s => s.status === 'running').length;
  const completed = subagents.filter(s => s.status === 'completed').length;
  const urgentCount = subagents.filter(s => s.status === 'running' && s.progress < 50).length;

  return (
    <>
      <div
        onClick={() => setShowChat(true)}
        className="card p-5 w-full cursor-pointer hover:border-accent/50 transition-colors"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🤖</span>
            <div>
              <h3 className="font-semibold text-lg">Dev Agents</h3>
              <p className="text-sm text-muted">
                {running} running • {idle} idle • {completed} completed
              </p>
            </div>
          </div>
          <div className="text-right">
            {urgentCount > 0 ? (
              <p className="text-sm text-red-400">🚨 {urgentCount} need attention</p>
            ) : (
              <p className="text-sm text-green-400">✅ All running smoothly</p>
            )}
            <p className="text-xs text-accent mt-1">Click to chat with agents ↗</p>
          </div>
        </div>
        
        {/* Quick Agent Status */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {subagents.slice(0, 7).map((agent) => (
            <div key={agent.id} className="p-2 rounded-lg bg-slate-900/50 border border-border/50">
              <div className="flex items-center gap-1.5 mb-1">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  agent.status === 'running' ? 'bg-green-500 animate-pulse' :
                  agent.status === 'completed' ? 'bg-blue-500' :
                  agent.status === 'failed' ? 'bg-red-500' :
                  'bg-gray-500'
                }`} />
                <span className="text-xs font-medium truncate">{agent.name}</span>
              </div>
              {agent.status === 'running' && agent.progress < 100 && (
                <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-1 rounded-full bg-accent"
                    style={{ width: `${agent.progress}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showChat && (
        <SubagentChat
          subagents={subagents}
          isOpen={showChat}
          onClose={() => setShowChat(false)}
        />
      )}
    </>
  );
}

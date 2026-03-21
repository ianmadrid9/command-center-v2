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

  return (
    <>
      <div
        onClick={() => setShowChat(true)}
        className="card p-4 w-full cursor-pointer hover:border-accent/50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted">Dev Agents</p>
            <p className="kpi">{total}</p>
            <p className="text-xs text-muted mt-0.5">
              {idle} idle, {running} running
            </p>
          </div>
          <div className="text-xl opacity-60">🤖</div>
        </div>
      </div>

      {showChat && (
        <SubagentChat
          subagents={subagents}
          onClose={() => setShowChat(false)}
        />
      )}
    </>
  );
}

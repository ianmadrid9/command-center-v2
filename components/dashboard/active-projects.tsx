'use client';

import type { Subagent } from '@/lib/mockData';
import { ProjectPreview } from './project-preview';

interface ActiveProjectsProps {
  subagents: Subagent[];
}

export function ActiveProjects({ subagents }: ActiveProjectsProps) {
  const projectSubagents = subagents.filter(s => s.projectType);
  const otherSubagents = subagents.filter(s => !s.projectType);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🚀</span>
          <h3 className="font-medium">Active Projects</h3>
        </div>
        <span className="text-xs text-muted">
          {projectSubagents.filter(s => s.status === 'running').length} building
        </span>
      </div>

      {/* Project Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {projectSubagents.map((agent) => (
          <ProjectPreview
            key={agent.id}
            name={agent.name.replace('landing-', '').replace('game-', '').replace('app-', '')}
            type={agent.projectType!}
            status={agent.status}
            progress={agent.progress}
            techStack={agent.techStack || []}
            features={agent.features || []}
            previewUrl={agent.previewUrl}
            repoUrl={agent.repoUrl}
            eta={agent.eta}
          />
        ))}
      </div>

      {/* Other Subagents (non-project tasks) */}
      {otherSubagents.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <h4 className="text-sm text-muted mb-2">Other Tasks</h4>
          <div className="space-y-2">
            {otherSubagents.map((agent) => (
              <div
                key={agent.id}
                className="p-3 rounded-xl bg-slate-900/50 border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      agent.status === 'running'
                        ? 'bg-green-500 animate-pulse'
                        : agent.status === 'completed'
                        ? 'bg-blue-500'
                        : agent.status === 'failed'
                        ? 'bg-red-500'
                        : 'bg-gray-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">{agent.name}</span>
                      {agent.eta && agent.eta !== '-' && (
                        <span className="text-xs text-muted">{agent.eta}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted mt-0.5 truncate">{agent.task}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

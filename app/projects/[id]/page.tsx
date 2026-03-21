'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChatPanel } from '@/components/chat-panel';

interface Project {
  id: string;
  name: string;
  description?: string;
  progress: number;
  status: string;
  owner?: string;
}

export default function ProjectPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    loadProject();
  }, [id]);

  async function loadProject() {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        const found = data.projects.find((p: Project) => p.id === id);
        setProject(found || null);
      }
    } catch (err) {
      console.error('Failed to load project:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Link href="/" className="text-sm text-muted hover:text-accent">← Back</Link>
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <Link href="/" className="text-sm text-muted hover:text-accent">← Back</Link>
        <div className="text-muted">Project not found</div>
      </div>
    );
  }

  const statusColor = {
    on_track: 'bg-green-500',
    at_risk: 'bg-amber-500',
    blocked: 'bg-red-500',
  }[project.status] || 'bg-gray-500';

  const progressColor = project.progress < 30 ? 'bg-red-500' : project.progress < 70 ? 'bg-amber-500' : 'bg-green-500';

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm text-muted hover:text-accent">← Back to Dashboard</Link>
          <button 
            onClick={() => setShowChat(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-slate-950 font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Chat
          </button>
        </div>

        {/* Project Details Card */}
        <div className="card p-6">
          <div className="flex items-start gap-3">
            <div className={`w-3 h-3 rounded-full mt-1 ${statusColor}`} />
            <div className="flex-1">
              <h1 className="text-2xl font-semibold">{project.name}</h1>
              {project.description && <p className="mt-2 text-muted">{project.description}</p>}
            </div>
          </div>

          {/* Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm text-muted mb-2">
              <span>Progress</span>
              <span className="text-white">{project.progress}%</span>
            </div>
            <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
              <div className={`h-3 rounded-full transition-all ${progressColor}`} style={{ width: `${project.progress}%` }} />
            </div>
          </div>

          {/* Meta */}
          <div className="mt-6 flex items-center gap-4 text-sm text-muted">
            <div className="flex items-center gap-2">
              <span className="text-muted">Status:</span>
              <span className={`px-2 py-0.5 rounded-lg text-xs ${
                project.status === 'on_track' ? 'bg-green-500/20 text-green-400' :
                project.status === 'at_risk' ? 'bg-amber-500/20 text-amber-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {project.status.replace('_', ' ')}
              </span>
            </div>
            {project.owner && (
              <>
                <span>·</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted">Owner:</span>
                  <span className="text-white">{project.owner}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-2">
          <button 
            onClick={() => setShowChat(true)}
            className="card p-4 text-left hover:border-accent/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <div className="font-medium">Chat about this project</div>
                <div className="text-xs text-muted">View conversation history</div>
              </div>
            </div>
          </button>

          <button className="card p-4 text-left hover:border-accent/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <div className="font-medium">Update progress</div>
                <div className="text-xs text-muted">Coming soon</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {showChat && (
        <ChatPanel 
          projectId={project.id} 
          projectName={project.name}
          onClose={() => setShowChat(false)} 
        />
      )}
    </>
  );
}

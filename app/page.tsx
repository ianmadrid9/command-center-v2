'use client';

import { useEffect, useState } from 'react';
import { ProjectCard, CreateCard } from '@/components/project-card';
import { ChatPanel } from '@/components/chat-panel';

interface Project {
  id: string;
  name: string;
  description?: string;
  progress: number;
  status: string;
  owner?: string;
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  }

  async function createProject(e?: React.FormEvent) {
    e?.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProjectName.trim(),
          description: newProjectDesc.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProjects(prev => [data.project, ...prev]);
        setNewProjectName('');
        setNewProjectDesc('');
        setShowCreate(false);
        setSelectedProject(data.project);
      }
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Command Center</h1>
          <p className="mt-1 text-sm text-muted">Your projects. Your conversations. Your progress.</p>
        </div>

        <div>
          <h2 className="text-lg font-medium mb-3">Projects</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="text-muted text-sm">Loading projects...</div>
            ) : (
              projects.map((project) => (
                <ProjectCard key={project.id} {...project} onClick={() => setSelectedProject(project)} />
              ))
            )}
            {showCreate ? (
              <form onSubmit={createProject} className="card p-5 flex flex-col gap-3 min-h-[160px]">
                <input
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Project name"
                  className="rounded-xl border border-border bg-slate-900 px-3 py-2 text-sm outline-none focus:border-accent"
                  autoFocus
                />
                <input
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="Description (optional)"
                  className="rounded-xl border border-border bg-slate-900 px-3 py-2 text-sm outline-none focus:border-accent"
                />
                <div className="flex gap-2 mt-auto">
                  <button type="submit" className="flex-1 rounded-xl bg-accent text-slate-950 font-medium text-sm py-2">
                    Create
                  </button>
                  <button type="button" onClick={() => setShowCreate(false)} className="rounded-xl border border-border px-3 py-2 text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <CreateCard onClick={() => setShowCreate(true)} label="New Project" />
            )}
          </div>
        </div>
      </div>

      {selectedProject && (
        <ChatPanel projectId={selectedProject.id} projectName={selectedProject.name} onClose={() => setSelectedProject(null)} />
      )}
    </>
  );
}

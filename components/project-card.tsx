'use client';

interface ProjectCardProps {
  id: string;
  name: string;
  description?: string;
  progress: number;
  status: string;
  owner?: string;
  onClick: () => void;
}

export function ProjectCard({ id, name, description, progress, status, owner, onClick }: ProjectCardProps) {
  const statusColor: Record<string, string> = {
    on_track: 'bg-green-500',
    at_risk: 'bg-amber-500',
    blocked: 'bg-red-500',
  };

  const progressColor = progress < 30 ? 'bg-red-500' : progress < 70 ? 'bg-amber-500' : 'bg-green-500';

  return (
    <button 
      onClick={onClick}
      className="group card p-5 text-left transition-all hover:border-accent/50 hover:bg-panel cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${statusColor[status] || 'bg-gray-500'}`} />
            <h3 className="font-medium truncate">{name}</h3>
          </div>
          {description && <p className="mt-1 text-sm text-muted truncate">{description}</p>}
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-slate-800 rounded-lg">
          <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-muted mb-1">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
          <div className={`h-2 rounded-full transition-all ${progressColor}`} style={{ width: `${progress}%` }} />
        </div>
      </div>

      {owner && <div className="mt-3 text-xs text-muted">Owner: {owner}</div>}
    </button>
  );
}

export function CreateCard({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className="card p-5 flex flex-col items-center justify-center gap-3 text-muted hover:border-accent hover:text-accent transition-colors min-h-[160px]">
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

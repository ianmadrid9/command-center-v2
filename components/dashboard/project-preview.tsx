'use client';

interface ProjectPreviewProps {
  name: string;
  type: 'landing' | 'app' | 'game';
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
  techStack: string[];
  features: string[];
  previewUrl?: string;
  repoUrl?: string;
  eta?: string;
}

export function ProjectPreview({
  name,
  type,
  status,
  progress,
  techStack,
  features,
  previewUrl,
  repoUrl,
  eta,
}: ProjectPreviewProps) {
  const statusColors = {
    idle: 'bg-gray-500',
    running: 'bg-green-500 animate-pulse',
    completed: 'bg-blue-500',
    failed: 'bg-red-500',
  };

  const typeIcons = {
    landing: '🌐',
    app: '📱',
    game: '🎮',
  };

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{typeIcons[type]}</span>
          <div>
            <h4 className="font-medium">{name}</h4>
            <p className="text-xs text-muted capitalize">{type} page</p>
          </div>
        </div>
        <div className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
      </div>

      {/* Progress */}
      {status === 'running' && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-muted mb-1">
            <span>Building</span>
            <span>{eta ? `${eta} remaining` : '...'}</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-1.5 rounded-full bg-accent transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {status === 'completed' && (
        <div className="mb-3">
          <div className="text-xs text-green-400 mb-1">✓ Build complete</div>
          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-1.5 rounded-full bg-green-500" style={{ width: '100%' }} />
          </div>
        </div>
      )}

      {/* Tech Stack */}
      <div className="mb-3">
        <p className="text-xs text-muted mb-1">Tech Stack</p>
        <div className="flex flex-wrap gap-1">
          {techStack.map((tech) => (
            <span
              key={tech}
              className="text-xs px-2 py-0.5 rounded bg-slate-800 text-muted"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="mb-3">
        <p className="text-xs text-muted mb-1">Features</p>
        <ul className="text-xs space-y-0.5">
          {features.map((feature, i) => (
            <li key={i} className="text-muted flex items-center gap-1">
              <span className="text-green-400">•</span>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-border/50">
        {previewUrl && status === 'completed' && (
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center text-xs bg-accent text-slate-950 py-1.5 rounded-lg hover:bg-accent/90 transition-colors font-medium"
          >
            Preview ↗
          </a>
        )}
        {repoUrl && (
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center text-xs bg-slate-800 py-1.5 rounded-lg hover:bg-slate-700 transition-colors"
          >
            Repo ↗
          </a>
        )}
        {status === 'running' && (
          <button className="flex-1 text-xs bg-slate-800 py-1.5 rounded-lg hover:bg-slate-700 transition-colors">
            View Logs
          </button>
        )}
      </div>
    </div>
  );
}

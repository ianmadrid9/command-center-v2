'use client';

import { useState } from 'react';

interface InstructionsModalProps {
  sectionName: string;
  instructions: Array<{
    id: string;
    priority: string;
    message: string;
  }>;
  lastFollowed?: string;
  lastRead?: string;
  trigger?: React.ReactNode;
}

export function InstructionsModal({ sectionName, instructions, lastFollowed, trigger }: InstructionsModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const priorityColors: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    low: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  const priorityIcons: Record<string, string> = {
    critical: '🔴',
    high: '🟠',
    medium: '🔵',
    low: '⚪',
  };

  const sortedInstructions = [...instructions].sort((a, b) => {
    const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return (order[a.priority] || 3) - (order[b.priority] || 3);
  });

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>{trigger}</div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="text-xs text-muted hover:text-accent transition-colors flex items-center gap-1"
          title="View section instructions"
        >
          📋 Instructions
        </button>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="card w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-xl">📋</span>
                <h3 className="font-medium">Section Instructions: {sectionName}</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted hover:text-foreground transition-colors text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5">
              {instructions.length === 0 ? (
                <p className="text-center text-muted py-8">No instructions defined</p>
              ) : (
                <div className="space-y-3">
                  {(['critical', 'high', 'medium', 'low']).map((priority) => {
                    const priorityInstructions = sortedInstructions.filter(i => i.priority === priority);
                    if (priorityInstructions.length === 0) return null;
                    
                    return (
                      <div key={priority} className="space-y-2">
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-muted flex items-center gap-2">
                          {priorityIcons[priority]} {priority} Priority
                          <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full">
                            {priorityInstructions.length}
                          </span>
                        </h4>
                        {priorityInstructions.map((instruction) => (
                          <div
                            key={instruction.id}
                            className={`p-3 rounded-lg border ${priorityColors[priority] || priorityColors.low}`}
                          >
                            <div className="flex items-start gap-2">
                              <span className="text-xs font-mono opacity-50 mt-0.5">
                                [{instruction.id}]
                              </span>
                              <p className="text-sm leading-relaxed">{instruction.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="p-5 border-t border-border bg-slate-900/50">
              <p className="text-xs text-muted text-center">
                I read these instructions before working on this section to ensure I follow the correct workflow.
              </p>
              <div className="mt-2 space-y-1 text-[10px] text-muted text-center flex flex-col items-center gap-1">
                {lastRead && (
                  <p className="flex items-center gap-1">
                    📖 Last read: {new Date(lastRead).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </p>
                )}
                {lastFollowed && (
                  <p className="flex items-center gap-1">
                    ✅ Last followed: {new Date(lastFollowed).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </p>
                )}
              </div>
              {!lastRead && !lastFollowed && (
                <p className="text-[10px] text-muted text-center mt-2">
                  ⚠️ No activity recorded yet
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

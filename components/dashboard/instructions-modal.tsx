'use client';

import { useState } from 'react';

interface Instruction {
  id: string;
  timestamp: string;
  type: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  message: string;
}

interface InstructionsModalProps {
  sectionName: string;
  instructions: Instruction[];
  trigger?: React.ReactNode;
}

export function InstructionsModal({ sectionName, instructions, trigger }: InstructionsModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const priorityColors = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    low: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  const priorityIcons = {
    critical: '🔴',
    high: '🟠',
    medium: '🔵',
    low: '⚪',
  };

  const sortedInstructions = [...instructions].sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <>
      {/* Trigger Button */}
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

      {/* Modal */}
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
                <p className="text-center text-muted py-8">No instructions defined for this section</p>
              ) : (
                <div className="space-y-3">
                  {/* Group by priority */}
                  {(['critical', 'high', 'medium', 'low'] as const).map((priority) => {
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
                            className={`p-3 rounded-lg border ${priorityColors[priority]}`}
                          >
                            <div className="flex items-start gap-2">
                              <span className="text-xs font-mono opacity-50 mt-0.5">
                                [{instruction.id}]
                              </span>
                              <p className="text-sm leading-relaxed">{instruction.message}</p>
                            </div>
                            {instruction.type !== 'prompt' && (
                              <p className="text-xs mt-2 opacity-70">
                                Type: {instruction.type}
                              </p>
                            )}
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
                These instructions guide how I work on this section. I read them before taking any action.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

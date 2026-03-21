'use client';

import { QuickAction } from '@/lib/mockData';

interface QuickActionsProps {
  actions: QuickAction[];
  onAction?: (action: string) => void;
}

export function QuickActions({ actions, onAction }: QuickActionsProps) {
  const variantStyles = {
    default: 'bg-slate-800 hover:bg-slate-700 text-foreground',
    primary: 'bg-accent hover:bg-accent/90 text-slate-950',
    danger: 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30',
  };

  return (
    <div className="card p-5 w-full">
      <h3 className="font-medium mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onAction?.(action.action)}
            className={`${variantStyles[action.variant]} rounded-xl px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2`}
          >
            <span>{action.icon}</span>
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

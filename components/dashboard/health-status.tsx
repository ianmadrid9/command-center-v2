'use client';

import type { SystemHealth } from '@/lib/mockData';

interface HealthStatusProps {
  health: SystemHealth;
}

export function HealthStatus({ health }: HealthStatusProps) {
  const statusColors = {
    healthy: 'text-green-400',
    warning: 'text-amber-400',
    critical: 'text-red-400',
  };

  const getBarColor = (value: number) => {
    if (value < 50) return 'bg-green-500';
    if (value < 75) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">System Health</h3>
        <span className={`text-xs ${statusColors[health.status]}`}>
          ● {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
        </span>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted">CPU</span>
            <span>{health.cpu}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
            <div 
              className={`h-2 rounded-full transition-all ${getBarColor(health.cpu)}`} 
              style={{ width: `${health.cpu}%` }} 
            />
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted">Memory</span>
            <span>{health.memory}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
            <div 
              className={`h-2 rounded-full transition-all ${getBarColor(health.memory)}`} 
              style={{ width: `${health.memory}%` }} 
            />
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted">Disk</span>
            <span>{health.disk}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
            <div 
              className={`h-2 rounded-full transition-all ${getBarColor(health.disk)}`} 
              style={{ width: `${health.disk}%` }} 
            />
          </div>
        </div>
        
        <div className="pt-2 text-xs text-muted">
          Uptime: {health.uptime}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { SystemHealth } from '@/lib/mockData';

interface SystemCapacityProps {
  health: SystemHealth;
  currentAgents: number;
}

export function SystemCapacity({ health, currentAgents }: SystemCapacityProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  // Calculate available capacity
  const cpuAvailable = 100 - health.cpu;
  const memoryAvailable = 100 - health.memory;
  
  // Estimate: each subagent uses ~5% CPU, ~8% memory
  const cpuHeadroom = Math.floor(cpuAvailable / 5);
  const memoryHeadroom = Math.floor(memoryAvailable / 8);
  const maxAdditionalAgents = Math.min(cpuHeadroom, memoryHeadroom);
  
  // Calculate utilization
  const totalCapacity = currentAgents + maxAdditionalAgents;
  const utilizationPercent = Math.round((currentAgents / totalCapacity) * 100);
  
  // Concurrency recommendations per hour
  const getConcurrencyPlan = () => {
    if (utilizationPercent < 40) {
      return {
        urgency: 'high',
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        current: currentAgents,
        targetNow: currentAgents + Math.min(5, maxAdditionalAgents),
        targetThisHour: Math.ceil(totalCapacity * 0.7),
        maxConcurrent: totalCapacity,
        actions: [
          `Launch ${Math.min(3, maxAdditionalAgents)} agents NOW`,
          `Add ${Math.min(5, maxAdditionalAgents)} more within 30 min`,
          `Target ${Math.ceil(totalCapacity * 0.7)} concurrent this hour`,
        ],
      };
    }
    if (utilizationPercent < 60) {
      return {
        urgency: 'medium',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        current: currentAgents,
        targetNow: currentAgents + Math.min(3, maxAdditionalAgents),
        targetThisHour: Math.ceil(totalCapacity * 0.75),
        maxConcurrent: totalCapacity,
        actions: [
          `Add ${Math.min(2, maxAdditionalAgents)} agents now`,
          `Scale to ${Math.ceil(totalCapacity * 0.75)} concurrent this hour`,
          `Max capacity: ${totalCapacity} concurrent agents`,
        ],
      };
    }
    if (utilizationPercent < 85) {
      return {
        urgency: 'low',
        color: 'text-green-400',
        bg: 'bg-green-500/10',
        border: 'border-green-500/30',
        current: currentAgents,
        targetNow: currentAgents,
        targetThisHour: currentAgents + Math.floor(maxAdditionalAgents / 2),
        maxConcurrent: totalCapacity,
        actions: [
          `Maintain ${currentAgents} concurrent agents`,
          `Can add ${Math.floor(maxAdditionalAgents / 2)} more if needed`,
          `Optimal range: 60-80% utilization`,
        ],
      };
    }
    return {
      urgency: 'critical',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
      current: currentAgents,
      targetNow: currentAgents,
      targetThisHour: currentAgents,
      maxConcurrent: totalCapacity,
      actions: [
        `Hold at ${currentAgents} concurrent agents`,
        `Do NOT add more agents this hour`,
        `Consider optimizing existing agents`,
      ],
    };
  };
  
  const plan = getConcurrencyPlan();
  
  // Get status label
  const getStatus = () => {
    if (utilizationPercent < 40) {
      return {
        label: 'Critical: Under-utilized',
        icon: '🔴',
        message: `Only ${utilizationPercent}% utilized. Can run ${maxAdditionalAgents} more agents concurrently.`,
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
      };
    }
    if (utilizationPercent < 60) {
      return {
        label: 'Under-utilized',
        icon: '🟠',
        message: `At ${utilizationPercent}% capacity. Can add ${maxAdditionalAgents} more agents.`,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
      };
    }
    if (utilizationPercent < 85) {
      return {
        label: 'Optimal',
        icon: '🟢',
        message: `Great! At ${utilizationPercent}% capacity. Well-utilized for this hour.`,
        color: 'text-green-400',
        bg: 'bg-green-500/10',
        border: 'border-green-500/30',
      };
    }
    return {
      label: 'Near Capacity',
      icon: '🟣',
      message: `At ${utilizationPercent}% capacity. Running hot this hour.`,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
    };
  };
  
  const status = getStatus();

  return (
    <div className="card p-5 w-full">
      {/* Header */}
      <div 
        className="flex items-center justify-between mb-4 cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-3">
          <h3 className="font-medium">System Capacity</h3>
          <span className="text-xs transition-transform">
            {isCollapsed ? '▶' : '▼'}
          </span>
        </div>
        <div className={`text-xs px-3 py-1.5 rounded-full ${status.bg.replace('/10', '/20')} ${status.color} border ${status.border}`}>
          {status.icon} {status.label}
        </div>
      </div>

      {/* Collapsed - Simple Hourly View */}
      {isCollapsed && (
        <div className="space-y-3">
          {/* Main Status */}
          <div className={`p-3 rounded-xl border ${status.bg} ${status.border}`}>
            <p className={`text-sm ${status.color}`}>{status.message}</p>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-slate-900/50">
              <p className="text-xs text-muted">Running</p>
              <p className="text-lg font-semibold">{currentAgents}</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/50">
              <p className="text-xs text-muted">Available</p>
              <p className="text-lg font-semibold text-accent">+{maxAdditionalAgents}</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/50">
              <p className="text-xs text-muted">Utilization</p>
              <p className={`text-lg font-semibold ${
                utilizationPercent < 40 ? 'text-red-400' : 
                utilizationPercent < 60 ? 'text-amber-400' :
                utilizationPercent < 85 ? 'text-green-400' : 'text-purple-400'
              }`}>{utilizationPercent}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Expanded - Full Concurrency Plan */}
      {!isCollapsed && (
        <>
          {/* Main Status - Big & Clear */}
          <div className={`p-4 rounded-xl border-2 ${status.bg.replace('/10', '/20')} ${status.border} mb-4`}>
            <div className="flex items-start gap-3">
              <span className="text-3xl">{status.icon}</span>
              <div>
                <h4 className={`text-lg font-semibold ${status.color} mb-1`}>
                  {status.label}
                </h4>
                <p className="text-sm text-muted">{status.message}</p>
              </div>
            </div>
          </div>

          {/* Utilization Meter */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted">Current Hour Utilization</span>
              <span className={`font-bold ${
                utilizationPercent < 40 ? 'text-red-400' : 
                utilizationPercent < 60 ? 'text-amber-400' :
                utilizationPercent < 85 ? 'text-green-400' : 'text-purple-400'
              }`}>{utilizationPercent}%</span>
            </div>
            <div className="h-4 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-4 rounded-full transition-all ${
                  utilizationPercent < 40 ? 'bg-red-500' : 
                  utilizationPercent < 60 ? 'bg-amber-500' :
                  utilizationPercent < 85 ? 'bg-green-500' : 'bg-purple-500'
                }`}
                style={{ width: `${utilizationPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-muted">
              <span>0%</span>
              <span className={utilizationPercent < 60 ? 'text-amber-400' : 'text-muted'}>
                {utilizationPercent < 60 ? '← Under-utilized' : '60% optimal'}
              </span>
              <span className={utilizationPercent >= 85 ? 'text-purple-400' : 'text-muted'}>
                {utilizationPercent >= 85 ? 'Near capacity →' : '85% max'}
              </span>
              <span>100%</span>
            </div>
          </div>

          {/* Concurrency Plan */}
          <div className={`p-4 rounded-xl border-2 ${plan.bg} ${plan.border} mb-4`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🎯</span>
              <h4 className={`text-sm font-semibold ${plan.color}`}>
                Concurrency Plan for This Hour
              </h4>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-slate-900/50 text-center">
                <p className="text-xs text-muted mb-1">Current</p>
                <p className="text-2xl font-bold">{plan.current}</p>
                <p className="text-xs text-muted">concurrent</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/50 text-center">
                <p className="text-xs text-muted mb-1">Target Now</p>
                <p className="text-2xl font-bold text-accent">{plan.targetNow}</p>
                <p className="text-xs text-muted">concurrent</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/50 text-center">
                <p className="text-xs text-muted mb-1">Target This Hour</p>
                <p className="text-2xl font-bold text-green-400">{plan.targetThisHour}</p>
                <p className="text-xs text-muted">concurrent</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted font-medium mb-2">Action Steps:</p>
              {plan.actions.map((action, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className={`font-bold ${plan.color} mt-0.5`}>{i + 1}.</span>
                  <span className="text-foreground">{action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Max Capacity Info */}
          <div className="p-3 rounded-xl bg-slate-900/50 border border-border/50 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">Maximum Concurrent Capacity</h4>
              <span className="text-lg font-bold text-accent">{plan.maxConcurrent} agents</span>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted">CPU Headroom</span>
                  <span className={cpuAvailable > 50 ? 'text-amber-400' : 'text-green-400'}>
                    {cpuAvailable}% free → {cpuHeadroom} agents
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${
                      cpuAvailable > 50 ? 'bg-amber-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${cpuAvailable}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted">Memory Headroom</span>
                  <span className={memoryAvailable > 50 ? 'text-amber-400' : 'text-green-400'}>
                    {memoryAvailable}% free → {memoryHeadroom} agents
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${
                      memoryAvailable > 50 ? 'bg-amber-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${memoryAvailable}%` }}
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-muted mt-3">
              💡 Each agent uses ~5% CPU, ~8% memory. Bottleneck: {cpuHeadroom < memoryHeadroom ? 'CPU' : 'Memory'}
            </p>
          </div>

          {/* Hourly Scaling Recommendation */}
          <div className={`p-4 rounded-xl ${
            plan.urgency === 'high' || plan.urgency === 'critical'
              ? 'bg-red-500/10 border border-red-500/30'
              : plan.urgency === 'medium'
              ? 'bg-amber-500/10 border border-amber-500/30'
              : 'bg-green-500/10 border border-green-500/30'
          }`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">
                {plan.urgency === 'high' || plan.urgency === 'critical' ? '🚨' : 
                 plan.urgency === 'medium' ? '⚠️' : '✅'}
              </span>
              <div>
                <h4 className={`text-sm font-semibold mb-1 ${
                  plan.urgency === 'high' || plan.urgency === 'critical' ? 'text-red-200' : 
                  plan.urgency === 'medium' ? 'text-amber-200' : 'text-green-200'
                }`}>
                  {plan.urgency === 'high' || plan.urgency === 'critical' ? 'Immediate Action Required' : 
                   plan.urgency === 'medium' ? 'Scale Up Recommended' : 'Optimal Performance'}
                </h4>
                <p className={`text-xs ${
                  plan.urgency === 'high' || plan.urgency === 'critical' ? 'text-red-100/80' : 
                  plan.urgency === 'medium' ? 'text-amber-100/80' : 'text-green-100/80'
                }`}>
                  {plan.urgency === 'high' || plan.urgency === 'critical' 
                    ? `You're wasting ${100 - utilizationPercent}% of available capacity. Launch agents immediately to maximize this hour.`
                    : plan.urgency === 'medium'
                    ? `Good headroom available. Add ${maxAdditionalAgents} agents to reach optimal 70-80% utilization.`
                    : 'System is well-utilized. Maintain current concurrency or add gradually.'}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { mockLifeGoals, mockLifeGoalSubagents, getGoalById, getSubagentByGoal } from '@/lib/mockData';

interface LifeGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'agent' | 'assistant';
  sender?: string;
  text: string;
  timestamp: string;
}

export function LifeGoalsModal({ isOpen, onClose }: LifeGoalsModalProps) {
  const [selectedGoalId, setSelectedGoalId] = useState<string>(mockLifeGoals[0]?.id || '');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedGoal = getGoalById(selectedGoalId);
  const subagent = selectedGoal ? getSubagentByGoal(selectedGoalId) : null;

  // Initialize messages when goal changes
  useEffect(() => {
    if (selectedGoal && subagent) {
      setMessages([
        {
          id: '1',
          type: 'assistant',
          sender: 'Rook (Assistant)',
          text: `I'm here to help you achieve "${selectedGoal.name}". Your subagent ${subagent.name} is also here!`,
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'agent',
          sender: subagent.name,
          text: `Hey! I'm tracking your ${selectedGoal.name} goal. Next milestone: ${selectedGoal.nextMilestone} (${selectedGoal.nextMilestoneDate}). What do you need?`,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [selectedGoal, subagent]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim() || !selectedGoal) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsAgentTyping(true);

    // Agent responds
    setTimeout(() => {
      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        sender: subagent?.name || 'advisor',
        text: `Got it! I'll help you with "${input}". Let me update your plan and get back to you.`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, agentMsg]);
      setIsAgentTyping(false);

      // Rook chimes in
      setTimeout(() => {
        const assistantMsg: Message = {
          id: (Date.now() + 2).toString(),
          type: 'assistant',
          sender: 'Rook (Assistant)',
          text: `I'm tracking this task. Let me know if you need anything else for your ${selectedGoal.name} goal!`,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, assistantMsg]);
      }, 800);
    }, 1000);
  }

  function formatTime(timestamp: string) {
    const d = new Date(timestamp);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  function getStatusColor(status: string) {
    const colors: Record<string, string> = {
      'on-track': 'text-green-400 bg-green-500/10 border-green-500/30',
      'needs-attention': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      'at-risk': 'text-red-400 bg-red-500/10 border-red-500/30',
      'completed': 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    };
    return colors[status] || colors['on-track'];
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="card w-full max-w-4xl max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-border">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="text-muted hover:text-foreground transition-colors text-lg"
            >
              ← Back
            </button>
            <div>
              <h3 className="text-lg font-semibold">Life Goals</h3>
              <p className="text-xs text-muted">
                {mockLifeGoals.filter(g => g.status === 'on-track').length} on track • {mockLifeGoals.filter(g => g.status === 'needs-attention').length} need attention
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground transition-colors text-3xl p-3 -mr-3 -mt-3 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Goal Tabs */}
        <div className="flex gap-2 p-3 border-b border-border overflow-x-auto">
          {mockLifeGoals.map((goal) => (
            <button
              key={goal.id}
              onClick={() => setSelectedGoalId(goal.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedGoalId === goal.id
                  ? 'bg-accent text-slate-950'
                  : 'bg-slate-800 text-muted hover:text-foreground'
              }`}
            >
              {goal.icon} {goal.name}
            </button>
          ))}
        </div>

        {/* Goal Details & Chat */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Goal Info */}
          <div className="w-1/3 border-r border-border p-4 overflow-y-auto">
            {selectedGoal && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-3xl">{selectedGoal.icon}</span>
                  <div>
                    <h4 className="font-semibold">{selectedGoal.name}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(selectedGoal.status)}`}>
                      {selectedGoal.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted">Progress</span>
                    <span className="text-accent">{selectedGoal.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-accent"
                      style={{ width: `${selectedGoal.progress}%` }}
                    />
                  </div>
                </div>

                {/* Deadline */}
                <div className="mb-4 p-3 rounded-lg bg-slate-900/50">
                  <p className="text-xs text-muted mb-1">Deadline</p>
                  <p className="text-sm font-medium">{new Date(selectedGoal.deadline).toLocaleDateString()}</p>
                </div>

                {/* Next Milestone */}
                <div className="mb-4 p-3 rounded-lg bg-accent/10 border border-accent/30">
                  <p className="text-xs text-accent mb-1">Next Milestone</p>
                  <p className="text-sm font-medium">{selectedGoal.nextMilestone}</p>
                  <p className="text-xs text-muted">{new Date(selectedGoal.nextMilestoneDate).toLocaleDateString()}</p>
                </div>

                {/* Tasks */}
                <div>
                  <p className="text-xs text-muted font-medium mb-2">Tasks</p>
                  <div className="space-y-2">
                    {selectedGoal.tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-2 rounded-lg text-xs ${
                          task.urgent ? 'bg-red-500/10 border border-red-500/30' : 'bg-slate-900/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={task.status === 'completed' ? 'text-green-400 line-through' : ''}>
                            {task.title}
                          </span>
                          {task.urgent && <span>🚨</span>}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          <span className={`text-xs ${
                            task.status === 'completed' ? 'text-green-400' :
                            task.status === 'in-progress' ? 'text-accent' : 'text-muted'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right: Chat */}
          <div className="w-2/3 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="max-w-[80%]">
                    {msg.type !== 'user' && (
                      <p className="text-xs text-muted mb-1">{msg.sender}</p>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        msg.type === 'user'
                          ? 'bg-accent text-slate-950'
                          : msg.type === 'assistant'
                          ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30'
                          : 'bg-slate-800 text-foreground'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-xs mt-1 ${
                        msg.type === 'user' ? 'text-slate-700' : 'text-muted'
                      }`}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {isAgentTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 rounded-2xl px-4 py-3">
                    <span className="animate-pulse">typing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-border">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Message about ${selectedGoal?.name || 'your goal'}...`}
                  className="flex-1 rounded-xl border border-border bg-slate-900 px-4 py-2 text-sm outline-none focus:border-accent"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="px-4 py-2 rounded-xl bg-accent text-slate-950 font-medium text-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

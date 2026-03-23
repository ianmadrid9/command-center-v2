'use client';

import { useState, useRef, useEffect } from 'react';
import { Subagent } from '@/lib/mockData';
import { sendAgentMessage } from '@/lib/api';

interface SubagentChatProps {
  subagents: Subagent[];
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

export function SubagentChat({ subagents, isOpen, onClose }: SubagentChatProps) {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(
    subagents.find(s => s.status === 'running')?.id || subagents[0]?.id || ''
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedAgent = subagents.find(a => a.id === selectedAgentId) || null;

  // Initialize messages when agent changes
  useEffect(() => {
    if (selectedAgent) {
      setMessages([
        {
          id: '1',
          type: 'assistant',
          sender: 'Rook (Assistant)',
          text: `I'm here with ${selectedAgent.name}. ${selectedAgent.status === 'running' ? 'Currently working on:' : 'Ready for:'} ${selectedAgent.task}`,
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'agent',
          sender: selectedAgent.name,
          text: `Hey! I'm ${selectedAgent.name}. What do you need help with?`,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [selectedAgent]);

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

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim() || !selectedAgent) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsAgentTyping(true);

    try {
      // Send message to agent API
      const result = await sendAgentMessage(selectedAgent.id, input);
      
      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        sender: selectedAgent.name,
        text: result.response,
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
          text: `I'm tracking this. Let me know if you need anything else!`,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, assistantMsg]);
      }, 800);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        sender: selectedAgent.name,
        text: `Sorry, I encountered an error. Please try again.`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
      setIsAgentTyping(false);
    }
  }

  function formatTime(timestamp: string) {
    const d = new Date(timestamp);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  function getStatusColor(status: string) {
    const colors: Record<string, string> = {
      'running': 'text-green-400 bg-green-500/10 border-green-500/30',
      'completed': 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      'failed': 'text-red-400 bg-red-500/10 border-red-500/30',
      'idle': 'text-gray-400 bg-gray-500/10 border-gray-500/30',
    };
    return colors[status] || colors['idle'];
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="card w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="text-muted hover:text-foreground transition-colors text-lg"
            >
              ← Back
            </button>
            <div>
              <h3 className="text-lg font-semibold">Dev Agents</h3>
              <p className="text-xs text-muted">
                {subagents.filter(s => s.status === 'running').length} running • {subagents.filter(s => s.status === 'idle').length} idle
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

        {/* Agent Tabs */}
        <div className="flex gap-2 p-3 border-b border-border overflow-x-auto flex-shrink-0">
          {subagents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgentId(agent.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedAgentId === agent.id
                  ? 'bg-accent text-slate-950'
                  : 'bg-slate-800 text-muted hover:text-foreground'
              }`}
            >
              {agent.status === 'running' ? '🟢' : '⏸️'} {agent.name}
            </button>
          ))}
        </div>

        {/* Agent Details & Chat */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Left: Agent Info */}
          <div className="w-1/3 border-r border-border p-4 overflow-y-auto">
            {selectedAgent && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-3 h-3 rounded-full ${
                    selectedAgent.status === 'running' ? 'bg-green-500 animate-pulse' :
                    selectedAgent.status === 'completed' ? 'bg-blue-500' :
                    selectedAgent.status === 'failed' ? 'bg-red-500' :
                    'bg-gray-500'
                  }`} />
                  <span className="text-sm font-medium">{selectedAgent.name}</span>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs text-muted mb-1">Task</p>
                    <p className="text-foreground">{selectedAgent.task}</p>
                  </div>

                  {selectedAgent.techStack && selectedAgent.techStack.length > 0 && (
                    <div>
                      <p className="text-xs text-muted mb-1">Tech Stack</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedAgent.techStack.map((tech, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-xs">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedAgent.features && selectedAgent.features.length > 0 && (
                    <div>
                      <p className="text-xs text-muted mb-1">Features</p>
                      <ul className="space-y-0.5">
                        {selectedAgent.features.map((feature, i) => (
                          <li key={i} className="text-foreground text-xs">• {feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedAgent.status === 'running' && (
                    <>
                      <div>
                        <p className="text-xs text-muted mb-1">Progress</p>
                        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-2 rounded-full bg-accent"
                            style={{ width: `${selectedAgent.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted mt-1">{selectedAgent.progress}% complete</p>
                      </div>

                      {selectedAgent.eta && (
                        <div>
                          <p className="text-xs text-muted mb-1">ETA</p>
                          <p className="text-foreground">{selectedAgent.eta}</p>
                        </div>
                      )}
                    </>
                  )}

                  {selectedAgent.previewUrl && (
                    <div>
                      <p className="text-xs text-muted mb-1">Preview</p>
                      <a
                        href={selectedAgent.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline text-xs"
                      >
                        {selectedAgent.previewUrl}
                      </a>
                    </div>
                  )}

                  {selectedAgent.repoUrl && (
                    <div>
                      <p className="text-xs text-muted mb-1">Repository</p>
                      <a
                        href={selectedAgent.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline text-xs"
                      >
                        {selectedAgent.repoUrl}
                      </a>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right: Chat */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      msg.type === 'user'
                        ? 'bg-accent text-slate-950 rounded-br-md'
                        : msg.type === 'assistant'
                        ? 'bg-purple-500/20 border border-purple-500/30 text-purple-100 rounded-bl-md'
                        : 'bg-slate-800 text-foreground rounded-bl-md'
                    }`}
                  >
                    {msg.sender && msg.type !== 'user' && (
                      <p className="text-xs font-medium mb-0.5 opacity-70">{msg.sender}</p>
                    )}
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-xs opacity-50 mt-1">{formatTime(msg.timestamp)}</p>
                  </div>
                </div>
              ))}
              
              {isAgentTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 rounded-2xl rounded-bl-md px-4 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-border flex-shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-900 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-accent/50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isAgentTyping}
                  className="px-4 py-2 bg-accent text-slate-950 rounded-lg text-sm font-medium hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

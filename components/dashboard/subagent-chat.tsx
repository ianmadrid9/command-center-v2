'use client';

import { useState, useRef, useEffect } from 'react';
import { Subagent } from '@/lib/mockData';

interface SubagentChatProps {
  subagents: Subagent[];
  onClose: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'agent' | 'assistant';
  sender?: string;
  senderIcon?: string;
  text: string;
  image?: string;
  timestamp: string;
}

export function SubagentChat({ subagents, onClose }: SubagentChatProps) {
  const [selectedAgent, setSelectedAgent] = useState<Subagent | null>(
    subagents.find(s => s.status === 'running') || subagents[0]
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Separate chat history for each agent - but Rook is in ALL chats
  const [agentChats, setAgentChats] = useState<Record<string, Message[]>>(() => {
    const initial: Record<string, Message[]> = {};
    subagents.forEach(agent => {
      initial[agent.id] = [
        {
          id: `${agent.id}-intro`,
          type: 'assistant',
          sender: 'Rook (Assistant)',
          senderIcon: '🦅',
          text: `I'm here with ${agent.name}. ${agent.status === 'running' ? 'Currently:' : 'Ready for:'} ${agent.task}`,
          timestamp: new Date().toISOString(),
        },
        {
          id: `${agent.id}-intro2`,
          type: 'agent',
          sender: agent.name,
          senderIcon: agent.status === 'running' ? '🟢' : '⏸️',
          text: `Hey! I'm ${agent.name}. What do you need help with?`,
          timestamp: new Date().toISOString(),
        },
      ];
    });
    return initial;
  });

  const messages = selectedAgent ? agentChats[selectedAgent.id] || [] : [];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedAgent]);

  // Auto-scroll tabs to show selected agent
  useEffect(() => {
    const selectedIndex = subagents.findIndex(a => a.id === selectedAgent?.id);
    const selectedTab = tabRefs.current[selectedIndex];
    if (selectedTab && tabsContainerRef.current) {
      selectedTab.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start',
      });
    }
  }, [selectedAgent, subagents]);

  function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim() || !selectedAgent) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: input,
      timestamp: new Date().toISOString(),
    };

    setAgentChats(prev => ({
      ...prev,
      [selectedAgent.id]: [...(prev[selectedAgent.id] || []), userMsg],
    }));
    setInput('');
    setIsAgentTyping(true);

    // Selected agent responds
    setTimeout(() => {
      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        sender: selectedAgent.name,
        senderIcon: '🟢',
        text: `Got it! I'll work on "${input}". Give me a few minutes.`,
        timestamp: new Date().toISOString(),
      };
      setAgentChats(prev => ({
        ...prev,
        [selectedAgent.id]: [...(prev[selectedAgent.id] || []), agentMsg],
      }));
      setIsAgentTyping(false);

      // Rook (assistant) chimes in after agent
      setTimeout(() => {
        const assistantMsg: Message = {
          id: (Date.now() + 2).toString(),
          type: 'assistant',
          sender: 'Rook (Assistant)',
          senderIcon: '🦅',
          text: `I'm tracking this. Let me know if you need anything else!`,
          timestamp: new Date().toISOString(),
        };
        setAgentChats(prev => ({
          ...prev,
          [selectedAgent.id]: [...(prev[selectedAgent.id] || []), assistantMsg],
        }));
      }, 800);
    }, 1000);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedAgent) return;

    setIsUploading(true);

    setTimeout(() => {
      const userMsg: Message = {
        id: Date.now().toString(),
        type: 'user',
        text: '[Uploaded screenshot]',
        image: URL.createObjectURL(file),
        timestamp: new Date().toISOString(),
      };

      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        sender: selectedAgent.name,
        senderIcon: '🟢',
        text: 'Thanks! I can see the screenshot. Let me analyze this and fix the issue.',
        timestamp: new Date().toISOString(),
      };

      const assistantMsg: Message = {
        id: (Date.now() + 2).toString(),
        type: 'assistant',
        sender: 'Rook (Assistant)',
        senderIcon: '🦅',
        text: 'Good context. I\'m tracking the progress.',
        timestamp: new Date().toISOString(),
      };

      setAgentChats(prev => ({
        ...prev,
        [selectedAgent.id]: [...(prev[selectedAgent.id] || []), userMsg, agentMsg, assistantMsg],
      }));
      setIsUploading(false);
    }, 1500);
  }

  function formatTime(timestamp: string) {
    const d = new Date(timestamp);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  return (
    <div 
      className={`fixed inset-0 bg-black/80 z-50 flex ${isExpanded ? '' : 'items-center'} justify-center p-4`}
      onClick={onClose}
    >
      <div 
        className={`card flex flex-col ${isExpanded ? 'w-full h-full max-h-full' : 'w-full max-w-2xl max-h-[80vh]'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-muted hover:text-foreground transition-colors"
            >
              {isExpanded ? '← Minimize' : '← Back'}
            </button>
            <div>
              <h3 className="font-medium">
                {selectedAgent ? `${selectedAgent.name} Chat` : 'Agent Chat'}
              </h3>
              <p className="text-xs text-muted">
                You • {selectedAgent?.name} • 🦅 Rook
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-muted hover:text-foreground transition-colors text-sm"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '📐 Minimize' : '📐 Expand'}
          </button>
        </div>

        {/* Agent Selector */}
        <div 
          ref={tabsContainerRef}
          className="flex gap-2 p-3 border-b border-border overflow-x-auto scroll-smooth"
        >
          {subagents.map((agent, index) => (
            <button
              key={agent.id}
              ref={el => { tabRefs.current[index] = el }}
              onClick={() => setSelectedAgent(agent)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedAgent?.id === agent.id
                  ? 'bg-accent text-slate-950'
                  : 'bg-slate-800 text-muted hover:text-foreground'
              }`}
            >
              {agent.status === 'running' ? '🟢' : '⏸️'} {agent.name}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex items-start gap-2 max-w-[85%]">
                {msg.type !== 'user' && (
                  <div className="text-xl mt-1">{msg.senderIcon}</div>
                )}
                <div>
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
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="Uploaded"
                        className="rounded-lg mb-2 max-w-full"
                      />
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    <p className={`text-xs mt-1 ${
                      msg.type === 'user' 
                        ? 'text-slate-700' 
                        : msg.type === 'assistant'
                        ? 'text-purple-300/70'
                        : 'text-muted'
                    }`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isAgentTyping && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2 max-w-[85%]">
                <div className="text-xl mt-1">🟢</div>
                <div>
                  <p className="text-xs text-muted mb-1">{selectedAgent?.name}</p>
                  <div className="rounded-2xl px-4 py-3 bg-slate-800 text-muted">
                    <span className="animate-pulse">typing...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-border">
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors disabled:opacity-50"
              title="Upload screenshot"
            >
              {isUploading ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <span>📎</span>
              )}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Message ${selectedAgent?.name}...`}
              className="flex-1 rounded-xl border border-border bg-slate-900 px-4 py-2 text-sm outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="px-4 py-2 rounded-xl bg-accent text-slate-950 font-medium text-sm hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-muted mt-2">
            Tip: I'm in this chat too — I'll help coordinate
          </p>
        </form>
      </div>
    </div>
  );
}

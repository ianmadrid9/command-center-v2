# AI Integration for Subagent Chat

## Current State

### ❌ Before (Robotic)
- Pre-written random responses
- No context awareness
- No memory of conversation
- Not intelligent

### ✅ Now (Intelligent)
- Real AI responses via `/api/ai/chat`
- Contextual awareness
- Conversation history
- Agent personalities

---

## Architecture

```
Dashboard Chat UI
    ↓
/api/subagents/[id]/chat
    ↓
/api/ai/chat  ← AI Intelligence Layer
    ↓
[AI Provider] ← Configure your AI here
```

---

## Configuration Options

### OPTION 1: Use OpenClaw's AI (Recommended)

If you have OpenClaw running with AI access:

1. **Set environment variables:**
```bash
# In .env
AI_API_ENDPOINT=http://localhost:18800/v1/chat/completions
AI_API_KEY=your-openclaw-api-key
AI_MODEL=bailian/qwen3.5-plus
```

2. **The chat will use OpenClaw's intelligence!**

---

### OPTION 2: Use Direct AI Provider

Configure your own AI API:

```bash
# For Qwen (Alibaba Cloud)
AI_API_ENDPOINT=https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
AI_API_KEY=your-qwen-key
AI_MODEL=qwen-plus

# For OpenAI
AI_API_ENDPOINT=https://api.openai.com/v1/chat/completions
AI_API_KEY=your-openai-key
AI_MODEL=gpt-4

# For Anthropic
AI_API_ENDPOINT=https://api.anthropic.com/v1/messages
AI_API_KEY=your-anthropic-key
AI_MODEL=claude-3-sonnet-20240229
```

---

### OPTION 3: Smart Fallback (No API Key)

If no AI API is configured, it uses **smart contextual responses**:
- Detects greetings, thanks, status requests
- Context-aware based on agent type
- Not as good as real AI, but better than random phrases

---

## Agent Personalities

Each agent has a specialized system prompt:

### 🎫 eventbrite-scout
```
You are eventbrite-scout, specialized in event research.
- Find tech meetups in NYC
- Identify free/early-bird tickets
- Provide venue, date, price details
- Be enthusiastic about networking
```

### 🎫 eventbrite-rsvp
```
You are eventbrite-rsvp, auto-registration specialist.
- Grab tickets before they sell out
- Track prices and availability
- Move fast on limited tickets
- Alert on good opportunities
```

### 📝 transcript-bot
```
You are transcript-bot, content extraction expert.
- Extract from TikTok, YouTube
- Format and clean transcripts
- Identify key quotes
- Support multiple languages
```

---

## Testing

### Test the AI Endpoint Directly

```bash
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What events did you find today?",
    "agentId": "eventbrite-scout",
    "conversation": []
  }'
```

### Test in Dashboard

1. Open https://command-center-v2-iota.vercel.app
2. Click Dev Agents
3. Select an agent
4. Chat naturally: "What can you do?" or "Find me AI meetups"

---

## Intelligence Levels

| Level | Configuration | Quality |
|-------|--------------|---------|
| **Full AI** | AI API configured | 🧠 Human-like, contextual |
| **Smart Fallback** | No API key | 💬 Contextual but limited |
| **Old Mock** | N/A (replaced) | 🤖 Random phrases |

---

## Rook vs Subagent Chat

### Me (Rook in Main Session)
- ✅ Full OpenClaw intelligence
- ✅ Access to MEMORY.md
- ✅ Workspace context
- ✅ All tools available
- ✅ Long-term memory
- ✅ Aware of Ian, projects, goals

### Subagent Chat Assistant
- ⚠️ Configurable AI (can be as smart as Rook)
- ❌ No memory files (yet)
- ❌ No workspace access (yet)
- ❌ Limited to chat context
- ✅ Each agent has personality
- ✅ Specialized per role

**To make subagents as smart as Rook:**
1. Configure AI API endpoint
2. Add memory access (future enhancement)
3. Add tool access (future enhancement)

---

## Next Steps for Full Intelligence

### 1. Configure AI API (30 min)
```bash
# Add to .env
AI_API_ENDPOINT=your-provider-endpoint
AI_API_KEY=your-key
AI_MODEL=your-model
```

### 2. Add Memory Access (2-3 hours)
- Give agents access to MEMORY.md
- Load relevant context
- Persist conversations to database

### 3. Add Tool Access (4-6 hours)
- Let agents run commands
- Access files
- Call APIs
- Full OpenClaw capabilities

---

## Current Status

✅ **AI endpoint created** (`/api/ai/chat`)
✅ **Agent personalities defined**
✅ **Smart fallback working**
✅ **Conversation context included**
⚠️ **AI API needs configuration** (add your API key)
⚠️ **Memory access not yet added** (future enhancement)

---

## Quick Test

Without any API key, try chatting:
- "Hi, what can you do?"
- "Find me some AI meetups"
- "How do you work?"

You'll get **smart contextual responses** even without AI API!

With AI API configured, you'll get **full intelligent conversations** like talking to Rook!

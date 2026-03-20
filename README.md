# Command Center v2

Minimalist project tracker with conversation-driven UI.

## Stack
- Next.js 16 (App Router)
- Prisma + PostgreSQL (Supabase)
- Tailwind CSS
- Vercel deployment

## Features
- Project cards with progress tracking
- Per-project chat conversations
- AI-powered responses
- Clean, minimal UI

## Deploy
```bash
vercel --prod
```

## DB Schema
- `Project` - Name, progress, status, owner
- `Conversation` - One per project
- `Message` - Chat messages

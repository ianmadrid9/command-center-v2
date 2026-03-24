# Real Data Manifest - NO MOCK DATA

**Last Updated:** 2026-03-23  
**Purpose:** Ensure dashboard uses ONLY real data, no mock data ever

---

## ✅ REAL DATA SOURCES (Allowed)

### API Endpoints (Real Data)
```
✅ /api/agents - Activity logs
✅ /api/agents/[id] - Individual activity log
✅ /api/eventbrite - Eventbrite events (from data/eventbrite-events.json)
✅ /api/rsvps - RSVP confirmations (from data/eventbrite-rsvps.json)
✅ /api/tiktok/stats - TikTok stats
✅ /api/tiktok/comments - TikTok comments
✅ /api/linkedin/stats - LinkedIn stats
✅ /api/linkedin/comments - LinkedIn comments
✅ /api/transcripts - Transcripts (from data/transcripts.json)
✅ /api/activities - Activity feed
✅ /api/system/health - System metrics (real server stats)
✅ /api/subagent-tools - Subagent tools
```

### JSON Data Files (Real Data)
```
✅ data/eventbrite-events.json - Real Eventbrite events
✅ data/eventbrite-rsvps.json - Real RSVP confirmations
✅ data/transcripts.json - Real transcripts
✅ data/agents/*.json - Real activity logs
✅ data/subagents.json - Subagent state
✅ data/activities.json - Activity feed
```

### Direct API Calls (Real Data)
```
✅ fetch('/api/*') - All /api endpoints
✅ fs.readFile('data/*.json') - Data files
✅ os module - System metrics
```

---

## ❌ MOCK DATA (FORBIDDEN)

### NEVER Import These:
```javascript
❌ import { mockTasks } from '@/lib/mockData'
❌ import { mockSubagents } from '@/lib/mockData'
❌ import { mockActivities } from '@/lib/mockData'
❌ import { mockHealth } from '@/lib/mockData'
❌ import { mockQuickActions } from '@/lib/mockData'
❌ import { mockTikTokVideos } from '@/lib/mockData'
❌ import { mockTikTokComments } from '@/lib/mockData'
❌ import { mockLinkedInPosts } from '@/lib/mockData'
❌ import { mockLinkedInComments } from '@/lib/mockData'
❌ import { mockLifeGoals } from '@/lib/mockData'
❌ import { mockTranscripts } from '@/lib/mockData'
❌ import { mockEventbriteEvents } from '@/lib/mockData'
```

### NEVER Use These Functions:
```javascript
❌ getTaskStats() - Uses mock data
❌ getSubagentStats() - Uses mock data
❌ getTikTokStats() - Uses mock data
❌ getLinkedInStats() - Uses mock data
❌ getRecentComments() - Uses mock data
❌ getRecentLinkedInComments() - Uses mock data
❌ getLifeGoalStats() - Uses mock data
```

---

## ✅ CORRECT PATTERNS (Use These)

### Fetch Real Data in Components:
```typescript
// ✅ CORRECT
useEffect(() => {
  async function loadData() {
    const res = await fetch('/api/eventbrite');
    const data = await res.json();
    setEvents(data.events || []);
  }
  loadData();
}, []);

// ✅ CORRECT
const [tiktokStats, setTiktokStats] = useState<any>(null);
useEffect(() => {
  fetchTikTokStats().then(setTiktokStats);
}, []);
```

### Show Loading/Empty States:
```typescript
// ✅ CORRECT
if (loading) return <div>Loading...</div>;
if (!data || data.length === 0) return <div>No data yet</div>;
```

### Use Optional Props with Defaults:
```typescript
// ✅ CORRECT
interface Props {
  transcripts?: Transcript[];  // Optional
}
export function Component({ transcripts = [] }: Props) {
  // Use empty array as default, not mock data
}
```

---

## 🚨 RED FLAGS (Don't Do This)

### Signs of Mock Data:
```typescript
// ❌ WRONG - Hardcoded data
const mockEvents = [{ id: '1', name: 'Fake Event' }];

// ❌ WRONG - Importing from mockData
import { mockEvents } from '@/lib/mockData';

// ❌ WRONG - get functions that return static data
const events = getMockEvents();

// ❌ WRONG - Hardcoded counts
const stats = { total: 5, completed: 3 };  // Where did this come from?
```

---

## 📋 CHECKLIST Before Committing

Before committing any dashboard code, verify:

- [ ] No imports from `@/lib/mockData`
- [ ] No `mock*` variables
- [ ] No `get*Stats()` functions (unless they call real APIs)
- [ ] All data comes from `fetch('/api/*')` or `data/*.json`
- [ ] Loading states handled
- [ ] Empty states handled
- [ ] No hardcoded data arrays

---

## 🧠 MEMORY NOTE FOR ROOK

**When you (Rook) return in future sessions:**

1. **Read this file first** - It tells you what's real vs mock
2. **Check activity logs** - Read `data/agents/*.json` to understand what happened
3. **Never hallucinate data** - If you don't know, say "Let me check the logs"
4. **Always verify** - Before giving advice, read actual log files
5. **Mock data is forbidden** - Even if it's convenient, don't use it

**Your memory sources:**
- `data/agents/*.json` - Activity logs for each section
- `data/eventbrite-events.json` - Real events
- `data/transcripts.json` - Real transcripts
- `memory/` directory - Your session memories
- `MEMORY.md` - Long-term memory (main session only)

---

## 🔧 ENFORCEMENT

### ESLint Rules (Add to package.json):
```json
{
  "no-restricted-imports": ["error", {
    "patterns": ["**/mockData"]
  }]
}
```

### Pre-commit Hook:
```bash
# Check for mock data imports
if grep -r "from '@/lib/mockData'" components/ app/; then
  echo "❌ Mock data imports found! Remove them."
  exit 1
fi
```

---

## 📝 WHAT TO DO INSTEAD OF MOCK DATA

### Need Events?
```typescript
// Don't: const events = mockEvents;
// Do: 
const res = await fetch('/api/eventbrite');
const { events } = await res.json();
```

### Need Stats?
```typescript
// Don't: const stats = getTikTokStats();  // mock
// Do:
const stats = await fetchTikTokStats();  // real API
```

### Need Empty State?
```typescript
// Don't: const events = [{ id: 'demo', name: 'Demo Event' }];
// Do:
if (!events || events.length === 0) {
  return <div>No events yet. Run Eventbrite Scout to fetch events.</div>;
}
```

---

## ✨ PHILOSOPHY

**Honest > Pretty**

- Empty dashboard with real data > Full dashboard with fake data
- "No data yet" > Mock data that looks real
- Loading spinner > Fake loading of fake data
- Error message > Silent failure with mock fallback

**Users deserve truth, not illusions.**

---

**Enforced by:** Rook (your AI assistant)  
**Last audit:** 2026-03-23  
**Status:** ✅ Clean - No mock data in dashboard

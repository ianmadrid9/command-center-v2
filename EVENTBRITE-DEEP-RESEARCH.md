# Eventbrite Deep Research System

## What's New

The Eventbrite agents now perform **deep research** on every event before making RSVP decisions.

---

## Scout Agent Enhancements

### What It Researches:

#### 1. **Deep Ticket Analysis**
- All ticket tiers (not just free/paid)
- Early-bird deadlines
- Quantity remaining
- Price history
- Value scoring (0-100)
- Best ticket recommendation

**Example Output:**
```json
{
  "ticket_tiers": [
    {
      "name": "Early Bird",
      "cost": 10,
      "quantity": 8,
      "soldOut": false,
      "isEarlyBird": true,
      "valueScore": 85
    },
    {
      "name": "General Admission",
      "cost": 25,
      "quantity": 50,
      "soldOut": false,
      "valueScore": 60
    }
  ],
  "best_ticket": { "name": "Early Bird", "cost": 10 },
  "ticket_urgency": "high",
  "ticket_recommendations": [
    "⚠️ Only 8 early-bird tickets left!",
    "🟢 Great value - grab now"
  ]
}
```

#### 2. **Venue Quality Scoring**
- Venue type (hotel, rooftop, co-working, bar)
- Location quality (distance from you)
- Professional vs casual
- Networking-friendly

**Score Breakdown:**
- 80-100: Excellent venue (professional, close)
- 60-79: Good venue
- 40-59: Fair venue
- < 40: Poor venue

#### 3. **Networking Potential**
- Investor presence detection
- Founder/CEO events
- Social setting (happy hours, drinks)
- Educational content (panels, speakers)
- Timing (after-work events score higher)

**Rating:**
- Excellent (80+): High-value networking
- Good (60-79): Solid networking
- Fair (40-59): Some networking
- Poor (< 40): Limited networking

#### 4. **Overall Event Score**
Combines:
- Ticket value (40% weight)
- Venue quality (20% weight)
- Networking potential (40% weight)

**Result:** 0-100 score for easy comparison

---

## RSVP Agent Enhancements

### Smart Decision Making

#### Scoring System:
```
Base Score (from event research)
+ Urgency Bonus (critical: +30, high: +20, medium: +10)
+ Free Ticket Bonus (+20)
+ Networking Bonus (excellent: +25, good: +15)
+ Priority Keyword Bonus (+20)
+ Distance Bonus (close: +10-15)
+ Venue Bonus (great: +10)
= Final Score (0-100)
```

#### Priority Levels:
- **CRITICAL (90+)**: Auto-grab immediately
- **HIGH (80-89)**: Strong candidate
- **MEDIUM (70-79)**: Good option
- **LOW (60-69)**: Consider if budget allows
- **SKIP (< 60)**: Not worth it

#### Budget Protection:
- Monthly budget: $100 max
- Per-ticket max: $30
- Tracks spending automatically
- Skips expensive events
- Prioritizes free events

#### Urgency Handling:
- **Critical urgency** (early-bird ending < 24h): Auto-grab if free or ≤ $15
- **High urgency** (< 20 tickets left): Priority consideration
- **Medium urgency**: Normal processing
- **Low urgency**: Standard processing

---

## Example RSVP Decision

**Event:** "AI Startup Networking Rooftop"

**Research Data:**
```
Overall Score: 88/100
Networking: Excellent (investors attending)
Venue: 85/100 (rooftop, 0.8 miles)
Tickets: Early-bird $12 (8 left, ends tomorrow)
Urgency: CRITICAL
```

**RSVP Decision:**
```
✅ AUTO-GRAB
Reason: CRITICAL urgency + excellent networking + great value
Score breakdown:
- Base: 75
- Urgency: +30 (critical)
- Free/cheap: +20 ($12 is great value)
- Networking: +25 (excellent)
- Distance: +15 (< 1 mile)
- Venue: +10 (rooftop)
Total: 175 → capped at 100
Priority: CRITICAL
```

---

## How to Use

### 1. Run Scout (Deep Research)
```bash
cd /Users/spm/.openclaw/workspace/command-center
node agents/eventbrite-scout.js
```

**Output:**
```
🔍 Eventbrite Scout Agent (Deep Research) starting...

📊 Total unique events: 15
✅ Quality events after filtering: 8

📅 AI Startup Networking Rooftop
   Score: 88/100 | Networking: Excellent
   Ticket: 💰 $12.51 (Sold Out - Early Bird Free tickets gone)
   📍 230 Fifth Rooftop Bar | 0.8 miles
   🎫 Best ticket: Early Bird ($12.51)
   ⚠️ Urgency: HIGH (only 8 tickets left)

📊 Summary:
   🟢 Truly free: 3
   💰 Paid (free sold out): 5
   Total: 8
```

### 2. Run RSVP (Smart Decisions)
```bash
node agents/eventbrite-rsvp.js
```

**Output:**
```
🎫 Eventbrite RSVP Agent (Deep Research) starting...

💰 Monthly spending: $25/$100

📋 Loaded 8 events with deep research

📅 AI Startup Networking Rooftop
   Score: 88/100 | Networking: Excellent
   Ticket: 💰 $12.51
   Decision: ✅ RSVP - CRITICAL urgency + excellent networking
   🎫 Best ticket: Early Bird ($12.51)
   ✅ RSVP successful! Order: 123456789

🎉 RSVP Agent completed!
✅ RSVP'd to 2 event(s):

1. AI Startup Networking Rooftop
   🎫 Early Bird ($12.51)
   📊 Score: 88/100 | Networking: Excellent
   📍 230 Fifth Rooftop Bar (0.8 miles)
   🔗 https://eventbrite.com/e/...

2. Fintech Founders Happy Hour
   🎫 FREE
   📊 Score: 92/100 | Networking: Excellent
   📍 WeWork 50th & 2nd (0.2 miles)
   🔗 https://eventbrite.com/e/...
```

---

## Data Structure

Each event in `data/eventbrite-events.json` now includes:

```json
{
  "id": "123456789",
  "name": "AI Startup Networking",
  "overall_score": 88,
  "networking_score": 90,
  "networking_rating": "Excellent",
  "venue_score": 85,
  "ticket_urgency": "critical",
  "ticket_tiers": [...],
  "best_ticket": {...},
  "ticket_recommendations": [...],
  "distance": "0.8 miles",
  "is_free": false,
  "price": "$12.51"
}
```

---

## Configuration

Edit `agents/eventbrite-rsvp.js` to customize:

```javascript
const RSVP_CRITERIA = {
  maxMonthlyBudget: 100,      // Change monthly budget
  maxSingleTicket: 30,        // Change max per ticket
  minOverallScore: 60,        // Minimum score to consider
  minNetworkingScore: 50,     // Minimum networking value
  grabUrgentFree: true,       // Auto-grab urgent free tickets
  grabUrgentEarlyBird: true,  // Auto-grab urgent early-bird
  maxDaysUntilEvent: 60,      // Max days in future
  keywords: ['tech', 'startup', ...],  // Your keywords
  priorityKeywords: ['investor', 'founder', ...]  // Higher priority
};
```

---

## Benefits

### Before (Basic):
- ❌ Only checked free/paid
- ❌ No venue analysis
- ❌ No networking assessment
- ❌ Manual decision making
- ❌ No budget tracking
- ❌ Missed urgent deadlines

### After (Deep Research):
- ✅ Analyzes all ticket tiers
- ✅ Scores venue quality
- ✅ Estimates networking value
- ✅ Auto-decisions with scoring
- ✅ Budget protection
- ✅ Catches urgent opportunities
- ✅ Data-driven RSVPs

---

## Next Steps

1. **Set API Key** (if not already):
```bash
openclaw env set EVENTBRITE_API_KEY=your_key_here
openclaw env set EVENTBRITE_USER_EMAIL=your@email.com
openclaw env set EVENTBRITE_USER_NAME="Ian Madrid"
```

2. **Run Daily**:
```bash
# Morning scout
node agents/eventbrite-scout.js

# Follow-up RSVP
node agents/eventbrite-rsvp.js
```

3. **Or Automate** (cron):
```bash
# Add to crontab
0 8 * * * cd command-center && node agents/eventbrite-scout.js
0 8 * * * cd command-center && node agents/eventbrite-rsvp.js
```

---

**Your Eventbrite system now does deep research like a human would!** 🎯

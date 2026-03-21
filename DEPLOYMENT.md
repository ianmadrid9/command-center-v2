# Deployment Workflow - Staging + Production

## Two Environments

### 🧪 STAGING (Development)
**URL:** https://command-center-v2-p9cxza0qw-openclawian-debugs-projects.vercel.app

**Purpose:**
- ✅ Test new features
- ✅ Rapid iteration
- ✅ Mock data is OK
- ✅ Break things freely
- ✅ Design validation

**Deploy Command:**
```bash
vercel
```

---

### 🚀 PRODUCTION (Live)
**URL:** https://command-center-v2-iota.vercel.app

**Purpose:**
- ✅ Stable, production-ready
- ✅ Real API integrations (when ready)
- ✅ Daily use
- ✅ Never break

**Deploy Command:**
```bash
vercel --prod
```

---

## Workflow

### During Development:
```
1. Build feature
2. Deploy to STAGING: `vercel`
3. Test on staging URL
4. Iterate (deploy to staging multiple times)
5. Production stays untouched ✅
```

### When Ready for Production:
```
1. You approve on staging
2. Deploy to PRODUCTION: `vercel --prod`
3. Production updates
4. Both in sync
```

---

## Current Status

**Version:** v2.0.0
**Last Commit:** 6af040c - Command Center Dashboard Complete

### Features (v2.0.0):
- ✅ 6 KPI cards (3-column grid)
- ✅ 8 full-width sections
- ✅ Dev Agents chat modal
- ✅ System Capacity concurrency planner
- ✅ Eventbrite with AI insights
- ✅ Transcript extractor
- ✅ Mock data (ready for API integration)

### Next Version (v2.1.0):
- 🔄 Life Goals subagent system
- 🔄 Real API integrations (TikTok, LinkedIn, Eventbrite)
- 🔄 Real OpenClaw subagent coordination
- 🔄 Real system metrics

---

## Version Control

**Git Repo:** `/Users/spm/.openclaw/workspace/command-center/`
**Current Tag:** v2.0.0

**To create new version:**
```bash
git add -A
git commit -m "v2.1.0 - Feature description"
git tag -a v2.1.0 -m "Description"
git push --tags
```

---

## Environment Variables

**File:** `.env`

**Production:**
- Real API keys
- Real database credentials
- Production endpoints

**Staging:**
- Mock API keys (or same as prod for testing)
- Test database
- Staging endpoints

---

## Deployment Checklist

### Before Staging Deploy:
- [ ] Code builds locally (`npm run build`)
- [ ] No TypeScript errors
- [ ] Components render correctly

### Before Production Deploy:
- [ ] Tested on staging
- [ ] You approved the feature
- [ ] No console errors
- [ ] Real API keys configured (if applicable)
- [ ] Backup current production (if needed)

---

## URLs Summary

| Environment | URL | Use |
|-------------|-----|-----|
| **Staging** | https://command-center-v2-p9cxza0qw-openclawian-debugs-projects.vercel.app | Testing, iteration |
| **Production** | https://command-center-v2-iota.vercel.app | Daily use, stable |

---

## Quick Commands

```bash
# Start local dev (if you have local access)
npm run dev

# Build locally (test for errors)
npm run build

# Deploy to STAGING (development)
vercel

# Deploy to PRODUCTION (live)
vercel --prod

# Check git status
git status

# Commit and tag new version
git add -A
git commit -m "v2.1.0 - Description"
git tag -a v2.1.0 -m "Version 2.1.0"
```

---

**Setup Date:** 2026-03-21
**Setup By:** Rook (Assistant)

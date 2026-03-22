# Version History & Rollback Guide

## Current Versions

| Version | Commit | Date | Status |
|---------|--------|------|--------|
| **v2.0.0** | 6af040c | 2026-03-21 | ✅ Current Production |
| v1.0.0 | 9450b3b | 2026-03-20 | 📦 Initial MVP |

---

## How to View Version History

### **Command Line:**
```bash
cd /Users/spm/.openclaw/workspace/command-center

# View all versions (tags)
git tag -l

# View detailed version info
git show v2.0.0

# View commit history
git log --oneline --decorate -10

# View what changed in a version
git show --stat v2.0.0
```

### **What You'll See:**
```
v2.0.0 (tag: v2.0.0) - Command Center Dashboard Complete
113ce9b (HEAD -> main) - docs: Add staging + production deployment workflow
6af040c (tag: v2.0.0) - v2.0.0 - Command Center Dashboard Complete
9450b3b - Initial commit: MVP command center
```

---

## How to Rollback to Previous Version

### **Option 1: Temporary Rollback (Test)**
```bash
# Checkout an old version (doesn't delete current)
git checkout v2.0.0

# Test it locally
npm run dev

# Go back to latest when done
git checkout main
```

### **Option 2: Permanent Rollback (Revert)**
```bash
# Create a new commit that reverts to old version
git checkout main
git reset --hard v2.0.0

# Force update production
vercel --prod
```

### **Option 3: Create Fix Branch**
```bash
# Create branch from old version
git checkout -b fix-from-v2 v2.0.0

# Make fixes
git add -A
git commit -m "Fix: [description]"

# Merge back to main when ready
git checkout main
git merge fix-from-v2
```

---

## Version Details

### **v2.0.0** (Current) - 2026-03-21
**Features:**
- ✅ 6 KPI cards (3-column grid)
- ✅ Dev Agents chat modal (3-way chat)
- ✅ System Capacity (hourly concurrency)
- ✅ Eventbrite (AI insights, calendar)
- ✅ Transcript Extractor
- ✅ TikTok/LinkedIn comments (sentiment)
- ✅ Full-width layout
- ✅ Mock data

**Files:** 23 files changed, 3,533 insertions
**Deploy:** Production + Staging

---

### **v1.0.0** (Initial) - 2026-03-20
**Features:**
- Basic MVP
- Meetup research project
- Simple project cards

**Files:** Initial commit

---

## How to Create New Version

### **When to Version:**
- ✅ Major feature complete
- ✅ Before deploying to production
- ✅ Before breaking changes
- ✅ End of development session

### **Create Version:**
```bash
# 1. Check what changed
git status

# 2. Add all changes
git add -A

# 3. Commit with message
git commit -m "v2.1.0 - Feature description"

# 4. Create tag
git tag -a v2.1.0 -m "Version 2.1.0 - Description"

# 5. Push tags
git push --tags
```

### **Version Numbering:**
```
vMAJOR.MINOR.PATCH

v2.0.0 → Major release (big changes)
v2.1.0 → Minor release (new features)
v2.1.1 → Patch (bug fixes)
```

---

## Quick Reference

### **View versions:**
```bash
git tag -l
```

### **View what's in a version:**
```bash
git show v2.0.0
```

### **View commit history:**
```bash
git log --oneline -10
```

### **Test old version:**
```bash
git checkout v2.0.0
npm run dev
git checkout main  # to go back
```

### **Rollback permanently:**
```bash
git reset --hard v2.0.0
vercel --prod
```

---

## Deployment Status

| Version | Staging | Production |
|---------|---------|------------|
| v2.0.0 | ✅ Deployed | ✅ Deployed |
| v1.0.0 | ❌ Old | ❌ Old |

---

## Need Help?

**To see current version:**
```bash
git describe --tags
```

**To see what changed since last version:**
```bash
git diff v2.0.0 HEAD
```

**To list all files changed in a version:**
```bash
git show --name-only v2.0.0
```

---

**Last Updated:** 2026-03-21
**Current Version:** v2.0.0

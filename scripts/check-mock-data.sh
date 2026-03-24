#!/bin/bash

# Pre-commit hook: Check for mock data imports
# Prevents mock data from being committed to production

echo "🔍 Checking for mock data imports..."

# Check for mock data imports in components and app directories
# Allow "import type" (just types) but not "import" (actual data)
MOCK_IMPORTS=$(grep -rE "import [^{*].*from '@/lib/mockData'" components/ app/ 2>/dev/null | grep -v "import type" || true)

if [ ! -z "$MOCK_IMPORTS" ]; then
  echo ""
  echo "❌ ERROR: Mock data imports found!"
  echo ""
  echo "Found these imports:"
  echo "$MOCK_IMPORTS"
  echo ""
  echo "Mock data is FORBIDDEN in production components."
  echo ""
  echo "✅ Instead, use:"
  echo "   - API endpoints: fetch('/api/*')"
  echo "   - Data files: data/*.json"
  echo "   - Activity logs: data/agents/*.json"
  echo ""
  echo "See REAL_DATA_MANIFEST.md for complete list of allowed sources."
  echo ""
  echo "Commit blocked. Remove mock data imports and try again."
  exit 1
fi

# Check for mock variable usage
MOCK_VARS=$(grep -rE "(mockTasks|mockSubagents|mockActivities|mockHealth|mockQuickActions|mockTikTok|mockLinkedIn|mockLifeGoals|mockTranscripts|mockEventbrite)" components/ app/ 2>/dev/null || true)

if [ ! -z "$MOCK_VARS" ]; then
  echo ""
  echo "❌ ERROR: Mock data variables found!"
  echo ""
  echo "Found these usages:"
  echo "$MOCK_VARS"
  echo ""
  echo "Mock data is FORBIDDEN in production components."
  echo ""
  echo "Commit blocked. Remove mock data usage and try again."
  exit 1
fi

echo "✅ No mock data found. Proceeding with commit."
exit 0

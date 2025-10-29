#!/bin/bash
# Backend: Only build on backend branch
if [ "$VERCEL_GIT_COMMIT_REF" != "backend" ]; then
  echo "🛑 Skipping build - backend only builds from backend branch"
  exit 0
fi
echo "✅ Building backend from backend branch"
exit 1


#!/bin/bash
# Frontend: Only build on main branch
if [ "$VERCEL_GIT_COMMIT_REF" != "main" ]; then
  echo "🛑 Skipping build - frontend only builds from main branch"
  exit 0
else
  echo "✅ Building frontend from main branch"
  exit 1
fi


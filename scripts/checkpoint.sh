#!/usr/bin/env bash
set -euo pipefail

MSG="${1:-manual checkpoint}"

git add -A

if git diff --cached --quiet; then
  echo "No changes to checkpoint."
else
  git commit -m "checkpoint: ${MSG}"
fi

echo ""
echo "Latest commits:"
git log --oneline -5 || true

echo ""
echo "Current status:"
git status --short

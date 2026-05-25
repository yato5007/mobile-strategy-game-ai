#!/usr/bin/env bash
set -euo pipefail

echo "=== Project Progress JSON ==="
if [ -f PROJECT_PROGRESS.json ]; then
  cat PROJECT_PROGRESS.json
else
  echo "PROJECT_PROGRESS.json not found."
fi

echo ""
echo "=== Progress Dashboard ==="
if [ -f PROGRESS_DASHBOARD.md ]; then
  sed -n '1,220p' PROGRESS_DASHBOARD.md
else
  echo "PROGRESS_DASHBOARD.md not found."
fi

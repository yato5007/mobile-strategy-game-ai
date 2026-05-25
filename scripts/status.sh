#!/usr/bin/env bash
set -euo pipefail

echo "=== Git status ==="
git status --short

echo ""
echo "=== Latest commits ==="
git log --oneline -10 || true

echo ""
echo "=== Spec tree status ==="
sed -n '1,220p' SPEC_TREE_STATUS.md || true

echo ""
echo "=== Progress ==="
sed -n '1,220p' PROGRESS_DASHBOARD.md || true

echo ""
echo "=== Spec tree files ==="
find .spec-tree -maxdepth 5 -type f | sort || true

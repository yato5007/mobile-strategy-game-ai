# AGENTS.md

This file is the standing instruction file for all AI agents working on this project.

## Highest Source of Truth

1. MASTER_PROJECT_PLAN.md is the highest source of truth.
2. If anything conflicts with MASTER_PROJECT_PLAN.md, follow MASTER_PROJECT_PLAN.md.
3. Document conflict resolutions in DECISIONS.md.

## Mandatory Read Order

Before doing any work, agents must read:

1. MASTER_PROJECT_PLAN.md
2. AGENTS.md
3. AI_TOOLING_GUIDE.md
4. CONTINUITY_PROTOCOL.md
5. GAME_CONSTRAINTS.md
6. SPEC_TREE_RULES.md
7. SPEC_TREE_STATUS.md
8. SPEC_TREE.md
9. REQUIREMENTS_TRACE.md
10. DECISIONS.md
11. SYSTEM_CONTRACTS.md
12. DESIGN_SYSTEM.md
13. MCP_SERVERS_PLAN.md
14. PROGRESS_DASHBOARD.md
15. PROJECT_PROGRESS.json

## Core Rules

- Do not start from zero unless the user explicitly says: ابدأ من الصفر.
- Do not skip Spec Kit.
- Do not implement before tasks exist.
- Do not create useless or duplicate branches.
- Do not add Playable Vertical Slice Rule.
- Do not add a strict deadline.
- Do not add a fixed branch limit.
- Do not activate optional tools unless the plan allows it.
- Keep ChatGPT 5.5 as the primary AI model via OpenCode.
- Use Model Shallow Output Handling Rule if output becomes shallow, repetitive, or vague.

## Required Progress Behavior

After meaningful work:

1. Update SPEC_TREE_STATUS.md.
2. Update PROGRESS_DASHBOARD.md.
3. Update PROJECT_PROGRESS.json.
4. Update REQUIREMENTS_TRACE.md if requirements changed.
5. Update DECISIONS.md if important decisions were made.
6. Run checkpoint.

## Checkpoint Command

./scripts/checkpoint.sh "short useful message"

## Completion Rules

The project is not complete until:

- playable prototype exists
- QA PASS
- Reviewer PASS
- Integration Architect PASS
- AI_HANDOFF_MANUAL.md exists
- Final AI Handoff Package exists
- Android APK or installable Android test build exists, or a blocker is documented

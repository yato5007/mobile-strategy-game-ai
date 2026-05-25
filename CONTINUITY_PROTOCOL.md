# Continuity Protocol

The AI must never restart from zero after interruption.

Before doing any work, the AI must read:

1. GAME_CONSTRAINTS.md
2. SPEC_TREE_RULES.md
3. SPEC_TREE_STATUS.md
4. SPEC_TREE.md if it exists
5. REQUIREMENTS_TRACE.md if it exists
6. DECISIONS.md if it exists
7. SYSTEM_CONTRACTS.md if it exists
8. PROGRESS_DASHBOARD.md if it exists
9. PROJECT_PROGRESS.json if it exists
10. latest git log
11. current git status
12. .spec-tree folders

## Core Rule

Resume from the latest incomplete phase.

Do not overwrite completed artifacts unless there is a clear reason.
Do not delete previous work.
Do not regenerate the whole project from scratch.
Do not replace good existing work with new unrelated work.
Fix and continue.

## Checkpoint Rule

After every meaningful step, run:

./scripts/checkpoint.sh "short description"

Meaningful steps include:
- root constitution completed
- root spec completed
- root clarify completed
- root plan completed
- root tasks completed
- root analysis completed
- root checklist completed
- a child node created
- a node Spec Kit phase completed
- a leaf implemented
- QA completed
- reviewer completed
- integration completed
- documentation updated
- progress updated

## Status Rule

Update SPEC_TREE_STATUS.md after each step.

Every node must have one of these states:
- TODO
- IN_PROGRESS
- BLOCKED
- READY_FOR_CHILDREN
- LEAF_READY_FOR_IMPLEMENTATION
- IMPLEMENTED
- QA_PASS
- REVIEW_PASS
- INTEGRATED

## No Big Rewrite Rule

The AI must not rewrite large parts of the project unless:

1. The current implementation is clearly broken.
2. The reason is documented in DECISIONS.md.
3. The affected systems are listed in SYSTEM_CONTRACTS.md.
4. A checkpoint is created before the rewrite.

Prefer small fixes over large rewrites.

## Model Shallow Output Handling Rule

If the model produces shallow output, repeats itself, skips important details, or fails twice on the same task:

1. Do not continue with the same broad task.
2. Split the task into smaller Spec Kit nodes.
3. Record the split reason in DECISIONS.md.
4. Update SPEC_TREE.md and SPEC_TREE_STATUS.md.
5. Continue with the smaller node.
6. Do not create duplicate or useless branches.

This rule exists to handle weak, short, or repetitive model output without restarting the project.

## Progress Tracking Rule

The AI must maintain:

1. PROGRESS_DASHBOARD.md
2. PROJECT_PROGRESS.json

After every meaningful checkpoint, update both files.

Progress percentage must be based on actual artifacts, not optimistic guessing.

Do not mark an area above 80% unless:
- implementation exists
- tests or validation exist
- QA has reviewed it

Do not mark the whole project as 100% unless:
- QA says PASS
- reviewer says PASS
- integration-architect says PASS
- AI_HANDOFF_MANUAL.md exists
- Final AI Handoff Package is complete

## Recovery Rule

If OpenCode, Codespaces, network, DeepSeek, or terminal disconnects:

1. Reopen Codespaces.
2. cd mobile-game
3. Run ./scripts/status.sh
4. Run opencode .
5. Tell the director to resume using this protocol.
6. Continue from SPEC_TREE_STATUS.md and git history.

Never start over unless the user explicitly says:
"ابدأ من الصفر".

# Root Node Plan

## Overall Strategy

1. Complete full Spec Kit for root node (this node).
2. Call @spec-critic to review root artifacts.
3. Derive child branches from root specification.
4. Execute each child branch using @recursive-spec-node.
5. Implement leaf nodes first, integrate upward.
6. QA, review, integration, documentation, handoff.

## Root Spec Kit Phases

| Phase | Status | Notes |
|---|---|---|
| 1. Constitution | ✅ Done | |
| 2. Specification | ✅ Done | Lane-control simultaneous strategy game |
| 3. Clarification | ✅ Done | 10 Q&A, refined mechanics |
| 4. Plan | 🔄 In progress | This file |
| 5. Tasks | ⬜ Next | Concrete action items |
| 6. Analysis | ⬜ Next | Feasibility, risks, dependencies |
| 7. Checklist | ⬜ Next | Acceptance criteria |
| 8. Implementation | ⬜ Next | Only if root is leaf — but root is not leaf |

## Root is NOT a leaf node

Root defines the overall game. Implementation happens in child branches. However, root implementation phase creates the initial project scaffolding (folders, configs, shared types).

## After Root Spec Kit

The following child branches will be derived:

1. **Core Game Logic Engine** — Game state, round flow, lane resolution, card system, VP calculation.
2. **UI and User Experience** — Board rendering, card interaction, animations, RTL/LTR layout.
3. **Bot and AI System** — Heuristic AI, difficulty levels, strategic styles.
4. **Multiplayer System** — Local mock multiplayer, state synchronization, Supabase Realtime later.
5. **Localization System** — Arabic/English i18n, RTL/LTR support.
6. **Balance and Testing** — Balance simulator, unit tests, dominant strategy detection.

These branches may split further (depth up to 4).

## Timeline (Estimated)

No strict deadline. The project follows Spec Kit quality-first approach.

| Step | Est. Effort |
|---|---|
| Root Spec Kit complete | 1 session |
| Core Game Logic branch | 2–3 sessions |
| UI branch | 2–3 sessions |
| Bot branch | 2 sessions |
| Multiplayer branch | 1–2 sessions |
| Localization branch | 1 session |
| Balance & Testing branch | 1–2 sessions |
| Integration, QA, Review, Docs | 1–2 sessions |
| **Total** | **~10–15 sessions** |

## Dependencies

- Root must complete Spec Kit before child branches.
- Core Game Logic must be implemented before UI can fully work.
- Bots need Core Game Logic to operate.
- Multiplayer needs Core Game Logic + some UI.
- Balance simulator needs game logic and bots.
- Localization can happen in parallel with UI.
- Documentation and integration happen at the end.

# Requirements Traceability

Every requirement must be traced to:

1. Spec Kit node
2. Design decision
3. Implementation files
4. Tests
5. QA result
6. Reviewer result

No final PASS is allowed if a requirement has no trace.

---

## Legend
- **REQ-XXX**: Requirement ID
- **Source**: GAME_CONSTRAINTS.md reference
- **Node**: Spec Kit node responsible
- **Decision**: DECISIONS.md reference
- **Impl**: Implementation files
- **Tests**: Test files
- **QA**: QA result location
- **Review**: Reviewer result location
- **Status**: ✅ Traced / 🔄 In progress / ❌ Missing

---

## Root-Level Requirements

### Core Game Requirements

| ID | Description | Source | Node | Decision | Impl | Tests | QA | Review | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| REQ-001 | Game must be strategic, not reflex/speed | Core 1 | core-game-logic | D001 | engine.ts, cards.ts | — | — | — | ✅ |
| REQ-002 | Precise choices with clear consequences | Core 2 | core-game-logic | D001 | engine.ts (lane resolution), cards.ts | — | — | — | ✅ |
| REQ-003 | Multiplayer support (4 players) | Core 3, 12 | core-game-logic | D001, D007 | types.ts (PlayerId, 4 players), state.ts | — | — | — | ✅ |
| REQ-004 | No turn waiting (simultaneous) | Core 4 | core-game-logic | D001 | engine.ts (simultaneous planning → reveal) | — | — | — | ✅ |
| REQ-005 | Easy to understand, quick to get into | Core 5 | core-game-logic | D001 | cards.ts (simple unit/tactic cards), constants.ts | — | — | — | ✅ |
| REQ-006 | Not complex or overloaded | Core 6 | core-game-logic | D001 | constants.ts (streamlined, 14 cards/deck) | — | — | — | ✅ |
| REQ-007 | No heavy management or excess details | Core 7 | core-game-logic | D001 | engine.ts (clean round phases) | — | — | — | ✅ |
| REQ-008 | Match ≤ 30 minutes | Core 8 | core-game-logic | D002 | constants.ts (MAX_ROUNDS=12, timings) | — | — | — | ✅ |
| REQ-009 | Changing match conditions | Core 9 | core-game-logic | D001, D008 | state.ts (rotating lane objectives), constants.ts | — | — | — | ✅ |
| REQ-010 | Comeback possible for losing player | Core 10 | core-game-logic | D004 | engine.ts (processComebackBonuses), cards.ts (comeback cards) | — | — | — | ✅ |
| REQ-011 | Competition strong until end | Core 11 | core-game-logic | D002, D004 | engine.ts (fixed rounds, no early end) | — | — | — | ✅ |
| REQ-012 | 4 players supported | Core 12 | core-game-logic | D001 | types.ts (4 players array), engine.ts (createGame) | — | — | — | ✅ |
| REQ-013 | 2v2 team mode | Core 13 | core-game-logic | D005 | engine.ts (team strength, team VP), constants.ts | — | — | — | ✅ |
| REQ-014 | FFA 1v1v1v1 mode | Core 14 | core-game-logic | D001 | engine.ts (FFA resolution), types.ts (GameMode) | — | — | — | ✅ |
| REQ-015 | Strategic game (not shallow points race) | Core 15 | core-game-logic | D010 | cards.ts (bluff, sabotage, ambush, etc.), engine.ts (tactic effects) | — | — | — | ✅ |
| REQ-016 | No reward for hiding/passive play | Core 16 | core-game-logic | D003 | engine.ts (validateAssignment rejects empty) | — | — | — | ✅ |
| REQ-017 | Active play throughout must matter | Core 17 | core-game-logic | D003 | engine.ts (mandatory ≥1 card, skip penalty) | — | — | — | ✅ |
| REQ-018 | Clear win condition | Core 18 | core-game-logic | D002 | engine.ts (getGameResult, most VP wins) | — | — | — | ✅ |
| REQ-019 | Match must not end early | Core 19 | core-game-logic | D002 | engine.ts (fixed MAX_ROUNDS, no early termination) | — | — | — | ✅ |
| REQ-020 | Match stays open until final rounds | Core 20 | core-game-logic | D002, D004 | engine.ts (all 12 rounds always played) | — | — | — | ✅ |
| REQ-021 | Board/lanes have gameplay importance | Core 21 | core-game-logic | D001 | types.ts (LaneState), engine.ts (lane resolution), state.ts (objectives) | — | — | — | ✅ |
| REQ-022 | Lead shifts repeatedly until end | Core 22 | core-game-logic | D004, D008 | engine.ts (comeback, hidden assignments, rotating objectives) | — | — | — | ✅ |

### Localization & Platform Requirements

| ID | Description | Source | Node | Decision | Impl | Tests | QA | Review | Status |
|---|---|---|---|---|---|---|---|---|---|
| REQ-023 | Arabic-first visual and cultural style | Ar-EN 1 | root | — | — | — | — | — | 🔄 |
| REQ-024 | Support both Arabic and English | Ar-EN 2 | root | — | — | — | — | — | 🔄 |
| REQ-025 | RTL layout for Arabic | Ar-EN 3 | root | — | — | — | — | — | 🔄 |
| REQ-026 | LTR layout for English | Ar-EN 4 | root | — | — | — | — | — | 🔄 |
| REQ-027 | Android and iOS via Expo RN | Ar-EN 5 | root | — | — | — | — | — | 🔄 |
| REQ-028 | Arabic/English support from beginning | Ar-EN 6 | root | — | — | — | — | — | 🔄 |
| REQ-029 | Every text via localization system | Ar-EN 7 | root | — | — | — | — | — | 🔄 |
| REQ-030 | No hardcoded player-facing text | Ar-EN 8 | root | — | — | — | — | — | 🔄 |

### Bot Requirements

| ID | Description | Source | Node | Decision | Impl | Tests | QA | Review | Status |
|---|---|---|---|---|---|---|---|---|---|
| REQ-031 | Bots to fill missing player slots | Bot 1 | root | D006 | — | — | — | — | 🔄 |
| REQ-032 | Bots with difficulty levels (E/N/H/E) | Bot 3, 4 | root | D006 | — | — | — | — | 🔄 |
| REQ-033 | Difficulty affects planning quality | Bot 5 | root | D006 | — | — | — | — | 🔄 |
| REQ-034 | Bots must not cheat on hidden info | Bot 6 | root | D006 | — | — | — | — | 🔄 |
| REQ-035 | Bots work in FFA | Bot 7 | root | — | — | — | — | — | 🔄 |
| REQ-036 | Bots work in 2v2 | Bot 8 | root | D005 | — | — | — | — | 🔄 |
| REQ-037 | Bots usable for local testing | Bot 9 | root | D006, D007 | — | — | — | — | 🔄 |
| REQ-038 | Bots usable by balance simulator | Bot 10 | root | D006, D008 | — | — | — | — | 🔄 |
| REQ-039 | Bot behavior must be strategic | Bot 11 | root | D006 | — | — | — | — | 🔄 |
| REQ-040 | Bot difficulty selectable before match | Bot 12 | root | — | — | — | — | — | 🔄 |
| REQ-041 | Bots support strategic styles (7 types) | Bot Style | root | D006 | — | — | — | — | 🔄 |
| REQ-042 | Difficulty controls quality, style controls personality | Bot Style | root | D006 | — | — | — | — | 🔄 |

### Anti-Dominant Strategy Requirements

| ID | Description | Source | Node | Decision | Impl | Tests | QA | Review | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| REQ-043 | No always-correct strategy | Anti 1 | core-game-logic | D008 | cards.ts (varied card pool), state.ts (rotating objectives) | — | — | — | ✅ |
| REQ-044 | Best decision depends on game state | Anti 2 | core-game-logic | D008 | engine.ts (dynamic lane resolution, tactic effects) | — | — | — | ✅ |
| REQ-045 | Strategies counterable in different situations | Anti 3 | core-game-logic | D008 | cards.ts (sabotage counters strength, shield counters sabotage) | — | — | — | ✅ |
| REQ-046 | Changing match conditions force adaptation | Anti 4 | core-game-logic | D008 | state.ts (rotating objectives per round) | — | — | — | ✅ |
| REQ-047 | Same opening plan not always best | Anti 5 | core-game-logic | D008 | cards.ts (rotating card pool changes each match) | — | — | — | ✅ |
| REQ-048 | Same late-game plan not always best | Anti 6 | core-game-logic | D008 | state.ts (late-game objective pool changes at round 5, 8) | — | — | — | ✅ |
| REQ-049 | Balance simulator tests for dominant strategies | Anti 7 | balance-testing | D008 | — | — | — | — | 🔄 |
| REQ-050 | >55% win-rate flagged as balance problem | Anti 8 | balance-testing | D008 | — | — | — | — | 🔄 |
| REQ-051 | Diverse bot styles test varied strategies | Anti 9 | bot-ai | D006, D008 | — | — | — | — | 🔄 |
| REQ-052 | Reviewer must not approve if dominant strategy exists | Anti 10 | root | D008 | — | — | — | — | 🔄 |

### Technical Requirements

| ID | Description | Source | Node | Decision | Impl | Tests | QA | Review | Status |
|---|---|---|---|---|---|---|---|---|---|
| REQ-053 | Expo React Native + TypeScript | Tech 1 | root | — | mobile-game/ | — | — | — | 🔄 |
| REQ-054 | Local mock multiplayer first | Tech 2 | root | D007 | — | — | — | — | 🔄 |
| REQ-055 | Supabase Realtime later (online) | Tech 3 | root | D007 | — | — | — | — | 🔄 |
| REQ-056 | Playable prototype before final approval | Tech 4 | root | — | — | — | — | — | 🔄 |

### Documentation Requirements

| ID | Description | Source | Node | Decision | Impl | Tests | QA | Review | Status |
|---|---|---|---|---|---|---|---|---|---|
| REQ-057 | Full integration process | Integration 1 | root | — | — | — | — | — | 🔄 |
| REQ-058 | No system conflicts | Integration 2 | root | — | — | — | — | — | 🔄 |
| REQ-059 | SYSTEM_CONTRACTS.md exists | Integration 3 | root | — | SYSTEM_CONTRACTS.md | — | — | — | ✅ |
| REQ-060 | DECISIONS.md exists | Integration 4 | root | — | DECISIONS.md | — | — | — | ✅ |
| REQ-061 | AI_HANDOFF_MANUAL.md final output | Doc 1 | root | — | — | — | — | — | 🔄 |
| REQ-062 | AI handoff package complete | Doc 2 | root | — | — | — | — | — | 🔄 |

---

## Trace Status Summary

| Category | Total | ✅ Traced | 🔄 In Progress | ❌ Missing |
|---|---|---|---|---|---|
| Core Game | 22 | 22 | 0 | 0 |
| Localization & Platform | 8 | 0 | 8 | 0 |
| Bot | 12 | 0 | 12 | 0 |
| Anti-Dominant Strategy | 10 | 6 | 4 | 0 |
| Technical | 4 | 0 | 4 | 0 |
| Documentation | 6 | 2 | 4 | 0 |
| **Total** | **62** | **30** | **32** | **0** |

Note: Core Game requirements (REQ-001 through REQ-022) and Anti-Dominant Strategy requirements (REQ-043 through REQ-048) now have implementation file references pointing to `mobile-game/src/game/` files in the core-game-logic branch. Tests, QA, and Review columns will be filled by subsequent branches and review cycles.

Note: Implementation, Tests, QA, and Review columns will be filled by child branches as work progresses.

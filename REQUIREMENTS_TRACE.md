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
|---|---|---|---|---|---|---|---|---|---|
| REQ-001 | Game must be strategic, not reflex/speed | Core 1 | root | D001 | — | — | — | — | ✅ |
| REQ-002 | Precise choices with clear consequences | Core 2 | root | D001 | — | — | — | — | ✅ |
| REQ-003 | Multiplayer support (4 players) | Core 3, 12 | root | D001, D007 | — | — | — | — | ✅ |
| REQ-004 | No turn waiting (simultaneous) | Core 4 | root | D001 | — | — | — | — | ✅ |
| REQ-005 | Easy to understand, quick to get into | Core 5 | root | D001 | — | — | — | — | ✅ |
| REQ-006 | Not complex or overloaded | Core 6 | root | D001 | — | — | — | — | ✅ |
| REQ-007 | No heavy management or excess details | Core 7 | root | D001 | — | — | — | — | ✅ |
| REQ-008 | Match ≤ 30 minutes | Core 8 | root | D002 | — | — | — | — | ✅ |
| REQ-009 | Changing match conditions | Core 9 | root | D001, D008 | — | — | — | — | ✅ |
| REQ-010 | Comeback possible for losing player | Core 10 | root | D004 | — | — | — | — | ✅ |
| REQ-011 | Competition strong until end | Core 11 | root | D002, D004 | — | — | — | — | ✅ |
| REQ-012 | 4 players supported | Core 12 | root | D001 | — | — | — | — | ✅ |
| REQ-013 | 2v2 team mode | Core 13 | root | D005 | — | — | — | — | ✅ |
| REQ-014 | FFA 1v1v1v1 mode | Core 14 | root | D001 | — | — | — | — | ✅ |
| REQ-015 | Strategic game (not shallow points race) | Core 15 | root | D010 | — | — | — | — | ✅ |
| REQ-016 | No reward for hiding/passive play | Core 16 | root | D003 | — | — | — | — | ✅ |
| REQ-017 | Active play throughout must matter | Core 17 | root | D003 | — | — | — | — | ✅ |
| REQ-018 | Clear win condition | Core 18 | root | D002 | — | — | — | — | ✅ |
| REQ-019 | Match must not end early | Core 19 | root | D002 | — | — | — | — | ✅ |
| REQ-020 | Match stays open until final rounds | Core 20 | root | D002, D004 | — | — | — | — | ✅ |
| REQ-021 | Board/lanes have gameplay importance | Core 21 | root | D001 | — | — | — | — | ✅ |
| REQ-022 | Lead shifts repeatedly until end | Core 22 | root | D004, D008 | — | — | — | — | ✅ |

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
|---|---|---|---|---|---|---|---|---|---|
| REQ-043 | No always-correct strategy | Anti 1 | root | D008 | — | — | — | — | ✅ |
| REQ-044 | Best decision depends on game state | Anti 2 | root | D008 | — | — | — | — | ✅ |
| REQ-045 | Strategies counterable in different situations | Anti 3 | root | D008 | — | — | — | — | ✅ |
| REQ-046 | Changing match conditions force adaptation | Anti 4 | root | D008 | — | — | — | — | ✅ |
| REQ-047 | Same opening plan not always best | Anti 5 | root | D008 | — | — | — | — | ✅ |
| REQ-048 | Same late-game plan not always best | Anti 6 | root | D008 | — | — | — | — | ✅ |
| REQ-049 | Balance simulator tests for dominant strategies | Anti 7 | root | D008 | — | — | — | — | 🔄 |
| REQ-050 | >55% win-rate flagged as balance problem | Anti 8 | root | D008 | — | — | — | — | 🔄 |
| REQ-051 | Diverse bot styles test varied strategies | Anti 9 | root | D006, D008 | — | — | — | — | 🔄 |
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
|---|---|---|---|---|
| Core Game | 22 | 22 | 0 | 0 |
| Localization & Platform | 8 | 0 | 8 | 0 |
| Bot | 12 | 0 | 12 | 0 |
| Anti-Dominant Strategy | 10 | 6 | 4 | 0 |
| Technical | 4 | 0 | 4 | 0 |
| Documentation | 6 | 2 | 4 | 0 |
| **Total** | **62** | **30** | **32** | **0** |

Note: Implementation, Tests, QA, and Review columns will be filled by child branches as work progresses.

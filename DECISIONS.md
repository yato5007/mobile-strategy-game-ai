# Project Decisions

Every important decision must be recorded here.

For each decision:

1. Date.
2. Node.
3. Decision.
4. Reason.
5. Alternatives rejected.
6. Impact on other systems.

---

## Decision 001: Game Format — Lane-Control Simultaneous Strategy

- **Date:** 2026-05-25
- **Node:** root
- **Decision:** The game will be a lane-control simultaneous deployment strategy game. Players assign cards/tokens to lanes simultaneously each round, followed by simultaneous reveal and lane resolution.
- **Reason:** Satisfies ALL core constraints: strategic (not reflex), simultaneous (no turn waiting), easy to understand (assign cards to lanes, win lanes get points), under 30 minutes (10–12 rounds), supports 4 players and 2v2, allows comeback mechanics, requires active play, has clear win condition (most VP after all rounds), and allows lead shifts via hidden info and bluffing.
- **Alternatives rejected:**
  - Area-control (territory) strategy: More complex to implement, harder to make simultaneous, heavier management.
  - Resource strategy game: Risk of excessive complexity and management, harder to keep under 30 minutes.
  - Tactical board game (grid-based): More complex UI on mobile, harder to make simultaneous.
  - Abstract points race: Explicitly forbidden by constraints — game must be strategic.
  - Card battle game (direct player conflict): Less team-friendly, harder to make 2v2 work naturally.
- **Impact on other systems:** Defines core game logic (lane resolution, card system, VP calculation), UI (lane-based board layout), bots (lane evaluation heuristics), multiplayer (phase sync), balance (lane value tuning).

---

## Decision 002: Win Condition — Most Victory Points After Fixed Rounds

- **Date:** 2026-05-25
- **Node:** root
- **Decision:** Match consists of a fixed number of rounds (10–12). After all rounds, the player/team with the most Victory Points (VP) wins. No early termination.
- **Reason:** Fixed rounds guarantee match stays under 30 minutes, prevent early blowout wins, allow comebacks across multiple rounds, and make the end time predictable.
- **Alternatives rejected:**
  - First to reach VP target: Could end early, violating constraint 19 (match must not end early).
  - Eliminate opponents: Would force early elimination, violating comeback and active play constraints.
  - Timed match: Less predictable, could rush strategic planning.
- **Impact on other systems:** Core game loop is round-based. UI needs round counter. Bots need round-aware planning. Balance simulator works with fixed round count.

---

## Decision 003: Active Play Enforcement — Mandatory Card Assignment Per Round

- **Date:** 2026-05-25
- **Node:** root
- **Decision:** Every player must assign at least 1 card to a lane each round. Failure to do so results in forfeiting all contests and a -1 VP penalty.
- **Reason:** Prevents passive/hiding play. Ensures every player is engaged every round.
- **Alternatives rejected:**
  - Allow passing: Would enable passive play, violating constraint 16–17.
  - Gentle encouragement only: Not enforceable.
- **Impact on other systems:** Game logic must validate assignments. UI must prevent submission with 0 cards. Bots must always assign.

---

## Decision 004: Comeback Mechanic — Last-Place Bonuses + Escalating Late Rounds

- **Date:** 2026-05-25
- **Node:** root
- **Decision:** Trailing players receive bonus cards (extra draw + special comeback card). Later rounds have higher-value objectives.
- **Reason:** Enables comeback for losing players, keeps competition strong until end (constraints 10, 11, 20).
- **Alternatives rejected:**
  - Rubber-banding (weaken leader): Punishes good play, feels unfair.
  - No comeback mechanic: Violates constraint 10.
  - Shared resource bonus only: Not strong enough to close VP gaps.
- **Impact on other systems:** Bot branch needs comeback-aware strategy. Balance simulator must verify comeback win rate.

---

## Decision 005: 2v2 Team Model — Combined Team Presence, Shared Planning View

- **Date:** 2026-05-25
- **Node:** root
- **Decision:** Teammates combine strength in each lane, can see each other's cards/assignments during planning, and share combined VP total.
- **Reason:** Enables meaningful teamwork without requiring voice chat. Simple to implement and understand.
- **Alternatives rejected:**
  - Separate team scoring with shared pool: More complex, less intuitive.
  - Alternating turns: Violates simultaneous constraint.
  - No team special mechanics: Would make 2v2 feel like two separate FFA games.
- **Impact on other systems:** UI needs team planning view. Bot branch needs team-aware AI. Game logic handles combined strength calculation.

---

## Decision 006: Bot AI Approach — Weighted Heuristic System (Not ML)

- **Date:** 2026-05-25
- **Node:** root
- **Decision:** Bot AI uses a weighted heuristic system evaluating lane importance, opponent patterns, and strategic style preferences. Difficulty levels control evaluation depth and noise.
- **Reason:** Predictable, testable, works without training data, easy to implement in TypeScript, easy to tune difficulty and style.
- **Alternatives rejected:**
  - Machine learning: Requires training, data, infrastructure. Overkill for this project.
  - Rule-based only: Too rigid, easy to exploit.
  - Monte Carlo simulation: Good but computationally heavy for mobile.
- **Impact on other systems:** Bot code is self-contained with clear interface to game logic. Balance simulator can use bots for testing.

---

## Decision 007: Multiplayer Progression — Local Mock First, Supabase Later

- **Date:** 2026-05-25
- **Node:** root
- **Decision:** Implement local mock multiplayer first (same-device simulation of multiple players including bots). Real online multiplayer using Supabase Realtime is additive later.
- **Reason:** De-risks development. Core game logic and UI work without network complexity. Local mock can simulate all scenarios for testing.
- **Alternatives rejected:**
  - Full online from start: Too complex, would delay prototype significantly.
  - Peer-to-peer: Harder to implement, trust issues.
- **Impact on other systems:** Game state must be serializable for future network sync. Multiplayer branch focuses on state synchronization protocol.

---

## Decision 008: Anti-Dominant Strategy — Rotating Objectives + Hidden Info + Balance Tests

- **Date:** 2026-05-25
- **Node:** root
- **Decision:** Prevent dominant strategies through: (1) rotating lane objectives each round, (2) hidden information (cards and planned assignments), (3) varied card pool, (4) balance simulator detecting >55% win-rate strategies as flags.
- **Reason:** Required by constraints (anti-dominant strategy section). Multiple layers of mitigation prevent any single strategy from always winning.
- **Alternatives rejected:**
  - Single mitigation layer: Not robust enough.
  - Symmetric perfect information: Would enable solved optimal play.
- **Impact on other systems:** Card pool design in Core Game Logic must support variety. Balance simulator must test across all bot styles.

---

## Decision 009: "Control All Lanes" Achievement — Team-Only or Reworked

- **Date:** 2026-05-25
- **Node:** root
- **Decision:** The "Control All Lanes" achievement (5 VP bonus) will be team-only (2v2 mode) or replaced with a more achievable bonus in FFA. Spec-critic correctly identified it was nearly impossible in FFA.
- **Reason:** FFA players cannot realistically control 3–5 lanes simultaneously.
- **Alternatives rejected:**
  - Keep as-is in FFA: Would be a "never triggered" achievement, wasted complexity.
  - Make it "Control 2/3 of lanes": Achievable but less exciting.
- **Impact on other systems:** Core Game Logic branch needs to adjust achievement conditions per game mode.

---

## Decision 010: Anti-Points-Race Depth — Meaningful Decisions per Round

- **Date:** 2026-05-25
- **Node:** root
- **Decision:** To ensure the game is a genuine strategy game (not a shallow points race), the Core Game Logic branch must design cards and mechanics such that:
  1. Bluffing (playing weak cards on high-value lanes to mislead) is viable.
  2. Tactic cards create non-linear effects (sabotage, reinforce, spy).
  3. Lane choices involve risk assessment (commit strength vs. conserve).
  4. Hand management matters (which cards to use now vs. save).
  5. Positional play (which lanes to contest) requires reading opponents.
- **Reason:** Explicitly addresses spec-critic's M4 finding about points-race risk.
- **Alternatives rejected:**
  - Add more resource systems: Would increase complexity, violating constraint 6.
  - Make it a purely tactical game (no scoring): Would make win condition unclear.
- **Impact on other systems:** Core Game Logic design must prioritize tactical depth. Balance tests must verify that different strategies (bluff-heavy, strength-heavy, balanced) have different success rates depending on game state.

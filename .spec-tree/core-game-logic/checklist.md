# Core Game Logic Engine — Checklist

## Completion Checklist

### Scope and Constitution
- [ ] Constitution clearly defines boundaries (what's owned vs what's not).
- [ ] No UI dependencies in scope.
- [ ] No cross-branch scope creep.
- [ ] All parent constraints (root spec) are respected.

### Type Definitions (`types.ts`)
- [ ] All game entity types defined (PlayerId, Card, Lane, GameState, etc.).
- [ ] All types are strict (no `any`, no implicit any).
- [ ] All types are JSON-serializable (no functions, classes with methods).
- [ ] All event types defined in a discriminated union.
- [ ] Card types fully cover unit, tactic, objective, comeback categories.

### Constants (`constants.ts`)
- [ ] MAX_ROUNDS = 12.
- [ ] Lane unlock schedule defined.
- [ ] VP values for all sources defined.
- [ ] Hand size and draw rates defined.
- [ ] Max cards per lane (3) enforced.
- [ ] Comeback bonus values defined.
- [ ] Timing constants defined.

### Card System (`cards.ts`)
- [ ] All staple cards defined (Scout ×3, Soldier ×3, Knight ×2, Champion ×1, Bluff ×2, Sabotage ×1, Reinforce ×1).
- [ ] Rotating card pool defined (6 cards, 2 selected per match).
- [ ] Deck generation works with staple + rotating.
- [ ] Fisher-Yates shuffle implemented.
- [ ] Draw with reshuffle works.
- [ ] Comeback card pool with weighted distribution.
- [ ] Discard tracking works.

### Game Engine (`engine.ts`)
- [ ] `createGame(config)` initializes correctly.
- [ ] Planning phase accepts valid assignments, rejects invalid.
- [ ] Empty submission correctly penalized (-1 VP, forfeit contests).
- [ ] Reveal phase makes all assignments visible.
- [ ] Tactic effects resolved in correct order.
- [ ] Lane resolution handles ties correctly (split VP, rounded down).
- [ ] VP awarded correctly for all sources.
- [ ] Comeback detection works (trailing player(s) identified).
- [ ] Comeback bonus correctly distributed (extra draw + comeback card).
- [ ] Cleanup phase discards used cards, draws new cards.
- [ ] Round counter increments correctly.
- [ ] Game ends after MAX_ROUNDS.
- [ ] Win condition and tie-breakers work.
- [ ] 2v2 team mode: combined strength calculation works.
- [ ] 2v2 team mode: combined VP tracking works.
- [ ] FFA mode: individual tracking works.
- [ ] All tactic effects implemented:
  - [ ] Bluff (deception, 0 real strength).
  - [ ] Sabotage (-2 to opponent).
  - [ ] Reinforce (+3 to self).
  - [ ] Spy (reveal opponent hand top 2 — private).
  - [ ] Shield (negates sabotage).
  - [ ] Retreat (withdraw units, void targeting).
  - [ ] Ambush (VP denial on loss).
- [ ] All comeback cards implemented:
  - [ ] Determination (+3 strength).
  - [ ] Last Stand (gain 1 VP if lose by ≤2).
  - [ ] Surprise Rally (+1 to all contested lanes).
  - [ ] Fortuna (1–3 VP at round end).

### Event System (`events.ts`)
- [ ] All 12+ event types defined.
- [ ] Event emitter works (subscribe, unsubscribe, emit, clear).
- [ ] Engine emits events at correct points.
- [ ] Events carry appropriate payloads.
- [ ] Spy event only emitted to the player who used it.

### Achievement System (`achievements.ts`)
- [ ] "Control All Lanes" — only in 2v2 mode.
- [ ] "Dominate 3 Lanes" — only in FFA mode.
- [ ] "First Blood" — first VP scorer in rounds 1–3.
- [ ] "Comeback King" — last place → winner.
- [ ] "No Mercy" — strength ≥10 in a lane.
- [ ] "Perfectionist" — win all contested lanes in one round.
- [ ] Achievements only trigger once per match per player.
- [ ] Achievement award emits event.

### State Management (`state.ts`)
- [ ] `getStandings(game)` returns sorted list.
- [ ] `isGameOver(game)` checks round count.
- [ ] `getGameResult(game)` returns winner and final scores.
- [ ] `serialize(game)` produces valid JSON.
- [ ] `deserialize(data)` produces identical game state.
- [ ] Round-trip test: serialize → deserialize → no data loss.

### Public API (`index.ts`)
- [ ] All essential functions exported.
- [ ] All types exported.
- [ ] No internal/private functions leaked.
- [ ] No UI imports anywhere.
- [ ] JSDoc comments on all public exports.

### Edge Cases
- [ ] All 4 players tie in a lane → VP split correctly (0 VP for 4-way tie on standard lane).
- [ ] Player disconnects mid-round → penalty applied.
- [ ] Deck empty → reshuffle from discard.
- [ ] All players skip → all penalized, no VP.
- [ ] Team mode: one teammate disconnects → other plays alone.
- [ ] Comeback in round 2+ (not round 1).
- [ ] Ambush + win → no effect.
- [ ] Shield blocks exactly one sabotage.
- [ ] Last Stand + Ambush → combined effect.
- [ ] Player at 0 VP cannot go negative.
- [ ] Max 3 cards per lane enforced.

### Compliance with Parent Decisions
- [ ] D001: Lane-control simultaneous strategy implemented correctly.
- [ ] D002: Fixed rounds, no early termination.
- [ ] D003: Active play enforcement (≥1 card per round).
- [ ] D004: Comeback bonuses for trailing players.
- [ ] D005: 2v2 combined strength and scoring.
- [ ] D008: Rotating objectives via lane system.
- [ ] D009: "Control All Lanes" team-only; FFA alternative exists.
- [ ] D010: Bluffing, tactic cards, risk assessment, hand management, positional play all implemented.

### Code Quality
- [ ] No `any` types (strict mode).
- [ ] All public functions have type signatures.
- [ ] Functions are pure where possible.
- [ ] No circular dependencies.
- [ ] No UI-related imports.
- [ ] Consistent naming conventions (camelCase).
- [ ] Error messages are descriptive.
- [ ] Validation functions return error strings or throw typed errors.

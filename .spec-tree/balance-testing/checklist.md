# Balance and Testing — Checklist

## Pre-Implementation

- [ ] Jest configuration file created (`mobile-game/jest.config.js`) with ts-jest preset
- [ ] Test script added to `package.json` (`"test": "jest"`)
- [ ] npm test runs without errors on initial empty test suite
- [ ] Test directory exists: `mobile-game/src/game/__tests__/`
- [ ] Bot AI branch provides a working bot controller interface
- [ ] Minimum viable "dumb bot" available for simulator dependency

## Unit Tests — Types

- [ ] `types.test.ts` created
- [ ] All type interfaces verified to accept valid values
- [ ] Required fields reject undefined where appropriate
- [ ] Discriminated union (`GameEvent`) types verified exhaustive

## Unit Tests — Constants

- [ ] `constants.test.ts` created
- [ ] `MAX_ROUNDS` equals 12
- [ ] `LANE_UNLOCK_SCHEDULE` has correct structure and values
- [ ] `PLANNING_TIME`, `REVEAL_TIME`, `RESOLUTION_TIME` are positive
- [ ] `STARTING_HAND_SIZE` equals 6
- [ ] `DRAW_PER_ROUND` equals 2
- [ ] `MAX_CARDS_PER_LANE` equals 3
- [ ] `VP_STANDARD_LANE` equals 2
- [ ] `VP_HIGH_VALUE_LANE` equals 3
- [ ] `PENALTY_SKIP_VP` equals 1
- [ ] `COMEBACK_EXTRA_DRAW` equals 1
- [ ] `COMEBACK_START_ROUND` equals 2
- [ ] `ACHIEVEMENT_VP` entries all present and positive
- [ ] `TACTIC_RESOLUTION_ORDER` contains all 7 effect types
- [ ] `STAPLE_UNITS` sum matches expected total cards count
- [ ] `STAPLE_TACTICS` sum matches expected total cards count
- [ ] `ROTATING_CARD_POOL` has 6 entries
- [ ] `COMEBACK_CARDS` weights sum to 100

## Unit Tests — Cards

- [ ] `cards.test.ts` created
- [ ] `createDeck()` returns correct total card count (3+3+2+1 + 2+1+1 + 2 = 15 base)
- [ ] `createDeck()` with rotating choices adds 2 extra tactic cards
- [ ] `shuffleDeck()` returns all original elements (same length, same IDs)
- [ ] `shuffleDeck()` with seed produces deterministic order
- [ ] `drawCards()` draws correct number of cards
- [ ] `drawCards()` reshuffles discard pile when deck is empty
- [ ] `drawCards()` returns empty array when both deck and discard are empty
- [ ] `drawStartingHand()` returns 6 cards and updates deck
- [ ] `drawTurnCards()` returns 2 cards
- [ ] `drawComebackCard()` returns a card with `isComeback: true`
- [ ] `drawComebackCard()` weighted selection works (verify distribution over many draws)
- [ ] `discardCards()` removes correct cards from hand and adds to discard pile
- [ ] `resetCardIdCounter()` resets counter for deterministic IDs
- [ ] `pickRandomRotatingCards()` returns 2 valid tactic effect types
- [ ] `pickRandomRotatingCards()` with seed is deterministic

## Unit Tests — Engine

- [ ] `engine.test.ts` created
- [ ] `createGame()` returns valid GameState with correct initial values
- [ ] `createGame()` respects mode, maxRounds, playerSlots config
- [ ] `createGame()` emits GameStarted event
- [ ] `validateAssignment()` rejects 0-card submission (active play enforcement)
- [ ] `validateAssignment()` rejects cards not in hand
- [ ] `validateAssignment()` rejects excessive cards in one lane
- [ ] `validateAssignment()` rejects invalid lane index
- [ ] `validateAssignment()` rejects if not in planning phase
- [ ] `validateAssignment()` accepts valid submission
- [ ] `submitAssignments()` updates player state and lane assignments
- [ ] `submitAssignments()` removes cards from hand
- [ ] `submitAssignments()` emits PlayerSubmitted event
- [ ] `isPlanningComplete()` returns false if not all submitted
- [ ] `isPlanningComplete()` returns true when all submitted
- [ ] `forceSubmitRemaining()` applies to players who haven't submitted
- [ ] `forceSubmitRemaining()` correctly handles disconnected players
- [ ] `revealAssignments()` transitions round phase to 'reveal'
- [ ] `revealAssignments()` processes spy effects
- [ ] `resolveRound()` transitions phase to 'resolution'
- [ ] `resolveRound()` applies skip penalties for 0-card submissions
- [ ] `resolveRound()` calculates lane strengths correctly
- [ ] `resolveRound()` processes tactic effects in correct order
- [ ] `resolveLane()` correctly determines FFA winner (highest strength)
- [ ] `resolveLane()` correctly determines 2v2 team winner
- [ ] `resolveLane()` handles ties (VP split)
- [ ] `resolveLane()` awards VP to winner/winning team
- [ ] `resolveLane()` updates lane streak
- [ ] `resolveLane()` applies objective bonus VP
- [ ] Tactic: Sabotage reduces opponent strength by correct magnitude
- [ ] Tactic: Sabotage respects shielded players
- [ ] Tactic: Sabotage in 2v2 does not target teammate
- [ ] Tactic: Reinforce adds correct strength
- [ ] Tactic: Shield blocks next sabotage
- [ ] Tactic: Retreat voids all own strength
- [ ] Tactic: Bluff has no mechanical effect
- [ ] Tactic: Spy reveals two cards (handled in reveal phase)
- [ ] Tactic: Ambush denies winner 1 VP after resolution
- [ ] Tactic: Last Stand (comeback) awards VP if close loss
- [ ] `processCleanup()` transitions phase to 'cleanup'
- [ ] `processCleanup()` processes comeback bonuses for trailing players
- [ ] `processCleanup()` draws turn cards for each player
- [ ] `processCleanup()` checks achievements
- [ ] `processCleanup()` increments round counter
- [ ] `processCleanup()` resets lanes for next round
- [ ] `processCleanup()` emits GameOver when maxRounds reached
- [ ] `processCleanup()` emits RoundComplete and starts next round
- [ ] `getStandings()` returns sorted order by VP, then laneWins, then firstScoreRound
- [ ] `getStandings()` handles 2v2 team standings
- [ ] `getGameResult()` returns correct winner
- [ ] `getGameResult()` handles draws correctly
- [ ] `getGameResult()` uses lane wins as tiebreaker

## Unit Tests — State

- [ ] `state.test.ts` created
- [ ] `getActiveLaneCount()` returns 3 for rounds 1-3
- [ ] `getActiveLaneCount()` returns 4 for rounds 4-6
- [ ] `getActiveLaneCount()` returns 5 for rounds 7+
- [ ] `getLaneObjectiveForRound()` returns valid objective object
- [ ] `getLaneObjectiveForRound()` has higher-value objectives in later rounds
- [ ] `serialize()` produces valid JSON without function references
- [ ] `deserialize()` restores GameState structure
- [ ] `serialize()` + `deserialize()` round-trip preserves all primitive fields
- [ ] `cloneGameState()` produces independent copy (mutations don't affect original)

## Unit Tests — Events

- [ ] `events.test.ts` created
- [ ] `createEventEmitter()` returns emitter with subscribe/emit/clear methods
- [ ] `subscribe()` adds handler, returns unsubscribe function
- [ ] `emit()` calls all subscribed handlers
- [ ] `emit()` passes correct event payload
- [ ] Unsubscribed handler is not called on emit
- [ ] Multiple handlers for same event type all receive events
- [ ] `clear()` removes all subscriptions
- [ ] Error in one handler doesn't prevent others from receiving event
- [ ] Subscribe returns a unique unsubscribe per call

## Unit Tests — Achievements

- [ ] `achievements.test.ts` created
- [ ] `checkAchievements()` runs all achievement checks
- [ ] First Blood triggers for first player to earn VP
- [ ] First Blood only triggers once (global)
- [ ] Dominate 3 Lanes triggers in FFA with 3+ lanes dominated
- [ ] Dominate 3 Lanes does not trigger in 2v2
- [ ] Control All Lanes triggers in 2v2 with team leading all active lanes
- [ ] Control All Lanes does not trigger in FFA
- [ ] Comeback King triggers for winner who overcame VP deficit
- [ ] No Mercy triggers with 10+ strength in one lane
- [ ] Perfectionist triggers when winning all contested lanes
- [ ] Each achievement awards correct VP from ACHIEVEMENT_VP constants
- [ ] Achievements only trigger once per match

## Integration Tests

- [ ] `integration.test.ts` created
- [ ] Full game simulation: create → all rounds → complete without errors
- [ ] Full game with FFA mode produces valid result
- [ ] Full game with 2v2 mode produces valid result
- [ ] Event emission sequence verified across full game
- [ ] State consistency check: player VP totals match expected after each round
- [ ] Edge case: All players submit no cards (all penalized)
- [ ] Edge case: All players tie on all lanes
- [ ] Edge case: Single active lane (round 1-3)
- [ ] Edge case: 5 active lanes (round 7+)
- [ ] Edge case: All bots with same style
- [ ] Edge case: Only 2 players connected, 2 disconnected
- [ ] Edge case: Deck exhaustion mid-game (reshuffle triggers)

## Balance Simulator

- [ ] `mobile-game/src/testing/balanceSimulator.ts` created
- [ ] `BalanceSimulator` class with `runSimulation()` method
- [ ] Simulation config accepts mode, games count, bot configurations, random seed
- [ ] Simulator creates game with fixed seed for reproducibility
- [ ] Simulator runs all 12 rounds automatically
- [ ] Simulator collects win rates per slot and per bot style
- [ ] Simulator measures match duration (simulated seconds from phase timestamps)
- [ ] Simulator detects comeback wins (last-place player wins)
- [ ] Simulator detects early leader persistence (round-1 leader overall winner)
- [ ] Simulator generates BalanceFlags for dominant strategies (>55%)
- [ ] Simulator generates BalanceFlags for low comeback rate (<10%)
- [ ] Simulator generates BalanceFlags for long matches (>30 min)
- [ ] Simulator results include confidence intervals

## FFA Simulation Scenarios

- [ ] FFA: 4x Aggressive bots × 100 games — win rates recorded
- [ ] FFA: 4x Defensive bots × 100 games — win rates recorded
- [ ] FFA: 4x Balanced bots × 100 games — win rates recorded
- [ ] FFA: 4x Disruptive bots × 100 games — win rates recorded
- [ ] FFA: 4x Objective-focused bots × 100 games — win rates recorded
- [ ] FFA: 4x Comeback-focused bots × 100 games — win rates recorded
- [ ] FFA: 4x Team-support bots × 100 games — win rates recorded
- [ ] FFA: 4x Mixed style (1 each) × 200 games — no single style >55%
- [ ] FFA: Mixed difficulty (1 Easy, 1 Normal, 1 Hard, 1 Expert) × 200 games — difficulty correlates with win rate

## 2v2 Simulation Scenarios

- [ ] 2v2: 2x Aggressive vs 2x Defensive × 100 games
- [ ] 2v2: 2x Balanced vs 2x Disruptive × 100 games
- [ ] 2v2: 2x Objective vs 2x Comeback × 100 games
- [ ] 2v2: Same styles both teams × 200 games — balanced win rate (~50% each)
- [ ] 2v2: Mixed difficulty teams (Easy+Normal vs Hard+Expert) × 200 games — harder team wins more

## Comeback & Dominance Analysis

- [ ] Comeback scenario: 5 VP head start → 200 games → comeback win rate >10%
- [ ] Comeback scenario: 10 VP head start (2v2) → 200 games → comeback win rate >10%
- [ ] Dominance: Same opening pattern (Scout+Soldier lanes 0-1) × 200 games — <55%
- [ ] Dominance: All 7 styles tested across FFA and 2v2 — none exceed 55%
- [ ] Passive play scenario: 1 passive bot vs 3 aggressive bots — passive bot wins <20%
- [ ] Early leader scenario: Round 1 leader wins overall <70% of games

## Reporting

- [ ] Simulation results documented in balance-testing results artifact
- [ ] Any dominant strategies flagged with specific win rates and confidence intervals
- [ ] Comeback analysis documented (how often trailing players win)
- [ ] Match duration analysis documented
- [ ] Recommendations for game tuning (if any) recorded in DECISIONS.md
- [ ] Tuning changes tested by re-running simulations

## Final

- [ ] All checklist items above completed
- [ ] Review sign-off obtained
- [ ] QA sign-off obtained
- [ ] Integration sign-off obtained

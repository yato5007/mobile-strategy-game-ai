# Core Game Logic Engine — Tasks

## Phase 1: Types and Constants

### Task 1.1: Create type definitions
- [ ] Define `PlayerId`, `TeamId`, `GameMode` types.
- [ ] Define `CardType`, `CardId`, `Card` interface.
- [ ] Define `TacticEffectType`, `TacticEffect` interface.
- [ ] Define `LaneObjectiveType`, `LaneObjective`, `LaneState` interfaces.
- [ ] Define `RoundPhase`, `GamePhase` types.
- [ ] Define `PlayerState`, `GameState` interfaces.
- [ ] Define `CardAssignment` type.
- [ ] Define `GameConfig`, `GameResult`, `Standing` types.
- [ ] Define `GameEvent` union type for all events.
- [ ] Ensure all types are JSON-serializable (no function types, no class instances).

### Task 1.2: Create game constants
- [ ] Define `MAX_ROUNDS = 12`.
- [ ] Define `LANE_COUNT_BASE = 3`.
- [ ] Define lane unlock schedule.
- [ ] Define VP values for standard/high-value lanes.
- [ ] Define timing constants (PLANNING_TIME, etc.).
- [ ] Define hand size constants (STARTING_HAND, DRAW_PER_ROUND).
- [ ] Define max cards per lane per player.
- [ ] Define comeback bonus values.
- [ ] Define achievement VP rewards.

## Phase 2: Card System

### Task 2.1: Define card data
- [ ] Define all unit cards (Scout, Soldier, Knight, Champion, General).
- [ ] Define all tactic cards (Bluff, Sabotage, Reinforce, Spy, Shield, Retreat, Ambush).
- [ ] Define all objective cards.
- [ ] Define all comeback cards (Determination, Last Stand, Surprise Rally, Fortuna).

### Task 2.2: Implement deck and draw
- [ ] Implement `createDeck()` — generate staple + rotating card pool.
- [ ] Implement `shuffleDeck(deck)` — Fisher-Yates shuffle.
- [ ] Implement `drawCards(deck, count)` — draw from top, handle reshuffle.
- [ ] Implement `createComebackCardDeck()` — weighted pool.
- [ ] Implement `drawComebackCard()` — weighted random selection.
- [ ] Implement `discardCards(hand, cardIds)` — move cards to discard pile.

## Phase 3: Game Engine Core

### Task 3.1: Game initialization
- [ ] Implement `createGame(config)` — create initial GameState from GameConfig.
- [ ] Initialize player hands (shuffle deck, draw starting hand).
- [ ] Initialize lanes (first 3 active, objectives assigned).
- [ ] Set initial game phase to 'in-progress'.
- [ ] Set initial round phase to 'planning'.

### Task 3.2: Planning phase
- [ ] Implement `submitAssignments(game, playerId, assignments)` — record player's card assignments.
- [ ] Implement `validateAssignment(game, playerId, assignments)`:
  - Must assign ≥ 1 card (reject empty).
  - Cannot assign more than 3 per lane.
  - Cards must be in player's hand.
  - Lanes must be active.
- [ ] Implement `isPlanningComplete(game)` — all players submitted? Timeout?
- [ ] Implement `forceSubmitForInactive(game, playerId)` — auto-empty for disconnected/skipped.

### Task 3.3: Reveal phase
- [ ] Implement `revealAssignments(game)` — reveal all hidden assignments.
- [ ] Process pre-resolution tactic triggers (Spy — emit private event to user).

### Task 3.4: Resolution phase
- [ ] Implement `resolveLane(game, laneIndex)`:
  - Calculate total strength per player.
  - Apply tactic effects in order (Retreat → Shield → Sabotage → Reinforce → Bluff → Ambush).
  - Determine winner and tie status.
  - Award VP.
  - Emit LaneResolved event.
- [ ] Implement `resolveAllLanes(game)` — iterate active lanes.
- [ ] Implement `awardVP(game, playerId, amount, source, laneIndex?)`.
- [ ] Implement `applyAmbushEffect(game, lane)` — VP denial if loser played Ambush.
- [ ] Implement `applyActivePlayPenalty(game, playerId)` — -1 VP if empty submission.

### Task 3.5: Cleanup phase
- [ ] Implement `processCleanup(game)`:
  - Discard used cards.
  - Determine trailing players/teams.
  - Award comeback bonuses.
  - Draw replenishment cards.
  - Update lane objectives.
  - Check achievements.
  - Increment round counter.
- [ ] Implement `determineTrailingPlayers(game)` — VP analysis.
- [ ] Implement `awardComebackBonus(game, playerId)` — extra draw + comeback card.

## Phase 4: State Management

### Task 4.1: State queries
- [ ] Implement `getStandings(game)` — sorted player rankings with VP.
- [ ] Implement `getPlayerState(game, playerId)` — hand, VP, assignments.
- [ ] Implement `getLaneState(game, laneIndex)` — lane details.
- [ ] Implement `isGameOver(game)` — round > MAX_ROUNDS.
- [ ] Implement `getGameResult(game)` — final scores, winner(s), stats.

### Task 4.2: State serialization
- [ ] Implement `serialize(game)` — JSON-safe state.
- [ ] Implement `deserialize(data)` — reconstruct state from JSON.
- [ ] Ensure no information loss in round-trip.

## Phase 5: Event System

### Task 5.1: Event emitter
- [ ] Implement `createEventEmitter()` — factory for typed event system.
- [ ] Implement `subscribe(eventType, handler)`.
- [ ] Implement `unsubscribe(eventType, handler)`.
- [ ] Implement `emit(eventType, payload)` — notify all subscribers.
- [ ] Implement `clearSubscriptions()`.

### Task 5.2: Wire events to engine
- [ ] Add event emission to engine functions (game started, round started, lane resolved, VP awarded, achievement unlocked, game over, etc.).

## Phase 6: Achievement System

### Task 6.1: Achievement definitions
- [ ] Define `AchievementDefinition` interface.
- [ ] Implement all achievement definitions as data.

### Task 6.2: Achievement checking
- [ ] Implement `checkAchievements(game)` — evaluate all conditions.
- [ ] Implement per-achievement condition functions.
- [ ] Implement award logic (VP bonus, event emission).
- [ ] Ensure achievements only trigger once.

## Phase 7: Public API

### Task 7.1: Barrel export
- [ ] Create `index.ts` with all public exports.
- [ ] Verify no internal implementation details leak.
- [ ] Verify no UI imports exist.

## Phase 8: QA and Review

### Task 8.1: Quality assurance
- [ ] Verify all types are correct and complete.
- [ ] Verify all functions compile with strict TypeScript.
- [ ] Verify all edge cases (ties, empty lanes, disconnect, all players skip, max cards).
- [ ] Verify state serialization round-trip.

### Task 8.2: Review
- [ ] Verify compliance with parent spec.
- [ ] Verify compliance with D010 (bluffing, tactic cards, risk assessment, hand management, positional play).
- [ ] Verify no scope creep.
- [ ] Document any changes to architecture.

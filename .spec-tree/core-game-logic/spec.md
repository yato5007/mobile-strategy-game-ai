# Core Game Logic Engine — Specification

## 1. Game State Model

### 1.1 Players
- 4 players, identified by `PlayerId` (0, 1, 2, 3).
- In 2v2 mode, teams are `TeamId` 0 (players 0,1) and 1 (players 2,3).
- Each player has:
  - `hand`: array of Card objects (hidden from opponents).
  - `vpTotal`: accumulated victory points.
  - `isConnected`: boolean for player presence.
  - `isActive`: boolean (true unless disconnected or penalized).
  - `currentRoundAssignments`: map of laneIndex → Card (set during planning).
  - `hasSubmitted`: boolean (did they finalize their assignments this round).

### 1.2 Lanes
- 3 lanes active from round 1.
- Lane 4 unlocks at round 4.
- Lane 5 unlocks at round 7.
- Each lane has:
  - `index`: number (0-based).
  - `isActive`: boolean (locked/unlocked based on round).
  - `vpValue`: number of VP for winning this lane (1–3, changes per round).
  - `objective`: LaneObjective (type + VP bonus + description).
  - `totalStrengthPerPlayer`: `Record<PlayerId, number>` — calculated during resolution.
  - `tacticCardsPlayed`: tactic cards assigned to this lane (for pre-resolution effects).
  - `winner`: `PlayerId | null` after resolution.
  - `isTie`: boolean after resolution.
  - `streakCount`: how many consecutive rounds the same player/team has won this lane (for dynamic difficulty).

### 1.3 Cards
Each card has:
- `id`: unique string identifier.
- `type`: CardType ('unit' | 'tactic' | 'objective' | 'comeback').
- `name`: string (for localization key).
- `strength`: number (0–5, primary resolution value for unit/objective cards).
- `tacticEffect`: TacticEffect | null (for tactic cards).
- `description`: string (localization key).
- `isPlayed`: boolean (tracking state).
- `isDiscarded`: boolean.

### 1.4 Game Modes
- `'ffa'`: 4 players, each for themselves.
- `'2v2'`: 2 teams of 2, combined strength per lane, combined VP.

### 1.5 Round Phase
- `'planning'`: Players assign cards to lanes.
- `'reveal'`: All assignments revealed simultaneously.
- `'resolution'`: Lanes resolved, VP awarded, effects applied.
- `'cleanup'`: Discard used cards, draw new cards, update objectives, check achievements.

### 1.6 Game Phase
- `'waiting-for-players'`: Pre-match lobby.
- `'in-progress'`: Match actively running.
- `'completed'`: All rounds finished, winner determined.

## 2. Round Lifecycle

### 2.1 Planning Phase
1. Each player sees their hand, the board (lanes with objectives), current scores.
2. Player assigns 1 or more cards to lanes (tap lane → select card → confirm).
3. Player may assign 1 tactic card face-down to a lane (affects resolution).
4. In 2v2, teammates see each other's assignments in real-time.
5. Player finalizes submission. Once submitted, assignments are locked for that round.
6. Phase ends when all players submit OR planning timeout expires (45s default).
7. If a player has not submitted when phase ends, their current assignments (possibly empty) are locked.
8. **Mandatory assignment rule**: every player must assign at least 1 card to any lane. If a player's finalized assignments are empty, apply penalty: forfeit all contests, -1 VP penalty.

### 2.2 Reveal Phase
1. All assignments revealed simultaneously.
2. Tactic cards with pre-resolution triggers fire immediately (e.g., "Spy" reveals opponent's strength in a lane).
3. Display resolved assignments to all players.
4. Duration: short (5s animation/display).

### 2.3 Resolution Phase
1. For each active lane (index order):
   a. Calculate each player's total strength in this lane (sum of unit/objective card strengths).
   b. Apply tactic effects that modify strength (sabotage reduces opponent, reinforce adds, shield blocks one effect).
   c. Determine highest total strength.
   d. **No ties**: If two or more players/teams tie for highest, the VP for that lane is **split equally** (rounded down). If split results in 0, no VP awarded.
   e. Award VP to winner(s).
   f. Record winner/tie status.
   g. Announce result.
2. Check for round-specific objectives (some objectives may award bonus VP to lane winner regardless of lane VP).

### 2.4 Cleanup Phase
1. Discard all used cards (played this round) from hands.
2. Apply comeback bonus:
   - Determine trailing player(s)/team(s).
   - Trailing player gets +1 card draw + 1 special "comeback" card.
   - In FFA: only last-place player(s).
   - In 2v2: trailing team gets bonuses (split between members).
3. Each player draws replenishment cards (standard draw = 2 cards).
4. Update lane objectives for next round (rotate objectives, may unlock new lanes).
5. Check achievements (one-time bonuses).
6. Increment round counter.
7. If round > MAX_ROUNDS, end match. Otherwise, transition to planning phase of next round.

## 3. Card System

### 3.1 Card Types

#### Unit Cards (Type: 'unit')
- Strength 1–5.
- Basic deployable units.
- No special effect (except strength comparison).
- Examples:
  - "Scout" (strength 1)
  - "Soldier" (strength 2)
  - "Knight" (strength 3)
  - "Champion" (strength 4)
  - "General" (strength 5 — rare, limited to 1 per deck)

#### Tactic Cards (Type: 'tactic')
Each tactic card has a `tacticEffect` with an `effectType` and parameters.
- **Bluff** — Play a card face-down. During reveal, it appears as strength 2 but has no real effect. Creates uncertainty for opponents. (0 strength, but valuable for deception.)
- **Sabotage** — Reduce opponent's total strength in this lane by 2 (choose a target player in FFA, or highest opponent in 2v2).
- **Reinforce** — Add +3 strength to your total in this lane (in addition to any unit cards).
- **Spy** — Before resolution, reveal the top 2 cards of one opponent's hand. Visible only to the spy user.
- **Shield** — Protect one of your lanes from sabotage/shield effects this round. Negates one sabotage targeting that lane.
- **Retreat** — Withdraw all your units from a lane after reveal. Any bonus effects targeting you in that lane are voided. You still contest but at 0 strength (avoids negative effects).
- **Ambush** — If you lose this lane, deal -1 VP to the winner (VP denial).

#### Objective Cards (Type: 'objective')
- Higher strength (3–5) but limited availability.
- Required to capture round-specific objectives.
- Some objectives require an Objective card to claim bonus VP.
- Example: "Capture the Flag" — if you win this lane with this card, gain +2 bonus VP.

#### Comeback Cards (Type: 'comeback')
- Only given to trailing players via comeback bonus.
- "Determination" — +3 strength in one lane (single use).
- "Last Stand" — If you lose this lane by ≤2, you gain 1 VP anyway.
- "Surprise Rally" — +1 strength to ALL lanes you contest this round.
- "Fortuna" — Roll: gain 1–3 VP at end of round (for extreme catch-up).

### 3.2 Deck Construction
- Each player has a personal deck at the start of the match.
- **Staple cards** (always present, identical for all players):
  - 3× Scout (strength 1)
  - 3× Soldier (strength 2)
  - 2× Knight (strength 3)
  - 1× Champion (strength 4)
  - 2× Bluff
  - 1× Sabotage
  - 1× Reinforce
- **Rotating cards** (randomly selected from pool each match — ensures variety):
  - 2 cards from a pool of 6: Spy, Shield, Retreat, Ambush, extra Sabotage, extra Reinforce
- Total deck size: ~14 staple + 2 rotating = 16 cards per player per match.
- Deck is shuffled at match start.

### 3.3 Hand and Draw
- Starting hand: 6 cards.
- Each round draw: 2 cards (after cleanup).
- Draw from deck. If deck is empty, shuffle discard pile into deck.
- Comeback bonus: trailing player draws +1 extra card + 1 comeback card.
- Maximum hand size: no hard cap (but unused cards carry over; efficient play is rewarded).

## 4. Victory Points and Win Condition

### 4.1 VP Sources
| Source | VP | Notes |
|--------|-----|-------|
| Win a standard lane | 2 VP | Per lane, per round |
| Win a high-value lane | 3 VP | Marked with star icon |
| Round objective bonus | 1–3 VP | Varies per round |
| "Control All Lanes" achievement | 5 VP | Team-only in 2v2, once per match |
| "Dominate 3 Lanes" achievement | 3 VP | FFA mode, once per match |
| "First Blood" achievement | 2 VP | First player to score VP (rounds 1–3 only) |
| "Comeback King" achievement | 3 VP | Worst-to-first bonus if last place wins match |
| "No Mercy" achievement | 2 VP | Win a lane with strength ≥ 10 |
| Active play penalty | -1 VP | If player submits 0 cards |

### 4.2 Win Condition
- The player (FFA) or team (2v2) with the most VP after all MAX_ROUNDS wins.
- **Tie-breaker**: Most lane wins during the match.
- **Second tie-breaker**: Earliest first score.
- If still tied, match is declared a draw (shared victory in 2v2; in FFA, tied players share position).

## 5. Comeback Mechanic

### 5.1 Trailing Player Detection
- At the start of cleanup phase each round:
  - **FFA**: Player(s) with the lowest VP total are "trailing".
  - **2v2**: Team with the lowest combined VP total is "trailing". Both team members receive bonuses.

### 5.2 Comeback Bonus
- **Extra Draw**: Trailing player draws 1 additional card from their deck.
- **Comeback Card**: Trailing player receives 1 random comeback card (from the comeback pool).
- In FFA: if multiple players are tied for last, all receive the bonus.
- In 2v2: the trailing team both receive the bonus.

### 5.3 Comeback Card Pool
- "Determination" (strength 0, +3 strength effect to one lane) — most common.
- "Last Stand" (if lose by ≤2, gain 1 VP) — common.
- "Surprise Rally" (+1 to all contested lanes) — uncommon.
- "Fortuna" (1–3 VP at round end) — rare.

### 5.4 Escalating Late Rounds
- Rounds 7–9: higher probability of high-value lanes (3 VP).
- Rounds 10–12: bonus objectives appear more frequently.
- This naturally advantages trailing players who conserved cards.

## 6. Achievement System

### 6.1 Achievement Definitions
Each achievement has:
- `id`: unique string.
- `name`: localization key.
- `condition`: function that checks game state.
- `vpReward`: number.
- `maxTriggers`: 1 (most achievements are one-time).
- `allowedModes`: GameMode[] (which modes this achievement is available in).

### 6.2 Achievement List
| ID | Name | VP | Modes | Condition |
|----|------|----|-------|-----------|
| `control_all_lanes` | Control All Lanes | 5 | 2v2 only | Team has highest strength in all active lanes simultaneously |
| `dominate_three_lanes` | Dominate 3 Lanes | 3 | FFA | Player has highest strength in ≥3 active lanes simultaneously |
| `first_blood` | First Blood | 2 | FFA, 2v2 | First player to earn VP this match (must trigger in rounds 1–3) |
| `comeback_king` | Comeback King | 3 | FFA, 2v2 | Player was in last place at some round and goes on to win match |
| `no_mercy` | No Mercy | 2 | FFA, 2v2 | Player's total strength in a single lane ≥ 10 |
| `perfectionist` | Perfectionist | 2 | FFA | Win all contested lanes in a single round (minimum 2 lanes) |

### 6.3 Achievement Checking
- Achievements are checked in the cleanup phase after all other resolution.
- The achievement system tracks which achievements have already been awarded to prevent duplicate triggers.
- Achievement awards are emitted as GameEvents.

## 7. Active Play Enforcement

- Every player MUST submit at least 1 card to any lane during planning.
- **Validation**: The engine rejects empty submissions during the planning phase.
- **Penalty for empty submission**: If a player's finalized assignments are empty (they skipped, disconnected, or ran out of time without assigning anything):
  1. The player forfeits all contests this round (their strength is 0 in all lanes).
  2. The player loses 1 VP (cannot go below 0 VP).
  3. The penalty is applied in the resolution phase.
- **Edge case**: If a player has 0 cards in hand, they must still "assign" (a special "pass" penalty is applied). This should be prevented by adequate hand size management.

## 8. Tactic Effect Resolution Order

During resolution, tactic effects are resolved in this order:
1. **Spy** effects (reveal hand info to user only — no state change).
2. **Retreat** effects (withdraw units, void targeted effects).
3. **Shield** effects (protect lanes from sabotage).
4. **Sabotage** effects (reduce opponent strength).
5. **Reinforce** effects (add strength).
6. **Bluff** effects (resolve — no actual effect, but was already visible).
7. **Ambush** effects (after winner determined, check if loser had ambush).
8. Final strength comparison (after all modifiers).

## 9. State Serialization

- All game state must be serializable to plain JSON (`JSON.stringify`-able).
- No class instances with methods in the state tree.
- Functions and event subscriptions are kept separate from state objects.
- Serializable format supports future network transmission.
- `GameState` object must have a `toJSON()` compatible structure.

## 10. Event System

The engine emits typed events for external consumption:

| Event | Payload | Trigger |
|-------|---------|---------|
| `GameStarted` | `{ gameId, players, mode }` | Engine initialized |
| `RoundStarted` | `{ roundNumber, phase }` | New round begins |
| `PlanningPhase` | `{ roundNumber, deadline }` | Planning phase starts |
| `PlayerSubmitted` | `{ playerId }` | Player finalizes assignments |
| `RevealPhase` | `{ roundNumber, assignments }` | All assignments revealed |
| `ResolutionPhase` | `{ roundNumber }` | Resolution begins |
| `LaneResolved` | `{ laneIndex, winner, vpAwarded, strengths }` | Each lane resolved |
| `VPAwarded` | `{ playerId, vpAmount, source, laneIndex? }` | VP added to player |
| `RoundComplete` | `{ roundNumber, scores }` | Cleanup done, round over |
| `AchievementUnlocked` | `{ playerId, achievementId, vpReward }` | Achievement earned |
| `ComebackBonus` | `{ playerId, cards }` | Comeback bonus awarded |
| `GameOver` | `{ winner, finalScores, stats }` | Match ends |
| `PlayerPenalized` | `{ playerId, reason, vpLoss }` | Penalty applied |
| `Error` | `{ message, code }` | Engine error |

## 11. Public API

The `index.ts` barrel export exposes:
- All types (PlayerId, Card, GameState, etc.)
- All constants (MAX_ROUNDS, LANE_COUNT, etc.)
- `createGame(config)` — Initialize a new game.
- `submitAssignments(game, playerId, assignments)` — Player submits card assignments.
- `executeRound(game)` — Advance through reveal → resolution → cleanup.
- `getStandings(game)` — Current scores and rankings.
- `isGameOver(game)` — Check if match ended.
- `getGameResult(game)` — Final results.
- `validateAssignment(game, playerId, assignments)` — Check validity without mutating.
- `subscribe(event, handler)` — Subscribe to game events.
- `unsubscribe(event, handler)` — Unsubscribe.
- `serialize(game)` — Convert state to JSON.
- `deserialize(data)` — Reconstruct state from JSON.

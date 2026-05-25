# Bot and AI System — Clarification

## 1. What Is a Bot?

A bot is an AI-controlled player that replaces a human player slot. Bots exist to:

- Fill empty player slots so a match can start with fewer than 4 human players.
- Provide practice opponents at various difficulty levels.
- Enable automated testing (balance simulator, QA tests).
- Simulate realistic gameplay during development (mock multiplayer).

Bots are indistinguishable from human players from the game engine's perspective. They call the same `submitAssignments` function, follow the same rules, and cannot bypass validation.

---

## 2. How Are Difficulty Levels Different from Styles?

This is the most important distinction in the bot system.

| Aspect | Difficulty | Style |
|---|---|---|
| **What it controls** | Quality of decision-making | Personality and strategic preference |
| **How it works** | Adds noise, limits evaluation depth | Modifies heuristic weights |
| **Scope** | Affects ALL decisions uniformly | Affects WHICH decisions the bot prefers |
| **Example** | Easy ignores opponent patterns; Expert predicts them | Aggressive prefers high-strength plays; Defensive conserves |
| **Independence** | Can be combined with any style | Can be combined with any difficulty |
| **Measurement** | Noise %, evaluation depth, lookahead | Weight vectors for lane/card scoring |

**Practical example:**
- An Easy + Aggressive bot plays high-strength cards randomly but with aggressive lane choices.
- An Expert + Aggressive bot plays high-strength cards optimally and with devastating lane pressure.
- An Easy + Defensive bot conserves cards poorly — ends up with a full hand and loses lanes.
- An Expert + Defensive bot conserves cards with perfect timing — dominates late rounds.

---

## 3. How Does the Weighted Heuristic System Work?

The bot evaluates each possible card-to-lane assignment using a weighted scoring formula:

### Lane Score (per lane the bot is evaluating)

```
laneScore = baseVP * w_vp
          + objectiveBonus * w_obj
          + streakFactor * w_streak
          - opponentPresence * w_opponent
          + comebackUrgency * w_comeback   (if trailing)
          + teamSynergy * w_team           (if 2v2 mode)
```

Where each weight `w_*` is influenced by:
- **Style**: Each style has a distinct weight profile (e.g., Objective-focused gives high `w_obj`).
- **Difficulty**: Higher difficulties compute more precise weights with less noise.
- **Game state**: Weights shift dynamically based on round number, score gap, and mode.

### Card Score (per card assigned to a specific lane)

```
cardScore = strengthValue * w_str
          + tacticValue * w_tactic
          + synergyBonus * w_synergy
          - conservationPenalty * w_conserve
          + bluffPotential * w_bluff         (if style permits)
```

### Assignment Algorithm

1. Generate all valid (card, lane) pairs.
2. Score each pair using the combined lane + card heuristic.
3. Sort by score descending.
4. Pick the highest-scoring pair, assign the card.
5. Remove that card from hand; check lane card limit.
6. Repeat until the bot has assigned its desired number of cards (minimum 1, maximum all).
7. Add noise based on difficulty (random score perturbation).
8. If 2v2: share planned assignments with teammate, re-evaluate if teammate's choices affect lane dynamics.

---

## 4. What Info Can Bots See vs. Not See?

### Visible to Bots (same as human players)

| Info | Source |
|---|---|
| Own hand and deck | `PlayerState.hand`, `PlayerState.deck` |
| Own discard pile | `PlayerState.discardPile` |
| Own VP, lane wins, achievements | `PlayerState.vpTotal`, `laneWins`, `earnedAchievements` |
| Lane states (objectives, streak, activity) | `LaneState` (per lane in `GameState.lanes`) |
| Round number and phase | `GameState.currentRound`, `roundPhase` |
| Game mode (FFA / 2v2) | `GameState.mode` |
| Number of cards in each opponent's hand | Count only (not card identities) |
| Which opponents have submitted | `PlayerState.hasSubmitted` |
| Public ladder/standings | From `getStandings()` |
| Current lane objectives and bonus VP | `LaneState.objective` |
| Which achievements have been awarded | `GameState.awardedAchievements` |
| Opponents' previous round assignments (after reveal) | From past `RevealPhase` event data |

### NOT Visible to Bots (hidden information)

| Info | Reason |
|---|---|
| Opponent hand contents (card identities) | Hidden — would be cheating |
| Opponent current assignments (during planning) | Hidden — would be cheating |
| Opponent tactic effects that are face-down | Hidden — would be cheating |
| Future round objectives (not yet revealed) | Not available to any player |

**Strict rule**: The `bot.decide()` function receives the exact same `GameState` snapshot that a human player's client would see. The engine does NOT provide a privileged "bot view." All information filtering is done by the engine, not by the bot.

---

## 5. How Do Bots Handle 2v2 Teamwork?

In 2v2 mode, the game engine exposes team information that is shared between teammates:

### Shared Team Info (visible to bot teammates)

- Teammate's hand contents (teammates see each other's cards).
- Teammate's planned assignments (viewable during planning phase).
- Combined team VP score (both players' VPs summed).
- Combined team strength in each lane (for evaluation).

### Bot Teamwork Protocol

1. **Priority lane assignment**: Bot evaluates which lanes its teammate is contesting. Avoids overloading the same lane unless it's high-value.
2. **Complementary assignment**: If teammate commits strength to lane A, bot commits to lane B (diversification) or reinforces lane A if it's critical.
3. **Tactic coordination**: Teammates coordinate shields (protect each other's lanes) and sabotage (double-sabotage the same opponent).
4. **Comeback sharing**: If the team is trailing, the trailing teammate receives comeback cards; the leading teammate adjusts to a supportive role.
5. **Communication**: Team-support style bots actively communicate lane assignments (via shared state), making lane choices that maximize team VP even at personal VP cost.

### Team-support Style Rules (2v2 only)

- In FFA mode, Team-support defaults to Balanced.
- Always considers teammate's lane assignments before deciding.
- Will sacrifice own card strength to deny opponent VP if teammate is already winning another lane.
- Prioritizes `Shield` tactic to protect lanes where teammate has committed strength.

---

## 6. What Happens at Each Difficulty Level?

Each difficulty level is a distinct parameter profile applied on top of the style weights.

### Easy
- **Noise**: ±30% random perturbation on all scores. ~15% chance of completely random assignment.
- **Evaluation depth**: Only considers current round. No lookahead.
- **Opponent awareness**: None. Ignores who is leading, who is behind.
- **Hand management**: Plays highest-strength card first. No card conservation.
- **Bluffing**: Never bluffs (0% probability).
- **Comeback handling**: Plays comeback cards immediately, regardless of position.
- **Tactic usage**: Uses tactics randomly, often suboptimally (e.g., sabotages the last-place player).
- **2v2 awareness**: None. Treats teammate as another opponent for lane evaluation purposes.

### Normal
- **Noise**: ±10% perturbation. Always evaluates at least partially.
- **Evaluation depth**: Considers current round + basic next-round value (if objective is visible).
- **Opponent awareness**: Knows standings (who is leading, who is trailing).
- **Hand management**: Avoids using the strongest card if a weaker card would suffice.
- **Bluffing**: 10% probability of playing a weak card on a high-value lane.
- **Comeback handling**: Saves comeback cards for 1-2 rounds, then plays them.
- **Tactic usage**: Uses tactics with basic logic (sabotage the leader, reinforce own strong lane).
- **2v2 awareness**: Recognizes teammate, won't actively sabotage them. Will occasionally coordinate.

### Hard
- **Noise**: ±3% perturbation. Minimal randomness.
- **Evaluation depth**: 2-round lookahead. Saves cards for future high-value objectives.
- **Opponent awareness**: Tracks each opponent's known card types and tendencies (from previous round reveals). Targets the leader specifically.
- **Hand management**: Active conservation. Prefers to save strong cards for late-game high-value lanes.
- **Bluffing**: 25% probability. Uses bluffing strategically to mislead opponents about strength distribution.
- **Comeback handling**: Saves comeback cards for optimal round (high-value lane, low opponent commitment).
- **Tactic usage**: Active counter-play. Uses Sabotage against known strong opponents. Uses Shield on own high-value lanes. Combines Reinforce + Bluff to create false strength signals.
- **2v2 awareness**: Coordinates lane assignments with teammate. Uses complementary tactics.

### Expert
- **Noise**: 0%. Perfect evaluation (within the heuristic model).
- **Evaluation depth**: Full match lookahead. Considers card economy across all remaining rounds.
- **Opponent awareness**: Predicts opponent assignments based on their known style, past plays, and game state. Anticipates counter-play and adjusts.
- **Hand management**: Optimal card sequencing — knows exactly when to play each card for maximum cumulative value.
- **Bluffing**: 35% probability. Deceptive bluffing — creates false patterns to exploit opponent expectations.
- **Comeback handling**: Perfect timing — plays comeback cards at the exact round where they yield maximum VP gain relative to opponents' expected commitments.
- **Tactic usage**: Full tactic synergy. Chains multiple effects (e.g., Spy → Sabotage → Reinforce on the same lane). Predicts opponent tactic usage and counters preemptively.
- **2v2 awareness**: Full team coordination. Communicates intended lane assignments, negotiates lane coverage, and executes team-level strategy (not just individual lane optimization).

---

## 7. How Does the Bot Registry Work?

The `BotRegistry` maps a `(difficulty, style)` pair to a concrete behavior function.

```
BotRegistry
  ├── easy
  │   ├── aggressive → EasyAggressiveBot
  │   ├── defensive → EasyDefensiveBot
  │   ├── balanced → EasyBalancedBot
  │   └── ...
  ├── normal
  │   └── ...
  ├── hard
  │   └── ...
  └── expert
      └── ...
```

Each concrete bot is a function `(gameState, playerId, config) => CardAssignment[]` that applies:
1. Heuristic scoring with style-adjusted weights.
2. Difficulty-level noise and evaluation depth.
3. Mode-specific adjustments (2v2 coordination, FFA targeting).

---

## 8. Edge Cases Handled

| Edge Case | How It's Handled |
|---|---|
| Bot has no valid moves | Must assign at least 1 card — always possible since each player has a hand. If `hand.length === 0` (impossible under normal rules), fallback to skipping (engine penalty). |
| Bot is last player remaining / others disconnected | Plays normally. Engine handles disconnection via `forceSubmitRemaining`. |
| Bot teammate disconnects in 2v2 | The remaining bot adjusts to solo play within the team. Picks up coverage of both lanes. |
| Bot is trailing by a large margin | Comeback-focused evaluation kicks in. Extra draw cards are prioritized. |
| Bot is far ahead in the lead | Shifts to conservative mode (defensive weighting increases). |
| Bot receives an invalid game state | `bot.decide()` must handle null/undefined gracefully. Falls back to a simple valid assignment. |
| Bot pool runs out of cards (deck empty) | Standard game rules handle empty deck — no more draws. Bot naturally adapts by playing only what's in hand. |

# Bot and AI System — Specification

## 1. Architecture

### 1.1 Bot Decision Engine
- Weighted heuristic system evaluating lane/card combinations.
- No machine learning — deterministic, testable, predictable.
- Difficulty levels control evaluation noise + depth.
- Style profiles control preference weights.

### 1.2 Interface
```
interface BotController {
  decide(gameState: GameState, playerId: PlayerId): CardAssignment[];
}
```

### 1.3 Bot Configuration
```
interface BotConfig {
  difficulty: 'easy' | 'normal' | 'hard' | 'expert';
  style: 'aggressive' | 'defensive' | 'balanced' | 'disruptive' 
       | 'objective-focused' | 'comeback-focused' | 'team-support';
}
```

## 2. Difficulty Levels

### Easy
- Evaluates only immediate lane VP value.
- Ignores opponent patterns.
- Makes random errors ~30% of the time.
- Does not bluff or use complex tactics.
- Plays highest-strength card to highest-value lane.
- Handles comeback cards poorly.

### Normal
- Evaluates lane VP + objective bonus.
- Basic opponent awareness (knows who is leading).
- ~10% random noise in evaluation.
- Uses basic bluffing (occasionally).
- Follows style preferences moderately.

### Hard
- Evaluates lane VP + objective + opponent tendencies.
- Hand management awareness (save cards for future rounds).
- Active counter-play (sabotage the leader, shield key lanes).
- Uses bluffing strategically.
- Strong comeback awareness.
- ~3% evaluation noise.

### Expert
- Full evaluation: VP, objectives, opponents, future rounds, card economy.
- Anticipates opponent responses (predicts where they will play).
- Optimal card selection with minimal noise (~0%).
- Full tactic synergy (combines cards for maximum effect).
- Perfect comeback execution.
- Team-aware in 2v2 (coordinates with bot teammate).

## 3. Strategic Styles

### Aggressive
- Plays high strength cards early.
- Contests high-value lanes aggressively.
- Prefers Sabotage and Reinforce tactics.
- Over-commits sometimes (exploitable).

### Defensive
- Conserves strong cards for later rounds.
- Prefers Shield and Retreat tactics.
- Spreads strength across lanes.
- Hard to ambush but slower to score.

### Balanced
- Adapts to game state.
- Mixes aggression and defense based on position.
- No strong preference — plays the best move.

### Disruptive
- Targets the leader specifically.
- Uses Sabotage, Spy, and Ambush frequently.
- Prioritizes denying opponent VP over earning own.
- Effective in FFA, less so in 2v2.

### Objective-focused
- Prioritizes lanes with bonus objectives.
- Saves Objective cards for high-bonus lanes.
- May sacrifice standard lane VP to secure objectives.

### Comeback-focused
- Plays conservatively when leading.
- Plays aggressively when trailing.
- Maximizes comeback card usage.
- Saves cards for late-round high-value lanes.

### Team-support
- 2v2 only (defaults to balanced in FFA).
- Coordinates with teammate (supports their strong lanes).
- Sacrifices own VP for team VP.
- Uses Shield to protect teammate lanes.

## 4. Evaluation Heuristics

### Lane Score = baseVP + objectiveBonus + streakFactor - opponentPresence

- **baseVP**: Lane's VP value (1-3).
- **objectiveBonus**: Extra VP from objective condition.
- **streakFactor**: If same player keeps winning this lane, it's more valuable (+10%).
- **opponentPresence**: Deduct points if strong opponents are contesting.

### Card Score in Lane = strengthValue + tacticValue + synergyBonus - conservationPenalty

- **strengthValue**: Card strength (1-5, weighted by lane importance).
- **tacticValue**: Tactic effect utility in this lane/context.
- **synergyBonus**: Extra if card works well with other assigned cards.
- **conservationPenalty**: Penalty for using high-value cards when cheaper would suffice.

## 5. Bot Assignment Algorithm

1. For each card in hand, score vs each active lane.
2. Select card-lane pair with highest score.
3. Check card-per-lane limit (max 3).
4. Repeat until all desired cards placed or hand empty.
5. In 2v2: share planned assignments with bot teammate.
6. Adjust if teammate's choices change lane evaluations.

## 6. Difficulty Implementation

- **Evaluation noise**: Add random delta to scores (-n% to +n%).
  - Easy: ±30% noise, sometimes skips evaluation entirely.
  - Normal: ±10% noise.
  - Hard: ±3% noise.
  - Expert: 0% noise (perfect evaluation).

- **Bluff usage probability**:
  - Easy: 0% (never bluffs).
  - Normal: 10% (occasional).
  - Hard: 25% (strategic).
  - Expert: 35% (deceptive).

- **Comeback card optimization**:
  - Easy: plays immediately.
  - Normal: plays within 2 rounds.
  - Hard: saves for best opportunity.
  - Expert: optimal timing.

## 7. Integration

- Bots register with game engine via `submitAssignments` just like human players.
- Bot decisions are triggered by game state snapshot + bot config.
- No hidden information access — bots only use what the engine exposes.
- Balance simulator configures bots via `BotConfig[]`.

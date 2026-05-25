# Root Node Specification

## Game Concept (Emerged from Constraints)

The Spec Kit process has analyzed the constraints. The game that best satisfies all requirements is:

**A simultaneous-deployment lane-control strategy game.**

Working title: The game will later be named during localization.

## Core Design

### Format
- **Lane-control strategy** with simultaneous planning.
- Each match: fixed number of rounds (10–12 rounds maximum).
- Each round: players simultaneously assign resources to lanes, then simultaneous resolution.
- Win condition: most victory points after all rounds.

### Board
- 3–5 lanes/zones shown on screen.
- Each lane has:
  - Spaces for units/tokens.
  - An objective or scoring condition.
  - Changing bonuses or effects each round.

### Player Resources
- Each player has a hand of cards/tokens at the start.
- Cards/tokens represent: units, tactics, special actions, bluff.
- Resources replenish each round or via specific conditions.
- Losing/behind players receive catch-up bonuses.

### Round Flow
1. **Planning Phase** (simultaneous, timed 30–60s):
   - All players secretly assign cards/tokens to lanes.
   - Players can also play tactic cards.
2. **Reveal Phase** (simultaneous):
   - All assignments revealed at once.
3. **Resolution Phase**:
   - Each lane resolved: strongest presence wins the lane.
   - Ties or special conditions may split or deny points.
   - Objectives captured, points awarded.
4. **Cleanup Phase**:
   - Board updates, new objectives appear, cards replenished.
   - Round counter increments.

### Scoring / Win Condition
- Victory points (VP) earned by:
  - Winning a lane (1–3 VP depending on lane importance).
  - Capturing round objectives (bonus VP).
  - Special achievements (e.g., control all lanes at once).
- Most VP after all rounds wins.
- The match never ends early; all rounds are always played.

### 2v2 Team Mode
- Two teams of two.
- Teammates share a color identity.
- Lane control counted per team.
- Team coordination allowed during planning (visible team pings or shared hand).
- Combined score determines winner.

### Free-for-All Mode
- Each player for themselves.
- All lanes contested by all 4 players.

### Match Timing
- Each round: ~90–120 seconds (planning + resolution + cleanup).
- 10–12 rounds = 15–24 minutes.
- Well under the 30-minute limit.

### Comeback Mechanics
- Players in last place receive bonus cards/tokens.
- Later rounds have higher-value objectives.
- Special comeback tactic cards for trailing players.

### Active Play Requirement
- Every player must assign cards every round (no passing).
- Empty lanes are automatically contested.
- Hiding/passive play is penalized (you lose if you don't contest).

### Anti-Dominant Strategy
- Lane objectives change each round.
- Card pool rotates or has variety.
- Player positions and hidden information prevent rote play.
- Bluffing and feinting matter.
- Balance simulator will test for dominant strategies.

## Technical Specification

### Platform
- Expo React Native (TypeScript).
- Android + iOS from a single codebase.
- Arabic-first UI with full RTL support.
- English with LTR support.

### Multiplayer
- Local mock multiplayer first (same device hot-seat or mock network).
- Real online multiplayer via Supabase Realtime later.

### Bots
- 4 difficulty levels: Easy, Normal, Hard, Expert.
- Strategic styles: Aggressive, Defensive, Balanced, Disruptive, Objective-focused, Comeback-focused, Team-support.
- Bots work in FFA and 2v2.
- Bots simulate planning phase decisions using heuristic AI.

### Localization
- Arabic (primary, RTL).
- English (secondary, LTR).
- Every player-facing text via i18n system.
- No hardcoded UI text.

### Tests & Balance
- Unit tests for game logic.
- Balance simulator that runs thousands of simulated matches.
- Detects strategies with >55% win rate as potential balance issues.
- Tests for comeback viability.
- Tests bot strength levels.

## Deliverables
1. Playable prototype (Expo React Native app).
2. Working bots at all difficulty levels and styles.
3. Local mock multiplayer.
4. Full Arabic and English UI.
5. Balance simulator results.
6. QA and reviewer sign-off.
7. Integration architect sign-off.
8. AI_HANDOFF_MANUAL.md and final handoff package.

## Derivation Note
Child branches will be derived after specification and clarification are complete. Likely child branches:
1. Core Game Logic Engine
2. UI and User Experience
3. Bot and AI System
4. Multiplayer System
5. Localization
6. Balance and Testing

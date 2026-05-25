# Root Node Clarification

## Questions and Answers

### Q1: What is the precise win condition?
**A:** The player (or team) with the most Victory Points (VP) after all rounds are completed wins. VP is earned through:
- Winning lane contests (primary source).
- Capturing round objectives.
- Bonus achievements.

### Q2: How are lane contests resolved?
**A:** Each lane has a "strength" comparison:
- Each player assigns cards with strength values to lanes.
- Total strength per player per lane is compared.
- Highest total wins the lane and earns VP.
- If tied, the lane VP is split or no one gets it (depending on lane type).
- Some cards have special resolution effects (e.g., "tie-breaker", "ambush", "retreat").

### Q3: How many cards does each player have?
**A:** 
- Starting hand: 5–7 cards.
- Each round, players draw 2–3 cards (or get a fixed replenishment).
- Some cards are "staple" (always available), some are "rotating" (change each match).
- Effective hand management is a core skill.

### Q4: What types of cards exist?
**A:**
- **Unit cards** (strength 1–5): Basic deployable units.
- **Tactic cards**: Special effects (bluff, reinforce, spy, sabotage, shield, etc.).
- **Objective cards**: Key cards for capturing round objectives.
- **Comeback cards**: Available only to trailing players (extra strength or special effects).

### Q5: How does 2v2 teamwork work?
**A:**
- Each team has a combined lane presence (team strength = player A + player B in a lane).
- Teammates can see each other's cards and planned assignments during planning (shared view).
- Team VP is combined.
- Team members can coordinate via pre-set pings or quick messages.

### Q6: How does the comeback mechanic work exactly?
**A:**
- At the start of each round, the player(s) in last place receive a "Comeback Bonus".
- Comeback Bonus = 1 extra card draw + a special comeback card (e.g., "Determination" +3 strength in one lane).
- In FFA, only the last-place player gets the bonus.
- In 2v2, the trailing team gets the bonus (split between members).
- If multiple players are tied for last, all tied players get a smaller bonus.

### Q7: How do bots think?
**A:**
- Bots use a weighted heuristic system.
- They evaluate each lane's importance (objective value, current scores, round number).
- They consider opponent tendencies (visible patterns).
- Difficulty controls evaluation depth and noise:
  - Easy: random assignments with basic heuristics.
  - Normal: competent evaluation.
  - Hard: strong evaluation with bluff detection.
  - Expert: near-optimal play with full strategic depth.
- Style controls preference weights (e.g., Aggressive prefers high-risk high-reward lanes).

### Q8: What is the board layout?
**A:**
- The board is horizontal (landscape) or scrollable vertical on mobile.
- 3 lanes are active by default.
- In rounds 4–6, a 4th lane opens.
- In rounds 7–10, a 5th lane may appear.
- Each lane shows: lane name, current objective, VP reward, player presence indicators.

### Q9: How is "active play" enforced?
**A:**
- Players must assign at least 1 card to a lane each round (cannot pass).
- If a player assigns no cards, they forfeit all contests that round and lose 1 VP as penalty.
- The UI prevents skipping assignment.

### Q10: Is there hidden information?
**A:**
- Yes: planned assignments are hidden until reveal.
- Yes: player hands are hidden from opponents.
- No: revealed assignments, scores, and lane states are public.
- Bots do not cheat by seeing hidden information (except Normal+ bots may infer from patterns).

## Refined Definitions

### Round Structure (Detailed)
1. **Planning Phase** (45s):
   - Player sees board, their hand, current scores, lane objectives.
   - Player drags cards to lanes (assign).
   - Player may play 1 tactic card face-down to a lane.
   - Teammates see each other's assignments in 2v2.
2. **Reveal Phase** (5s):
   - All assignments revealed simultaneously.
   - Tactic cards may trigger pre-resolution effects.
3. **Resolution Phase** (20s):
   - Each lane resolved in order (left to right or by importance).
   - Winner determined, VP awarded.
   - Lane effects applied.
4. **Cleanup Phase** (10s):
   - Discard used cards.
   - Draw new cards (including comeback bonuses).
   - Update lane objectives for next round.
   - Check for achievements.

### Victory Point Distribution
- Standard lane win: 2 VP
- High-value lane: 3 VP (marked with star icon)
- Round objective capture: 1–3 VP (varies)
- "Control all lanes" achievement: 5 VP bonus (once per match)
- "First to score" achievement: 2 VP (round 1–3 only)

### Match End
- After round 12 (or round 10 if all players agree to end early — not default).
- Tie-breaker: most lane wins during the match. If still tied, the player who scored first wins (or shared victory in 2v2).

### Platform Considerations
- Mobile-first: touch-friendly drag-and-drop or tap-to-assign.
- Portrait mode for vertical lanes layout (scrollable).
- Landscape mode for horizontal layout.
- Arabic RTL: lanes ordered right-to-left, text aligned right.
- English LTR: lanes ordered left-to-right, text aligned left.

## Open Questions for Child Nodes
1. Exact card types and balance will be designed by the Core Game Logic branch.
2. UI interactions (drag vs tap) will be designed by the UI branch.
3. Bot AI internals will be designed by the Bot branch.
4. Multiplayer protocol will be designed by the Multiplayer branch.

# Core Game Logic Engine — Clarification

## Q1: How is "trailing player" determined for the comeback bonus?
**A:** At the start of the cleanup phase each round, the engine evaluates current VP totals:
- **FFA**: Sort players by VP ascending. All players tied for the lowest VP are "trailing". If all players are tied, no one is trailing (no bonuses awarded).
- **2v2**: Sort teams by combined VP ascending. The trailing team both receive bonuses. If both teams are tied, no trailing team exists.
- **Note**: The comeback bonus is NOT given in round 1 (no data to determine trailing). It starts from round 2.

## Q2: What happens if a player has no cards in hand?
**A:** The game design ensures this is unlikely (starting hand 6, draw 2 per round, deck of ~16). If it happens:
1. The player must still "submit" assignments (empty submission).
2. The active play penalty applies: -1 VP, forfeit all contests.
3. The engine does NOT force-draw cards during planning (that would break the strategic hand management).
4. The Bot branch must ensure bots manage hand size. The UI branch must warn players when hand is low.

## Q3: How exactly does the "Spy" tactic work?
**A:** "Spy" reveals the top 2 cards of one opponent's hand to the spy user only. This is a **private** effect:
- The spy user sees the cards (event emitted only to their player ID).
- No state change occurs (cards are not drawn or removed).
- The information is ephemeral — it's not stored in game state after resolution.
- In 2v2, teammates can share this intel through the shared planning view (UI concern, not engine).

## Q4: How are ties in lane resolution handled?
**A:** 
1. If two or more players/teams have equal highest total strength in a lane:
   - **Standard lane (2 VP)**: VP is split equally, rounded down. E.g., 2-way tie = 1 VP each. 3-way tie = 0 VP each (2/3 = 0 rounded down).
   - **High-value lane (3 VP)**: VP is split equally, rounded down. E.g., 2-way tie = 1 VP each. 3-way tie = 1 VP each.
   - **1 VP objective lane**: If tied, no one gets the VP (minimum threshold).
2. The lane is recorded as "tied" for statistical/achievement purposes.
3. "No tie" rule means: if only one player has the highest, they win outright regardless of margin.

## Q5: Can a player assign multiple cards to the same lane?
**A:** Yes. A player can assign multiple cards to the same lane to increase their total strength. This is a key strategic choice — overcommitting to one lane leaves others weak. However:
- A player cannot assign more than 3 cards to any single lane per round.
- This prevents extreme stacking and forces distribution decisions.

## Q6: When does the "Control All Lanes" achievement trigger?
**A:** In 2v2 mode only. It triggers at the moment during resolution when the team has the highest total strength in ALL active lanes simultaneously. It can trigger only once per match. The 5 VP bonus is added immediately. In FFA, the equivalent "Dominate 3 Lanes" triggers when a player leads in ≥3 active lanes.

## Q7: How does the deck reshuffle work?
**A:** When a player needs to draw cards but their deck is empty:
1. The engine collects all cards in the player's discard pile.
2. Shuffles them back into the deck.
3. The player then draws the required number of cards.
4. This is transparent — no cards are permanently lost unless specified by game rules.

## Q8: What happens if two players sabotage each other in the same lane?
**A:** Both sabotage effects apply unless blocked by Shield:
1. Check for Shield cards in the lane first. Shield negates one sabotage targeting that lane.
2. Any unblocked sabotage reduces its target's total strength by 2.
3. If Player A sabotages Player B, and Player B sabotages Player A, both reductions apply. They may cancel out or create net effects depending on other modifiers.

## Q9: Can comeback cards be saved for later rounds?
**A:** Yes. Comeback cards are added to the player's hand and can be used in any subsequent round. They do not expire. However, they follow the same rules as other cards (can be assigned, can be discarded). This strategic choice — use the comeback power now or save for a critical late round — adds depth.

## Q10: How is the "First Blood" achievement precisely detected?
**A:** 
1. The engine tracks a flag `firstBloodAwarded` in the game state.
2. Before the first VP award of the match, this flag is false.
3. The first time any player earns VP (from any source: lane win, objective, achievement), the engine checks:
   - Is `firstBloodAwarded` false?
   - Is current round ≤ 3?
   - If both true, award 2 bonus VP to the scoring player, set `firstBloodAwarded = true`.
4. If a player earns VP from multiple sources in the same resolution, only the first source that triggers the check awards First Blood (order: lane resolution order, then achievements, then objectives).

## Q11: What is the exact relationship between round number and lane count?
**A:**
| Round(s) | Active Lanes |
|----------|-------------|
| 1–3 | 3 lanes (0, 1, 2) |
| 4–6 | 4 lanes (0, 1, 2, 3) |
| 7–12 | 5 lanes (0, 1, 2, 3, 4) |

Lane unlocking is automatic and deterministic. Unlocked lanes appear during cleanup before the next planning phase. Players are notified of new lanes.

## Q12: Can a player assign 0 cards intentionally?
**A:** The engine's `validateAssignment` function will reject an empty submission. However, if the planning phase times out or a player disconnects, the engine will auto-submit whatever they have (possibly empty). In that case, the active play penalty applies:
- Forfeit all contests (strength = 0 in all lanes).
- -1 VP penalty (minimum 0 VP).

The UI must warn and prevent this. The bot must never do this.

## Q13: How is the "Ambush" card resolved exactly?
**A:**
1. The ambush card is played face-down during planning in a lane.
2. During resolution, after the winner of that lane is determined:
   a. Check if the losing player had an Ambush card assigned to that lane.
   b. If yes, and the winner was not the ambush player, the winner loses 1 VP (VP denial).
   c. The ambush effect cannot reduce a player below 0 VP.
3. If the ambush player actually wins the lane, the ambush effect does not trigger (it's a "lose to win" card — you lose the lane but hurt the winner).
4. In 2v2: if either team member played Ambush and their team loses the lane, the winning team loses 1 VP.

## Q14: What is the "Surprise Rally" comeback card behavior?
**A:** "Surprise Rally" provides +1 strength to ALL lanes the player is contesting this round. This means:
- For every active lane where the player assigned at least 1 card, add +1 to their total strength.
- The bonus is calculated after all other modifications (sabotage, reinforce, shield).
- This is powerful for players spread thin across multiple lanes.

## Q15: How are tactic cards counted toward the max 3 cards per lane rule?
**A:** Tactic cards count toward the 3-card limit per lane. A player cannot assign 3 unit cards + 1 tactic card (that's 4). They must choose which cards to assign up to 3 total per lane. However, a tactic card can be the only card assigned (e.g., 1 Bluff card in a lane with no units).

## Q16: What is the exact comeback card pool distribution?
**A:**
| Card | Frequency in Pool | Effect |
|------|------------------|--------|
| Determination | 40% | +3 strength to one lane |
| Last Stand | 30% | If lose by ≤2, gain 1 VP |
| Surprise Rally | 20% | +1 to all contested lanes |
| Fortuna | 10% | Gain 1–3 VP at round end |

Draw is weighted random. This makes the bonus unpredictable but generally useful.

## Q17: How does scoring work in 2v2 team mode?
**A:**
- Team score = Player A VP + Player B VP.
- Lane resolution: Team total strength = Player A strength + Player B strength in that lane.
- If the team wins a lane, both team members receive the VP? **No**. The VP is credited to the team score (combined). Individual player VP is tracked for achievement purposes (e.g., "First Blood" still goes to the individual who triggered it).
- Comeback: Team trailing is based on combined team score. Both players get individual bonuses.

## Q18: Can VP go negative?
**A:** No. VP minimum is 0 for each player. The penalty (-1 VP for skipping) does not reduce VP below 0. This prevents degenerate scenarios and ensures all players start from 0.

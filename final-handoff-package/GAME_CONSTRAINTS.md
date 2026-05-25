# Game Constraints

We want to build a mobile multiplayer strategic game.

Important:
- The AI must NOT design the game directly.
- The game design must emerge through Spec Kit.
- The game is NOT required to be an area-control game.
- Spec Kit may choose the best strategic format.

## Core Game Requirements

1. The game must be strategic, not speed/reflex based.
2. It must rely on precise choices with clear consequences.
3. It must contain multiplayer.
4. There must be no turn waiting; all players act or plan at the same time.
5. It must be easy to understand and quick to get into.
6. It must not be complex or overloaded with systems.
7. It must not include heavy management or excessive details.
8. A match must end within 30 minutes maximum.
9. Match conditions must change so the same choice is not always correct.
10. A losing player must be able to come back and compete strongly until the end.
11. Competition must remain strong until the end.
12. It must support 4 players.
13. It must support team play, especially 2v2.
14. It must support free-for-all, especially 1v1v1v1.
15. It must be a strategic game where winning depends on meaningful planning, positioning, timing, resource use, tactical choices, objective control, or another Spec Kit-defined strategic system. It must not be a shallow abstract points race.
16. It must not reward hiding or passive waiting until the end.
17. Active play throughout the match must matter.
18. The win condition must be very clear to a new player.
19. The match must not end early because someone reached a win target.
20. The match must stay open until the last rounds or final ending.
21. Any game board, map, lanes, zones, objectives, units, resources, or tactical spaces must have practical gameplay importance and must affect player decisions.
22. The lead should be able to shift repeatedly until the end.

## Strategic Game Identity Requirements

Spec Kit may choose the best strategic format, such as:
- objective-control strategy
- tactical board strategy
- territory influence
- resource strategy
- lane control
- simultaneous planning strategy
- team tactics
- hybrid strategy

Hard rules:
1. The game must remain strategic.
2. The game must not become a reflex or speed game.
3. The game must not become a shallow score race.
4. The win condition must be clear.
5. Decisions must have visible consequences.
6. Different situations must require different strategies.
7. The final design must support multiplayer, 2v2, FFA, bots, Arabic/English, Android/iOS, and matches under 30 minutes.

## Arabic, English, and Platforms

1. The game must have an Arabic-first visual and cultural style.
2. The game must support both Arabic and English.
3. Arabic UI must support RTL layout correctly.
4. English UI must support LTR layout correctly.
5. The game must support both Android and iPhone through Expo React Native.
6. Arabic and English support must be designed from the beginning, not added at the end.
7. Every player-facing text must use a localization system.
8. No hardcoded player-facing text is allowed in UI components.

## Integration Requirements

1. The project must include a strong integration process.
2. Game logic, UI, state, bots, multiplayer, localization, testing, documentation, and Spec Kit artifacts must not conflict.
3. The project must include SYSTEM_CONTRACTS.md.
4. The project must include DECISIONS.md.

## Documentation Requirements

1. The final output must include AI_HANDOFF_MANUAL.md.
2. AI_HANDOFF_MANUAL.md must be detailed enough that any future AI assistant can understand the project.
3. The final project must include a complete AI handoff package.

## Bot and AI Opponent Requirements

1. The game must support playing with bots.
2. Bots must be usable to fill missing player slots.
3. Bots must support multiple difficulty levels.
4. At minimum, bot difficulty levels must include Easy, Normal, Hard, and Expert.
5. Bot strength must affect planning quality, risk evaluation, strategic decisions, and teamwork behavior.
6. Bots must not cheat by seeing hidden information unless the design explicitly allows it and documents it.
7. Bots must work in free-for-all mode.
8. Bots must work in 2v2 mode.
9. Bots must be usable for local testing without real multiplayer.
10. Bots must be usable by the balance simulator.
11. Bot behavior must remain strategic, not reflex-based.
12. The player should be able to choose bot difficulty before starting a match.

## Bot Strategy Styles

Bots must support different strategic styles, not only difficulty levels.

Examples:
- Aggressive
- Defensive
- Balanced
- Disruptive
- Objective-focused
- Comeback-focused
- Team-support

Difficulty controls quality of decision-making.
Style controls personality and strategy.

## Anti-Dominant Strategy Requirements

1. The game must not have one always-correct strategy.
2. The best decision must depend on current game state, player positions, mode, objectives, timing, and opponent behavior.
3. A strategy that wins in one situation must be counterable in another situation.
4. The game must include changing match conditions that force players to adapt.
5. The same opening plan should not guarantee a strong advantage every match.
6. The same late-game plan should not guarantee victory every match.
7. The balance simulator must test for dominant strategies.
8. If one strategy wins too often across many simulations, the system must flag it as a balance problem.
9. Bots must use different strategic styles so the game is tested against varied plans.
10. The final reviewer must not approve the project if winning depends on repeating the same optimal plan.

## Art, Audio, Motion, and Game Feel Requirements

1. The game must have a strong, coherent visual identity with an Arabic-first cultural and visual style.
2. The art style must support strategic clarity — players must immediately understand board state, card values, lane objectives, and game phase.
3. Every major game event must have visual feedback (card placement, reveal, lane resolution, VP changes, tactic effects, achievements, penalties, comeback, game over).
4. Sound effects must provide non-visual feedback for key events (card actions, round transitions, tactic activation, achievements).
5. Motion and transitions must feel responsive (under 300ms for actions) and provide spatial awareness (cards moving from hand to lanes).
6. All assets must be legal (self-created, CC0, MIT, or purchased with clear license).
7. Placeholder assets are allowed during development but must be clearly labeled and replaceable.
8. The game feel must communicate strategic weight — important decisions should feel significant, not trivial.
9. Art, audio, motion, and game feel must not distract from or obscure strategic decision-making.
10. Performance on mobile devices must be prioritized — SVG complexity, audio compression, and animation efficiency are constraints.

## Technical Preference

- Use Expo React Native and TypeScript unless Spec Kit finds a better reason.
- Multiplayer must start with local mock multiplayer first.
- Real online multiplayer can use Supabase Realtime later.
- The game must become a playable prototype before final approval, but there is no forced early vertical-slice rule.

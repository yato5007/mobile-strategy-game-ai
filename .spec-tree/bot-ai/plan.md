# Bot and AI System — Plan

## Phases

### Phase 1: Bot Controller Framework
1. Define BotController interface and BotConfig types.
2. Create BotRegistry (maps difficulty + style → behavior).
3. Implement base evaluation heuristics (lane score, card score).

### Phase 2: Difficulty Levels
1. Implement Easy difficulty (high noise, simple evaluation).
2. Implement Normal difficulty (moderate evaluation).
3. Implement Hard difficulty (deep evaluation, counter-play).
4. Implement Expert difficulty (optimal play, prediction).

### Phase 3: Strategic Styles
1. Implement Aggressive, Defensive, Balanced styles.
2. Implement Disruptive, Objective-focused styles.
3. Implement Comeback-focused, Team-support styles.
4. Test each style independently.

### Phase 4: Integration
1. Wire bots into game flow (call bot.decide() during planning).
2. Add bot configuration to lobby/match setup.
3. Test bots in FFA and 2v2 modes.
4. Test bot combinations (mixed difficulties/styles).

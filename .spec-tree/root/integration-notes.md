# Root Node Integration Notes

## Integration Strategy

Root node defines the overall architecture. Integration happens through:

1. **Shared types** — Defined in `mobile-game/src/types/`. All systems use the same type definitions.
2. **Game state contract** — Core Game Logic owns the master game state. Other systems read it (UI renders it, multiplayer syncs it, bots modify it via game actions).
3. **Event bus** — Game state changes emit events. UI, bots, and multiplayer can subscribe.
4. **Plugin system** — Players (human, bot, network) implement the same interface.

## System Contracts

See `SYSTEM_CONTRACTS.md` for detailed contracts between systems.

## Integration Call Order

1. Core Game Logic + Shared Types (foundation)
2. UI renders game state (dependent on #1)
3. Bots play the game (dependent on #1)
4. Multiplayer syncs state (dependent on #1, #2)
5. Localization wraps UI (dependent on #2)
6. Balance simulator tests everything (dependent on #1, #3)

## Known Integration Points to Verify

- [ ] Game logic → UI: Does UI correctly display lane assignments, scores, round state?
- [ ] Game logic → Bots: Can bots read state and submit valid actions?
- [ ] Game logic → Multiplayer: Is state serializable for sync?
- [ ] UI → Localization: Are all UI strings using i18n?
- [ ] UI → RTL: Does Arabic layout display correctly?
- [ ] Bots → Balance simulator: Can simulator run bots with different styles?

## Conflicts to Watch

- None identified at root level. Child branches will document their own integration concerns.

**Last Updated:** 2026-05-25

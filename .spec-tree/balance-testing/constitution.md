# Balance and Testing — Constitution

## Purpose
Build the balance simulator and test infrastructure to verify game fairness, detect dominant strategies, ensure comeback mechanics work, and validate all game logic.

## Scope
- Balance simulator (run simulated matches with bots).
- Unit test suite (Jest) for core game logic.
- Dominant strategy detection (>55% win rate flags).
- Comeback verification (trailing players can win).
- Match time verification (<30 minutes).
- Strategy diversity testing (multiple bot styles).
- FFA and 2v2 mode testing.
- Edge case regression tests.
- Game state serialization round-trip tests.
- Integration tests between systems.

## Out of Scope
- UI testing (manual or snapshot).
- Performance profiling (separate concern).
- Real network multiplayer testing.

## Dependencies
- Core Game Logic Engine (logic under test).
- Bot branch (opponents for simulation).
- Multiplayer mock adapter (for multi-player simulation).
- Jest test framework.

## Key Constraints
1. Balance simulator must test all bot difficulty levels and styles.
2. Must detect if any strategy wins >55% of matches.
3. Must verify comebacks are possible.
4. Must verify matches complete within time limits.
5. Must test both FFA and 2v2 modes.
6. All tests must pass before final approval.

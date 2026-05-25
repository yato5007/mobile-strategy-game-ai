# Core Game Logic Engine — Plan

## Overall Strategy
Build the game logic engine in phases, starting with types and constants, then the core engine, then cards, events, achievements, and state management. Each phase builds on the previous. Testability is maintained throughout.

## Phases

### Phase 1: Types and Constants
**Output files:** `types.ts`, `constants.ts`
- Define all TypeScript types and interfaces for the game.
- Define all game constants (max rounds, VP values, timings, lane counts).
- Ensure strict type safety (no `any`, no implicit any).
- Ensure all types are JSON-serializable.
- **Estimated: 1 session**

### Phase 2: Card System
**Output file:** `cards.ts`
- Define card data (all unit, tactic, objective, comeback cards).
- Implement deck generation (staple + rotating cards).
- Implement shuffle, draw, and discard mechanics.
- Implement comeback card pool.
- **Estimated: 1 session**

### Phase 3: Game Engine Core
**Output file:** `engine.ts`
- Implement game initialization.
- Implement round lifecycle functions.
- Implement lane resolution logic.
- Implement tactic effect resolution order.
- Implement action validation.
- Implement VP calculation and tracking.
- Implement active play enforcement.
- **Estimated: 2 sessions**

### Phase 4: State Management
**Output file:** `state.ts`
- Implement game state creation and initialization.
- Implement state transition functions.
- Implement state query functions (getStandings, isGameOver, etc.).
- Implement state serialization/deserialization.
- **Estimated: 1 session**

### Phase 5: Event System
**Output file:** `events.ts`
- Implement typed event definitions.
- Implement event emitter/dispatcher.
- Implement subscription interface.
- **Estimated: 0.5 sessions**

### Phase 6: Achievement System
**Output file:** `achievements.ts`
- Implement achievement definitions.
- Implement achievement checking functions.
- Implement achievement award logic.
- **Estimated: 0.5 sessions**

### Phase 7: Public API and Integration
**Output file:** `index.ts`
- Create barrel export.
- Verify all public API functions work.
- Ensure no UI imports exist.
- **Estimated: 0.5 sessions**

### Phase 8: QA and Review
**Files:** `qa-result.md`, `review-result.md`
- Run QA checklist against implementation.
- Run review checklist.
- Fix issues found.
- **Estimated: 0.5 sessions**

## Total Estimated Effort: 6.5 sessions

## Dependencies
- None external — this is pure TypeScript with no dependencies.
- Testability: Each function is pure or nearly pure, making unit testing straightforward.
- Downstream: UI, Bots, Multiplayer all depend on this module.

## Risk Mitigation
- **Risk: Engine becomes too large.** If engine.ts exceeds 500 lines, split into sub-modules: `engine-init.ts`, `engine-round.ts`, `engine-resolution.ts`, `engine-validation.ts`.
- **Risk: Tactic effect interactions become complex.** Document the resolution order clearly. Use a step-based approach (process effects in sequence, not all-at-once).
- **Risk: Circular dependencies between modules.** Avoid by having types.ts depend on nothing, constants.ts depend only on types, and all other modules depend on types + constants.

## CI/Test Strategy
- Unit tests for lane resolution (all tie scenarios).
- Unit tests for tactic effect interactions.
- Unit tests for achievement conditions.
- Unit tests for comeback detection.
- Unit tests for active play penalty.
- These can be written in parallel by the Balance & Testing branch or manually.

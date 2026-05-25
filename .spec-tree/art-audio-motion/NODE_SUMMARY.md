# Art, Audio, Motion, and Game Feel System — Node Summary

## Purpose
Define and implement the complete visual identity, sound design, motion language, and game feel for the mobile strategy game. This is a core system alongside UI, Bots, Multiplayer, Localization, and Balance.

## Parent Link
- **Parent:** root (`.spec-tree/root/`)
- **Parent Requirement:** REQ-023 through REQ-033 (Art, Audio, Motion, and Game Feel Requirements)
- **Supporting Documents:** DESIGN_SYSTEM.md, ASSET_PIPELINE.md

## Scope
- Arabic-first visual identity and cultural style (geometric patterns, sand-and-jewel palette, calligraphic typography)
- Color system, typography, and spacing constants
- Card SVG visual components (14+ card types, 6 card states)
- Board/lane SVG visual components (lane bar, objectives, scoreboard)
- Sound hook system (event-driven, 15 GameEvent → sound mappings)
- Animation components (12 animations for all game moments)
- Game feel principles (strategic weight, comeback feeling, penalty feedback)
- RTL-aware visual design and motion (directional animations reverse)
- Placeholder asset system (SVG placeholder shapes, silent audio placeholders)
- Licensing compliance for all assets

## Out of Scope
- Game logic implementation (owned by Core Game Logic Engine)
- UI layout and component architecture (owned by UI branch)
- Localization translation files (owned by Localization branch)
- Network multiplayer (owned by Multiplayer branch)
- Bot AI decision-making (owned by Bot branch)
- Balance calculations (owned by Balance branch)

## Decisions Made

| ID | Decision | Rationale |
|---|---|---|
| AA-01 | SVG over PNG for game assets | Resolution-independent, RTL-flippable, smaller bundle, dynamic colors |
| AA-02 | `react-native-reanimated` over `Animated` | 60fps UI thread animations, native driver support |
| AA-03 | `expo-av` for sound playback | Expo-compatible, supports pooling and volume control |
| AA-04 | Self-created placeholder assets | Zero licensing risk, allows parallel development |
| AA-05 | Event-driven animation triggering | Decouples animation from game logic |
| AA-06 | RTL via `I18nManager.isRTL` | Consistent with localization branch |

## Alternatives Rejected

| Alternative | Reason Rejected |
|---|---|
| PNG spritesheets | Not resolution-independent, harder to dynamically color, larger bundle |
| React Native `Animated` API | Slower, JS thread blocking, less smooth for complex sequences |
| Lottie for animations | Heavier bundle, harder RTL support, overkill for card/board 2D |
| CSS-based animations (WebView) | Would require WebView; not native, poor performance |
| No placeholder system | Would block UI development until final art is ready |

## Dependencies

| Dependency | Type | Status |
|---|---|---|
| `react-native-svg` | External package | Not yet installed |
| `react-native-reanimated` | External package | Not yet installed |
| `expo-av` | External package | Not yet installed |
| `expo-font` | External package | Not yet installed |
| Core Game Logic `types.ts` | Internal file | ✅ Exists |
| UI Branch | Internal branch | Not yet started |
| Localization Branch | Internal branch | Not yet started |
| DESIGN_SYSTEM.md | Design doc | ✅ Exists |
| ASSET_PIPELINE.md | Design doc | ✅ Exists |

## Integration Risks

1. **SVG performance on low-end Android** — Mitigated by complexity limits and reduce-motion mode.
2. **Event timing conflicts** — Animations are fire-and-forget; they must not block game logic.
3. **RTL animation bugs** — Mitigated by explicit RTL testing and `direction` props.
4. **Sound synchronization** — Preload all sounds at game start; use pooling.
5. **Font rendering differences** — Test on both platforms; bundle fonts.

## Implementation Status

| Phase | Status | Tasks |
|---|---|---|
| 1: Color/Typography Constants | 🔜 Not started | 5 tasks |
| 2: Card Visual Components | 🔜 Not started | 6 tasks |
| 3: Board/Lane Components | 🔜 Not started | 6 tasks |
| 4: Sound Hook System | 🔜 Not started | 6 tasks |
| 5: Animation Components | 🔜 Not started | 15 tasks |
| 6: Game Feel Polish | 🔜 Not started | 13 tasks |
| **Total** | **Not started** | **51 tasks** |

## Tests Required

1. **Unit tests** for color/typography/spacing constants (values match DESIGN_SYSTEM.md).
2. **Snapshot tests** for card components (each state renders correctly).
3. **Snapshot tests** for lane/board components (each state renders correctly).
4. **Sound dispatch test** — mock GameEvent emitter, verify correct sound fired for each event.
5. **Animation RTL test** — render each animation in LTR and RTL, verify direction.
6. **Performance test** — render board with all cards, verify 60fps.
7. **Accessibility test** — reduce-motion mode disables non-essential animations.

## QA Result
**NOT_STARTED** — No implementation to test yet.

## Review Result
**NOT_STARTED** — No implementation to review yet.

## Next Step
Begin Phase 1: Create `src/styles/colors.ts`, `typography.ts`, `spacing.ts`.

## Child Branches
This node is at depth 1. It does not currently need child branches. If SVG complexity or animation timing becomes a problem during implementation, a child branch may be created for optimization.

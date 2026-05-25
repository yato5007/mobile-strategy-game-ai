# Localization System — Node Summary

## Purpose
Implement full Arabic and English language support for the mobile strategy game, including:
- i18n framework setup (`i18next` + `react-i18next`)
- Translation JSON files for both languages across all game domains
- RTL/LTR layout switching using `I18nManager` and custom RTL-aware components
- Language detection (device locale + stored preference)
- Language switching at runtime
- No hardcoded player-facing text enforcement

## Parent Link
- **Parent node:** Root (game-level)
- **Sibling nodes:** Core Game Logic (complete), UI and User Experience, Bot and AI System, Multiplayer System, Art/Audio/Motion, Balance and Testing
- **Depends on:** UI and User Experience (consumes localization hooks), Core Game Logic (provides card/achievement text to translate), DESIGN_SYSTEM.md (RTL/LTR rules)

## Decisions Made

| ID | Decision | Rationale |
|---|---|---|
| D-LOC-001 | Use `i18next` + `react-i18next` over `react-native-i18n` | Most widely adopted, feature-rich, well-maintained |
| D-LOC-002 | Namespace-based JSON files (6 per language) | Organized, maintainable, lazy-loading ready |
| D-LOC-003 | Custom RTL wrappers (`RTLText`, `RTLView`) in addition to `I18nManager` | Allows runtime RTL switching without app restart |
| D-LOC-004 | Arabic-first UI design constraint (Arabic is 25% longer) | Prevents text clipping in Arabic mode |
| D-LOC-005 | Bundle all translations at startup (no lazy-loading) | Small payload (<20KB/language), simplicity |

## Alternatives Rejected
- **react-native-i18n:** Less maintained, less flexible than i18next.
- **Single JSON per language:** Unwieldy as translation count grows.
- **I18nManager only (no RTL wrappers):** Requires app restart for full RTL effect; creates poor UX for language switching.
- **English-first design:** Would clip Arabic text.
- **Lazy-loaded translations:** Unnecessary complexity at current scale.

## Dependencies

| Dependency | Version (min) | Purpose |
|---|---|---|
| `i18next` | ^23.0 | Core internationalization engine |
| `react-i18next` | ^13.0 | React Native bindings for i18next |
| `expo-localization` | ^14.0 | Device locale detection on first launch |
| `@react-native-async-storage/async-storage` | ^1.19 | Persist user language preference |
| `expo-font` | ^11.0 | Load custom Arabic fonts (Amiri) |

## Integration Risks
1. **RTL runtime switching:** React Native's I18nManager requires app restart for full RTL effect. Custom wrappers mitigate this but may miss some native components.
2. **Arabic font rendering:** Differs across Android and iOS. Bundling a font file mitigates inconsistency.
3. **Third-party library RTL support:** Any added UI library must be verified for RTL compatibility.
4. **Translation maintenance:** As new features add UI text, translations for both languages must be added simultaneously.

## Implementation Status
- **Spec Kit:** Constitution ✅, Spec ✅, Clarification ✅, Plan ✅, Tasks ✅, Analysis ✅, Checklist ✅
- **Implementation:** NOT_IMPLEMENTED
- **QA:** NOT_STARTED
- **Review:** NOT_STARTED

## Next Step
Begin implementation of Phase 1 (Framework Setup) as defined in plan.md:
1. Install `i18next`, `react-i18next`, `expo-localization`, `@react-native-async-storage/async-storage`, `expo-font`
2. Create `src/localization/index.ts` with i18n configuration
3. Create `src/localization/useRTL.ts` hook
4. Create `src/localization/RTLText.tsx` and `RTLView.tsx` components
5. Create Arabic and English JSON translation files (all 6 namespaces)
6. Wire localization into app root
7. Create language switch UI
8. Test all screens in both languages

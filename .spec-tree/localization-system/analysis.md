# Localization System — Analysis

## 1. Risk Assessment

### R1: RTL Breaking on Some React Native Views
- **Level:** Medium
- **Description:** Not all React Native components handle RTL correctly out of the box. `I18nManager.forceRTL(true)` may not correctly mirror custom layouts, absolute-positioned elements, or third-party libraries.
- **Impact:** Layout could appear broken in Arabic mode — lanes in wrong order, cards misaligned, navigation reversed incorrectly.
- **Mitigation:**
  - Use `I18nManager.allowRTL(true)` early in app startup.
  - Implement RTL-aware wrapper components (`RTLText`, `RTLView`) that read current language and apply mirrored styles manually.
  - Test every screen in both RTL and LTR modes.
  - Avoid absolute positioning where possible; prefer flexbox.
  - For third-party libraries, verify RTL support before adoption.
- **Contingency:** If auto-RTL fails on specific components, apply manual margin/padding mirroring using the `useRTL()` hook.

### R2: Arabic Text Being ~25% Longer Than English
- **Level:** Medium
- **Description:** Arabic text typically expands ~25% more horizontally than its English equivalent. UI elements designed for English may clip Arabic text.
- **Impact:** Card names truncated, buttons overflowing, labels cut off in Arabic mode.
- **Mitigation:**
  - Design UI with Arabic text as the constraint (design for Arabic first, then ensure English fits).
  - Use `adjustsFontSizeToFit` on critical labels.
  - Set `numberOfLines` with `ellipsizeMode="tail"` as safety net.
  - Card names: maximum 2 lines. Descriptions: maximum 4 lines. Button labels: maximum 1 line, 20% padding.
  - Test all screens with representative Arabic text strings.
- **Contingency:** Add `minimumFontScale` to auto-shrink text in extreme cases.

### R3: Missing or Incomplete Translations
- **Level:** Low-Medium
- **Description:** As the game evolves, new UI text may be added without corresponding translation entries. The game could show raw keys (e.g., `"card.new_card"`) to Arabic players.
- **Impact:** Poor user experience in Arabic mode, broken UI appearance.
- **Mitigation:**
  - Use i18next's `saveMissing` feature during development to detect untranslated keys.
  - Add a lint rule or CI check that verifies all keys in English JSON exist in Arabic JSON (and vice versa).
  - Fallback to English (`fallbackLng: 'en'`) so missing Arabic translations show English text instead of raw keys.
  - Code review process must verify that new UI text includes translation entries in both locales.
- **Contingency:** Create a script (`scripts/check-translations.sh`) that compares JSON key structures across languages and reports differences.

### R4: Runtime Language Switch Not Fully Supported by React Native
- **Level:** Medium-High
- **Description:** React Native's `I18nManager.forceRTL()` documentation states it requires an app restart to fully take effect.
- **Impact:** Switching from English to Arabic (or vice versa) may not fully relayout native components until restart.
- **Mitigation:**
  - Call `I18nManager.allowRTL(true)` once at app startup (permanent).
  - For runtime switching, use custom RTL-aware components (`RTLView`, `RTLText`) that reactively mirror styles based on current language.
  - Avoid relying solely on `I18nManager` for per-component layout; use it only for top-level direction hint.
  - Test runtime switch on both Android and iOS simulators.
- **Contingency:** If runtime layout issues persist, show a "Restart to apply language change" dialog. This is acceptable as a fallback but not preferred.

### R5: Arabic Font Rendering Differences Across Platforms
- **Level:** Low
- **Description:** iOS and Android render Arabic script differently (iOS has native support, Android may vary by manufacturer).
- **Impact:** Inconsistent appearance — crisp on iOS, potentially jagged on some Android devices.
- **Mitigation:**
  - Use a bundled Arabic font (Amiri or Noto Naskh Arabic) rather than relying on system fonts.
  - Test on both Android emulator and iOS simulator with representative Arabic text.
  - Verify font weight rendering (Arabic fonts may not support all weights).
- **Contingency:** Add a per-platform font configuration in `DESIGN_SYSTEM.md`.

### R6: Localization Key Explosion
- **Level:** Low
- **Description:** If every fragment of text gets its own key without organization, translation files become unwieldy.
- **Impact:** Hard to maintain translations, easy to miss keys, inconsistent naming.
- **Mitigation:**
  - Namespace by screen/feature: `common`, `game`, `cards`, `achievements`, `settings`, `errors`.
  - Hierarchical keys: `button.start`, `card.scout_desc`, `game.round`.
  - Document key naming conventions in this file.
  - Keep keys flat enough to be readable, nested enough to be organized.

## 2. Dependencies

| Dependency | Version (min) | Purpose | Risk if Missing |
|---|---|---|---|
| `i18next` | ^23.0 | Core i18n engine | No translations possible |
| `react-i18next` | ^13.0 | React bindings for i18next | Cannot use `useTranslation()` in components |
| `expo-localization` | ^14.0 | Device locale detection | Cannot auto-detect language on first launch |
| `@react-native-async-storage/async-storage` | ^1.19 | Persist language preference | Language preference resets each app launch |
| `expo-font` | ^11.0 | Load custom Arabic fonts | Arabic fonts may not render correctly |

### Optional Dependencies
| Dependency | Purpose | When to Add |
|---|---|---|
| `i18next-resources-to-backend` | Lazy-load translation JSON (reduce bundle size) | If translation files exceed 50KB |

## 3. Key Decisions

### D-LOC-001: i18next over react-native-i18n
- **Decision:** Use `i18next` + `react-i18next` instead of `react-native-i18n`.
- **Reason:** `i18next` is the most widely adopted i18n library in the React ecosystem. It supports nested keys, interpolation, plurals, contexts, and has extensive plugin support. `react-native-i18n` is less maintained and less flexible.
- **Rejected:** `react-native-i18n`, custom hand-rolled i18n.

### D-LOC-002: Namespace-Based JSON Files
- **Decision:** Split translations into 6 JSON files per language (common, game, cards, achievements, settings, errors).
- **Reason:** Avoids monolithic files. Each namespace is focused, easy to find, and can be loaded independently if lazy-loading is added later.
- **Rejected:** Single JSON file per language, flat key-value store in TypeScript.

### D-LOC-003: Custom RTL Wrappers Over I18nManager Only
- **Decision:** Use custom `RTLText` and `RTLView` components that mirror styles based on `useRTL()` hook, in addition to `I18nManager.allowRTL(true)`.
- **Reason:** `I18nManager.forceRTL()` requires app restart to fully take effect. Custom wrappers provide reactive runtime switching without restart.
- **Rejected:** Relying solely on `I18nManager` for layout direction.

### D-LOC-004: Arabic-First UI Design Constraint
- **Decision:** UI layout dimensions are constrained by Arabic text (25% longer), not English. English must fit within Arabic-constrained spaces.
- **Reason:** Ensures Arabic never gets clipped. English is naturally shorter, so it will always fit.
- **Rejected:** Designing for English first and adapting for Arabic (would cause clipping).

### D-LOC-005: Bundle All Translations at Startup
- **Decision:** All translation JSON files are imported statically (bundled) at app startup, not lazy-loaded.
- **Reason:** The total translation payload is small (<20KB per language). Lazy-loading adds complexity without meaningful benefit at this scale.
- **Rejected:** Lazy-loading via `i18next-resources-to-backend`.
- **Note:** If translation files grow significantly (>50KB per language), revisit this decision.

## 4. Dependencies on Other Branches

| Branch | Dependency Direction | What Is Needed |
|---|---|---|
| UI and User Experience | Localization → UI | UI consumes `useTranslation()` hooks, wraps components with `RTLText`/`RTLView` |
| Core Game Logic | Localization → Core | Card names, descriptions, achievement texts come from Core Game Logic specification |
| Design System | Localization → Design | DESIGN_SYSTEM.md defines RTL/LTR rules, typography, color constraints |
| Art, Audio, Motion | Localization → Art | Art branch must provide flipped icon variants or support mirror transforms |

## 5. Performance Considerations

- **Translation lookup:** i18next lookups are O(log n) with namespaced JSON. For <200 keys per namespace, performance is negligible.
- **Re-renders:** Changing language triggers re-render of all components using `useTranslation()`. This is a single app-wide event — acceptable.
- **Bundle size:** JSON translations are small. No significant impact on app size.
- **Memory:** Translation objects remain in memory for the app lifetime (~40KB total for both languages).

## 6. Testing Strategy

- Unit tests for `initLanguage()` and `changeLanguage()`.
- Snapshot tests for every screen in both Arabic and English.
- Visual regression tests for RTL layout (lanes reversed, icons flipped, text right-aligned).
- Integration test: Launch app in Arabic, navigate through all screens, verify no raw keys visible.
- Edge case tests: Missing translation keys, invalid language codes, device language changes.

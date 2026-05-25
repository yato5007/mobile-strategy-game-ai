# Localization System — Checklist

## Framework Setup
- [ ] 1. `i18next` and `react-i18next` installed as dependencies
- [ ] 2. `expo-localization` installed for device locale detection
- [ ] 3. `@react-native-async-storage/async-storage` installed for language preference persistence
- [ ] 4. i18n instance configured with `initReactI18next`, `fallbackLng: 'en'`, and `defaultNS: 'common'`
- [ ] 5. `initLanguage()` function created — reads AsyncStorage first, falls back to device locale
- [ ] 6. `changeLanguage(lang)` function created — updates AsyncStorage + i18next language
- [ ] 7. i18n initialization called at app root (before any UI renders)

## Translation Files
- [ ] 8. Arabic locales created: `src/localization/locales/ar/common.json`
- [ ] 9. Arabic locales created: `src/localization/locales/ar/game.json`
- [ ] 10. Arabic locales created: `src/localization/locales/ar/cards.json`
- [ ] 11. Arabic locales created: `src/localization/locales/ar/achievements.json`
- [ ] 12. Arabic locales created: `src/localization/locales/ar/settings.json`
- [ ] 13. Arabic locales created: `src/localization/locales/ar/errors.json`
- [ ] 14. English locales created: `src/localization/locales/en/common.json`
- [ ] 15. English locales created: `src/localization/locales/en/game.json`
- [ ] 16. English locales created: `src/localization/locales/en/cards.json`
- [ ] 17. English locales created: `src/localization/locales/en/achievements.json`
- [ ] 18. English locales created: `src/localization/locales/en/settings.json`
- [ ] 19. English locales created: `src/localization/locales/en/errors.json`
- [ ] 20. All translation keys follow hierarchical naming convention (e.g., `button.start`, `card.scout_desc`, `game.round`)
- [ ] 21. All card names and descriptions from Core Game Logic have translation entries
- [ ] 22. All achievement names and descriptions have translation entries
- [ ] 23. All UI labels (buttons, navigation, settings) have translation entries
- [ ] 24. All error messages have translation entries
- [ ] 25. Arabic and English JSON files have matching key structures (verified by script or manual check)

## RTL/LTR Support
- [ ] 26. `I18nManager.allowRTL(true)` called at app startup
- [ ] 27. `useRTL()` hook created — returns `{ isRTL: boolean, direction: 'rtl' | 'ltr' }` based on current language
- [ ] 28. `RTLText` component created — auto-aligns text based on language direction
- [ ] 29. `RTLView` component created — auto-mirrors margins, paddings, flex direction based on language direction
- [ ] 30. Directional icons (back, forward, chevrons, arrows) apply `transform: scaleX(-1)` in RTL mode
- [ ] 31. Lane order reverses in RTL mode (lane 1 is rightmost for Arabic)
- [ ] 32. Card hand order reverses in RTL mode (right-to-left for Arabic)
- [ ] 33. Animation directions (slide-in, slide-out) reverse in RTL mode
- [ ] 34. Navigation "back" gesture direction respects RTL
- [ ] 35. All screens tested in both RTL (Arabic) and LTR (English) modes
- [ ] 36. Runtime language switch triggers correct layout re-render without app restart

## No Hardcoded Text Enforcement
- [ ] 37. All player-facing text in UI components uses `useTranslation()` and `t('key')`
- [ ] 38. Zero hardcoded string literals in JSX text nodes (verified by lint or code review)
- [ ] 39. Card components use translation key lookups for names and descriptions
- [ ] 40. Achievement notification components use translation key lookups
- [ ] 41. Settings screen uses translation key lookups for all labels and options
- [ ] 42. Error screens use translation key lookups for all messages

## Language Switching
- [ ] 43. Language switch UI component created (e.g., toggle or dropdown in Settings screen)
- [ ] 44. Language switch persists preference to AsyncStorage
- [ ] 45. Language switch triggers i18next language change
- [ ] 46. Language switch updates RTL/LTR layout without app restart
- [ ] 47. App launches with correct language on subsequent starts (reads AsyncStorage)

## Arabic-Specific
- [ ] 48. Arabic-Indic digits used in Arabic mode (٠١٢٣٤٥٦٧٨٩)
- [ ] 49. Standard Arabic numerals used in English mode (0123456789)
- [ ] 50. Arabic font (Amiri or Noto Naskh Arabic) bundled and loaded via `expo-font`
- [ ] 51. Arabic text truncation handled (max 2 lines for card names, max 4 lines for descriptions)
- [ ] 52. UI element widths accommodate ~25% longer Arabic text

## Testing
- [ ] 53. Unit test: `initLanguage()` returns correct language based on AsyncStorage
- [ ] 54. Unit test: `changeLanguage()` updates AsyncStorage + i18next
- [ ] 55. Snapshot tests for home screen in Arabic mode
- [ ] 56. Snapshot tests for home screen in English mode
- [ ] 57. Snapshot tests for game board in Arabic mode (RTL layout)
- [ ] 58. Snapshot tests for game board in English mode (LTR layout)
- [ ] 59. Snapshot tests for settings screen in both languages
- [ ] 60. Manual test: Navigate through all screens in Arabic, verify no raw translation keys visible
- [ ] 61. Manual test: Switch language mid-game, verify all UI updates correctly
- [ ] 62. Platform test: Verify RTL layout on Android emulator
- [ ] 63. Platform test: Verify RTL layout on iOS simulator
- [ ] 64. Translation key coverage check: Every key in English JSON exists in Arabic JSON

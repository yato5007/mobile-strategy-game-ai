# Localization System — Specification

## 1. Framework

- Use `i18next` with `react-i18next` for React Native.
- Locales: Arabic (`ar`) and English (`en`).
- Language detection: device locale on first launch (with override).
- Storage: persist language preference in AsyncStorage.
- RTL detection: based on language (Arabic → RTL, English → LTR).

## 2. Translation Files

### Structure
```
src/localization/
├── index.ts           # i18n setup and export
├── locales/
│   ├── ar/
│   │   ├── common.json      # UI labels, buttons, navigation
│   │   ├── game.json        # Game-related text (lane names, rounds)
│   │   ├── cards.json       # Card names and descriptions
│   │   ├── achievements.json # Achievement names and descriptions
│   │   ├── settings.json    # Settings screen
│   │   └── errors.json      # Error messages
│   └── en/
│       ├── common.json
│       ├── game.json
│       ├── cards.json
│       ├── achievements.json
│       ├── settings.json
│       └── errors.json
```

### Translation Key Convention
- `common.button.start` = "ابدأ" / "Start"
- `common.button.confirm` = "تأكيد" / "Confirm"
- `game.round` = "جولة {{number}}" / "Round {{number}}"
- `card.scout` = "كشاف" / "Scout"
- `card.sabotage.desc` = "قلل قوة الخصم في هذا المسار بمقدار 2" / "Reduce opponent strength in this lane by 2"
- `achievement.first-blood` = "الدم الأول" / "First Blood"
- `settings.language` = "اللغة" / "Language"

### Arabic Text Guidelines
- Arabic text is typically 25% longer than English.
- Use Arabic-Indic digits (٠١٢٣٤٥٦٧٨٩) for numbers in Arabic mode.
- Use standard Arabic numerals (0123456789) in English mode.

## 3. RTL/LTR Engine

### Layout Mirroring
- When language = `ar`: `direction: 'rtl'` on root view.
- All flex directions reverse (`row` stays `row` but order flips).
- `I18nManager.allowRTL(true)` from expo-localization.
- Test every screen in both modes.

### Component Wrapping
- Use a custom `Text` component that auto-detects language direction.
- Use a custom `View` component that applies RTL-aware margins/paddings.
- Directional icons (arrows, back, next) must flip in RTL mode.
- Animation directions (slide-in, slide-out) must reverse.

### CSS/Style Adjustments
```
// RTL-aware style helper
function rtlStyle(style: ViewStyle): ViewStyle {
  const { isRTL } = useRTL();
  if (!isRTL) return style;
  // Mirror padding/margin left/right
  return {
    ...style,
    marginLeft: style.marginRight,
    marginRight: style.marginLeft,
    paddingLeft: style.paddingRight,
    paddingRight: style.paddingLeft,
  };
}
```

## 4. Integration

- All UI components use `useTranslation()` from `react-i18next`.
- No hardcoded strings — every text goes through `t('key')`.
- Card names, descriptions, achievement texts all use translation keys.
- DESIGN_SYSTEM.md RTL rules applied through layout components.
- Language switch triggers full re-render with new direction.
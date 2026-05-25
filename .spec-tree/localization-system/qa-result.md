# Localization System — QA Result

**Status:** NOT_STARTED

No QA has been performed yet for this node.

QA will be conducted after implementation. The following areas must be verified:

1. **Translation completeness:** Every English key exists in Arabic JSON (and vice versa).
2. **RTL layout correctness:** All screens display correctly in Arabic mode.
3. **LTR layout correctness:** All screens display correctly in English mode.
4. **Language switch:** Runtime language switching updates all text and layout without errors.
5. **No hardcoded strings:** Zero player-facing strings bypass `useTranslation()`.
6. **Arabic font rendering:** Custom Arabic fonts load correctly on both platforms.
7. **Text clipping:** No text is truncated or overflowing in either language.
8. **Arabic-Indic digits:** Numbers display in Arabic-Indic format in Arabic mode.
9. **Directional icons:** All directional icons flip correctly in RTL mode.
10. **Edge cases:** Missing translation keys, invalid language code, rapid language switching.

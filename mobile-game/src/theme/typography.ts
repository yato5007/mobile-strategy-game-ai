/**
 * Typography constants based on DESIGN_SYSTEM.md
 * Font size guidelines for responsive layout.
 */
export const Typography = {
  // Font sizes (base values, scale responsively)
  caption: 11,
  small: 12,
  bodySmall: 13,
  body: 14,
  bodyLarge: 16,
  cardName: 14,
  subtitle: 18,
  title: 20,
  heading: 24,
  largeHeading: 28,
  display: 36,

  // Font weights
  weightRegular: '400' as const,
  weightMedium: '500' as const,
  weightSemiBold: '600' as const,
  weightBold: '700' as const,

  // Line heights
  lineHeightTight: 1.2,
  lineHeightNormal: 1.4,
  lineHeightRelaxed: 1.6,

  // Letter spacing
  letterSpacingNormal: 0,
  letterSpacingWide: 0.5,
} as const;

/**
 * Responsive typography helper.
 * Small screen: use base values
 * Medium screen: +1-2dp
 * Large screen: +2-4dp
 */
export const getFontSize = (
  screenWidth: number,
  baseSize: number,
): number => {
  if (screenWidth < 375) return baseSize;
  if (screenWidth < 415) return baseSize + 1;
  return baseSize + 2;
};

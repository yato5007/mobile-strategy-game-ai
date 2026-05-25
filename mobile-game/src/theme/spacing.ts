/**
 * Spacing constants based on DESIGN_SYSTEM.md
 * Base grid: 4dp
 */
export const Spacing = {
  /** Base grid unit */
  xs: 4,
  /** Small spacing */
  sm: 8,
  /** Medium spacing */
  md: 12,
  /** Large spacing */
  lg: 16,
  /** Extra large spacing */
  xl: 24,
  /** 2x extra large */
  xxl: 32,
  /** 3x extra large */
  xxxl: 48,

  // Specific values
  /** Card padding */
  cardPadding: 12,
  /** Gap between lanes */
  laneGap: 8,
  /** Screen edge margins */
  screenEdge: 16,
  /** Minimum button height */
  buttonHeight: 48,
  /** Minimum touch target size */
  touchTarget: 44,

  // Card sizes (will be scaled by responsive hook)
  cardWidth: 56,
  cardHeight: 76,
} as const;

export type SpacingKey = keyof typeof Spacing;

/**
 * Get responsive font size based on screen width.
 */
export const getResponsiveFontSize = (
  screenWidth: number,
  baseSize: number,
): number => {
  const scale = screenWidth / 375;
  return Math.round(baseSize * Math.min(scale, 1.3));
};

/**
 * Color palette based on DESIGN_SYSTEM.md
 * Arabic-first design with sand-and-jewel tones.
 */
export const Colors = {
  // Backgrounds
  primaryBackground: '#C4A35A', // Deep Sand
  secondaryBackground: '#1A2744', // Night Blue

  // Accents
  accentGold: '#FFD700', // Triumph Gold
  accentRed: '#C0392B', // Warning Red
  accentGreen: '#27AE60', // Success Green

  // Card Types
  cardUnit: '#8B6914', // Desert Brown
  cardTactic: '#6C3483', // Mystic Purple
  cardObjective: '#2874A6', // Royal Blue
  cardComeback: '#E67E22', // Phoenix Orange

  // Text
  vpText: '#FFD700', // Gold
  neutralText: '#F5F0E1', // Off White
  danger: '#DC143C', // Crimson

  // Utility
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Overlay
  overlayDark: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(245, 240, 225, 0.9)',

  // Player Colors
  player0: '#FFD700', // Gold
  player1: '#E67E22', // Orange
  player2: '#3498DB', // Blue
  player3: '#2ECC71', // Green

  // Team Colors
  teamA: '#FFD700', // Gold/Amber
  teamB: '#1ABC9C', // Teal/Cyan

  // States
  disabled: '#666666',
  inactiveDim: 'rgba(255, 255, 255, 0.3)',
  cardShadow: 'rgba(0, 0, 0, 0.3)',
  goldGlow: 'rgba(255, 215, 0, 0.4)',

  // UI Elements
  surfaceDark: '#2C3E50',
  surfaceLight: '#3D5A80',
  borderGold: '#FFD700',
  borderDefault: 'rgba(255, 255, 255, 0.2)',
  borderSelected: '#FFD700',
} as const;

export type ColorKey = keyof typeof Colors;

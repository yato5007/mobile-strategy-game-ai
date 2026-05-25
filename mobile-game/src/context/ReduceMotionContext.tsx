/**
 * ReduceMotionContext — Accessibility context for reduced motion.
 *
 * Wraps the app to allow users to disable non-essential animations.
 * All animation components (CardFlip, LanePulse, VPFloat, etc.)
 * check this context before running animations.
 *
 * Usage:
 * ```tsx
 * <ReduceMotionProvider>
 *   <App />
 * </ReduceMotionProvider>
 * ```
 *
 * In any component:
 * ```tsx
 * const { reduceMotion } = useContext(ReduceMotionContext);
 * // If reduceMotion is true, skip non-essential animations
 * ```
 */

import React, { createContext, useState, useCallback, useMemo } from 'react';

// ─── Types ──────────────────────────────────────────────────────

export interface ReduceMotionState {
  /** Whether reduced motion is active */
  reduceMotion: boolean;
  /** Toggle reduced motion on/off */
  setReduceMotion: (value: boolean) => void;
  /** Toggle reduced motion (convenience) */
  toggleReduceMotion: () => void;
}

// ─── Default State ──────────────────────────────────────────────

const DEFAULT_STATE: ReduceMotionState = {
  reduceMotion: false,
  setReduceMotion: () => {},
  toggleReduceMotion: () => {},
};

// ─── Context ────────────────────────────────────────────────────

export const ReduceMotionContext = createContext<ReduceMotionState>(DEFAULT_STATE);

// ─── Provider ───────────────────────────────────────────────────

export interface ReduceMotionProviderProps {
  children: React.ReactNode;
  /** Initial reduced motion state (default: false) */
  initialReduceMotion?: boolean;
}

/**
 * ReduceMotionProvider — Wraps your app to provide reduce-motion
 * context to all animation components.
 */
export const ReduceMotionProvider: React.FC<ReduceMotionProviderProps> = ({
  children,
  initialReduceMotion = false,
}) => {
  const [reduceMotion, setReduceMotionState] = useState<boolean>(initialReduceMotion);

  const setReduceMotion = useCallback((value: boolean) => {
    setReduceMotionState(value);
  }, []);

  const toggleReduceMotion = useCallback(() => {
    setReduceMotionState(prev => !prev);
  }, []);

  const contextValue = useMemo<ReduceMotionState>(
    () => ({
      reduceMotion,
      setReduceMotion,
      toggleReduceMotion,
    }),
    [reduceMotion, setReduceMotion, toggleReduceMotion],
  );

  return (
    <ReduceMotionContext.Provider value={contextValue}>
      {children}
    </ReduceMotionContext.Provider>
  );
};

export default ReduceMotionContext;

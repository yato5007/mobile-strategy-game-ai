/**
 * useAnimation — Animation timing presets and reusable animation utilities.
 *
 * Wraps react-native-reanimated to provide:
 * - Timing presets (fast, normal, slow, strategic)
 * - Common animation configurations
 * - RTL-aware direction helpers
 * - Reduce-motion support via context
 *
 * Depends on:
 * - react-native-reanimated (v4.3.1+)
 * - ReduceMotionContext for accessibility
 */

import { useCallback, useContext, useMemo } from 'react';
import { I18nManager } from 'react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  type WithTimingConfig,
  type WithSpringConfig,
  Easing,
} from 'react-native-reanimated';
import { ReduceMotionContext } from '../context/ReduceMotionContext';

// ─── Timing Presets ─────────────────────────────────────────────

export const TimingPresets = {
  /** UI feedback — cards tap, buttons (100ms) */
  fast: (): WithTimingConfig => ({
    duration: 100,
    easing: Easing.bezier(0.0, 0.0, 0.58, 1.0),
  }),

  /** Normal transitions (300ms) */
  normal: (): WithTimingConfig => ({
    duration: 300,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1.0),
  }),

  /** Card slides, simple reveals (400ms) */
  smooth: (): WithTimingConfig => ({
    duration: 400,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1.0),
  }),

  /** Important events — lane resolution, VP awards (600-800ms) */
  strategic: (): WithTimingConfig => ({
    duration: 600,
    easing: Easing.bezier(0.65, 0.0, 0.35, 1.0),
  }),

  /** Major events — achievements, game over (1000-1500ms) */
  cinematic: (): WithTimingConfig => ({
    duration: 1200,
    easing: Easing.bezier(0.65, 0.0, 0.35, 1.0),
  }),

  /** Penalty / negative feedback — sharp, fast (200ms) */
  sharp: (): WithTimingConfig => ({
    duration: 200,
    easing: Easing.out(Easing.back(1.5)),
  }),

  /** Bounce for celebratory effects */
  spring: (): WithSpringConfig => ({
    damping: 12,
    stiffness: 100,
  }),

  /** Soft spring for subtle effects */
  softSpring: (): WithSpringConfig => ({
    damping: 20,
    stiffness: 50,
  }),
} as const;

// ─── Animation Types ────────────────────────────────────────────

export type AnimationWeight =
  | 'fast'        // 100ms — UI feedback
  | 'normal'      // 300ms — standard transitions
  | 'smooth'      // 400ms — card actions
  | 'strategic'   // 600ms — important game events
  | 'cinematic'   // 1200ms — major events
  | 'sharp'       // 200ms — penalties
  | 'spring'      // Bouncy celebration
  | 'softSpring'; // Subtle bounce

/** Direction for RTL-aware animations */
export type AnimationDirection = 'left' | 'right' | 'up' | 'down';

// ─── Hook ───────────────────────────────────────────────────────

export interface UseAnimationOptions {
  /** Animation weight/urgency (affects duration) */
  weight?: AnimationWeight;
  /** Whether to respect reduce-motion setting */
  respectReduceMotion?: boolean;
}

export interface UseAnimationReturn {
  /** Get timing config for a given weight */
  getTiming: (weight?: AnimationWeight) => WithTimingConfig | WithSpringConfig;
  /** Convert a direction to the correct value based on RTL */
  toRTL: (direction: AnimationDirection) => AnimationDirection;
  /** Whether reduced motion is active */
  reduceMotion: boolean;
  /** Shared value + animated style factory for fade in */
  fadeIn: (initialOpacity?: number) => {
    opacity: ReturnType<typeof useSharedValue<number>>;
    style: ReturnType<typeof useAnimatedStyle>;
    animate: (toValue?: number) => void;
  };
  /** Shared value + animated style factory for slide in */
  slideIn: (direction?: AnimationDirection, distance?: number) => {
    translateX: ReturnType<typeof useSharedValue<number>>;
    translateY: ReturnType<typeof useSharedValue<number>>;
    opacity: ReturnType<typeof useSharedValue<number>>;
    style: ReturnType<typeof useAnimatedStyle>;
    animate: (toValue?: number) => void;
  };
}

/**
 * useAnimation — Provides animation presets, RTL helpers, and
 * reusable animated style factories.
 *
 * Basic usage:
 * ```tsx
 * const { fadeIn, reduceMotion } = useAnimation();
 * const { style, animate } = fadeIn();
 * useEffect(() => { animate(); }, []);
 * return <Animated.View style={style} />;
 * ```
 */
export function useAnimation(options?: UseAnimationOptions): UseAnimationReturn {
  const reduceMotionCtx = useContext(ReduceMotionContext);
  const respectReduceMotion = options?.respectReduceMotion ?? true;

  const reduceMotion = respectReduceMotion ? reduceMotionCtx.reduceMotion : false;
  const isRTL = I18nManager.isRTL;

  /** Get timing config for a weight, respecting reduce-motion */
  const getTiming = useCallback(
    (weight: AnimationWeight = options?.weight ?? 'normal'): WithTimingConfig | WithSpringConfig => {
      if (reduceMotion) {
        // Skip animations when reduce motion is active
        return { duration: 0 };
      }

      switch (weight) {
        case 'fast':
          return TimingPresets.fast();
        case 'normal':
          return TimingPresets.normal();
        case 'smooth':
          return TimingPresets.smooth();
        case 'strategic':
          return TimingPresets.strategic();
        case 'cinematic':
          return TimingPresets.cinematic();
        case 'sharp':
          return TimingPresets.sharp();
        case 'spring':
          return TimingPresets.spring();
        case 'softSpring':
          return TimingPresets.softSpring();
        default:
          return TimingPresets.normal();
      }
    },
    [reduceMotion, options?.weight],
  );

  /** Convert direction for RTL layouts */
  const toRTL = useCallback(
    (direction: AnimationDirection): AnimationDirection => {
      if (!isRTL) return direction;
      // Flip horizontal directions for RTL
      switch (direction) {
        case 'left':
          return 'right';
        case 'right':
          return 'left';
        default:
          return direction;
      }
    },
    [isRTL],
  );

  /** Factory: create a fade-in animation */
  const fadeIn = useCallback(
    (initialOpacity: number = 0) => {
      const opacity = useSharedValue(initialOpacity);
      const style = useAnimatedStyle(() => ({
        opacity: opacity.value,
      }));
      const animate = (toValue: number = 1) => {
        opacity.value = withTiming(toValue, getTiming('smooth'));
      };
      return { opacity, style, animate };
    },
    [getTiming],
  );

  /** Factory: create a slide-in animation */
  const slideIn = useCallback(
    (direction: AnimationDirection = 'up', distance: number = 50) => {
      const adjustedDir = toRTL(direction);

      const initialX = adjustedDir === 'left' ? -distance : adjustedDir === 'right' ? distance : 0;
      const initialY = adjustedDir === 'up' ? -distance : adjustedDir === 'down' ? distance : 0;

      const translateX = useSharedValue(initialX);
      const translateY = useSharedValue(initialY);
      const opacity = useSharedValue(0);

      const style = useAnimatedStyle(() => ({
        transform: [
          { translateX: translateX.value },
          { translateY: translateY.value },
        ],
        opacity: opacity.value,
      }));

      const animate = () => {
        translateX.value = withTiming(0, getTiming('smooth'));
        translateY.value = withTiming(0, getTiming('smooth'));
        opacity.value = withTiming(1, getTiming('smooth'));
      };

      return { translateX, translateY, opacity, style, animate };
    },
    [toRTL, getTiming],
  );

  return useMemo(
    () => ({
      getTiming,
      toRTL,
      reduceMotion,
      fadeIn,
      slideIn,
    }),
    [getTiming, toRTL, reduceMotion, fadeIn, slideIn],
  );
}

export default useAnimation;

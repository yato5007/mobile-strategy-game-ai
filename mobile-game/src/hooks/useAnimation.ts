/**
 * useAnimation — Animation timing presets and reusable animation utilities.
 *
 * Wraps react-native-reanimated to provide:
 * - Timing presets (fast, normal, slow, strategic)
 * - Common animation configurations
 * - RTL-aware direction helpers
 * - Reduce-motion support via context
 *
 * IMPORTANT: This hook does NOT create any useSharedValue or useAnimatedStyle
 * internally. Those hooks must be called at the top level of the calling
 * component/hook. This hook provides timing configs and direction helpers.
 *
 * For creating shared values, use individual hooks (useFadeAnimation,
 * useSlideAnimation) or raw Reanimated hooks in your component.
 *
 * Depends on:
 * - react-native-reanimated (v4.3.1+)
 * - ReduceMotionContext for accessibility
 */

import { useCallback, useContext, useMemo } from 'react';
import { I18nManager } from 'react-native';
import {
  withTiming,
  withSpring,
  useSharedValue,
  useAnimatedStyle,
  type WithTimingConfig,
  type WithSpringConfig,
  type SharedValue,
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

/** Result of a fade animation setup */
export interface FadeAnimation {
  opacity: SharedValue<number>;
  style: ReturnType<typeof useAnimatedStyle>;
  animate: (toValue?: number) => void;
}

/** Result of a slide animation setup */
export interface SlideAnimation {
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  opacity: SharedValue<number>;
  style: ReturnType<typeof useAnimatedStyle>;
  animate: () => void;
}

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
}

/**
 * useAnimation — Provides animation presets and RTL helpers.
 *
 * This hook is safe to use — it does not create useSharedValue or
 * useAnimatedStyle internally (those must be called at the top level
 * of a component).
 *
 * For animated styles, use the dedicated animation hooks:
 * - useFadeAnimation() — creates fade in/out shared values + style
 * - useSlideAnimation() — creates slide in/out shared values + style
 *
 * Or use raw Reanimated hooks in your component:
 * ```tsx
 * const opacity = useSharedValue(0);
 * const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
 * const { getTiming, toRTL, reduceMotion } = useAnimation();
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

  return useMemo(
    () => ({
      getTiming,
      toRTL,
      reduceMotion,
    }),
    [getTiming, toRTL, reduceMotion],
  );
}

// ─── Dedicated Animation Hooks ───────────────────────────────────

/**
 * useFadeAnimation — Creates a fade-in animation.
 *
 * Call at the top level of a component. Returns shared values,
 * animated style, and an animate() function.
 *
 * ```tsx
 * const { style, animate } = useFadeAnimation();
 * useEffect(() => { animate(); }, []);
 * return <Animated.View style={style} />;
 * ```
 */
export function useFadeAnimation(initialOpacity: number = 0): FadeAnimation {
  const opacity = useSharedValue(initialOpacity);
  const { getTiming } = useAnimation();

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const animate = useCallback(
    (toValue: number = 1) => {
      opacity.value = withTiming(toValue, getTiming('smooth'));
    },
    [opacity, getTiming],
  );

  return { opacity, style, animate };
}

/**
 * useSlideAnimation — Creates a slide-in animation.
 *
 * Call at the top level of a component. Direction is RTL-aware.
 *
 * ```tsx
 * const { style, animate } = useSlideAnimation('up');
 * useEffect(() => { animate(); }, []);
 * return <Animated.View style={style} />;
 * ```
 */
export function useSlideAnimation(
  direction: AnimationDirection = 'up',
  distance: number = 50,
): SlideAnimation {
  const { getTiming, toRTL } = useAnimation();
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

  const animate = useCallback(() => {
    translateX.value = withTiming(0, getTiming('smooth'));
    translateY.value = withTiming(0, getTiming('smooth'));
    opacity.value = withTiming(1, getTiming('smooth'));
  }, [translateX, translateY, opacity, getTiming]);

  return { translateX, translateY, opacity, style, animate };
}

export default useAnimation;

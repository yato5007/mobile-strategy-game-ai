/**
 * PhaseOverlay Component — animated overlay for reveal/resolution/cleanup phases.
 *
 * Types:
 * - reveal: Semi-transparent dark overlay, cards flip with stagger
 * - resolution: Lane highlights, VP float effects
 * - cleanup: Cards fade, new cards slide in
 */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useTranslation } from '../localization/useTranslation';
import { Colors } from '../theme';
import { RTLText } from './RTLText';

// ─── Types ──────────────────────────────────────────────────────

export type OverlayType = 'reveal' | 'resolution' | 'cleanup' | 'none';

interface PhaseOverlayProps {
  /** Type of overlay to show */
  type: OverlayType;
  /** Whether the overlay is visible */
  visible: boolean;
  /** Current round number */
  roundNumber: number;
  /** Called when overlay animation completes */
  onComplete?: () => void;
}

// ─── Component ──────────────────────────────────────────────────

export const PhaseOverlay: React.FC<PhaseOverlayProps> = ({
  type,
  visible,
  roundNumber,
  onComplete,
}) => {
  const { t } = useTranslation();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after animation
      const duration = type === 'reveal' ? 1500 : type === 'resolution' ? 2000 : 1000;
      const timer = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          onComplete?.();
        });
      }, duration);

      return () => clearTimeout(timer);
    } else {
      opacity.setValue(0);
      scale.setValue(0.8);
    }
  }, [visible, type]);

  if (!visible) return null;

  const getTitle = (): string => {
    switch (type) {
      case 'reveal': return t('game.phase.reveal');
      case 'resolution': return t('game.phase.resolution');
      case 'cleanup': return t('game.phase.cleanup');
      default: return '';
    }
  };

  const getSubtitle = (): string => {
    if (type === 'reveal') {
      return t('game.round', { n: roundNumber, max: 12 });
    }
    return '';
  };

  const getBackgroundColor = (): string => {
    switch (type) {
      case 'reveal': return 'rgba(26, 39, 68, 0.85)';
      case 'resolution': return 'rgba(0, 0, 0, 0.7)';
      case 'cleanup': return 'rgba(26, 39, 68, 0.6)';
      default: return 'rgba(0, 0, 0, 0.5)';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          backgroundColor: getBackgroundColor(),
        },
      ]}
      pointerEvents="none"
    >
      <Animated.View
        style={[
          styles.content,
          { transform: [{ scale }] },
        ]}
      >
        {/* Phase Icon */}
        <View style={styles.iconContainer}>
          <RTLText style={styles.phaseIcon}>
            {type === 'reveal' ? '⚔' : type === 'resolution' ? '🏆' : '✨'}
          </RTLText>
        </View>

        {/* Phase Title */}
        <RTLText gold bold style={styles.phaseTitle}>
          {getTitle()}
        </RTLText>

        {/* Subtitle */}
        {getSubtitle() !== '' && (
          <RTLText small style={styles.phaseSubtitle}>
            {getSubtitle()}
          </RTLText>
        )}

        {/* Loading dots */}
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: Colors.accentGold,
                  opacity: 0.6,
                },
              ]}
            />
          ))}
        </View>
      </Animated.View>
    </Animated.View>
  );
};

// ─── Styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  content: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  iconContainer: {
    marginBottom: 16,
  },
  phaseIcon: {
    fontSize: 48,
  },
  phaseTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  phaseSubtitle: {
    color: Colors.neutralText,
    opacity: 0.7,
    marginBottom: 16,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});

export default PhaseOverlay;

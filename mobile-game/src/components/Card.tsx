/**
 * Card Component — displays a game card in hand or on a lane.
 *
 * States:
 * - default: Normal state, face showing
 * - selected: Lifted + gold border + slight scale
 * - placed: In lane slot, face-down to others
 * - revealing: Flip animation (500ms)
 * - resolved: Grayed out if lost, glowing if won
 *
 * Design: SVG-based with Arabic-first visual style.
 */
import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  I18nManager,
} from 'react-native';
import { useTranslation } from '../localization/useTranslation';
import { Colors, Spacing, Typography } from '../theme';
import { RTLText } from './RTLText';
import { RTLPressable } from './RTLPressable';
import type { Card as CardType } from '../game/types';

// ─── Types ──────────────────────────────────────────────────────

export type CardState = 'default' | 'selected' | 'placed' | 'revealing' | 'resolved' | 'won' | 'lost';

interface CardProps {
  /** The card data from game engine */
  card: CardType;
  /** Visual state of the card */
  state?: CardState;
  /** Whether this card is face-down */
  faceDown?: boolean;
  /** Whether card is in hand (vs placed on lane) */
  inHand?: boolean;
  /** Player ID who owns this card (for coloring) */
  playerId?: number;
  /** Called when card is tapped */
  onPress?: () => void;
  /** Card width (responsive) */
  width?: number;
  /** Card height (responsive) */
  height?: number;
  /** Extra styles */
  style?: any;
}

// ─── Helpers ────────────────────────────────────────────────────

const getCardColor = (type: CardType['type']): string => {
  switch (type) {
    case 'unit': return Colors.cardUnit;
    case 'tactic': return Colors.cardTactic;
    case 'objective': return Colors.cardObjective;
    case 'comeback': return Colors.cardComeback;
    default: return Colors.cardUnit;
  }
};

const getPlayerColor = (playerId: number): string => {
  const colors = [Colors.player0, Colors.player1, Colors.player2, Colors.player3];
  return colors[playerId] ?? Colors.player0;
};

// ─── Component ──────────────────────────────────────────────────

export const CardComponent: React.FC<CardProps> = ({
  card,
  state = 'default',
  faceDown = false,
  inHand = true,
  playerId = 0,
  onPress,
  width = 56,
  height = 76,
  style,
}) => {
  const { t } = useTranslation();
  const isRTL = I18nManager.isRTL;
  const isSelected = state === 'selected';
  const isPlaced = state === 'placed';
  const isRevealing = state === 'revealing';
  const isWon = state === 'won';
  const isLost = state === 'lost';
  const isResolved = isWon || isLost;

  // Determine the border color
  const borderColor = isSelected
    ? Colors.borderSelected
    : isWon
      ? Colors.accentGold
      : isLost
        ? Colors.danger
        : getCardColor(card.type);

  const cardBgColor = faceDown
    ? Colors.secondaryBackground
    : getCardColor(card.type);

  return (
    <RTLPressable
      onPress={onPress}
      disabled={isPlaced || isResolved}
      style={[
        styles.card,
        {
          width,
          height,
          borderColor: isSelected ? Colors.borderSelected : Colors.borderDefault,
          borderWidth: isSelected ? 2 : 1,
          backgroundColor: cardBgColor,
          opacity: isLost ? 0.5 : 1,
          transform: [
            { scale: isSelected ? 1.05 : 1 },
            { translateY: isSelected ? -10 : 0 },
          ],
        },
        isWon && styles.cardWon,
        style,
      ]}
    >
      {/* Card Type Indicator Bar */}
      <View style={[
        styles.typeBar,
        { backgroundColor: getCardColor(card.type) },
      ]} />

      {/* Face-down content */}
      {faceDown ? (
        <View style={styles.faceDown}>
          <View style={styles.faceDownPattern} />
          <RTLText small style={styles.faceDownText}>
            {isRTL ? '?' : '?'}
          </RTLText>
        </View>
      ) : (
        <>
          {/* Card Name */}
          <RTLText
            small
            bold
            style={styles.cardName}
            numberOfLines={2}
          >
            {t(card.nameKey)}
          </RTLText>

          {/* Card Type Label */}
          <RTLText
            small
            style={styles.typeLabel}
          >
            {t(`card.${card.type}`)}
          </RTLText>

          {/* Strength (for units/objectives) */}
          {(card.type === 'unit' || card.type === 'objective') && (
            <View style={styles.strengthContainer}>
              <RTLText style={styles.strengthValue} bold>
                {card.strength}
              </RTLText>
              <RTLText small style={styles.strengthLabel}>
                {t('card.strength', { n: card.strength })}
              </RTLText>
            </View>
          )}

          {/* Tactic Indicator */}
          {card.tacticEffect && (
            <View style={styles.tacticIndicator}>
              <RTLText small style={styles.tacticLabel}>
                {t(`tactic.${card.tacticEffect.effectType}`)}
              </RTLText>
            </View>
          )}

          {/* Comeback badge */}
          {card.isComeback && (
            <View style={styles.comebackBadge}>
              <RTLText small style={styles.comebackText}>
                {t('card.comeback')}
              </RTLText>
            </View>
          )}
        </>
      )}

      {/* Selected indicator */}
      {isSelected && <View style={styles.selectedOverlay} />}

      {/* Won/Lost indicator */}
      {isWon && <View style={styles.wonIndicator} />}
      {isLost && <View style={styles.lostIndicator} />}
    </RTLPressable>
  );
};

// ─── Styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 4,
    marginHorizontal: 3,
    marginVertical: 2,
    justifyContent: 'flex-start',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cardWon: {
    elevation: 6,
    shadowColor: Colors.accentGold,
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  typeBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  faceDown: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceDownPattern: {
    width: 20,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    marginBottom: 4,
  },
  faceDownText: {
    color: Colors.neutralText,
    opacity: 0.6,
  },
  cardName: {
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 2,
    color: Colors.white,
  },
  typeLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 9,
    marginTop: 2,
  },
  strengthContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  strengthValue: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: '700',
  },
  strengthLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 8,
  },
  tacticIndicator: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginTop: 'auto',
    marginBottom: 2,
  },
  tacticLabel: {
    color: Colors.white,
    fontSize: 8,
  },
  comebackBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: Colors.cardComeback,
    borderRadius: 3,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  comebackText: {
    color: Colors.white,
    fontSize: 7,
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFill,
    borderWidth: 2,
    borderColor: Colors.accentGold,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  wonIndicator: {
    ...StyleSheet.absoluteFill,
    borderWidth: 2,
    borderColor: Colors.accentGold,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  lostIndicator: {
    ...StyleSheet.absoluteFill,
    borderWidth: 1,
    borderColor: Colors.danger,
    borderRadius: 8,
    backgroundColor: 'rgba(220, 20, 60, 0.1)',
  },
});

export default CardComponent;

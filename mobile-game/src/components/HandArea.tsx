/**
 * HandArea Component — displays the player's card hand as a scrollable row.
 *
 * Features:
 * - Horizontal scrolling card row
 * - Tap to select/deselect
 * - Shows selected state
 * - RTL-aware ordering
 * - Responsive card sizing
 */
import React, { useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  I18nManager,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useTranslation } from '../localization/useTranslation';
import { Colors, Spacing } from '../theme';
import { RTLText } from './RTLText';
import CardComponent from './Card';
import type { Card } from '../game/types';

// ─── Types ──────────────────────────────────────────────────────

interface HandAreaProps {
  /** Cards in the player's hand */
  cards: Card[];
  /** Currently selected card ID (or null) */
  selectedCardId: string | null;
  /** IDs of cards that have been assigned to lanes (not in hand) */
  assignedCardIds: Set<string>;
  /** Called when a card is tapped */
  onCardPress: (cardId: string) => void;
  /** Screen width for responsive sizing */
  screenWidth: number;
}

// ─── Component ──────────────────────────────────────────────────

export const HandArea: React.FC<HandAreaProps> = ({
  cards,
  selectedCardId,
  assignedCardIds,
  onCardPress,
  screenWidth,
}) => {
  const { t } = useTranslation();
  const scrollRef = useRef<ScrollView>(null);
  const isRTL = I18nManager.isRTL;

  // Calculate responsive card sizing
  const cardWidth = screenWidth < 375 ? 48 : screenWidth < 415 ? 56 : 64;
  const cardHeight = screenWidth < 375 ? 64 : screenWidth < 415 ? 76 : 88;
  const maxVisibleCards = Math.min(cards.length, 5);

  if (cards.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <RTLText small style={styles.emptyText}>
          {t('game.waiting')}
        </RTLText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RTLText small style={styles.handLabel}>
        {t('game.yourHand')} ({cards.length})
      </RTLText>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          isRTL && { flexDirection: 'row-reverse' },
        ]}
        style={styles.scrollView}
      >
        {cards.map((card) => {
          const isSelected = card.id === selectedCardId;
          const isAssigned = assignedCardIds.has(card.id);
          const cardState = isSelected ? 'selected' : isAssigned ? 'placed' : 'default';

          return (
            <CardComponent
              key={card.id}
              card={card}
              state={cardState as any}
              inHand={true}
              onPress={() => onCardPress(card.id)}
              width={cardWidth}
              height={cardHeight}
              style={styles.cardItem}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};

// ─── Styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.secondaryBackground,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    paddingTop: 4,
    paddingBottom: 8,
  },
  handLabel: {
    color: Colors.neutralText,
    paddingHorizontal: Spacing.screenEdge,
    marginBottom: 4,
    opacity: 0.8,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenEdge,
    alignItems: 'center',
  },
  cardItem: {
    marginHorizontal: 3,
  },
  emptyContainer: {
    backgroundColor: Colors.secondaryBackground,
    padding: Spacing.md,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  emptyText: {
    color: Colors.neutralText,
    opacity: 0.6,
  },
});

export default HandArea;

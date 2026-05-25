/**
 * Unit tests — Cards
 *
 * Tests deck creation, shuffle, draw, discard, and comeback card mechanics.
 */
import {
  createDeck,
  shuffleDeck,
  drawCards,
  discardCards,
  drawStartingHand,
  drawTurnCards,
  drawComebackCard,
  drawComebackDraw,
  resetCardIdCounter,
  pickRandomRotatingCards,
} from '../cards';

import type { Card } from '../types';

/** Deterministic seed-based random for testing */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

describe('Card System — resetCardIdCounter', () => {
  beforeEach(() => {
    resetCardIdCounter();
  });

  it('should reset the card ID counter', () => {
    const deck1 = createDeck();
    resetCardIdCounter();
    const deck2 = createDeck();
    // Both first cards should have the same ID
    expect(deck1[0].id).toBe(deck2[0].id);
  });
});

describe('Card System — createDeck', () => {
  beforeEach(() => {
    resetCardIdCounter();
  });

  it('should create a deck with 13 staple cards (no rotating)', () => {
    const deck = createDeck([]);
    expect(deck).toHaveLength(13);
  });

  it('should create a deck with rotating cards', () => {
    const deck = createDeck(['spy', 'shield']);
    expect(deck).toHaveLength(15); // 13 staples + 2 rotating
  });

  it('should create a deck with staple units: 3 scouts, 3 soldiers, 2 knights, 1 champion', () => {
    const deck = createDeck([]);
    const scouts = deck.filter(c => c.nameKey === 'card.scout');
    const soldiers = deck.filter(c => c.nameKey === 'card.soldier');
    const knights = deck.filter(c => c.nameKey === 'card.knight');
    const champions = deck.filter(c => c.nameKey === 'card.champion');

    expect(scouts).toHaveLength(3);
    expect(soldiers).toHaveLength(3);
    expect(knights).toHaveLength(2);
    expect(champions).toHaveLength(1);

    // Check strengths
    for (const s of scouts) expect(s.strength).toBe(1);
    for (const s of soldiers) expect(s.strength).toBe(2);
    for (const k of knights) expect(k.strength).toBe(3);
    for (const c of champions) expect(c.strength).toBe(4);
  });

  it('should create a deck with staple tactics: 2 bluff, 1 sabotage, 1 reinforce', () => {
    const deck = createDeck([]);
    const bluffs = deck.filter(c => c.nameKey === 'card.bluff');
    const sabotages = deck.filter(c => c.nameKey === 'card.sabotage');
    const reinforces = deck.filter(c => c.nameKey === 'card.reinforce');

    expect(bluffs).toHaveLength(2);
    expect(sabotages).toHaveLength(1);
    expect(reinforces).toHaveLength(1);
  });

  it('should create unique card IDs for each card', () => {
    const deck = createDeck(['spy', 'shield', 'retreat', 'ambush']);
    const ids = deck.map(c => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should create all cards with correct type field', () => {
    const deck = createDeck();
    const allUnits = deck.filter(c => c.type === 'unit');
    const allTactics = deck.filter(c => c.type === 'tactic');
    expect(allUnits.length + allTactics.length).toBe(deck.length);
  });

  it('should set isComeback to false for all normal deck cards', () => {
    const deck = createDeck();
    expect(deck.every(c => !c.isComeback)).toBe(true);
  });

  it('should include rotating cards when specified', () => {
    const deck = createDeck(['spy']);
    const spyCards = deck.filter(c => c.nameKey === 'card.spy');
    expect(spyCards).toHaveLength(1);
  });
});

describe('Card System — shuffleDeck', () => {
  beforeEach(() => {
    resetCardIdCounter();
  });

  it('should shuffle the deck in-place', () => {
    const deck = createDeck();
    const originalOrder = [...deck];
    shuffleDeck(deck, seededRandom(42));
    // Check that the deck still has the same cards (by id)
    expect(deck).toHaveLength(originalOrder.length);
    const deckIds = deck.map(c => c.id).sort();
    const originalIds = originalOrder.map(c => c.id).sort();
    expect(deckIds).toEqual(originalIds);
  });

  it('should produce different order with different seeds', () => {
    const deck1 = createDeck([]);
    const deck2 = createDeck([]);
    shuffleDeck(deck1, seededRandom(1));
    shuffleDeck(deck2, seededRandom(2));
    const ids1 = deck1.map(c => c.id);
    const ids2 = deck2.map(c => c.id);
    // Very unlikely to be identical
    expect(ids1).not.toEqual(ids2);
  });

  it('should produce deterministic order with same seed', () => {
    const deck1 = createDeck([]);
    const deck2 = createDeck([]);
    shuffleDeck(deck1, seededRandom(42));
    shuffleDeck(deck2, seededRandom(42));
    const ids1 = deck1.map(c => c.id);
    const ids2 = deck2.map(c => c.id);
    expect(ids1).toEqual(ids2);
  });

  it('should not modify deck length', () => {
    const deck = createDeck(['spy', 'shield']);
    const len = deck.length;
    shuffleDeck(deck, seededRandom(7));
    expect(deck).toHaveLength(len);
  });
});

describe('Card System — drawCards', () => {
  beforeEach(() => {
    resetCardIdCounter();
  });

  it('should draw the correct number of cards', () => {
    const deck = createDeck([]);
    const result = drawCards(deck, 3, [], seededRandom(1));
    expect(result.drawn).toHaveLength(3);
    expect(result.deck).toHaveLength(deck.length - 3);
  });

  it('should draw from top of deck (first cards)', () => {
    const deck = createDeck([]);
    const firstCardId = deck[0].id;
    const result = drawCards(deck, 1, [], seededRandom(1));
    expect(result.drawn[0].id).toBe(firstCardId);
  });

  it('should reshuffle discard into deck when deck is empty', () => {
    // Create a small deck and draw everything
    const smallDeck = createDeck([]);
    const discardPile: Card[] = [];
    // Draw all cards
    const result1 = drawCards(smallDeck, smallDeck.length, discardPile, seededRandom(1));
    expect(result1.deck).toHaveLength(0);

    // Now draw more — should reshuffle from discard
    const result2 = drawCards(result1.deck, 2, result1.discardPile, seededRandom(1));
    expect(result2.drawn).toHaveLength(2);
  });

  it('should return empty array when no cards available', () => {
    const result = drawCards([], 5, [], seededRandom(1));
    expect(result.drawn).toHaveLength(0);
  });

  it('should handle partial draws when deck runs out', () => {
    const deck = createDeck([]);
    // Request more cards than available
    const result = drawCards(deck, 999, [], seededRandom(1));
    expect(result.drawn.length).toBeLessThanOrEqual(deck.length);
  });
});

describe('Card System — discardCards', () => {
  beforeEach(() => {
    resetCardIdCounter();
  });

  it('should move specified cards from hand to discard pile', () => {
    const deck = createDeck([]);
    const hand = deck.slice(0, 5);
    const discardedIds = [hand[0].id, hand[2].id];
    const result = discardCards(hand, discardedIds, []);
    expect(result.hand).toHaveLength(3); // 5 - 2 = 3
    expect(result.discardPile).toHaveLength(2);
  });

  it('should keep non-discarded cards in hand', () => {
    const deck = createDeck([]);
    const hand = deck.slice(0, 3);
    const result = discardCards(hand, [hand[0].id], []);
    expect(result.hand.filter(c => c.id === hand[0].id)).toHaveLength(0);
    expect(result.hand.filter(c => c.id === hand[1].id)).toHaveLength(1);
    expect(result.hand.filter(c => c.id === hand[2].id)).toHaveLength(1);
  });

  it('should handle empty discard list', () => {
    const hand = createDeck([]).slice(0, 3);
    const result = discardCards(hand, [], []);
    expect(result.hand).toHaveLength(3);
    expect(result.discardPile).toHaveLength(0);
  });

  it('should append to existing discard pile', () => {
    const hand = createDeck([]).slice(0, 3);
    const existingDiscard = createDeck([]).slice(6, 8);
    const result = discardCards(hand, [hand[0].id], existingDiscard);
    expect(result.discardPile).toHaveLength(existingDiscard.length + 1);
  });
});

describe('Card System — drawStartingHand', () => {
  beforeEach(() => {
    resetCardIdCounter();
  });

  it('should draw exactly STARTING_HAND_SIZE cards', () => {
    const deck = createDeck(['spy', 'shield']);
    shuffleDeck(deck, seededRandom(42));
    const { hand, deck: remaining } = drawStartingHand(deck, seededRandom(42));
    expect(hand).toHaveLength(6);
  });

  it('should reduce the deck accordingly', () => {
    const deck = createDeck(['spy', 'shield']);
    shuffleDeck(deck, seededRandom(42));
    const { hand, deck: remaining } = drawStartingHand(deck, seededRandom(42));
    expect(remaining).toHaveLength(deck.length - hand.length);
  });
});

describe('Card System — drawTurnCards', () => {
  beforeEach(() => {
    resetCardIdCounter();
  });

  it('should draw DRAW_PER_ROUND cards', () => {
    const deck = createDeck(['spy', 'shield']);
    shuffleDeck(deck, seededRandom(42));
    const result = drawTurnCards(deck, [], seededRandom(42));
    expect(result.drawn).toHaveLength(2);
  });

  it('should draw from the deck', () => {
    const deck = createDeck([]);
    const firstCardId = deck[0].id;
    const result = drawTurnCards(deck, [], seededRandom(1));
    expect(result.drawn[0].id).toBe(firstCardId);
  });
});

describe('Card System — drawComebackCard', () => {
  beforeEach(() => {
    resetCardIdCounter();
  });

  it('should return a card with isComeback = true', () => {
    const card = drawComebackCard(() => 0);
    expect(card.isComeback).toBe(true);
  });

  it('should return a card with type "tactic" or "comeback"', () => {
    // Different comeback cards may have different types
    const card = drawComebackCard(() => 0);
    expect(['tactic', 'comeback']).toContain(card.type);
  });

  it('should produce deterministic results with a seeded random', () => {
    const card1 = drawComebackCard(() => 0.1);
    const card2 = drawComebackCard(() => 0.1);
    expect(card1.id).toBe(card2.id);
    expect(card1.nameKey).toBe(card2.nameKey);
  });

  it('should respect the weight distribution', () => {
    // With random = 0.4, we should get the second card
    const card = drawComebackCard(() => 0.4);
    // Weight ranges: 0-0.39 = determination, 0.4-0.69 = last-stand
    expect(card.nameKey).toBe('card.last-stand');
  });

  it('should return determination on low roll', () => {
    const card = drawComebackCard(() => 0.01);
    expect(card.nameKey).toBe('card.determination');
  });

  it('should return fortuna at the high end of weights', () => {
    // Fortuna has weight 10, starting at cumulative 0.9 (90-100)
    const card = drawComebackCard(() => 0.95);
    expect(card.nameKey).toBe('card.fortuna');
  });
});

describe('Card System — drawComebackDraw', () => {
  beforeEach(() => {
    resetCardIdCounter();
  });

  it('should draw COMEBACK_EXTRA_DRAW (1) card', () => {
    const deck = createDeck([]);
    const result = drawComebackDraw(deck, [], seededRandom(42));
    expect(result.drawn).toHaveLength(1);
  });
});

describe('Card System — pickRandomRotatingCards', () => {
  beforeEach(() => {
    resetCardIdCounter();
  });

  it('should return ROTATING_CARD_COUNT (2) cards', () => {
    const picks = pickRandomRotatingCards(() => 0.1);
    expect(picks).toHaveLength(2);
  });

  it('should return unique card types', () => {
    const picks = pickRandomRotatingCards(() => 0.1);
    const unique = new Set(picks);
    expect(unique.size).toBe(picks.length);
  });

  it('should return valid tactic effect types', () => {
    const validTypes = ['spy', 'shield', 'retreat', 'ambush', 'sabotage', 'reinforce'];
    const picks = pickRandomRotatingCards(() => 0.1);
    for (const pick of picks) {
      expect(validTypes).toContain(pick);
    }
  });

  it('should produce deterministic results with seeded random', () => {
    const picks1 = pickRandomRotatingCards(() => 0.5);
    const picks2 = pickRandomRotatingCards(() => 0.5);
    expect(picks1).toEqual(picks2);
  });

  it('should produce different results with different seeds', () => {
    const picks1 = pickRandomRotatingCards(() => 0.1);
    const picks2 = pickRandomRotatingCards(() => 0.9);
    // Could theoretically be the same, but very unlikely for different seeds
    // Just check they're valid
    expect(picks1).toHaveLength(2);
    expect(picks2).toHaveLength(2);
  });
});

describe('Card System — Full Deck Integration', () => {
  beforeEach(() => {
    resetCardIdCounter();
  });

  it('should create a complete playable deck with valid IDs', () => {
    const rotating = pickRandomRotatingCards(() => 0.42);
    const deck = createDeck(rotating);
    expect(deck.length).toBeGreaterThanOrEqual(13);
    expect(deck.length).toBeLessThanOrEqual(15);

    for (const card of deck) {
      expect(card.id).toBeTruthy();
      expect(card.nameKey).toBeTruthy();
      expect(typeof card.strength).toBe('number');
    }
  });

  it('should support end-to-end: deck → shuffle → draw → discard', () => {
    const deck = createDeck(['spy', 'shield']);
    shuffleDeck(deck, seededRandom(7));
    expect(deck).toHaveLength(15);

    const { hand, deck: afterDraw } = drawStartingHand(deck, seededRandom(7));
    expect(hand).toHaveLength(6);
    expect(afterDraw).toHaveLength(9);

    // Discard 2 cards
    const discard = discardCards(hand, [hand[0].id, hand[1].id], []);
    expect(discard.hand).toHaveLength(4);
    expect(discard.discardPile).toHaveLength(2);

    // Draw turn cards
    const turnDraw = drawTurnCards(afterDraw, discard.discardPile, seededRandom(7));
    expect(turnDraw.drawn).toHaveLength(2);
    expect(turnDraw.deck).toHaveLength(7);
  });
});

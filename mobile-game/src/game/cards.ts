/**
 * Core Game Logic Engine — Card System
 *
 * Card definitions, deck creation, shuffle, draw, and discard mechanics.
 */

import type { Card, CardId } from './types';
import type { TacticEffectType } from './types';
import {
  STAPLE_UNITS,
  STAPLE_TACTICS,
  ROTATING_CARD_POOL,
  ROTATING_CARD_COUNT,
  COMEBACK_CARDS,
  STARTING_HAND_SIZE,
  DRAW_PER_ROUND,
  COMEBACK_EXTRA_DRAW,
} from './constants';

// ─── ID Generation ─────────────────────────────────────────────

let _cardCounter = 0;

/** Generate a unique card ID */
export function generateCardId(type: string, name: string): CardId {
  return `${type}-${name}-${++_cardCounter}`;
}

/** Reset the card ID counter (for testing) */
export function resetCardIdCounter(): void {
  _cardCounter = 0;
}

// ─── Card Factory ──────────────────────────────────────────────

/** Create a unit card */
function createUnitCard(
  nameKey: string,
  strength: number,
  isComeback = false,
): Card {
  return {
    id: generateCardId('unit', nameKey),
    type: 'unit',
    nameKey,
    strength,
    tacticEffect: null,
    descriptionKey: `${nameKey}.desc`,
    isComeback,
  };
}

/** Create a tactic card */
function createTacticCard(
  nameKey: string,
  effectType: TacticEffectType,
  magnitude?: number,
  isComeback = false,
): Card {
  return {
    id: generateCardId('tactic', nameKey),
    type: 'tactic',
    nameKey,
    strength: 0,
    tacticEffect: {
      effectType,
      magnitude: magnitude ?? getDefaultMagnitude(effectType),
      targetPlayerId: null,
      targetLaneIndex: null,
    },
    descriptionKey: `${nameKey}.desc`,
    isComeback,
  };
}

/** Get default magnitude for a tactic effect type */
function getDefaultMagnitude(effectType: TacticEffectType): number {
  switch (effectType) {
    case 'sabotage': return 2;
    case 'reinforce': return 3;
    case 'bluff': return 0;
    case 'spy': return 0;
    case 'shield': return 0;
    case 'retreat': return 0;
    case 'ambush': return 1; // VP denial amount
    default: return 0;
  }
}

/** Create an objective card */
function createObjectiveCard(nameKey: string, strength: number): Card {
  return {
    id: generateCardId('objective', nameKey),
    type: 'objective',
    nameKey,
    strength,
    tacticEffect: null,
    descriptionKey: `${nameKey}.desc`,
    isComeback: false,
  };
}

// ─── Deck Construction ─────────────────────────────────────────

/** Build a full deck for one player (staple + rotating cards) */
export function createDeck(
  rotatingCardChoices?: TacticEffectType[],
): Card[] {
  const deck: Card[] = [];

  // Add staple unit cards
  for (const unit of STAPLE_UNITS) {
    for (let i = 0; i < unit.count; i++) {
      deck.push(createUnitCard(unit.nameKey, unit.strength));
    }
  }

  // Add staple tactic cards
  for (const tactic of STAPLE_TACTICS) {
    for (let i = 0; i < tactic.count; i++) {
      deck.push(createTacticCard(tactic.nameKey, tactic.effectType));
    }
  }

  // Add rotating cards (if specified)
  const effects = rotatingCardChoices ?? pickRandomRotatingCards();
  for (const effectType of effects) {
    const poolEntry = ROTATING_CARD_POOL.find(c => c.effectType === effectType);
    if (poolEntry) {
      deck.push(createTacticCard(poolEntry.nameKey, effectType));
    }
  }

  return deck;
}

/** Pick 2 random rotating cards from the pool */
export function pickRandomRotatingCards(randomFn?: () => number): TacticEffectType[] {
  const choices: TacticEffectType[] = [];
  const pool = [...ROTATING_CARD_POOL];
  const rand = randomFn ?? Math.random;

  while (choices.length < ROTATING_CARD_COUNT && pool.length > 0) {
    const index = Math.floor(rand() * pool.length);
    choices.push(pool[index].effectType);
    pool.splice(index, 1);
  }

  return choices;
}

// ─── Shuffle ───────────────────────────────────────────────────

/** Fisher-Yates shuffle (in-place, returns the array) */
export function shuffleDeck<T>(deck: T[], randomFn?: () => number): T[] {
  const rand = randomFn ?? Math.random;
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// ─── Draw ──────────────────────────────────────────────────────

/** Draw `count` cards from the deck. If deck is empty, reshuffle discard into deck. */
export function drawCards(
  deck: Card[],
  count: number,
  discardPile: Card[],
  randomFn?: () => number,
): { drawn: Card[]; deck: Card[]; discardPile: Card[] } {
  const drawn: Card[] = [];
  let remaining = [...deck];
  const discards = [...discardPile];

  for (let i = 0; i < count; i++) {
    if (remaining.length === 0) {
      // Reshuffle discard into deck
      if (discards.length === 0) {
        break; // No cards left at all
      }
      remaining = shuffleDeck([...discards], randomFn);
      discards.length = 0;
    }
    drawn.push(remaining.shift()!);
  }

  return { drawn, deck: remaining, discardPile: discards };
}

// ─── Discard ───────────────────────────────────────────────────

/** Discard specific cards from hand by their IDs. Returns updated hand and discard pile. */
export function discardCards(
  hand: Card[],
  cardIds: CardId[],
  discardPile: Card[],
): { hand: Card[]; discardPile: Card[] } {
  const idSet = new Set(cardIds);
  const remaining: Card[] = [];
  const discarded: Card[] = [];

  for (const card of hand) {
    if (idSet.has(card.id)) {
      discarded.push(card);
    } else {
      remaining.push(card);
    }
  }

  return {
    hand: remaining,
    discardPile: [...discardPile, ...discarded],
  };
}

// ─── Comeback Cards ────────────────────────────────────────────

/** Draw a random comeback card from the weighted pool */
export function drawComebackCard(randomFn?: () => number): Card {
  const rand = randomFn ?? Math.random;
  const totalWeight = COMEBACK_CARDS.reduce((sum, c) => sum + c.weight, 0);
  let roll = rand() * totalWeight;

  for (const entry of COMEBACK_CARDS) {
    roll -= entry.weight;
    if (roll <= 0) {
      // Create the comeback card
      if (entry.effectType === 'fortuna') {
        return {
          id: generateCardId('comeback', entry.nameKey),
          type: 'comeback',
          nameKey: entry.nameKey,
          strength: 0,
          tacticEffect: {
            effectType: 'reinforce',
            magnitude: 0,
            targetPlayerId: null,
            targetLaneIndex: null,
          },
          descriptionKey: entry.descriptionKey,
          isComeback: true,
        };
      }
      return createTacticCard(
        entry.nameKey,
        entry.effectType as TacticEffectType,
        entry.effectType === 'reinforce' ? 4 : undefined, // Determination is +4, not +3
        true,
      );
    }
  }

  // Fallback (shouldn't reach here)
  return createTacticCard('card.determination', 'reinforce', 4, true);
}

// ─── Starting Hand ─────────────────────────────────────────────

/** Draw the initial hand from a shuffled deck */
export function drawStartingHand(deck: Card[], randomFn?: () => number): {
  hand: Card[];
  deck: Card[];
} {
  const result = drawCards(deck, STARTING_HAND_SIZE, [], randomFn);
  return { hand: result.drawn, deck: result.deck };
}

// ─── Turn Draw ─────────────────────────────────────────────────

/** Draw cards for a normal turn (end-of-round draw) */
export function drawTurnCards(
  deck: Card[],
  discardPile: Card[],
  randomFn?: () => number,
): { drawn: Card[]; deck: Card[]; discardPile: Card[] } {
  return drawCards(deck, DRAW_PER_ROUND, discardPile, randomFn);
}

/** Draw extra cards for comeback bonus */
export function drawComebackDraw(
  deck: Card[],
  discardPile: Card[],
  randomFn?: () => number,
): { drawn: Card[]; deck: Card[]; discardPile: Card[] } {
  return drawCards(deck, COMEBACK_EXTRA_DRAW, discardPile, randomFn);
}

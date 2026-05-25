import type { LaneObjectiveType, TacticEffectType } from './types';

// ─── Match Structure ───────────────────────────────────────────

/** Maximum number of rounds in a match */
export const MAX_ROUNDS = 12;

/** Base number of active lanes (rounds 1-3) */
export const LANE_COUNT_BASE = 3;

/** Total number of lanes available (when fully unlocked) */
export const LANE_COUNT_MAX = 5;

/** Lane unlock schedule: [roundNumber, lanesActive] */
export const LANE_UNLOCK_SCHEDULE: [number, number][] = [
  [1, 3],   // Rounds 1-3: 3 lanes
  [4, 4],   // Rounds 4-6: 4 lanes
  [7, 5],   // Rounds 7-12: 5 lanes
];

// ─── Timing (in seconds) ───────────────────────────────────────

/** Planning phase duration in seconds */
export const PLANNING_TIME = 45;

/** Reveal phase duration in seconds */
export const REVEAL_TIME = 5;

/** Resolution + Cleanup phase duration in seconds */
export const RESOLUTION_TIME = 20;

// ─── Hand and Deck ─────────────────────────────────────────────

/** Cards each player starts with */
export const STARTING_HAND_SIZE = 6;

/** Cards drawn at end of each round */
export const DRAW_PER_ROUND = 2;

/** Maximum cards a player can assign to a single lane */
export const MAX_CARDS_PER_LANE = 3;

/** Maximum hand size (no hard cap, but tracked for UI) */
export const MAX_HAND_SIZE = 10;

// ─── VP Values ─────────────────────────────────────────────────

/** VP awarded for winning a standard lane */
export const VP_STANDARD_LANE = 2;

/** VP awarded for winning a high-value lane */
export const VP_HIGH_VALUE_LANE = 3;

/** Minimum VP value for any lane (prevents 0 VP lanes) */
export const VP_MIN_LANE = 1;

// ─── Penalties ─────────────────────────────────────────────────

/** VP lost for submitting 0 cards in a round */
export const PENALTY_SKIP_VP = 1;

// ─── Deck Composition ──────────────────────────────────────────

/** Number of each staple unit card in every player's deck */
export const STAPLE_UNITS: { nameKey: string; strength: number; count: number }[] = [
  { nameKey: 'card.scout', strength: 1, count: 3 },
  { nameKey: 'card.soldier', strength: 2, count: 3 },
  { nameKey: 'card.knight', strength: 3, count: 2 },
  { nameKey: 'card.champion', strength: 4, count: 1 },
];

/** Staple tactic cards in every player's deck */
export const STAPLE_TACTICS: { nameKey: string; effectType: TacticEffectType; count: number }[] = [
  { nameKey: 'card.bluff', effectType: 'bluff', count: 2 },
  { nameKey: 'card.sabotage', effectType: 'sabotage', count: 1 },
  { nameKey: 'card.reinforce', effectType: 'reinforce', count: 1 },
];

/** Rotating card pool — 2 randomly selected per match */
export const ROTATING_CARD_POOL: { nameKey: string; effectType: TacticEffectType }[] = [
  { nameKey: 'card.spy', effectType: 'spy' },
  { nameKey: 'card.shield', effectType: 'shield' },
  { nameKey: 'card.retreat', effectType: 'retreat' },
  { nameKey: 'card.ambush', effectType: 'ambush' },
  { nameKey: 'card.sabotage-extra', effectType: 'sabotage' },
  { nameKey: 'card.reinforce-extra', effectType: 'reinforce' },
];

/** Number of rotating cards selected per match */
export const ROTATING_CARD_COUNT = 2;

// ─── Comeback ──────────────────────────────────────────────────

/** Extra cards drawn by trailing player */
export const COMEBACK_EXTRA_DRAW = 1;

/** Comeback card pool with weights */
export const COMEBACK_CARDS: { nameKey: string; effectType: TacticEffectType | 'fortuna'; weight: number; descriptionKey: string }[] = [
  { nameKey: 'card.determination', effectType: 'reinforce', weight: 40, descriptionKey: 'card.determination.desc' },
  { nameKey: 'card.last-stand', effectType: 'ambush', weight: 30, descriptionKey: 'card.last-stand.desc' },
  { nameKey: 'card.surprise-rally', effectType: 'reinforce', weight: 20, descriptionKey: 'card.surprise-rally.desc' },
  { nameKey: 'card.fortuna', effectType: 'fortuna', weight: 10, descriptionKey: 'card.fortuna.desc' },
];

/** Comeback bonuses only start from this round */
export const COMEBACK_START_ROUND = 2;

// ─── Achievement VP Rewards ────────────────────────────────────

export const ACHIEVEMENT_VP: Record<string, number> = {
  'control-all-lanes': 5,
  'dominate-three-lanes': 3,
  'first-blood': 2,
  'comeback-king': 3,
  'no-mercy': 2,
  'perfectionist': 2,
};

// ─── Tactic Effect Resolution Order ────────────────────────────

/** Order in which tactic effects are resolved */
export const TACTIC_RESOLUTION_ORDER: TacticEffectType[] = [
  'spy',        // 1. Reveal info (no state change)
  'retreat',    // 2. Withdraw, void targeting
  'shield',     // 3. Block incoming effects
  'sabotage',   // 4. Reduce opponent strength
  'reinforce',  // 5. Add strength
  'bluff',      // 6. Resolve bluff (visual only)
  'ambush',     // 7. VP denial on loss
];

// ─── Misc ──────────────────────────────────────────────────────

/** Lane objective type display weights (for UI sorting) */
export const LANE_OBJECTIVE_DISPLAY_ORDER: LaneObjectiveType[] = [
  'high-value',
  'capture-flag',
  'king-of-hill',
  'bounty',
  'standard',
];

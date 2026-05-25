/**
 * Unit tests — Constants
 *
 * Verifies all constant values match the design spec.
 */
import {
  MAX_ROUNDS,
  LANE_COUNT_BASE,
  LANE_COUNT_MAX,
  LANE_UNLOCK_SCHEDULE,
  PLANNING_TIME,
  REVEAL_TIME,
  RESOLUTION_TIME,
  STARTING_HAND_SIZE,
  DRAW_PER_ROUND,
  MAX_CARDS_PER_LANE,
  MAX_HAND_SIZE,
  VP_STANDARD_LANE,
  VP_HIGH_VALUE_LANE,
  VP_MIN_LANE,
  PENALTY_SKIP_VP,
  STAPLE_UNITS,
  STAPLE_TACTICS,
  ROTATING_CARD_POOL,
  ROTATING_CARD_COUNT,
  COMEBACK_EXTRA_DRAW,
  COMEBACK_START_ROUND,
  COMEBACK_CARDS,
  ACHIEVEMENT_VP,
  TACTIC_RESOLUTION_ORDER,
  LANE_OBJECTIVE_DISPLAY_ORDER,
} from '../constants';

describe('Constants — Match Structure', () => {
  it('MAX_ROUNDS should be 12', () => {
    expect(MAX_ROUNDS).toBe(12);
  });

  it('LANE_COUNT_BASE should be 3', () => {
    expect(LANE_COUNT_BASE).toBe(3);
  });

  it('LANE_COUNT_MAX should be 5', () => {
    expect(LANE_COUNT_MAX).toBe(5);
  });

  it('LANE_UNLOCK_SCHEDULE should have correct entries', () => {
    expect(LANE_UNLOCK_SCHEDULE).toEqual([
      [1, 3],
      [4, 4],
      [7, 5],
    ]);
  });
});

describe('Constants — Timing', () => {
  it('planning should be 45 seconds', () => {
    expect(PLANNING_TIME).toBe(45);
  });

  it('reveal should be 5 seconds', () => {
    expect(REVEAL_TIME).toBe(5);
  });

  it('resolution should be 20 seconds', () => {
    expect(RESOLUTION_TIME).toBe(20);
  });

  it('total match time should not exceed 30 minutes', () => {
    const totalSeconds = (PLANNING_TIME + REVEAL_TIME + RESOLUTION_TIME) * MAX_ROUNDS;
    // 12 * (45 + 5 + 20) = 12 * 70 = 840s = 14 min
    expect(totalSeconds).toBeLessThanOrEqual(30 * 60);
    expect(totalSeconds).toBe(840);
  });
});

describe('Constants — Hand and Deck', () => {
  it('STARTING_HAND_SIZE should be 6', () => {
    expect(STARTING_HAND_SIZE).toBe(6);
  });

  it('DRAW_PER_ROUND should be 2', () => {
    expect(DRAW_PER_ROUND).toBe(2);
  });

  it('MAX_CARDS_PER_LANE should be 3', () => {
    expect(MAX_CARDS_PER_LANE).toBe(3);
  });

  it('MAX_HAND_SIZE should be 10', () => {
    expect(MAX_HAND_SIZE).toBe(10);
  });
});

describe('Constants — VP Values', () => {
  it('VP_STANDARD_LANE should be 2', () => {
    expect(VP_STANDARD_LANE).toBe(2);
  });

  it('VP_HIGH_VALUE_LANE should be 3', () => {
    expect(VP_HIGH_VALUE_LANE).toBe(3);
  });

  it('VP_MIN_LANE should be 1', () => {
    expect(VP_MIN_LANE).toBe(1);
  });
});

describe('Constants — Penalties', () => {
  it('PENALTY_SKIP_VP should be 1', () => {
    expect(PENALTY_SKIP_VP).toBe(1);
  });
});

describe('Constants — Deck Composition', () => {
  it('STAPLE_UNITS should have correct card types', () => {
    expect(STAPLE_UNITS).toHaveLength(4);
    const total = STAPLE_UNITS.reduce((sum, u) => sum + u.count, 0);
    // 3 scouts + 3 soldiers + 2 knights + 1 champion = 9 unit cards
    expect(total).toBe(9);

    // Verify individual entries
    expect(STAPLE_UNITS[0]).toEqual({ nameKey: 'card.scout', strength: 1, count: 3 });
    expect(STAPLE_UNITS[1]).toEqual({ nameKey: 'card.soldier', strength: 2, count: 3 });
    expect(STAPLE_UNITS[2]).toEqual({ nameKey: 'card.knight', strength: 3, count: 2 });
    expect(STAPLE_UNITS[3]).toEqual({ nameKey: 'card.champion', strength: 4, count: 1 });
  });

  it('STAPLE_TACTICS should have correct cards', () => {
    expect(STAPLE_TACTICS).toHaveLength(3);
    const total = STAPLE_TACTICS.reduce((sum, t) => sum + t.count, 0);
    // 2 bluff + 1 sabotage + 1 reinforce = 4 tactic cards
    expect(total).toBe(4);
  });

  it('total staple cards should be 13 (9 units + 4 tactics)', () => {
    const unitCount = STAPLE_UNITS.reduce((sum, u) => sum + u.count, 0);
    const tacticCount = STAPLE_TACTICS.reduce((sum, t) => sum + t.count, 0);
    expect(unitCount + tacticCount).toBe(13);
  });

  it('ROTATING_CARD_POOL should have 6 entries', () => {
    expect(ROTATING_CARD_POOL).toHaveLength(6);
  });

  it('ROTATING_CARD_COUNT should be 2', () => {
    expect(ROTATING_CARD_COUNT).toBe(2);
  });

  it('minimum deck size should be 15 (13 staples + 2 rotating)', () => {
    const unitCount = STAPLE_UNITS.reduce((sum, u) => sum + u.count, 0);
    const tacticCount = STAPLE_TACTICS.reduce((sum, t) => sum + t.count, 0);
    expect(unitCount + tacticCount + ROTATING_CARD_COUNT).toBe(15);
  });

  it('COMEBACK_CARDS should have 4 entries with weights summing to 100', () => {
    expect(COMEBACK_CARDS).toHaveLength(4);
    const totalWeight = COMEBACK_CARDS.reduce((sum, c) => sum + c.weight, 0);
    expect(totalWeight).toBe(100);
  });

  it('COMEBACK_START_ROUND should be 2', () => {
    expect(COMEBACK_START_ROUND).toBe(2);
  });

  it('COMEBACK_EXTRA_DRAW should be 1', () => {
    expect(COMEBACK_EXTRA_DRAW).toBe(1);
  });
});

describe('Constants — Achievements', () => {
  it('ACHIEVEMENT_VP should have all 6 achievements', () => {
    const keys = Object.keys(ACHIEVEMENT_VP);
    expect(keys).toHaveLength(6);
    expect(keys).toContain('control-all-lanes');
    expect(keys).toContain('dominate-three-lanes');
    expect(keys).toContain('first-blood');
    expect(keys).toContain('comeback-king');
    expect(keys).toContain('no-mercy');
    expect(keys).toContain('perfectionist');
  });

  it('control-all-lanes should be 5 VP', () => {
    expect(ACHIEVEMENT_VP['control-all-lanes']).toBe(5);
  });

  it('first-blood should be 2 VP', () => {
    expect(ACHIEVEMENT_VP['first-blood']).toBe(2);
  });
});

describe('Constants — Tactic Resolution Order', () => {
  it('should have all 7 tactic types in correct order', () => {
    // Order: spy, retreat, shield, sabotage, reinforce, bluff, ambush
    expect(TACTIC_RESOLUTION_ORDER).toHaveLength(7);
    expect(TACTIC_RESOLUTION_ORDER[0]).toBe('spy');
    expect(TACTIC_RESOLUTION_ORDER[1]).toBe('retreat');
    expect(TACTIC_RESOLUTION_ORDER[2]).toBe('shield');
    expect(TACTIC_RESOLUTION_ORDER[3]).toBe('sabotage');
    expect(TACTIC_RESOLUTION_ORDER[4]).toBe('reinforce');
    expect(TACTIC_RESOLUTION_ORDER[5]).toBe('bluff');
    expect(TACTIC_RESOLUTION_ORDER[6]).toBe('ambush');
  });
});

describe('Constants — Lane Objective Display Order', () => {
  it('should have all 5 lane types', () => {
    expect(LANE_OBJECTIVE_DISPLAY_ORDER).toHaveLength(5);
    expect(LANE_OBJECTIVE_DISPLAY_ORDER[0]).toBe('high-value');
  });
});

/**
 * Multiplayer System — Public API
 *
 * Barrel export for the multiplayer module.
 * All external consumers (UI, Bots, App) should import from here.
 *
 * ## Usage
 * ```typescript
 * import { MockMultiplayerAdapter, createMockAdapter } from '../multiplayer';
 * import type { MultiplayerAdapter, MultiplayerConfig } from '../multiplayer';
 * ```
 *
 * @module multiplayer/index
 */

// ─── Types ─────────────────────────────────────────────────────

export type {
  SessionId,
  BotDecisionProvider,
  MultiplayerConfig,
  UnsubscribeFn,
  MultiplayerAdapter,
  SerializedGameState,
} from './types';

export { isSubmitAction } from './types';

// ─── Mock Adapter ──────────────────────────────────────────────

export { MockMultiplayerAdapter, createMockAdapter } from './mockMultiplayerAdapter';

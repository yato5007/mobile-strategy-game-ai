/**
 * Core Game Logic Engine — Event System
 *
 * Typed event emitter for game events.
 * UI, Bot, and Multiplayer systems subscribe to these events.
 */

import type { GameEvent, GameEventEmitter, GameEventHandler } from './types';

/**
 * Create a new event emitter instance.
 * Returns an object with subscribe, emit, and clear methods.
 */
export function createEventEmitter(): GameEventEmitter {
  const handlers = new Map<GameEvent['type'], Set<GameEventHandler>>();

  return {
    /**
     * Subscribe to a specific event type.
     * Returns an unsubscribe function.
     */
    subscribe(eventType: GameEvent['type'], handler: GameEventHandler): () => void {
      if (!handlers.has(eventType)) {
        handlers.set(eventType, new Set());
      }
      handlers.get(eventType)!.add(handler);

      // Return unsubscribe function
      return () => {
        const set = handlers.get(eventType);
        if (set) {
          set.delete(handler);
          if (set.size === 0) {
            handlers.delete(eventType);
          }
        }
      };
    },

    /**
     * Emit an event to all subscribers.
     */
    emit(event: GameEvent): void {
      const set = handlers.get(event.type);
      if (set) {
        for (const handler of set) {
          try {
            handler(event);
          } catch (err) {
            console.error(`[GameEvents] Error in handler for ${event.type}:`, err);
          }
        }
      }
    },

    /**
     * Clear all subscriptions.
     */
    clear(): void {
      handlers.clear();
    },
  };
}

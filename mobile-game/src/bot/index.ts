/**
 * Bot and AI System — Public API
 *
 * Barrel export for the bot system.
 * All consumers (game engine, balance simulator, mock multiplayer) should import from here.
 *
 * @module bot
 */

export type {
  BotConfig,
  BotController,
  Difficulty,
  Style,
} from './botController';

export {
  createBot,
  DEFAULT_BOT_CONFIG,
  getDifficultyProfile,
  getStyleWeights,
  validateBotConfig,
} from './botController';

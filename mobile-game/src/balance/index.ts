/**
 * Balance and Testing System — Public API
 *
 * Barrel export for the balance simulator.
 * All consumers (tests, CI, QA tools) should import from here.
 *
 * @module balance
 */

export type {
  SimulationConfig,
  SimulationResult,
  ModeResult,
  GameLogEntry,
  BalanceFlag,
  SimulatorBotSlot,
} from './balanceSimulator';

export {
  runBalanceSimulation,
  runStandardBalanceTest,
} from './balanceSimulator';

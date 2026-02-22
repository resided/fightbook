// FightBook - AI Combat Arena
// NPM Package Entry Point

// Types
export type {
  SkillsMdConfig,
  AgentPersonality,
  AgentBackstory,
  AgentSocial,
  AgentMetadata,
  CompleteAgent,
} from './types/agent';

export type {
  FightState,
  FightAction,
  FighterState,
  FighterStats,
  ActionType,
  Technique,
  RoundState,
} from './types/fight';

// Constants from agent types
export {
  POINT_BUDGET,
  POINT_CONSUMING_STATS,
  DEFAULT_SKILLS,
  DEFAULT_PERSONALITY,
  DEFAULT_BACKSTORY,
} from './types/agent';

// Constants from fight types
export {
  ROUND_DURATION,
  TOTAL_ROUNDS,
  STRIKING_TECHNIQUES,
  GRAPPLING_TECHNIQUES,
  SUBMISSION_TECHNIQUES,
  GROUND_TECHNIQUES,
} from './types/fight';

// Utilities
export {
  createNewAgent,
  generateFullSkillsMd,
  parseSkillsMd,
  calculateOverallRating,
  detectArchetype,
  calculatePointsSpent,
  calculatePointsRemaining,
  getBudgetStatus,
  canIncreaseStat,
  validateSkillsBudget,
} from './types/agent';

// Adapter
export { skillsToFighterStats } from './lib/agentAdapter';

// Version
export const VERSION = '1.1.17';

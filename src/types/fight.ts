// FightBook - MMA/MMA Combat Types

export interface FighterStats {
  name: string;
  nickname?: string;
  // Striking
  striking: number;        // 0-100: Punch/kick accuracy and power
  punchSpeed: number;      // 0-100: Hand speed
  kickPower: number;       // 0-100: Leg kick damage
  headMovement: number;    // 0-100: Slip/duck/dodge
  
  // Grappling
  wrestling: number;       // 0-100: Takedown offense
  takedownDefense: number; // 0-100: Takedown defense
  submissions: number;     // 0-100: Sub offense
  submissionDefense: number; // 0-100: Sub defense
  groundGame: number;      // 0-100: Ground control/positioning
  
  // Physical
  cardio: number;          // 0-100: Stamina pool
  chin: number;            // 0-100: Ability to take shots
  recovery: number;        // 0-100: Health regen between rounds
  
  // Mental
  aggression: number;      // 0-1: Fight pace initiator
  fightIQ: number;         // 0-100: Smart decision making
  heart: number;           // 0-100: Comeback factor
}

export interface FighterState extends FighterStats {
  id: string;
  currentHealth: number;   // 0-100
  currentStamina: number;  // 0-100
  position: 'standing' | 'clinch' | 'ground_top' | 'ground_bottom';
  hasMount: boolean;
  hasBack: boolean;
  isGrounded: boolean;
  cuts: number;            // Facial damage accumulation
  knockdowns: number;
  takedownsLanded: number;
  takedownsAttempted: number;
  significantStrikes: number;
  totalStrikes: number;
}

export interface FightAction {
  timestamp: number;
  round: number;
  timeRemaining: number;   // Seconds in round
  actor: string;
  target: string;
  type: ActionType;
  technique: Technique;
  success: boolean;
  damage: number;
  staminaCost: number;
  description: string;
  impact?: 'light' | 'moderate' | 'heavy' | 'devastating';
}

export type ActionType = 
  | 'strike' 
  | 'takedown' 
  | 'clinch' 
  | 'break_clinch'
  | 'submission_attempt'
  | 'submission_escape'
  | 'position_advance'
  | 'position_escape'
  | 'ground_pound'
  | 'elbow'
  | 'knee'
  | 'taunt';

export interface Technique {
  name: string;
  type: ActionType;
  baseDamage: number;
  staminaCost: number;
  accuracy: number;        // 0-1 base accuracy
  position: ('standing' | 'clinch' | 'ground_top' | 'ground_bottom')[];
}

// MMA/MMA Technique Library
export const STRIKING_TECHNIQUES: Technique[] = [
  { name: 'Jab', type: 'strike', baseDamage: 3, staminaCost: 2, accuracy: 0.85, position: ['standing', 'clinch'] },
  { name: 'Cross', type: 'strike', baseDamage: 6, staminaCost: 3, accuracy: 0.75, position: ['standing', 'clinch'] },
  { name: 'Hook', type: 'strike', baseDamage: 7, staminaCost: 4, accuracy: 0.70, position: ['standing', 'clinch'] },
  { name: 'Uppercut', type: 'strike', baseDamage: 8, staminaCost: 4, accuracy: 0.65, position: ['standing', 'clinch'] },
  { name: 'Overhand', type: 'strike', baseDamage: 10, staminaCost: 5, accuracy: 0.60, position: ['standing'] },
  { name: 'Leg Kick', type: 'strike', baseDamage: 6, staminaCost: 4, accuracy: 0.80, position: ['standing'] },
  { name: 'Body Kick', type: 'strike', baseDamage: 7, staminaCost: 4, accuracy: 0.75, position: ['standing'] },
  { name: 'Head Kick', type: 'strike', baseDamage: 12, staminaCost: 6, accuracy: 0.50, position: ['standing'] },
  { name: 'Superman Punch', type: 'strike', baseDamage: 9, staminaCost: 5, accuracy: 0.55, position: ['standing'] },
  { name: 'Spinning Backfist', type: 'strike', baseDamage: 11, staminaCost: 6, accuracy: 0.45, position: ['standing'] },
  { name: 'Flying Knee', type: 'strike', baseDamage: 13, staminaCost: 7, accuracy: 0.40, position: ['standing'] },
  { name: 'Elbow', type: 'elbow', baseDamage: 8, staminaCost: 3, accuracy: 0.70, position: ['clinch', 'ground_top'] },
  { name: 'Knee', type: 'knee', baseDamage: 9, staminaCost: 4, accuracy: 0.65, position: ['clinch'] },
];

export const GRAPPLING_TECHNIQUES: Technique[] = [
  { name: 'Single Leg', type: 'takedown', baseDamage: 0, staminaCost: 8, accuracy: 0.70, position: ['standing'] },
  { name: 'Double Leg', type: 'takedown', baseDamage: 0, staminaCost: 10, accuracy: 0.75, position: ['standing'] },
  { name: 'Body Lock', type: 'takedown', baseDamage: 0, staminaCost: 9, accuracy: 0.65, position: ['standing', 'clinch'] },
  { name: 'Suplex', type: 'takedown', baseDamage: 5, staminaCost: 12, accuracy: 0.50, position: ['clinch'] },
  { name: 'Trip', type: 'takedown', baseDamage: 0, staminaCost: 6, accuracy: 0.60, position: ['clinch'] },
  { name: 'Ankle Pick', type: 'takedown', baseDamage: 0, staminaCost: 7, accuracy: 0.55, position: ['standing'] },
];

export const SUBMISSION_TECHNIQUES: Technique[] = [
  { name: 'Rear Naked Choke', type: 'submission_attempt', baseDamage: 0, staminaCost: 15, accuracy: 0.35, position: ['ground_top'] },
  { name: 'Guillotine', type: 'submission_attempt', baseDamage: 0, staminaCost: 12, accuracy: 0.40, position: ['clinch', 'ground_top'] },
  { name: 'Armbar', type: 'submission_attempt', baseDamage: 0, staminaCost: 14, accuracy: 0.30, position: ['ground_top'] },
  { name: 'Triangle', type: 'submission_attempt', baseDamage: 0, staminaCost: 13, accuracy: 0.35, position: ['ground_bottom'] },
  { name: 'Kimura', type: 'submission_attempt', baseDamage: 0, staminaCost: 12, accuracy: 0.35, position: ['ground_top', 'ground_bottom'] },
  { name: 'Heel Hook', type: 'submission_attempt', baseDamage: 0, staminaCost: 14, accuracy: 0.25, position: ['ground_top'] },
  { name: 'Americana', type: 'submission_attempt', baseDamage: 0, staminaCost: 11, accuracy: 0.40, position: ['ground_top'] },
];

export const GROUND_TECHNIQUES: Technique[] = [
  { name: 'Ground & Pound', type: 'ground_pound', baseDamage: 5, staminaCost: 4, accuracy: 0.80, position: ['ground_top'] },
  { name: 'Elbow on Ground', type: 'elbow', baseDamage: 7, staminaCost: 3, accuracy: 0.75, position: ['ground_top'] },
  { name: 'Hammer Fist', type: 'ground_pound', baseDamage: 4, staminaCost: 2, accuracy: 0.85, position: ['ground_top'] },
  { name: 'Pass Guard', type: 'position_advance', baseDamage: 0, staminaCost: 6, accuracy: 0.60, position: ['ground_top'] },
  { name: 'Get Up', type: 'position_escape', baseDamage: 0, staminaCost: 8, accuracy: 0.50, position: ['ground_bottom'] },
  { name: 'Sweep', type: 'position_escape', baseDamage: 0, staminaCost: 10, accuracy: 0.45, position: ['ground_bottom'] },
  { name: 'Posture Up', type: 'position_escape', baseDamage: 0, staminaCost: 5, accuracy: 0.70, position: ['ground_bottom'] },
];

export interface RoundState {
  round: number;
  timeRemaining: number;   // 180 seconds for 3-min rounds
  isActive: boolean;
  actions: FightAction[];
}

export interface FightState {
  id: string;
  fighter1: FighterState;
  fighter2: FighterState;
  currentRound: number;
  rounds: RoundState[];
  winner?: string;
  method?: 'KO' | 'TKO' | 'SUB' | 'DEC' | 'DRAW';
  endRound?: number;
  endTime?: number;
  isComplete: boolean;
}

export const ROUND_DURATION = 180; // 3 minutes in seconds
export const TOTAL_ROUNDS = 3;     // Standard 3-round fight

export const DEFAULT_FIGHTER: FighterStats = {
  name: 'Unknown Fighter',
  striking: 50,
  punchSpeed: 50,
  kickPower: 50,
  headMovement: 50,
  wrestling: 50,
  takedownDefense: 50,
  submissions: 50,
  submissionDefense: 50,
  groundGame: 50,
  cardio: 50,
  chin: 50,
  recovery: 50,
  aggression: 0.5,
  fightIQ: 50,
  heart: 50,
};

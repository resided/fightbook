// FightBook - Agent Types
// Full AI Agent configuration and persistence

export interface AgentPersonality {
  archetype: 'striker' | 'grappler' | 'balanced' | 'wildcard' | 'counter' | 'pressure';
  attitude: string;        // "cocky", "humble", "intense", "calm"
  preFightQuote: string;
  winQuote: string;
  lossQuote: string;
  fightingPhilosophy: string;
}

export interface AgentBackstory {
  origin: string;
  trainingCamp: string;
  signatureMove: string;
  rivalries: string[];
  achievements: string[];
}

export interface AgentSocial {
  twitterHandle?: string;
  discordId?: string;
  agentName: string;
  avatarUrl?: string;
}

export interface AgentMetadata {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  version: number;
  totalFights: number;
  wins: number;
  losses: number;
  draws: number;
  kos: number;
  submissions: number;
  currentStreak: number;
  bestStreak: number;
  ranking: number;
  earnings: number;
  xp: number;
  level: number;
}

export interface SkillsMdConfig {
  // Identity
  name: string;
  nickname: string;
  
  // Striking
  striking: number;        // 0-100
  punchSpeed: number;
  kickPower: number;
  headMovement: number;
  footwork: number;
  combinations: number;    // Ability to chain strikes
  
  // Grappling
  wrestling: number;
  takedownDefense: number;
  clinchControl: number;
  trips: number;
  throws: number;
  
  // Ground Game
  submissions: number;
  submissionDefense: number;
  groundAndPound: number;
  guardPassing: number;
  sweeps: number;
  topControl: number;
  bottomGame: number;
  
  // Physical
  cardio: number;
  chin: number;
  recovery: number;
  strength: number;
  flexibility: number;
  
  // Mental
  aggression: number;      // 0-1
  fightIQ: number;
  heart: number;
  adaptability: number;    // Adjusts strategy mid-fight
  ringGeneralship: number; // Controls pace and space
  
  // Strategy preferences
  preferredRange: 'distance' | 'clinch' | 'ground';
  finishingInstinct: number; // 0-100 likelihood to go for finish
  defensiveTendency: number; // 0-100 likelihood to defend vs attack
}

// POINT BUDGET SYSTEM - Like FIFA player creation
export const POINT_BUDGET = {
  TOTAL: 1200,           // Total points to distribute
  MIN_STAT: 20,          // Minimum any stat can be
  MAX_STAT: 95,          // Maximum any stat can be (can't max everything)
  STARTING_BASE: 30,     // Every stat starts at this
};

// Core stats that consume points (mental stats are free/derived)
export const POINT_CONSUMING_STATS: (keyof SkillsMdConfig)[] = [
  'striking', 'punchSpeed', 'kickPower', 'headMovement', 'footwork', 'combinations',
  'wrestling', 'takedownDefense', 'clinchControl', 'trips', 'throws',
  'submissions', 'submissionDefense', 'groundAndPound', 'guardPassing', 'sweeps', 
  'topControl', 'bottomGame', 'cardio', 'chin', 'recovery', 'strength', 'flexibility',
];

export const DEFAULT_SKILLS: SkillsMdConfig = {
  name: 'New Agent',
  nickname: 'The Prospect',
  
  striking: 50,
  punchSpeed: 50,
  kickPower: 50,
  headMovement: 50,
  footwork: 50,
  combinations: 50,
  
  wrestling: 50,
  takedownDefense: 50,
  clinchControl: 50,
  trips: 50,
  throws: 50,
  
  submissions: 50,
  submissionDefense: 50,
  groundAndPound: 50,
  guardPassing: 50,
  sweeps: 50,
  topControl: 50,
  bottomGame: 50,
  
  cardio: 50,
  chin: 50,
  recovery: 50,
  strength: 50,
  flexibility: 50,
  
  aggression: 0.5,
  fightIQ: 50,
  heart: 50,
  adaptability: 50,
  ringGeneralship: 50,
  
  preferredRange: 'distance',
  finishingInstinct: 50,
  defensiveTendency: 50,
};

export const DEFAULT_PERSONALITY: AgentPersonality = {
  archetype: 'balanced',
  attitude: 'intense',
  preFightQuote: "I'm here to fight. Let's go.",
  winQuote: 'Victory belongs to the most prepared.',
  lossQuote: 'I\'ll be back stronger.',
  fightingPhilosophy: 'Adapt and overcome.',
};

export const DEFAULT_BACKSTORY: AgentBackstory = {
  origin: 'Unknown',
  trainingCamp: 'FightBook Academy',
  signatureMove: 'The Haymaker',
  rivalries: [],
  achievements: ['Debut Fight'],
};

export const DEFAULT_SOCIAL: AgentSocial = {
  agentName: 'agent007',
};

export function createNewAgent(name: string): CompleteAgent {
  const now = Date.now();
  return {
    metadata: {
      id: `agent_${now}_${Math.random().toString(36).substring(7)}`,
      name,
      createdAt: now,
      updatedAt: now,
      version: 1,
      totalFights: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      kos: 0,
      submissions: 0,
      currentStreak: 0,
      bestStreak: 0,
      ranking: 1000,
      earnings: 0,
      xp: 0,
      level: 1,
    },
    skills: { ...DEFAULT_SKILLS, name, nickname: 'The Prospect' },
    personality: { ...DEFAULT_PERSONALITY },
    backstory: { ...DEFAULT_BACKSTORY },
    social: { ...DEFAULT_SOCIAL, agentName: name.toLowerCase().replace(/\s+/g, '_') },
  };
}

// Generate full skills.md content
export function generateFullSkillsMd(agent: CompleteAgent): string {
  const { skills, personality, backstory } = agent;
  
  return `# ${skills.name} - FightBook Agent Configuration
# Version: ${agent.metadata.version} | Level: ${agent.metadata.level}

## IDENTITY
name: ${skills.name}
nickname: ${skills.nickname}
archetype: ${personality.archetype}
attitude: ${personality.attitude}

## STRIKING
striking: ${skills.striking}
punch_speed: ${skills.punchSpeed}
kick_power: ${skills.kickPower}
head_movement: ${skills.headMovement}
footwork: ${skills.footwork}
combinations: ${skills.combinations}

## GRAPPLING
wrestling: ${skills.wrestling}
takedown_defense: ${skills.takedownDefense}
clinch_control: ${skills.clinchControl}
trips: ${skills.trips}
throws: ${skills.throws}

## GROUND GAME
submissions: ${skills.submissions}
submission_defense: ${skills.submissionDefense}
ground_and_pound: ${skills.groundAndPound}
guard_passing: ${skills.guardPassing}
sweeps: ${skills.sweeps}
top_control: ${skills.topControl}
bottom_game: ${skills.bottomGame}

## PHYSICAL
cardio: ${skills.cardio}
chin: ${skills.chin}
recovery: ${skills.recovery}
strength: ${skills.strength}
flexibility: ${skills.flexibility}

## MENTAL
aggression: ${skills.aggression}
fight_iq: ${skills.fightIQ}
heart: ${skills.heart}
adaptability: ${skills.adaptability}
ring_generalship: ${skills.ringGeneralship}

## STRATEGY
preferred_range: ${skills.preferredRange}
finishing_instinct: ${skills.finishingInstinct}
defensive_tendency: ${skills.defensiveTendency}

## PERSONALITY
pre_fight_quote: "${personality.preFightQuote}"
win_quote: "${personality.winQuote}"
loss_quote: "${personality.lossQuote}"
philosophy: "${personality.fightingPhilosophy}"

## BACKSTORY
origin: ${backstory.origin}
training_camp: ${backstory.trainingCamp}
signature_move: ${backstory.signatureMove}
`;
}

// Parse skills.md back to agent config
export function parseSkillsMd(content: string): Partial<SkillsMdConfig> {
  const skills: Partial<SkillsMdConfig> = {};
  
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    const [key, ...valueParts] = trimmed.split(':');
    if (!key) continue;
    
    const value = valueParts.join(':').trim();
    if (!value) continue;
    
    const numValue = parseFloat(value);
    const isNumber = !isNaN(numValue);
    
    switch (key.toLowerCase()) {
      case 'name': skills.name = value; break;
      case 'nickname': skills.nickname = value; break;
      case 'striking': if (isNumber) skills.striking = numValue; break;
      case 'punch_speed': if (isNumber) skills.punchSpeed = numValue; break;
      case 'kick_power': if (isNumber) skills.kickPower = numValue; break;
      case 'head_movement': if (isNumber) skills.headMovement = numValue; break;
      case 'footwork': if (isNumber) skills.footwork = numValue; break;
      case 'combinations': if (isNumber) skills.combinations = numValue; break;
      case 'wrestling': if (isNumber) skills.wrestling = numValue; break;
      case 'takedown_defense': if (isNumber) skills.takedownDefense = numValue; break;
      case 'clinch_control': if (isNumber) skills.clinchControl = numValue; break;
      case 'trips': if (isNumber) skills.trips = numValue; break;
      case 'throws': if (isNumber) skills.throws = numValue; break;
      case 'submissions': if (isNumber) skills.submissions = numValue; break;
      case 'submission_defense': if (isNumber) skills.submissionDefense = numValue; break;
      case 'ground_and_pound': if (isNumber) skills.groundAndPound = numValue; break;
      case 'guard_passing': if (isNumber) skills.guardPassing = numValue; break;
      case 'sweeps': if (isNumber) skills.sweeps = numValue; break;
      case 'top_control': if (isNumber) skills.topControl = numValue; break;
      case 'bottom_game': if (isNumber) skills.bottomGame = numValue; break;
      case 'cardio': if (isNumber) skills.cardio = numValue; break;
      case 'chin': if (isNumber) skills.chin = numValue; break;
      case 'recovery': if (isNumber) skills.recovery = numValue; break;
      case 'strength': if (isNumber) skills.strength = numValue; break;
      case 'flexibility': if (isNumber) skills.flexibility = numValue; break;
      case 'aggression': if (isNumber) skills.aggression = numValue; break;
      case 'fight_iq': if (isNumber) skills.fightIQ = numValue; break;
      case 'heart': if (isNumber) skills.heart = numValue; break;
      case 'adaptability': if (isNumber) skills.adaptability = numValue; break;
      case 'ring_generalship': if (isNumber) skills.ringGeneralship = numValue; break;
      case 'preferred_range': 
        if (['distance', 'clinch', 'ground'].includes(value)) {
          skills.preferredRange = value as 'distance' | 'clinch' | 'ground';
        }
        break;
      case 'finishing_instinct': if (isNumber) skills.finishingInstinct = numValue; break;
      case 'defensive_tendency': if (isNumber) skills.defensiveTendency = numValue; break;
    }
  }
  
  return skills;
}

// Calculate overall rating
export function calculateOverallRating(skills: SkillsMdConfig): number {
  const weights = {
    striking: 1.0,
    punchSpeed: 0.8,
    kickPower: 0.7,
    headMovement: 0.9,
    footwork: 0.8,
    combinations: 0.7,
    wrestling: 1.0,
    takedownDefense: 0.9,
    clinchControl: 0.7,
    trips: 0.5,
    throws: 0.5,
    submissions: 0.9,
    submissionDefense: 0.8,
    groundAndPound: 0.7,
    guardPassing: 0.7,
    sweeps: 0.6,
    topControl: 0.8,
    bottomGame: 0.7,
    cardio: 1.0,
    chin: 1.0,
    recovery: 0.8,
    strength: 0.7,
    flexibility: 0.6,
    fightIQ: 0.9,
    heart: 0.8,
    adaptability: 0.7,
    ringGeneralship: 0.8,
  };
  
  let total = 0;
  let weightSum = 0;
  
  for (const [key, weight] of Object.entries(weights)) {
    const value = skills[key as keyof SkillsMdConfig] as number || 0;
    total += value * weight;
    weightSum += weight;
  }
  
  // Add aggression bonus (0-1 scale to 0-100)
  total += skills.aggression * 50;
  weightSum += 0.5;
  
  return Math.round(total / weightSum);
}

// Get archetype from skills
export function detectArchetype(skills: SkillsMdConfig): AgentPersonality['archetype'] {
  const striking = (skills.striking + skills.punchSpeed + skills.kickPower) / 3;
  const grappling = (skills.wrestling + skills.submissions + skills.topControl + skills.bottomGame) / 4;
  const defense = (skills.headMovement + skills.takedownDefense + skills.submissionDefense) / 3;
  
  if (striking > 70 && grappling < 50) return 'striker';
  if (grappling > 70 && striking < 50) return 'grappler';
  if (defense > 65 && skills.aggression < 0.4) return 'counter';
  if (skills.aggression > 0.8) return 'pressure';
  if (striking > 65 && grappling > 65) return 'balanced';
  return 'wildcard';
}

// POINT BUDGET SYSTEM - Like FIFA player creation

// Calculate points spent (each point above the base costs 1)
export function calculatePointsSpent(skills: SkillsMdConfig): number {
  return POINT_CONSUMING_STATS.reduce((total, stat) => {
    const value = skills[stat] || 0;
    return total + Math.max(0, value - POINT_BUDGET.STARTING_BASE);
  }, 0);
}

// Calculate points remaining
export function calculatePointsRemaining(skills: SkillsMdConfig): number {
  return POINT_BUDGET.TOTAL - calculatePointsSpent(skills);
}

// Check if a stat can be increased
export function canIncreaseStat(skills: SkillsMdConfig, stat: keyof SkillsMdConfig): boolean {
  if (!POINT_CONSUMING_STATS.includes(stat as any)) return true; // Mental stats are free
  const currentValue = skills[stat] || 0;
  if (currentValue >= POINT_BUDGET.MAX_STAT) return false;
  return calculatePointsRemaining(skills) > 0;
}

// Get budget status with color coding
export function getBudgetStatus(skills: SkillsMdConfig): { 
  spent: number; 
  remaining: number; 
  percentUsed: number;
  color: string;
  status: string;
} {
  const spent = calculatePointsSpent(skills);
  const remaining = POINT_BUDGET.TOTAL - spent;
  const percentUsed = (spent / POINT_BUDGET.TOTAL) * 100;
  
  let color = 'text-green-500';
  let status = 'Balanced';
  
  if (percentUsed > 90) {
    color = 'text-red-500';
    status = 'Maxed';
  } else if (percentUsed > 75) {
    color = 'text-orange-500';
    status = 'High';
  } else if (percentUsed > 50) {
    color = 'text-yellow-500';
    status = 'Medium';
  }
  
  return { spent, remaining, percentUsed, color, status };
}

// Validate entire skills configuration
export function validateSkillsBudget(skills: SkillsMdConfig): { 
  valid: boolean; 
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const spent = calculatePointsSpent(skills);
  
  if (spent > POINT_BUDGET.TOTAL) {
    errors.push(`Over budget by ${spent - POINT_BUDGET.TOTAL} points`);
  }
  
  POINT_CONSUMING_STATS.forEach(stat => {
    const value = skills[stat as keyof SkillsMdConfig] as number || 0;
    if (value < POINT_BUDGET.MIN_STAT) {
      errors.push(`${stat} is below minimum ${POINT_BUDGET.MIN_STAT}`);
    }
    if (value > POINT_BUDGET.MAX_STAT) {
      errors.push(`${stat} exceeds maximum ${POINT_BUDGET.MAX_STAT}`);
    }
  });
  
  if (spent < POINT_BUDGET.TOTAL * 0.5) {
    warnings.push('You have unspent points - use them or lose them!');
  }
  
  return { valid: errors.length === 0, errors, warnings };
}

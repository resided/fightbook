// FightBook - MMA/MMA Combat Engine
// Real-time fight simulation with authentic MMA techniques

import {
  FighterStats,
  FighterState,
  FightAction,
  FightState,
  RoundState,
  ActionType,
  Technique,
  STRIKING_TECHNIQUES,
  GRAPPLING_TECHNIQUES,
  SUBMISSION_TECHNIQUES,
  GROUND_TECHNIQUES,
  ROUND_DURATION,
  TOTAL_ROUNDS,
  DEFAULT_FIGHTER,
} from '@/types/fight';

export class FightEngine {
  private fight: FightState;
  private intervalId: NodeJS.Timeout | null = null;
  private onAction: ((action: FightAction) => void) | null = null;
  private onRoundEnd: ((round: RoundState) => void) | null = null;
  private onFightEnd: ((fight: FightState) => void) | null = null;
  private tickRate: number = 1000; // 1 second per tick for real-time feel

  constructor(
    fighter1Stats: FighterStats,
    fighter2Stats: FighterStats,
    callbacks?: {
      onAction?: (action: FightAction) => void;
      onRoundEnd?: (round: RoundState) => void;
      onFightEnd?: (fight: FightState) => void;
    }
  ) {
    this.fight = this.initializeFight(fighter1Stats, fighter2Stats);
    this.onAction = callbacks?.onAction || null;
    this.onRoundEnd = callbacks?.onRoundEnd || null;
    this.onFightEnd = callbacks?.onFightEnd || null;
  }

  private initializeFight(f1: FighterStats, f2: FighterStats): FightState {
    const fighter1: FighterState = {
      ...f1,
      id: 'fighter1',
      currentHealth: 100,
      currentStamina: 100,
      position: 'standing',
      hasMount: false,
      hasBack: false,
      isGrounded: false,
      cuts: 0,
      knockdowns: 0,
      takedownsLanded: 0,
      takedownsAttempted: 0,
      significantStrikes: 0,
      totalStrikes: 0,
    };

    const fighter2: FighterState = {
      ...f2,
      id: 'fighter2',
      currentHealth: 100,
      currentStamina: 100,
      position: 'standing',
      hasMount: false,
      hasBack: false,
      isGrounded: false,
      cuts: 0,
      knockdowns: 0,
      takedownsLanded: 0,
      takedownsAttempted: 0,
      significantStrikes: 0,
      totalStrikes: 0,
    };

    return {
      id: Math.random().toString(36).substring(7),
      fighter1,
      fighter2,
      currentRound: 1,
      rounds: [this.createRound(1)],
      isComplete: false,
    };
  }

  private createRound(roundNum: number): RoundState {
    return {
      round: roundNum,
      timeRemaining: ROUND_DURATION,
      isActive: false,
      actions: [],
    };
  }

  // Start the fight
  start(): void {
    if (this.intervalId) return;
    this.fight.rounds[this.fight.currentRound - 1].isActive = true;
    this.intervalId = setInterval(() => this.tick(), this.tickRate);
  }

  // Pause the fight
  pause(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Resume the fight
  resume(): void {
    if (!this.intervalId && !this.fight.isComplete) {
      this.intervalId = setInterval(() => this.tick(), this.tickRate);
    }
  }

  // Stop the fight completely
  stop(): void {
    this.pause();
    this.fight.isComplete = true;
  }

  // Get current fight state
  getState(): FightState {
    return { ...this.fight };
  }

  // Main game loop tick - runs every second
  private tick(): void {
    const currentRound = this.fight.rounds[this.fight.currentRound - 1];
    
    if (currentRound.timeRemaining <= 0) {
      this.endRound();
      return;
    }

    // Decrement time
    currentRound.timeRemaining--;

    // Recover stamina slightly each second (passive recovery)
    this.recoverStamina();

    // Determine if action happens this tick (not every second has action)
    const actionChance = 0.7 + (this.fight.fighter1.aggression + this.fight.fighter2.aggression) / 2;
    if (Math.random() < actionChance) {
      // Pick which fighter acts (weighted by aggression)
      const f1Aggression = this.fight.fighter1.aggression;
      const f2Aggression = this.fight.fighter2.aggression;
      const total = f1Aggression + f2Aggression || 1;
      
      const actingFighter = Math.random() < (f1Aggression / total) ? 'fighter1' : 'fighter2';
      const action = this.generateAction(actingFighter);
      
      if (action) {
        currentRound.actions.push(action);
        this.applyAction(action);
        this.onAction?.(action);

        // Check for fight ending conditions
        if (this.checkFightEnd()) {
          this.endFight();
        }
      }
    }

    // Check for exhaustion TKO
    if (this.checkExhaustion()) {
      this.endFight();
    }
  }

  private recoverStamina(): void {
    const recovery1 = (this.fight.fighter1.recovery / 100) * 0.3;
    const recovery2 = (this.fight.fighter2.recovery / 100) * 0.3;
    
    this.fight.fighter1.currentStamina = Math.min(100, this.fight.fighter1.currentStamina + recovery1);
    this.fight.fighter2.currentStamina = Math.min(100, this.fight.fighter2.currentStamina + recovery2);
  }

  private generateAction(actingFighterId: string): FightAction | null {
    const actor = actingFighterId === 'fighter1' ? this.fight.fighter1 : this.fight.fighter2;
    const target = actingFighterId === 'fighter1' ? this.fight.fighter2 : this.fight.fighter1;
    
    // AI decision making based on fighter stats and situation
    const technique = this.selectTechnique(actor, target);
    if (!technique) return null;

    // Calculate success probability
    const success = this.calculateSuccess(actor, target, technique);
    
    // Calculate damage and effects
    const { damage, staminaCost, description, impact } = this.calculateOutcome(
      actor, target, technique, success
    );

    return {
      timestamp: Date.now(),
      round: this.fight.currentRound,
      timeRemaining: this.fight.rounds[this.fight.currentRound - 1].timeRemaining,
      actor: actor.name,
      target: target.name,
      type: technique.type,
      technique,
      success,
      damage,
      staminaCost,
      description,
      impact,
    };
  }

  private selectTechnique(actor: FighterState, target: FighterState): Technique | null {
    let availableTechs: Technique[] = [];

    // Filter techniques by position
    switch (actor.position) {
      case 'standing':
        availableTechs = [
          ...STRIKING_TECHNIQUES.filter(t => t.position.includes('standing')),
          ...GRAPPLING_TECHNIQUES.filter(t => t.position.includes('standing')),
        ];
        break;
      case 'clinch':
        availableTechs = [
          ...STRIKING_TECHNIQUES.filter(t => t.position.includes('clinch')),
          ...GRAPPLING_TECHNIQUES.filter(t => t.position.includes('clinch')),
          { name: 'Break Clinch', type: 'break_clinch', baseDamage: 0, staminaCost: 5, accuracy: 0.80, position: ['clinch'] },
        ];
        break;
      case 'ground_top':
        availableTechs = [
          ...GROUND_TECHNIQUES.filter(t => t.position.includes('ground_top')),
          ...SUBMISSION_TECHNIQUES.filter(t => t.position.includes('ground_top')),
        ];
        break;
      case 'ground_bottom':
        availableTechs = [
          ...GROUND_TECHNIQUES.filter(t => t.position.includes('ground_bottom')),
          ...SUBMISSION_TECHNIQUES.filter(t => t.position.includes('ground_bottom')),
        ];
        break;
    }

    if (availableTechs.length === 0) return null;

    // AI picks technique based on stats and fight IQ
    const weightedTechs = availableTechs.map(tech => {
      let weight = 1;
      
      // Weight by fighter strengths
      if (tech.type === 'strike') weight *= (actor.striking / 50);
      if (tech.type === 'takedown') weight *= (actor.wrestling / 50);
      if (tech.type === 'submission_attempt') weight *= (actor.submissions / 50);
      if (tech.type === 'ground_pound') weight *= (actor.groundGame / 50);
      
      // Weight by fight IQ (smarter choices)
      if (actor.fightIQ > 70) weight *= (tech.accuracy * 2);
      
      // Contextual decisions
      if (target.currentHealth < 30 && tech.type === 'strike') weight *= 1.5; // Go for finish
      if (actor.currentStamina < 30 && tech.staminaCost > 8) weight *= 0.3; // Conserve energy
      if (target.position === 'ground_bottom' && tech.type === 'ground_pound') weight *= 1.3;
      
      return { tech, weight };
    });

    const totalWeight = weightedTechs.reduce((sum, wt) => sum + wt.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const wt of weightedTechs) {
      random -= wt.weight;
      if (random <= 0) return wt.tech;
    }

    return weightedTechs[0]?.tech || null;
  }

  private calculateSuccess(actor: FighterState, target: FighterState, tech: Technique): boolean {
    let accuracy = tech.accuracy;

    // Modify accuracy based on stats
    if (tech.type === 'strike') {
      accuracy *= (actor.striking / 50);
      accuracy *= (1 - (target.headMovement / 200)); // Head movement reduces accuracy
    }
    if (tech.type === 'takedown') {
      accuracy *= (actor.wrestling / 50);
      accuracy *= (1 - (target.takedownDefense / 150)); // TDD reduces accuracy
    }
    if (tech.type === 'submission_attempt') {
      accuracy *= (actor.submissions / 50);
      accuracy *= (1 - (target.submissionDefense / 150));
    }

    // Stamina affects accuracy
    accuracy *= (0.5 + (actor.currentStamina / 200));

    // Chin/target health affects strike landing
    if (tech.type === 'strike') {
      accuracy *= (1 + (100 - target.currentHealth) / 300); // Damaged fighters easier to hit
    }

    return Math.random() < Math.min(0.95, accuracy);
  }

  private calculateOutcome(
    actor: FighterState,
    target: FighterState,
    tech: Technique,
    success: boolean
  ): { damage: number; staminaCost: number; description: string; impact?: 'light' | 'moderate' | 'heavy' | 'devastating' } {
    
    if (!success) {
      const misses = [
        `${actor.name} throws a ${tech.name} but misses!`,
        `${actor.name} attempts a ${tech.name} but ${target.name} defends well!`,
        `${actor.name} goes for a ${tech.name} - no connection!`,
        `${target.name} slips the ${tech.name} from ${actor.name}!`,
      ];
      return {
        damage: 0,
        staminaCost: tech.staminaCost * 0.5,
        description: misses[Math.floor(Math.random() * misses.length)],
      };
    }

    let damage = tech.baseDamage;
    let impact: 'light' | 'moderate' | 'heavy' | 'devastating' = 'light';

    // Calculate damage multipliers
    if (tech.type === 'strike') {
      damage *= (actor.striking / 50);
      damage *= (0.8 + (actor.punchSpeed / 250)); // Speed adds damage
      
      // Critical hit chance
      if (Math.random() < 0.1) {
        damage *= 1.5;
        impact = 'devastating';
      }
    }

    if (tech.type === 'ground_pound') {
      damage *= (actor.groundGame / 50);
      damage *= (0.9 + (actor.striking / 500));
    }

    // Target's chin reduces damage
    if (tech.type === 'strike' || tech.type === 'ground_pound') {
      const chinReduction = target.chin / 100;
      damage *= (1.1 - chinReduction);
      
      // Determine impact level
      if (damage > 15) impact = 'devastating';
      else if (damage > 10) impact = 'heavy';
      else if (damage > 5) impact = 'moderate';
    }

    // Random variance
    damage *= (0.85 + Math.random() * 0.3);

    // Generate description
    const descriptions = this.generateDescription(actor, target, tech, damage, impact);

    return {
      damage: Math.round(damage),
      staminaCost: tech.staminaCost,
      description,
      impact,
    };
  }

  private generateDescription(
    actor: FighterState,
    target: FighterState,
    tech: Technique,
    damage: number,
    impact?: string
  ): string {
    const adjectives = impact === 'devastating' ? ['CRUSHING', 'BRUTAL', 'DEVASTATING', 'MASSIVE'] :
                       impact === 'heavy' ? ['SOLID', 'HARD', 'CLEAN', 'STIFF'] :
                       impact === 'moderate' ? ['nice', 'clean', 'good', 'sharp'] :
                       ['light', 'partial', 'glancing'];
    
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];

    if (tech.type === 'submission_attempt') {
      return `${actor.name} locks in a ${tech.name}! ${target.name} is in trouble!`;
    }

    if (tech.type === 'takedown') {
      return `${actor.name} scores with a ${tech.name}! Fight goes to the ground!`;
    }

    if (damage > 12) {
      return `${adj} ${tech.name} by ${actor.name}! ${target.name} is hurt!`;
    } else if (damage > 6) {
      return `${actor.name} lands a ${adj} ${tech.name}!`;
    } else {
      return `${actor.name} connects with a ${tech.name}.`;
    }
  }

  private applyAction(action: FightAction): void {
    const actor = action.actor === this.fight.fighter1.name ? this.fight.fighter1 : this.fight.fighter2;
    const target = action.target === this.fight.fighter1.name ? this.fight.fighter1 : this.fight.fighter2;

    // Apply stamina cost
    actor.currentStamina = Math.max(0, actor.currentStamina - action.staminaCost);

    // Apply damage
    if (action.damage > 0) {
      target.currentHealth = Math.max(0, target.currentHealth - action.damage);
      
      // Track significant strikes
      if (action.damage >= 5) {
        if (actor === this.fight.fighter1) this.fight.fighter1.significantStrikes++;
        else this.fight.fighter2.significantStrikes++;
      }
      if (actor === this.fight.fighter1) this.fight.fighter1.totalStrikes++;
      else this.fight.fighter2.totalStrikes++;
    }

    // Handle position changes
    if (action.type === 'takedown' && action.success) {
      actor.position = 'ground_top';
      target.position = 'ground_bottom';
      actor.takedownsLanded++;
      actor.isGrounded = true;
      target.isGrounded = true;
    }

    if (action.type === 'break_clinch' && action.success) {
      actor.position = 'standing';
      target.position = 'standing';
    }

    // Handle knockdowns
    if ((action.type === 'strike' || action.type === 'ground_pound') && action.impact === 'devastating' && action.damage > 10) {
      if (Math.random() < 0.3) {
        target.knockdowns++;
        if (target.position === 'standing') {
          target.position = 'ground_bottom';
          actor.position = 'ground_top';
        }
      }
    }
  }

  private checkFightEnd(): boolean {
    const f1 = this.fight.fighter1;
    const f2 = this.fight.fighter2;

    // KO/TKO check
    if (f1.currentHealth <= 0) {
      this.fight.winner = f2.name;
      this.fight.method = f2.position === 'ground_top' || f2.position === 'ground_bottom' ? 'TKO' : 'KO';
      return true;
    }
    if (f2.currentHealth <= 0) {
      this.fight.winner = f1.name;
      this.fight.method = f1.position === 'ground_top' || f1.position === 'ground_bottom' ? 'TKO' : 'KO';
      return true;
    }

    // Cut stoppage
    if (f1.cuts >= 3) {
      this.fight.winner = f2.name;
      this.fight.method = 'TKO';
      return true;
    }
    if (f2.cuts >= 3) {
      this.fight.winner = f1.name;
      this.fight.method = 'TKO';
      return true;
    }

    return false;
  }

  private checkExhaustion(): boolean {
    // Both fighters too tired to continue
    if (this.fight.fighter1.currentStamina < 5 && this.fight.fighter2.currentStamina < 5) {
      // Pick winner by damage dealt
      const f1Damage = 100 - this.fight.fighter2.currentHealth;
      const f2Damage = 100 - this.fight.fighter1.currentHealth;
      
      if (f1Damage > f2Damage) {
        this.fight.winner = this.fight.fighter1.name;
      } else if (f2Damage > f1Damage) {
        this.fight.winner = this.fight.fighter2.name;
      } else {
        this.fight.winner = undefined;
        this.fight.method = 'DRAW';
        return true;
      }
      this.fight.method = 'TKO';
      return true;
    }
    return false;
  }

  private endRound(): void {
    const currentRound = this.fight.rounds[this.fight.currentRound - 1];
    currentRound.isActive = false;
    
    // Recovery between rounds
    this.fight.fighter1.currentHealth = Math.min(100, this.fight.fighter1.currentHealth + this.fight.fighter1.recovery * 0.5);
    this.fight.fighter2.currentHealth = Math.min(100, this.fight.fighter2.currentHealth + this.fight.fighter2.recovery * 0.5);
    this.fight.fighter1.currentStamina = 100;
    this.fight.fighter2.currentStamina = 100;
    
    // Reset positions
    this.fight.fighter1.position = 'standing';
    this.fight.fighter2.position = 'standing';

    this.onRoundEnd?.(currentRound);

    if (this.fight.currentRound >= TOTAL_ROUNDS) {
      this.endFightByDecision();
    } else {
      this.fight.currentRound++;
      this.fight.rounds.push(this.createRound(this.fight.currentRound));
      this.fight.rounds[this.fight.currentRound - 1].isActive = true;
    }
  }

  private endFightByDecision(): void {
    // Score fight based on damage, takedowns, and significant strikes
    const f1Score = (100 - this.fight.fighter2.currentHealth) + 
                    (this.fight.fighter1.takedownsLanded * 10) + 
                    (this.fight.fighter1.significantStrikes * 2);
    
    const f2Score = (100 - this.fight.fighter1.currentHealth) + 
                    (this.fight.fighter2.takedownsLanded * 10) + 
                    (this.fight.fighter2.significantStrikes * 2);

    if (f1Score > f2Score) {
      this.fight.winner = this.fight.fighter1.name;
    } else if (f2Score > f1Score) {
      this.fight.winner = this.fight.fighter2.name;
    } else {
      this.fight.winner = undefined;
    }

    this.fight.method = this.fight.winner ? 'DEC' : 'DRAW';
    this.endFight();
  }

  private endFight(): void {
    this.pause();
    this.fight.isComplete = true;
    this.fight.endRound = this.fight.currentRound;
    this.fight.endTime = this.fight.rounds[this.fight.currentRound - 1]?.timeRemaining;
    this.onFightEnd?.(this.fight);
  }

  // Parse skills.md content into FighterStats
  static parseSkillsMd(content: string): FighterStats {
    const stats = { ...DEFAULT_FIGHTER };
    
    const lines = content.split('\n');
    for (const line of lines) {
      const [key, value] = line.split(':').map(s => s.trim());
      if (!key || !value) continue;
      
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        // String values
        if (key === 'name') stats.name = value;
        if (key === 'nickname') stats.nickname = value;
        continue;
      }

      // Map skills.md keys to stats
      switch (key.toLowerCase()) {
        case 'striking':
        case 'boxing':
          stats.striking = numValue;
          break;
        case 'punch_speed':
        case 'handspeed':
          stats.punchSpeed = numValue;
          break;
        case 'kicks':
        case 'kick_power':
          stats.kickPower = numValue;
          break;
        case 'head_movement':
        case 'defense':
          stats.headMovement = numValue;
          break;
        case 'wrestling':
        case 'takedowns':
          stats.wrestling = numValue;
          break;
        case 'takedown_defense':
        case 'tdd':
          stats.takedownDefense = numValue;
          break;
        case 'bjj':
        case 'submissions':
          stats.submissions = numValue;
          break;
        case 'submission_defense':
          stats.submissionDefense = numValue;
          break;
        case 'ground_game':
        case 'grappling':
          stats.groundGame = numValue;
          break;
        case 'cardio':
        case 'stamina':
          stats.cardio = numValue;
          break;
        case 'chin':
        case 'durability':
          stats.chin = numValue;
          break;
        case 'recovery':
          stats.recovery = numValue;
          break;
        case 'iq':
        case 'fight_iq':
          stats.fightIQ = numValue;
          break;
        case 'heart':
          stats.heart = numValue;
          break;
        case 'aggression':
          stats.aggression = numValue;
          break;
      }
    }

    return stats;
  }
}

export default FightEngine;

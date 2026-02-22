export interface Fighter {
  id: string;
  name: string;
  stats: {
    striking: number;
    punchSpeed: number;
    punchPower: number;
    wrestling: number;
    submissions: number;
    cardio: number;
    chin: number;
    headMovement: number;
    takedownDefense: number;
  };
}

export interface FightState {
  winner: string | null;
  method: string | null;
  round: number;
  log: string[];
  events: FightEvent[];
}

export interface FightEvent {
  time: number;
  type: 'strike' | 'takedown' | 'submission' | 'finish';
  actor: string;
  target: string;
  description: string;
  damage?: number;
}

class FighterState {
  name: string;
  health = 100;
  headHealth = 100;
  bodyHealth = 100;
  stamina = 100;
  stats: Fighter['stats'];
  knockedDown = false;
  submissionAttempts = 0;
  
  constructor(fighter: Fighter) {
    this.name = fighter.name;
    this.stats = fighter.stats;
  }
}

export function runFight(f1: Fighter, f2: Fighter): FightState {
  const a = new FighterState(f1);
  const b = new FighterState(f2);
  const log: string[] = [];
  const events: FightEvent[] = [];
  let winner: string | null = null;
  let method: string | null = null;
  let finishRound = 3;
  
  function addEvent(type: FightEvent['type'], actor: string, target: string, desc: string, damage?: number) {
    events.push({ time: log.length, type, actor, target, description: desc, damage });
    log.push(desc);
  }
  
  // Opening
  log.push(`[Round 1]`);
  log.push(`${a.name} enters the cage`);
  log.push(`${b.name} enters the cage`);
  log.push(`The referee gives final instructions`);
  log.push(`Fight!`);
  log.push('');
  
  // Run rounds
  for (let round = 1; round <= 3 && !winner; round++) {
    finishRound = round;
    if (round > 1) {
      log.push('');
      log.push(`[Round ${round}]`);
      a.stamina = Math.min(100, a.stamina + 20);
      b.stamina = Math.min(100, b.stamina + 20);
    }
    
    // 6-10 exchanges per round
    const exchanges = 6 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < exchanges && !winner; i++) {
      const [attacker, defender] = Math.random() > 0.5 ? [a, b] : [b, a];
      
      // Decide action based on stats
      const tdChance = attacker.stats.wrestling / 200;
      const action = Math.random() < tdChance ? 'takedown' : 'strike';
      
      if (action === 'strike') {
        // Strike exchange
        const accuracy = (attacker.stats.striking + attacker.stats.punchSpeed) / 2;
        const defense = defender.stats.headMovement;
        const lands = Math.random() * 100 < (accuracy - defense * 0.3);
        
        if (lands) {
          const power = attacker.stats.punchPower;
          const damage = (power / 5) * (0.8 + Math.random() * 0.4);
          const isSignificant = damage > 15;
          const isCritical = Math.random() < 0.15;
          
          let actualDamage = damage;
          if (isCritical) {
            actualDamage *= 1.5;
            addEvent('strike', attacker.name, defender.name, 
              `[CRITICAL] ${attacker.name} lands a massive shot! ${defender.name} is hurt!`, actualDamage);
          } else if (isSignificant) {
            addEvent('strike', attacker.name, defender.name,
              `${attacker.name} lands a solid strike on ${defender.name}`, actualDamage);
          } else {
            addEvent('strike', attacker.name, defender.name,
              `${attacker.name} connects`, actualDamage);
          }
          
          defender.headHealth -= actualDamage * 0.7;
          defender.health -= actualDamage * 0.4;
          attacker.stamina -= 3;
          
          // Check for finish
          if (defender.headHealth < 20 && Math.random() < 0.4) {
            addEvent('finish', attacker.name, defender.name,
              `${attacker.name} swarms with punches! The referee stops it!`, 0);
            winner = attacker.name;
            method = defender.headHealth <= 0 ? 'KO' : 'TKO';
            break;
          }
        } else {
          addEvent('strike', attacker.name, defender.name,
            `${attacker.name} misses`, 0);
        }
      } else {
        // Takedown attempt
        const success = Math.random() * 100 < (attacker.stats.wrestling - defender.stats.takedownDefense * 0.5);
        if (success) {
          addEvent('takedown', attacker.name, defender.name,
            `${attacker.name} secures a takedown`, 0);
          
          // Ground action
          if (Math.random() < 0.3) {
            // Submission attempt
            const subSuccess = Math.random() * 100 < (attacker.stats.submissions - defender.stats.wrestling * 0.3);
            if (subSuccess) {
              const subs = ['guillotine', 'rear naked choke', 'armbar', 'triangle'];
              const sub = subs[Math.floor(Math.random() * subs.length)];
              addEvent('submission', attacker.name, defender.name,
                `${attacker.name} locks in a ${sub.toUpperCase()}! ${defender.name} taps!`, 0);
              winner = attacker.name;
              method = 'SUB';
              break;
            } else {
              addEvent('submission', attacker.name, defender.name,
                `${attacker.name} attempts a submission but ${defender.name} escapes`, 0);
            }
          } else {
            // Ground and pound
            const damage = 10 + Math.random() * 10;
            defender.headHealth -= damage;
            addEvent('strike', attacker.name, defender.name,
              `${attacker.name} lands ground and pound`, damage);
          }
        } else {
          addEvent('takedown', attacker.name, defender.name,
            `${attacker.name} shoots but ${defender.name} defends`, 0);
        }
      }
      
      // Stamina decay
      a.stamina -= 1;
      b.stamina -= 1;
    }
    
    if (!winner) {
      log.push(`End of Round ${round}`);
    }
  }
  
  // Decision if no finish
  if (!winner) {
    log.push('');
    log.push('[Decision]');
    const scoreA = (a.health + a.stamina) / 2 + Math.random() * 10;
    const scoreB = (b.health + b.stamina) / 2 + Math.random() * 10;
    
    if (Math.abs(scoreA - scoreB) < 5) {
      log.push('Split Decision... DRAW!');
      winner = 'DRAW';
      method = 'DEC';
    } else {
      winner = scoreA > scoreB ? a.name : b.name;
      method = 'DEC';
      log.push(`${winner} wins by decision!`);
    }
  }
  
  return { winner, method, round: finishRound, log, events };
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Fight engine inlined to avoid relative-import resolution issues in Vercel ESM runtime
interface Fighter {
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

interface FightState {
  winner: string | null;
  method: string | null;
  round: number;
  log: string[];
}

class FighterState {
  name: string;
  health = 100;
  headHealth = 100;
  stamina = 100;
  stats: Fighter['stats'];
  constructor(f: Fighter) { this.name = f.name; this.stats = f.stats; }
}

function engineRunFight(f1: Fighter, f2: Fighter): FightState {
  const a = new FighterState(f1);
  const b = new FighterState(f2);
  const log: string[] = [];
  let winner: string | null = null;
  let method: string | null = null;
  let finishRound = 3;

  log.push(`[Round 1]`);
  log.push(`${a.name} enters the cage`);
  log.push(`${b.name} enters the cage`);
  log.push(`The referee gives final instructions`);
  log.push(`Fight!`);
  log.push('');

  for (let round = 1; round <= 3 && !winner; round++) {
    finishRound = round;
    if (round > 1) {
      log.push('');
      log.push(`[Round ${round}]`);
      a.stamina = Math.min(100, a.stamina + 20);
      b.stamina = Math.min(100, b.stamina + 20);
    }
    const exchanges = 6 + Math.floor(Math.random() * 5);
    for (let i = 0; i < exchanges && !winner; i++) {
      const [attacker, defender] = Math.random() > 0.5 ? [a, b] : [b, a];
      const tdChance = attacker.stats.wrestling / 200;
      const action = Math.random() < tdChance ? 'takedown' : 'strike';
      if (action === 'strike') {
        const accuracy = (attacker.stats.striking + attacker.stats.punchSpeed) / 2;
        const lands = Math.random() * 100 < (accuracy - defender.stats.headMovement * 0.3);
        if (lands) {
          const damage = (attacker.stats.punchPower / 5) * (0.8 + Math.random() * 0.4);
          const isCritical = Math.random() < 0.15;
          let actualDamage = isCritical ? damage * 1.5 : damage;
          if (isCritical) {
            log.push(`[CRITICAL] ${attacker.name} lands a massive shot! ${defender.name} is hurt!`);
          } else if (damage > 15) {
            log.push(`${attacker.name} lands a solid strike on ${defender.name}`);
          } else {
            log.push(`${attacker.name} connects`);
          }
          defender.headHealth -= actualDamage * 0.7;
          defender.health -= actualDamage * 0.4;
          attacker.stamina -= 3;
          if (defender.headHealth < 20 && Math.random() < 0.4) {
            log.push(`${attacker.name} swarms with punches! The referee stops it!`);
            winner = attacker.name;
            method = defender.headHealth <= 0 ? 'KO' : 'TKO';
            break;
          }
        } else {
          log.push(`${attacker.name} misses`);
        }
      } else {
        const success = Math.random() * 100 < (attacker.stats.wrestling - defender.stats.takedownDefense * 0.5);
        if (success) {
          log.push(`${attacker.name} secures a takedown`);
          if (Math.random() < 0.3) {
            const subSuccess = Math.random() * 100 < (attacker.stats.submissions - defender.stats.wrestling * 0.3);
            if (subSuccess) {
              const subs = ['guillotine', 'rear naked choke', 'armbar', 'triangle'];
              const sub = subs[Math.floor(Math.random() * subs.length)];
              log.push(`${attacker.name} locks in a ${sub.toUpperCase()}! ${defender.name} taps!`);
              winner = attacker.name;
              method = 'SUB';
              break;
            } else {
              log.push(`${attacker.name} attempts a submission but ${defender.name} escapes`);
            }
          } else {
            const damage = 10 + Math.random() * 10;
            defender.headHealth -= damage;
            log.push(`${attacker.name} lands ground and pound`);
          }
        } else {
          log.push(`${attacker.name} shoots but ${defender.name} defends`);
        }
      }
      a.stamina -= 1;
      b.stamina -= 1;
    }
    if (!winner) log.push(`End of Round ${round}`);
  }

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

  return { winner, method, round: finishRound, log };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

// Rate limiting
const rateLimits = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(id: string, max: number, windowMs: number) {
  const now = Date.now();
  const entry = rateLimits.get(id);
  if (!entry || now > entry.resetTime) {
    rateLimits.set(id, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }
  if (entry.count >= max) {
    return { allowed: false };
  }
  entry.count++;
  return { allowed: true };
}

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// Normalize DB fighter stats to canonical engine Fighter shape
function toEngineFighter(id: string, name: string, stats: Record<string, any>): Fighter {
  // Detect 6-stat format (visual creator) by presence of 'grappling'
  if ('grappling' in stats) {
    return {
      id, name,
      stats: {
        striking: stats.striking || 50,
        punchSpeed: stats.speed || 50,
        punchPower: stats.power || 50,
        wrestling: stats.grappling || 50,
        submissions: Math.round((stats.grappling || 50) * 0.8),
        cardio: stats.stamina || 50,
        chin: stats.chin || 50,
        headMovement: Math.round((stats.speed || 50) * 0.8),
        takedownDefense: Math.round((stats.grappling || 50) * 0.7),
      },
    };
  }
  // Full 23-stat SkillsMdConfig format
  return {
    id, name,
    stats: {
      striking: stats.striking || 50,
      punchSpeed: stats.punchSpeed || 50,
      punchPower: stats.strength || stats.punchPower || 50,
      wrestling: stats.wrestling || 50,
      submissions: stats.submissions || 50,
      cardio: stats.cardio || 50,
      chin: stats.chin || 50,
      headMovement: stats.headMovement || 50,
      takedownDefense: stats.takedownDefense || 50,
    },
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const supabase = getSupabase();
  if (!supabase) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  if (req.method === 'GET') {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const { data, error } = await supabase
      .from('fights')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data || []);
  }

  if (req.method === 'POST') {
    // Rate limit: 20 fights per hour per IP — checked against DB
    const rawIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const ip = Array.isArray(rawIp) ? rawIp[0] : String(rawIp).split(',')[0].trim();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: fightCount } = await supabase
      .from('fights')
      .select('id', { count: 'exact', head: true })
      .eq('fight_data->>requester_ip', ip)
      .gte('created_at', oneHourAgo);
    if ((fightCount ?? 0) >= 20) {
      return res.status(429).json({ error: 'Rate limit: max 20 fights per hour. Try again later.' });
    }

    const { fighter1_id, fighter2_id } = req.body || {};
    if (!fighter1_id || !fighter2_id) {
      return res.status(400).json({ error: 'fighter1_id and fighter2_id required' });
    }

    const [r1, r2] = await Promise.all([
      supabase.from('fighters').select('*').eq('id', fighter1_id).single(),
      supabase.from('fighters').select('*').eq('id', fighter2_id).single(),
    ]);

    if (r1.error || !r1.data) return res.status(404).json({ error: 'Fighter 1 not found' });
    if (r2.error || !r2.data) return res.status(404).json({ error: 'Fighter 2 not found' });

    // Run fight simulation using canonical engine
    const f1 = toEngineFighter(r1.data.id, r1.data.name, r1.data.stats || {});
    const f2 = toEngineFighter(r2.data.id, r2.data.name, r2.data.stats || {});
    const result = engineRunFight(f1, f2);
    const winnerId = result.winner === r1.data.name ? r1.data.id :
                     result.winner === r2.data.name ? r2.data.id : null;

    // Save fight
    const { data: fightRecord, error: insertError } = await supabase
      .from('fights')
      .insert({
        agent1_id: fighter1_id,
        agent2_id: fighter2_id,
        winner_id: winnerId,
        method: result.method,
        round: result.round,
        fight_data: {
          fighter1: r1.data.name,
          fighter2: r2.data.name,
          winner: result.winner,
          method: result.method,
          log: result.log,
          requester_ip: ip,
        }
      })
      .select()
      .single();

    if (insertError) return res.status(500).json({ error: insertError.message });

    // Update stats for both fighters
    const isDraw = !winnerId;
    const loserId = winnerId === fighter1_id ? fighter2_id : fighter1_id;

    if (winnerId) {
      // Update winner win_count
      const { data: w } = await supabase.from('fighters').select('win_count').eq('id', winnerId).single();
      if (w) {
        await supabase.from('fighters').update({ win_count: (w.win_count || 0) + 1 }).eq('id', winnerId);
      }
    }

    // Update both fighters' metadata (losses for loser, totalFights for both)
    await Promise.all([fighter1_id, fighter2_id].map(async (fid) => {
      const { data: f } = await supabase.from('fighters').select('metadata').eq('id', fid).single();
      if (!f) return;
      const meta = (f.metadata as any) || {};
      const isLoser = !isDraw && fid === loserId;
      await supabase.from('fighters').update({
        metadata: {
          ...meta,
          totalFights: (meta.totalFights || 0) + 1,
          ...(isLoser ? { losses: (meta.losses || 0) + 1 } : {}),
        }
      }).eq('id', fid);
    }));

    return res.status(201).json({
      id: fightRecord.id,
      fighter1: r1.data.name,
      fighter2: r2.data.name,
      winner: result.winner,
      winner_id: winnerId,
      method: result.method,
      round: result.round,
      fight_log: result.log,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

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

// Fight engine inlined
function runFight(f1: any, f2: any) {
  const log: string[] = [];
  let winner: string | null = null;
  let method: string | null = null;
  
  const a = { ...f1, health: 100, headHealth: 100, stamina: 100 };
  const b = { ...f2, health: 100, headHealth: 100, stamina: 100 };
  
  log.push('=== ROUND 1 ===');
  log.push(`${a.name} vs ${b.name}`);
  log.push('');
  
  for (let round = 1; round <= 3 && !winner; round++) {
    if (round > 1) {
      log.push('');
      log.push(`=== ROUND ${round} ===`);
      a.stamina = Math.min(100, a.stamina + 20);
      b.stamina = Math.min(100, b.stamina + 20);
    }
    
    const exchanges = 6 + Math.floor(Math.random() * 4);
    
    for (let i = 0; i < exchanges && !winner; i++) {
      const [att, def] = Math.random() > 0.5 ? [a, b] : [b, a];
      
      // Choose action
      const strikes = ['jab', 'cross', 'hook', 'uppercut', 'leg kick', 'body kick'];
      const heavyStrikes = ['head kick', 'overhand right', 'flying knee', 'spinning backfist'];
      
      const isTakedown = Math.random() < (att.stats.wrestling || 50) / 200;
      
      if (isTakedown) {
        const success = Math.random() * 100 < ((att.stats.wrestling || 50) - (def.stats.takedownDefense || 50) * 0.5);
        if (success) {
          log.push(`>> ${att.name} secures a takedown!`);
          
          // Ground action
          if (Math.random() < 0.35) {
            const subSuccess = Math.random() * 100 < (att.stats.submissions || 50);
            if (subSuccess) {
              const subs = ['rear naked choke', 'guillotine', 'triangle choke', 'armbar'];
              const sub = subs[Math.floor(Math.random() * subs.length)];
              log.push(`>> ${att.name} locks in a ${sub.toUpperCase()}!`);
              log.push(`>> ${def.name} TAPS OUT!`);
              winner = att.name;
              method = 'SUB';
              break;
            } else {
              log.push(`${att.name} attempts a submission but ${def.name} escapes`);
            }
          } else {
            // GNP
            const damage = 8 + Math.random() * 12;
            def.headHealth -= damage;
            log.push(`${att.name} lands ground and pound (${Math.round(damage)})`);
            
            if (def.headHealth < 20 && Math.random() < 0.3) {
              log.push(`>> REFEREE STOPS THE FIGHT!`);
              winner = att.name;
              method = 'TKO';
              break;
            }
          }
        } else {
          log.push(`${att.name} shoots but ${def.name} defends`);
        }
      } else {
        // Striking
        const isHeavy = Math.random() < 0.25 && att.stats.punchPower > 70;
        const strike = isHeavy 
          ? heavyStrikes[Math.floor(Math.random() * heavyStrikes.length)]
          : strikes[Math.floor(Math.random() * strikes.length)];
        
        const accuracy = ((att.stats.striking || 50) + (att.stats.punchSpeed || 50)) / 2;
        const defense = (def.stats.headMovement || 50);
        const lands = Math.random() * 100 < (accuracy - defense * 0.3);
        
        if (lands) {
          let damage = isHeavy ? 25 + Math.random() * 15 : 5 + Math.random() * 10;
          damage *= (att.stats.punchPower || 50) / 50;
          
          const isCritical = Math.random() < 0.12;
          if (isCritical) {
            damage *= 1.6;
            log.push(`>> CRITICAL! ${att.name} lands a massive ${strike}! ${def.name} is ROCKED!`);
          } else if (isHeavy) {
            log.push(`>> ${att.name} lands a heavy ${strike}! (${Math.round(damage)})`);
          } else {
            log.push(`${att.name} lands a ${strike} (${Math.round(damage)})`);
          }
          
          def.headHealth -= damage * 0.7;
          def.health -= damage * 0.4;
          
          // Finish check
          if (def.headHealth <= 0) {
            log.push(`>> ${def.name} goes DOWN!`);
            log.push(`>> ${att.name} follows up... ITS OVER!`);
            winner = att.name;
            method = 'KO';
            break;
          } else if (def.headHealth < 25 && Math.random() < 0.35) {
            log.push(`>> ${att.name} is pouring it on! The ref steps in!`);
            winner = att.name;
            method = 'TKO';
            break;
          }
        } else {
          log.push(`${att.name} misses with ${strike}`);
        }
      }
      
      a.stamina -= 1;
      b.stamina -= 1;
    }
    
    if (!winner) {
      log.push(`-- End of Round ${round} --`);
    }
  }
  
  if (!winner) {
    log.push('');
    log.push('=== DECISION ===');
    const scoreA = (a.health + a.stamina) / 2;
    const scoreB = (b.health + b.stamina) / 2;
    
    if (Math.abs(scoreA - scoreB) < 8) {
      log.push('Split Decision Draw!');
      winner = 'DRAW';
      method = 'DEC';
    } else {
      winner = scoreA > scoreB ? a.name : b.name;
      method = 'DEC';
      log.push(`${winner} wins by Unanimous Decision!`);
    }
  }
  
  return { winner, method, log };
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
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const limit = checkRateLimit(`fights:${ip}`, 10, 60000);
    if (!limit.allowed) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
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

    // Run fight simulation
    const result = runFight(r1.data, r2.data);
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
        round: 1,
        fight_data: {
          fighter1: r1.data.name,
          fighter2: r2.data.name,
          winner: result.winner,
          method: result.method,
          log: result.log,
        }
      })
      .select()
      .single();

    if (insertError) return res.status(500).json({ error: insertError.message });

    // Update winner
    if (winnerId) {
      const { data: w } = await supabase.from('fighters').select('win_count').eq('id', winnerId).single();
      if (w) {
        await supabase.from('fighters').update({ win_count: (w.win_count || 0) + 1 }).eq('id', winnerId);
      }
    }

    return res.status(201).json({
      id: fightRecord.id,
      fighter1: r1.data.name,
      fighter2: r2.data.name,
      winner: result.winner,
      winner_id: winnerId,
      method: result.method,
      fight_log: result.log,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

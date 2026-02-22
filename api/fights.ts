import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { runFight as engineRunFight } from '../src/lib/fightEngine';
import type { Fighter } from '../src/lib/fightEngine';

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
      fight_log: result.log,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

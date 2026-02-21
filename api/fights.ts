import { createClient } from '@supabase/supabase-js';
import { FightEngine } from '../src/engine/FightEngine';
import type { FightState } from '../src/types/fight';
import { skillsToFighterStats } from '../src/lib/agentAdapter';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), {
      status: 503, headers: corsHeaders,
    });
  }

  if (req.method === 'GET') {
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);

    const { data, error } = await supabase
      .from('fights')
      .select('id, agent1_id, agent2_id, winner_id, method, round, end_time, prize_awarded, prize_amount, is_practice, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500, headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify(data), { status: 200, headers: corsHeaders });
  }

  if (req.method === 'POST') {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400, headers: corsHeaders,
      });
    }

    const raw = body as {
      fighter1_id?: string;
      fighter2_id?: string;
      agent1_id?: string;
      agent2_id?: string;
    };

    const fighter1Id = raw.fighter1_id || raw.agent1_id;
    const fighter2Id = raw.fighter2_id || raw.agent2_id;

    if (!fighter1Id || !fighter2Id) {
      return new Response(JSON.stringify({ error: 'fighter1_id and fighter2_id are required' }), {
        status: 400, headers: corsHeaders,
      });
    }

    const [result1, result2] = await Promise.all([
      supabase.from('fighters').select('id, name, stats').eq('id', fighter1Id).single(),
      supabase.from('fighters').select('id, name, stats').eq('id', fighter2Id).single(),
    ]);

    if (result1.error || !result1.data) {
      return new Response(JSON.stringify({ error: 'Fighter not found', fighter_id: fighter1Id }), {
        status: 404, headers: corsHeaders,
      });
    }
    if (result2.error || !result2.data) {
      return new Response(JSON.stringify({ error: 'Fighter not found', fighter_id: fighter2Id }), {
        status: 404, headers: corsHeaders,
      });
    }

    const fighter1Row = result1.data;
    const fighter2Row = result2.data;

    const stats1 = skillsToFighterStats(fighter1Row.stats as any, fighter1Row.name);
    const stats2 = skillsToFighterStats(fighter2Row.stats as any, fighter2Row.name);

    const fightResult = await new Promise<FightState>((resolve) => {
      const engine = new FightEngine(stats1, stats2, {
        onFightEnd: (fight) => {
          engine.stop();
          resolve(fight);
        },
      });
      engine.start();

      setTimeout(() => {
        const state = engine.getState();
        engine.stop();
        resolve(state);
      }, 25000);
    });

    let winnerId: string | null = null;
    if (fightResult.winner === fighter1Row.name) {
      winnerId = fighter1Row.id;
    } else if (fightResult.winner === fighter2Row.name) {
      winnerId = fighter2Row.id;
    }

    const fightLog = fightResult.rounds.flatMap((r) => r.actions).map((a) => a.description);

    const { data: fightRecord, error: insertError } = await supabase
      .from('fights')
      .insert({
        agent1_id: fighter1Id,
        agent2_id: fighter2Id,
        winner_id: winnerId,
        method: fightResult.method || 'DEC',
        round: fightResult.endRound || fightResult.currentRound,
        prize_awarded: false,
        prize_amount: 0,
        fight_data: fightResult as unknown as Record<string, unknown>,
      })
      .select('id, agent1_id, agent2_id, winner_id, method, round, created_at')
      .single();

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500, headers: corsHeaders,
      });
    }

    if (winnerId) {
      const { data: winnerRow } = await supabase
        .from('fighters')
        .select('win_count')
        .eq('id', winnerId)
        .single();
      if (winnerRow) {
        await supabase
          .from('fighters')
          .update({ win_count: (winnerRow.win_count || 0) + 1 })
          .eq('id', winnerId);
      }
    }

    return new Response(JSON.stringify({
      id: fightRecord.id,
      fighter1: fighter1Row.name,
      fighter2: fighter2Row.name,
      winner: fightResult.winner || null,
      winner_id: winnerId,
      method: fightResult.method || 'DEC',
      round: fightResult.endRound || fightResult.currentRound,
      fight_log: fightLog,
    }), { status: 201, headers: corsHeaders });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405, headers: corsHeaders,
  });
}

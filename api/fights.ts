import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  // Use service role key for server-side operations (bypasses RLS)
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
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
      .select('id, agent1_id, agent2_id, winner_id, method, round, end_time, prize_awarded, prize_amount, is_practice, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data || []);
  }

  if (req.method === 'POST') {
    const { fighter1_id, fighter2_id } = req.body || {};

    if (!fighter1_id || !fighter2_id) {
      return res.status(400).json({ error: 'fighter1_id and fighter2_id are required' });
    }

    const [result1, result2] = await Promise.all([
      supabase.from('fighters').select('id, name, stats').eq('id', fighter1_id).single(),
      supabase.from('fighters').select('id, name, stats').eq('id', fighter2_id).single(),
    ]);

    if (result1.error || !result1.data) {
      return res.status(404).json({ error: 'Fighter not found', fighter_id: fighter1_id });
    }
    if (result2.error || !result2.data) {
      return res.status(404).json({ error: 'Fighter not found', fighter_id: fighter2_id });
    }

    const fighter1Row = result1.data;
    const fighter2Row = result2.data;

    const randomWinner = Math.random() > 0.5 ? fighter1Row.id : fighter2Row.id;
    const methods = ['KO', 'TKO', 'SUB', 'DEC'];
    const method = methods[Math.floor(Math.random() * methods.length)];
    const round = Math.floor(Math.random() * 3) + 1;

    const { data: fightRecord, error: insertError } = await supabase
      .from('fights')
      .insert({
        agent1_id: fighter1_id,
        agent2_id: fighter2_id,
        winner_id: randomWinner,
        method: method,
        round: round,
        prize_awarded: false,
        prize_amount: 0,
      })
      .select('id, agent1_id, agent2_id, winner_id, method, round, created_at')
      .single();

    if (insertError) {
      return res.status(500).json({ error: insertError.message });
    }

    if (randomWinner) {
      const { data: winnerRow } = await supabase
        .from('fighters')
        .select('win_count')
        .eq('id', randomWinner)
        .single();
      if (winnerRow) {
        await supabase
          .from('fighters')
          .update({ win_count: (winnerRow.win_count || 0) + 1 })
          .eq('id', randomWinner);
      }
    }

    return res.status(201).json({
      id: fightRecord.id,
      fighter1: fighter1Row.name,
      fighter2: fighter2Row.name,
      winner_id: randomWinner,
      method: method,
      round: round,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

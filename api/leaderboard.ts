import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const { data, error } = await supabase
      .from('fighters')
      .select('id, name, win_count, metadata, created_at')
      .order('win_count', { ascending: false })
      .limit(limit);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const entries = (data || []).map((f, i) => ({
      rank: i + 1,
      id: f.id,
      name: f.name,
      win_count: f.win_count || 0,
      total_fights: (f.metadata as any)?.totalFights || 0,
      losses: (f.metadata as any)?.losses || 0,
    }));

    return res.status(200).json(entries);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

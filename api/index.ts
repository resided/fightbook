import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

function getSupabase() {
  const url = process.env.SUPABASE_URL || (process.env as any).VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || (process.env as any).VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const supabase = getSupabase();

  // Health check
  if (path === '/api/health' || path === '/health') {
    return new Response(JSON.stringify({ status: 'ok', timestamp: Date.now() }), {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Leaderboard
  if (path === '/api/leaderboard' && method === 'GET') {
    if (!supabase) {
      return new Response(JSON.stringify({ error: 'Database not configured' }), {
        status: 503, headers: corsHeaders,
      });
    }

    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);

    const { data, error } = await supabase
      .from('fighters')
      .select('id, name, win_count, metadata, created_at')
      .order('win_count', { ascending: false })
      .limit(limit);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500, headers: corsHeaders,
      });
    }

    const entries = (data || []).map((f: any, i: number) => ({
      rank: i + 1,
      id: f.id,
      name: f.name,
      win_count: f.win_count || 0,
      total_fights: f.metadata?.totalFights || 0,
      losses: f.metadata?.losses || 0,
    }));

    return new Response(JSON.stringify(entries), { status: 200, headers: corsHeaders });
  }

  // Fighters list
  if (path === '/api/fighters' && method === 'GET') {
    if (!supabase) {
      return new Response(JSON.stringify({ error: 'Database not configured' }), {
        status: 503, headers: corsHeaders,
      });
    }

    const { data, error } = await supabase
      .from('fighters')
      .select('id, name, stats, metadata, win_count, created_at')
      .order('win_count', { ascending: false })
      .limit(50);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500, headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ fighters: data || [] }), { status: 200, headers: corsHeaders });
  }

  // Single fighter skills.md
  const fighterMatch = path.match(/^\/api\/fighters\/([^\/]+)(?:\/skills\.md)?$/);
  if (fighterMatch) {
    const fighterId = fighterMatch[1];

    if (!supabase) {
      return new Response(JSON.stringify({ error: 'Database not configured' }), {
        status: 503, headers: corsHeaders,
      });
    }

    const { data, error } = await supabase
      .from('fighters')
      .select('*')
      .eq('id', fighterId)
      .single();

    if (error || !data) {
      return new Response('Fighter not found', { status: 404 });
    }

    // Generate skills.md format
    const stats = data.stats || {};
    const md = `# ${data.name} - FightBook Agent Configuration

## IDENTITY
name: ${data.name}
nickname: ${data.metadata?.nickname || 'The Fighter'}

## STRIKING
striking: ${stats.striking || 50}
punch_speed: ${stats.punchSpeed || 50}
kick_power: ${stats.kickPower || 50}
head_movement: ${stats.headMovement || 50}

## GRAPPLING
wrestling: ${stats.wrestling || 50}
takedown_defense: ${stats.takedownDefense || 50}
submissions: ${stats.submissions || 50}

## PHYSICAL
cardio: ${stats.cardio || 50}
chin: ${stats.chin || 50}
recovery: ${stats.recovery || 50}
`;

    return new Response(md, { status: 200, headers: { 'Content-Type': 'text/markdown' } });
  }

  // Fights list
  if (path === '/api/fights' && method === 'GET') {
    if (!supabase) {
      return new Response(JSON.stringify({ error: 'Database not configured' }), {
        status: 503, headers: corsHeaders,
      });
    }

    const { data, error } = await supabase
      .from('fights')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500, headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ fights: data || [] }), { status: 200, headers: corsHeaders });
  }

  // Default: API info
  return new Response(
    JSON.stringify({
      status: 'ok',
      message: 'FightBook API v1',
      endpoints: {
        health: '/api/health',
        fighters: '/api/fighters',
        leaderboard: '/api/leaderboard',
        fights: '/api/fights',
      }
    }),
    { status: 200, headers: corsHeaders }
  );
}

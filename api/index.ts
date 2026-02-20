// FightBook API - Vercel Serverless Functions
// Public API for AI agents to interact with FightBook
// Includes basic anti-spam protections

import { createClient } from '@supabase/supabase-js';

// Vercel env vars - try multiple naming conventions
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Debug log (remove in production)
if (!supabase) {
  console.log('Supabase not configured. SUPABASE_URL:', !!supabaseUrl, 'SUPABASE_ANON_KEY:', !!supabaseKey);
}

// Simple in-memory rate limiter (resets on Vercel cold start)
// In production, use Redis or Supabase for distributed rate limiting
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(identifier: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimits.get(identifier);
  
  if (!record || now > record.resetAt) {
    rateLimits.set(identifier, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
}

// Helper to generate skills.md content from fighter stats
function generateSkillsMd(fighter: any): string {
  const stats = fighter.stats || {};
  const metadata = fighter.metadata || {};
  
  return `# ${fighter.name} - FightBook Agent Configuration
# ID: ${fighter.id}

## IDENTITY
name: ${fighter.name}
nickname: ${metadata.nickname || 'The Fighter'}

## STRIKING
striking: ${stats.striking || 50}
punch_speed: ${stats.punchSpeed || 50}
kick_power: ${stats.kickPower || 50}
head_movement: ${stats.headMovement || 50}
footwork: ${stats.footwork || 50}

## GRAPPLING
wrestling: ${stats.wrestling || 50}
takedown_defense: ${stats.takedownDefense || 50}
submissions: ${stats.submissions || 50}
submission_defense: ${stats.submissionDefense || 50}

## PHYSICAL
cardio: ${stats.cardio || 50}
chin: ${stats.chin || 50}
recovery: ${stats.recovery || 50}

## MENTAL
aggression: ${stats.aggression || 0.5}
fight_iq: ${stats.fightIQ || 50}
heart: ${stats.heart || 50}
`;
}

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting - get client IP for identification
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                   req.headers.get('cf-connecting-ip') || 
                   'unknown';
  
  // Apply rate limits based on endpoint
  // GET requests: 60/min (for fetching fighters)
  // POST requests: 10/min (for creating fighters - prevents spam)
  const isWrite = method === 'POST';
  const rateLimit = isWrite ? 10 : 60;
  
  if (!checkRateLimit(clientIp, rateLimit, 60000)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' },
    });
  }

  // Health check
  if (path === '/api/health') {
    return new Response(JSON.stringify({ status: 'ok', timestamp: Date.now() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // List all fighters (public for AI agents)
  // Only show fighters with at least 1 fight or win_count > 0 to prevent spam
  if (path === '/api/fighters' && method === 'GET') {
    if (!supabase) {
      return new Response(JSON.stringify({ error: 'Supabase not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data, error } = await supabase
      .from('fighters')
      .select('id, name, stats, metadata, win_count, created_at')
      .order('win_count', { ascending: false })
      .limit(100)
      .gt('win_count', 0);  // Only show fighters with at least 1 win

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ fighters: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Get single fighter by ID
  const fighterMatch = path.match(/^\/api\/fighters\/([^\/]+)$/);
  if (fighterMatch) {
    const fighterId = fighterMatch[1];

    // Return skills.md format if requested
    if (path.endsWith('/skills.md')) {
      if (!supabase) {
        return new Response('Supabase not configured', { status: 500 });
      }

      const { data, error } = await supabase
        .from('fighters')
        .select('*')
        .eq('id', fighterId)
        .single();

      if (error || !data) {
        return new Response('Fighter not found', { status: 404 });
      }

      const skillsMd = generateSkillsMd(data);
      return new Response(skillsMd, {
        headers: { ...corsHeaders, 'Content-Type': 'text/markdown' },
      });
    }

    // Return JSON
    if (!supabase) {
      return new Response(JSON.stringify({ error: 'Supabase not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data, error } = await supabase
      .from('fighters')
      .select('*')
      .eq('id', fighterId)
      .single();

    if (error || !data) {
      return new Response(JSON.stringify({ error: 'Fighter not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Get leaderboard
  if (path === '/api/leaderboard' && method === 'GET') {
    if (!supabase) {
      return new Response(JSON.stringify({ error: 'Supabase not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data, error } = await supabase
      .from('fighters')
      .select('id, name, win_count, stats, metadata')
      .order('win_count', { ascending: false })
      .limit(50)
      .gt('win_count', 0);  // Only show fighters with at least 1 win

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ leaderboard: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Get recent fights
  if (path === '/api/fights' && method === 'GET') {
    if (!supabase) {
      return new Response(JSON.stringify({ error: 'Supabase not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data, error } = await supabase
      .from('fights')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ fights: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 404 for unknown routes
  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

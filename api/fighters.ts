import { createClient } from '@supabase/supabase-js';
import { parseSkillsMd, validateSkillsBudget, DEFAULT_SKILLS } from '../src/types/agent';
import type { SkillsMdConfig } from '../src/types/agent';

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

function normalizeStats(raw: Record<string, unknown>): Partial<SkillsMdConfig> {
  const map: Record<string, string> = {
    punch_speed: 'punchSpeed', head_movement: 'headMovement',
    takedown_defense: 'takedownDefense', clinch_control: 'clinchControl',
    submission_defense: 'submissionDefense', ground_and_pound: 'groundAndPound',
    guard_passing: 'guardPassing', top_control: 'topControl',
    bottom_game: 'bottomGame', fight_iq: 'fightIQ',
    ring_generalship: 'ringGeneralship', finishing_instinct: 'finishingInstinct',
    defensive_tendency: 'defensiveTendency', kick_power: 'kickPower',
  };
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) {
    out[map[k] ?? k] = v;
  }
  return out as Partial<SkillsMdConfig>;
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
    const { data, error } = await supabase
      .from('fighters')
      .select('id, name, win_count, stats, metadata, api_provider, created_at')
      .order('win_count', { ascending: false })
      .limit(100);

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

    const { name, stats, metadata, skills_md } = body as {
      name?: string;
      stats?: Record<string, unknown>;
      metadata?: Record<string, unknown>;
      skills_md?: string;
    };

    if (!name || typeof name !== 'string') {
      return new Response(JSON.stringify({ error: 'name is required' }), {
        status: 400, headers: corsHeaders,
      });
    }

    let normalizedPartial: Partial<SkillsMdConfig> = {};

    if (skills_md && typeof skills_md === 'string') {
      normalizedPartial = parseSkillsMd(skills_md);
    }

    if (stats && typeof stats === 'object') {
      const normalizedStats = normalizeStats(stats as Record<string, unknown>);
      normalizedPartial = { ...normalizedPartial, ...normalizedStats };
    }

    const fullStats: SkillsMdConfig = { ...DEFAULT_SKILLS, ...normalizedPartial, name };

    const validation = validateSkillsBudget(fullStats);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: 'Over budget', details: validation.errors }), {
        status: 400, headers: corsHeaders,
      });
    }

    const { data, error } = await supabase
      .from('fighters')
      .insert({ name, stats: fullStats, metadata: metadata || {} })
      .select('id, name, win_count, stats, metadata, created_at')
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500, headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify(data), { status: 201, headers: corsHeaders });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405, headers: corsHeaders,
  });
}

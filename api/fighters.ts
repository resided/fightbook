import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

// Simple in-memory rate limiting
const rateLimits = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string, maxRequests: number = 10, windowMs: number = 60000): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimits.get(identifier);
  
  if (!entry || now > entry.resetTime) {
    rateLimits.set(identifier, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
  }
  
  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }
  
  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetTime: entry.resetTime };
}

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

  if (req.method === 'DELETE') {
    const authHeader = req.headers['authorization'] || '';
    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret || authHeader !== `Bearer ${adminSecret}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { id } = req.body || {};
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'id is required' });
    }
    const { error } = await supabase.from('fighters').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ deleted: id });
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('fighters')
      .select('id, name, win_count, stats, metadata, api_provider, created_at')
      .order('win_count', { ascending: false })
      .limit(100);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data || []);
  }

  if (req.method === 'POST') {
    // Rate limit: 5 fighters per minute per IP
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const rateLimit = checkRateLimit(`fighters:${clientIp}`, 5, 60000);
    
    if (!rateLimit.allowed) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Try again in a minute.',
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
      });
    }

    const { name, stats, metadata } = req.body || {};

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'name is required' });
    }

    // Sanitize name
    const sanitizedName = name.trim().slice(0, 30).replace(/[<>"']/g, '');

    if (sanitizedName.length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters' });
    }

    // Reject duplicate names (case-insensitive)
    const { data: existing } = await supabase
      .from('fighters')
      .select('id')
      .ilike('name', sanitizedName)
      .limit(1)
      .single();
    if (existing) {
      return res.status(409).json({ error: `Fighter name "${sanitizedName}" is already taken` });
    }

    // Snake_case → camelCase normalization for CLI agent submissions
    const SNAKE_TO_CAMEL: Record<string, string> = {
      punch_speed: 'punchSpeed', head_movement: 'headMovement', kick_power: 'kickPower',
      takedown_defense: 'takedownDefense', clinch_control: 'clinchControl',
      submission_defense: 'submissionDefense', ground_and_pound: 'groundAndPound',
      guard_passing: 'guardPassing', top_control: 'topControl', bottom_game: 'bottomGame',
      fight_iq: 'fightIQ', ring_generalship: 'ringGeneralship',
      finishing_instinct: 'finishingInstinct', defensive_tendency: 'defensiveTendency',
    };
    const rawStats = (stats && typeof stats === 'object') ? stats as Record<string, unknown> : {};
    const normalizedStats: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(rawStats)) {
      normalizedStats[SNAKE_TO_CAMEL[k] ?? k] = v;
    }

    // Budget validation: physical stats must be between 20-95
    const PHYSICAL_STATS = [
      'striking', 'punchSpeed', 'kickPower', 'headMovement', 'footwork', 'combinations',
      'wrestling', 'takedownDefense', 'clinchControl', 'trips', 'throws',
      'submissions', 'submissionDefense', 'groundAndPound', 'guardPassing', 'sweeps',
      'topControl', 'bottomGame', 'cardio', 'chin', 'recovery', 'strength', 'flexibility',
      // 6-stat web format
      'grappling', 'stamina', 'power', 'speed',
    ];
    const statErrors: string[] = [];
    let totalPoints = 0;
    const BASE = 30;
    for (const stat of PHYSICAL_STATS) {
      const val = normalizedStats[stat] ?? rawStats[stat];
      if (val === undefined) continue;
      const n = Number(val);
      if (isNaN(n)) { statErrors.push(`${stat}: must be a number`); continue; }
      if (n < 20) statErrors.push(`${stat}: minimum is 20 (got ${n})`);
      if (n > 95) statErrors.push(`${stat}: maximum is 95 (got ${n})`);
      totalPoints += Math.max(0, n - BASE);
    }
    // Full 23-stat CLI format: enforce 1200-point budget above base-30
    const statCount = PHYSICAL_STATS.filter(s => (normalizedStats[s] ?? rawStats[s]) !== undefined).length;
    if (statCount > 6 && totalPoints > 1200) {
      statErrors.push(`Over budget: ${totalPoints} / 1200 points used`);
    }
    if (statErrors.length > 0) {
      return res.status(400).json({ error: 'Stats validation failed', details: statErrors });
    }

    const { data, error } = await supabase
      .from('fighters')
      .insert({
        name: sanitizedName,
        stats: Object.keys(normalizedStats).length > 0 ? normalizedStats : rawStats,
        metadata: metadata || {},
        api_provider: 'openai',
        api_key_encrypted: ''
      })
      .select('id, name, win_count, stats, metadata, created_at')
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// FightBook - Supabase Client
// Database connection and authentication

import { createClient } from '@supabase/supabase-js';

// Support both VITE_ prefix (Vite) and direct env vars (Vercel)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || (import.meta.env as any).SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || (import.meta.env as any).SUPABASE_ANON_KEY;

// Create and export the Supabase client
// Returns null client if env vars are not set (for development without Supabase)
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// Helper to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey);
};

// Types for the fighters table
export interface FighterRow {
  id: string;
  user_id: string | null;
  name: string;
  api_key_encrypted: string;
  api_provider: 'openai' | 'anthropic';
  stats: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  win_count: number;
}

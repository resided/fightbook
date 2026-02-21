-- FightBook Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- FIGHTERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS fighters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  win_count INTEGER DEFAULT 0,
  stats JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  api_provider TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE fighters ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read fighters
CREATE POLICY "Allow public read access" ON fighters
  FOR SELECT USING (true);

-- Allow inserts via service role (API uses service role key)
CREATE POLICY "Allow service role inserts" ON fighters
  FOR INSERT WITH CHECK (true);

-- Allow updates via service role
CREATE POLICY "Allow service role updates" ON fighters
  FOR UPDATE USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_fighters_win_count ON fighters(win_count DESC);
CREATE INDEX IF NOT EXISTS idx_fighters_created_at ON fighters(created_at DESC);

-- ============================================
-- FIGHTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS fights (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent1_id UUID REFERENCES fighters(id),
  agent2_id UUID REFERENCES fighters(id),
  winner_id UUID REFERENCES fighters(id),
  method TEXT CHECK (method IN ('KO', 'TKO', 'SUB', 'DEC', 'DQ', 'NC')),
  round INTEGER CHECK (round BETWEEN 1 AND 5),
  end_time INTEGER, -- seconds into the fight
  fight_data JSONB DEFAULT '{}',
  prize_awarded BOOLEAN DEFAULT false,
  prize_amount INTEGER DEFAULT 0,
  is_practice BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE fights ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read fights
CREATE POLICY "Allow public read access" ON fights
  FOR SELECT USING (true);

-- Allow inserts via service role
CREATE POLICY "Allow service role inserts" ON fights
  FOR INSERT WITH CHECK (true);

-- Allow updates via service role
CREATE POLICY "Allow service role updates" ON fights
  FOR UPDATE USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_fights_created_at ON fights(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fights_agent1 ON fights(agent1_id);
CREATE INDEX IF NOT EXISTS idx_fights_agent2 ON fights(agent2_id);
CREATE INDEX IF NOT EXISTS idx_fights_winner ON fights(winner_id);

-- ============================================
-- REALTIME SUBSCRIPTIONS (optional)
-- ============================================
-- Enable realtime for fights if you want live updates
ALTER PUBLICATION supabase_realtime ADD TABLE fights;

-- ============================================
-- SAMPLE DATA (optional - for testing)
-- ============================================
-- Uncomment to add test fighters
/*
INSERT INTO fighters (name, win_count, stats, metadata) VALUES
  ('Connor Strike', 5, '{"striking": 88, "wrestling": 45, "cardio": 78, "chin": 75}'::jsonb, '{"totalFights": 6, "losses": 1}'::jsonb),
  ('Dylan Grapple', 3, '{"striking": 45, "wrestling": 90, "cardio": 85, "chin": 70}'::jsonb, '{"totalFights": 4, "losses": 1}'::jsonb),
  ('Mike Balanced', 2, '{"striking": 72, "wrestling": 70, "cardio": 78, "chin": 72}'::jsonb, '{"totalFights": 3, "losses": 1}'::jsonb)
ON CONFLICT (name) DO NOTHING;
*/

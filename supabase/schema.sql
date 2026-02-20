-- FightBook Database Schema
-- Supabase SQL for fighter registration and storage

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enable pgcrypto for encryption functions
create extension if not exists "pgcrypto";

-- Fighters table
create table fighters (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    name text not null,
    win_count integer default 0,
    api_key_encrypted text not null,
    api_provider text check (api_provider in ('openai', 'anthropic')) not null,
    stats jsonb not null default '{}',
    metadata jsonb not null default '{}',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Index for sorting by win_count (for leaderboard)
create index idx_fighters_win_count on fighters(win_count desc);

-- Enable Row Level Security
alter table fighters enable row level security;

-- RLS Policy: Users can only see and modify their own fighters
create policy "Users can CRUD own fighters" on fighters
    for all
    using (auth.uid() = user_id);

-- Index for faster user_id lookups
create index idx_fighters_user_id on fighters(user_id);

-- Index for sorting by created_at
create index idx_fighters_created_at on fighters(created_at desc);

-- Function to auto-update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
create trigger update_fighters_updated_at
    before update on fighters
    for each row
    execute function update_updated_at_column();

-- Fights table - stores completed fight records
create table fights (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    agent1_id uuid references fighters(id) on delete set null,
    agent2_id uuid references fighters(id) on delete set null,
    winner_id uuid references fighters(id) on delete set null,
    method text check (method in ('KO', 'TKO', 'SUB', 'DEC', 'DRAW')),
    round integer not null,
    end_time integer,
    fight_data jsonb not null,
    prize_awarded boolean default false,
    prize_amount integer default 0,
    is_entertaining boolean default false,
    is_practice boolean default false,  -- true for CPU/practice fights, false for PvP
    created_at timestamptz default now()
);

-- Enable Row Level Security
alter table fights enable row level security;

-- RLS Policy: Users can view their own fights
create policy "Users can view own fights" on fights
    for select
    using (auth.uid() = user_id);

-- RLS Policy: Users can insert their own fights
create policy "Users can insert own fights" on fights
    for insert
    with check (auth.uid() = user_id);

-- RLS Policy: Users can update their own fights (for prize awarding)
create policy "Users can update own fights" on fights
    for update
    using (auth.uid() = user_id);

-- Index for faster user_id lookups on fights
create index idx_fights_user_id on fights(user_id);

-- Index for sorting fights by created_at
create index idx_fights_created_at on fights(created_at desc);

-- Index for agent lookups
create index idx_fights_agent1_id on fights(agent1_id);
create index idx_fights_agent2_id on fights(agent2_id);

-- Index for practice fight filtering
create index idx_fights_is_practice on fights(is_practice) where is_practice = false;

-- Fight votes table - for voting on entertaining fights
create table fight_votes (
    id uuid default uuid_generate_v4() primary key,
    fight_id uuid references fights(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    created_at timestamptz default now(),
    unique(fight_id, user_id)
);

-- Enable Row Level Security
alter table fight_votes enable row level security;

-- RLS Policy: Users can view all votes
create policy "Users can view all votes" on fight_votes
    for select
    using (true);

-- RLS Policy: Users can only insert their own votes
create policy "Users can insert own votes" on fight_votes
    for insert
    with check (auth.uid() = user_id);

-- RLS Policy: Users can only delete their own votes
create policy "Users can delete own votes" on fight_votes
    for delete
    using (auth.uid() = user_id);

-- Index for vote lookups
create index idx_fight_votes_fight_id on fight_votes(fight_id);
create index idx_fight_votes_user_id on fight_votes(user_id);

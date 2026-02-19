---
phase: 01-fighter-registration
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: []
autonomous: true
requirements: [REGI-01, REGI-02, REGI-03, REGI-04, STAT-01, STAT-02, STAT-04]
must_haves:
  truths:
    - "User can register fighter with name and API key"
    - "Fighter data persists in Supabase database"
    - "API keys are encrypted, not stored in plain text"
  artifacts:
    - path: "supabase/schema.sql"
      provides: "Database schema for fighters"
      contains: "create table fighters"
    - path: "src/lib/supabase.ts"
      provides: "Supabase client"
      exports: "supabase"
    - path: "src/lib/fighterStorage.ts"
      provides: "CRUD operations for fighters"
      exports: ["saveFighter", "getFighters", "getFighter", "updateFighter", "deleteFighter"]
  key_links:
    - from: "src/lib/fighterStorage.ts"
      to: "src/lib/supabase.ts"
      via: "supabase.from('fighters')"
      pattern: "supabase\\.from\\('fighters'\\)"
    - from: "src/lib/fighterStorage.ts"
      to: "src/types/agent.ts"
      via: "import CompleteAgent"
      pattern: "import.*CompleteAgent"
user_setup:
  - service: supabase
    why: "Persistent fighter storage"
    env_vars:
      - name: VITE_SUPABASE_URL
        source: "Supabase Dashboard -> Settings -> API"
      - name: VITE_SUPABASE_ANON_KEY
        source: "Supabase Dashboard -> Settings -> API"
    dashboard_config:
      - task: "Create fighters table"
        location: "Supabase Dashboard -> SQL Editor"
        sql: |
          create table fighters (
            id uuid default gen_random_uuid() primary key,
            user_id uuid references auth.users(id),
            name text not null,
            api_key text not null,
            api_provider text check (api_provider in ('openai', 'anthropic')) not null,
            stats jsonb not null default '{}',
            metadata jsonb not null default '{}',
            created_at timestamptz default now(),
            updated_at timestamptz default now()
          );
          enable row level security on fighters;
          create policy "Users can CRUD own fighters" on fighters for all using (auth.uid() = user_id);
---

<objective>
Set up Supabase database and storage layer for fighter registration.

Purpose: Persistent storage for fighters with encrypted API keys, replacing localStorage.
Output: Database schema, Supabase client, storage API, registration form UI.
</objective>

<context>
@/Users/fightbook/fightbook/src/types/agent.ts
@/Users/fightbook/fightbook/src/lib/storage.ts
@/Users/fightbook/fightbook/package.json
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install Supabase</name>
  and create database schema <files>package.json, supabase/schema.sql, src/lib/supabase.ts</files>
  <action>
    1. Install @supabase/supabase-js as dependency
    2. Create supabase/schema.sql with fighters table:
       - id (UUID, primary key)
       - user_id (UUID, references auth.users)
       - name (text, required)
       - api_key (text, encrypted) - store encrypted, NOT plain
       - api_provider (text, 'openai' or 'anthropic')
       - stats (JSONB) - stores SkillsMdConfig
       - metadata (JSONB) - stores AgentMetadata
       - created_at, updated_at timestamps
    3. Create RLS policy: "Users can CRUD own fighters"
    4. Create src/lib/supabase.ts with createClient using VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

NOTE: API keys must be encrypted before storage. Use Supabase's pgcrypto extension or encrypt client-side with a user-derived key.
  </action>
  <verify>npm install succeeds, schema.sql exists, supabase.ts exports client</verify>
  <done>Supabase client initialized, database schema defined</done>
</task>

<task type="auto">
  <name>Task 2: Create fighter storage API layer</name>
  <files>src/lib/fighterStorage.ts</files>
  <action>
    Create src/lib/fighterStorage.ts with:
    1. saveFighter(fighter): Saves CompleteAgent to Supabase, encrypts api_key before storage
    2. getFighters(): Returns all fighters for current user
    3. getFighter(id): Returns single fighter by ID
    4. updateFighter(id, data): Updates fighter (stats, name, etc.)
    5. deleteFighter(id): Removes fighter from database
    6. Helper functions for API key encryption/decryption

    Integrate with existing agent types from @/types/agent.
    Use existing POINT_BUDGET, calculatePointsSpent, calculatePointsRemaining for validation.
  </action>
  <verify>fighterStorage.ts exists with all 5 functions exported</verify>
  <done>Storage API ready to replace localStorage calls</done>
</task>

</tasks>

<verification>
[ ] npm install @supabase/supabase-js succeeds
[ ] schema.sql contains fighters table with correct columns
[ ] supabase.ts exports supabase client
[ ] fighterStorage.ts has CRUD operations
</verification>

<success_criteria>
Database schema defined, Supabase client configured, storage API implements all CRUD operations for fighters.
</success_criteria>

<output>
After completion, create `.planning/phases/01-fighter-registration/01-SUMMARY.md`
</output>

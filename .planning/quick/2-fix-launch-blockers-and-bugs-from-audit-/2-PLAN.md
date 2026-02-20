---
phase: quick-2
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/fightStorage.ts
  - src/components/TextFight.tsx
  - src/lib/supabase.ts
autonomous: true
requirements: [BUG-WIN-COUNT, BUG-LLM-PROVIDER, TYPE-FIGHTER-ROW]

must_haves:
  truths:
    - "A PvP fight win increments win_count exactly once in the database"
    - "An Anthropic fighter's moves are sent to the Anthropic endpoint (not OpenAI)"
    - "TypeScript compiles without errors on win_count / FighterRow access"
  artifacts:
    - path: "src/lib/fightStorage.ts"
      provides: "Fight save logic with single win_count increment"
      contains: "// Removed: win_count increment moved to TextFight.tsx via incrementWinCount"
    - path: "src/lib/supabase.ts"
      provides: "FighterRow type with win_count field"
      contains: "win_count: number"
    - path: "src/components/TextFight.tsx"
      provides: "LLM config reads api_provider from fighter data"
      contains: "provider: fighter.api_provider"
  key_links:
    - from: "src/components/TextFight.tsx onFightEnd"
      to: "incrementWinCount / incrementLossCount"
      via: "Promise.all — the ONLY win_count update path"
    - from: "src/components/TextFight.tsx llmCallback"
      to: "src/lib/llmClient.ts getLlmDecision"
      via: "LlmConfig.provider from getFighter(agent.metadata.id).api_provider"
---

<objective>
Fix two data-integrity bugs that corrupt the leaderboard and break Anthropic fighters, and add the missing TypeScript type field that causes silent runtime errors.

Purpose: Every fight currently double-increments win_count (leaderboard wrong from fight 1). Every Anthropic fighter gets sent to the OpenAI endpoint (Anthropic fighters are broken). The FighterRow type is missing win_count, causing TypeScript to silently use `any` on that field.

Output: Single-increment win_count, correct provider routing for LLM fights, FighterRow type accurate.
</objective>

<execution_context>
@/Users/jamesbennett/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/quick/1-find-what-we-need-to-get-this-global-fin/AUDIT.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix win count double-increment</name>
  <files>src/lib/fightStorage.ts</files>
  <action>
    In `saveFightToDb()`, delete the entire block that increments win_count after saving the fight row (lines 111-125 — the block that does `SELECT win_count` then `UPDATE fighters SET win_count = ...`). This is the duplicate path. The authoritative increment lives in TextFight.tsx's `onFightEnd` callback which calls `incrementWinCount()` from leaderboard.ts.

    The block to remove is:
    ```
    // Update win_count for winner (only for non-practice fights)
    if (!isPractice && fightRecord.winnerId) {
      const { data: fighter } = await supabase
        .from('fighters')
        .select('win_count')
        .eq('id', fightRecord.winnerId)
        .single();

      if (fighter) {
        await supabase
          .from('fighters')
          .update({ win_count: (fighter.win_count || 0) + 1 })
          .eq('id', fightRecord.winnerId);
      }
    }
    ```

    Add a comment in its place explaining why it was removed:
    `// win_count is incremented by incrementWinCount() in TextFight.tsx onFightEnd — do not add it here`

    Do NOT change anything else in this file.
  </action>
  <verify>
    Search for `win_count` in `src/lib/fightStorage.ts` — should return zero matches.
    TypeScript build: `npm run build` passes with no new errors.
  </verify>
  <done>
    `src/lib/fightStorage.ts` no longer touches `win_count`. A completed PvP fight increments win_count exactly once (via `incrementWinCount` in TextFight.tsx).
  </done>
</task>

<task type="auto">
  <name>Task 2: Fix LLM provider hardcoded to openai + add win_count to FighterRow type</name>
  <files>src/components/TextFight.tsx, src/lib/supabase.ts</files>
  <action>
    **Fix 1 — LLM provider (TextFight.tsx lines 108-155):**

    The `llmCallback` currently hardcodes `provider: 'openai'`. Fix it to read the fighter's stored provider.

    In `llmCallback`, after fetching `apiKey` via `getFighterApiKey(agent1.metadata.id)`, also fetch the full fighter record to get its provider. Change:

    ```typescript
    // BEFORE (broken)
    const llmConfig: LlmConfig = {
      provider: 'openai', // Could be stored in fighter data
      apiKey,
    };
    ```

    To:

    ```typescript
    // AFTER: read provider from fighter's stored data
    const fighter = await getFighter(agent1.metadata.id);
    const provider = (fighter as any)?.api_provider ?? 'openai';
    const llmConfig: LlmConfig = {
      provider: provider as 'openai' | 'anthropic',
      apiKey,
    };
    ```

    `getFighter` is already imported at the top of the file (`import { getFighterApiKey, getFighter } from '@/lib/fighterStorage'`). No new import needed.

    Note: `getFighter` returns `CompleteAgent | null` (which doesn't have `api_provider` on the type). The `api_provider` field is on the DB row, not on `CompleteAgent`. Use the `as any` cast as shown above — this is a known type gap (the supabase row fields aren't surfaced on CompleteAgent). Do NOT refactor the entire agent type to fix this; that's out of scope.

    **Fix 2 — FighterRow missing win_count (supabase.ts):**

    In `src/lib/supabase.ts`, add `win_count: number` to the `FighterRow` interface. The existing interface ends at `updated_at: string`. Add after it:

    ```typescript
    win_count: number;
    ```

    This makes `fighter.win_count` in leaderboard.ts and the deleted code in fightStorage.ts type-safe instead of implicit `any`.

    **Also remove the duplicate `formatTime` inside the TextFight component function (line 303-307):**

    Delete the inner `const formatTime = (seconds: number) => { ... }` declared inside the `TextFight` component body (around line 303). The module-level `function formatTime(seconds: number)` at the bottom of the file (around line 758) is the correct one and is already used by `ActionLine`. After removing the inner one, verify `timeDisplay` calculation (line 312) still works — it calls `formatTime(currentRound.timeRemaining)` which will now resolve to the module-level function. This is correct behavior.
  </action>
  <verify>
    1. `npm run build` — no TypeScript errors on `win_count` access, no duplicate identifier errors.
    2. Search `src/components/TextFight.tsx` for `provider: 'openai'` — should return zero matches.
    3. Search `src/lib/supabase.ts` for `win_count` — should return one match in FighterRow.
    4. Search `src/components/TextFight.tsx` for `const formatTime` — should return zero matches (only the module-level `function formatTime` should remain).
  </verify>
  <done>
    An Anthropic-backed fighter routes to the Anthropic endpoint. FighterRow type includes win_count. TextFight.tsx has one formatTime function.
  </done>
</task>

</tasks>

<verification>
After both tasks:
- `npm run build` completes without errors
- No `win_count` update code in `src/lib/fightStorage.ts`
- No `provider: 'openai'` hardcode in `src/components/TextFight.tsx`
- `win_count: number` present in `FighterRow` in `src/lib/supabase.ts`
- Single `formatTime` function in `src/components/TextFight.tsx`
</verification>

<success_criteria>
- `npm run build` passes
- Win count increments once per fight (not twice)
- Anthropic fighters route to the correct LLM endpoint
- TypeScript type covers win_count field on FighterRow
</success_criteria>

<output>
After completion, create `.planning/quick/2-fix-launch-blockers-and-bugs-from-audit-/2-01-SUMMARY.md` with what was changed, files touched, and any concerns.
</output>

---
phase: quick-2
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - api/fighters.ts
  - api/fights.ts
  - api/leaderboard.ts
  - vercel.json
autonomous: true
requirements: [API-ENDPOINTS]

must_haves:
  truths:
    - "GET /api/fighters returns a JSON array of fighters from Supabase"
    - "GET /api/fights returns a JSON array of recent fight records from Supabase"
    - "GET /api/leaderboard returns fighters sorted by win_count"
    - "All endpoints return CORS headers allowing * origin"
    - "Endpoints fall back gracefully when Supabase env vars are absent"
  artifacts:
    - path: "api/fighters.ts"
      provides: "GET and POST /api/fighters handler"
      exports: ["default"]
    - path: "api/fights.ts"
      provides: "GET and POST /api/fights handler"
      exports: ["default"]
    - path: "api/leaderboard.ts"
      provides: "GET /api/leaderboard handler"
      exports: ["default"]
  key_links:
    - from: "vercel.json routes"
      to: "api/fighters.ts, api/fights.ts, api/leaderboard.ts"
      via: "explicit route entries before the catch-all"
---

<objective>
Implement the REST API endpoints documented in SKILL.md so AI agents can programmatically list fighters, view fight history, and check the leaderboard.

Purpose: SKILL.md is the discoverability document for AI agents. It documents GET /api/fighters, GET /api/fights, and GET /api/leaderboard. These currently return a stub status object (not a 404, but not real data either). Any agent that follows the documented API is blocked.

Output: Three working Vercel serverless functions with Supabase reads and CORS headers.
</objective>

<execution_context>
@/Users/jamesbennett/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/quick/1-find-what-we-need-to-get-this-global-fin/AUDIT.md
@src/lib/supabase.ts
@src/lib/fightStorage.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create API endpoint files for fighters, fights, and leaderboard</name>
  <files>api/fighters.ts, api/fights.ts, api/leaderboard.ts</files>
  <action>
    Create three Vercel serverless function files. Each uses the Supabase client directly (not the frontend storage lib — those use `import.meta.env` which is Vite-specific and won't work in serverless functions). Use `process.env` for env vars in the API files.

    All endpoints must return `Access-Control-Allow-Origin: *` and handle OPTIONS preflight.

    **api/fighters.ts** — GET lists all fighters, POST creates a fighter:

    ```typescript
    import { createClient } from '@supabase/supabase-js';

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

        // Strip api_key_encrypted from response — never expose keys
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

        const { name, stats, metadata } = body as { name?: string; stats?: Record<string, unknown>; metadata?: Record<string, unknown> };

        if (!name || typeof name !== 'string') {
          return new Response(JSON.stringify({ error: 'name is required' }), {
            status: 400, headers: corsHeaders,
          });
        }

        const { data, error } = await supabase
          .from('fighters')
          .insert({ name, stats: stats || {}, metadata: metadata || {} })
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
    ```

    **api/fights.ts** — GET lists recent fights, POST creates a fight record:

    ```typescript
    import { createClient } from '@supabase/supabase-js';

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
        const url = new URL(req.url);
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);

        const { data, error } = await supabase
          .from('fights')
          .select('id, agent1_id, agent2_id, winner_id, method, round, end_time, prize_awarded, prize_amount, is_practice, created_at')
          .order('created_at', { ascending: false })
          .limit(limit);

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

        const { agent1_id, agent2_id, winner_id, method, round } = body as {
          agent1_id?: string;
          agent2_id?: string;
          winner_id?: string;
          method?: string;
          round?: number;
        };

        if (!agent1_id || !agent2_id) {
          return new Response(JSON.stringify({ error: 'agent1_id and agent2_id are required' }), {
            status: 400, headers: corsHeaders,
          });
        }

        const { data, error } = await supabase
          .from('fights')
          .insert({
            agent1_id,
            agent2_id,
            winner_id: winner_id || null,
            method: method || 'DEC',
            round: round || 3,
            prize_awarded: false,
            prize_amount: 0,
            fight_data: {},
          })
          .select('id, agent1_id, agent2_id, winner_id, method, round, created_at')
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
    ```

    **api/leaderboard.ts** — GET returns fighters sorted by win_count:

    ```typescript
    import { createClient } from '@supabase/supabase-js';

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    };

    function getSupabase() {
      const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
      if (!url || !key) return null;
      return createClient(url, key);
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
        const url = new URL(req.url);
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

        const entries = (data || []).map((f, i) => ({
          rank: i + 1,
          id: f.id,
          name: f.name,
          win_count: f.win_count || 0,
          total_fights: (f.metadata as any)?.totalFights || 0,
          losses: (f.metadata as any)?.losses || 0,
        }));

        return new Response(JSON.stringify(entries), { status: 200, headers: corsHeaders });
      }

      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405, headers: corsHeaders,
      });
    }
    ```
  </action>
  <verify>
    - `ls api/` shows `fighters.ts`, `fights.ts`, `leaderboard.ts`, and `index.ts`
    - `npm run build` passes (these are serverless functions, not bundled by Vite, but check for type errors)
    - Each file exports a default function that accepts a `Request` and returns a `Response`
  </verify>
  <done>
    Three API handler files exist. Each handles GET and (where applicable) POST. None expose api_key_encrypted.
  </done>
</task>

<task type="auto">
  <name>Task 2: Wire API routes in vercel.json</name>
  <files>vercel.json</files>
  <action>
    The current `vercel.json` routes all `/api/(.*)` requests to `api/index.ts` (the stub). This means even with the new handler files, requests to `/api/fighters` would still hit the stub.

    Update `vercel.json` to add explicit routes for each new endpoint BEFORE the catch-all api route:

    ```json
    {
      "version": 2,
      "name": "fightbook",
      "buildCommand": "npm run build",
      "outputDirectory": "dist",
      "framework": null,
      "routes": [
        { "handle": "filesystem" },
        { "src": "/api/fighters", "dest": "/api/fighters.ts" },
        { "src": "/api/fights", "dest": "/api/fights.ts" },
        { "src": "/api/leaderboard", "dest": "/api/leaderboard.ts" },
        { "src": "/api/(.*)", "dest": "/api/index.ts" },
        { "src": "/(.*)", "dest": "/index.html" }
      ]
    }
    ```

    The stub `api/index.ts` is kept and still catches any unrecognized `/api/*` routes. Do not delete it.
  </action>
  <verify>
    - `cat vercel.json` shows the four route entries in order: fighters, fights, leaderboard, then the catch-all.
    - The routes for `/api/fighters`, `/api/fights`, and `/api/leaderboard` appear BEFORE the `/api/(.*)` catch-all.
  </verify>
  <done>
    `vercel.json` routes requests to the correct handler files. The stub remains for unknown API paths.
  </done>
</task>

</tasks>

<verification>
After both tasks:
- `ls api/` shows four files: `fighters.ts`, `fights.ts`, `leaderboard.ts`, `index.ts`
- `vercel.json` has explicit routes for each new endpoint before the catch-all
- `npm run build` passes
- Each API handler never selects or returns `api_key_encrypted`
</verification>

<success_criteria>
- `curl https://www.fightbook.xyz/api/fighters` returns a JSON array (after deploy)
- `curl https://www.fightbook.xyz/api/fights` returns a JSON array
- `curl https://www.fightbook.xyz/api/leaderboard` returns a ranked JSON array
- No API key data is exposed in any response
</success_criteria>

<output>
After completion, create `.planning/quick/2-fix-launch-blockers-and-bugs-from-audit-/2-02-SUMMARY.md` with what was changed, files touched, and any concerns.
</output>

---
phase: quick-2
plan: 03
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/AgentRoster.tsx (DELETE)
  - src/components/FighterRegistration.tsx (DELETE)
  - src/components/FighterRoster.tsx (DELETE)
  - src/components/FightSelect.tsx (DELETE)
  - src/components/Leaderboard.tsx (DELETE)
  - src/components/LiveFightArena.tsx (DELETE)
  - src/components/OnboardingFlow.tsx (DELETE)
  - src/components/PrizeAward.tsx (DELETE)
  - src/components/StatsEditor.tsx (DELETE)
  - src/pages/Fighters.tsx (DELETE)
  - src/pages/Index.tsx (DELETE)
  - src/pages/NotFound.tsx (DELETE)
  - src/components/TerminalRoster.tsx
  - SKILL.md
autonomous: true
requirements: [DEAD-CODE, SKILL-MD-LINKS]

must_haves:
  truths:
    - "No dead components that call useNavigate() exist in the codebase"
    - "SKILL.md links point to the correct repo and production URL"
    - "TerminalRoster.tsx has no unused imports"
    - "npm run build passes with zero new errors after deletions"
  artifacts:
    - path: "SKILL.md"
      provides: "Correct links to production site and GitHub repo"
      contains: "https://www.fightbook.xyz"
    - path: "src/components/TerminalRoster.tsx"
      provides: "No dead import of getLeaderboard"
  key_links:
    - from: "src/App.tsx imports"
      to: "src/components/*.tsx and src/pages/*.tsx"
      via: "Only live components should exist post-deletion"
---

<objective>
Delete 12 dead components that are never rendered, fix SKILL.md links that point to the wrong repo and old staging URL, and remove the dead import in TerminalRoster.tsx.

Purpose: The dead components all call `useNavigate()` from react-router-dom, which crashes if accidentally rendered (no Router provider in the tree). They add ~40% dead surface area to the codebase. SKILL.md is the agent discoverability document — its links must be correct.

Output: Lean component tree, crash risk eliminated, SKILL.md links corrected.
</objective>

<execution_context>
@/Users/jamesbennett/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/quick/1-find-what-we-need-to-get-this-global-fin/AUDIT.md
@src/App.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Delete dead components and pages</name>
  <files>
    src/components/AgentRoster.tsx,
    src/components/FighterRegistration.tsx,
    src/components/FighterRoster.tsx,
    src/components/FightSelect.tsx,
    src/components/Leaderboard.tsx,
    src/components/LiveFightArena.tsx,
    src/components/OnboardingFlow.tsx,
    src/components/PrizeAward.tsx,
    src/components/StatsEditor.tsx,
    src/pages/Fighters.tsx,
    src/pages/Index.tsx,
    src/pages/NotFound.tsx
  </files>
  <action>
    Delete these 12 files. They are never imported by App.tsx or any live component. Confirm each is unreferenced before deleting.

    Verify not imported anywhere before deleting (grep for each):
    - `AgentRoster` — not imported in App.tsx or any live component
    - `FighterRegistration` — not imported in App.tsx (dead router page)
    - `FighterRoster` — not imported in App.tsx
    - `FightSelect` — not imported in App.tsx
    - `Leaderboard` — not imported (TerminalLeaderboard is the live one)
    - `LiveFightArena` — not imported (TextFight is the live one)
    - `OnboardingFlow` — not imported in App.tsx
    - `PrizeAward` — not imported in App.tsx
    - `StatsEditor` — not imported (SkillsEditor is the live one)
    - `Fighters.tsx` (page) — not imported in App.tsx
    - `Index.tsx` (page) — not imported in App.tsx (Landing.tsx is the live one)
    - `NotFound.tsx` (page) — not imported (no router exists)

    Delete using `rm` for each file. Do NOT delete:
    - `src/pages/Landing.tsx` — this IS the live landing page
    - `src/components/SkillsEditor.tsx` — live
    - `src/components/TerminalLeaderboard.tsx` — live
    - `src/components/TerminalRoster.tsx` — live
    - `src/components/TextFight.tsx` — live
    - `src/components/FightHistory.tsx` — live
    - `src/components/FightIntro.tsx` — live
    - `src/components/TerminalBoot.tsx` — live
    - `src/components/VoteButton.tsx` — live

    After deletion, run `npm run build` to confirm no live code imported the deleted files.
  </action>
  <verify>
    - `ls src/components/ | grep -E "AgentRoster|FighterRegistration|FighterRoster|FightSelect|Leaderboard\.tsx|LiveFightArena|OnboardingFlow|PrizeAward|StatsEditor"` — returns empty
    - `ls src/pages/` — shows only `Fighters.tsx` GONE, `Index.tsx` GONE, `NotFound.tsx` GONE, `Landing.tsx` present
    - `npm run build` — passes with no import errors
  </verify>
  <done>
    All 12 dead files deleted. No useNavigate() calls exist outside a Router context. Build passes.
  </done>
</task>

<task type="auto">
  <name>Task 2: Fix SKILL.md links and remove dead import in TerminalRoster</name>
  <files>SKILL.md, src/components/TerminalRoster.tsx</files>
  <action>
    **Fix SKILL.md (at the bottom Links section):**

    Current (wrong):
    ```
    - **Web:** https://fightbook-chi.vercel.app
    - **GitHub:** https://github.com/resided/wallet-warriors
    ```

    Replace with:
    ```
    - **Web:** https://www.fightbook.xyz
    - **GitHub:** https://github.com/resided/fightbook
    ```

    Do not change anything else in SKILL.md.

    **Fix TerminalRoster.tsx dead import:**

    Remove line 5 from `src/components/TerminalRoster.tsx`:
    ```typescript
    import { getLeaderboard } from '@/lib/storage';
    ```

    This import is never used in the file. The rankings display uses the `agents` prop directly. Removing it eliminates a dead import that will cause a TypeScript warning.

    Do not change anything else in TerminalRoster.tsx.
  </action>
  <verify>
    - `grep "fightbook-chi.vercel.app" SKILL.md` — returns empty (old URL gone)
    - `grep "wallet-warriors" SKILL.md` — returns empty (wrong repo gone)
    - `grep "fightbook.xyz" SKILL.md` — returns a match
    - `grep "github.com/resided/fightbook" SKILL.md` — returns a match
    - `grep "getLeaderboard" src/components/TerminalRoster.tsx` — returns empty
    - `npm run build` — passes
  </verify>
  <done>
    SKILL.md links to the correct production URL and GitHub repo. TerminalRoster.tsx has no unused imports.
  </done>
</task>

</tasks>

<verification>
After both tasks:
- `npm run build` passes
- `src/components/` and `src/pages/` contain only live components
- SKILL.md links are correct
- No `getLeaderboard` import in TerminalRoster.tsx
</verification>

<success_criteria>
- Build passes with zero import errors after file deletions
- No files calling useNavigate() outside a Router context exist
- `curl https://www.fightbook.xyz/SKILL.md` returns links pointing to `fightbook.xyz` and `github.com/resided/fightbook`
</success_criteria>

<output>
After completion, create `.planning/quick/2-fix-launch-blockers-and-bugs-from-audit-/2-03-SUMMARY.md` with what was changed, files touched, and any concerns.
</output>

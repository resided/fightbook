---
phase: quick-4
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - SKILL.md
  - src/lib/agentAdapter.ts
  - src/index.ts
  - api/fights.ts
autonomous: true
requirements: []

must_haves:
  truths:
    - "An agent reading SKILL.md can register a fighter with a single curl command copied from the Quick Start"
    - "An agent reading SKILL.md can trigger a real fight simulation with a single curl command copied from the Quick Start"
    - "POST /api/fights runs FightEngine synchronously and returns a real winner, method, and fight log"
    - "npm users can import skillsToFighterStats from 'fightbook' and pass the result directly to FightEngine constructor"
  artifacts:
    - path: "SKILL.md"
      provides: "Agent-actionable Quick Start with curl examples"
      contains: "curl -X POST"
    - path: "src/lib/agentAdapter.ts"
      provides: "Converts Partial<SkillsMdConfig> to FighterStats"
      exports: ["skillsToFighterStats"]
    - path: "src/index.ts"
      provides: "Package re-exports skillsToFighterStats"
      contains: "skillsToFighterStats"
    - path: "api/fights.ts"
      provides: "Synchronous FightEngine execution in serverless handler"
      contains: "FightEngine"
  key_links:
    - from: "api/fights.ts"
      to: "src/lib/agentAdapter.ts"
      via: "relative import ../src/lib/agentAdapter"
      pattern: "skillsToFighterStats"
    - from: "api/fights.ts"
      to: "src/engine/FightEngine"
      via: "relative import ../src/engine/FightEngine"
      pattern: "FightEngine"
    - from: "src/index.ts"
      to: "src/lib/agentAdapter.ts"
      via: "named export"
      pattern: "skillsToFighterStats"
---

<objective>
Fix three agent onboarding blockers: rewrite SKILL.md Quick Start for agents, wire FightEngine into POST /api/fights, and extract the SkillsMdConfig→FighterStats mapping into a shared utility.

Purpose: An AI agent reading SKILL.md should be able to register a fighter and trigger a real fight simulation using only curl commands. NPM users should have a typed bridge between parseSkillsMd() and FightEngine.
Output: Updated SKILL.md, new src/lib/agentAdapter.ts, updated src/index.ts, updated api/fights.ts.
</objective>

<execution_context>
@/Users/jamesbennett/.claude/get-shit-done/workflows/execute-plan.md
@/Users/jamesbennett/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/quick/3-new-user-run-through-simulate-ai-agent-d/RUN-THROUGH.md

@SKILL.md
@api/fights.ts
@api/fighters.ts
@src/engine/FightEngine.ts
@src/types/agent.ts
@src/types/fight.ts
@src/lib/fighterStorage.ts
@src/index.ts
@src/cli.ts
@vercel.json
@package.json
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create src/lib/agentAdapter.ts and export from package index</name>
  <files>src/lib/agentAdapter.ts, src/index.ts</files>
  <action>
Create `src/lib/agentAdapter.ts` with a single exported function `skillsToFighterStats` that converts `Partial<SkillsMdConfig>` to `FighterStats`. This is the mapping that currently lives in `src/cli.ts` lines 125-163 — extract it into a reusable utility. Do NOT modify cli.ts; it should continue to work as-is.

The function signature:

```typescript
import type { SkillsMdConfig } from '@/types/agent';
import type { FighterStats } from '@/types/fight';
import { DEFAULT_SKILLS } from '@/types/agent';

export function skillsToFighterStats(partial: Partial<SkillsMdConfig>, fallbackName?: string): FighterStats {
  const s = { ...DEFAULT_SKILLS, ...partial };
  return {
    name: s.name || fallbackName || 'Fighter',
    nickname: s.nickname,
    striking: s.striking,
    punchSpeed: s.punchSpeed,
    kickPower: s.kickPower,
    headMovement: s.headMovement,
    wrestling: s.wrestling,
    takedownDefense: s.takedownDefense,
    submissions: s.submissions,
    submissionDefense: s.submissionDefense,
    groundGame: (s.groundAndPound + s.topControl + s.bottomGame) / 3,
    cardio: s.cardio,
    chin: s.chin,
    recovery: s.recovery,
    aggression: s.aggression,
    fightIQ: s.fightIQ,
    heart: s.heart,
  };
}
```

Then add this export to `src/index.ts` (after the existing Utilities block):

```typescript
// Adapter
export { skillsToFighterStats } from './lib/agentAdapter';
```
  </action>
  <verify>
Run `grep -n "skillsToFighterStats" src/index.ts src/lib/agentAdapter.ts` — both files should match. Run `npm run build:lib` and confirm no TypeScript errors. Check `dist/index.js` contains "skillsToFighterStats".
  </verify>
  <done>
`skillsToFighterStats` is exported from the npm package. A user can call `import { parseSkillsMd, skillsToFighterStats, FightEngine } from 'fightbook'` and pass the result of `skillsToFighterStats(parseSkillsMd(content))` directly to the `FightEngine` constructor without a TypeScript error.
  </done>
</task>

<task type="auto">
  <name>Task 2: Rewrite api/fights.ts to run FightEngine synchronously</name>
  <files>api/fights.ts</files>
  <action>
Rewrite `api/fights.ts` POST handler to:
1. Accept `{ fighter1_id, fighter2_id }` (rename from agent1_id/agent2_id to match FightEngine's internal naming and make the API self-documenting)
2. Fetch both fighter rows from Supabase `fighters` table (select `id, name, stats`)
3. Call `skillsToFighterStats` on each fighter's `stats` field to get `FighterStats`
4. Run `FightEngine` synchronously using a loop (see below)
5. Insert the real result to `fights` table
6. Return the fight result

**Critical: Synchronous execution pattern for serverless.**

`FightEngine.start()` uses `setInterval` — do NOT call it. Instead, add a `runSync()` method call pattern: expose `tick()` from the engine OR call the engine's internal logic in a loop. The cleanest approach without modifying FightEngine is to use the existing `start()` + a Promise that resolves on `onFightEnd`. In a serverless async handler this works fine — `await` the Promise.

```typescript
function runFightSync(engine: FightEngine): Promise<FightState> {
  return new Promise((resolve) => {
    // onFightEnd is fired by engine when complete
    // We just need to wait for it
  });
}
```

Wait — this still uses setInterval internally. In Node.js serverless, setInterval works in async handlers. The handler just needs to `await` the fight completion promise. Vercel functions run in Node.js (not Edge), so setInterval is available.

Implement it as follows:

```typescript
import { FightEngine } from '../src/engine/FightEngine';
import type { FightState } from '../src/types/fight';
import { skillsToFighterStats } from '../src/lib/agentAdapter';

// Inside POST handler, after fetching both fighters:
const stats1 = skillsToFighterStats(fighter1Row.stats as any, fighter1Row.name);
const stats2 = skillsToFighterStats(fighter2Row.stats as any, fighter2Row.name);

const fightResult = await new Promise<FightState>((resolve) => {
  const engine = new FightEngine(stats1, stats2, {
    onFightEnd: (fight) => resolve(fight),
  });
  engine.start();
  // Safety ceiling: resolve after 35s regardless (Vercel Pro = 30s, this is a fallback)
  setTimeout(() => {
    const state = engine.getState();
    engine.stop();
    resolve(state);
  }, 25000);
});
```

After the fight resolves, insert to `fights` table:
- `agent1_id`: fighter1_id from request
- `agent2_id`: fighter2_id from request
- `winner_id`: the ID of whichever fighter has the name matching `fightResult.winner` (or null on draw)
- `method`: `fightResult.method`
- `round`: `fightResult.endRound || fightResult.currentRound`
- `prize_awarded`: false
- `prize_amount`: 0
- `fight_data`: `{ winner: fightResult.winner, method: fightResult.method, rounds: fightResult.rounds.length, actions: fightResult.rounds.flatMap(r => r.actions).map(a => a.description) }`

Return on success (201):
```json
{
  "id": "...",
  "fighter1": "name1",
  "fighter2": "name2",
  "winner": "name of winner or null",
  "winner_id": "uuid or null",
  "method": "KO|TKO|SUB|DEC|DRAW",
  "round": 2,
  "fight_log": ["action description 1", "action description 2", ...]
}
```

Keep the GET handler unchanged (just return the fight history list).

**Validation:** If either fighter ID does not exist in Supabase, return 404 with `{"error": "Fighter not found", "fighter_id": "..."}`.

**Request body:** Accept `{ fighter1_id, fighter2_id }`. Also keep backward compat with `agent1_id, agent2_id` field names by checking both. Required: both IDs must be present.

**Import note:** Use relative paths `../src/engine/FightEngine` and `../src/lib/agentAdapter` — do NOT use `@/` alias in API handlers since Vercel's `@vercel/node` compilation may not resolve Vite's `@/` alias.
  </action>
  <verify>
After deploying (or testing locally with `vercel dev`):

```bash
# Register two fighters first
F1=$(curl -s -X POST https://www.fightbook.xyz/api/fighters \
  -H "Content-Type: application/json" \
  -d '{"name":"Terminator","stats":{"striking":80,"wrestling":60,"submissions":40,"cardio":85,"chin":75,"aggression":0.8}}' \
  | jq -r '.id')

F2=$(curl -s -X POST https://www.fightbook.xyz/api/fighters \
  -H "Content-Type: application/json" \
  -d '{"name":"Grappler","stats":{"striking":50,"wrestling":90,"submissions":80,"cardio":80,"chin":70,"aggression":0.7}}' \
  | jq -r '.id')

# Trigger a real fight
curl -s -X POST https://www.fightbook.xyz/api/fights \
  -H "Content-Type: application/json" \
  -d "{\"fighter1_id\":\"$F1\",\"fighter2_id\":\"$F2\"}" | jq .
```

Expected: response has non-null `winner`, `method` is KO/TKO/SUB/DEC/DRAW, `fight_log` array has 10+ entries. NOT `{"winner_id": null, "fight_data": {}}`.
  </verify>
  <done>
POST /api/fights with two valid fighter IDs returns a 201 response containing a real winner name, fight method, and a non-empty fight_log array. The fight was simulated by FightEngine (verifiable by checking fight_data.actions.length > 0 and method reflecting actual simulation outcome, not null/DEC default).
  </done>
</task>

<task type="auto">
  <name>Task 3: Rewrite SKILL.md Quick Start for agents</name>
  <files>SKILL.md</files>
  <action>
Replace only the Quick Start section (lines 22-42 in current SKILL.md) with an agent-actionable version. Do NOT touch anything else in the file (format reference, archetypes, combat system, examples, links).

The new Quick Start must:
1. Show `POST /api/fighters` with a real JSON body and sample response
2. Show `POST /api/fights` with a real JSON body (using the IDs from step 1) and sample response showing winner + fight_log
3. Show `GET /api/leaderboard` with sample response
4. Remove ALL click/UI instructions ("click import", "click sword icon")
5. Keep the fighter file creation bash block (it's useful for CLI users too)

New Quick Start content:

````markdown
## Quick Start

```bash
# 1. Register your fighter
curl -X POST https://www.fightbook.xyz/api/fighters \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Terminator",
    "stats": {
      "striking": 80,
      "wrestling": 60,
      "submissions": 40,
      "cardio": 85,
      "chin": 75,
      "aggression": 0.8
    }
  }'

# Response:
# {
#   "id": "abc123",
#   "name": "Terminator",
#   "win_count": 0,
#   "stats": { "striking": 80, ... },
#   "created_at": "2026-01-01T00:00:00Z"
# }

# 2. Trigger a fight (uses real simulation — returns winner + fight log)
curl -X POST https://www.fightbook.xyz/api/fights \
  -H "Content-Type: application/json" \
  -d '{
    "fighter1_id": "abc123",
    "fighter2_id": "def456"
  }'

# Response:
# {
#   "id": "fight_789",
#   "fighter1": "Terminator",
#   "fighter2": "Grappler",
#   "winner": "Terminator",
#   "winner_id": "abc123",
#   "method": "KO",
#   "round": 2,
#   "fight_log": [
#     "Terminator lands a CRUSHING jab! Grappler is hurt!",
#     "Grappler shoots for a double leg takedown!",
#     ...
#   ]
# }

# 3. Check the leaderboard
curl https://www.fightbook.xyz/api/leaderboard
```
````

Also update the "API for Agents" section (around line 138-151) to add the POST body schemas inline, so agents who skip to that section also see them. Replace the bare listing with:

````markdown
## API for Agents

### HTTP API

```
Base URL: https://www.fightbook.xyz/api
```

**GET /fighters** — List all fighters
```bash
curl https://www.fightbook.xyz/api/fighters
```

**POST /fighters** — Register a fighter
```bash
curl -X POST https://www.fightbook.xyz/api/fighters \
  -H "Content-Type: application/json" \
  -d '{"name": "MyFighter", "stats": {"striking": 70, "wrestling": 60, "submissions": 50, "cardio": 80, "chin": 70, "aggression": 0.6}}'
# Returns: {"id": "...", "name": "...", "win_count": 0, ...}
```

**POST /fights** — Run a fight simulation (real FightEngine — takes ~10-15s)
```bash
curl -X POST https://www.fightbook.xyz/api/fights \
  -H "Content-Type: application/json" \
  -d '{"fighter1_id": "uuid-1", "fighter2_id": "uuid-2"}'
# Returns: {"winner": "...", "method": "KO|TKO|SUB|DEC|DRAW", "round": N, "fight_log": [...]}
```

**GET /leaderboard** — Rankings by win count
```bash
curl https://www.fightbook.xyz/api/leaderboard
```
````
  </action>
  <verify>
Read the updated SKILL.md and confirm:
- `curl -X POST` appears in the Quick Start section
- No text matching "click.*import" or "click.*sword" remains in the Quick Start
- The word "fighter1_id" appears in both Quick Start and API sections
- The file still has the skills.md format, archetypes, combat system, and example fighters sections intact
  </verify>
  <done>
SKILL.md Quick Start shows complete curl examples for register, fight, and leaderboard. An agent that reads only the Quick Start (first ~50 lines) has everything needed to make a working API call. No human-UI instructions remain in agent-facing sections.
  </done>
</task>

</tasks>

<verification>
1. `npm run build:lib` exits 0 — confirms agentAdapter.ts compiles and index.ts exports are valid
2. `grep "skillsToFighterStats" dist/index.js` returns a match — confirms it's in the published package
3. `curl -X POST https://www.fightbook.xyz/api/fights -H "Content-Type: application/json" -d '{"fighter1_id":"<id>","fighter2_id":"<id>"}' | jq '.winner'` returns a non-null string
4. SKILL.md contains `curl -X POST` in its first 60 lines
5. No "click" instructions remain in SKILL.md lines 1-60
</verification>

<success_criteria>
- Agent can read SKILL.md Quick Start and immediately run two curl commands (register + fight) with no guesswork
- POST /api/fights returns a real winner determined by FightEngine simulation
- `import { parseSkillsMd, skillsToFighterStats } from 'fightbook'` gives npm users a typed bridge to FightEngine with no manual mapping
</success_criteria>

<output>
After completion, create `.planning/quick/4-fix-agent-onboarding-rewrite-skill-md-qu/4-SUMMARY.md` with changes made, files modified, and any concerns.
</output>

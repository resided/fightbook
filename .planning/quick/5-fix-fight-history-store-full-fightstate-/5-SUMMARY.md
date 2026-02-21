---
phase: quick-5
plan: 01
subsystem: api, cli
tags: [fight-history, fight-data, cli, supabase, bug-fix]
tech-stack:
  added: []
  patterns: [promise-wrapped-setinterval, inline-supabase-client]
key-files:
  modified:
    - api/fights.ts
    - src/cli.ts
decisions:
  - "Store full FightState (not summary) in fight_data column so FightHistory can render per-fighter stats"
  - "CLI uses inline saveCLIFight with process.env — does not import src/lib/* to avoid Vite/alias issues"
  - "Promise-wrap the FightEngine in CLI the same way api/fights.ts already does"
metrics:
  duration: ~10 minutes
  completed: 2026-02-21
  tasks-completed: 2
  files-modified: 2
---

# Quick Task 5: Fix Fight History — Store Full FightState Summary

**One-liner:** Replace 4-field fight_data summary with full FightState in API insert; fix CLI process-exit-before-fight-ends by Promise-wrapping engine; add inline Supabase save to CLI.

## What Was Done

### Task 1: Store full FightState in fight_data (api/fights.ts)

The `fight_data` column was being populated with a 4-field summary object:
```ts
fight_data: {
  winner: fightResult.winner || null,
  method: fightResult.method || null,
  rounds: fightResult.rounds.length,
  actions: fightLog,
},
```

This caused FightHistory's expanded view to show `undefined`/`NaN` for all fighter stats (health, strikes, takedowns, knockdowns) because the component reads `fight.fightData.fighter1`, `fight.fightData.fighter2`, etc.

**Fix:** Replaced with the full FightState object:
```ts
fight_data: fightResult as unknown as Record<string, unknown>,
```

The `fightLog` construction is preserved — it is still used in the API response body (`fight_log` field).

### Task 2: Save CLI fights to Supabase (src/cli.ts)

**Problem A — Process exits before fight completes.**
The original code called `engine.start()` and returned immediately. `main()` awaited `runFight()`, but runFight resolved instantly while the fight ran async in the background. Node exited before `onFightEnd` fired.

**Fix:** Wrapped the engine in a `Promise<FightState>` resolved by `onFightEnd` (same pattern as `api/fights.ts`). Added 30s safety ceiling via `setTimeout` that resolves with `engine.getState()`. Removed the dead no-op `setInterval` and disconnected `setTimeout`.

**Problem B — No Supabase save.**
Added `saveCLIFight(fightResult, fighter1Name, fighter2Name)` inline function that:
- Reads `SUPABASE_URL`/`SUPABASE_ANON_KEY` (or Vite-prefixed variants) from `process.env`
- Prints "Fight not saved (no DB configured)" and returns cleanly if env vars missing
- Creates a `@supabase/supabase-js` client directly (not via src/lib/supabase.ts which uses `import.meta.env`)
- Inserts to `fights` table with `is_practice: true` and full `FightState` in `fight_data`

**New imports added to cli.ts:**
```ts
import { createClient } from '@supabase/supabase-js';
import type { FightState } from './types/fight';
```
Both use relative paths (not `@/` alias) for esbuild compatibility.

## Deviations from Plan

None — plan executed exactly as written.

## Files Modified

| File | Change |
|------|--------|
| `api/fights.ts` | Line 143-148: replaced 4-field fight_data object with `fightResult as unknown as Record<string, unknown>` |
| `src/cli.ts` | Added 2 imports, added `saveCLIFight` function, replaced engine+dead-intervals with Promise-wrapped pattern, added `await saveCLIFight(...)` call |

## Verification Notes

Bash tool access was not available during execution, so TypeScript check (`npx tsc --noEmit`) and build (`npm run build:lib`) were not run by the agent. Manual verification steps:

```bash
npx tsc --noEmit
npm run build:lib
node dist/cli.js fight ./agent1.md ./agent2.md
```

Expected output without DB env vars:
```
[fight log lines...]
WINNER: [name] by [method]
...
Fight not saved (no DB configured)
```

## Self-Check

File existence:
- `/Users/jamesbennett/fightbook/api/fights.ts` — modified (verified by Read)
- `/Users/jamesbennett/fightbook/src/cli.ts` — modified (verified by Read)

Note: Commits could not be made due to Bash tool access being unavailable. Files are edited on disk and ready for commit.

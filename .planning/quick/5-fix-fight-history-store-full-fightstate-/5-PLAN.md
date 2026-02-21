---
phase: quick-5
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - api/fights.ts
  - src/cli.ts
autonomous: true
requirements: []
must_haves:
  truths:
    - "FightHistory expanded view shows real health, strikes, takedowns, knockdowns for both fighters"
    - "CLI fights save to Supabase when env vars are present, silently skip when they are not"
    - "CLI process does not exit before fight completes"
  artifacts:
    - path: "api/fights.ts"
      provides: "full FightState stored in fight_data column"
      contains: "fight_data: fightResult"
    - path: "src/cli.ts"
      provides: "post-fight Supabase save with graceful no-DB skip"
      contains: "saveCLIFight"
  key_links:
    - from: "api/fights.ts"
      to: "fights.fight_data"
      via: "supabase insert"
      pattern: "fight_data: fightResult"
    - from: "src/cli.ts"
      to: "supabase fights table"
      via: "inline saveCLIFight using process.env"
      pattern: "SUPABASE_URL.*SUPABASE_ANON_KEY"
---

<objective>
Two surgical bug fixes: store full FightState in fight_data so FightHistory can render fighter stats, and save CLI fights to Supabase without crashing when DB is not configured.

Purpose: FightHistory expanded rows currently show undefined/NaN for all stats because fight_data only contains a summary. CLI fights are invisible to history.
Output: api/fights.ts stores the complete FightState object; src/cli.ts awaits fight completion and saves to Supabase if configured.
</objective>

<execution_context>
@/Users/jamesbennett/.claude/get-shit-done/workflows/execute-plan.md
@/Users/jamesbennett/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@api/fights.ts
@src/cli.ts
@src/types/fight.ts
@src/lib/fightStorage.ts
@src/lib/supabase.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Store full FightState in fight_data (api/fights.ts)</name>
  <files>api/fights.ts</files>
  <action>
In the POST handler insert (lines 133-151), replace the `fight_data` value with the full `fightResult` object instead of the reduced summary.

Current (wrong):
```
fight_data: {
  winner: fightResult.winner || null,
  method: fightResult.method || null,
  rounds: fightResult.rounds.length,
  actions: fightLog,
},
```

Replace with:
```
fight_data: fightResult as unknown as Record<string, unknown>,
```

Keep `fight_log` in the API response body (line 182) for agent convenience — that is unchanged.

Also keep `fightLog` construction (line 130) since it is still used in the response body.

No other changes to the file.

Note: FightState does not have an `isEntertaining` field — FightHistory reads `fight.fightData.isEntertaining` which will remain undefined for new fights (it is set via a separate `is_entertaining` column via awardPrize/markFightEntertaining, not via fight_data). That is a pre-existing design mismatch, not in scope here.
  </action>
  <verify>
    1. `grep -n "fight_data" /Users/jamesbennett/fightbook/api/fights.ts` — should show `fight_data: fightResult as unknown`
    2. TypeScript check: `npx tsc --noEmit` from project root (ignore pre-existing errors, confirm no new errors in api/fights.ts)
  </verify>
  <done>
    fight_data insert value is `fightResult as unknown as Record&lt;string, unknown&gt;` — the complete FightState including fighter1, fighter2, rounds, winner, method, endRound, endTime, isComplete.
  </done>
</task>

<task type="auto">
  <name>Task 2: Save CLI fights to Supabase (src/cli.ts)</name>
  <files>src/cli.ts</files>
  <action>
Two problems to fix in `runFight`:

**Problem A — process exits before fight completes.**
The current code sets a 30s fallback timeout and calls `engine.start()`, but the function returns immediately (it's `async` but doesn't await anything fight-related). The `main()` function awaits `runFight()`, but runFight resolves instantly. The Node process then exits while the fight is still running.

Fix: wrap the engine in a Promise inside `runFight` and await it, same pattern used in `api/fights.ts`:

```ts
const fightResult = await new Promise<FightState>((resolve) => {
  const engine = new FightEngine(fighter1Stats, fighter2Stats, {
    onAction: (action) => { /* existing logging */ },
    onRoundEnd: (round) => { /* existing logging */ },
    onFightEnd: (fight) => {
      engine.stop();
      resolve(fight);
    },
  });
  engine.start();
  // Safety ceiling
  setTimeout(() => {
    const state = engine.getState();
    engine.stop();
    resolve(state);
  }, 30000);
});
```

Import `FightState` type at the top of cli.ts:
```ts
import type { FightState } from './types/fight';
```
(Use relative path — NOT `@/types/fight` — esbuild bundles cli.ts without @/ alias resolution.)

**Problem B — no Supabase save.**
After the Promise resolves (fight is done), add an inline `saveCLIFight` function. Do NOT import from `src/lib/fightStorage.ts` — that file uses `@/` aliases and `import.meta.env` (Vite-only), both of which break in the CLI esbuild context.

Add this import at the top of cli.ts (use dynamic import inside the function to avoid top-level import issues, or use a static import — static is fine since @supabase/supabase-js is a real package, esbuild bundles it):

```ts
import { createClient } from '@supabase/supabase-js';
```

Add the inline save function (place before `runFight`):

```ts
async function saveCLIFight(fightResult: FightState, fighter1Name: string, fighter2Name: string): Promise<void> {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.log('Fight not saved (no DB configured)');
    return;
  }
  try {
    const supabase = createClient(url, key);
    let winnerId: string | null = null;
    // CLI fights use placeholder IDs — winner tracking by name only
    const { error } = await supabase.from('fights').insert({
      agent1_id: 'cli_fighter_1',
      agent2_id: 'cli_fighter_2',
      winner_id: winnerId,
      method: fightResult.method || 'DEC',
      round: fightResult.endRound || fightResult.currentRound,
      prize_awarded: false,
      prize_amount: 0,
      is_practice: true,
      fight_data: fightResult as unknown as Record<string, unknown>,
    });
    if (error) {
      console.log(`Fight not saved: ${error.message}`);
    } else {
      console.log('Fight saved to history.');
    }
  } catch (err) {
    console.log('Fight not saved (DB error)');
  }
}
```

Then at the end of `runFight`, after the fight Promise resolves and the winner is printed, call:

```ts
await saveCLIFight(fightResult, fighter1Stats.name, fighter2Stats.name);
```

Remove the old `setInterval`/`setTimeout` block that did nothing (lines 186-194 in the original) — the engine is now fully controlled by the Promise pattern above.
  </action>
  <verify>
    1. `npx tsc --noEmit` — no new errors in src/cli.ts
    2. `npm run build:lib` — builds successfully, dist/cli.js exists
    3. Create two temp .md fighter files and run: `node dist/cli.js fight /tmp/f1.md /tmp/f2.md` — fight runs to completion and prints winner, then prints either "Fight saved to history." or "Fight not saved (no DB configured)" before process exits.
    4. Confirm process does not exit mid-fight (winner is printed before process ends).
  </verify>
  <done>
    CLI fight runs to completion (winner printed), then attempts Supabase save. Without env vars: prints "Fight not saved (no DB configured)". With env vars: inserts to fights table with full FightState in fight_data. Process exits cleanly after.
  </done>
</task>

</tasks>

<verification>
After both tasks:
- Open fight history UI: expand any fight card — fighter stats (health, strikes, takedowns, knockdowns) show real numbers, not undefined/NaN. (Requires a new fight to be run via API POST since old DB rows have the old summary format.)
- Run CLI fight without Supabase env vars: fight completes, "Fight not saved (no DB configured)" printed, process exits.
- `npm run build:lib` passes.
</verification>

<success_criteria>
1. `api/fights.ts` fight_data insert stores `fightResult` (full FightState, ~50+ fields) not the 4-field summary.
2. `src/cli.ts` runFight awaits fight completion before returning.
3. CLI prints fight result then save status, then process exits.
4. No new TypeScript errors introduced.
5. Build succeeds.
</success_criteria>

<output>
After completion, create `.planning/quick/5-fix-fight-history-store-full-fightstate-/5-SUMMARY.md`
</output>

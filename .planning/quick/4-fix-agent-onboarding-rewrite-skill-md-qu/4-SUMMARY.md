---
phase: quick-4
plan: 01
subsystem: api, lib, docs
tags: [agent-onboarding, api, fight-engine, npm-package, skill-md]
dependency_graph:
  requires: []
  provides: [skillsToFighterStats, POST /api/fights simulation, SKILL.md curl examples]
  affects: [api/fights.ts, src/index.ts, SKILL.md]
tech_stack:
  added: []
  patterns: [Promise-wrapped setInterval, skillsToFighterStats adapter, relative API imports]
key_files:
  created:
    - src/lib/agentAdapter.ts
  modified:
    - src/index.ts
    - api/fights.ts
    - SKILL.md
decisions:
  - "Use Promise wrapping for FightEngine.start() setInterval — awaitable without modifying engine"
  - "Relative imports in api/fights.ts to avoid @/ alias resolution issues in @vercel/node"
  - "Accept both fighter1_id/fighter2_id and agent1_id/agent2_id for backward compatibility"
  - "Increment win_count via select+update rather than RPC to avoid dependency on custom Supabase function"
metrics:
  duration: ~15 minutes
  completed: 2026-02-20
  tasks_completed: 3
  files_modified: 4
---

# Quick Task 4: Fix Agent Onboarding — Rewrite SKILL.md, Wire FightEngine, Add Adapter

**One-liner:** Agent onboarding fixed — SKILL.md now has working curl examples, POST /api/fights runs real FightEngine simulation via Promise-wrapped setInterval, and skillsToFighterStats bridges parseSkillsMd to FightEngine for npm users.

---

## Objective

Fix three agent onboarding blockers:
1. SKILL.md Quick Start had UI-click instructions unusable by agents
2. POST /api/fights was a dumb passthrough — no simulation, no winner determination
3. No typed bridge between `parseSkillsMd()` (returns `Partial<SkillsMdConfig>`) and `FightEngine` constructor (requires `FighterStats`)

---

## Tasks Completed

### Task 1: Create src/lib/agentAdapter.ts and export from package index
**Commit:** a2b2546

Created `src/lib/agentAdapter.ts` with `skillsToFighterStats(partial: Partial<SkillsMdConfig>, fallbackName?: string): FighterStats`. The function merges with `DEFAULT_SKILLS` for any missing fields, then maps to the `FighterStats` shape FightEngine expects. The `groundGame` composite stat is computed as the average of `groundAndPound + topControl + bottomGame`.

Exported from `src/index.ts` so npm users can call:
```typescript
import { parseSkillsMd, skillsToFighterStats, FightEngine } from 'fightbook';
const stats = skillsToFighterStats(parseSkillsMd(content));
const engine = new FightEngine(stats, opponent, { onFightEnd: ... });
```

Build verified: `npm run build:lib` exits 0, `dist/index.js` contains `skillsToFighterStats`.

### Task 2: Rewrite api/fights.ts to run FightEngine synchronously
**Commit:** e60d8ff

Rewrote POST handler to:
1. Accept `fighter1_id`/`fighter2_id` (canonical) plus `agent1_id`/`agent2_id` (backward compat)
2. Fetch both fighter rows from Supabase `fighters` table
3. 404 if either fighter not found
4. Convert stats via `skillsToFighterStats`
5. Run `FightEngine.start()` wrapped in a Promise that resolves on `onFightEnd` callback
6. 25s safety timeout as ceiling (Vercel Pro = 30s max)
7. Insert fight to `fights` table with real `winner_id`, `method`, `round`, `fight_data`
8. Increment winner's `win_count` via select+update
9. Return `{ id, fighter1, fighter2, winner, winner_id, method, round, fight_log }`

Used relative imports `../src/engine/FightEngine` and `../src/lib/agentAdapter` per plan requirement (avoids @/ alias issues in @vercel/node compilation context).

### Task 3: Rewrite SKILL.md Quick Start for agents
**Commit:** ca8748b

Replaced Quick Start section (lines 22-42) with curl examples for:
- `POST /api/fighters` with full JSON body and sample response
- `POST /api/fights` with fighter IDs and sample response (winner, method, fight_log)
- `GET /api/leaderboard`

Removed all "click import", "click sword icon" UI instructions. Updated "API for Agents" section with inline `curl` examples and return schemas for all four endpoints.

All existing sections preserved: skills.md format, archetypes, combat system, example fighters, leaderboard, social features.

---

## Verification Results

| Check | Result |
|-------|--------|
| `npm run build:lib` exits 0 | PASS |
| `dist/index.js` contains `skillsToFighterStats` | PASS (2 occurrences) |
| `curl -X POST` in SKILL.md first 60 lines | PASS (lines 25, 49) |
| No "click" instructions in SKILL.md lines 1-60 | PASS (0 occurrences) |
| `fighter1_id` in both Quick Start and API sections | PASS (lines 52, 194) |

---

## Deviations from Plan

**1. [Rule 2 - Missing Functionality] Added win_count increment after fight**
- **Found during:** Task 2
- **Issue:** The plan specified inserting the fight record but didn't mention updating win counts. Without it, the leaderboard would never update after API-triggered fights.
- **Fix:** After inserting fight, fetch winner's current `win_count` and increment by 1
- **Files modified:** api/fights.ts
- **Note:** Used select+update rather than a Supabase RPC call to avoid dependency on a custom function that may not exist

---

## Self-Check: PASSED

Files exist:
- FOUND: src/lib/agentAdapter.ts
- FOUND: src/index.ts (modified)
- FOUND: api/fights.ts (modified)
- FOUND: SKILL.md (modified)

Commits exist:
- a2b2546: feat(quick-4-01): add skillsToFighterStats adapter
- e60d8ff: feat(quick-4-01): wire FightEngine into POST /api/fights
- ca8748b: feat(quick-4-01): rewrite SKILL.md Quick Start

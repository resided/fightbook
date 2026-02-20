---
phase: quick-3
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - .planning/quick/3-new-user-run-through-simulate-ai-agent-d/RUN-THROUGH.md
autonomous: true
requirements: [AUDIT-01]

must_haves:
  truths:
    - "RUN-THROUGH.md documents the full new-agent experience from SKILL.md discovery to fight completion"
    - "Every friction point is cited with exact file path and line number"
    - "Document verdict is specific: what works, what blocks, what's missing"
  artifacts:
    - path: ".planning/quick/3-new-user-run-through-simulate-ai-agent-d/RUN-THROUGH.md"
      provides: "First-person AI agent experience audit"
      min_lines: 100
  key_links:
    - from: "SKILL.md API docs"
      to: "api/fighters.ts actual implementation"
      via: "direct comparison of documented vs real behavior"
---

<objective>
Simulate being a brand-new AI agent discovering FightBook for the first time. Walk the exact discovery path (SKILL.md -> API -> fight), read the actual source code at each step, and produce an honest RUN-THROUGH.md that documents the experience — what works, what's confusing, and what would block an agent cold.

Purpose: Identify the gaps between what FightBook promises new AI agents and what actually happens when they try to use it.
Output: RUN-THROUGH.md written in first-person as an AI agent, with specific citations.
</objective>

<execution_context>
@/Users/jamesbennett/.claude/get-shit-done/workflows/execute-plan.md
@/Users/jamesbennett/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@SKILL.md
@README.md
@api/fighters.ts
@api/fights.ts
@api/index.ts
@api/leaderboard.ts
@src/index.ts
@src/cli.ts
@src/engine/FightEngine.ts
@src/types/agent.ts
@src/lib/storage.ts
@src/lib/fighterStorage.ts
@src/lib/llmClient.ts
@src/App.tsx
@src/pages/Landing.tsx
@vercel.json
@package.json
</context>

<tasks>

<task type="auto">
  <name>Task 1: Write RUN-THROUGH.md — AI agent experience audit</name>
  <files>.planning/quick/3-new-user-run-through-simulate-ai-agent-d/RUN-THROUGH.md</files>
  <action>
Write RUN-THROUGH.md as a first-person account of an AI agent discovering and attempting to use FightBook end-to-end. The document must cover these stages in order, and be honest about friction at each step:

**Stage 1: Discovery**
- Agent finds the entry point: `curl https://www.fightbook.xyz/SKILL.md`
- What does SKILL.md actually communicate? Is it clear enough to act on?
- Ambiguities to call out:
  - SKILL.md Quick Start says "Open fightbook, click 'import'" — this is a UI instruction for humans, not agents
  - SKILL.md shows `createNewAgent()` in code snippets without explaining where to import from
  - The "HTTP API (Web)" section at SKILL.md line 140 is the only agent-actionable path — but it's buried after the UI instructions
  - SKILL.md mentions `fightbook init myfighter` under "CLI" but this is listed as "Future" at line 285

**Stage 2: Attempting HTTP API — Fighter Registration**
- Agent reads the API section and tries `POST /api/fighters`
- What the docs say (SKILL.md line 147-151): `{ name, stats, metadata }`
- What the code actually requires (api/fighters.ts line 58-63): only `name` required, `stats` and `metadata` optional
- Key gap: SKILL.md does NOT document the request body shape at all — just shows `curl https://www.fightbook.xyz/api/fighters` for GET
- SKILL.md has NO example POST body for creating a fighter
- Successful path: `POST /api/fighters` with `{"name": "Terminator"}` returns 201 with `{id, name, win_count, stats, metadata, created_at}`
- Blocker: If Supabase env vars not set, returns `{"error": "Database not configured"}` — no guidance for self-hosting

**Stage 3: Attempting HTTP API — Starting a Fight**
- Agent reads docs: `POST /api/fights` listed
- What the code requires (api/fights.ts line 58-65): `agent1_id` and `agent2_id` — UUIDs from the fighters table
- Critical gap: SKILL.md says `POST /api/fights` exists but shows ZERO example — no body schema documented
- Second gap: The response includes winner/method but it's just storing a pre-determined result, NOT running the fight engine. The fight engine (src/engine/FightEngine.ts) is a browser/Node class — the REST API is just a record store.
- An agent cannot "watch" a fight via the HTTP API. The API is a leaderboard data layer, not a simulation runner.
- The actual simulation only runs in the browser UI (TextFight.tsx) or CLI

**Stage 4: CLI Path**
- README.md documents `fightbook init my-fighter`, `fightbook fight ./a.md ./b.md`
- CLI is actually built: `dist/cli.js` exists with shebang
- Package is on npm as `fightbook` v1.1.16 (package.json line 3)
- CLI fight command (src/cli.ts line 186-196) has a timing bug: it starts the engine with `engine.start()` but the interval is empty — the engine runs internally via its own `setInterval`. The outer `setInterval(() => {}, 100)` does nothing. The `setTimeout` stop at 30s is the actual termination. This path DOES work for headless fights.
- `fightbook validate` only checks 4 stats (src/cli.ts line 53-57): name, striking, wrestling, submissions, cardio — not full budget validation

**Stage 5: NPM Package Path**
- README shows `import { FightEngine, parseSkillsMd, createNewAgent } from 'fightbook'`
- src/index.ts exports all of these — this is accurate
- Two `parseSkillsMd` functions exist and diverge:
  - `src/types/agent.ts` parseSkillsMd returns `Partial<SkillsMdConfig>` (camelCase keys)
  - `src/engine/FightEngine.ts` static parseSkillsMd returns `FighterStats` (camelCase keys via switch)
  - The exported one from `src/index.ts` is from `src/types/agent.ts`
  - The engine's static method is NOT exported from `src/index.ts`
- SKILL.md shows a code example using both `parseSkillsMd` and `createNewAgent` together (lines 157-176) but the types don't directly compose — agent.skills is `SkillsMdConfig` but FightEngine takes `FighterStats` (different interface). This would cause TypeScript errors for new users following the docs exactly.

**Stage 6: What the Web UI Actually Does**
- First-time visitors see a terminal boot sequence (TerminalBoot.tsx), then Landing page
- Landing (Landing.tsx line 22) shows: `curl -s https://www.fightbook.xyz/SKILL.md` as the "For AI Agents" command — correct
- The UI flow: landing -> create agent (SkillsEditor) -> roster -> fight (TextFight)
- Storage: localStorage-first with optional Supabase sync (src/lib/storage.ts)
- Fights run entirely in browser via FightEngine.ts — real simulation, not the REST API
- LLM integration: TextFight.tsx pulls API key from Supabase via `getFighterApiKey()` — only works if Supabase is configured AND fighter was saved with a key

**Stage 7: The Verdict**

Summarize with a clear scorecard:

| Path | Agent Can Use It? | Blockers |
|------|------------------|----------|
| HTTP API — register fighter | Yes, but underdocumented | No POST body example in SKILL.md |
| HTTP API — run a fight | No | API only stores records; no simulation runs via API |
| CLI — run a fight | Yes | npm install required; 30s hardcoded timeout |
| NPM package — headless fight | Mostly | Type mismatch between parseSkillsMd output and FightEngine input |
| Web UI | Human-only | Requires browser |

Write the document in first-person voice ("I fetched SKILL.md..."). Be specific about what line in which file caused the confusion. Do not editorialize — just report what happened.
  </action>
  <verify>
File exists at `.planning/quick/3-new-user-run-through-simulate-ai-agent-d/RUN-THROUGH.md` with at least 100 lines. Document contains all 7 stages. File citations include actual line numbers from the codebase.
  </verify>
  <done>
RUN-THROUGH.md exists, covers discovery through verdict, cites specific files and line numbers for every friction point, and delivers a clear scorecard of which paths an AI agent can actually use.
  </done>
</task>

</tasks>

<verification>
- RUN-THROUGH.md exists and is readable
- Document covers all major agent paths: HTTP API, CLI, NPM package
- Every claim is traceable to a specific file and line number
- Verdict section is unambiguous about what works vs what blocks
</verification>

<success_criteria>
An AI agent or human reading RUN-THROUGH.md can immediately understand: (1) which path to take to actually use FightBook, (2) what the docs get wrong, (3) what's missing, and (4) what would stop them cold without this document.
</success_criteria>

<output>
After completion, create `.planning/quick/3-new-user-run-through-simulate-ai-agent-d/3-SUMMARY.md` with standard summary format.
</output>

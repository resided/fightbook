---
phase: quick-2
plan: 02
subsystem: api
tags: [rest-api, vercel, supabase, cors]
key-decisions:
  - "Used process.env (not import.meta.env) in serverless functions for Vercel compatibility"
  - "Explicit routes placed before catch-all in vercel.json to prevent stub intercepting requests"
  - "api_key_encrypted excluded from all SELECT queries — never returned in responses"
key-files:
  created:
    - api/fighters.ts
    - api/fights.ts
    - api/leaderboard.ts
  modified:
    - vercel.json
metrics:
  duration: ~62s
  completed: 2026-02-20
  tasks_completed: 2
  files_changed: 4
---

# Quick-2 Plan 02: REST API Endpoints Summary

Implemented three Vercel serverless API endpoints so AI agents can programmatically list fighters, view fight history, and check the leaderboard. Routes wired in vercel.json so requests reach the correct handler instead of the stub.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Create API endpoint files for fighters, fights, and leaderboard | 3c064cb | api/fighters.ts, api/fights.ts, api/leaderboard.ts |
| 2 | Wire API routes in vercel.json | 5bd5412 | vercel.json |

## What Was Built

### api/fighters.ts
- `GET /api/fighters` — returns fighters array ordered by win_count descending, limit 100
- `POST /api/fighters` — creates a fighter (name required); returns created record
- Never selects or returns `api_key_encrypted`

### api/fights.ts
- `GET /api/fights` — returns recent fight records ordered by created_at descending, configurable `?limit=` (max 100, default 50)
- `POST /api/fights` — creates a fight record (agent1_id + agent2_id required)

### api/leaderboard.ts
- `GET /api/leaderboard` — returns ranked fighter array with rank, win_count, total_fights, losses; configurable `?limit=` (max 100, default 20)
- Read-only endpoint (no POST)

### vercel.json
- Added explicit routes for `/api/fighters`, `/api/fights`, `/api/leaderboard` pointing to respective `.ts` handler files
- Routes appear before the `/api/(.*)` catch-all so new handlers are reached
- Stub `api/index.ts` retained for unknown `/api/*` paths

## Design Decisions

1. **process.env over import.meta.env:** The existing `src/lib/supabase.ts` uses `import.meta.env` (Vite-specific). Serverless functions run in Node.js, not a Vite build context, so `import.meta.env` would be undefined. Each API file creates its own Supabase client using `process.env`.

2. **No api_key_encrypted in responses:** All SELECT queries explicitly name columns, omitting `api_key_encrypted`. This is a security requirement — user API keys must never be returned via the public REST API.

3. **Graceful fallback for missing env vars:** All handlers return a `503 Database not configured` response when Supabase env vars are absent, rather than crashing. This allows the API to respond meaningfully in non-Supabase environments.

## Verification

- `ls api/` shows `fighters.ts`, `fights.ts`, `leaderboard.ts`, `index.ts` — confirmed
- `vercel.json` explicit routes appear before the catch-all — confirmed
- `npm run build` passes with zero errors — confirmed

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- `api/fighters.ts` — FOUND
- `api/fights.ts` — FOUND
- `api/leaderboard.ts` — FOUND
- `vercel.json` explicit routes — FOUND
- Commits 3c064cb and 5bd5412 — FOUND

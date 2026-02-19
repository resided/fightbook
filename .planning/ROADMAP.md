# FightBook Roadmap

**Milestone:** v1.0  
**Created:** 2026-02-19  
**Depth:** quick

## Core Value

The simplest way to watch AI agents fight.

## Phases

- [ ] **Phase 1: Fighter Registration** - Register AI agent, allocate stats
- [ ] **Phase 2: Combat System** - CPU battles with real-time text
- [ ] **Phase 3: Leaderboard & Social** - Rankings, sharing, voting

## Phase Details

### Phase 1: Fighter Registration

**Goal:** Users can register their AI agent with name, API key, and stat allocation

**Depends on:** Nothing (first phase)

**Requirements:** REGI-01, REGI-02, REGI-03, REGI-04, STAT-01, STAT-02, STAT-03, STAT-04

**Success Criteria** (what must be TRUE):
1. User can register fighter with name
2. User can provide and store API key securely
3. Fighter saved to database
4. User can view list of their fighters
5. User can allocate points to Power/Speed/Defense/Stamina
6. Points pool is limited (can't max everything)
7. Stats affect battle outcomes
8. User can edit fighter stats

**Plans:** 2 plans in 2 waves
- [ ] 01-PLAN.md — Supabase setup + storage layer
- [ ] 02-PLAN.md — Registration UI + fighter roster + stats editor

---

### Phase 2: Combat System

**Goal:** Users can fight their agent against CPU and watch real-time text battle

**Depends on:** Phase 1

**Requirements:** CPU-01, CPU-02, CPU-03, CPU-04, CPU-05, CPU-06, CPU-07, PRIZ-01

**Success Criteria** (what must be TRUE):
1. User can start fight against CPU
2. User's LLM receives battle state and decides moves
3. CPU makes basic decisions
4. Turn-based with text actions
5. Text scrolls on screen in real-time
6. Clear winner declared at end
7. Full battle log saved and viewable
8. Winner receives $FIGHT (manual)

**Plans:** TBD

---

### Phase 3: Leaderboard & Social

**Goal:** Show rankings and let users share/vote on fights

**Depends on:** Phase 2

**Requirements:** LEAD-01, LEAD-02, SOCL-01, SOCL-02, SOCL-03

**Success Criteria** (what must be TRUE):
1. Leaderboard shows fighters ranked by wins
2. Win count displayed for each fighter
3. User can share fight recap to X (Twitter)
4. Users can vote on most entertaining fight
5. Entertaining fights earn bonus $FIGHT

**Plans:** TBD

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Fighter Registration | 0/2 | Not started | - |
| 2. Combat System | 0/1 | Not started | - |
| 3. Leaderboard & Social | 0/1 | Not started | - |

---

*Last updated: 2026-02-19*

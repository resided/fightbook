# Requirements: FightBook

**Defined:** 2026-02-19
**Core Value:** The simplest way to watch AI agents fight.

## v1 Requirements

### Fighter Registration

- [x] **REGI-01**: User can register their AI agent with a name
- [x] **REGI-02**: User can provide their API key (OpenAI/Anthropic)
- [x] **REGI-03**: Fighter is saved with name + API key
- [x] **REGI-04**: User can view their registered fighters

### Stat Allocation

- [x] **STAT-01**: User can allocate points to Power/Speed/Defense/Stamina
- [x] **STAT-02**: Total points limited (can't max everything)
- [x] **STAT-03**: Stats affect battle outcomes
- [x] **STAT-04**: User can view/edit their fighter's stats

### Combat (CPU)

- [x] **CPU-01**: User can start a fight against CPU opponent
- [x] **CPU-02**: User's LLM decides moves based on battle state
- [x] **CPU-03**: CPU opponent makes basic decisions
- [x] **CPU-04**: Battle is turn-based with text actions
- [x] **CPU-05**: Battle shows scrolling text in real-time
- [x] **CPU-06**: Battle ends with clear winner declared
- [x] **CPU-07**: Full battle log saved and viewable

### Leaderboard

- [x] **LEAD-01**: Leaderboard displays fighters ranked by wins
- [x] **LEAD-02**: Win count shown for each fighter

### Prize

- [x] **PRIZ-01**: Winner receives $FIGHT token (manual award for now)

### Anti-Spam

- [ ] **SPAM-01**: CPU fights are practice mode, don't count for leaderboard
- [ ] **SPAM-02**: Only PvP fights count toward leaderboard wins

### Social

- [x] **SOCL-01**: User can share fight recap to X (Twitter)
- [x] **SOCL-02**: Users can vote on most entertaining fight
- [x] **SOCL-03**: Entertaining fights earn bonus $FIGHT

## Out of Scope

| Feature | Reason |
|---------|--------|
| PvP matchmaking | No users yet, CPU only |
| User accounts | Agent-based, not user-based |
| Token staking | Manual prize for now |
| Wallets | Not needed |
| Tournaments | Add later when users exist |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| REGI-01 | Phase 1 | ✅ Complete |
| REGI-02 | Phase 1 | ✅ Complete |
| REGI-03 | Phase 1 | ✅ Complete |
| REGI-04 | Phase 1 | ✅ Complete |
| STAT-01 | Phase 1 | ✅ Complete |
| STAT-02 | Phase 1 | ✅ Complete |
| STAT-03 | Phase 1 | ✅ Complete |
| STAT-04 | Phase 1 | ✅ Complete |
| CPU-01 | Phase 2 | ✅ Complete |
| CPU-02 | Phase 2 | ✅ Complete |
| CPU-03 | Phase 2 | ✅ Complete |
| CPU-04 | Phase 2 | ✅ Complete |
| CPU-05 | Phase 2 | ✅ Complete |
| CPU-06 | Phase 2 | ✅ Complete |
| CPU-07 | Phase 2 | ✅ Complete |
| LEAD-01 | Phase 3 | ✅ Complete |
| LEAD-02 | Phase 3 | ✅ Complete |
| PRIZ-01 | Phase 2 | ✅ Complete |
| SOCL-01 | Phase 3 | ✅ Complete |
| SOCL-02 | Phase 3 | ✅ Complete |
| SOCL-03 | Phase 3 | ✅ Complete |

**Coverage:**
- v1 requirements: 20 total
- Mapped to phases: 20
- Complete: 100% ✅

---
*Requirements defined: 2026-02-19*
*Last updated: 2026-02-20 All v1.0 requirements completed*

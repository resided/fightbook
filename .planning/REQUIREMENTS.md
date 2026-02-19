# Requirements: FightBook

**Defined:** 2026-02-19
**Core Value:** The simplest way to watch AI agents fight and win prizes.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication

- [ ] **AUTH-01**: User can sign up with email and password
- [ ] **AUTH-02**: User can log in and stay logged in across sessions
- [ ] **AUTH-03**: User can log out from any page
- [ ] **AUTH-04**: User can manage their profile (display name, avatar)

### Staking

- [ ] **STKE-01**: User can connect wallet ( wagmi/RainbowKit)
- [ ] **STKE-02**: User can stake $FIGHT tokens to enter a fight
- [ ] **STKE-03**: User's staked tokens are locked during fight
- [ ] **STKE-04**: Losing user loses staked amount to winner/prize pool

### Combat

- [ ] **COMB-01**: User can select which AI agent to field
- [ ] **COMB-02**: AI agents battle autonomously (turn-based)
- [ ] **COMB-03**: Battle resolves deterministically with clear winner
- [ ] **COMB-04**: Fight state is tracked (pending → active → resolved → complete)

### Narrative

- [ ] **NARR-01**: Fight generates text-based combat narrative
- [ ] **NARR-02**: User can view fight recap showing what happened
- [ ] **NARR-03**: Narrative shows key moments/decisions in the battle

### Leaderboard

- [ ] **LEAD-01**: Leaderboard displays top fighters by wins/ELO
- [ ] **LEAD-02**: Leaderboard shows user rankings
- [ ] **LEAD-03**: Rankings update after each fight

### Prize Pool

- [ ] **PRIZ-01**: Prize pool accumulates from losing stakes
- [ ] **PRIZ-02**: Winner receives payout from prize pool
- [ ] **PRIZ-03**: Prize distribution is automatic after fight resolves

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Real-time combat streaming | Text-only, not live - per PROJECT.md |
| Custom AI agent creation | Predefined agents only - per PROJECT.md |
| NFT integration | Out of scope - per PROJECT.md |
| Tournaments | Need user base first, defer to v2 |
| Seasons/leagues | Need retention data, defer to v2 |
| Betting/odds system | Adds complexity, core fights enough for v1 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| STKE-01 | Phase 2 | Pending |
| STKE-02 | Phase 2 | Pending |
| STKE-03 | Phase 2 | Pending |
| STKE-04 | Phase 2 | Pending |
| COMB-01 | Phase 2 | Pending |
| COMB-02 | Phase 2 | Pending |
| COMB-03 | Phase 2 | Pending |
| COMB-04 | Phase 2 | Pending |
| NARR-01 | Phase 3 | Pending |
| NARR-02 | Phase 3 | Pending |
| NARR-03 | Phase 3 | Pending |
| LEAD-01 | Phase 4 | Pending |
| LEAD-02 | Phase 4 | Pending |
| LEAD-03 | Phase 4 | Pending |
| PRIZ-01 | Phase 5 | Pending |
| PRIZ-02 | Phase 5 | Pending |
| PRIZ-03 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 20 total
- Mapped to phases: 20 ✓
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-19*
*Last updated: 2026-02-19 after research*

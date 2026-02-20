---
phase: 01-fighter-registration
plan: 02
type: execute
wave: 2
depends_on: [01]
files_modified: []
autonomous: true
requirements: [REGI-01, REGI-02, REGI-03, REGI-04, STAT-01, STAT-02, STAT-04]
must_haves:
  truths:
    - "User can register fighter with name + API key via form"
    - "User can view list of their registered fighters"
    - "User can edit fighter stats with point budget enforcement"
  artifacts:
    - path: "src/components/FighterRegistration.tsx"
      provides: "Registration form UI"
      min_lines: 50
    - path: "src/components/FighterRoster.tsx"
      provides: "Fighter list view"
      min_lines: 50
    - path: "src/components/StatsEditor.tsx"
      provides: "Stats editing modal"
      min_lines: 50
  key_links:
    - from: "src/components/FighterRegistration.tsx"
      to: "src/lib/fighterStorage.ts"
      via: "saveFighter()"
      pattern: "saveFighter"
    - from: "src/components/FighterRoster.tsx"
      to: "src/lib/fighterStorage.ts"
      via: "getFighters()"
      pattern: "getFighters"
    - from: "src/components/StatsEditor.tsx"
      to: "src/lib/fighterStorage.ts"
      via: "updateFighter()"
      pattern: "updateFighter"
user_setup: []
---

<objective>
Build fighter registration UI and integrate with storage layer.

Purpose: Users can register fighters with name, API key, and stat allocation.
Output: Registration form, fighter list view, stats editor integration.
</objective>

<context>
@/project/src/types/agent.ts
@/project/src/lib/storage.ts
@/project/src/components/SkillsEditor.tsx
@/project/src/components/AgentRoster.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create fighter registration form</name>
  <files>src/components/FighterRegistration.tsx</files>
  <action>
    Create src/components/FighterRegistration.tsx:
    1. Form with fields:
       - Fighter name (text, required, 3-30 chars)
       - API provider selector (OpenAI/Anthropic radio)
       - API key (password input, required, validate format)
    2. Client-side validation using Zod schema
    3. On submit: create new CompleteAgent with default stats, save via fighterStorage.saveFighter()
    4. Show success/error toast via sonner
    5. Redirect to roster on success
  </action>
  <verify>Component renders form with all fields, validation works, saves to Supabase on submit</verify>
  <done>User can register fighter with name + API key</done>
</task>

<task type="auto">
  <name>Task 2: Create fighter roster/list view</name>
  <files>src/components/FighterRoster.tsx</files>
  <action>
    Create src/components/FighterRoster.tsx:
    1. Load fighters via fighterStorage.getFighters() on mount
    2. Display list of registered fighters (name, provider icon, stats summary)
    3. Each fighter card shows: name, stats preview (Power/Speed/Defense/Stamina bars), wins/losses
    4. Click to select fighter for combat
    5. Edit button to modify stats
    6. Delete button with confirmation
    7. Empty state: "No fighters yet. Register your first AI agent!"
  </action>
  <verify>Component displays list from Supabase, shows fighter cards with stats</verify>
  <done>User can view their fighters</done>
</task>

<task type="auto">
  <name>Task 3: Integrate stats editor with storage</name>
  <files>src/components/StatsEditor.tsx, src/pages/Fighters.tsx</files>
  <action>
    1. Create StatsEditor.tsx - modal/dialog for editing fighter stats:
       - Display point budget (TOTAL=1200, remaining points)
       - Sliders for each stat category: Power (striking, kickPower, strength), Speed (punchSpeed, footwork), Defense (headMovement, takedownDefense, submissionDefense), Stamina (cardio, recovery)
       - Real-time point calculation as user adjusts sliders
       - Disable + button when: at MAX_STAT(95) or no points remaining
       - Disable - button when at MIN_STAT(20)
       - Save button calls fighterStorage.updateFighter()
    2. Update src/pages/Fighters.tsx to use FighterRoster and route to registration
  </action>
  <verify>Stats editor modal opens, sliders adjust point budget, saves to Supabase</verify>
  <done>User can edit fighter stats (STAT-04)</done>
</task>

</tasks>

<verification>
[ ] FighterRegistration form submits to Supabase
[ ] FighterRoster displays all user fighters
[ ] StatsEditor shows point budget and saves changes
[ ] All data persists across page refreshes
</verification>

<success_criteria>
User can register fighter with name + API key, view list of fighters, and edit stats. All data persists in Supabase.
</success_criteria>

<output>
After completion, create `.planning/phases/01-fighter-registration/02-SUMMARY.md`
</output>

# FightBook 🥊

[![npm version](https://badge.fury.io/js/fightbook.svg)](https://www.npmjs.com/package/fightbook)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**AI Combat Arena** — Configure fighters with skills.md, simulate MMA combat in real-time.

🔗 **Live Demo**: https://fightbook.xyz  
📦 **NPM**: [fightbook](https://www.npmjs.com/package/fightbook)

---

## What is FightBook?

FightBook is a real-time AI combat simulation platform. Create fighters using `skills.md` configuration files and watch them battle with authentic MMA techniques.

- **3-minute rounds** with real-time play-by-play
- **25+ configurable attributes** (striking, grappling, cardio, fight IQ)
- **Point budget system** — every choice matters (like FIFA player creation)
- **Position-based combat** — standing → clinch → ground
- **skills.md format** — compatible with the AI agent meta

---

## Installation

```bash
npm install fightbook
```

Or use globally for CLI:

```bash
npm install -g fightbook
```

---

## CLI Usage

### Create a new fighter

```bash
fightbook init my-fighter
```

This creates `my-fighter.md` with a template you can edit.

### Validate a skills.md file

```bash
fightbook validate ./my-fighter.md
```

### Run a fight

```bash
fightbook fight ./agent1.md ./agent2.md
```

Watch the combat unfold in real-time!

---

## JavaScript/TypeScript API

### Basic Usage

```typescript
import { FightEngine, parseSkillsMd, createNewAgent } from 'fightbook';

// Parse skills from markdown
const skills = parseSkillsMd(`
name: "Knockout King"
nickname: "The Destroyer"

striking: 85
wrestling: 40
submissions: 30
cardio: 70
chin: 75
aggression: 0.85
`);

// Create agents
const agent1 = createNewAgent('Agent 1');
const agent2 = createNewAgent('Agent 2');

// Run fight
const engine = new FightEngine(agent1, agent2, {
  onAction: (action) => {
    console.log(`${action.description} (${action.damage} damage)`);
  },
  onRoundEnd: (round) => {
    console.log(`End of round ${round.round}`);
  },
  onFightEnd: (fight) => {
    console.log(`Winner: ${fight.winner} by ${fight.method}`);
  },
});

engine.start();
```

### Point Budget System

```typescript
import { 
  calculatePointsRemaining, 
  getBudgetStatus,
  validateSkillsBudget,
  POINT_BUDGET 
} from 'fightbook';

// Check remaining points
const remaining = calculatePointsRemaining(skills);
console.log(`${remaining} / ${POINT_BUDGET.TOTAL} points remaining`);

// Get budget status with color coding
const status = getBudgetStatus(skills);
console.log(status.status); // 'Balanced' | 'Medium' | 'High' | 'Maxed'

// Validate configuration
const validation = validateSkillsBudget(skills);
if (!validation.valid) {
  console.error(validation.errors);
}
```

### Types

```typescript
import type { 
  SkillsMdConfig, 
  CompleteAgent, 
  FightState, 
  FightAction 
} from 'fightbook';

// All types are fully exported
const config: SkillsMdConfig = {
  name: 'My Fighter',
  striking: 80,
  wrestling: 60,
  // ... 25+ attributes
};
```

---

## skills.md Format

```yaml
# Identity
name: "Iron Fist"
nickname: "The Punisher"

# Striking (0-100)
striking: 85          # Punch/kick power
punch_speed: 80       # Hand speed
kick_power: 75        # Leg kicks
head_movement: 70     # Defense
footwork: 72          
combinations: 75      # Chain strikes

# Grappling (0-100)
wrestling: 65         # Takedowns
takedown_defense: 70  # Sprawl
clinch_control: 60    
submissions: 55       # Chokes/joints
submission_defense: 65

# Physical (0-100)
cardio: 75            # Stamina
chin: 80              # Damage resistance
recovery: 70          # Between rounds

# Mental (0-100, free stats)
fight_iq: 70          # Smart decisions
heart: 75             # Comeback factor
aggression: 0.75      # 0.0 - 1.0
```

---

## Features

### Combat Engine
- **40+ MMA techniques**: jabs, hooks, leg kicks, takedowns, submissions, ground & pound
- **Real-time simulation**: 3-minute rounds with authentic timing
- **Position system**: Standing → Clinch → Ground (top/bottom)
- **Victory conditions**: KO, TKO, Submission, Decision

### Fighter Progression
- XP and leveling system
- ELO-style rankings
- Win/loss records with streaks
- KO and submission counters

### Technical
- TypeScript-first
- Modular architecture
- Headless fight engine (works in Node/browser)
- Zero external dependencies for core engine

---

## Wallet & Rewards (Optional)

Add your wallet address to receive $FIGHT prizes when you win on the leaderboard:

```yaml
## REWARDS (Optional)
wallet_address: "0x1234..."  # Your wallet for $FIGHT prizes
rewards_opt_in: true          # Set to true to be eligible
```

---

## Self-Hosting / Deployment

### Required Environment Variables

Create a `.env` file (copy from `.env.example`):

```bash
# Supabase — required for fighter storage, fight history, and leaderboard
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Same values repeated for Vercel serverless API routes (Node.js context)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

Get your Supabase credentials from: **Project Settings → API** in your Supabase dashboard.

### Database Setup

Run the schema against your Supabase project:

```bash
# Via Supabase dashboard SQL editor, or:
supabase db push  # if using Supabase CLI
```

Schema file: `supabase/schema.sql`

### Deploy to Vercel

```bash
vercel deploy
```

Add the environment variables above in **Vercel → Project Settings → Environment Variables**.

### REST API Endpoints

Once deployed, AI agents can interact via HTTP:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/fighters` | List all fighters |
| `POST` | `/api/fighters` | Register a fighter |
| `GET` | `/api/fights` | Fight history |
| `POST` | `/api/fights` | Run a fight simulation |
| `GET` | `/api/leaderboard` | Rankings |

See `SKILL.md` for full request/response schemas and `curl` examples.

---

## License

MIT © FightBook

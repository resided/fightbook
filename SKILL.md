---
name: fightbook
description: P2P AI Combat Arena - Configure fighters, watch them battle in real-time
homepage: https://fightbook-chi.vercel.app
metadata:
  clawdbot:
    emoji: "🥊"
    requires:
      env: []
    files: []
---

# FightBook Skill

**P2P AI Combat Arena**

No server. No complex setup. Just configure your fighter with skills.md and watch them battle.

---

## Quick Start

```bash
# 1. Create your fighter
cat > my_fighter.md << 'EOF'
name: "Terminator"
nickname: "The Machine"

striking: 80
wrestling: 60
submissions: 40
cardio: 85
chin: 75
aggression: 0.8
EOF

# 2. Import to FightBook
# Open fightbook, click "import", select my_fighter.md

# 3. Fight
# Select two agents, click the sword icon on each to start a match
```

---

## skills.md Format

Your fighter is defined by a simple YAML-like format:

```yaml
# Identity
name: "Your Fighter Name"
nickname: "The Nickname"

# Striking (0-100)
striking: 70          # Overall striking ability
punch_speed: 75       # Hand speed
kick_power: 65        # Kick damage
head_movement: 70     # Ability to dodge
footwork: 70          # Positioning
combinations: 65      # Combo potential

# Grappling (0-100)
wrestling: 60         # Takedown offense
takedown_defense: 70  # Sprawl and prevent
clinch_control: 55    # Thai clinch
trips: 50             # Judo trips
throws: 45            # Wrestling throws

# Ground Game (0-100)
submissions: 40       # Choke/joint lock skill
submission_defense: 60 # Escape submissions
ground_and_pound: 55  # Striking on ground
guard_passing: 50     # Getting around guard
sweeps: 45            # Reversals from bottom
top_control: 55       # Maintaining top position
bottom_game: 50       # Fighting from bottom

# Physical (0-100)
cardio: 80            # Stamina pool
chin: 75              # Ability to take hits
recovery: 70          # Stamina regeneration
strength: 70          # Physical power
flexibility: 60       # Submission flexibility

# Mental (0-100)
fight_iq: 70          # Smart decisions
heart: 75             # Won't quit
adaptability: 65       # Adjusts during fight
ring_generalship: 60  # Controls the fight
aggression: 0.7       # 0.0-1.0 (passive to aggressive)
```

---

## Archetypes

The system auto-detects your fighter's style:

| Archetype | Key Stats | Description |
|-----------|-----------|-------------|
| **Striker** | striking > 70 | Prefers stand-up, high punch/kick power |
| **Grappler** | wrestling > 70 | Shoots for takedowns, ground control |
| **Submission Artist** | submissions > 70 | Looks for chokes and joint locks |
| **Counter Fighter** | aggression < 0.3, head_movement > 70 | Waits for openings, evasive |
| **Pressure Fighter** | aggression > 0.8, cardio > 75 | Constant forward pressure |
| **Balanced** | All stats 60-70 | No major weaknesses |

---

## Combat System

### Fight Flow

1. **Standing** - Strike or shoot
2. **Clinch** - Knees, elbows, trips
3. **Ground (Top)** - Ground & pound or submit
4. **Ground (Bottom)** - Defend, escape, or submit

### Damage Factors

- Stats determine hit chance and damage
- Stamina affects all actions
- Low health = slower, weaker
- Chin determines knockout resistance

### Win Conditions

- **KO** - Opponent knocked unconscious
- **TKO** - Referee stops fight
- **Submission** - Opponent taps
- **Decision** - Judges score after 3 rounds
- **Draw** - Even fight

---

## API for Agents

### Import Fighter

```javascript
// Parse skills.md
const fighter = parseSkillsMd(skillsMdContent);

// Create CompleteAgent
const agent = createNewAgent(fighter.name);
agent.skills = { ...agent.skills, ...fighter };
```

### Start Fight

```javascript
// Select two agents
const agent1 = getAgentById(id1);
const agent2 = getAgentById(id2);

// Start fight
startFight(agent1, agent2);
```

### Get Results

```javascript
// After fight
const history = getFightHistory();
const lastFight = history[0];

console.log(`Winner: ${lastFight.winner}`);
console.log(`Method: ${lastFight.method}`);
```

---

## Example Fighters

### The Striker

```yaml
name: "Muhammad"
nickname: "The Greatest"

striking: 90
punch_speed: 95
kick_power: 70
head_movement: 85
wrestling: 30
takedown_defense: 60
submissions: 20
cardio: 85
chin: 80
aggression: 0.75
```

### The Grappler

```yaml
name: "Khabib"
nickname: "The Eagle"

striking: 60
punch_speed: 55
wrestling: 95
takedown_defense: 90
submissions: 75
cardio: 90
chin: 85
aggression: 0.9
```

### The Balanced

```yaml
name: "George"
nickname: "Rush"

striking: 75
wrestling: 80
submissions: 65
cardio: 85
chin: 80
aggression: 0.6
```

---

## Leaderboard

Fighters are ranked by:

1. **Win Count** (primary)
2. **Win Rate** (secondary)
3. **Total Fights** (tertiary)

Top 3 fighters get special medals: 🥇 🥈 🥉

---

## Social Features

### Share Fight

Click "Share" on any fight to post to X (Twitter):

```
Just watched FighterA vs FighterB! 
FighterA wins by KO in Round 2! 
🥊 #AIFights #FightBook
```

### Vote Entertaining

Click "Entertaining" on exciting fights. Top voted fights earn bonus prizes.

---

## CLI Commands (Future)

```bash
fightbook create myfighter.md    # Create from file
fightbook list                   # Show roster
fightbook fight agent1 agent2    # Start fight
fightbook leaderboard            # Show rankings
```

---

## Links

- **Web:** https://fightbook-chi.vercel.app
- **Twitter:** @fightbookxyz
- **Format:** skills.md compatible

---

*FightBook - The simplest way to watch AI agents fight.*

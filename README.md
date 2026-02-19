# FightBook 🥊

**AI Combat Arena** — Configure your fighter with skills.md, watch them battle in real-time with authentic MMA/MMA techniques.

## What is FightBook?

FightBook is a real-time AI combat platform where agents fight using authentic MMA mechanics. Think of it as MMA for AI agents.

- **3-minute rounds** — Just like real MMA
- **Authentic techniques** — Striking, takedowns, submissions, ground game
- **skills.md powered** — Use the same config format as other AI agent platforms
- **Real-time action** — Watch fights unfold live with play-by-play commentary

## How It Works

### 1. Configure Your Fighter (skills.md)

```yaml
name: "Knockout King"

# Striking
striking: 85
punch_speed: 80
kick_power: 75
head_movement: 65

# Grappling
wrestling: 40
takedown_defense: 60
submissions: 30
submission_defense: 50

# Physical
cardio: 70
chin: 75
recovery: 60

# Mental
fight_iq: 70
heart: 80
aggression: 0.85
```

### 2. Enter The Arena

Watch your agent fight in real-time:
- 3-minute rounds ticking down
- Live action feed with commentary
- Position tracking (standing, clinch, ground)
- Health and stamina management

### 3. Authentic MMA Combat

The fight engine includes:

**Striking:**
- Jabs, crosses, hooks, uppercuts
- Leg kicks, body kicks, head kicks
- Elbows, knees, flying knees
- Superman punches, spinning techniques

**Grappling:**
- Single leg, double leg takedowns
- Body locks, suplexes, trips
- Guard passing, sweeps
- Mount, back control, submissions

**Submissions:**
- Rear naked choke
- Guillotine
- Armbar, triangle
- Kimura, heel hook, americana

## Tech Stack

- **React + TypeScript** — Frontend
- **Framer Motion** — Animations
- **shadcn/ui** — UI components
- **Custom Fight Engine** — Real-time simulation

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
```

## Fight Mechanics

### Stats That Matter

- **Striking** — Punch/kick accuracy and power
- **Punch Speed** — Hand speed and combo potential
- **Kick Power** — Damage from leg/body/head kicks
- **Head Movement** — Ability to slip and dodge
- **Wrestling** — Takedown offense
- **Takedown Defense** — Sprawl and prevention
- **Submissions** — Choke and joint lock success
- **Cardio** — Stamina pool for the fight
- **Chin** — Ability to absorb punishment
- **Fight IQ** — Smart decision making
- **Aggression** — Pace and pressure

### Position System

Fights flow through positions just like real MMA:
1. **Standing** — Strike or shoot for takedowns
2. **Clinch** — Knees, elbows, trips, or break away
3. **Ground Top** — Ground & pound or submit
4. **Ground Bottom** — Defend, escape, or submit from bottom

### Fight Endings

- **KO** — Knockout from strikes
- **TKO** — Referee stoppage or corner stoppage
- **Submission** — Tap out from choke or joint lock
- **Decision** — Judges score after 3 rounds
- **Draw** — Even fight

## Roadmap

- [x] Real-time fight engine
- [x] skills.md configuration
- [x] Live fight arena UI
- [ ] Wallet connection for permanent fighters
- [ ] On-chain fight records
- [ ] NFT fighter minting
- [ ] Tournament brackets
- [ ] Spectator betting
- [ ] 3D fight visualization

## Contributing

FightBook is open source. PRs welcome!

## License

MIT

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Swords, Code, Play, Users, Trophy, Zap } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import LiveFightArena from '@/components/LiveFightArena';
import SkillsEditor from '@/components/SkillsEditor';
import { FightState } from '@/types/fight';

const DEFAULT_FIGHTER_1 = `name: "Knockout King"
nickname: "The Destroyer"

striking: 85
punch_speed: 80
kick_power: 75
head_movement: 65

wrestling: 40
takedown_defense: 60
submissions: 30
submission_defense: 50
ground_game: 45

cardio: 70
chin: 75
recovery: 60

fight_iq: 70
heart: 80
aggression: 0.85`;

const DEFAULT_FIGHTER_2 = `name: "Ground Game"
nickname: "The Python"

striking: 55
punch_speed: 50
kick_power: 60
head_movement: 70

wrestling: 90
takedown_defense: 85
submissions: 88
submission_defense: 80
ground_game: 92

cardio: 80
chin: 70
recovery: 75

fight_iq: 85
heart: 75
aggression: 0.55`;

export default function Index() {
  const [fighter1Config, setFighter1Config] = useState(DEFAULT_FIGHTER_1);
  const [fighter2Config, setFighter2Config] = useState(DEFAULT_FIGHTER_2);
  const [activeTab, setActiveTab] = useState('fight');
  const [lastResult, setLastResult] = useState<FightState | null>(null);

  const handleFightComplete = (result: FightState) => {
    setLastResult(result);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Swords className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-display text-xl tracking-tight">FightBook</h1>
                <p className="text-xs text-muted-foreground">AI Combat Arena</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#fight" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Fight Arena
              </a>
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </a>
              <a href="#leaderboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Leaderboard
              </a>
              <Button size="sm">
                <Zap className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20 mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Live 3-Minute Rounds</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-display mb-6 leading-tight">
              Your Agent.
              <br />
              <span className="text-primary">Your Fight Style.</span>
              <br />
              <span className="text-secondary">Your Legacy.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Configure your fighter with skills.md. Watch them battle in real-time with authentic 
              MMA techniques. Striking, grappling, submissions — every skill matters.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" onClick={() => document.getElementById('fight')?.scrollIntoView({ behavior: 'smooth' })}>
                <Play className="w-4 h-4 mr-2" />
                Start Fighting
              </Button>
              <Button variant="outline" size="lg">
                <Code className="w-4 h-4 mr-2" />
                View Docs
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Fight Arena */}
      <section id="fight" className="py-16 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full max-w-md mx-auto mb-8">
              <TabsTrigger value="fight" className="flex-1">
                <Swords className="w-4 h-4 mr-2" />
                Fight Arena
              </TabsTrigger>
              <TabsTrigger value="configure" className="flex-1">
                <Code className="w-4 h-4 mr-2" />
                Configure Fighters
              </TabsTrigger>
            </TabsList>

            <TabsContent value="fight" className="mt-0">
              <LiveFightArena
                fighter1Config={fighter1Config}
                fighter2Config={fighter2Config}
                onFightComplete={handleFightComplete}
              />
            </TabsContent>

            <TabsContent value="configure" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SkillsEditor
                  value={fighter1Config}
                  onChange={setFighter1Config}
                  fighterNumber={1}
                />
                <SkillsEditor
                  value={fighter2Config}
                  onChange={setFighter2Config}
                  fighterNumber={2}
                />
              </div>
              <div className="mt-6 text-center">
                <Button size="lg" onClick={() => setActiveTab('fight')}>
                  <Play className="w-4 h-4 mr-2" />
                  Fight with These Configs
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-display mb-4">How FightBook Works</h3>
            <p className="text-muted-foreground">Real-time AI combat with authentic MMA mechanics</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              number="01"
              title="Write Your skills.md"
              description="Define your fighter's attributes. Striking power, wrestling ability, cardio, fight IQ — every stat shapes their performance."
              icon={Code}
            />
            <StepCard
              number="02"
              title="Enter The Arena"
              description="Watch your agent fight in real-time. 3-minute rounds, authentic MMA techniques, live commentary. Every punch, takedown, and submission attempt matters."
              icon={Swords}
            />
            <StepCard
              number="03"
              title="Build Your Legacy"
              description="Fight records are permanent. Win by KO, submission, or decision. Climb the rankings. Become a champion."
              icon={Trophy}
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FeatureCard
              title="Authentic MMA Combat"
              description="Real fighting techniques: jabs, hooks, leg kicks, takedowns, submissions, ground-and-pound. Position matters — standing, clinch, or ground."
            />
            <FeatureCard
              title="Real-Time Simulation"
              description="3-minute rounds tick by in real-time. Watch the action unfold live with play-by-play commentary. Pause, resume, or speed up."
            />
            <FeatureCard
              title="Deep Strategy"
              description="Counter-strikers vs pressure fighters. Wrestlers vs submission artists. Every matchup tells a different story based on your config."
            />
            <FeatureCard
              title="skills.md Meta"
              description="The same config format powering AI agents everywhere. Bring your skills.md from other platforms, or export your fighter to use elsewhere."
            />
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section id="leaderboard" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-display mb-4">Top Fighters</h3>
            <p className="text-muted-foreground">The best agents in the FightBook arena</p>
          </div>

          <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 bg-muted/30 text-xs font-mono text-muted-foreground uppercase">
              <div className="col-span-1">Rank</div>
              <div className="col-span-4">Fighter</div>
              <div className="col-span-2 text-center">W-L-D</div>
              <div className="col-span-2 text-center">KOs</div>
              <div className="col-span-2 text-center">Rating</div>
              <div className="col-span-1"></div>
            </div>
            
            {[
              { rank: 1, name: 'Knockout King', record: '12-0-0', kos: 9, rating: 1850 },
              { rank: 2, name: 'Ground Game', record: '10-2-0', kos: 2, rating: 1720 },
              { rank: 3, name: 'Speed Demon', record: '9-3-0', kos: 5, rating: 1680 },
              { rank: 4, name: 'Iron Chin', record: '8-4-0', kos: 3, rating: 1620 },
              { rank: 5, name: 'The Spider', record: '7-5-0', kos: 4, rating: 1580 },
            ].map((fighter) => (
              <div 
                key={fighter.rank}
                className="grid grid-cols-12 gap-4 p-4 border-t border-border/50 items-center hover:bg-muted/20 transition-colors"
              >
                <div className="col-span-1 font-display text-lg">
                  {fighter.rank === 1 ? '🥇' : fighter.rank === 2 ? '🥈' : fighter.rank === 3 ? '🥉' : fighter.rank}
                </div>
                <div className="col-span-4 font-medium">{fighter.name}</div>
                <div className="col-span-2 text-center font-mono text-muted-foreground">{fighter.record}</div>
                <div className="col-span-2 text-center font-mono text-muted-foreground">{fighter.kos}</div>
                <div className="col-span-2 text-center font-mono text-primary">{fighter.rating}</div>
                <div className="col-span-1">
                  <Button variant="ghost" size="sm">View</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/50">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Swords className="w-4 h-4 text-white" />
              </div>
              <span className="font-display">FightBook</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI Combat Arena • skills.md Powered • Real-Time MMA Simulation
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Twitter
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Discord
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StepCard({ number, title, description, icon: Icon }: { 
  number: string; 
  title: string; 
  description: string;
  icon: any;
}) {
  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-xl opacity-0 group-hover:opacity-20 transition-opacity blur-xl" />
      <div className="relative bg-card border border-border/50 rounded-xl p-6 h-full">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl font-display text-muted-foreground/20">{number}</span>
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <h4 className="font-display text-xl mb-2">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-card border border-border/50 rounded-xl p-6 hover:border-primary/30 transition-colors">
      <h4 className="font-display text-lg mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

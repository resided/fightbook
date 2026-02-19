import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Terminal, Play, ChevronRight, Zap, 
  Users, Trophy, Code, Timer, Swords 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LandingProps {
  onEnter: () => void;
}

export default function Landing({ onEnter }: LandingProps) {
  const [typedText, setTypedText] = useState('');
  const fullText = 'skills.md meets MMA';

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <img 
              src="/hero-logo.png" 
              alt="FightBook" 
              className="w-full max-w-3xl h-auto drop-shadow-[0_0_60px_rgba(168,85,247,0.4)]"
            />
          </motion.div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-12"
          >
            <p className="text-2xl md:text-3xl font-mono text-orange-400">
              <span className="text-purple-400">$</span> {typedText}
              <span className="animate-pulse">_</span>
            </p>
            <p className="text-muted-foreground mt-4 text-lg">
              Configure AI agents with skills.md. Watch them battle in real-time.
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button 
              size="lg" 
              onClick={onEnter}
              className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-400 hover:to-purple-500 text-white px-8 py-6 text-lg font-mono"
            >
              <Play className="w-5 h-5 mr-2" />
              ENTER ARENA
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center gap-8 mt-16 text-muted-foreground font-mono text-sm"
          >
            <Stat label="AI Agents" value="2,847" />
            <span className="text-border">|</span>
            <Stat label="Fights Completed" value="12,493" />
            <span className="text-border">|</span>
            <Stat label="Active Now" value="184" />
          </motion.div>
        </section>

        {/* Code Demo Section */}
        <section className="py-24 px-6 bg-black/50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-center text-3xl md:text-4xl font-display mb-16">
              <span className="text-orange-400">write</span> skills.md
              <span className="text-muted-foreground"> → </span>
              <span className="text-purple-400">watch</span> them fight
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Code Block */}
              <TerminalBlock />
              
              {/* Fight Output */}
              <FightOutput />
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={Code}
                title="skills.md"
                description="Configure your fighter with 25+ attributes. The same format powering the AI agent meta."
              />
              <FeatureCard 
                icon={Timer}
                title="3-Minute Rounds"
                description="Authentic MMA combat. Real-time ticking clock. Play-by-play commentary."
              />
              <FeatureCard 
                icon={Trophy}
                title="Build Legacy"
                description="Win fights, gain XP, climb rankings. Your agent's record is permanent."
              />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-border/20">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="" className="h-8 w-auto" />
              <span className="font-mono text-sm text-muted-foreground">
                AI Combat Arena
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-zinc-500">
              <a href="https://x.com/fightbookxyz" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">@fightbookxyz</a>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-pulse"></span>
                GitHub Soon
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

// Components
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-white font-bold">{value}</div>
      <div className="text-xs">{label}</div>
    </div>
  );
}

function TerminalBlock() {
  return (
    <div className="bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900 border-b border-zinc-800">
        <div className="w-3 h-3 rounded-full bg-red-500/50" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
        <div className="w-3 h-3 rounded-full bg-green-500/50" />
        <span className="ml-2 text-xs text-zinc-500 font-mono">skills.md</span>
      </div>
      <div className="p-6 font-mono text-sm">
        <div className="text-zinc-500"># Configure your agent</div>
        <div className="text-purple-400">name: <span className="text-orange-300">"Knockout King"</span></div>
        <div className="text-purple-400">nickname: <span className="text-orange-300">"The Destroyer"</span></div>
        <div className="mt-4 text-zinc-500"># Striking</div>
        <div className="text-cyan-400">striking: <span className="text-white">85</span></div>
        <div className="text-cyan-400">punch_speed: <span className="text-white">80</span></div>
        <div className="text-cyan-400">kick_power: <span className="text-white">75</span></div>
        <div className="mt-4 text-zinc-500"># Grappling</div>
        <div className="text-cyan-400">wrestling: <span className="text-white">40</span></div>
        <div className="text-cyan-400">submissions: <span className="text-white">30</span></div>
        <div className="mt-4 text-zinc-500"># Physical</div>
        <div className="text-cyan-400">cardio: <span className="text-white">70</span></div>
        <div className="text-cyan-400">chin: <span className="text-white">75</span></div>
        <div className="mt-4 text-zinc-500"># Mental</div>
        <div className="text-cyan-400">aggression: <span className="text-white">0.85</span></div>
        <div className="text-cyan-400">fight_iq: <span className="text-white">70</span></div>
      </div>
    </div>
  );
}

function FightOutput() {
  const [step, setStep] = useState(0);
  
  const lines = [
    { time: '3:00', text: 'Round 1 begins!', type: 'system' },
    { time: '2:47', text: 'Knockout King lands a CLEAN jab!', type: 'hit' },
    { time: '2:31', text: 'Ground Game shoots for a takedown...', type: 'action' },
    { time: '2:28', text: 'TAKEDOWN BLOCKED! Back to striking.', type: 'defense' },
    { time: '2:15', text: 'CRUSHING right hook by Knockout King!', type: 'critical' },
    { time: '2:14', text: 'Ground Game is HURT!', type: 'status' },
    { time: '2:08', text: 'Ground Game changes levels...', type: 'action' },
    { time: '2:05', text: 'DOUBLE LEG! Fight goes to the ground.', type: 'success' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStep(s => s < lines.length ? s + 1 : s);
    }, 800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
        <span className="text-xs text-zinc-500 font-mono">live fight output</span>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs text-red-400 font-mono">LIVE</span>
        </div>
      </div>
      <div className="p-6 font-mono text-sm space-y-2 h-[400px] overflow-hidden">
        {lines.slice(0, step).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex gap-3 ${
              line.type === 'system' ? 'text-zinc-400' :
              line.type === 'hit' ? 'text-cyan-400' :
              line.type === 'critical' ? 'text-red-400 font-bold' :
              line.type === 'success' ? 'text-green-400' :
              line.type === 'status' ? 'text-orange-400' :
              'text-zinc-300'
            }`}
          >
            <span className="text-zinc-600 w-12">{line.time}</span>
            <span>{line.text}</span>
          </motion.div>
        ))}
        {step < lines.length && (
          <div className="flex gap-3 text-zinc-600">
            <span className="w-12">...</span>
            <span className="animate-pulse">_</span>
          </div>
        )}
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="group p-6 rounded-xl border border-zinc-800 bg-zinc-950/50 hover:bg-zinc-900/50 hover:border-orange-500/30 transition-all">
      <Icon className="w-8 h-8 text-orange-400 mb-4 group-hover:scale-110 transition-transform" />
      <h3 className="text-xl font-display mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}

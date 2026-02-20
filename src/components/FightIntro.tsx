// FightBook - Fight Introduction / Loading Screen
// First-time user onboarding for the fight arena

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, Swords, Clock, Target, Brain, 
  Zap, Shield, Trophy, ChevronRight, X,
  Keyboard, Eye, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FightIntroProps {
  onDismiss: () => void;
  agent1Name: string;
  agent2Name: string;
}

export default function FightIntro({ onDismiss, agent1Name, agent2Name }: FightIntroProps) {
  const [step, setStep] = useState(0);
  const [typedText, setTypedText] = useState('');
  
  const steps = [
    {
      title: 'Welcome to the Arena',
      content: `Two AI agents. One cage. No mercy.`,
      detail: `${agent1Name} vs ${agent2Name} — a 3-round battle for supremacy.`
    },
    {
      title: 'How It Works',
      content: 'Real-time MMA combat simulation.',
      detail: 'Every punch, takedown, and submission attempt is calculated based on your agent\'s skills.md configuration.'
    },
    {
      title: 'The Action Feed',
      content: 'Watch the fight unfold move-by-move.',
      detail: 'Light hits in cyan. Heavy damage in orange. Critical strikes in red. Position changes in real-time.'
    },
    {
      title: 'Victory Conditions',
      content: 'KO • TKO • Submission • Decision',
      detail: 'Win by knockout, ref stoppage, tapout, or judges\' scorecards. Your agent\'s legacy is permanent.'
    }
  ];

  const currentStep = steps[step];

  useEffect(() => {
    setTypedText('');
    let i = 0;
    const text = currentStep.content;
    const timer = setInterval(() => {
      if (i < text.length) {
        setTypedText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [step]);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onDismiss();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-900/50 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <Terminal className="w-5 h-5 text-orange-500" />
            <span className="font-mono text-sm text-zinc-400">fightbook_init.sh</span>
          </div>
          <button 
            onClick={onDismiss}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-1 px-6 py-3 bg-zinc-900/30">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-orange-500' : 'bg-zinc-800'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Step Number */}
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                <span className="text-orange-500">0{step + 1}</span>
                <span>/</span>
                <span>0{steps.length}</span>
              </div>

              {/* Title */}
              <h2 className="text-3xl font-display text-white">
                {currentStep.title}
              </h2>

              {/* Typed Content */}
              <div className="font-mono text-xl text-orange-400">
                <span className="text-zinc-600">$</span> {typedText}
                <span className="animate-pulse">_</span>
              </div>

              {/* Detail */}
              <p className="text-zinc-400 leading-relaxed">
                {currentStep.detail}
              </p>

              {/* Visual Aid per Step */}
              <div className="py-4">
                {step === 0 && <MatchupVisual agent1={agent1Name} agent2={agent2Name} />}
                {step === 1 && <StatsVisual />}
                {step === 2 && <FeedVisual />}
                {step === 3 && <VictoryVisual />}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-900/30 border-t border-zinc-800">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Keyboard className="w-4 h-4" />
            <span>Press SPACE to skip</span>
          </div>
          
          <Button 
            onClick={handleNext}
            className="bg-orange-500 hover:bg-orange-400 text-black font-bold"
          >
            {step === steps.length - 1 ? (
              <>
                <Swords className="w-4 h-4 mr-2" />
                Enter Arena
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Visual Components
function MatchupVisual({ agent1, agent2 }: { agent1: string; agent2: string }) {
  return (
    <div className="flex items-center justify-center gap-6 py-4">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 flex items-center justify-center text-2xl font-display text-orange-400">
          {agent1.charAt(0)}
        </div>
        <p className="text-xs text-zinc-500 mt-2 font-mono">{agent1}</p>
      </div>
      
      <div className="text-3xl font-display text-zinc-600">VS</div>
      
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 flex items-center justify-center text-2xl font-display text-purple-400">
          {agent2.charAt(0)}
        </div>
        <p className="text-xs text-zinc-500 mt-2 font-mono">{agent2}</p>
      </div>
    </div>
  );
}

function StatsVisual() {
  const stats = [
    { icon: Target, label: 'Striking', color: 'text-orange-500' },
    { icon: Shield, label: 'Grappling', color: 'text-blue-500' },
    { icon: Brain, label: 'Fight IQ', color: 'text-purple-500' },
    { icon: Activity, label: 'Cardio', color: 'text-green-500' },
  ];
  
  return (
    <div className="grid grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 text-center">
          <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
          <p className="text-xs text-zinc-500">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

function FeedVisual() {
  const lines = [
    { text: '2:47 Clean jab lands', color: 'text-cyan-400' },
    { text: '2:31 Takedown attempt...', color: 'text-zinc-400' },
    { text: '2:28 BLOCKED', color: 'text-yellow-400' },
    { text: '2:15 CRUSHING hook!', color: 'text-red-400' },
  ];
  
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-sm">
      {lines.map((line, i) => (
        <div key={i} className={`${line.color} mb-1`}>
          {line.text}
        </div>
      ))}
      <div className="text-zinc-600 mt-2">_</div>
    </div>
  );
}

function VictoryVisual() {
  const methods = [
    { icon: Zap, label: 'KO', desc: 'Knockout' },
    { icon: Eye, label: 'TKO', desc: 'Ref Stop' },
    { icon: Target, label: 'SUB', desc: 'Submission' },
    { icon: Trophy, label: 'DEC', desc: 'Decision' },
  ];
  
  return (
    <div className="flex items-center justify-center gap-3">
      {methods.map((method) => (
        <div key={method.label} className="text-center">
          <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-2">
            <method.icon className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-xs font-bold text-white">{method.label}</p>
          <p className="text-[10px] text-zinc-600">{method.desc}</p>
        </div>
      ))}
    </div>
  );
}

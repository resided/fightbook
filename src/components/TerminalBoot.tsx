// FightBook - Terminal Boot Sequence
// First-time site loading experience

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Swords, Users, Trophy, Zap, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TerminalBootProps {
  onComplete: () => void;
}

interface BootLine {
  text: string;
  color?: string;
  delay?: number;
  icon?: any;
}

export default function TerminalBoot({ onComplete }: TerminalBootProps) {
  const [currentLine, setCurrentLine] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const bootSequence: BootLine[] = [
    { text: 'Initializing FightBook kernel...', color: 'text-zinc-500' },
    { text: 'Loading AI combat modules...', color: 'text-zinc-500' },
    { text: 'Mounting skills.md parser...', color: 'text-zinc-500' },
    { text: 'Connecting to fight arena...', color: 'text-zinc-500' },
    { text: '', color: '' },
    { text: '╔══════════════════════════════════════════════════════════════╗', color: 'text-orange-500' },
    { text: '║                    WELCOME TO FIGHTBOOK                      ║', color: 'text-orange-500' },
    { text: '║                                                              ║', color: 'text-orange-500' },
    { text: '║           AI Combat Arena • skills.md Powered                ║', color: 'text-orange-500' },
    { text: '║                                                              ║', color: 'text-orange-500' },
    { text: '╚══════════════════════════════════════════════════════════════╝', color: 'text-orange-500' },
    { text: '', color: '' },
    { text: 'WHAT IS FIGHTBOOK?', color: 'text-purple-400', icon: Swords },
    { text: 'FightBook is an AI combat simulation platform where you create', color: 'text-zinc-300' },
    { text: 'fighters using skills.md configuration files and watch them', color: 'text-zinc-300' },
    { text: 'battle in real-time with authentic MMA techniques.', color: 'text-zinc-300' },
    { text: '', color: '' },
    { text: 'HOW IT WORKS:', color: 'text-cyan-400', icon: Zap },
    { text: '1. Create an agent with 25+ configurable attributes', color: 'text-zinc-300' },
    { text: '   (striking, grappling, cardio, fight IQ, aggression...)', color: 'text-zinc-500' },
    { text: '', color: '' },
    { text: '2. Pit your agent against others in 3-minute rounds', color: 'text-zinc-300' },
    { text: '   Watch the action unfold move-by-move in real-time', color: 'text-zinc-500' },
    { text: '', color: '' },
    { text: '3. Build your legacy through wins, KOs, and submissions', color: 'text-zinc-300' },
    { text: '   Rank up. Earn XP. Become champion.', color: 'text-zinc-500' },
    { text: '', color: '' },
    { text: 'THE TECH:', color: 'text-green-400', icon: Terminal },
    { text: '• skills.md format (compatible with AI agent meta)', color: 'text-zinc-300' },
    { text: '• Real-time simulation engine with 40+ MMA techniques', color: 'text-zinc-300' },
    { text: '• Position-based combat (standing → clinch → ground)', color: 'text-zinc-300' },
    { text: '• Point budget system — every choice matters', color: 'text-zinc-300' },
    { text: '', color: '' },
    { text: 'READY TO FIGHT?', color: 'text-orange-400', icon: Trophy },
  ];

  // Auto-scroll to bottom as content types
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentLine, typedText]);

  useEffect(() => {
    if (isSkipping) return;
    
    if (currentLine < bootSequence.length) {
      const line = bootSequence[currentLine];
      let charIndex = 0;
      
      const typeInterval = setInterval(() => {
        if (charIndex < line.text.length) {
          setTypedText(line.text.slice(0, charIndex + 1));
          charIndex++;
          // Scroll on each character for smooth effect
          if (scrollRef.current && charIndex % 5 === 0) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }
        } else {
          clearInterval(typeInterval);
          setTimeout(() => {
            setCurrentLine(prev => prev + 1);
            setTypedText('');
          }, line.delay || (line.text === '' ? 100 : 40));
        }
      }, 15);

      return () => clearInterval(typeInterval);
    } else {
      setShowPrompt(true);
    }
  }, [currentLine, isSkipping]);

  const handleSkip = () => {
    setIsSkipping(true);
    setCurrentLine(bootSequence.length);
    setShowPrompt(true);
  };

  const visibleLines = bootSequence.slice(0, currentLine);
  const currentLineData = bootSequence[currentLine];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4"
      onClick={handleSkip}
    >
      <div 
        className="w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-zinc-900 border-b border-zinc-800">
          <Terminal className="w-5 h-5 text-orange-500" />
          <span className="font-mono text-sm text-zinc-400">fightbook_boot.sh</span>
          <div className="flex-1" />
          <button 
            onClick={handleSkip}
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            [skip]
          </button>
        </div>

        {/* Terminal Output */}
        <div 
          ref={scrollRef}
          className="p-4 sm:p-6 font-mono text-sm h-[55vh] sm:h-[500px] overflow-y-auto bg-black scroll-smooth"
        >
          {/* Completed Lines */}
          {visibleLines.map((line, i) => (
            <div key={i} className={`${line.color} mb-1 flex items-center gap-2`}>
              {line.icon && <line.icon className="w-4 h-4" />}
              <span>{line.text}</span>
            </div>
          ))}
          
          {/* Currently Typing Line */}
          {!isSkipping && currentLineData && currentLine < bootSequence.length && (
            <div className={`${currentLineData.color} flex items-center gap-2`}>
              {currentLineData.icon && <currentLineData.icon className="w-4 h-4" />}
              <span>{typedText}</span>
              <span className="animate-pulse text-orange-500">_</span>
            </div>
          )}

          {/* Enter Prompt */}
          <AnimatePresence>
            {showPrompt && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <div className="text-zinc-500 mb-2">Press ENTER to enter the arena...</div>
                <Button 
                  onClick={onComplete}
                  className="bg-orange-500 hover:bg-orange-400 text-black font-bold px-8"
                >
                  <Swords className="w-4 h-4 mr-2" />
                  ENTER ARENA
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-t border-zinc-800 text-xs text-zinc-600">
          <div className="flex items-center gap-4">
            <span>v1.1.17</span>
            <span className="text-zinc-700">|</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Online
            </span>
          </div>
          <div>
            {Math.round((currentLine / bootSequence.length) * 100)}% loaded
          </div>
        </div>
      </div>
    </motion.div>
  );
}

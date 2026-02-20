// FightBook - Text-Based Fight Centerpiece
// Full-screen immersive text combat experience

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, RotateCcw, FastForward, SkipForward,
  Swords, Timer, MessageSquare, Trophy, Activity,
  TrendingUp, Target, Zap, Shield, Flame, Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import FightEngine, { GameState } from '@/engine/FightEngine';
import { 
  FightState, FightAction, FighterState, 
  ROUND_DURATION, DEFAULT_FIGHTER 
} from '@/types/fight';
import type { CompleteAgent } from '@/types/agent';
import { saveFightRecord } from '@/lib/storage';
import { saveFightToDb } from '@/lib/fightStorage';
import { getCpuDecision, CpuFighter, CpuDifficulty } from '@/lib/cpuOpponent';
import { getLlmDecision, LlmConfig, mapTechniqueName } from '@/lib/llmClient';
import { getFighterApiKey, getFighter } from '@/lib/fighterStorage';
import { incrementWinCount, incrementLossCount } from '@/lib/leaderboard';
import FightIntro from './FightIntro';
import {
  STRIKING_TECHNIQUES,
  GRAPPLING_TECHNIQUES,
  SUBMISSION_TECHNIQUES,
  GROUND_TECHNIQUES,
  Technique,
} from '@/types/fight';

interface TextFightProps {
  agent1: CompleteAgent;
  agent2: CompleteAgent;
  onFightComplete?: (result: FightState) => void;
  onBack?: () => void;
  isCpuOpponent?: boolean;
  cpuDifficulty?: CpuDifficulty;
}

export default function TextFight({ 
  agent1, 
  agent2, 
  onFightComplete, 
  onBack,
  isCpuOpponent = false,
  cpuDifficulty = 'medium'
}: TextFightProps) {
  const { toast } = useToast();
  const [fight, setFight] = useState<FightState | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1); // 1x, 2x, 4x
  const [actions, setActions] = useState<FightAction[]>([]);
  const [showStats, setShowStats] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingFighter, setThinkingFighter] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(() => {
    // Show intro on first fight of session
    return !sessionStorage.getItem('fightbook_seen_intro');
  });
  const engineRef = useRef<FightEngine | null>(null);
  const actionsEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Check if either agent is a CPU
  const isAgent1Cpu = agent1.metadata.id.startsWith('cpu_');
  const isAgent2Cpu = agent2.metadata.id.startsWith('cpu_');
  
  // Determine if we should use LLM for agent1 (user's fighter)
  const useLlmForAgent1 = !isAgent1Cpu && !isAgent2Cpu; // LLM vs LLM mode
  
  // Create CPU callback
  const cpuCallback = useCallback((actor: string, target: string, gameState: GameState): string => {
    // Find CPU fighter stats
    const cpuAgent = isAgent1Cpu ? agent1 : agent2;
    const cpuFighter = {
      ...agentToFighterStats(cpuAgent),
      id: cpuAgent.metadata.id,
      isCpu: true,
      difficulty: cpuDifficulty,
      position: gameState.myPosition,
    } as CpuFighter;
    
    const targetStats = agentToFighterStats(isAgent1Cpu ? agent2 : agent1);
    
    return getCpuDecision(cpuFighter, targetStats, {
      round: gameState.round,
      timeRemaining: gameState.timeRemaining,
      actorHealth: gameState.myHealth,
      actorStamina: gameState.myStamina,
      actorPosition: gameState.myPosition,
      targetHealth: gameState.oppHealth,
      targetStamina: gameState.oppStamina,
      targetPosition: gameState.oppPosition,
      recentActions: gameState.recentActions,
      isWinning: gameState.myHealth > gameState.oppHealth,
      isTired: gameState.myStamina < 30,
      targetIsHurt: gameState.oppHealth < 40,
    });
  }, [agent1, agent2, isAgent1Cpu, isAgent2Cpu, cpuDifficulty]);
  
  // Create LLM callback for agent1
  const llmCallback = useCallback(async (actor: string, target: string, gameState: GameState): Promise<string> => {
    setIsThinking(true);
    setThinkingFighter(actor);
    
    try {
      // Get API key from agent1
      const apiKey = await getFighterApiKey(agent1.metadata.id);
      
      if (!apiKey) {
        // No API key - fall back to random
        toast({
          title: "No API Key",
          description: "Fighter doesn't have an API key configured. Using random moves.",
          variant: "destructive",
        });
        return getRandomTechnique(gameState.myPosition);
      }
      
      const llmConfig: LlmConfig = {
        provider: 'openai', // Could be stored in fighter data
        apiKey,
      };
      
      const actorStats = agentToFighterStats(agent1);
      const targetStats = agentToFighterStats(agent2);
      
      const techniqueName = await getLlmDecision(actorStats, targetStats, gameState, llmConfig);
      
      toast({
        title: "LLM Decision",
        description: `Selected: ${techniqueName}`,
        duration: 2000,
      });
      
      return techniqueName;
    } catch (error) {
      console.error('LLM error:', error);
      toast({
        title: "LLM Error",
        description: "Using fallback random technique",
        variant: "destructive",
      });
      return getRandomTechnique(gameState.myPosition);
    } finally {
      setIsThinking(false);
      setThinkingFighter(null);
    }
  }, [agent1, agent2, toast]);

  const initializeFight = useCallback(() => {
    // Convert agent skills to fighter stats
    const f1Stats = agentToFighterStats(agent1);
    const f2Stats = agentToFighterStats(agent2);

    // Determine if we need mixed mode
    const mixedMode = isCpuOpponent || isAgent1Cpu || isAgent2Cpu;
    
    const callbacks: {
      onAction?: (action: FightAction) => void;
      onRoundEnd?: (round: any) => void;
      onFightEnd?: (fight: FightState) => void;
      llmCallback?: (actor: string, target: string, gameState: GameState) => Promise<string>;
      cpuCallback?: (actor: string, target: string, gameState: GameState) => string;
      mixedMode?: boolean;
      llmFighterId?: string;
    } = {
      onAction: (action) => {
        setActions(prev => [...prev, action]);
        setFight(engineRef.current?.getState() || null);
      },
      onRoundEnd: () => {
        setFight(engineRef.current?.getState() || null);
      },
      onFightEnd: (finalFight) => {
        setIsRunning(false);
        setFight(finalFight);
        
        // Save to localStorage (always)
        saveFightRecord({
          id: finalFight.id,
          timestamp: Date.now(),
          agent1: { id: agent1.metadata.id, name: agent1.skills.name },
          agent2: { id: agent2.metadata.id, name: agent2.skills.name },
          winner: finalFight.winner || null,
          method: finalFight.method || 'DEC',
          round: finalFight.endRound || 3,
          time: formatTime(finalFight.endTime || 0),
          fightData: finalFight,
        });
        
        // Determine if this is a practice fight (CPU vs any opponent)
        // CPU fights don't count toward leaderboard wins
        const isPracticeFight = isAgent1Cpu || isAgent2Cpu;
        
        // Also try to save to database (Supabase)
        saveFightToDb(agent1, agent2, finalFight, undefined, isPracticeFight)
          .then(() => {
            toast({
              title: "Fight Saved!",
              description: isPracticeFight ? "Practice fight saved (won't affect leaderboard)." : "Fight saved to database.",
            });
          })
          .catch((err) => {
            console.error('Failed to save to database:', err);
            toast({
              title: "Fight Saved (Local)",
              description: "Saved to browser storage only.",
            });
          });
        
        // Update win/loss counts - ONLY for PvP fights (not practice/CPU fights)
        if (finalFight.winner && !isPracticeFight) {
          const winnerId = finalFight.winner === agent1.skills.name ? agent1.metadata.id : agent2.metadata.id;
          const loserId = finalFight.winner === agent1.skills.name ? agent2.metadata.id : agent1.metadata.id;
          
          Promise.all([
            incrementWinCount(winnerId),
            incrementLossCount(loserId),
          ]).then(() => {
            console.log('Win/loss counts updated');
          }).catch((err) => {
            console.error('Failed to update win/loss counts:', err);
          });
        } else if (isPracticeFight) {
          console.log('Practice fight - leaderboard stats not updated');
        }
        
        toast({
          title: finalFight.winner ? `${finalFight.winner} Wins!` : "Draw!",
          description: `by ${finalFight.method}`,
        });
        onFightComplete?.(finalFight);
      },
    };
    
    // Add CPU callback if facing CPU opponent
    if (mixedMode) {
      callbacks.cpuCallback = cpuCallback;
      callbacks.mixedMode = true;
      callbacks.llmFighterId = 'fighter1'; // User's fighter uses LLM
    }
    
    // Add LLM callback if both are user fighters
    if (useLlmForAgent1) {
      callbacks.llmCallback = llmCallback;
      callbacks.mixedMode = true;
    }

    engineRef.current = new FightEngine(f1Stats, f2Stats, callbacks);

    setFight(engineRef.current.getState());
    setActions([]);
  }, [agent1, agent2, isCpuOpponent, isAgent1Cpu, isAgent2Cpu, useLlmForAgent1, cpuCallback, llmCallback, onFightComplete, toast]);

  useEffect(() => {
    initializeFight();
    return () => {
      engineRef.current?.stop();
    };
  }, [initializeFight]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [actions]);

  const toggleFight = () => {
    if (!engineRef.current) return;
    
    if (isRunning) {
      engineRef.current.pause();
    } else {
      if (fight?.isComplete) {
        initializeFight();
      }
      engineRef.current.resume();
    }
    setIsRunning(!isRunning);
  };

  const resetFight = () => {
    engineRef.current?.stop();
    setIsRunning(false);
    initializeFight();
  };

  const skipToEnd = () => {
    if (!engineRef.current) return;
    engineRef.current.pause();
    // Fast-forward simulation would go here
    resetFight();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!fight) return null;

  const currentRound = fight.rounds[fight.currentRound - 1];
  const timeDisplay = currentRound ? formatTime(currentRound.timeRemaining) : '0:00';

  const handleDismissIntro = () => {
    setShowIntro(false);
    sessionStorage.setItem('fightbook_seen_intro', 'true');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Intro Screen */}
      <AnimatePresence>
        {showIntro && (
          <FightIntro 
            onDismiss={handleDismissIntro}
            agent1Name={agent1.skills.name}
            agent2Name={agent2.skills.name}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <Button variant="ghost" onClick={onBack}>
                  ← Back
                </Button>
              )}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Swords className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-display text-lg">FightBook Arena</h1>
                  <p className="text-xs text-muted-foreground">Live Text Combat</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Thinking Indicator */}
              {isThinking && (
                <div className="flex items-center gap-2 text-primary animate-pulse">
                  <Brain className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {thinkingFighter} is thinking...
                  </span>
                </div>
              )}
              
              {/* Speed Control */}
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                {[1, 2, 4].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      speed === s ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
              
              <Button variant="outline" size="sm" onClick={() => setShowStats(!showStats)}>
                {showStats ? 'Hide Stats' : 'Show Stats'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Fighter 1 */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-r border-border/50 overflow-y-auto"
            >
              <FighterPanel 
                agent={agent1} 
                state={fight.fighter1}
                isWinner={fight.winner === fight.fighter1.name}
                isLeft
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center - Fight Feed */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Round Header */}
          <div className="border-b border-border/50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-lg px-4 py-1">
                  ROUND {fight.currentRound} / 3
                </Badge>
                <div className="flex items-center gap-2 text-2xl font-display">
                  <Timer className="w-5 h-5 text-primary" />
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={timeDisplay}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={currentRound?.timeRemaining && currentRound.timeRemaining <= 10 ? 'text-red-500' : ''}
                    >
                      {timeDisplay}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>
              
              {/* Controls */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={resetFight}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button 
                  variant={isRunning ? "outline" : "default"}
                  size="icon"
                  onClick={toggleFight}
                  className="h-12 w-12"
                >
                  {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </Button>
                <Button variant="outline" size="icon" onClick={skipToEnd}>
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Fight Log */}
          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            <div className="max-w-3xl mx-auto space-y-2">
              {/* Fight Start */}
              {actions.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Swords className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">Fight ready to begin...</p>
                  <p className="text-sm">Press play to start</p>
                </div>
              )}

              {/* Actions */}
              {actions.map((action, index) => (
                <ActionLine 
                  key={`${action.timestamp}-${index}`}
                  action={action}
                  isNew={index === actions.length - 1}
                  agent1Name={agent1.skills.name}
                  agent2Name={agent2.skills.name}
                />
              ))}

              {/* Round Ends */}
              {currentRound && !currentRound.isActive && fight.currentRound < 3 && (
                <RoundEndCard 
                  round={fight.currentRound}
                  fighter1={fight.fighter1}
                  fighter2={fight.fighter2}
                />
              )}

              {/* Fight End */}
              {fight.isComplete && (
                <FightEndCard fight={fight} />
              )}
              
              <div ref={actionsEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - Fighter 2 */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-border/50 overflow-y-auto"
            >
              <FighterPanel 
                agent={agent2} 
                state={fight.fighter2}
                isWinner={fight.winner === fight.fighter2.name}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Action Line Component
function ActionLine({ 
  action, 
  isNew,
  agent1Name,
  agent2Name,
}: { 
  action: FightAction; 
  isNew: boolean;
  agent1Name: string;
  agent2Name: string;
}) {
  const isAgent1 = action.actor === agent1Name;
  
  const getImpactColor = () => {
    switch (action.impact) {
      case 'devastating': return 'text-red-500 border-red-500/30 bg-red-500/5';
      case 'heavy': return 'text-orange-500 border-orange-500/30 bg-orange-500/5';
      case 'moderate': return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/5';
      default: return 'text-muted-foreground border-border/30 bg-muted/20';
    }
  };

  return (
    <motion.div
      initial={isNew ? { opacity: 0, x: isAgent1 ? -20 : 20 } : false}
      animate={{ opacity: 1, x: 0 }}
      className={`flex gap-4 p-3 rounded-lg border ${getImpactColor()} ${
        isAgent1 ? 'flex-row' : 'flex-row-reverse'
      }`}
    >
      {/* Time */}
      <div className="text-xs font-mono text-muted-foreground pt-1">
        R{action.round} {formatTime(action.timeRemaining)}
      </div>
      
      {/* Content */}
      <div className={`flex-1 ${isAgent1 ? 'text-left' : 'text-right'}`}>
        <p className={`text-sm ${action.impact === 'devastating' ? 'font-bold' : ''}`}>
          {action.description}
        </p>
        {action.damage > 0 && (
          <span className="text-xs text-red-400">
            -{action.damage} HP
          </span>
        )}
      </div>
      
      {/* Impact Badge */}
      {action.impact && action.impact !== 'light' && (
        <Badge variant="outline" className="text-xs capitalize">
          {action.impact}
        </Badge>
      )}
    </motion.div>
  );
}

// Round End Card
function RoundEndCard({ round, fighter1, fighter2 }: { round: number, fighter1: FighterState, fighter2: FighterState }) {
  return (
    <div className="my-6 p-6 bg-muted/30 rounded-xl border border-border/50 text-center">
      <h3 className="text-2xl font-display mb-4">End of Round {round}</h3>
      <div className="grid grid-cols-2 gap-8 max-w-md mx-auto">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{fighter1.name}</p>
          <div className="text-2xl font-display">{fighter1.significantStrikes}</div>
          <p className="text-xs text-muted-foreground">Significant Strikes</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">{fighter2.name}</p>
          <div className="text-2xl font-display">{fighter2.significantStrikes}</div>
          <p className="text-xs text-muted-foreground">Significant Strikes</p>
        </div>
      </div>
    </div>
  );
}

// Fight End Card
function FightEndCard({ fight }: { fight: FightState }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="my-8 p-8 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl border border-primary/30 text-center"
    >
      <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
      <h2 className="text-4xl font-display mb-2">
        {fight.winner ? `${fight.winner} Wins!` : 'Draw!'}
      </h2>
      <p className="text-xl text-muted-foreground mb-6">
        by {fight.method} {fight.endRound !== 3 && `- Round ${fight.endRound}`}
      </p>
      
      <div className="grid grid-cols-2 gap-6 max-w-lg mx-auto">
        <div className="bg-background/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-2">{fight.fighter1.name}</p>
          <div className="text-3xl font-display">{Math.round(fight.fighter1.currentHealth)}%</div>
          <p className="text-xs text-muted-foreground">Health Remaining</p>
        </div>
        <div className="bg-background/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-2">{fight.fighter2.name}</p>
          <div className="text-3xl font-display">{Math.round(fight.fighter2.currentHealth)}%</div>
          <p className="text-xs text-muted-foreground">Health Remaining</p>
        </div>
      </div>
    </motion.div>
  );
}

// Fighter Panel
function FighterPanel({ 
  agent, 
  state,
  isWinner,
  isLeft = false,
}: { 
  agent: CompleteAgent; 
  state: FighterState;
  isWinner: boolean;
  isLeft?: boolean;
}) {
  const healthPercent = state.currentHealth;
  const staminaPercent = state.currentStamina;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className={`flex items-center gap-4 ${isLeft ? '' : 'flex-row-reverse text-right'}`}>
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-2xl font-display">
          {agent.skills.name.charAt(0)}
        </div>
        <div>
          <h3 className="font-display text-xl">{agent.skills.name}</h3>
          <p className="text-sm text-muted-foreground">"{agent.skills.nickname}"</p>
          {isWinner && (
            <Badge className="mt-1 bg-yellow-500 text-black">WINNER</Badge>
          )}
        </div>
      </div>

      {/* Health */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-red-400">Health</span>
          <span className="font-mono">{Math.round(healthPercent)}%</span>
        </div>
        <Progress value={healthPercent} className="h-3 bg-red-950" />
      </div>

      {/* Stamina */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-yellow-400">Stamina</span>
          <span className="font-mono">{Math.round(staminaPercent)}%</span>
        </div>
        <Progress value={staminaPercent} className="h-2 bg-yellow-950" />
      </div>

      {/* Stats */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Fight Stats
        </h4>
        <StatRow label="Significant Strikes" value={state.significantStrikes} />
        <StatRow label="Total Strikes" value={state.totalStrikes} />
        <StatRow label="Takedowns" value={state.takedownsLanded} />
        <StatRow label="Knockdowns" value={state.knockdowns} />
      </div>

      {/* Agent Stats */}
      <div className="pt-4 border-t border-border/50 space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Agent Stats
        </h4>
        <StatRow label="Striking" value={agent.skills.striking} icon={Target} />
        <StatRow label="Wrestling" value={agent.skills.wrestling} icon={Shield} />
        <StatRow label="Submissions" value={agent.skills.submissions} icon={Zap} />
        <StatRow label="Cardio" value={agent.skills.cardio} icon={Activity} />
      </div>

      {/* Career */}
      <div className="pt-4 border-t border-border/50">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Career
        </h4>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted/30 rounded-lg p-2">
            <div className="text-lg font-display text-green-500">{agent.metadata.wins}</div>
            <div className="text-xs text-muted-foreground">Wins</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-2">
            <div className="text-lg font-display text-red-500">{agent.metadata.losses}</div>
            <div className="text-xs text-muted-foreground">Losses</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-2">
            <div className="text-lg font-display">{agent.metadata.ranking}</div>
            <div className="text-xs text-muted-foreground">Rating</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, icon: Icon }: { label: string, value: number, icon?: any }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground flex items-center gap-2">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </span>
      <span className="font-mono font-medium">{value}</span>
    </div>
  );
}

// Convert agent to fighter stats
function agentToFighterStats(agent: CompleteAgent) {
  const s = agent.skills;
  return {
    name: s.name,
    nickname: s.nickname,
    striking: s.striking,
    punchSpeed: s.punchSpeed,
    kickPower: s.kickPower,
    headMovement: s.headMovement,
    wrestling: s.wrestling,
    takedownDefense: s.takedownDefense,
    submissions: s.submissions,
    submissionDefense: s.submissionDefense,
    groundGame: (s.groundAndPound + s.topControl + s.bottomGame) / 3,
    cardio: s.cardio,
    chin: s.chin,
    recovery: s.recovery,
    aggression: s.aggression,
    fightIQ: s.fightIQ,
    heart: s.heart,
  };
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Get random technique by position (fallback)
function getRandomTechnique(position: string): string {
  const allTechs = [
    ...STRIKING_TECHNIQUES,
    ...GRAPPLING_TECHNIQUES,
    ...SUBMISSION_TECHNIQUES,
    ...GROUND_TECHNIQUES,
  ];
  
  const available = allTechs.filter(t => t.position.includes(position as any));
  if (available.length === 0) {
    return allTechs[Math.floor(Math.random() * allTechs.length)].name;
  }
  return available[Math.floor(Math.random() * available.length)].name;
}

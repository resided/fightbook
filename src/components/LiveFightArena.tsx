// FightBook - Live Fight Arena
// Real-time MMA/MMA combat with 3-minute rounds

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, RotateCcw, Swords, Timer, 
  Heart, Zap, Target, TrendingUp, Activity,
  Shield, Footprints, Crosshair, Dumbbell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import FightEngine from '@/engine/FightEngine';
import { 
  FightState, FightAction, FighterState, 
  ROUND_DURATION, DEFAULT_FIGHTER 
} from '@/types/fight';

interface LiveFightArenaProps {
  fighter1Config: string;
  fighter2Config: string;
  onFightComplete?: (result: FightState) => void;
}

export default function LiveFightArena({ 
  fighter1Config, 
  fighter2Config,
  onFightComplete 
}: LiveFightArenaProps) {
  const [fight, setFight] = useState<FightState | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [recentActions, setRecentActions] = useState<FightAction[]>([]);
  const engineRef = useRef<FightEngine | null>(null);
  const actionsRef = useRef<FightAction[]>([]);

  const initializeFight = useCallback(() => {
    const f1Stats = FightEngine.parseSkillsMd(fighter1Config || `name: Fighter 1\nstriking: 60`);
    const f2Stats = FightEngine.parseSkillsMd(fighter2Config || `name: Fighter 2\nstriking: 60`);

    engineRef.current = new FightEngine(f1Stats, f2Stats, {
      onAction: (action) => {
        actionsRef.current = [action, ...actionsRef.current].slice(0, 5);
        setRecentActions(actionsRef.current);
        setFight(engineRef.current?.getState() || null);
      },
      onRoundEnd: () => {
        setFight(engineRef.current?.getState() || null);
      },
      onFightEnd: (finalFight) => {
        setIsRunning(false);
        setFight(finalFight);
        onFightComplete?.(finalFight);
      },
    });

    setFight(engineRef.current.getState());
    setRecentActions([]);
    actionsRef.current = [];
  }, [fighter1Config, fighter2Config, onFightComplete]);

  useEffect(() => {
    initializeFight();
    return () => {
      engineRef.current?.stop();
    };
  }, [initializeFight]);

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!fight) return null;

  const currentRound = fight.rounds[fight.currentRound - 1];
  const timeDisplay = currentRound ? formatTime(currentRound.timeRemaining) : '0:00';

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Fight Header */}
      <div className="text-center mb-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 bg-primary/10 px-6 py-3 rounded-full border border-primary/20"
        >
          <Swords className="w-5 h-5 text-primary" />
          <span className="font-mono text-sm text-primary tracking-wider">FIGHTBOOK ARENA</span>
          <Badge variant="outline" className="border-primary/30 text-primary">
            ROUND {fight.currentRound}/3
          </Badge>
        </motion.div>
      </div>

      {/* Main Fight Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fighter 1 Card */}
        <FighterCard 
          fighter={fight.fighter1} 
          isWinner={fight.winner === fight.fighter1.name}
          isLoser={fight.winner && fight.winner !== fight.fighter1.name}
        />

        {/* Center - Timer & Controls */}
        <div className="flex flex-col items-center justify-center gap-6">
          {/* Round Timer */}
          <div className="text-center">
            <div className="text-7xl md:text-8xl font-display tabular-nums tracking-tight">
              <AnimatePresence mode="wait">
                <motion.span
                  key={timeDisplay}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={currentRound?.timeRemaining && currentRound.timeRemaining <= 10 ? 'text-red-500' : 'text-foreground'}
                >
                  {timeDisplay}
                </motion.span>
              </AnimatePresence>
            </div>
            <p className="text-muted-foreground font-mono text-sm mt-2">
              {fight.isComplete ? 'FIGHT COMPLETE' : currentRound?.isActive ? 'ROUND IN PROGRESS' : 'BETWEEN ROUNDS'}
            </p>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={resetFight}
              className="h-12 w-12 rounded-full border-border/50"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
            <Button
              onClick={toggleFight}
              className="h-16 w-16 rounded-full bg-primary hover:bg-primary/90"
            >
              {isRunning ? (
                <Pause className="w-7 h-7" />
              ) : (
                <Play className="w-7 h-7 ml-1" />
              )}
            </Button>
          </div>

          {/* Position Indicator */}
          <PositionIndicator f1={fight.fighter1} f2={fight.fighter2} />
        </div>

        {/* Fighter 2 Card */}
        <FighterCard 
          fighter={fight.fighter2}
          isRight
          isWinner={fight.winner === fight.fighter2.name}
          isLoser={fight.winner && fight.winner !== fight.fighter2.name}
        />
      </div>

      {/* Live Action Feed */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Log */}
        <div className="bg-card/50 border border-border/50 rounded-xl p-6">
          <h3 className="font-display text-lg mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Live Action
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            <AnimatePresence>
              {recentActions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Fight not started yet...</p>
              ) : (
                recentActions.map((action, i) => (
                  <motion.div
                    key={`${action.timestamp}-${i}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`p-3 rounded-lg text-sm ${
                      action.impact === 'devastating' ? 'bg-red-500/10 border border-red-500/30' :
                      action.impact === 'heavy' ? 'bg-orange-500/10 border border-orange-500/30' :
                      action.success ? 'bg-primary/5 border border-primary/10' :
                      'bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Timer className="w-3 h-3" />
                      Round {action.round} - {formatTime(action.timeRemaining)}
                      {action.impact && (
                        <Badge variant="outline" className="text-xs">
                          {action.impact.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                    <p className={action.impact === 'devastating' ? 'text-red-400 font-medium' : ''}>
                      {action.description}
                    </p>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Fight Stats */}
        <div className="bg-card/50 border border-border/50 rounded-xl p-6">
          <h3 className="font-display text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-secondary" />
            Fight Stats
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <StatComparison 
              label="Significant Strikes"
              val1={fight.fighter1.significantStrikes}
              val2={fight.fighter2.significantStrikes}
            />
            <StatComparison 
              label="Total Strikes"
              val1={fight.fighter1.totalStrikes}
              val2={fight.fighter2.totalStrikes}
            />
            <StatComparison 
              label="Takedowns"
              val1={fight.fighter1.takedownsLanded}
              val2={fight.fighter2.takedownsLanded}
            />
            <StatComparison 
              label="Knockdowns"
              val1={fight.fighter1.knockdowns}
              val2={fight.fighter2.knockdowns}
            />
          </div>
        </div>
      </div>

      {/* Winner Display */}
      {fight.isComplete && fight.winner && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex flex-col items-center gap-4 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 p-8 rounded-2xl border border-primary/30">
            <h2 className="text-4xl font-display">
              🏆 {fight.winner} WINS!
            </h2>
            <p className="text-xl text-muted-foreground">
              by {fight.method} {fight.endRound !== 3 && `- Round ${fight.endRound}`}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Fighter Card Component
function FighterCard({ 
  fighter, 
  isRight = false,
  isWinner = false,
  isLoser = false
}: { 
  fighter: FighterState; 
  isRight?: boolean;
  isWinner?: boolean;
  isLoser?: boolean;
}) {
  const healthPercent = fighter.currentHealth;
  const staminaPercent = fighter.currentStamina;

  return (
    <motion.div
      initial={{ opacity: 0, x: isRight ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`relative bg-card border rounded-xl p-6 ${
        isWinner ? 'border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.2)]' :
        isLoser ? 'border-red-500/30 opacity-80' :
        'border-border/50'
      }`}
    >
      {isWinner && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
          WINNER
        </div>
      )}

      <div className={`flex items-center gap-4 mb-6 ${isRight ? 'flex-row-reverse' : ''}`}>
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-2xl font-display">
          {fighter.name.charAt(0)}
        </div>
        <div className={isRight ? 'text-right' : ''}>
          <h3 className="font-display text-xl">{fighter.name}</h3>
          <p className="text-xs text-muted-foreground font-mono uppercase">
            {fighter.position.replace('_', ' ')}
          </p>
        </div>
      </div>

      {/* Health Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="flex items-center gap-1 text-red-400">
            <Heart className="w-3 h-3" /> Health
          </span>
          <span className="font-mono">{Math.round(healthPercent)}%</span>
        </div>
        <Progress 
          value={healthPercent} 
          className="h-3 bg-red-950"
        />
      </div>

      {/* Stamina Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs mb-1">
          <span className="flex items-center gap-1 text-yellow-400">
            <Zap className="w-3 h-3" /> Stamina
          </span>
          <span className="font-mono">{Math.round(staminaPercent)}%</span>
        </div>
        <Progress 
          value={staminaPercent} 
          className="h-2 bg-yellow-950"
        />
      </div>

      {/* Fighter Stats Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <StatBadge icon={Target} label="Striking" value={fighter.striking} />
        <StatBadge icon={Footprints} label="Wrestling" value={fighter.wrestling} />
        <StatBadge icon={Shield} label="Defense" value={fighter.headMovement} />
        <StatBadge icon={Crosshair} label="Subs" value={fighter.submissions} />
        <StatBadge icon={Dumbbell} label="Chin" value={fighter.chin} />
        <StatBadge icon={Activity} label="Cardio" value={fighter.cardio} />
      </div>
    </motion.div>
  );
}

function StatBadge({ icon: Icon, label, value }: { icon: any, label: string, value: number }) {
  return (
    <div className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2">
      <Icon className="w-3 h-3 text-muted-foreground" />
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-auto font-mono font-bold">{value}</span>
    </div>
  );
}

// Position Indicator
function PositionIndicator({ f1, f2 }: { f1: FighterState; f2: FighterState }) {
  const getPositionLabel = (f: FighterState) => {
    if (f.position === 'standing') return 'Standing';
    if (f.position === 'clinch') return 'Clinch';
    if (f.position === 'ground_top') return f.hasMount ? 'Mount' : f.hasBack ? 'Back Control' : 'Top Control';
    if (f.position === 'ground_bottom') return 'Ground Defense';
    return 'Unknown';
  };

  return (
    <div className="bg-muted/30 rounded-full px-6 py-2 flex items-center gap-4">
      <span className="text-xs font-mono text-muted-foreground">
        {getPositionLabel(f1)}
      </span>
      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
      <span className="text-xs font-mono text-muted-foreground">
        {getPositionLabel(f2)}
      </span>
    </div>
  );
}

// Stat Comparison
function StatComparison({ label, val1, val2 }: { label: string; val1: number; val2: number }) {
  const total = val1 + val2 || 1;
  const pct1 = (val1 / total) * 100;
  
  return (
    <div className="bg-muted/20 rounded-lg p-3">
      <p className="text-xs text-muted-foreground mb-2">{label}</p>
      <div className="flex items-center gap-2">
        <span className="font-mono font-bold w-8 text-right">{val1}</span>
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${pct1}%` }}
          />
        </div>
        <span className="font-mono font-bold w-8">{val2}</span>
      </div>
    </div>
  );
}

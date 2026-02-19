// FightBook - Skills.md Editor with Point Budget System
// Configure your fighter with MMA attributes - FIFA style point allocation

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, RotateCcw, Upload, Download, User, AlertCircle,
  Target, Footprints, Shield, Crosshair, Zap, Heart,
  Dumbbell, Activity, Brain, Flame, Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  SkillsMdConfig, 
  DEFAULT_SKILLS, 
  POINT_BUDGET,
  POINT_CONSUMING_STATS,
  calculatePointsSpent,
  calculatePointsRemaining,
  getBudgetStatus,
  canIncreaseStat,
} from '@/types/agent';

interface SkillsEditorProps {
  value: string;
  onChange: (value: string) => void;
  fighterNumber?: number;
}

export default function SkillsEditor({ value, onChange, fighterNumber = 1 }: SkillsEditorProps) {
  const [activeTab, setActiveTab] = useState('visual');
  const skills = useMemo(() => parseSkills(value), [value]);
  
  const budget = useMemo(() => getBudgetStatus(skills), [skills]);
  const pointsRemaining = budget.remaining;

  const updateSkills = (updates: Partial<SkillsMdConfig>) => {
    const updated = { ...skills, ...updates };
    onChange(generateSkillsMd(updated));
  };

  const handleRawChange = (raw: string) => {
    onChange(raw);
  };

  // Check if we can increase a stat
  const canIncrease = (stat: keyof SkillsMdConfig, currentValue: number) => {
    if (!POINT_CONSUMING_STATS.includes(stat as any)) return true;
    if (currentValue >= POINT_BUDGET.MAX_STAT) return false;
    return pointsRemaining > 0;
  };

  // Handle stat change with budget check
  const handleStatChange = (stat: keyof SkillsMdConfig, value: number) => {
    const currentValue = skills[stat] || 0;
    
    // If increasing, check budget
    if (value > currentValue) {
      const increase = value - currentValue;
      if (POINT_CONSUMING_STATS.includes(stat as any) && increase > pointsRemaining) {
        // Cap at available points
        value = currentValue + Math.floor(pointsRemaining);
      }
      if (value > POINT_BUDGET.MAX_STAT) {
        value = POINT_BUDGET.MAX_STAT;
      }
    }
    
    // If decreasing below minimum, clamp
    if (value < POINT_BUDGET.MIN_STAT) {
      value = POINT_BUDGET.MIN_STAT;
    }
    
    updateSkills({ [stat]: value } as Partial<SkillsMdConfig>);
  };

  const loadPreset = (type: 'striker' | 'grappler' | 'balanced' | 'wildcard') => {
    const presets: Record<string, Partial<SkillsMdConfig>> = {
      striker: {
        striking: 80,
        punchSpeed: 78,
        kickPower: 75,
        headMovement: 70,
        footwork: 72,
        combinations: 75,
        wrestling: 45,
        takedownDefense: 60,
        submissions: 35,
        cardio: 70,
        chin: 68,
        aggression: 0.85,
      },
      grappler: {
        striking: 48,
        wrestling: 85,
        takedownDefense: 82,
        submissions: 88,
        submissionDefense: 80,
        topControl: 85,
        bottomGame: 80,
        cardio: 75,
        chin: 70,
        aggression: 0.55,
      },
      balanced: {
        striking: 65,
        punchSpeed: 65,
        kickPower: 62,
        headMovement: 65,
        wrestling: 65,
        takedownDefense: 65,
        submissions: 60,
        cardio: 75,
        chin: 70,
        aggression: 0.6,
      },
      wildcard: {
        striking: 55,
        wrestling: 50,
        submissions: 85,
        submissionDefense: 60,
        cardio: 65,
        chin: 60,
        aggression: 0.9,
        fightIQ: 45,
      },
    };
    updateSkills(presets[type]);
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-zinc-900/50 border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500/20 to-purple-500/20 flex items-center justify-center">
              <User className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h3 className="font-display text-lg text-white">Fighter {fighterNumber}</h3>
              <p className="text-xs text-zinc-500">Configure your combatant</p>
            </div>
          </div>
          
          {/* Point Budget Display */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm">
                <Wallet className="w-4 h-4 text-orange-500" />
                <span className="text-zinc-400">Points:</span>
                <span className={`font-mono font-bold ${budget.color}`}>
                  {pointsRemaining}
                </span>
                <span className="text-zinc-600">/ {POINT_BUDGET.TOTAL}</span>
              </div>
              <div className="text-xs text-zinc-500 mt-0.5">
                {budget.status} • {Math.round(budget.percentUsed)}% used
              </div>
            </div>
            
            {/* Budget Progress Bar */}
            <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  budget.percentUsed > 90 ? 'bg-red-500' :
                  budget.percentUsed > 75 ? 'bg-orange-500' :
                  budget.percentUsed > 50 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, budget.percentUsed)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Budget Warnings */}
        {budget.remaining < 0 && (
          <div className="mt-3 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4" />
            Over budget! Reduce some stats.
          </div>
        )}
        {budget.remaining > 300 && (
          <div className="mt-3 flex items-center gap-2 text-yellow-400 text-sm bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4" />
            You have {budget.remaining} unspent points. Use them wisely!
          </div>
        )}

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="text-xs text-zinc-500 self-center mr-2">Quick Load:</span>
          {[
            { name: 'Striker', key: 'striker', desc: 'High striking, lower grappling' },
            { name: 'Grappler', key: 'grappler', desc: 'Elite ground game' },
            { name: 'Balanced', key: 'balanced', desc: 'No weaknesses' },
            { name: 'Wildcard', key: 'wildcard', desc: 'High risk, high reward' },
          ].map((preset) => (
            <Button
              key={preset.key}
              variant="outline"
              size="sm"
              onClick={() => loadPreset(preset.key as any)}
              className="border-zinc-700 text-zinc-300 hover:border-orange-500/50 hover:text-white text-xs"
              title={preset.desc}
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
        <TabsList className="mb-6 bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="visual" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
            Visual Editor
          </TabsTrigger>
          <TabsTrigger value="raw" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
            skills.md
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="space-y-6">
          {/* Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Fighter Name</label>
              <Input
                value={skills.name}
                onChange={(e) => updateSkills({ name: e.target.value })}
                placeholder="e.g., Knockout King"
                className="bg-zinc-900 border-zinc-800 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Nickname</label>
              <Input
                value={skills.nickname}
                onChange={(e) => updateSkills({ nickname: e.target.value })}
                placeholder="e.g., The Destroyer"
                className="bg-zinc-900 border-zinc-800 text-white"
              />
            </div>
          </div>

          {/* Striking Section */}
          <SkillSection title="Striking" icon={Target} color="text-orange-500">
            <BudgetStatSlider label="Striking" value={skills.striking} onChange={(v) => handleStatChange('striking', v)} pointsRemaining={pointsRemaining} />
            <BudgetStatSlider label="Punch Speed" value={skills.punchSpeed} onChange={(v) => handleStatChange('punchSpeed', v)} pointsRemaining={pointsRemaining} />
            <BudgetStatSlider label="Kick Power" value={skills.kickPower} onChange={(v) => handleStatChange('kickPower', v)} pointsRemaining={pointsRemaining} />
            <BudgetStatSlider label="Head Movement" value={skills.headMovement} onChange={(v) => handleStatChange('headMovement', v)} pointsRemaining={pointsRemaining} />
            <BudgetStatSlider label="Footwork" value={skills.footwork} onChange={(v) => handleStatChange('footwork', v)} pointsRemaining={pointsRemaining} />
            <BudgetStatSlider label="Combinations" value={skills.combinations} onChange={(v) => handleStatChange('combinations', v)} pointsRemaining={pointsRemaining} />
          </SkillSection>

          {/* Grappling Section */}
          <SkillSection title="Grappling" icon={Shield} color="text-blue-500">
            <BudgetStatSlider label="Wrestling" value={skills.wrestling} onChange={(v) => handleStatChange('wrestling', v)} pointsRemaining={pointsRemaining} />
            <BudgetStatSlider label="Takedown Defense" value={skills.takedownDefense} onChange={(v) => handleStatChange('takedownDefense', v)} pointsRemaining={pointsRemaining} />
            <BudgetStatSlider label="Clinch Control" value={skills.clinchControl} onChange={(v) => handleStatChange('clinchControl', v)} pointsRemaining={pointsRemaining} />
            <BudgetStatSlider label="Trips" value={skills.trips} onChange={(v) => handleStatChange('trips', v)} pointsRemaining={pointsRemaining} />
            <BudgetStatSlider label="Throws" value={skills.throws} onChange={(v) => handleStatChange('throws', v)} pointsRemaining={pointsRemaining} />
          </SkillSection>

          {/* Ground Game */}
          <SkillSection title="Ground Game" icon={Zap} color="text-purple-500">
            <BudgetStatSlider label="Submissions" value={skills.submissions} onChange={(v) => handleStatChange('submissions', v)} pointsRemaining={pointsRemaining} />
            <BudgetStatSlider label="Submission Defense" value={skills.submissionDefense} onChange={(v) => handleStatChange('submissionDefense', v)} pointsRemaining={pointsRemaining} />
            <BudgetStatSlider label="Ground & Pound" value={skills.groundAndPound} onChange={(v) => handleStatChange('groundAndPound', v)} pointsRemaining={pointsRemaining} />
            <BudgetStatSlider label="Guard Passing" value={skills.guardPassing} onChange={(v) => handleStatChange('guardPassing', v)} pointsRemaining={pointsRemaining} />
            <BudgetStatSlider label="Sweeps" value={skills.sweeps} onChange={(v) => handleStatChange('sweeps', v)} pointsRemaining={pointsRemaining} />
            <BudgetStatSlider label="Top Control" value={skills.topControl} onChange={(v) => handleStatChange('topControl', v)} pointsRemaining={pointsRemaining} />
            <BudgetStatSlider label="Bottom Game" value={skills.bottomGame} onChange={(v) => handleStatChange('bottomGame', v)} pointsRemaining={pointsRemaining} />
          </SkillSection>

          {/* Physical */}
          <SkillSection title="Physical" icon={Activity} color="text-green-500">
            <BudgetStatSlider label="Cardio" value={skills.cardio} onChange={(v) => handleStatChange('cardio', v)} pointsRemaining={pointsRemaining} />
            <BudgetStatSlider label="Chin" value={skills.chin} onChange={(v) => handleStatChange('chin', v)} pointsRemaining={pointsRemaining} />
            <BudgetStatSlider label="Recovery" value={skills.recovery} onChange={(v) => handleStatChange('recovery', v)} pointsRemaining={pointsRemaining} />
            <BudgetStatSlider label="Strength" value={skills.strength} onChange={(v) => handleStatChange('strength', v)} pointsRemaining={pointsRemaining} />
            <BudgetStatSlider label="Flexibility" value={skills.flexibility} onChange={(v) => handleStatChange('flexibility', v)} pointsRemaining={pointsRemaining} />
          </SkillSection>

          {/* Mental - Free stats, no points */}
          <SkillSection title="Mental (Free)" icon={Brain} color="text-yellow-500">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
              <p className="text-xs text-yellow-400">
                Mental attributes don't cost points - they represent instincts and intangibles.
              </p>
            </div>
            <BudgetStatSlider label="Fight IQ" value={skills.fightIQ} onChange={(v) => handleStatChange('fightIQ', v)} pointsRemaining={Infinity} free />
            <BudgetStatSlider label="Heart" value={skills.heart} onChange={(v) => handleStatChange('heart', v)} pointsRemaining={Infinity} free />
            <BudgetStatSlider label="Adaptability" value={skills.adaptability} onChange={(v) => handleStatChange('adaptability', v)} pointsRemaining={Infinity} free />
            <BudgetStatSlider label="Ring Generalship" value={skills.ringGeneralship} onChange={(v) => handleStatChange('ringGeneralship', v)} pointsRemaining={Infinity} free />
            <div className="pt-4">
              <div className="flex justify-between mb-2">
                <label className="text-sm text-zinc-300">Aggression</label>
                <span className="text-sm font-mono">{Math.round(skills.aggression * 100)}%</span>
              </div>
              <Slider
                value={[skills.aggression * 100]}
                onValueChange={([v]) => updateSkills({ aggression: v / 100 })}
                min={0}
                max={100}
              />
              <p className="text-xs text-zinc-500 mt-1">
                {skills.aggression < 0.3 ? 'Counter Fighter - Waits for openings' :
                 skills.aggression < 0.6 ? 'Balanced - Mixes offense and defense' :
                 skills.aggression < 0.8 ? 'Aggressive - Pressures constantly' :
                 'Pressure Fighter - Relentless forward movement'}
              </p>
            </div>
          </SkillSection>
        </TabsContent>

        <TabsContent value="raw">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-400">
                Edit your fighter's configuration directly. This uses the standard skills.md format.
              </p>
              <Badge variant="outline" className="text-orange-500 border-orange-500/30">
                {pointsRemaining} points remaining
              </Badge>
            </div>
            <Textarea
              value={value}
              onChange={(e) => handleRawChange(e.target.value)}
              className="font-mono text-sm min-h-[500px] bg-zinc-900 border-zinc-800 text-zinc-300"
              placeholder={`name: My Fighter\nstriking: 70\nwrestling: 60\ncardio: 80...`}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const blob = new Blob([value], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${skills.name.replace(/\s+/g, '_')}_skills.md`;
                  a.click();
                }}
                className="border-zinc-700 text-zinc-400"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Budget-aware stat slider
function BudgetStatSlider({ 
  label, 
  value, 
  onChange, 
  pointsRemaining,
  free = false,
}: { 
  label: string; 
  value: number; 
  onChange: (val: number) => void;
  pointsRemaining: number;
  free?: boolean;
}) {
  const isCapped = !free && value >= POINT_BUDGET.MAX_STAT;
  const isAtMin = value <= POINT_BUDGET.MIN_STAT;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm text-zinc-300 flex items-center gap-2">
          {label}
          {free && <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-500">FREE</Badge>}
        </label>
        <div className="flex items-center gap-2">
          <span className={`font-mono font-bold ${isCapped ? 'text-orange-500' : 'text-white'}`}>
            {value}
          </span>
          {!free && (
            <span className="text-xs text-zinc-600">
              ({Math.max(0, value - POINT_BUDGET.STARTING_BASE)} pts)
            </span>
          )}
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={POINT_BUDGET.MIN_STAT}
        max={POINT_BUDGET.MAX_STAT}
        step={1}
        disabled={false}
      />
      {isCapped && (
        <p className="text-xs text-orange-500">Maximum reached</p>
      )}
    </div>
  );
}

// Skill Section Component
function SkillSection({ title, icon: Icon, color, children }: { title: string, icon: any, color: string, children: React.ReactNode }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      <h3 className={`font-display text-lg mb-4 flex items-center gap-2 ${color}`}>
        <Icon className="w-5 h-5" />
        {title}
      </h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

// Parse skills.md content
function parseSkills(content: string): SkillsMdConfig {
  const skills: Partial<SkillsMdConfig> = { ...DEFAULT_SKILLS };
  
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    const [key, ...valueParts] = trimmed.split(':');
    if (!key) continue;
    
    const value = valueParts.join(':').trim();
    if (!value) continue;
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      if (key === 'name') skills.name = value;
      if (key === 'nickname') skills.nickname = value;
      continue;
    }

    switch (key.toLowerCase()) {
      case 'striking': skills.striking = numValue; break;
      case 'punch_speed': skills.punchSpeed = numValue; break;
      case 'kick_power': skills.kickPower = numValue; break;
      case 'head_movement': skills.headMovement = numValue; break;
      case 'footwork': skills.footwork = numValue; break;
      case 'combinations': skills.combinations = numValue; break;
      case 'wrestling': skills.wrestling = numValue; break;
      case 'takedown_defense': skills.takedownDefense = numValue; break;
      case 'clinch_control': skills.clinchControl = numValue; break;
      case 'trips': skills.trips = numValue; break;
      case 'throws': skills.throws = numValue; break;
      case 'submissions': skills.submissions = numValue; break;
      case 'submission_defense': skills.submissionDefense = numValue; break;
      case 'ground_and_pound': skills.groundAndPound = numValue; break;
      case 'guard_passing': skills.guardPassing = numValue; break;
      case 'sweeps': skills.sweeps = numValue; break;
      case 'top_control': skills.topControl = numValue; break;
      case 'bottom_game': skills.bottomGame = numValue; break;
      case 'cardio': skills.cardio = numValue; break;
      case 'chin': skills.chin = numValue; break;
      case 'recovery': skills.recovery = numValue; break;
      case 'strength': skills.strength = numValue; break;
      case 'flexibility': skills.flexibility = numValue; break;
      case 'aggression': skills.aggression = numValue; break;
      case 'fight_iq': skills.fightIQ = numValue; break;
      case 'heart': skills.heart = numValue; break;
      case 'adaptability': skills.adaptability = numValue; break;
      case 'ring_generalship': skills.ringGeneralship = numValue; break;
    }
  }

  return skills as SkillsMdConfig;
}

// Generate skills.md content
function generateSkillsMd(skills: SkillsMdConfig): string {
  return `# ${skills.name} - FightBook Agent
name: ${skills.name}
nickname: ${skills.nickname}

# Striking
striking: ${skills.striking}
punch_speed: ${skills.punchSpeed}
kick_power: ${skills.kickPower}
head_movement: ${skills.headMovement}
footwork: ${skills.footwork}
combinations: ${skills.combinations}

# Grappling
wrestling: ${skills.wrestling}
takedown_defense: ${skills.takedownDefense}
clinch_control: ${skills.clinchControl}
trips: ${skills.trips}
throws: ${skills.throws}

# Ground Game
submissions: ${skills.submissions}
submission_defense: ${skills.submissionDefense}
ground_and_pound: ${skills.groundAndPound}
guard_passing: ${skills.guardPassing}
sweeps: ${skills.sweeps}
top_control: ${skills.topControl}
bottom_game: ${skills.bottomGame}

# Physical
cardio: ${skills.cardio}
chin: ${skills.chin}
recovery: ${skills.recovery}
strength: ${skills.strength}
flexibility: ${skills.flexibility}

# Mental
fight_iq: ${skills.fightIQ}
heart: ${skills.heart}
adaptability: ${skills.adaptability}
ring_generalship: ${skills.ringGeneralship}
aggression: ${skills.aggression}
`;
}

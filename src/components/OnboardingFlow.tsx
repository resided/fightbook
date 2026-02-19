// FightBook - Agent Onboarding Flow
// Create your AI fighter with full skills.md configuration

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, ChevronLeft, User, Sparkles, 
  Target, Brain, Zap, Shield, Swords, Trophy,
  Check, Save, Upload, Download, Code, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  createNewAgent, 
  DEFAULT_SKILLS, 
  DEFAULT_PERSONALITY,
  DEFAULT_BACKSTORY,
  generateFullSkillsMd,
  parseSkillsMd,
  calculateOverallRating,
  detectArchetype,
  type CompleteAgent,
  type SkillsMdConfig,
  type AgentPersonality,
  type AgentBackstory,
} from '@/types/agent';
import { saveAgent, setCurrentAgent } from '@/lib/storage';

interface OnboardingFlowProps {
  onComplete: (agent: CompleteAgent) => void;
  onSkip?: () => void;
}

const STEPS = [
  { id: 'welcome', title: 'Welcome', icon: Sparkles },
  { id: 'identity', title: 'Identity', icon: User },
  { id: 'skills', title: 'Skills', icon: Target },
  { id: 'personality', title: 'Personality', icon: Brain },
  { id: 'review', title: 'Review', icon: Eye },
];

export default function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [agent, setAgent] = useState<CompleteAgent | null>(null);
  const [skills, setSkills] = useState<SkillsMdConfig>(DEFAULT_SKILLS);
  const [personality, setPersonality] = useState<AgentPersonality>(DEFAULT_PERSONALITY);
  const [backstory, setBackstory] = useState<AgentBackstory>(DEFAULT_BACKSTORY);
  const [rawSkillsMd, setRawSkillsMd] = useState('');
  const [activeTab, setActiveTab] = useState('visual');

  // Initialize agent on mount
  useEffect(() => {
    const newAgent = createNewAgent('');
    setAgent(newAgent);
    setRawSkillsMd(generateFullSkillsMd(newAgent));
  }, []);

  // Update raw skills.md when skills change
  useEffect(() => {
    if (agent) {
      const updated = { ...agent, skills, personality, backstory };
      setRawSkillsMd(generateFullSkillsMd(updated));
    }
  }, [skills, personality, backstory, agent]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = () => {
    if (!agent) return;
    
    const finalAgent: CompleteAgent = {
      ...agent,
      skills,
      personality,
      backstory,
      metadata: {
        ...agent.metadata,
        name: skills.name,
        updatedAt: Date.now(),
      },
    };
    
    saveAgent(finalAgent);
    setCurrentAgent(finalAgent);
    onComplete(finalAgent);
  };

  const handleSkillsMdImport = (content: string) => {
    setRawSkillsMd(content);
    const parsed = parseSkillsMd(content);
    setSkills(prev => ({ ...prev, ...parsed }));
  };

  const overallRating = calculateOverallRating(skills);
  const detectedArchetype = detectArchetype(skills);

  const CurrentStepIcon = STEPS[currentStep].icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header Progress */}
      <div className="border-b border-border/50 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Swords className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-display text-lg">Create Your Agent</h1>
                <p className="text-xs text-muted-foreground">Step {currentStep + 1} of {STEPS.length}</p>
              </div>
            </div>
            {onSkip && (
              <Button variant="ghost" onClick={onSkip}>
                Skip for now
              </Button>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex-1 flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  index <= currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-1 rounded-full transition-colors ${
                    index < currentStep ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 py-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Step 1: Welcome */}
              {currentStep === 0 && (
                <WelcomeStep onNext={handleNext} />
              )}

              {/* Step 2: Identity */}
              {currentStep === 1 && (
                <IdentityStep 
                  skills={skills}
                  onUpdate={setSkills}
                />
              )}

              {/* Step 3: Skills */}
              {currentStep === 2 && (
                <SkillsStep
                  skills={skills}
                  onUpdate={setSkills}
                  rawSkillsMd={rawSkillsMd}
                  onRawChange={handleSkillsMdImport}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  overallRating={overallRating}
                  archetype={detectedArchetype}
                />
              )}

              {/* Step 4: Personality */}
              {currentStep === 3 && (
                <PersonalityStep
                  personality={personality}
                  backstory={backstory}
                  onUpdatePersonality={setPersonality}
                  onUpdateBackstory={setBackstory}
                />
              )}

              {/* Step 5: Review */}
              {currentStep === 4 && (
                <ReviewStep
                  agent={{ ...agent!, skills, personality, backstory } as CompleteAgent}
                  overallRating={overallRating}
                  archetype={detectedArchetype}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="border-t border-border/50 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Button onClick={handleNext} size="lg">
            {currentStep === STEPS.length - 1 ? (
              <>
                <Trophy className="w-4 h-4 mr-2" />
                Create Agent
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Step Components
function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center py-12">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 mb-8"
      >
        <Sparkles className="w-12 h-12 text-primary" />
      </motion.div>
      
      <h2 className="text-4xl font-display mb-4">
        Welcome to <span className="text-primary">FightBook</span>
      </h2>
      
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
        Create your AI fighter using the skills.md format. Define their abilities, 
        personality, and fighting style. Then watch them battle in real-time against 
        other agents.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
        <FeatureCard 
          icon={Target}
          title="Configure Skills"
          description="Set 25+ attributes from striking power to fight IQ"
        />
        <FeatureCard 
          icon={Brain}
          title="Define Personality"
          description="Choose attitude, quotes, and fighting philosophy"
        />
        <FeatureCard 
          icon={Swords}
          title="Watch Them Fight"
          description="3-minute rounds with authentic MMA techniques"
        />
      </div>

      <Button size="lg" onClick={onNext}>
        Get Started
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}

function IdentityStep({ 
  skills, 
  onUpdate 
}: { 
  skills: SkillsMdConfig; 
  onUpdate: (s: SkillsMdConfig) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display mb-2">Who is your fighter?</h2>
        <p className="text-muted-foreground">Start with the basics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Fighter Name</label>
          <Input
            value={skills.name}
            onChange={(e) => onUpdate({ ...skills, name: e.target.value })}
            placeholder="e.g., Knockout King"
            className="text-lg"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Nickname</label>
          <Input
            value={skills.nickname}
            onChange={(e) => onUpdate({ ...skills, nickname: e.target.value })}
            placeholder="e.g., The Destroyer"
            className="text-lg"
          />
        </div>
      </div>

      <div className="bg-muted/30 rounded-xl p-6">
        <h3 className="font-medium mb-4">Quick Presets</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { name: 'Striker', data: { striking: 85, punchSpeed: 80, wrestling: 40, aggression: 0.8 } },
            { name: 'Grappler', data: { striking: 45, wrestling: 90, submissions: 88, aggression: 0.5 } },
            { name: 'Balanced', data: { striking: 70, wrestling: 70, submissions: 65, aggression: 0.6 } },
            { name: 'Counter Fighter', data: { striking: 75, headMovement: 85, aggression: 0.3 } },
            { name: 'Pressure Fighter', data: { striking: 70, cardio: 85, aggression: 0.9 } },
          ].map((preset) => (
            <Button
              key={preset.name}
              variant="outline"
              onClick={() => onUpdate({ ...skills, ...preset.data })}
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SkillsStep({
  skills,
  onUpdate,
  rawSkillsMd,
  onRawChange,
  activeTab,
  setActiveTab,
  overallRating,
  archetype,
}: {
  skills: SkillsMdConfig;
  onUpdate: (s: SkillsMdConfig) => void;
  rawSkillsMd: string;
  onRawChange: (s: string) => void;
  activeTab: string;
  setActiveTab: (t: string) => void;
  overallRating: number;
  archetype: string;
}) {
  const updateStat = (key: keyof SkillsMdConfig, value: number) => {
    onUpdate({ ...skills, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-display mb-2">Configure Skills</h2>
          <p className="text-muted-foreground">Define your fighter's abilities</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-display text-primary">{overallRating}</div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Overall</p>
          <Badge variant="outline" className="mt-1 capitalize">
            {archetype}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="visual">Visual Editor</TabsTrigger>
          <TabsTrigger value="raw">skills.md</TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="space-y-6">
          {/* Striking */}
          <SkillSection title="Striking" icon={Target} color="text-red-500">
            <StatSlider label="Striking" value={skills.striking} onChange={(v) => updateStat('striking', v)} />
            <StatSlider label="Punch Speed" value={skills.punchSpeed} onChange={(v) => updateStat('punchSpeed', v)} />
            <StatSlider label="Kick Power" value={skills.kickPower} onChange={(v) => updateStat('kickPower', v)} />
            <StatSlider label="Head Movement" value={skills.headMovement} onChange={(v) => updateStat('headMovement', v)} />
            <StatSlider label="Footwork" value={skills.footwork} onChange={(v) => updateStat('footwork', v)} />
            <StatSlider label="Combinations" value={skills.combinations} onChange={(v) => updateStat('combinations', v)} />
          </SkillSection>

          {/* Grappling */}
          <SkillSection title="Grappling" icon={Shield} color="text-blue-500">
            <StatSlider label="Wrestling" value={skills.wrestling} onChange={(v) => updateStat('wrestling', v)} />
            <StatSlider label="Takedown Defense" value={skills.takedownDefense} onChange={(v) => updateStat('takedownDefense', v)} />
            <StatSlider label="Clinch Control" value={skills.clinchControl} onChange={(v) => updateStat('clinchControl', v)} />
            <StatSlider label="Trips" value={skills.trips} onChange={(v) => updateStat('trips', v)} />
            <StatSlider label="Throws" value={skills.throws} onChange={(v) => updateStat('throws', v)} />
          </SkillSection>

          {/* Ground Game */}
          <SkillSection title="Ground Game" icon={Zap} color="text-purple-500">
            <StatSlider label="Submissions" value={skills.submissions} onChange={(v) => updateStat('submissions', v)} />
            <StatSlider label="Submission Defense" value={skills.submissionDefense} onChange={(v) => updateStat('submissionDefense', v)} />
            <StatSlider label="Ground & Pound" value={skills.groundAndPound} onChange={(v) => updateStat('groundAndPound', v)} />
            <StatSlider label="Guard Passing" value={skills.guardPassing} onChange={(v) => updateStat('guardPassing', v)} />
            <StatSlider label="Sweeps" value={skills.sweeps} onChange={(v) => updateStat('sweeps', v)} />
            <StatSlider label="Top Control" value={skills.topControl} onChange={(v) => updateStat('topControl', v)} />
            <StatSlider label="Bottom Game" value={skills.bottomGame} onChange={(v) => updateStat('bottomGame', v)} />
          </SkillSection>

          {/* Physical */}
          <SkillSection title="Physical" icon={Sparkles} color="text-green-500">
            <StatSlider label="Cardio" value={skills.cardio} onChange={(v) => updateStat('cardio', v)} />
            <StatSlider label="Chin" value={skills.chin} onChange={(v) => updateStat('chin', v)} />
            <StatSlider label="Recovery" value={skills.recovery} onChange={(v) => updateStat('recovery', v)} />
            <StatSlider label="Strength" value={skills.strength} onChange={(v) => updateStat('strength', v)} />
            <StatSlider label="Flexibility" value={skills.flexibility} onChange={(v) => updateStat('flexibility', v)} />
          </SkillSection>

          {/* Mental */}
          <SkillSection title="Mental" icon={Brain} color="text-yellow-500">
            <StatSlider label="Fight IQ" value={skills.fightIQ} onChange={(v) => updateStat('fightIQ', v)} />
            <StatSlider label="Heart" value={skills.heart} onChange={(v) => updateStat('heart', v)} />
            <StatSlider label="Adaptability" value={skills.adaptability} onChange={(v) => updateStat('adaptability', v)} />
            <StatSlider label="Ring Generalship" value={skills.ringGeneralship} onChange={(v) => updateStat('ringGeneralship', v)} />
            <div className="pt-4">
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium">Aggression</label>
                <span className="text-sm font-mono">{Math.round(skills.aggression * 100)}%</span>
              </div>
              <Slider
                value={[skills.aggression * 100]}
                onValueChange={([v]) => updateStat('aggression', v / 100)}
                min={0}
                max={100}
              />
              <p className="text-xs text-muted-foreground mt-1">
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
            <p className="text-sm text-muted-foreground">
              Edit your fighter's configuration directly. This uses the standard skills.md format.
            </p>
            <Textarea
              value={rawSkillsMd}
              onChange={(e) => onRawChange(e.target.value)}
              className="font-mono text-sm min-h-[600px]"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const blob = new Blob([rawSkillsMd], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${skills.name.replace(/\s+/g, '_')}_skills.md`;
                  a.click();
                }}
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

function PersonalityStep({
  personality,
  backstory,
  onUpdatePersonality,
  onUpdateBackstory,
}: {
  personality: AgentPersonality;
  backstory: AgentBackstory;
  onUpdatePersonality: (p: AgentPersonality) => void;
  onUpdateBackstory: (b: AgentBackstory) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display mb-2">Personality & Backstory</h2>
        <p className="text-muted-foreground">What makes your fighter unique</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Personality
          </h3>
          
          <div className="space-y-2">
            <label className="text-sm">Archetype</label>
            <select
              value={personality.archetype}
              onChange={(e) => onUpdatePersonality({ ...personality, archetype: e.target.value as any })}
              className="w-full p-2 rounded-md border border-border bg-background"
            >
              <option value="striker">Striker</option>
              <option value="grappler">Grappler</option>
              <option value="balanced">Balanced</option>
              <option value="counter">Counter Fighter</option>
              <option value="pressure">Pressure Fighter</option>
              <option value="wildcard">Wildcard</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm">Attitude</label>
            <Input
              value={personality.attitude}
              onChange={(e) => onUpdatePersonality({ ...personality, attitude: e.target.value })}
              placeholder="e.g., Cocky, Humble, Intense"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm">Pre-Fight Quote</label>
            <Textarea
              value={personality.preFightQuote}
              onChange={(e) => onUpdatePersonality({ ...personality, preFightQuote: e.target.value })}
              placeholder="What they say before a fight..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm">Win Quote</label>
            <Textarea
              value={personality.winQuote}
              onChange={(e) => onUpdatePersonality({ ...personality, winQuote: e.target.value })}
              placeholder="What they say after winning..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm">Loss Quote</label>
            <Textarea
              value={personality.lossQuote}
              onChange={(e) => onUpdatePersonality({ ...personality, lossQuote: e.target.value })}
              placeholder="What they say after losing..."
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Backstory
          </h3>

          <div className="space-y-2">
            <label className="text-sm">Origin</label>
            <Input
              value={backstory.origin}
              onChange={(e) => onUpdateBackstory({ ...backstory, origin: e.target.value })}
              placeholder="Where they come from..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm">Training Camp</label>
            <Input
              value={backstory.trainingCamp}
              onChange={(e) => onUpdateBackstory({ ...backstory, trainingCamp: e.target.value })}
              placeholder="Where they train..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm">Signature Move</label>
            <Input
              value={backstory.signatureMove}
              onChange={(e) => onUpdateBackstory({ ...backstory, signatureMove: e.target.value })}
              placeholder="Their special technique..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm">Fighting Philosophy</label>
            <Textarea
              value={personality.fightingPhilosophy}
              onChange={(e) => onUpdatePersonality({ ...personality, fightingPhilosophy: e.target.value })}
              placeholder="Their approach to fighting..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewStep({ 
  agent, 
  overallRating, 
  archetype 
}: { 
  agent: CompleteAgent; 
  overallRating: number; 
  archetype: string;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display mb-2">Review Your Agent</h2>
        <p className="text-muted-foreground">Ready to enter the arena?</p>
      </div>

      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-8">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl font-display text-white">
            {agent.skills.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-3xl font-display">{agent.skills.name}</h3>
            <p className="text-lg text-muted-foreground">"{agent.skills.nickname}"</p>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="capitalize">{archetype}</Badge>
              <Badge>Rating: {overallRating}</Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <StatBox label="Striking" value={agent.skills.striking} />
          <StatBox label="Wrestling" value={agent.skills.wrestling} />
          <StatBox label="Submissions" value={agent.skills.submissions} />
          <StatBox label="Cardio" value={agent.skills.cardio} />
          <StatBox label="Chin" value={agent.skills.chin} />
          <StatBox label="Fight IQ" value={agent.skills.fightIQ} />
        </div>

        <div className="mt-6 pt-6 border-t border-border/50">
          <p className="text-sm text-muted-foreground italic">
            "{agent.personality.preFightQuote}"
          </p>
        </div>
      </div>

      <div className="bg-muted/30 rounded-xl p-6">
        <h4 className="font-medium mb-4">What's Next?</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            Your agent will be saved to your roster
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            Jump straight into a test fight
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            Edit skills anytime from your profile
          </li>
        </ul>
      </div>
    </div>
  );
}

// Helper Components
function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="bg-card border border-border/50 rounded-xl p-6 text-left">
      <Icon className="w-8 h-8 text-primary mb-4" />
      <h3 className="font-display text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function SkillSection({ title, icon: Icon, color, children }: { title: string, icon: any, color: string, children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border/50 rounded-xl p-6">
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

function StatSlider({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <label className="text-sm">{label}</label>
        <span className="text-sm font-mono font-bold">{value}</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={0}
        max={100}
        step={1}
      />
    </div>
  );
}

function StatBox({ label, value }: { label: string, value: number }) {
  return (
    <div className="bg-background/50 rounded-lg p-3">
      <div className="text-2xl font-display">{value}</div>
      <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
    </div>
  );
}

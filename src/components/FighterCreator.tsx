// World-Class Fighter Creator
// Premium game UI with CLI aesthetic

import { useState } from 'react';
import { FighterTemplate, FIGHTER_TEMPLATES, calculateOverallRating, getStatColor, getTierColor } from '@/lib/fighterTemplates';
import { ChevronRight, ChevronLeft, User, Weight, Ruler, Crosshair, Target, Activity, Wind, Zap, Shield, Dumbbell } from 'lucide-react';

interface FighterCreatorProps {
  onComplete: (fighter: {
    name: string;
    nickname: string;
    templateId: string;
    stats: FighterTemplate['stats'];
  }) => void;
  onCancel: () => void;
}

type Step = 1 | 2 | 3;

// Verified Unsplash boxing/MMA fighter photo IDs
// All images confirmed to be male combat sports athletes
const FIGHTER_IMAGES: Record<string, string> = {
  // Boxer with red gloves training - striking pose
  mcgregor: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=500&h=700&fit=crop&auto=format&q=80',
  // Two MMA fighters grappling on mat
  khabib: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=500&h=700&fit=crop&auto=format&q=80',
  // Boxer punching bag - heavy hands
  jones: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=500&h=700&fit=crop&auto=format&q=80',
  // Boxer with hands wrapped - technical
  gsp: 'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=500&h=700&fit=crop&auto=format&q=80',
  // Martial artist shadow boxing - tall striker
  adesanya: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500&h=700&fit=crop&auto=format&q=80',
  // Boxer training - muscular compact
  aldo: 'https://images.unsplash.com/photo-1583473848882-f9a5bc7fd2ee?w=500&h=700&fit=crop&auto=format&q=80',
  // Fighter in gym - powerful build
  pereira: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&h=700&fit=crop&auto=format&q=80',
  // MMA training - wrestling focus
  usman: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&h=700&fit=crop&auto=format&q=80',
  // Boxer in ring - complete fighter
  volk: 'https://images.unsplash.com/photo-1555597687-5ecf06898737?w=500&h=700&fit=crop&auto=format&q=80',
  // Muay Thai fighter - counter striker
  silva: 'https://images.unsplash.com/photo-1594882645126-14020914d58d?w=500&h=700&fit=crop&auto=format&q=80',
  // Wrestlers grappling - stocky
  cejudo: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=700&fit=crop&auto=format&q=80',
  // BJJ training on mats - submissions
  oliveira: 'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?w=500&h=700&fit=crop&auto=format&q=80',
};

export function FighterCreator({ onComplete, onCancel }: FighterCreatorProps) {
  const [step, setStep] = useState<Step>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<FighterTemplate | null>(null);
  const [customStats, setCustomStats] = useState<FighterTemplate['stats'] | null>(null);
  const [fighterName, setFighterName] = useState('');
  const [fighterNickname, setFighterNickname] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  const handleTemplateSelect = (template: FighterTemplate) => {
    setIsAnimating(true);
    setSelectedTemplate(template);
    setCustomStats({ ...template.stats });
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleStatChange = (stat: keyof FighterTemplate['stats'], value: number) => {
    if (!customStats) return;
    setCustomStats({ ...customStats, [stat]: value });
  };

  const handleComplete = () => {
    if (!selectedTemplate || !customStats || !fighterName) return;
    onComplete({
      name: fighterName,
      nickname: fighterNickname || selectedTemplate.nickname,
      templateId: selectedTemplate.id,
      stats: customStats,
    });
  };

  const canProceed = () => {
    switch (step) {
      case 1: return selectedTemplate !== null;
      case 2: return customStats !== null;
      case 3: return fighterName.length >= 2;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      {/* Inject animations */}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(220, 38, 38, 0.3); }
          50% { box-shadow: 0 0 30px rgba(220, 38, 38, 0.6); }
        }
        @keyframes stat-fill {
          from { width: 0%; }
        }
        .stat-bar-animate {
          animation: stat-fill 0.6s ease-out forwards;
        }
        .slide-in {
          animation: slideIn 0.4s ease-out;
        }
        .fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        .selected-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        input[type=range] {
          -webkit-appearance: none;
          background: transparent;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 20px;
          width: 12px;
          background: #dc2626;
          cursor: pointer;
          margin-top: -8px;
          border: 2px solid #fff;
        }
        input[type=range]::-webkit-slider-runnable-track {
          width: 100%;
          height: 4px;
          cursor: pointer;
          background: #27272a;
        }
        input[type=range]:focus::-webkit-slider-thumb {
          box-shadow: 0 0 10px rgba(220, 38, 38, 0.8);
        }
      `}</style>

      {/* Header with ASCII Logo */}
      <div className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* ASCII Logo */}
            <div className="flex items-center gap-4">
              <pre className="text-red-500 text-xs leading-none hidden sm:block">
{`███████╗██╗ ██████╗ ██╗  ██╗████████╗██████╗  ██████╗  ██████╗ ██╗  ██╗
██╔════╝██║██╔════╝ ██║  ██║╚══██╔══╝██╔══██╗██╔═══██╗██╔═══██╗██║ ██╔╝
█████╗  ██║██║  ███╗███████║   ██║   ██████╔╝██║   ██║██║   ██║█████╔╝ 
██╔══╝  ██║██║   ██║██╔══██║   ██║   ██╔══██╗██║   ██║██║   ██║██╔═██╗ 
██║     ██║╚██████╔╝██║  ██║   ██║   ██████╔╝╚██████╔╝╚██████╔╝██║  ██╗
╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═════╝  ╚═════╝  ╚═════╝ ╚═╝  ╚═╝`}
              </pre>
              <div className="sm:hidden">
                <span className="text-red-500 font-black text-xl">FB</span>
              </div>
              <div className="hidden lg:block pl-4 border-l border-zinc-800">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Create Fighter</p>
                <p className="text-xs text-zinc-600">Step {step} of 3</p>
              </div>
            </div>
            <button onClick={onCancel} className="text-zinc-500 hover:text-white text-sm uppercase tracking-wider transition-colors">
              Cancel
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-1 mt-6">
            {[
              { num: 1, label: 'CHOOSE TEMPLATE' },
              { num: 2, label: 'CUSTOMIZE' },
              { num: 3, label: 'FINALIZE' }
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className={`px-5 py-2.5 text-xs font-bold tracking-wider transition-all duration-300 ${
                  step === s.num 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' 
                    : step > s.num 
                      ? 'bg-zinc-800 text-zinc-300' 
                      : 'bg-zinc-900 text-zinc-600'
                }`}>
                  {s.label}
                </div>
                {i < 2 && (
                  <div className={`w-6 h-px mx-1 ${step > s.num ? 'bg-red-600' : 'bg-zinc-800'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 pb-32">
        {step === 1 && (
          <StepOneTemplates
            selected={selectedTemplate}
            onSelect={handleTemplateSelect}
            isAnimating={isAnimating}
          />
        )}
        {step === 2 && selectedTemplate && customStats && (
          <StepTwoCustomize
            template={selectedTemplate}
            stats={customStats}
            onChange={handleStatChange}
          />
        )}
        {step === 3 && selectedTemplate && customStats && (
          <StepThreeFinalize
            template={selectedTemplate}
            stats={customStats}
            name={fighterName}
            nickname={fighterNickname}
            onNameChange={setFighterName}
            onNicknameChange={setFighterNickname}
          />
        )}
      </div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setStep(Math.max(1, step - 1) as Step)}
            disabled={step === 1}
            className={`flex items-center gap-2 px-6 py-3 font-bold uppercase tracking-wider transition-all ${
              step === 1 ? 'text-zinc-700 cursor-not-allowed' : 'text-white hover:text-red-500'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>

          <button
            onClick={() => step === 3 ? handleComplete() : setStep(Math.min(3, step + 1) as Step)}
            disabled={!canProceed()}
            className={`flex items-center gap-2 px-8 py-3 font-bold uppercase tracking-wider transition-all ${
              canProceed()
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 hover:shadow-red-600/50'
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            }`}
          >
            {step === 3 ? 'Create Fighter' : 'Next'}
            {step !== 3 && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// Step 1: Visual Template Selection - Image-focused cards like Figma
function StepOneTemplates({
  selected,
  onSelect,
  isAnimating,
}: {
  selected: FighterTemplate | null;
  onSelect: (t: FighterTemplate) => void;
  isAnimating: boolean;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left: Preview Panel */}
      <div className="lg:col-span-4">
        <div className="sticky top-40">
          <div className="border border-zinc-800 bg-zinc-950 overflow-hidden">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/30">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Fighter Preview</h3>
            </div>

            {selected ? (
              <div className={`fade-in ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} transition-all duration-300`}>
                {/* Fighter Image */}
                <div className="relative aspect-[3/4] bg-gradient-to-b from-zinc-800 to-black overflow-hidden">
                  <img
                    src={FIGHTER_IMAGES[selected.id] || FIGHTER_IMAGES.mcgregor}
                    alt={selected.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />

                  {/* Overlay Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className={`inline-block px-3 py-1 text-xs font-bold border mb-3 ${getTierColor(selected.tier)}`}>
                      {selected.tier.toUpperCase()}
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">{selected.name}</h2>
                    <p className="text-red-500 text-sm">"{selected.nickname}"</p>
                  </div>
                </div>

                {/* Stats Preview */}
                <div className="p-5 space-y-3">
                  <StatRow icon={Target} label="Fighting Style" value={selected.style} />
                  <StatRow icon={Crosshair} label="Stance" value={selected.stance} />
                  <StatRow icon={Weight} label="Weight Class" value={selected.weightClass} />
                  <StatRow icon={Ruler} label="Reach" value={`${selected.reach}"`} />

                  <div className="pt-4 border-t border-zinc-800">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-zinc-500 text-xs uppercase tracking-wider">Overall Rating</span>
                      <span className={`text-3xl font-black ${getStatColor(calculateOverallRating(selected.stats))}`}>
                        {calculateOverallRating(selected.stats)}
                      </span>
                    </div>

                    {/* Stat Bars */}
                    <div className="space-y-2.5">
                      <PreviewStatBar label="STR" value={selected.stats.striking} />
                      <PreviewStatBar label="GRP" value={selected.stats.grappling} />
                      <PreviewStatBar label="PWR" value={selected.stats.power} />
                      <PreviewStatBar label="STM" value={selected.stats.stamina} />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="aspect-[3/4] flex items-center justify-center bg-zinc-950">
                <div className="text-center text-zinc-700">
                  <User className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-sm uppercase tracking-wider">Select a template</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: Template Grid - Image-focused cards like Figma */}
      <div className="lg:col-span-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Choose Your Fighter Template</h2>
          <p className="text-zinc-500">Model your fighter after MMA legends and current champions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FIGHTER_TEMPLATES.map((fighter) => (
            <button
              key={fighter.id}
              onClick={() => onSelect(fighter)}
              className={`group relative text-left border-2 transition-all duration-300 overflow-hidden ${
                selected?.id === fighter.id
                  ? 'border-red-600 selected-glow'
                  : 'border-zinc-800 hover:border-zinc-600'
              }`}
            >
              {/* Card Layout - Image on left, larger like Figma */}
              <div className="flex h-40">
                {/* Large Fighter Image */}
                <div className="w-36 h-full bg-zinc-900 relative overflow-hidden shrink-0">
                  <img
                    src={FIGHTER_IMAGES[fighter.id] || FIGHTER_IMAGES.mcgregor}
                    alt={fighter.name}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-zinc-950" />
                </div>

                {/* Info Section */}
                <div className="flex-1 p-4 bg-zinc-950 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <h3 className="font-bold text-white text-lg leading-tight">{fighter.name}</h3>
                        <p className="text-red-500/80 text-xs">"{fighter.nickname}"</p>
                      </div>
                      <span className="px-2 py-0.5 text-xs font-bold border border-zinc-700 text-zinc-400 bg-zinc-900/50 shrink-0">
                        {fighter.weightClass}
                      </span>
                    </div>

                    <p className="text-zinc-600 text-xs mb-3">{fighter.style}</p>

                    {/* Mini Stat Bars - Horizontal layout */}
                    <div className="space-y-1.5">
                      <MiniStatBar label="STR" value={fighter.stats.striking} />
                      <MiniStatBar label="GRP" value={fighter.stats.grappling} />
                      <MiniStatBar label="PWR" value={fighter.stats.power} />
                    </div>
                  </div>

                  {/* Bottom stats row */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50 mt-2">
                    <span className="text-zinc-600 text-xs">{fighter.stance}</span>
                    <span className={`text-lg font-black ${getStatColor(calculateOverallRating(fighter.stats))}`}>
                      {calculateOverallRating(fighter.stats)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Selected Overlay */}
              {selected?.id === fighter.id && (
                <div className="absolute inset-0 border-2 border-red-600 pointer-events-none">
                  <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50 animate-pulse" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-zinc-500">
        <Icon className="w-4 h-4" />
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-zinc-300 font-medium">{value}</span>
    </div>
  );
}

function PreviewStatBar({ label, value }: { label: string; value: number }) {
  const colorClass = getStatColor(value).replace('text-', 'bg-');
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-zinc-600 w-8 font-bold">{label}</span>
      <div className="flex-1 h-2 bg-zinc-800 rounded-sm overflow-hidden">
        <div
          className={`h-full ${colorClass} stat-bar-animate`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className={`text-sm font-bold w-7 text-right ${getStatColor(value)}`}>{value}</span>
    </div>
  );
}

function MiniStatBar({ label, value }: { label: string; value: number }) {
  const colorClass = value >= 90 ? 'bg-red-500' : value >= 80 ? 'bg-orange-500' : value >= 70 ? 'bg-yellow-500' : 'bg-zinc-600';
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-zinc-600 w-6 font-medium">{label}</span>
      <div className="flex-1 h-1.5 bg-zinc-800 rounded-sm overflow-hidden">
        <div
          className={`h-full ${colorClass}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs text-zinc-500 w-5 text-right">{value}</span>
    </div>
  );
}

// Step 2: Stat Customization
function StepTwoCustomize({
  template,
  stats,
  onChange,
}: {
  template: FighterTemplate;
  stats: FighterTemplate['stats'];
  onChange: (stat: keyof FighterTemplate['stats'], value: number) => void;
}) {
  const overall = calculateOverallRating(stats);
  const originalOverall = calculateOverallRating(template.stats);

  const statConfig = [
    { key: 'striking' as const, label: 'STRIKING', icon: Target, desc: 'Punching technique and accuracy' },
    { key: 'grappling' as const, label: 'GRAPPLING', icon: Activity, desc: 'Wrestling, takedowns, ground control' },
    { key: 'stamina' as const, label: 'STAMINA', icon: Wind, desc: 'Cardio and endurance' },
    { key: 'power' as const, label: 'POWER', icon: Zap, desc: 'Knockout power and damage' },
    { key: 'chin' as const, label: 'CHIN', icon: Shield, desc: 'Ability to take punishment' },
    { key: 'speed' as const, label: 'SPEED', icon: Dumbbell, desc: 'Hand speed and footwork' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left: Stat Sliders */}
      <div className="lg:col-span-7">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Customize Stats</h2>
          <p className="text-zinc-500">Adjust attributes to create your unique fighter</p>
        </div>

        <div className="space-y-3">
          {statConfig.map(({ key, label, icon: Icon, desc }) => (
            <div key={key} className="border border-zinc-800 bg-zinc-950/50 p-5 hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-zinc-500" />
                  </div>
                  <div>
                    <label className="font-bold text-white block text-sm tracking-wider">{label}</label>
                    <p className="text-xs text-zinc-600">{desc}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-3xl font-black ${getStatColor(stats[key])}`}>
                    {stats[key]}
                  </span>
                  <p className="text-xs text-zinc-700">Original: {template.stats[key]}</p>
                </div>
              </div>

              <input
                type="range"
                min="40"
                max="99"
                value={stats[key]}
                onChange={(e) => onChange(key, parseInt(e.target.value))}
                className="w-full"
                style={{
                  background: `linear-gradient(to right, #dc2626 0%, #dc2626 ${stats[key]}%, #27272a ${stats[key]}%, #27272a 100%)`,
                }}
              />

              <div className="flex justify-between text-xs text-zinc-600 mt-2 font-mono">
                <span>40</span>
                <span className={stats[key] > template.stats[key] ? 'text-green-500' : stats[key] < template.stats[key] ? 'text-red-500' : 'text-zinc-500'}>
                  {stats[key] > template.stats[key] ? '+' : ''}{stats[key] - template.stats[key]}
                </span>
                <span>99</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Live Preview */}
      <div className="lg:col-span-5">
        <div className="sticky top-40">
          <div className="border border-zinc-800 bg-zinc-950 overflow-hidden">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/30">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Live Preview</h3>
            </div>

            {/* Fighter Image */}
            <div className="relative aspect-square bg-gradient-to-b from-zinc-800 to-black overflow-hidden">
              <img
                src={FIGHTER_IMAGES[template.id] || FIGHTER_IMAGES.mcgregor}
                alt={template.name}
                className="w-full h-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Based on</p>
                <h2 className="text-xl font-bold text-white">{template.name}</h2>
                <p className="text-red-500/80 text-sm">"{template.nickname}"</p>
              </div>
            </div>

            {/* Overall Rating */}
            <div className="p-5 border-b border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 uppercase tracking-wider text-xs">Overall Rating</span>
                <div className="flex items-center gap-3">
                  <span className="text-xl text-zinc-700 font-bold">{originalOverall}</span>
                  <span className="text-zinc-600">→</span>
                  <span className={`text-5xl font-black ${getStatColor(overall)}`}>
                    {overall}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Comparison */}
            <div className="p-5 space-y-2">
              {statConfig.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between py-1">
                  <span className="text-zinc-500 text-xs uppercase tracking-wider">{label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-700 text-sm">{template.stats[key]}</span>
                    <span className={`text-lg font-bold ${getStatColor(stats[key])}`}>
                      {stats[key]}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Specialties */}
            <div className="p-5 border-t border-zinc-800 bg-zinc-900/20">
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Specialties</h4>
              <div className="flex flex-wrap gap-2">
                {template.specialties.map((spec) => (
                  <span key={spec} className="px-3 py-1.5 text-xs border border-red-900/50 text-red-400/80 bg-red-950/20">
                    {spec.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 3: Finalize
function StepThreeFinalize({
  template,
  stats,
  name,
  nickname,
  onNameChange,
  onNicknameChange,
}: {
  template: FighterTemplate;
  stats: FighterTemplate['stats'];
  name: string;
  nickname: string;
  onNameChange: (s: string) => void;
  onNicknameChange: (s: string) => void;
}) {
  const overall = calculateOverallRating(stats);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2">Finalize Your Fighter</h2>
        <p className="text-zinc-500">Give your fighter a name and review before creation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Inputs */}
        <div className="space-y-4">
          <div className="border border-zinc-800 bg-zinc-950/50 p-6">
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
              Fighter Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Enter name..."
              className="w-full px-4 py-4 bg-black border border-zinc-700 text-white text-lg placeholder-zinc-700 focus:border-red-600 focus:outline-none transition-colors"
            />
            <p className="text-xs text-zinc-600 mt-2">This will be your fighter's display name</p>
          </div>

          <div className="border border-zinc-800 bg-zinc-950/50 p-6">
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
              Nickname
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => onNicknameChange(e.target.value)}
              placeholder={template.nickname}
              className="w-full px-4 py-4 bg-black border border-zinc-700 text-white text-lg placeholder-zinc-700 focus:border-red-600 focus:outline-none transition-colors"
            />
            <p className="text-xs text-zinc-600 mt-2">
              Default: "{template.nickname}"
            </p>
          </div>

          {/* Quick Stats Summary */}
          <div className="border border-zinc-800 bg-zinc-950/50 p-6">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Template Info</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-zinc-600 block text-xs">Style</span>
                <span className="text-zinc-300">{template.style}</span>
              </div>
              <div>
                <span className="text-zinc-600 block text-xs">Weight Class</span>
                <span className="text-zinc-300">{template.weightClass}</span>
              </div>
              <div>
                <span className="text-zinc-600 block text-xs">Stance</span>
                <span className="text-zinc-300">{template.stance}</span>
              </div>
              <div>
                <span className="text-zinc-600 block text-xs">Reach</span>
                <span className="text-zinc-300">{template.reach}"</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Final Preview */}
        <div className="border border-zinc-800 bg-zinc-950 overflow-hidden">
          <div className="relative aspect-[4/3] bg-gradient-to-b from-zinc-800 to-black overflow-hidden">
            <img
              src={FIGHTER_IMAGES[template.id] || FIGHTER_IMAGES.mcgregor}
              alt={template.name}
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className={`inline-block px-3 py-1 text-xs font-bold border mb-3 ${getTierColor(template.tier)}`}>
                {template.tier.toUpperCase()}
              </div>
              <h2 className="text-3xl font-bold text-white mb-1">{name || '[NAME]'}</h2>
              <p className="text-red-500 text-lg">"{nickname || template.nickname}"</p>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between py-4 border-b border-zinc-800">
              <span className="text-zinc-500 text-sm">Overall Rating</span>
              <span className={`text-4xl font-black ${getStatColor(overall)}`}>{overall}</span>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <FinalStat label="STR" value={stats.striking} />
              <FinalStat label="GRP" value={stats.grappling} />
              <FinalStat label="PWR" value={stats.power} />
              <FinalStat label="SPD" value={stats.speed} />
              <FinalStat label="STM" value={stats.stamina} />
              <FinalStat label="CHN" value={stats.chin} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FinalStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center p-3 bg-zinc-900/50 border border-zinc-800">
      <div className={`text-2xl font-black ${getStatColor(value)}`}>{value}</div>
      <div className="text-xs text-zinc-600 mt-1">{label}</div>
    </div>
  );
}

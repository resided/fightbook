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

// Pixel art fighter avatars - CSS-based retro style
// Each fighter has unique colors based on their style
const FIGHTER_PIXEL_ART: Record<string, { bg: string; accent: string; pattern: string }> = {
  mcgregor: { bg: 'from-green-900 to-black', accent: '#22c55e', pattern: 'striker' },
  khabib: { bg: 'from-red-950 to-black', accent: '#dc2626', pattern: 'grappler' },
  jones: { bg: 'from-purple-950 to-black', accent: '#a855f7', pattern: 'complete' },
  gsp: { bg: 'from-blue-950 to-black', accent: '#3b82f6', pattern: 'wrestler' },
  adesanya: { bg: 'from-orange-950 to-black', accent: '#f97316', pattern: 'striker' },
  aldo: { bg: 'from-yellow-950 to-black', accent: '#eab308', pattern: 'striker' },
  pereira: { bg: 'from-red-900 to-black', accent: '#ef4444', pattern: 'power' },
  usman: { bg: 'from-emerald-950 to-black', accent: '#10b981', pattern: 'wrestler' },
  volk: { bg: 'from-cyan-950 to-black', accent: '#06b6d4', pattern: 'complete' },
  silva: { bg: 'from-pink-950 to-black', accent: '#ec4899', pattern: 'counter' },
  cejudo: { bg: 'from-indigo-950 to-black', accent: '#6366f1', pattern: 'wrestler' },
  oliveira: { bg: 'from-lime-950 to-black', accent: '#84cc16', pattern: 'grappler' },
};

// Pixel Art Avatar Component
function PixelAvatar({ fighterId, size = 'large' }: { fighterId: string; size?: 'small' | 'large' }) {
  const art = FIGHTER_PIXEL_ART[fighterId] || FIGHTER_PIXEL_ART.mcgregor;
  const isSmall = size === 'small';
  
  return (
    <div className={`relative overflow-hidden bg-gradient-to-b ${art.bg} ${isSmall ? 'w-28 h-36' : 'w-full h-full'}`}>
      {/* Pixel grid pattern */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `
          linear-gradient(to right, ${art.accent}20 1px, transparent 1px),
          linear-gradient(to bottom, ${art.accent}20 1px, transparent 1px)
        `,
        backgroundSize: isSmall ? '8px 8px' : '12px 12px'
      }} />
      
      {/* Pixel art silhouette */}
      <svg 
        viewBox="0 0 100 140" 
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id={`grid-${fighterId}`} width="10" height="10" patternUnits="userSpaceOnUse">
            <rect width="10" height="10" fill="none" stroke={art.accent} strokeOpacity="0.1" strokeWidth="0.5"/>
          </pattern>
        </defs>
        
        {/* Background grid */}
        <rect width="100" height="140" fill={`url(#grid-${fighterId})`} />
        
        {/* Fighter silhouette based on pattern type */}
        {art.pattern === 'striker' && (
          <g fill={art.accent} fillOpacity="0.6">
            {/* Head */}
            <rect x="40" y="15" width="20" height="20" />
            {/* Torso */}
            <rect x="35" y="35" width="30" height="35" />
            {/* Gloves up */}
            <rect x="20" y="40" width="15" height="15" />
            <rect x="65" y="40" width="15" height="15" />
            {/* Arms */}
            <rect x="25" y="50" width="10" height="20" />
            <rect x="65" y="50" width="10" height="20" />
            {/* Legs */}
            <rect x="35" y="70" width="12" height="40" />
            <rect x="53" y="70" width="12" height="40" />
          </g>
        )}
        
        {art.pattern === 'grappler' && (
          <g fill={art.accent} fillOpacity="0.6">
            {/* Head */}
            <rect x="42" y="20" width="16" height="16" />
            {/* Wide torso */}
            <rect x="30" y="36" width="40" height="30" />
            {/* Arms ready for grappling */}
            <rect x="15" y="45" width="15" height="10" />
            <rect x="70" y="45" width="15" height="10" />
            <rect x="20" y="50" width="10" height="15" />
            <rect x="70" y="50" width="10" height="15" />
            {/* Wide stance */}
            <rect x="25" y="66" width="15" height="35" />
            <rect x="60" y="66" width="15" height="35" />
          </g>
        )}
        
        {art.pattern === 'wrestler' && (
          <g fill={art.accent} fillOpacity="0.6">
            {/* Head */}
            <rect x="40" y="18" width="20" height="18" />
            {/* Athletic torso */}
            <rect x="32" y="36" width="36" height="32" />
            {/* Arms athletic */}
            <rect x="18" y="42" width="14" height="12" />
            <rect x="68" y="42" width="14" height="12" />
            <rect x="22" y="50" width="10" height="18" />
            <rect x="68" y="50" width="10" height="18" />
            {/* Legs */}
            <rect x="32" y="68" width="14" height="38" />
            <rect x="54" y="68" width="14" height="38" />
          </g>
        )}
        
        {art.pattern === 'complete' && (
          <g fill={art.accent} fillOpacity="0.6">
            {/* Head */}
            <rect x="41" y="16" width="18" height="18" />
            {/* Balanced torso */}
            <rect x="33" y="34" width="34" height="34" />
            {/* Balanced arms */}
            <rect x="18" y="40" width="15" height="12" />
            <rect x="67" y="40" width="15" height="12" />
            <rect x="22" y="48" width="11" height="20" />
            <rect x="67" y="48" width="11" height="20" />
            {/* Balanced legs */}
            <rect x="33" y="68" width="14" height="38" />
            <rect x="53" y="68" width="14" height="38" />
          </g>
        )}
        
        {art.pattern === 'power' && (
          <g fill={art.accent} fillOpacity="0.6">
            {/* Head */}
            <rect x="40" y="15" width="20" height="20" />
            {/* Muscular torso */}
            <rect x="28" y="35" width="44" height="32" />
            {/* Thick arms */}
            <rect x="12" y="40" width="16" height="14" />
            <rect x="72" y="40" width="16" height="14" />
            <rect x="16" y="50" width="12" height="18" />
            <rect x="72" y="50" width="12" height="18" />
            {/* Thick legs */}
            <rect x="30" y="67" width="16" height="40" />
            <rect x="54" y="67" width="16" height="40" />
          </g>
        )}
        
        {art.pattern === 'counter' && (
          <g fill={art.accent} fillOpacity="0.6">
            {/* Head */}
            <rect x="42" y="14" width="16" height="18" />
            {/* Lean torso */}
            <rect x="36" y="32" width="28" height="36" />
            {/* Counter stance arms */}
            <rect x="22" y="38" width="14" height="10" />
            <rect x="64" y="42" width="14" height="10" />
            <rect x="26" y="44" width="10" height="22" />
            <rect x="64" y="48" width="10" height="22" />
            {/* Lean legs */}
            <rect x="36" y="68" width="12" height="40" />
            <rect x="52" y="68" width="12" height="40" />
          </g>
        )}
        
        {/* Vignette overlay */}
        <rect width="100" height="140" fill="url(#vignette)" />
        <defs>
          <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="100%" stopColor="black" stopOpacity="0.5" />
          </radialGradient>
        </defs>
      </svg>
      
      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none opacity-10" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, black 2px, black 4px)'
      }} />
    </div>
  );
}

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

      {/* Step Navigation */}
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: Preview Panel - Hidden on mobile, sticky on desktop */}
      <div className="hidden lg:block lg:col-span-4">
        <div className="sticky top-40">
          <div className="border border-zinc-800 bg-zinc-950 overflow-hidden">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/30">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Fighter Preview</h3>
            </div>

            {selected ? (
              <div className={`fade-in ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} transition-all duration-300`}>
                {/* Fighter Image */}
                <div className="relative aspect-[3/4] bg-gradient-to-b from-zinc-800 to-black overflow-hidden">
                  <PixelAvatar fighterId={selected.id} size="large" />
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

      {/* Mobile Selected Preview */}
      {selected && (
        <div className="lg:hidden mb-4 border border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-4 p-4">
            <div className="w-20 h-20 shrink-0">
              <PixelAvatar fighterId={selected.id} size="small" />
            </div>
            <div className="min-w-0 flex-1">
              <div className={`inline-block px-2 py-0.5 text-[10px] font-bold border mb-1 ${getTierColor(selected.tier)}`}>
                {selected.tier.toUpperCase()}
              </div>
              <h3 className="font-bold text-white text-lg truncate">{selected.name}</h3>
              <p className="text-red-500/80 text-xs truncate">"{selected.nickname}"</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                <span>{selected.weightClass}</span>
                <span className={`font-black ${getStatColor(calculateOverallRating(selected.stats))}`}>
                  OVR {calculateOverallRating(selected.stats)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Right: Template Grid */}
      <div className="col-span-1 lg:col-span-8">
        <div className="mb-4">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Choose Your Fighter Template</h2>
          <p className="text-zinc-500 text-sm">Model your fighter after MMA legends and current champions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
              {/* Card Layout - Compact and mobile-friendly */}
              <div className="flex">
                {/* Pixel Art Avatar */}
                <div className="w-28 sm:w-32 h-32 sm:h-36 relative overflow-hidden shrink-0">
                  <PixelAvatar fighterId={fighter.id} size="small" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-zinc-950/80" />
                </div>

                {/* Info Section - Compact */}
                <div className="flex-1 p-3 bg-zinc-950 flex flex-col justify-between min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-white text-base sm:text-lg leading-tight truncate">{fighter.name}</h3>
                      <p className="text-red-500/80 text-xs truncate">"{fighter.nickname}"</p>
                    </div>
                    <span className="px-1.5 py-0.5 text-[10px] font-bold border border-zinc-700 text-zinc-400 bg-zinc-900/50 shrink-0">
                      {fighter.weightClass}
                    </span>
                  </div>

                  {/* Style - Truncated */}
                  <p className="text-zinc-600 text-xs truncate mt-1">{fighter.style}</p>

                  {/* Mini Stat Bars */}
                  <div className="space-y-1 mt-2">
                    <CompactStatBar label="STR" value={fighter.stats.striking} />
                    <CompactStatBar label="GRP" value={fighter.stats.grappling} />
                    <CompactStatBar label="PWR" value={fighter.stats.power} />
                  </div>

                  {/* Footer - Stance & Overall */}
                  <div className="flex items-center justify-between pt-1.5 border-t border-zinc-800/50 mt-2">
                    <span className="text-zinc-600 text-xs">{fighter.stance}</span>
                    <span className={`text-xl font-black ${getStatColor(calculateOverallRating(fighter.stats))}`}>
                      {calculateOverallRating(fighter.stats)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Selected Indicator */}
              {selected?.id === fighter.id && (
                <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full shadow-lg shadow-red-500/50 animate-pulse" />
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

function CompactStatBar({ label, value }: { label: string; value: number }) {
  const colorClass = value >= 90 ? 'bg-red-500' : value >= 80 ? 'bg-orange-500' : value >= 70 ? 'bg-yellow-500' : value >= 60 ? 'bg-blue-500' : 'bg-zinc-600';
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-zinc-500 w-5 font-bold">{label}</span>
      <div className="flex-1 h-1 bg-zinc-800 rounded-sm overflow-hidden">
        <div className={`h-full ${colorClass}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[10px] text-zinc-400 w-4 text-right">{value}</span>
    </div>
  );
}

function MiniStatBar({ label, value }: { label: string; value: number }) {
  const colorClass = value >= 90 ? 'bg-red-500' : value >= 80 ? 'bg-orange-500' : value >= 70 ? 'bg-yellow-500' : value >= 60 ? 'bg-blue-500' : 'bg-zinc-600';
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
              <PixelAvatar fighterId={template.id} size="large" />
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
          <div className="relative aspect-[4/3] overflow-hidden">
            <PixelAvatar fighterId={template.id} size="large" />
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

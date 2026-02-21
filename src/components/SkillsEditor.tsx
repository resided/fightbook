import { useState, useEffect } from 'react';
import { Save, X, Download, Upload } from 'lucide-react';
import type { CompleteAgent } from '@/types/agent';
import { 
  createNewAgent, 
  generateFullSkillsMd, 
  parseSkillsMd,
  calculateOverallRating,
  detectArchetype,
  calculatePointsRemaining,
  POINT_BUDGET,
} from '@/types/agent';
import { Slider } from '@/components/ui/slider';

interface SkillsEditorProps {
  agent: CompleteAgent | null;
  onSave: (agent: CompleteAgent) => void;
  onCancel: () => void;
}

export default function SkillsEditor({ agent, onSave, onCancel }: SkillsEditorProps) {
  const [isEditing, setIsEditing] = useState(!agent);
  const [skillsMd, setSkillsMd] = useState('');
  const [previewAgent, setPreviewAgent] = useState<CompleteAgent | null>(null);
  const [activeTab, setActiveTab] = useState<'edit' | 'visual'>('edit');

  useEffect(() => {
    if (agent) {
      const md = generateFullSkillsMd(agent);
      setSkillsMd(md);
      setPreviewAgent(agent);
    } else {
      const newAgent = createNewAgent('');
      setSkillsMd(generateFullSkillsMd(newAgent));
      setPreviewAgent(newAgent);
    }
  }, [agent]);

  const handleSkillsMdChange = (value: string) => {
    setSkillsMd(value);
    try {
      const parsed = parseSkillsMd(value);
      const baseAgent = agent || createNewAgent(parsed.name || 'Unnamed');
      setPreviewAgent({
        ...baseAgent,
        skills: { ...baseAgent.skills, ...parsed },
      });
    } catch (error) {
      // Invalid syntax, ignore
    }
  };

  const handleSave = () => {
    if (previewAgent) {
      const remaining = calculatePointsRemaining(previewAgent.skills);
      if (remaining < 0) {
        return; // Don't save if over budget
      }
      onSave(previewAgent);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([skillsMd], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const name = previewAgent?.skills.name?.replace(/\s+/g, '_') || 'fighter';
    a.download = `${name}_skills.md`;
    a.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        handleSkillsMdChange(content);
      };
      reader.readAsText(file);
    }
  };

  if (!previewAgent) return null;

  const rating = calculateOverallRating(previewAgent.skills);
  const archetype = detectArchetype(previewAgent.skills);
  const isNew = !agent;
  const isOverBudget = calculatePointsRemaining(previewAgent.skills) < 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">
            {isNew ? 'Create New Agent' : `Edit ${agent?.skills.name}`}
          </h2>
          <p className="text-sm text-zinc-500">
            Configure via skills.md or visual editor
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onCancel}
            className="btn-minimal text-zinc-400"
          >
            <X className="w-4 h-4 inline mr-2" />
            cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isOverBudget}
            className={`btn-minimal border-orange-500/50 ${isOverBudget ? 'text-zinc-600 cursor-not-allowed' : 'text-orange-500'}`}
          >
            <Save className="w-4 h-4 inline mr-2" />
            save
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="flex items-center gap-4 text-sm">
        <div className="px-3 py-1.5 bg-zinc-900 rounded-sm">
          <span className="text-zinc-500">Rating:</span>
          <span className="ml-2 font-mono text-orange-500">{rating}</span>
        </div>
        <div className="px-3 py-1.5 bg-zinc-900 rounded-sm">
          <span className="text-zinc-500">Archetype:</span>
          <span className="ml-2 capitalize">{archetype}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('edit')}
          className={`pb-2 text-sm ${
            activeTab === 'edit' 
              ? 'text-orange-500 border-b-2 border-orange-500' 
              : 'text-zinc-500 hover:text-white'
          }`}
        >
          skills.md
        </button>
        <button
          onClick={() => setActiveTab('visual')}
          className={`pb-2 text-sm ${
            activeTab === 'visual' 
              ? 'text-orange-500 border-b-2 border-orange-500' 
              : 'text-zinc-500 hover:text-white'
          }`}
        >
          visual editor
        </button>
      </div>

      {/* Content */}
      {activeTab === 'edit' ? (
        <div className="space-y-3">
          {/* Budget Warning */}
          {isOverBudget && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-sm p-2 text-xs text-red-400">
              ⚠️ Over budget! Stats must be within 20-95 range and use max 1200 points total.
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <label className="btn-minimal cursor-pointer text-xs">
              <Upload className="w-3 h-3 inline mr-1" />
              import
              <input 
                type="file" 
                accept=".md,.txt" 
                className="hidden" 
                onChange={handleFileUpload}
              />
            </label>
            <button 
              onClick={handleDownload}
              className="btn-minimal text-xs"
            >
              <Download className="w-3 h-3 inline mr-1" />
              download
            </button>
          </div>

          <textarea
            value={skillsMd}
            onChange={(e) => handleSkillsMdChange(e.target.value)}
            className="w-full h-[280px] sm:h-[500px] bg-black border border-zinc-800 rounded-sm p-4 font-mono text-sm resize-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
            spellCheck={false}
          />
        </div>
      ) : (
        <VisualEditor 
          agent={previewAgent} 
          onChange={(newAgent) => {
            setPreviewAgent(newAgent);
            setSkillsMd(generateFullSkillsMd(newAgent));
          }}
        />
      )}
    </div>
  );
}

function VisualEditor({ 
  agent, 
  onChange 
}: { 
  agent: CompleteAgent; 
  onChange: (agent: CompleteAgent) => void;
}) {
  const pointsRemaining = calculatePointsRemaining(agent.skills);
  const budgetStatus = pointsRemaining >= 0 ? 
    { color: 'text-green-500', bg: 'bg-green-500/10' } : 
    { color: 'text-red-500', bg: 'bg-red-500/10' };

  const updateSkill = (key: keyof typeof agent.skills, value: number) => {
    onChange({
      ...agent,
      skills: { ...agent.skills, [key]: value },
    });
  };

  const updateString = (key: keyof typeof agent.skills, value: string) => {
    onChange({
      ...agent,
      skills: { ...agent.skills, [key]: value },
    });
  };

  const StatRow = ({ 
    label, 
    value, 
    onChange,
    min = POINT_BUDGET.MIN_STAT,
    max = POINT_BUDGET.MAX_STAT 
  }: { 
    label: string; 
    value: number; 
    onChange: (v: number) => void;
    min?: number;
    max?: number;
  }) => {
    const isAtMax = value >= max;
    
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">{label}</span>
          <span className={`font-mono ${isAtMax ? 'text-orange-500' : ''}`}>{value}</span>
        </div>
        <Slider
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          min={min}
          max={max}
          step={1}
          className="w-full"
        />
      </div>
    );
  };

  return (
    <div className="space-y-6 max-h-[70vh] sm:max-h-[500px] overflow-y-auto pr-2">
      {/* Budget Status */}
      <div className={`border rounded-sm p-4 ${budgetStatus.bg}`}>
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="text-zinc-400">Points Remaining: </span>
            <span className={`font-mono font-bold ${budgetStatus.color}`}>
              {pointsRemaining} / {POINT_BUDGET.TOTAL}
            </span>
          </div>
          <div className="text-xs text-zinc-500">
            Min: {POINT_BUDGET.MIN_STAT} | Max: {POINT_BUDGET.MAX_STAT}
          </div>
        </div>
        <div className="mt-2 h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all ${pointsRemaining >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
            style={{ width: `${Math.max(0, Math.min(100, (pointsRemaining / POINT_BUDGET.TOTAL) * 100))}%` }}
          />
        </div>
        {pointsRemaining < 0 && (
          <p className="text-xs text-red-500 mt-2">
            Over budget! Reduce stats to save.
          </p>
        )}
      </div>
      {/* Identity */}
      <div className="border border-zinc-800 rounded-sm p-4 space-y-4">
        <h3 className="text-xs uppercase tracking-wider text-zinc-500">Identity</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-zinc-400 block mb-2">Name</label>
            <input
              type="text"
              value={agent.skills.name}
              onChange={(e) => updateString('name', e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-sm px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-2">Nickname</label>
            <input
              type="text"
              value={agent.skills.nickname}
              onChange={(e) => updateString('nickname', e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-sm px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Striking */}
      <div className="border border-zinc-800 rounded-sm p-4 space-y-4">
        <h3 className="text-xs uppercase tracking-wider text-zinc-500">Striking</h3>
        <StatRow label="Striking" value={agent.skills.striking} onChange={(v) => updateSkill('striking', v)} />
        <StatRow label="Punch Speed" value={agent.skills.punchSpeed} onChange={(v) => updateSkill('punchSpeed', v)} />
        <StatRow label="Kick Power" value={agent.skills.kickPower} onChange={(v) => updateSkill('kickPower', v)} />
        <StatRow label="Head Movement" value={agent.skills.headMovement} onChange={(v) => updateSkill('headMovement', v)} />
      </div>

      {/* Grappling */}
      <div className="border border-zinc-800 rounded-sm p-4 space-y-4">
        <h3 className="text-xs uppercase tracking-wider text-zinc-500">Grappling</h3>
        <StatRow label="Wrestling" value={agent.skills.wrestling} onChange={(v) => updateSkill('wrestling', v)} />
        <StatRow label="Takedown Defense" value={agent.skills.takedownDefense} onChange={(v) => updateSkill('takedownDefense', v)} />
        <StatRow label="Submissions" value={agent.skills.submissions} onChange={(v) => updateSkill('submissions', v)} />
        <StatRow label="Submission Defense" value={agent.skills.submissionDefense} onChange={(v) => updateSkill('submissionDefense', v)} />
      </div>

      {/* Physical */}
      <div className="border border-zinc-800 rounded-sm p-4 space-y-4">
        <h3 className="text-xs uppercase tracking-wider text-zinc-500">Physical</h3>
        <StatRow label="Cardio" value={agent.skills.cardio} onChange={(v) => updateSkill('cardio', v)} />
        <StatRow label="Chin" value={agent.skills.chin} onChange={(v) => updateSkill('chin', v)} />
        <StatRow label="Recovery" value={agent.skills.recovery} onChange={(v) => updateSkill('recovery', v)} />
      </div>

      {/* Mental */}
      <div className="border border-zinc-800 rounded-sm p-4 space-y-4">
        <h3 className="text-xs uppercase tracking-wider text-zinc-500">Mental</h3>
        <StatRow label="Fight IQ" value={agent.skills.fightIQ} onChange={(v) => updateSkill('fightIQ', v)} />
        <StatRow label="Heart" value={agent.skills.heart} onChange={(v) => updateSkill('heart', v)} />
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Aggression</span>
            <span className="font-mono">{Math.round(agent.skills.aggression * 100)}%</span>
          </div>
          <Slider
            value={[agent.skills.aggression * 100]}
            onValueChange={([v]) => updateSkill('aggression', v / 100)}
            min={0}
            max={100}
          />
        </div>
      </div>
    </div>
  );
}

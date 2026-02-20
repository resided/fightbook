import { useState } from 'react';
import { Swords, Trash2, Edit2, User, Trophy, Bot, Medal } from 'lucide-react';
import type { CompleteAgent } from '@/types/agent';
import { calculateOverallRating, detectArchetype, DEFAULT_SKILLS } from '@/types/agent';

interface TerminalRosterProps {
  agents: CompleteAgent[];
  currentAgent: CompleteAgent | null;
  onCreate: () => void;
  onEdit: (agent: CompleteAgent) => void;
  onDelete: (id: string) => void;
  onSelect: (agent: CompleteAgent) => void;
  onFight: (agent1: CompleteAgent, agent2: CompleteAgent) => void;
  onFightCpu?: () => void;
}

export default function TerminalRoster({
  agents,
  currentAgent,
  onCreate,
  onEdit,
  onDelete,
  onSelect,
  onFight,
  onFightCpu,
}: TerminalRosterProps) {
  const [selectedForFight, setSelectedForFight] = useState<CompleteAgent | null>(null);

  const handleSelectForFight = (agent: CompleteAgent) => {
    if (selectedForFight?.metadata.id === agent.metadata.id) {
      setSelectedForFight(null);
    } else if (selectedForFight) {
      onFight(selectedForFight, agent);
      setSelectedForFight(null);
    } else {
      setSelectedForFight(agent);
    }
  };

  const generateCpuOpponent = (playerAgent: CompleteAgent): CompleteAgent => {
    const now = Date.now();
    const cpuNames = ['Iron Jaw', 'The Crusher', 'Phantom', 'Shadow', 'Tank', 'Viper', 'Blaze', 'Frost', 'Thunder', 'Apex'];
    const randomName = `${cpuNames[Math.floor(Math.random() * cpuNames.length)]} ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}.`;
    
    const baseSkills = { ...DEFAULT_SKILLS };
    
    Object.keys(baseSkills).forEach((key) => {
      if (typeof baseSkills[key as keyof typeof baseSkills] === 'number') {
        (baseSkills as any)[key] = Math.floor(40 + Math.random() * 50);
      }
    });
    
    const archetypes: Array<'striker' | 'grappler' | 'balanced' | 'wildcard'> = ['striker', 'grappler', 'balanced', 'wildcard'];
    const archetype = archetypes[Math.floor(Math.random() * archetypes.length)];
    
    if (archetype === 'striker') {
      baseSkills.striking += 20;
      baseSkills.punchSpeed += 20;
    } else if (archetype === 'grappler') {
      baseSkills.wrestling += 20;
      baseSkills.submissions += 20;
    }
    
    return {
      metadata: {
        id: `cpu_${now}_${Math.random().toString(36).substring(7)}`,
        name: randomName,
        createdAt: now,
        updatedAt: now,
        version: 1,
        totalFights: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        kos: 0,
        submissions: 0,
        currentStreak: 0,
        bestStreak: 0,
        ranking: 900 + Math.floor(Math.random() * 200),
        earnings: 0,
        xp: 0,
        level: 1,
      },
      skills: { ...baseSkills, name: randomName, nickname: archetype },
      personality: {
        archetype,
        attitude: ['intense', 'calm', 'aggressive'][Math.floor(Math.random() * 3)] as any,
        preFightQuote: "Let's go.",
        winQuote: 'Victory is mine.',
        lossQuote: 'I\'ll be back.',
        fightingPhilosophy: 'Adapt and overcome.',
      },
      backstory: {
        origin: 'CPU Generated',
        trainingCamp: 'FightBook Gym',
        signatureMove: 'The Finisher',
        rivalries: [],
        achievements: [],
      },
      social: {
        agentName: `cpu_${now}`,
      },
    };
  };

  const handleFightCpu = () => {
    if (!currentAgent) {
      onCreate();
      return;
    }
    const cpuOpponent = generateCpuOpponent(currentAgent);
    onFight(currentAgent, cpuOpponent);
  };

  if (agents.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-20 border border-zinc-800 rounded-sm">
          <div className="text-zinc-600 mb-4">No agents found</div>
          <div className="text-sm text-zinc-500 mb-6">
            Create your first AI fighter using the visual editor
          </div>
          <div className="flex items-center justify-center gap-3">
            <button 
              onClick={onCreate}
              className="btn-minimal text-orange-500 border-orange-500/50"
            >
              create agent
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Rankings Banner */}
      {agents.length > 0 && (
        <div className="border border-zinc-800 rounded-sm overflow-hidden">
          <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium">Rankings</span>
          </div>
          <div className="grid grid-cols-5 gap-4 px-4 py-3">
            {[...agents]
              .sort((a, b) => b.metadata.ranking - a.metadata.ranking)
              .slice(0, 5)
              .map((agent, index) => {
                const rating = calculateOverallRating(agent.skills);
                const medals = ['🥇', '🥈', '🥉', '4', '5'];
                return (
                  <div key={agent.metadata.id} className="flex items-center gap-2">
                    <span className="text-lg">{medals[index]}</span>
                    <div>
                      <div className="text-sm font-medium truncate max-w-[100px]">{agent.skills.name}</div>
                      <div className="text-xs text-zinc-500">
                        {agent.metadata.wins}-{agent.metadata.losses} • {rating} rating
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="text-zinc-500 text-sm">
          {agents.length} fighter{agents.length !== 1 ? 's' : ''} in roster
        </div>
        <div className="flex items-center gap-2">
          {selectedForFight && (
            <span className="text-sm text-orange-500">
              Select opponent for <strong>{selectedForFight.skills.name}</strong>
            </span>
          )}
          <button 
            onClick={onCreate}
            className="btn-minimal text-orange-500"
          >
            + new agent
          </button>
          <button 
            onClick={handleFightCpu}
            disabled={agents.length === 0}
            className="btn-minimal text-blue-400 disabled:opacity-30 flex items-center gap-2"
          >
            <Bot className="w-4 h-4" />
            fight cpu
          </button>
        </div>
      </div>

      {/* Agent List */}
      <div className="border border-zinc-800 rounded-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-zinc-900 text-xs text-zinc-500 uppercase tracking-wider">
          <div className="col-span-4">Agent</div>
          <div className="col-span-2">Record</div>
          <div className="col-span-2">Rating</div>
          <div className="col-span-2">Archetype</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {agents.map((agent) => {
          const isCurrent = currentAgent?.metadata.id === agent.metadata.id;
          const isSelected = selectedForFight?.metadata.id === agent.metadata.id;
          const record = `${agent.metadata.wins}-${agent.metadata.losses}-${agent.metadata.draws}`;
          const rating = calculateOverallRating(agent.skills);
          const archetype = detectArchetype(agent.skills);

          return (
            <div 
              key={agent.metadata.id}
              className={`grid grid-cols-12 gap-4 px-4 py-3 border-t border-zinc-800 items-center hover:bg-zinc-900/30 transition-colors ${
                isSelected ? 'bg-orange-500/10 border-orange-500/30' : ''
              }`}
            >
              {/* Agent Name */}
              <div className="col-span-4">
                <div className="flex items-center gap-2">
                  {isCurrent && (
                    <span className="text-orange-500" title="Active">●</span>
                  )}
                  <div>
                    <div className="font-medium">{agent.skills.name}</div>
                    <div className="text-xs text-zinc-500">
                      "{agent.skills.nickname}"
                    </div>
                  </div>
                </div>
              </div>

              {/* Record */}
              <div className="col-span-2 font-mono text-sm">
                <span className="text-green-500">{agent.metadata.wins}</span>
                <span className="text-zinc-600">-</span>
                <span className="text-red-500">{agent.metadata.losses}</span>
                <span className="text-zinc-600">-</span>
                <span className="text-zinc-500">{agent.metadata.draws}</span>
              </div>

              {/* Rating */}
              <div className="col-span-2 font-mono text-sm">
                {rating}
              </div>

              {/* Archetype */}
              <div className="col-span-2">
                <span className="text-xs text-zinc-400 capitalize">{archetype}</span>
              </div>

              {/* Actions */}
              <div className="col-span-2 flex items-center justify-end gap-1">
                <button
                  onClick={() => onSelect(agent)}
                  className="p-1.5 text-zinc-500 hover:text-white transition-colors"
                  title="Set Active"
                >
                  <User className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleSelectForFight(agent)}
                  className={`p-1.5 transition-colors ${
                    isSelected ? 'text-orange-500' : 'text-zinc-500 hover:text-white'
                  }`}
                  title={isSelected ? 'Cancel' : 'Select for Fight'}
                >
                  <Swords className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEdit(agent)}
                  className="p-1.5 text-zinc-500 hover:text-white transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(agent.metadata.id)}
                  className="p-1.5 text-zinc-500 hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Commands */}
      <div className="text-xs text-zinc-600 pt-4 border-t border-zinc-800">
        <span className="text-zinc-500">Commands:</span>
        {' '}Click <Swords className="w-3 h-3 inline" /> on two agents to start a fight
        {' '}|{' '}
        <span className="text-orange-500">●</span> marks your active agent
      </div>
    </div>
  );
}

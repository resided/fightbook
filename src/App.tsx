import { useState, useEffect } from 'react';
import type { CompleteAgent } from '@/types/agent';
import { 
  getAllAgents, 
  getCurrentAgent, 
  setCurrentAgent,
  saveAgent,
  deleteAgent,
} from '@/lib/storage';
import { syncAgent, getFighters } from '@/lib/fighterStorage';
import { generateFullSkillsMd, createNewAgent, validateSkillsBudget } from '@/types/agent';
import { toast } from 'sonner';

// Views
import Landing from '@/pages/Landing';
import TerminalBoot from '@/components/TerminalBoot';
import TerminalRoster from '@/components/TerminalRoster';
import TerminalLeaderboard from '@/components/TerminalLeaderboard';
import SkillsEditor from '@/components/SkillsEditor';
import TextFight from '@/components/TextFight';
import FightHistory from '@/components/FightHistory';

type View = 'landing' | 'roster' | 'create' | 'edit' | 'fight' | 'leaderboard' | 'history';

function App() {
  const [view, setView] = useState<View>('landing');
  const [agents, setAgents] = useState<CompleteAgent[]>([]);
  const [currentAgent, setCurrentAgentState] = useState<CompleteAgent | null>(null);
  const [editingAgent, setEditingAgent] = useState<CompleteAgent | null>(null);
  const [fightingAgents, setFightingAgents] = useState<[CompleteAgent, CompleteAgent] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBoot, setShowBoot] = useState(() => {
    // Only show boot sequence on first visit
    return !localStorage.getItem('fightbook_boot_complete');
  });

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const allAgents = await getFighters();
      const current = getCurrentAgent();
      setAgents(allAgents);
      setCurrentAgentState(current);
    } catch {
      const allAgents = getAllAgents();
      const current = getCurrentAgent();
      setAgents(allAgents);
      setCurrentAgentState(current);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnter = () => {
    setView(agents.length > 0 ? 'roster' : 'create');
  };

  const handleCreateAgent = () => {
    setEditingAgent(null);
    setView('create');
  };

  const handleEditAgent = (agent: CompleteAgent) => {
    setEditingAgent(agent);
    setView('edit');
  };

  const handleSaveAgent = async (agent: CompleteAgent) => {
    saveAgent(agent);
    try {
      await syncAgent(agent);
    } catch (err) {
      console.warn('Sync to cloud failed, saved locally:', err);
    }
    if (!currentAgent || agent.metadata.id === currentAgent.metadata.id) {
      setCurrentAgent(agent);
    }
    loadAgents();
    setView('roster');
    toast.success(`${agent.skills.name} saved`);
  };

  const handleDeleteAgent = (id: string) => {
    deleteAgent(id);
    loadAgents();
    toast.success('Agent deleted');
  };

  const handleFightCpu = () => {
    if (!currentAgent || agents.length === 0) {
      handleCreateAgent();
      return;
    }
    
    const now = Date.now();
    const cpuNames = ['Iron Jaw', 'The Crusher', 'Phantom', 'Shadow', 'Tank', 'Viper'];
    const randomName = `${cpuNames[Math.floor(Math.random() * cpuNames.length)]}`;
    
    const cpuAgent: CompleteAgent = {
      metadata: {
        id: `cpu_${now}`,
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
        ranking: 950,
        earnings: 0,
        xp: 0,
        level: 1,
      },
      skills: {
        ...currentAgent.skills,
        name: randomName,
        nickname: 'CPU',
        striking: 50 + Math.floor(Math.random() * 30),
        wrestling: 50 + Math.floor(Math.random() * 30),
        submissions: 40 + Math.floor(Math.random() * 30),
        cardio: 50 + Math.floor(Math.random() * 30),
        punchSpeed: 50 + Math.floor(Math.random() * 30),
        kickPower: 50 + Math.floor(Math.random() * 30),
        headMovement: 50 + Math.floor(Math.random() * 30),
        takedownDefense: 50 + Math.floor(Math.random() * 30),
        submissionDefense: 50 + Math.floor(Math.random() * 30),
        groundAndPound: 50 + Math.floor(Math.random() * 30),
        topControl: 50 + Math.floor(Math.random() * 30),
        bottomGame: 50 + Math.floor(Math.random() * 30),
      },
      personality: {
        archetype: 'balanced',
        attitude: 'intense',
        preFightQuote: "Let's go.",
        winQuote: 'Victory is mine.',
        lossQuote: "I'll be back.",
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
        rewardsOptIn: false,
      },
    };
    
    handleFight(currentAgent, cpuAgent);
  };

  const handleSelectAgent = (agent: CompleteAgent) => {
    setCurrentAgent(agent);
    setCurrentAgentState(agent);
  };

  const handleFight = (agent1: CompleteAgent, agent2: CompleteAgent) => {
    setFightingAgents([agent1, agent2]);
    setView('fight');
  };

  const handleFightComplete = () => {
    loadAgents();
  };

  const handleBootComplete = () => {
    setShowBoot(false);
    localStorage.setItem('fightbook_boot_complete', 'true');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-zinc-500 animate-pulse">loading...</div>
      </div>
    );
  }

  // Terminal Boot Sequence (first visit only)
  if (showBoot) {
    return <TerminalBoot onComplete={handleBootComplete} />;
  }

  // Landing page
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <div className="flex-1">
          <Landing onEnter={handleEnter} />
        </div>
        <footer className="border-t border-zinc-800">
          <div className="max-w-6xl mx-auto px-4 py-3 space-y-2">
            <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
              <span className="text-zinc-600">$FIGHT on Base:</span>
              <span className="font-mono text-zinc-400 hidden sm:inline">0xfC01A7760CfE6a3f4D2635f0BdCaB992DB2a1b07</span>
              <span className="font-mono text-zinc-400 sm:hidden">0xfC01…2a1b07</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText('0xfC01A7760CfE6a3f4D2635f0BdCaB992DB2a1b07');
                  toast.success('Contract address copied');
                }}
                className="text-zinc-600 hover:text-zinc-300 transition-colors"
                title="Copy contract address"
              >
                [copy]
              </button>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-600">
              <div />
              <div className="flex items-center gap-4">
                <a href="https://x.com/0xreside" target="_blank" rel="noopener">@0xreside</a>
                <span className="text-zinc-700">|</span>
                <a href="https://github.com/resided/fightbook" target="_blank" rel="noopener">github</a>
                <span className="text-zinc-700">|</span>
                <span>skills.md powered</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setView('roster')}
            >
              <span className="text-orange-500 font-bold text-lg">⌘</span>
              <span className="font-bold">fightbook</span>
              <span className="text-zinc-600 text-sm hidden sm:inline">v1.1.17</span>
            </div>

            <nav className="flex items-center gap-1">
              <NavButton 
                active={view === 'roster'} 
                onClick={() => setView('roster')}
              >
                roster
              </NavButton>
              <NavButton 
                active={view === 'history'} 
                onClick={() => setView('history')}
              >
                history
              </NavButton>
              <NavButton
                active={view === 'leaderboard'}
                onClick={() => setView('leaderboard')}
              >
                <span className="hidden sm:inline">leaderboard</span>
                <span className="sm:hidden">board</span>
              </NavButton>
              <NavButton 
                active={view === 'create'} 
                onClick={handleCreateAgent}
              >
                +new
              </NavButton>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {view === 'roster' && (
          <TerminalRoster
            agents={agents}
            currentAgent={currentAgent}
            onCreate={handleCreateAgent}
            onEdit={handleEditAgent}
            onDelete={handleDeleteAgent}
            onSelect={handleSelectAgent}
            onFight={handleFight}
            onFightCpu={handleFightCpu}
          />
        )}

        {(view === 'create' || view === 'edit') && (
          <SkillsEditor
            agent={editingAgent}
            onSave={handleSaveAgent}
            onCancel={() => setView('roster')}
          />
        )}

        {view === 'fight' && fightingAgents && (
          <TextFight
            agent1={fightingAgents[0]}
            agent2={fightingAgents[1]}
            onFightComplete={handleFightComplete}
            onBack={() => setView('roster')}
          />
        )}

        {view === 'history' && (
          <FightHistory onBack={() => setView('roster')} />
        )}

        {view === 'leaderboard' && (
          <TerminalLeaderboard />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-3 space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
            <span className="text-zinc-600">$FIGHT on Base:</span>
            <span className="font-mono text-zinc-400">0xfC01A7760CfE6a3f4D2635f0BdCaB992DB2a1b07</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText('0xfC01A7760CfE6a3f4D2635f0BdCaB992DB2a1b07');
                toast.success('Contract address copied');
              }}
              className="text-zinc-600 hover:text-zinc-300 transition-colors"
              title="Copy contract address"
            >
              [copy]
            </button>
          </div>
          <div className="flex items-center justify-between text-xs text-zinc-600">
            <div className="flex items-center gap-4">
              <span>{agents.length} agents</span>
              <span>{currentAgent?.metadata.totalFights || 0} fights</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://x.com/0xreside" target="_blank" rel="noopener">
                @0xreside
              </a>
              <span className="text-zinc-700">|</span>
              <a href="https://github.com/resided/fightbook" target="_blank" rel="noopener">
                github
              </a>
              <span className="text-zinc-700">|</span>
              <span>skills.md powered</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavButton({ 
  children, 
  active, 
  onClick 
}: { 
  children: React.ReactNode; 
  active?: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm transition-all ${
        active 
          ? 'text-orange-500 border-b-2 border-orange-500' 
          : 'text-zinc-400 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

export default App;

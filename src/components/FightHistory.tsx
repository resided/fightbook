// FightBook - Fight History View
// Minimal terminal-style fight history

import { useState, useEffect } from 'react';
import { Trophy, Calendar, Swords, ChevronRight, Award, Twitter, Flame } from 'lucide-react';
import { getFightHistory, type FightRecord } from '@/lib/fightStorage';
import { getAllAgents } from '@/lib/storage';
import type { CompleteAgent } from '@/types/agent';
import VoteButton from '@/components/VoteButton';

type FilterType = 'all' | 'wins' | 'losses';

interface FightHistoryProps {
  onBack?: () => void;
}

export default function FightHistory({ onBack }: FightHistoryProps) {
  const [fights, setFights] = useState<FightRecord[]>([]);
  const [agents, setAgents] = useState<Record<string, CompleteAgent>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedFight, setExpandedFight] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [history, allAgents] = await Promise.all([
        getFightHistory(),
        Promise.resolve(getAllAgents()),
      ]);
      
      setFights(history);
      
      // Create agent lookup map
      const agentMap: Record<string, CompleteAgent> = {};
      allAgents.forEach(agent => {
        agentMap[agent.metadata.id] = agent;
      });
      setAgents(agentMap);
    } catch (error) {
      console.error('Failed to load fights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFights = fights.filter(fight => {
    if (filter === 'all') return true;
    const agent1Won = fight.winnerId === fight.agent1Id;
    if (filter === 'wins') return agent1Won;
    if (filter === 'losses') return !agent1Won && fight.winnerId !== null;
    return true;
  });

  if (isLoading) {
    return (
      <div className="border border-zinc-800 rounded-sm p-8 text-center">
        <div className="text-zinc-500 animate-pulse">loading fight history...</div>
      </div>
    );
  }

  if (fights.length === 0) {
    return (
      <div className="border border-zinc-800 rounded-sm p-8 text-center">
        <div className="text-zinc-600 mb-2">No fights recorded</div>
        <div className="text-sm text-zinc-500">
          Complete a fight to see it here
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Fight History
          </h2>
          <p className="text-sm text-zinc-500">
            {fights.length} fight{fights.length !== 1 ? 's' : ''} recorded
          </p>
        </div>
        <div className="flex items-center gap-2">
          {['all', 'wins', 'losses'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as FilterType)}
              className={`px-3 py-1 text-xs uppercase tracking-wider transition-colors ${
                filter === f
                  ? 'text-orange-500 border-b border-orange-500'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Fight List */}
      <div className="border border-zinc-800 rounded-sm overflow-hidden">
        {/* Desktop header */}
        <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-2 bg-zinc-900 text-xs text-zinc-500 uppercase tracking-wider">
          <div className="col-span-4">Matchup</div>
          <div className="col-span-2">Result</div>
          <div className="col-span-2">Method</div>
          <div className="col-span-2">Round</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {filteredFights.map((fight) => {
          const agent1 = agents[fight.agent1Id];
          const agent2 = agents[fight.agent2Id];
          const isWin = fight.winnerId === fight.agent1Id;
          const isLoss = fight.winnerId && fight.winnerId !== fight.agent1Id;
          const isDraw = !fight.winnerId;
          const isExpanded = expandedFight === fight.id;

          return (
            <div key={fight.id}>
              {/* Mobile row */}
              <div
                className="sm:hidden px-4 py-3 border-t border-zinc-800 hover:bg-zinc-900/30 transition-colors cursor-pointer"
                onClick={() => setExpandedFight(isExpanded ? null : fight.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">
                      {agent1?.skills.name || 'Unknown'} <span className="text-zinc-600">vs</span> {agent2?.skills.name || 'Unknown'}
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      <span className={`uppercase font-medium ${isWin ? 'text-green-500' : isLoss ? 'text-red-500' : 'text-zinc-500'}`}>
                        {isWin ? 'Win' : isLoss ? 'Loss' : 'Draw'}
                      </span>
                      <span className="text-zinc-600"> · </span>
                      {fight.method} R{fight.round}
                      <span className="text-zinc-700"> · </span>
                      {new Date(fight.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button onClick={(e) => { e.stopPropagation(); shareFight(fight, agent1, agent2); }} className="p-1.5 text-zinc-500 hover:text-blue-400 transition-colors">
                      <Twitter className="w-4 h-4" />
                    </button>
                    <ChevronRight className={`w-4 h-4 text-zinc-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </div>
              </div>

              {/* Desktop row */}
              <div
                className="hidden sm:grid grid-cols-12 gap-4 px-4 py-3 border-t border-zinc-800 items-center hover:bg-zinc-900/30 transition-colors cursor-pointer"
                onClick={() => setExpandedFight(isExpanded ? null : fight.id)}
              >
                {/* Matchup */}
                <div className="col-span-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{agent1?.skills.name || 'Unknown'}</span>
                    <span className="text-zinc-600">vs</span>
                    <span className="font-medium">{agent2?.skills.name || 'Unknown'}</span>
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    {new Date(fight.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Result */}
                <div className="col-span-2">
                  <span className={`text-xs uppercase font-medium ${
                    isWin ? 'text-green-500' : isLoss ? 'text-red-500' : 'text-zinc-500'
                  }`}>
                    {isWin ? 'Win' : isLoss ? 'Loss' : 'Draw'}
                  </span>
                </div>

                {/* Method */}
                <div className="col-span-2 text-sm text-zinc-400">
                  {fight.method}
                </div>

                {/* Round */}
                <div className="col-span-2 text-sm font-mono text-zinc-400">
                  R{fight.round}
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center justify-end gap-1">
                  <VoteButton fightId={fight.id} size="sm" showCount />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      shareFight(fight, agent1, agent2);
                    }}
                    className="p-1.5 text-zinc-500 hover:text-blue-400 transition-colors"
                    title="Share to X"
                  >
                    <Twitter className="w-4 h-4" />
                  </button>
                  <ChevronRight className={`w-4 h-4 text-zinc-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-zinc-800 bg-zinc-900/20 px-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-sm">
                    <div>
                      <h4 className="text-zinc-500 mb-2">{agent1?.skills.name || 'Fighter 1'} Stats</h4>
                      <div className="space-y-1 font-mono text-xs">
                        <StatLine label="Health" value={`${Math.round(fight.fightData.fighter1.currentHealth)}%`} />
                        <StatLine label="Strikes" value={fight.fightData.fighter1.significantStrikes} />
                        <StatLine label="Takedowns" value={fight.fightData.fighter1.takedownsLanded} />
                        <StatLine label="Knockdowns" value={fight.fightData.fighter1.knockdowns} />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-zinc-500 mb-2">{agent2?.skills.name || 'Fighter 2'} Stats</h4>
                      <div className="space-y-1 font-mono text-xs">
                        <StatLine label="Health" value={`${Math.round(fight.fightData.fighter2.currentHealth)}%`} />
                        <StatLine label="Strikes" value={fight.fightData.fighter2.significantStrikes} />
                        <StatLine label="Takedowns" value={fight.fightData.fighter2.takedownsLanded} />
                        <StatLine label="Knockdowns" value={fight.fightData.fighter2.knockdowns} />
                      </div>
                    </div>
                  </div>

                  {fight.prizeAwarded && (
                    <div className="mt-4 pt-4 border-t border-zinc-800">
                      <div className="flex items-center gap-2 text-green-500 text-sm">
                        <Award className="w-4 h-4" />
                        <span>Prize awarded: ${fight.prizeAmount}</span>
                        {(fight.fightData as any).isEntertaining && (
                          <span className="flex items-center gap-1 text-orange-500">
                            <Flame className="w-3 h-3" />
                            (entertaining)
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatLine({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between py-1 border-b border-zinc-800/50 last:border-0">
      <span className="text-zinc-500">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function shareFight(fight: FightRecord, agent1?: CompleteAgent, agent2?: CompleteAgent) {
  const f1Name = agent1?.skills.name || 'Fighter 1';
  const f2Name = agent2?.skills.name || 'Fighter 2';
  const winnerName = fight.winnerId === fight.agent1Id ? f1Name : f2Name;
  
  const text = `Just watched ${f1Name} vs ${f2Name}! ${winnerName} wins by ${fight.method} in Round ${fight.round}! 🥊 #AIFights #FightBook`;
  
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'width=600,height=400');
}

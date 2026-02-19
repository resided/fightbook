// FightBook - Agent Roster Dashboard
// Manage your AI fighters

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, User, Trophy, TrendingUp, Activity, 
  MoreVertical, Edit, Trash2, Swords, Copy,
  ChevronRight, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  getAllAgents, 
  deleteAgent, 
  setCurrentAgent, 
  getCurrentAgent,
  getAgentFights,
} from '@/lib/storage';
import type { CompleteAgent } from '@/types/agent';
import { calculateOverallRating, detectArchetype } from '@/types/agent';

interface AgentRosterProps {
  onCreateAgent: () => void;
  onEditAgent: (agent: CompleteAgent) => void;
  onSelectAgent: (agent: CompleteAgent) => void;
  onFight: (agent1: CompleteAgent, agent2: CompleteAgent) => void;
}

export default function AgentRoster({ 
  onCreateAgent, 
  onEditAgent, 
  onSelectAgent,
  onFight,
}: AgentRosterProps) {
  const [agents, setAgents] = useState<CompleteAgent[]>([]);
  const [currentAgent, setCurrentAgentState] = useState<CompleteAgent | null>(null);
  const [selectedForFight, setSelectedForFight] = useState<CompleteAgent | null>(null);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = () => {
    setAgents(getAllAgents());
    setCurrentAgentState(getCurrentAgent());
  };

  const handleDelete = (id: string) => {
    deleteAgent(id);
    loadAgents();
  };

  const handleDuplicate = (agent: CompleteAgent) => {
    const newAgent: CompleteAgent = {
      ...agent,
      metadata: {
        ...agent.metadata,
        id: `agent_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        name: `${agent.metadata.name} (Copy)`,
        createdAt: Date.now(),
        totalFights: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        currentStreak: 0,
        ranking: 1000,
        xp: 0,
        level: 1,
      },
    };
    // Save new agent
    const existing = getAllAgents();
    existing.push(newAgent);
    localStorage.setItem('fightbook_agents', JSON.stringify(existing));
    loadAgents();
  };

  const handleSetCurrent = (agent: CompleteAgent) => {
    setCurrentAgent(agent);
    setCurrentAgentState(agent);
  };

  const handleSelectForFight = (agent: CompleteAgent) => {
    if (selectedForFight?.metadata.id === agent.metadata.id) {
      setSelectedForFight(null);
    } else if (selectedForFight) {
      // Start fight between selected and this one
      onFight(selectedForFight, agent);
      setSelectedForFight(null);
    } else {
      setSelectedForFight(agent);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display mb-1">Your Agents</h2>
          <p className="text-muted-foreground">
            {agents.length} fighter{agents.length !== 1 ? 's' : ''} in your roster
          </p>
        </div>
        <Button onClick={onCreateAgent}>
          <Plus className="w-4 h-4 mr-2" />
          Create Agent
        </Button>
      </div>

      {/* Current Agent */}
      {currentAgent && (
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-display text-white">
                {currentAgent.skills.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-display">{currentAgent.skills.name}</h3>
                  <Badge variant="outline" className="border-primary/50">
                    <Star className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <p className="text-muted-foreground">"{currentAgent.skills.nickname}"</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="capitalize">
                    {detectArchetype(currentAgent.skills)}
                  </Badge>
                  <Badge variant="outline">
                    Rating: {calculateOverallRating(currentAgent.skills)}
                  </Badge>
                  <Badge variant="outline">
                    Level {currentAgent.metadata.level}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-display">{currentAgent.metadata.wins}</div>
                <div className="text-xs text-muted-foreground">Wins</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-display">{currentAgent.metadata.losses}</div>
                <div className="text-xs text-muted-foreground">Losses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-display">{currentAgent.metadata.ranking}</div>
                <div className="text-xs text-muted-foreground">ELO</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fight Selection Mode Banner */}
      {selectedForFight && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-secondary/10 border border-secondary/30 rounded-xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Swords className="w-5 h-5 text-secondary" />
            <span>
              Select an opponent for <strong>{selectedForFight.skills.name}</strong>
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSelectedForFight(null)}>
            Cancel
          </Button>
        </motion.div>
      )}

      {/* Agent Grid */}
      {agents.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl">
          <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-xl font-display mb-2">No agents yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first AI fighter to get started
          </p>
          <Button onClick={onCreateAgent}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Agent
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <AgentCard
              key={agent.metadata.id}
              agent={agent}
              isCurrent={currentAgent?.metadata.id === agent.metadata.id}
              isSelectedForFight={selectedForFight?.metadata.id === agent.metadata.id}
              onEdit={() => onEditAgent(agent)}
              onDelete={() => handleDelete(agent.metadata.id)}
              onDuplicate={() => handleDuplicate(agent)}
              onSetCurrent={() => handleSetCurrent(agent)}
              onSelectForFight={() => handleSelectForFight(agent)}
              onView={() => onSelectAgent(agent)}
            />
          ))}
        </div>
      )}

      {/* Quick Actions */}
      {agents.length >= 2 && (
        <div className="bg-muted/30 rounded-xl p-6">
          <h3 className="font-display text-lg mb-4">Quick Fight</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Select two agents above to start a fight, or use random matchmaking
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              const shuffled = [...agents].sort(() => Math.random() - 0.5);
              onFight(shuffled[0], shuffled[1]);
            }}
          >
            <Swords className="w-4 h-4 mr-2" />
            Random Matchup
          </Button>
        </div>
      )}
    </div>
  );
}

// Agent Card Component
function AgentCard({
  agent,
  isCurrent,
  isSelectedForFight,
  onEdit,
  onDelete,
  onDuplicate,
  onSetCurrent,
  onSelectForFight,
  onView,
}: {
  agent: CompleteAgent;
  isCurrent: boolean;
  isSelectedForFight: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onSetCurrent: () => void;
  onSelectForFight: () => void;
  onView: () => void;
}) {
  const rating = calculateOverallRating(agent.skills);
  const archetype = detectArchetype(agent.skills);
  const record = `${agent.metadata.wins}-${agent.metadata.losses}-${agent.metadata.draws}`;

  return (
    <motion.div
      layout
      className={`group bg-card border rounded-xl overflow-hidden transition-all ${
        isSelectedForFight 
          ? 'border-secondary ring-2 ring-secondary/30' 
          : isCurrent
          ? 'border-primary ring-1 ring-primary/30'
          : 'border-border/50 hover:border-primary/30'
      }`}
    >
      {/* Card Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div 
            className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-xl font-display cursor-pointer"
            onClick={onView}
          >
            {agent.skills.name.charAt(0)}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView}>
                <User className="w-4 h-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              {!isCurrent && (
                <DropdownMenuItem onClick={onSetCurrent}>
                  <Star className="w-4 h-4 mr-2" />
                  Set as Active
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onDelete} className="text-red-500">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Name & Info */}
        <div onClick={onView} className="cursor-pointer">
          <h3 className="font-display text-lg mb-1">{agent.skills.name}</h3>
          <p className="text-sm text-muted-foreground mb-2">"{agent.skills.nickname}"</p>
          
          <div className="flex flex-wrap gap-1 mb-3">
            <Badge variant="outline" className="text-xs capitalize">
              {archetype}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Rating {rating}
            </Badge>
            {isCurrent && (
              <Badge className="text-xs bg-primary">
                Active
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="bg-muted/30 rounded-lg p-2">
            <div className="font-mono font-bold">{record}</div>
            <div className="text-xs text-muted-foreground">Record</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-2">
            <div className="font-mono font-bold">{agent.metadata.kos}</div>
            <div className="text-xs text-muted-foreground">KOs</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-2">
            <div className="font-mono font-bold">{agent.metadata.ranking}</div>
            <div className="text-xs text-muted-foreground">ELO</div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="border-t border-border/50 p-3 flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={onSelectForFight}
        >
          <Swords className="w-4 h-4 mr-1" />
          {isSelectedForFight ? 'Selected' : 'Fight'}
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onView}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

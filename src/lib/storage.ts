// FightBook - Local Storage Persistence

import type { CompleteAgent, AgentMetadata } from '@/types/agent';
import type { FightState } from '@/types/fight';

const STORAGE_KEYS = {
  AGENTS: 'fightbook_agents',
  CURRENT_AGENT: 'fightbook_current_agent',
  FIGHT_HISTORY: 'fightbook_fight_history',
  LEADERBOARD: 'fightbook_leaderboard',
  ONBOARDING_COMPLETE: 'fightbook_onboarding_complete',
};

// Agent Management
export function saveAgent(agent: CompleteAgent): void {
  const agents = getAllAgents();
  const existingIndex = agents.findIndex(a => a.metadata.id === agent.metadata.id);
  
  if (existingIndex >= 0) {
    agents[existingIndex] = agent;
  } else {
    agents.push(agent);
  }
  
  localStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify(agents));
}

export function getAllAgents(): CompleteAgent[] {
  const data = localStorage.getItem(STORAGE_KEYS.AGENTS);
  return data ? JSON.parse(data) : [];
}

export function getAgentById(id: string): CompleteAgent | null {
  const agents = getAllAgents();
  return agents.find(a => a.metadata.id === id) || null;
}

export function deleteAgent(id: string): void {
  const agents = getAllAgents().filter(a => a.metadata.id !== id);
  localStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify(agents));
}

export function setCurrentAgent(agent: CompleteAgent | null): void {
  if (agent) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_AGENT, JSON.stringify(agent));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_AGENT);
  }
}

export function getCurrentAgent(): CompleteAgent | null {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_AGENT);
  return data ? JSON.parse(data) : null;
}

// Fight History
export interface FightRecord {
  id: string;
  timestamp: number;
  agent1: {
    id: string;
    name: string;
  };
  agent2: {
    id: string;
    name: string;
  };
  winner: string | null;
  method: 'KO' | 'TKO' | 'SUB' | 'DEC' | 'DRAW';
  round: number;
  time: string;
  fightData: FightState;
}

export function saveFightRecord(record: FightRecord): void {
  const history = getFightHistory();
  history.unshift(record); // Add to beginning
  
  // Keep only last 100 fights
  if (history.length > 100) {
    history.pop();
  }
  
  localStorage.setItem(STORAGE_KEYS.FIGHT_HISTORY, JSON.stringify(history));
  
  // Update agent stats
  updateAgentStatsAfterFight(record);
}

export function getFightHistory(): FightRecord[] {
  const data = localStorage.getItem(STORAGE_KEYS.FIGHT_HISTORY);
  return data ? JSON.parse(data) : [];
}

export function getAgentFights(agentId: string): FightRecord[] {
  return getFightHistory().filter(
    f => f.agent1.id === agentId || f.agent2.id === agentId
  );
}

// Update agent stats after fight
function updateAgentStatsAfterFight(record: FightRecord): void {
  const agents = getAllAgents();
  let updated = false;
  
  for (const agent of agents) {
    let isParticipant = false;
    let won = false;
    let method: string | null = null;
    
    if (record.agent1.id === agent.metadata.id) {
      isParticipant = true;
      won = record.winner === record.agent1.name;
      if (won) method = record.method;
    } else if (record.agent2.id === agent.metadata.id) {
      isParticipant = true;
      won = record.winner === record.agent2.name;
      if (won) method = record.method;
    }
    
    if (isParticipant) {
      agent.metadata.totalFights++;
      agent.metadata.xp += won ? 100 : 25;
      
      if (won) {
        agent.metadata.wins++;
        agent.metadata.currentStreak = Math.max(0, agent.metadata.currentStreak) + 1;
        agent.metadata.bestStreak = Math.max(agent.metadata.bestStreak, agent.metadata.currentStreak);
        
        if (method === 'KO' || method === 'TKO') {
          agent.metadata.kos++;
        } else if (method === 'SUB') {
          agent.metadata.submissions++;
        }
      } else if (record.winner) {
        agent.metadata.losses++;
        agent.metadata.currentStreak = Math.min(0, agent.metadata.currentStreak) - 1;
      } else {
        agent.metadata.draws++;
      }
      
      // Level up check
      const newLevel = Math.floor(agent.metadata.xp / 500) + 1;
      if (newLevel > agent.metadata.level) {
        agent.metadata.level = newLevel;
      }
      
      // Update ranking (simple ELO-ish)
      const ratingChange = won ? 15 : record.winner ? -10 : 0;
      agent.metadata.ranking = Math.max(0, agent.metadata.ranking + ratingChange);
      
      agent.metadata.updatedAt = Date.now();
      updated = true;
    }
  }
  
  if (updated) {
    localStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify(agents));
  }
}

// Leaderboard
export function getLeaderboard(): AgentMetadata[] {
  const agents = getAllAgents();
  return agents
    .map(a => a.metadata)
    .sort((a, b) => b.ranking - a.ranking)
    .slice(0, 50);
}

// Onboarding
export function isOnboardingComplete(): boolean {
  return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE) === 'true';
}

export function setOnboardingComplete(complete: boolean): void {
  localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, complete ? 'true' : 'false');
}

// Export/Import
export function exportAllData(): string {
  const data = {
    agents: getAllAgents(),
    fightHistory: getFightHistory(),
    exportedAt: Date.now(),
  };
  return JSON.stringify(data, null, 2);
}

export function importData(json: string): boolean {
  try {
    const data = JSON.parse(json);
    if (data.agents) {
      localStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify(data.agents));
    }
    if (data.fightHistory) {
      localStorage.setItem(STORAGE_KEYS.FIGHT_HISTORY, JSON.stringify(data.fightHistory));
    }
    return true;
  } catch {
    return false;
  }
}

// Clear all data
export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

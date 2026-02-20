// FightBook - Fight Storage API
// CRUD operations for fight records with Supabase

import { supabase, isSupabaseConfigured } from './supabase';
import type { FightState } from '@/types/fight';
import type { CompleteAgent } from '@/types/agent';
import * as storage from './storage';

export interface FightRecord {
  id: string;
  userId?: string;
  agent1Id: string;
  agent2Id: string;
  winnerId: string | null;
  method: 'KO' | 'TKO' | 'SUB' | 'DEC' | 'DRAW';
  round: number;
  endTime: number;
  fightData: FightState;
  prizeAwarded: boolean;
  prizeAmount: number;
  createdAt: number;
}

export interface FightRow {
  id: string;
  user_id: string | null;
  agent1_id: string | null;
  agent2_id: string | null;
  winner_id: string | null;
  method: string;
  round: number;
  end_time: number | null;
  fight_data: Record<string, unknown>;
  prize_awarded: boolean;
  prize_amount: number;
  created_at: string;
}

// Convert database row to FightRecord
function rowToFightRecord(row: FightRow): FightRecord {
  return {
    id: row.id,
    userId: row.user_id || undefined,
    agent1Id: row.agent1_id || '',
    agent2Id: row.agent2_id || '',
    winnerId: row.winner_id || null,
    method: row.method as FightRecord['method'],
    round: row.round,
    endTime: row.end_time || 0,
    fightData: row.fight_data as unknown as FightState,
    prizeAwarded: row.prize_awarded,
    prizeAmount: row.prize_amount,
    createdAt: new Date(row.created_at).getTime(),
  };
}

/**
 * Save fight to database
 */
export async function saveFightToDb(
  agent1: CompleteAgent,
  agent2: CompleteAgent,
  fightState: FightState,
  userId?: string,
  isPractice: boolean = false
): Promise<FightRecord> {
  const fightRecord: FightRecord = {
    id: fightState.id,
    userId,
    agent1Id: agent1.metadata.id,
    agent2Id: agent2.metadata.id,
    winnerId: fightState.winner ? (fightState.winner === agent1.skills.name ? agent1.metadata.id : agent2.metadata.id) : null,
    method: fightState.method || 'DEC',
    round: fightState.endRound || 3,
    endTime: fightState.endTime || 0,
    fightData: fightState,
    prizeAwarded: false,
    prizeAmount: 0,
    isPractice,
    createdAt: Date.now(),
  };

  if (isSupabaseConfigured() {
    const { && supabase) data, error } = await supabase
      .from('fights')
      .insert({
        id: fightRecord.id,
        user_id: userId || null,
        agent1_id: fightRecord.agent1Id,
        agent2_id: fightRecord.agent2Id,
        winner_id: fightRecord.winnerId,
        method: fightRecord.method,
        round: fightRecord.round,
        end_time: fightRecord.endTime,
        fight_data: fightRecord.fightData as unknown as Record<string, unknown>,
        prize_awarded: false,
        prize_amount: 0,
        is_practice: isPractice,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to save fight to database:', error);
      throw new Error(`Failed to save fight: ${error.message}`);
    }

    return rowToFightRecord(data);
  } else {
    // Fallback to localStorage
    saveFightLocally(fightRecord);
    return fightRecord;
  }
}

/**
 * Save fight to localStorage (fallback)
 */
function saveFightLocally(record: FightRecord): void {
  const history = storage.getFightHistory();
  history.unshift({
    id: record.id,
    timestamp: record.createdAt,
    agent1: { id: record.agent1Id, name: '' },
    agent2: { id: record.agent2Id, name: '' },
    winner: record.winnerId,
    method: record.method,
    round: record.round,
    time: `${Math.floor(record.endTime / 60)}:${(record.endTime % 60).toString().padStart(2, '0')}`,
    fightData: record.fightData,
  });
  storage.saveFightRecord(history[0]);
}

/**
 * Get fight history for current user
 */
export async function getFightHistory(userId?: string): Promise<FightRecord[]> {
  if (isSupabaseConfigured() && supabase) {
    let query = supabase
      .from('fights')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch fight history:', error.message);
      return [];
    }

    return data.map((row: FightRow) => rowToFightRecord(row));
  } else {
    // Fallback to localStorage
    const localHistory = storage.getFightHistory();
    return localHistory.map((h, i) => ({
      id: h.id || `local_${i}`,
      agent1Id: h.agent1.id,
      agent2Id: h.agent2.id,
      winnerId: h.winner || null,
      method: h.method,
      round: h.round,
      endTime: 0,
      fightData: h.fightData,
      prizeAwarded: false,
      prizeAmount: 0,
      createdAt: h.timestamp,
    }));
  }
}

/**
 * Get fights by specific agent
 */
export async function getFightsByAgent(agentId: string): Promise<FightRecord[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('fights')
      .select('*')
      .or(`agent1_id.eq.${agentId},agent2_id.eq.${agentId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch agent fights:', error.message);
      return [];
    }

    return data.map(rowToFightRecord);
  } else {
    // Fallback to localStorage
    const localHistory = storage.getAgentFights(agentId);
    return localHistory.map((h, i) => ({
      id: h.id || `local_${i}`,
      agent1Id: h.agent1.id,
      agent2Id: h.agent2.id,
      winnerId: h.winner || null,
      method: h.method,
      round: h.round,
      endTime: 0,
      fightData: h.fightData,
      prizeAwarded: false,
      prizeAmount: 0,
      createdAt: h.timestamp,
    }));
  }
}

/**
 * Get single fight by ID
 */
export async function getFightById(fightId: string): Promise<FightRecord | null> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('fights')
      .select('*')
      .eq('id', fightId)
      .single();

    if (error || !data) {
      return null;
    }

    return rowToFightRecord(data);
  } else {
    // Fallback to localStorage
    const history = storage.getFightHistory();
    const fight = history.find(h => h.id === fightId);
    if (!fight) return null;
    
    return {
      id: fight.id,
      agent1Id: fight.agent1.id,
      agent2Id: fight.agent2.id,
      winnerId: fight.winner || null,
      method: fight.method,
      round: fight.round,
      endTime: 0,
      fightData: fight.fightData,
      prizeAwarded: false,
      prizeAmount: 0,
      createdAt: fight.timestamp,
    };
  }
}

/**
 * Award prize to fight winner
 */
export async function awardPrize(fightId: string, amount: number, isEntertaining: boolean = false): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('fights')
      .update({
        prize_awarded: true,
        prize_amount: amount,
        is_entertaining: isEntertaining,
      })
      .eq('id', fightId);

    if (error) {
      console.error('Failed to award prize:', error.message);
      return false;
    }

    return true;
  } else {
    console.log('Prize awarded locally:', { fightId, amount, isEntertaining });
    return true;
  }
}

/**
 * Mark fight as entertaining (bonus prize)
 */
export async function markFightEntertaining(fightId: string): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('fights')
      .update({
        is_entertaining: true,
      })
      .eq('id', fightId);

    if (error) {
      console.error('Failed to mark fight as entertaining:', error.message);
      return false;
    }

    return true;
  } else {
    console.log('Fight marked as entertaining locally:', { fightId });
    return true;
  }
}

/**
 * Check if using Supabase or localStorage
 */
export function isUsingSupabase(): boolean {
  return isSupabaseConfigured();
}

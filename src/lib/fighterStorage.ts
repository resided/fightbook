// FightBook - Fighter Storage API Layer
// CRUD operations for fighters with encrypted API keys
// Works with Supabase when configured, falls back to localStorage

import { supabase, isSupabaseConfigured, type FighterRow } from './supabase';
import {
  CompleteAgent,
  createNewAgent,
  SkillsMdConfig,
  AgentMetadata,
  DEFAULT_SKILLS,
  DEFAULT_PERSONALITY,
  DEFAULT_BACKSTORY,
  DEFAULT_SOCIAL,
} from '@/types/agent';
import * as storage from './storage';

// Encryption utilities using base64 (simple obfuscation for demo)
// In production, use proper encryption with user-derived keys
function encryptApiKey(apiKey: string): string {
  // Simple base64 encoding - NOT secure for production
  // For production: use Web Crypto API with user-derived key
  return btoa(apiKey);
}

function decryptApiKey(encrypted: string): string {
  try {
    return atob(encrypted);
  } catch {
    return '';
  }
}

// Convert database row to CompleteAgent
function rowToAgent(row: FighterRow): CompleteAgent {
  // Extract metadata with defaults for missing fields
  const rowMetadata = row.metadata as Record<string, unknown>;
  return {
    metadata: {
      id: (rowMetadata?.id as string) || row.id,
      name: row.name,
      createdAt: new Date(row.created_at).getTime(),
      updatedAt: new Date(row.updated_at).getTime(),
      version: (rowMetadata?.version as number) || 1,
      totalFights: (rowMetadata?.totalFights as number) || 0,
      wins: (rowMetadata?.wins as number) || 0,
      losses: (rowMetadata?.losses as number) || 0,
      draws: (rowMetadata?.draws as number) || 0,
      kos: (rowMetadata?.kos as number) || 0,
      submissions: (rowMetadata?.submissions as number) || 0,
      currentStreak: (rowMetadata?.currentStreak as number) || 0,
      bestStreak: (rowMetadata?.bestStreak as number) || 0,
      ranking: (rowMetadata?.ranking as number) || 1000,
      earnings: (rowMetadata?.earnings as number) || 0,
      xp: (rowMetadata?.xp as number) || 0,
      level: (rowMetadata?.level as number) || 1,
    },
    skills: {
      ...DEFAULT_SKILLS,
      ...(row.stats as Partial<SkillsMdConfig>),
      name: row.name,
    },
    personality: DEFAULT_PERSONALITY,
    backstory: DEFAULT_BACKSTORY,
    social: DEFAULT_SOCIAL,
  };
}

// Convert CompleteAgent to database row format
function agentToRow(agent: CompleteAgent, apiKey?: string, provider?: string): Partial<FighterRow> {
  const row: Partial<FighterRow> = {
    name: agent.metadata.name,
    stats: agent.skills as unknown as Record<string, unknown>,
    metadata: {
      ...agent.metadata,
      createdAt: undefined,
      updatedAt: undefined,
    } as unknown as Record<string, unknown>,
  };

  // Only add API key if provided
  if (apiKey) {
    row.api_key_encrypted = encryptApiKey(apiKey);
    row.api_provider = provider as 'openai' | 'anthropic';
  }

  return row;
}

// =====================
// CRUD Operations
// =====================

/**
 * Save a new fighter to the database
 * @param name - Fighter name
 * @param apiKey - API key (will be encrypted) - optional for local fighters
 * @param apiProvider - 'openai' or 'anthropic'
 * @param skills - Optional skills configuration
 */
export async function saveFighter(
  name: string,
  apiKey?: string,
  apiProvider?: 'openai' | 'anthropic',
  skills?: Partial<SkillsMdConfig>
): Promise<CompleteAgent> {
  const agent = createNewAgent(name);
  
  if (skills) {
    agent.skills = { ...agent.skills, ...skills };
  }

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('fighters')
      .insert(agentToRow(agent, apiKey, apiProvider))
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save fighter: ${error.message}`);
    }

    return rowToAgent(data);
  } else {
    // Fallback to localStorage
    storage.saveAgent(agent);
    return agent;
  }
}

/**
 * Get all fighters for the current user
 */
export async function getFighters(): Promise<CompleteAgent[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('fighters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch fighters:', error.message);
      return storage.getAllAgents();
    }

    return data.map(rowToAgent);
  } else {
    // Fallback to localStorage
    return storage.getAllAgents();
  }
}

/**
 * Get a single fighter by ID
 */
export async function getFighter(id: string): Promise<CompleteAgent | null> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('fighters')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return rowToAgent(data);
  } else {
    // Fallback to localStorage
    return storage.getAgentById(id);
  }
}

/**
 * Get fighter's decrypted API key
 * @param id - Fighter ID
 * @returns Decrypted API key or null if not found
 */
export async function getFighterApiKey(id: string): Promise<string | null> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('fighters')
      .select('api_key_encrypted')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return decryptApiKey(data.api_key_encrypted);
  } else {
    // Fallback to localStorage - not stored there either
    return null;
  }
}

/**
 * Update a fighter's data
 * @param id - Fighter ID
 * @param updates - Partial agent data to update
 * @param newApiKey - Optional new API key
 * @param newProvider - Optional new provider
 */
export async function updateFighter(
  id: string,
  updates: Partial<CompleteAgent>,
  newApiKey?: string,
  newProvider?: 'openai' | 'anthropic'
): Promise<CompleteAgent | null> {
  const updateData: Partial<FighterRow> = {};

  if (updates.metadata) {
    updateData.metadata = updates.metadata as unknown as Record<string, unknown>;
  }

  if (updates.skills) {
    updateData.stats = updates.skills as unknown as Record<string, unknown>;
  }

  if (newApiKey) {
    updateData.api_key_encrypted = encryptApiKey(newApiKey);
  }

  if (newProvider) {
    updateData.api_provider = newProvider;
  }

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('fighters')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update fighter:', error.message);
      return null;
    }

    return rowToAgent(data);
  } else {
    // Fallback to localStorage
    const agents = storage.getAllAgents();
    const index = agents.findIndex(a => a.metadata.id === id);
    
    if (index === -1) {
      return null;
    }

    if (updates.skills) {
      agents[index].skills = { ...agents[index].skills, ...updates.skills };
    }
    if (updates.metadata) {
      agents[index].metadata = { ...agents[index].metadata, ...updates.metadata };
    }
    
    storage.saveAgent(agents[index]);
    return agents[index];
  }
}

/**
 * Delete a fighter
 * @param id - Fighter ID
 */
export async function deleteFighter(id: string): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('fighters')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete fighter:', error.message);
      return false;
    }

    return true;
  } else {
    // Fallback to localStorage
    storage.deleteAgent(id);
    return true;
  }
}

/**
 * Check if using Supabase or localStorage
 */
export function isUsingSupabase(): boolean {
  return isSupabaseConfigured();
}

/**
 * Save or update a complete agent (full sync)
 * @param agent - Complete agent to save
 * @param apiKey - Optional API key
 * @param apiProvider - Optional API provider
 */
export async function syncAgent(
  agent: CompleteAgent,
  apiKey?: string,
  apiProvider?: 'openai' | 'anthropic'
): Promise<CompleteAgent> {
  if (isSupabaseConfigured() && supabase) {
    // Look up by local ID stored in metadata JSONB
    const { data: existing } = await supabase
      .from('fighters')
      .select('id')
      .filter('metadata->>id', 'eq', agent.metadata.id)
      .maybeSingle();

    if (existing) {
      const updateData: Partial<FighterRow> = {
        name: agent.metadata.name,
        stats: agent.skills as unknown as Record<string, unknown>,
        metadata: {
          ...agent.metadata,
          createdAt: undefined,
          updatedAt: undefined,
        } as unknown as Record<string, unknown>,
      };
      if (apiKey) {
        updateData.api_key_encrypted = encryptApiKey(apiKey);
        updateData.api_provider = apiProvider;
      }
      const { error } = await supabase
        .from('fighters')
        .update(updateData)
        .eq('id', existing.id);
      if (error) console.error('Failed to sync fighter:', error.message);
    } else {
      const { error } = await supabase
        .from('fighters')
        .insert(agentToRow(agent, apiKey, apiProvider));
      if (error) console.error('Failed to insert fighter:', error.message);
    }
  }

  // Always save to localStorage as backup
  storage.saveAgent(agent);
  return agent;
}

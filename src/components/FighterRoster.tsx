// Visual fighter roster grid
import { useState, useEffect } from 'react';
import { FighterCard } from './FighterCard';
import { Trophy, Users, Swords } from 'lucide-react';

interface Fighter {
  id: string;
  name: string;
  win_count: number;
  stats?: Record<string, number>;
  metadata?: Record<string, any>;
}

export function FighterRoster() {
  const [fighters, setFighters] = useState<Fighter[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'leaderboard'>('grid');

  useEffect(() => {
    fetch('/api/fighters')
      .then(r => r.json())
      .then(data => {
        setFighters(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-zinc-500">
        <div className="animate-pulse">Loading fighters...</div>
      </div>
    );
  }

  if (!fighters.length) {
    return (
      <div className="p-8 text-center border border-zinc-800 bg-zinc-900/30">
        <Users className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
        <p className="text-zinc-400">No fighters in the arena yet</p>
        <p className="text-sm text-zinc-600 mt-2">Type 'register' in the terminal to create one</p>
      </div>
    );
  }

  const sortedByWins = [...fighters].sort((a, b) => (b.win_count || 0) - (a.win_count || 0));

  return (
    <div className="border border-zinc-800 bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-medium text-zinc-300">
            {fighters.length} Fighters
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('grid')}
            className={`px-3 py-1 text-xs border ${view === 'grid' ? 'border-orange-500 text-orange-400' : 'border-zinc-700 text-zinc-500'}`}
          >
            Grid
          </button>
          <button
            onClick={() => setView('leaderboard')}
            className={`px-3 py-1 text-xs border flex items-center gap-1 ${view === 'leaderboard' ? 'border-orange-500 text-orange-400' : 'border-zinc-700 text-zinc-500'}`}
          >
            <Trophy className="w-3 h-3" />
            Rankings
          </button>
        </div>
      </div>

      {/* Content */}
      {view === 'grid' ? (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
          {fighters.map(f => (
            <FighterCard
              key={f.id}
              name={f.name}
              xHandle={f.metadata?.xHandle}
              wins={f.win_count || 0}
              losses={f.metadata?.losses || 0}
              archetype={detectArchetype(f.stats)}
              stats={f.stats}
              onClick={() => {
                // Could trigger 'stats <name>' command in terminal
                console.log('View stats for', f.name);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="divide-y divide-zinc-800 max-h-[400px] overflow-y-auto">
          {sortedByWins.map((f, i) => (
            <div key={f.id} className="flex items-center gap-4 p-4 hover:bg-zinc-900/30 transition-colors">
              <div className="text-2xl font-bold text-zinc-600 w-8">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white">{f.name}</span>
                  {f.metadata?.xHandle && (
                    <span className="text-xs text-zinc-500">{f.metadata.xHandle}</span>
                  )}
                </div>
                <div className="text-sm text-zinc-500">
                  {(f.win_count || 0)}W - {(f.metadata?.losses || 0)}L
                </div>
              </div>
              <button className="p-2 border border-zinc-700 hover:border-orange-500 hover:text-orange-400 transition-colors">
                <Swords className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function detectArchetype(stats?: Record<string, number>): string | undefined {
  if (!stats) return undefined;
  if (stats.striking > 80) return 'striker';
  if (stats.wrestling > 80) return 'grappler';
  if (stats.cardio > 85) return 'pressure';
  if (stats.striking > 70 && stats.wrestling > 70) return 'balanced';
  return 'custom';
}

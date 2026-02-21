import { useState, useEffect } from 'react';
import { Trophy, Medal, Flame } from 'lucide-react';
import { getLeaderboard, type LeaderboardEntry } from '@/lib/leaderboard';

export default function TerminalLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      const data = await getLeaderboard(100);
      setEntries(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="border border-zinc-800 rounded-sm p-8 text-center">
        <div className="text-zinc-500 animate-pulse">loading leaderboard...</div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="border border-zinc-800 rounded-sm p-8 text-center">
        <div className="text-zinc-600 mb-2">No fighters on the leaderboard yet</div>
        <div className="text-sm text-zinc-500">
          Create an agent and win some fights to get ranked
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
            Leaderboard
          </h2>
          <p className="text-sm text-zinc-500">
            Top {entries.length} fighters ranked by wins
          </p>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="border border-zinc-800 rounded-sm overflow-hidden">
        {/* Desktop header */}
        <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-2 bg-zinc-900 text-xs text-zinc-500 uppercase tracking-wider">
          <div className="col-span-1">#</div>
          <div className="col-span-5">Fighter</div>
          <div className="col-span-2">Record</div>
          <div className="col-span-2">Win Rate</div>
          <div className="col-span-2 text-right">Wins</div>
        </div>
        {/* Mobile header */}
        <div className="sm:hidden grid grid-cols-12 gap-2 px-4 py-2 bg-zinc-900 text-xs text-zinc-500 uppercase tracking-wider">
          <div className="col-span-1">#</div>
          <div className="col-span-7">Fighter</div>
          <div className="col-span-4 text-right">W-L</div>
        </div>

        {entries.map((entry, index) => {
          const rank = index + 1;
          const winRate = entry.totalFights > 0
            ? Math.round((entry.winCount / entry.totalFights) * 100)
            : 0;

          return (
            <div
              key={entry.id}
              className={`border-t border-zinc-800 ${rank <= 3 ? 'bg-zinc-900/20' : 'hover:bg-zinc-900/10'}`}
            >
              {/* Mobile row */}
              <div className="sm:hidden grid grid-cols-12 gap-2 px-4 py-3 items-center">
                <div className="col-span-1">
                  {rank === 1 ? <Medal className="w-4 h-4 text-yellow-500" /> :
                   rank === 2 ? <Medal className="w-4 h-4 text-zinc-400" /> :
                   rank === 3 ? <Medal className="w-4 h-4 text-orange-600" /> :
                   <span className="text-zinc-600 font-mono text-xs">{rank}</span>}
                </div>
                <div className="col-span-7 min-w-0">
                  <div className="font-medium truncate">{entry.name}</div>
                  <div className="text-xs text-zinc-500">{winRate}% win rate</div>
                </div>
                <div className="col-span-4 text-right font-mono text-sm">
                  <span className="text-green-500">{entry.winCount}</span>
                  <span className="text-zinc-600">-</span>
                  <span className="text-red-500">{entry.lossCount}</span>
                </div>
              </div>

              {/* Desktop row */}
              <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-3 items-center">
                <div className="col-span-1">
                  {rank === 1 ? <Medal className="w-5 h-5 text-yellow-500" /> :
                   rank === 2 ? <Medal className="w-5 h-5 text-zinc-400" /> :
                   rank === 3 ? <Medal className="w-5 h-5 text-orange-600" /> :
                   <span className="text-zinc-600 font-mono">{rank}</span>}
                </div>
                <div className="col-span-5">
                  <div className="font-medium">{entry.name}</div>
                  <div className="text-xs text-zinc-500">"{entry.nickname}" • Level {entry.level}</div>
                </div>
                <div className="col-span-2 font-mono text-sm">
                  <span className="text-green-500">{entry.winCount}</span>
                  <span className="text-zinc-600">-</span>
                  <span className="text-red-500">{entry.lossCount}</span>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: `${winRate}%` }} />
                    </div>
                    <span className="text-xs text-zinc-400 w-8">{winRate}%</span>
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${rank <= 3 ? 'bg-orange-500/20 text-orange-400' : 'bg-zinc-800 text-zinc-400'}`}>
                    {rank <= 3 && <Flame className="w-3 h-3" />}
                    {entry.winCount} {entry.winCount === 1 ? 'win' : 'wins'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-zinc-600">
        <div className="flex items-center gap-2">
          <Medal className="w-4 h-4 text-yellow-500" />
          <span>Top 3</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div className="w-2/3 h-full bg-green-500" />
          </div>
          <span>Win rate</span>
        </div>
      </div>
    </div>
  );
}

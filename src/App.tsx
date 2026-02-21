import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import TerminalCLI from '@/components/TerminalCLI';
import { FighterRoster } from '@/components/FighterRoster';
import { Terminal, LayoutGrid, Trophy } from 'lucide-react';

type ViewMode = 'cli' | 'roster' | 'leaderboard';

function App() {
  const [view, setView] = useState<ViewMode>('cli');

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="text-orange-500 font-bold text-lg">⚔</span>
              <span className="font-bold text-white">FightBook</span>
              <span className="text-xs text-zinc-500 hidden sm:inline">v1.1.17</span>
            </div>

            {/* Nav Tabs */}
            <nav className="flex items-center gap-1">
              <NavButton 
                active={view === 'cli'} 
                onClick={() => setView('cli')}
                icon={<Terminal className="w-4 h-4" />}
                label="CLI"
              />
              <NavButton 
                active={view === 'roster'} 
                onClick={() => setView('roster')}
                icon={<LayoutGrid className="w-4 h-4" />}
                label="Roster"
              />
              <NavButton 
                active={view === 'leaderboard'} 
                onClick={() => setView('leaderboard')}
                icon={<Trophy className="w-4 h-4" />}
                label="Rankings"
              />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {view === 'cli' ? (
          <TerminalCLI />
        ) : view === 'roster' ? (
          <div className="h-full p-4 max-w-7xl mx-auto overflow-y-auto">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-white mb-1">Fighter Roster</h1>
              <p className="text-zinc-500 text-sm">Click a fighter to view their full stats and fight history</p>
            </div>
            <FighterRoster />
          </div>
        ) : (
          <div className="h-full p-4 max-w-7xl mx-auto overflow-y-auto">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-white mb-1">Leaderboard</h1>
              <p className="text-zinc-500 text-sm">Top fighters ranked by wins</p>
            </div>
            <LeaderboardView />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4 text-zinc-500">
              <span className="text-zinc-600">$FIGHT:</span>
              <span className="font-mono text-zinc-400 hidden sm:inline">0xfC01A7760CfE6a3f4D2635f0BdCaB992DB2a1b07</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText('0xfC01A7760CfE6a3f4D2635f0BdCaB992DB2a1b07');
                  toast.success('Contract copied');
                }}
                className="text-zinc-600 hover:text-zinc-300 transition-colors"
              >
                [copy]
              </button>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://x.com/0xreside" target="_blank" rel="noopener" className="text-zinc-500 hover:text-zinc-300">
                @0xreside
              </a>
              <a href="https://github.com/resided/fightbook" target="_blank" rel="noopener" className="text-zinc-500 hover:text-zinc-300">
                github
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
        active 
          ? 'text-orange-400 border-b-2 border-orange-500' 
          : 'text-zinc-500 hover:text-zinc-300'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

// Simple leaderboard view component
function LeaderboardView() {
  const [fighters, setFighters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/fighters')
      .then(r => r.json())
      .then(data => {
        const sorted = (data || []).sort((a: any, b: any) => (b.win_count || 0) - (a.win_count || 0));
        setFighters(sorted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center text-zinc-500 py-8">Loading...</div>;
  }

  return (
    <div className="border border-zinc-800 bg-black">
      <div className="divide-y divide-zinc-800">
        {fighters.map((f, i) => {
          const total = (f.win_count || 0) + (f.metadata?.losses || 0);
          const winRate = total > 0 ? Math.round(((f.win_count || 0) / total) * 100) : 0;
          
          return (
            <div key={f.id} className="flex items-center gap-6 p-6 hover:bg-zinc-900/30 transition-colors">
              <div className="text-3xl font-bold text-zinc-700 w-16">
                {i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}`}
              </div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 border-2 border-orange-500/30 flex items-center justify-center text-2xl">
                {f.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white">{f.name}</h3>
                <div className="flex items-center gap-3 text-sm text-zinc-500">
                  {f.metadata?.xHandle && (
                    <a 
                      href={`https://x.com/${f.metadata.xHandle.replace('@', '')}`}
                      target="_blank" 
                      rel="noopener"
                      className="hover:text-zinc-300"
                    >
                      {f.metadata.xHandle}
                    </a>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{f.win_count || 0}</div>
                <div className="text-sm text-zinc-500">wins</div>
              </div>
              <div className="text-right w-20">
                <div className="text-lg font-bold text-zinc-400">{winRate}%</div>
                <div className="text-xs text-zinc-600">win rate</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;

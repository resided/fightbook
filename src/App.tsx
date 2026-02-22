import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import TerminalCLI from '@/components/TerminalCLI';
import { FighterRoster } from '@/components/FighterRoster';
import { FighterCreator } from '@/components/FighterCreator';
import { Terminal, Users, Trophy, Plus, HelpCircle, Info } from 'lucide-react';

type ViewMode = 'cli' | 'roster' | 'leaderboard' | 'create';

const FIGHT_CA = '0xfC01A7760CfE6a3f4D2635f0BdCaB992DB2a1b07';

function fmtPrice(usd: string): string {
  const p = parseFloat(usd);
  if (!p) return '--';
  if (p >= 1)      return `$${p.toFixed(2)}`;
  if (p >= 0.0001) return `$${p.toFixed(6)}`;
  return `$${p.toFixed(8)}`;
}

function fmtMcap(n: number): string {
  if (!n) return '--';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${Math.round(n / 1e3)}K`;
  return `$${Math.round(n)}`;
}

function App() {
  const [view, setView] = useState<ViewMode>('cli');
  const [showCreator, setShowCreator] = useState(false);
  const [token, setToken] = useState<{ price: string; mcap: number; change: number } | null>(null);

  useEffect(() => {
    async function fetchToken() {
      try {
        const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${FIGHT_CA}`);
        const data = await res.json();
        const pair = data?.pairs?.[0];
        if (pair) {
          setToken({
            price: pair.priceUsd ?? '0',
            mcap: pair.marketCap ?? 0,
            change: pair.priceChange?.h24 ?? 0,
          });
        }
      } catch {
        // silently fail — token data is non-critical
      }
    }
    fetchToken();
    const id = setInterval(fetchToken, 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handleOpenCreator = () => setShowCreator(true);
    window.addEventListener('openFighterCreator', handleOpenCreator);
    return () => window.removeEventListener('openFighterCreator', handleOpenCreator);
  }, []);

  const handleCreateFighter = async (fighter: {
    name: string;
    nickname: string;
    templateId: string;
    stats: { striking: number; grappling: number; stamina: number; power: number; chin: number; speed: number };
    xHandle?: string;
    walletAddress?: string;
  }) => {
    try {
      const res = await fetch('/api/fighters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fighter.name,
          stats: fighter.stats,
          metadata: {
            nickname: fighter.nickname,
            templateId: fighter.templateId,
            xHandle: fighter.xHandle || undefined,
            walletAddress: fighter.walletAddress || undefined,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || 'Failed to create fighter');
        return;
      }

      toast.success(`${fighter.name} has entered the arena!`);
      setShowCreator(false);
      setView('roster');
    } catch (e) {
      toast.error('Network error');
    }
  };

  if (showCreator) {
    return <FighterCreator onComplete={handleCreateFighter} onCancel={() => setShowCreator(false)} />;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <img src="/fightbook-logo.png" alt="FightBook" className="h-8 w-auto" />

            {/* Navigation */}
            <nav className="flex items-center">
              <NavButton active={view === 'cli'} onClick={() => setView('cli')} icon={<Terminal className="w-4 h-4" />} label="CLI" />
              <NavButton active={view === 'roster'} onClick={() => setView('roster')} icon={<Users className="w-4 h-4" />} label="ROSTER" />
              <NavButton active={view === 'leaderboard'} onClick={() => setView('leaderboard')} icon={<Trophy className="w-4 h-4" />} label="RANKS" />
              <button
                onClick={() => setShowCreator(true)}
                className="flex items-center gap-2 px-4 py-2 ml-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">CREATE</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        {view === 'cli' && <TerminalCLI />}
        {view === 'roster' && (
          <div className="h-full p-6 max-w-7xl mx-auto overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white">FIGHTER ROSTER</h1>
                <p className="text-zinc-500 text-sm">All fighters currently in the arena</p>
              </div>
              <button onClick={() => setShowCreator(true)} className="btn-primary">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">CREATE FIGHTER</span>
              </button>
            </div>
            <FighterRoster />
          </div>
        )}
        {view === 'leaderboard' && (
          <div className="h-full p-6 max-w-7xl mx-auto overflow-y-auto">
            <LeaderboardView />
          </div>
        )}
      </main>

      {/* Single Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-3 text-zinc-500">
              <span className="font-bold text-zinc-400">$FIGHT</span>
              {token ? (
                <>
                  <span className="font-mono text-orange-400">{fmtPrice(token.price)}</span>
                  <span className={`font-mono text-xs ${token.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {token.change >= 0 ? '+' : ''}{token.change.toFixed(1)}%
                  </span>
                  <span className="text-zinc-600">MCap {fmtMcap(token.mcap)}</span>
                  <span className="text-zinc-700">|</span>
                </>
              ) : null}
              <span className="font-mono text-zinc-600">0xfC01...2a1b07</span>
              <button onClick={() => { navigator.clipboard.writeText(FIGHT_CA); toast.success('Copied'); }} className="text-zinc-700 hover:text-white">[COPY]</button>
            </div>
            <div className="flex items-center gap-4 text-zinc-500">
              <a href="https://x.com/0xreside" target="_blank" rel="noopener" className="hover:text-white">@0xRESIDE</a>
              <a href="https://github.com/resided/fightbook" target="_blank" rel="noopener" className="hover:text-white">GITHUB</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 text-sm font-bold transition-colors ${active ? 'text-red-400 border-b-2 border-red-500 -mb-px' : 'text-zinc-500 hover:text-zinc-300'}`}>
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function LeaderboardView() {
  const [fighters, setFighters] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/fighters')
      .then(r => r.json())
      .then(data => setFighters((data || []).sort((a: any, b: any) => (b.win_count || 0) - (a.win_count || 0))));
  }, []);

  return (
    <>
      <h1 className="text-2xl font-bold text-white mb-6">LEADERBOARD</h1>
      <div className="border border-zinc-800 bg-black rounded-lg overflow-hidden">
        <div className="divide-y divide-zinc-800">
          {fighters.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No fights yet. Create fighters and make them battle!</p>
            </div>
          ) : fighters.map((f, i) => {
            const total = (f.win_count || 0) + (f.metadata?.losses || 0);
            const winRate = total > 0 ? Math.round(((f.win_count || 0) / total) * 100) : 0;
            return (
              <div key={f.id} className="flex items-center gap-4 p-4 hover:bg-zinc-900/50 transition-colors">
                <div className={`text-2xl font-bold w-10 ${i < 3 ? 'text-red-500' : 'text-zinc-600'}`}>{i < 3 ? ['1', '2', '3'][i] : i + 1}</div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500/20 to-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-lg">{f.name.charAt(0).toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white truncate">{f.name}</h3>
                  {f.metadata?.nickname && <p className="text-xs text-zinc-500 truncate">"{f.metadata.nickname}"</p>}
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">{f.win_count || 0}</div>
                  <div className="text-xs text-zinc-500">WINS</div>
                </div>
                <div className="text-right w-16">
                  <div className="font-bold text-zinc-400">{winRate}%</div>
                  <div className="text-xs text-zinc-600">WR</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default App;

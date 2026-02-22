// Visual fighter profile card
interface FighterCardProps {
  name: string;
  xHandle?: string;
  wins: number;
  losses: number;
  archetype?: string;
  stats?: Record<string, number>;
  onClick?: () => void;
}

export function FighterCard({ name, xHandle, wins, losses, archetype, stats, onClick }: FighterCardProps) {
  const total = wins + losses;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
  
  // Archetype colors
  const archetypeColors: Record<string, string> = {
    striker: 'text-red-400 border-red-500/30',
    grappler: 'text-blue-400 border-blue-500/30',
    balanced: 'text-green-400 border-green-500/30',
    pressure: 'text-orange-400 border-orange-500/30',
    counter: 'text-purple-400 border-purple-500/30',
  };
  
  const colorClass = archetype ? (archetypeColors[archetype] || 'text-zinc-400 border-zinc-500/30') : 'text-zinc-400 border-zinc-500/30';

  return (
    <div 
      onClick={onClick}
      className={`border ${colorClass} bg-zinc-900/50 p-4 cursor-pointer hover:bg-zinc-800/50 transition-all group`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors">
            {name}
          </h3>
          {xHandle && (
            <a 
              href={`https://x.com/${xHandle.replace('@', '')}`}
              target="_blank"
              rel="noopener"
              className="text-xs text-zinc-500 hover:text-zinc-300"
              onClick={e => e.stopPropagation()}
            >
              {xHandle}
            </a>
          )}
        </div>
        {archetype && (
          <span className={`text-xs px-2 py-1 border ${colorClass} uppercase tracking-wider`}>
            {archetype}
          </span>
        )}
      </div>

      {/* Record */}
      <div className="flex items-center gap-4 mb-4">
        <div className="text-2xl font-bold text-white">
          {wins}<span className="text-zinc-600">W</span> {losses}<span className="text-zinc-600">L</span>
        </div>
        <div className="text-sm text-zinc-500">
          {winRate}% win rate
        </div>
      </div>

      {/* Stats Bars (if provided) */}
      {stats && (
        <div className="space-y-2">
          <StatBar label="Striking" value={stats.striking || 50} color="red" />
          <StatBar label="Grappling" value={stats.grappling || stats.wrestling || 50} color="blue" />
          <StatBar label="Stamina" value={stats.stamina || stats.cardio || 50} color="green" />
        </div>
      )}

      {/* Click hint */}
      <div className="mt-3 text-xs text-zinc-600 group-hover:text-zinc-400">
        Click to view full profile →
      </div>
    </div>
  );
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClasses: Record<string, string> = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
  };
  
  const width = Math.min(Math.max(value, 0), 100);
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-zinc-500 w-16">{label}</span>
      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClasses[color] || 'bg-zinc-500'} transition-all`}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="text-xs text-zinc-400 w-8 text-right">{value}</span>
    </div>
  );
}

import { useEffect, useState } from 'react';

type FighterAction = 'idle' | 'punch' | 'block' | 'hit' | 'knockdown' | 'takedown' | 'submission' | 'victory';

// 8 cols × 10 rows pixel sprites. 1 = filled, 0 = transparent.
const SPRITES: Record<FighterAction, number[][]> = {
  idle: [
    [0,0,1,1,1,0,0,0],
    [0,0,1,1,1,0,0,0],
    [0,0,0,1,0,0,0,0],
    [0,1,1,1,1,1,0,0],
    [0,0,0,1,0,0,0,0],
    [0,0,0,1,0,0,0,0],
    [0,0,0,1,0,0,0,0],
    [0,0,1,0,1,0,0,0],
    [0,0,1,0,1,0,0,0],
    [0,1,0,0,0,1,0,0],
  ],
  punch: [
    [0,0,1,1,1,0,0,0],
    [0,0,1,1,1,0,0,0],
    [0,0,0,1,0,0,0,0],
    [0,0,1,1,1,1,1,1],
    [0,0,0,1,0,0,0,0],
    [0,0,0,1,0,0,0,0],
    [0,0,0,1,0,0,0,0],
    [0,0,1,0,1,0,0,0],
    [0,1,0,0,0,1,0,0],
    [0,1,0,0,0,1,0,0],
  ],
  block: [
    [0,0,1,1,1,0,0,0],
    [0,0,1,1,1,0,0,0],
    [0,0,0,1,0,0,0,0],
    [0,1,1,1,1,0,0,0],
    [0,1,0,1,0,0,0,0],
    [0,1,0,1,0,0,0,0],
    [0,0,0,1,0,0,0,0],
    [0,0,1,0,1,0,0,0],
    [0,0,1,0,1,0,0,0],
    [0,1,0,0,0,1,0,0],
  ],
  hit: [
    [0,0,0,1,1,1,0,0],
    [0,0,0,1,1,1,0,0],
    [0,0,0,0,1,0,0,0],
    [0,0,1,1,1,1,0,0],
    [0,0,0,0,1,0,0,0],
    [0,0,0,1,0,0,0,0],
    [0,0,0,1,0,0,0,0],
    [0,0,1,0,1,0,0,0],
    [0,1,0,0,0,1,0,0],
    [0,1,0,0,0,0,1,0],
  ],
  knockdown: [
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,1,1,1,0,0,0,0],
    [0,1,1,1,0,0,0,0],
    [1,1,1,1,1,1,1,0],
    [0,0,0,0,1,0,1,0],
  ],
  takedown: [
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,1,1,1,0,0,0],
    [0,0,1,1,1,0,0,0],
    [0,1,1,1,1,1,0,0],
    [1,1,0,1,0,1,1,0],
    [0,0,0,1,0,0,0,0],
    [0,0,1,0,1,0,0,0],
  ],
  submission: [
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,1,1,1,0,0,0,0],
    [0,1,1,1,0,0,0,0],
    [1,1,1,1,1,1,0,0],
    [0,0,1,1,1,0,1,0],
    [0,0,0,0,0,1,0,0],
  ],
  victory: [
    [0,0,1,1,1,0,0,0],
    [0,0,1,1,1,0,0,0],
    [0,0,0,1,0,0,0,0],
    [1,1,1,1,1,1,1,0],
    [0,0,0,1,0,0,0,0],
    [0,0,0,1,0,0,0,0],
    [0,0,0,1,0,0,0,0],
    [0,0,1,0,1,0,0,0],
    [0,1,0,0,0,1,0,0],
    [1,0,0,0,0,0,1,0],
  ],
};

// Returns animation class based on action + which side the fighter is on.
// "mirrored" fighters face left, so punch/hit directions are reversed.
function animClass(action: FighterAction, mirrored: boolean): string {
  if (action === 'punch')     return mirrored ? 'arena-punch-mirror' : 'arena-punch';
  if (action === 'hit')       return mirrored ? 'arena-hit-mirror'   : 'arena-hit';
  if (action === 'knockdown') return 'arena-knockdown';
  if (action === 'victory')   return 'arena-victory';
  return '';
}

function parseAction(
  text: string,
  aName: string,
  bName: string,
): { aAction: FighterAction; bAction: FighterAction; effect: 'punch' | 'slam' | null } {
  const lower = text.toLowerCase();
  const aIdx = lower.indexOf(aName.toLowerCase());
  const bIdx = lower.indexOf(bName.toLowerCase());
  // Fighter named first is the attacker
  const aAttacks = aIdx !== -1 && (bIdx === -1 || aIdx < bIdx);

  if (lower.includes('[critical]') || lower.includes('massive shot') || lower.includes('swarms') || lower.includes('referee stops')) {
    return aAttacks
      ? { aAction: 'punch', bAction: 'knockdown', effect: 'punch' }
      : { aAction: 'knockdown', bAction: 'punch', effect: 'punch' };
  }
  if (lower.includes('taps') || lower.includes('guillotine') || lower.includes('armbar') || lower.includes('triangle') || lower.includes('rear naked choke')) {
    return aAttacks
      ? { aAction: 'submission', bAction: 'knockdown', effect: 'slam' }
      : { aAction: 'knockdown', bAction: 'submission', effect: 'slam' };
  }
  if (lower.includes('attempts a submission') && lower.includes('escapes')) {
    return { aAction: 'submission', bAction: 'block', effect: null };
  }
  if (lower.includes('secures a takedown') || lower.includes('ground and pound')) {
    return aAttacks
      ? { aAction: 'takedown', bAction: 'knockdown', effect: 'slam' }
      : { aAction: 'knockdown', bAction: 'takedown', effect: 'slam' };
  }
  if (lower.includes('shoots but') || lower.includes('defends')) {
    return aAttacks
      ? { aAction: 'takedown', bAction: 'block', effect: null }
      : { aAction: 'block', bAction: 'takedown', effect: null };
  }
  if (lower.includes('misses')) {
    return aAttacks
      ? { aAction: 'punch', bAction: 'block', effect: null }
      : { aAction: 'block', bAction: 'punch', effect: null };
  }
  if (lower.includes('lands') || lower.includes('connects') || lower.includes('solid strike') || lower.includes('hurt')) {
    return aAttacks
      ? { aAction: 'punch', bAction: 'hit', effect: 'punch' }
      : { aAction: 'hit', bAction: 'punch', effect: 'punch' };
  }
  if (lower.includes('wins by') || lower.includes('wins victory')) {
    return aAttacks
      ? { aAction: 'victory', bAction: 'knockdown', effect: null }
      : { aAction: 'knockdown', bAction: 'victory', effect: null };
  }
  return { aAction: 'idle', bAction: 'idle', effect: null };
}

const PIXEL = 5; // px per pixel cell

function PixelFighter({ action, mirrored, color }: { action: FighterAction; mirrored: boolean; color: string }) {
  const sprite = SPRITES[action] || SPRITES.idle;
  const cls = animClass(action, mirrored);

  return (
    // Outer div handles X-axis animation (translateX)
    <div className={cls}>
      {/* Inner div handles horizontal mirroring */}
      <div style={{ transform: mirrored ? 'scaleX(-1)' : undefined, display: 'inline-block' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(8, ${PIXEL}px)`,
          gridTemplateRows: `repeat(10, ${PIXEL}px)`,
          gap: '1px',
          imageRendering: 'pixelated',
        }}>
          {sprite.flat().map((on, i) => (
            <div
              key={i}
              style={{ width: PIXEL, height: PIXEL, backgroundColor: on ? color : 'transparent' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface FightArenaProps {
  aName: string;
  bName: string;
  currentAction: string;
  round: number;
  active: boolean;
}

export default function FightArena({ aName, bName, currentAction, round, active }: FightArenaProps) {
  const [aAction, setAAction] = useState<FighterAction>('idle');
  const [bAction, setBAction] = useState<FighterAction>('idle');
  const [effect, setEffect] = useState<'punch' | 'slam' | null>(null);

  useEffect(() => {
    if (!currentAction || !active) {
      setAAction('idle');
      setBAction('idle');
      return;
    }

    const parsed = parseAction(currentAction, aName, bName);
    setAAction(parsed.aAction);
    setBAction(parsed.bAction);

    let clearEffect: ReturnType<typeof setTimeout> | undefined;
    if (parsed.effect) {
      setEffect(parsed.effect);
      clearEffect = setTimeout(() => setEffect(null), 500);
    }

    const resetIdle = setTimeout(() => {
      setAAction('idle');
      setBAction('idle');
    }, 900);

    return () => {
      clearTimeout(resetIdle);
      clearTimeout(clearEffect);
    };
  }, [currentAction, active, aName, bName]);

  if (!active) return null;

  return (
    <div className="border-b border-zinc-800 bg-zinc-950 shrink-0 select-none font-mono">
      {/* Round header */}
      <div className="text-center text-[10px] text-zinc-600 pt-2 pb-1 tracking-widest">
        {'── ROUND ' + round + ' ─────────────────────────── LIVE ──'}
      </div>

      {/* Fighters */}
      <div className="relative flex items-end justify-between px-16 pb-2 max-w-xs mx-auto">
        {/* Fighter A — left side, orange */}
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[9px] text-orange-500 font-bold tracking-wider">
            {aName.slice(0, 7).toUpperCase()}
          </span>
          <PixelFighter action={aAction} mirrored={false} color="#f97316" />
        </div>

        {/* Impact effect center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className="text-xs font-bold text-orange-400 terminal-glow-strong tracking-widest transition-opacity duration-150"
            style={{ opacity: effect ? 1 : 0 }}
          >
            {effect === 'slam' ? '[ SLAM ]' : '[ HIT ]'}
          </span>
        </div>

        {/* Fighter B — right side, red, mirrored */}
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[9px] text-red-500 font-bold tracking-wider">
            {bName.slice(0, 7).toUpperCase()}
          </span>
          <PixelFighter action={bAction} mirrored={true} color="#ef4444" />
        </div>
      </div>

      {/* Floor */}
      <div className="mx-8 border-t border-zinc-700 mb-2" />
    </div>
  );
}

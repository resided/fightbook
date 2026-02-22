// FightBook - Full Terminal CLI
// Adapted from fightbook-live visual design, wired to FightBook backend

import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { runFight as runLocalFight } from '@/lib/fightEngine';
import type { Fighter as EngineFighter } from '@/lib/fightEngine';
import FightArena from '@/components/FightArena';

const API = '/api';

const WELCOME = [
  '',
  '  [FIGHTBOOK v1.1.17]',
  '  AI Combat Arena - Create fighters and watch them battle',
  '',
  '  QUICK START:',
  '  • Click [CREATE] at the top to make your first fighter',
  '  • Go to ROSTER to see all fighters',
  '  • Type: fight <name> vs <name>',
  '  • Check RANKS for the leaderboard',
  '',
  '  OR TYPE:',
  "  'register'  - Create a fighter via CLI",
  "  'help'      - List all commands",
  "  'about'     - How FightBook works",
  "  'faq'       - Common questions",
  '',
];

const ARCHETYPES: Record<string, Record<string, number>> = {
  striker: {
    striking: 88, punchSpeed: 85, kickPower: 80, headMovement: 78,
    footwork: 72, combinations: 80, wrestling: 30, takedownDefense: 65,
    clinchControl: 50, trips: 30, throws: 30, submissions: 20,
    submissionDefense: 50, groundAndPound: 50, guardPassing: 40,
    sweeps: 30, topControl: 40, bottomGame: 30, cardio: 78,
    chin: 75, recovery: 70, strength: 65, flexibility: 55,
  },
  grappler: {
    striking: 45, punchSpeed: 45, kickPower: 40, headMovement: 55,
    footwork: 55, combinations: 40, wrestling: 90, takedownDefense: 85,
    clinchControl: 78, trips: 72, throws: 68, submissions: 82,
    submissionDefense: 80, groundAndPound: 70, guardPassing: 75,
    sweeps: 65, topControl: 85, bottomGame: 70, cardio: 85,
    chin: 70, recovery: 75, strength: 80, flexibility: 75,
  },
  balanced: {
    striking: 72, punchSpeed: 70, kickPower: 65, headMovement: 68,
    footwork: 65, combinations: 68, wrestling: 70, takedownDefense: 72,
    clinchControl: 62, trips: 55, throws: 52, submissions: 58,
    submissionDefense: 65, groundAndPound: 62, guardPassing: 58,
    sweeps: 50, topControl: 65, bottomGame: 55, cardio: 78,
    chin: 72, recovery: 70, strength: 68, flexibility: 62,
  },
  pressure: {
    striking: 80, punchSpeed: 78, kickPower: 72, headMovement: 55,
    footwork: 68, combinations: 82, wrestling: 68, takedownDefense: 62,
    clinchControl: 75, trips: 60, throws: 55, submissions: 45,
    submissionDefense: 55, groundAndPound: 68, guardPassing: 55,
    sweeps: 45, topControl: 65, bottomGame: 45, cardio: 92,
    chin: 80, recovery: 80, strength: 72, flexibility: 55,
  },
  counter: {
    striking: 75, punchSpeed: 72, kickPower: 65, headMovement: 88,
    footwork: 85, combinations: 65, wrestling: 55, takedownDefense: 80,
    clinchControl: 55, trips: 45, throws: 45, submissions: 50,
    submissionDefense: 70, groundAndPound: 52, guardPassing: 52,
    sweeps: 55, topControl: 52, bottomGame: 60, cardio: 75,
    chin: 70, recovery: 72, strength: 60, flexibility: 70,
  },
};

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

const bar = (val: number): string => {
  const filled = Math.round(val / 5);
  return '█'.repeat(filled) + '░'.repeat(20 - filled);
};

interface Entry {
  type: 'input' | 'output' | 'system' | 'fight' | 'error' | 'loading';
  text: string;
}

interface Fighter {
  id: string;
  name: string;
  win_count: number;
  stats: Record<string, number>;
  metadata?: Record<string, any>;
  created_at?: string;
}

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  win_count: number;
  total_fights: number;
  losses: number;
}

export default function TerminalCLI({ initialCommand, onCommandConsumed }: { initialCommand?: string | null; onCommandConsumed?: () => void } = {}) {
  const [history, setHistory] = useState<Entry[]>(
    WELCOME.map(t => ({ type: 'system' as const, text: t }))
  );
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [processing, setProcessing] = useState(false);
  const [registerMode, setRegisterMode] = useState<null | { step: string; data: Record<string, any> }>(null);
  const [arenaState, setArenaState] = useState<{
    aName: string; bName: string; round: number; currentAction: string;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [history]);

  useEffect(() => {
    const handler = (e: Event) => {
      const cmd = (e as CustomEvent).detail?.cmd;
      if (cmd) setInput(cmd);
      inputRef.current?.focus();
    };
    window.addEventListener('fightCommand', handler);
    return () => window.removeEventListener('fightCommand', handler);
  }, []);

  useEffect(() => {
    if (initialCommand) {
      setInput(initialCommand);
      inputRef.current?.focus();
      onCommandConsumed?.();
    }
  }, [initialCommand]);

  const add = useCallback((entries: Entry[]) => {
    setHistory(prev => [...prev, ...entries]);
  }, []);

  const process = useCallback(async (cmd: string) => {
    const lower = cmd.trim().toLowerCase();
    const raw = cmd.trim();

    if (lower === 'help') {
      add([
        { type: 'fight', text: '  [COMMANDS]' },
        { type: 'output', text: '' },
        { type: 'system', text: '  NAVIGATION:' },
        { type: 'output', text: '  Use the top menu: CLI | ROSTER | RANKS | CREATE' },
        { type: 'output', text: '' },
        { type: 'system', text: '  CLI COMMANDS:' },
        { type: 'output', text: '  register       Create a new fighter (name → X handle → archetype)' },
        { type: 'output', text: '  fighters       List all fighters in the arena' },
        { type: 'output', text: '  fight a vs b   Run a fight between two fighters' },
        { type: 'output', text: '  fight a vs cpu [easy|medium|hard]  Fight a CPU opponent (practice)' },
        { type: 'output', text: '  random         Quick fight with random matchup' },
        { type: 'output', text: '  leaderboard    Show rankings by wins' },
        { type: 'output', text: '  stats <name>   View detailed fighter stats' },
        { type: 'output', text: '  history        Recent fight history' },
        { type: 'output', text: '  record <name>  Fighter\'s win/loss record' },
        { type: 'output', text: '' },
        { type: 'system', text: '  INFO:' },
        { type: 'output', text: '  about          What is FightBook and how it works' },
        { type: 'output', text: '  faq            Frequently asked questions' },
        { type: 'output', text: '  clear          Clear this terminal' },
        { type: 'output', text: '' },
        { type: 'output', text: '  Tip: Click [CREATE] at the top for the best experience.' },
      ]);
      return;
    }

    if (lower === 'about') {
      add([
        { type: 'fight', text: '  [ABOUT FIGHTBOOK]' },
        { type: 'output', text: '' },
        { type: 'output', text: '  FightBook is an AI-powered MMA combat simulator. Create fighters,' },
        { type: 'output', text: '  customize their stats, and watch them battle in realistic 3-round' },
        { type: 'output', text: '  fights with play-by-play commentary.' },
        { type: 'output', text: '' },
        { type: 'system', text: '  QUICK START:' },
        { type: 'output', text: '  1. Type "register" to create a fighter, or use [CREATE] in the nav' },
        { type: 'output', text: '  2. Go to ROSTER to see all fighters' },
        { type: 'output', text: '  3. Type "fight <name> vs <name>" to run a fight' },
        { type: 'output', text: '  4. Check RANKS to see the leaderboard' },
        { type: 'output', text: '' },
        { type: 'system', text: '  THE ENGINE:' },
        { type: 'output', text: '  • Position-based combat (standing, clinch, ground)' },
        { type: 'output', text: '  • 6 core stats: Striking, Grappling, Stamina, Power, Chin, Speed' },
        { type: 'output', text: '  • Real fight outcomes: KO, TKO, Submission, or Decision' },
        { type: 'output', text: '  • Fighter templates based on MMA legends' },
        { type: 'output', text: '' },
        { type: 'system', text: '  INSTALL CLI VERSION:' },
        { type: 'output', text: '  npm install -g fightbook' },
        { type: 'output', text: '' },
        { type: 'output', text: '  Type "faq" for frequently asked questions.' },
      ]);
      return;
    }

    if (lower === 'faq') {
      add([
        { type: 'fight', text: '  [FREQUENTLY ASKED QUESTIONS]' },
        { type: 'output', text: '' },
        { type: 'system', text: '  Q: How do I create a fighter?' },
        { type: 'output', text: '  A: Type "register" in the terminal for the CLI flow (name →' },
        { type: 'output', text: '     X handle → archetype → auto-assigned stats). Or use the' },
        { type: 'output', text: '     [CREATE] button in the nav for the visual creator.' },
        { type: 'output', text: '' },
        { type: 'system', text: '  Q: How do fights work?' },
        { type: 'output', text: '  A: Fights are simulated based on your fighter stats. Higher striking' },
        { type: 'output', text: '     = more/better punches. Higher wrestling = more takedowns. The AI' },
        { type: 'output', text: '     generates realistic play-by-play commentary for each exchange.' },
        { type: 'output', text: '' },
        { type: 'system', text: '  Q: What are the 6 stats?' },
        { type: 'output', text: '  • STRIKING: Punching technique and accuracy' },
        { type: 'output', text: '  • GRAPPLING: Wrestling, takedowns, ground control' },
        { type: 'output', text: '  • STAMINA: Cardio - affects late-round performance' },
        { type: 'output', text: '  • POWER: Knockout power and damage output' },
        { type: 'output', text: '  • CHIN: Ability to take punishment' },
        { type: 'output', text: '  • SPEED: Hand speed and footwork' },
        { type: 'output', text: '' },
        { type: 'system', text: '  Q: How do I win?' },
        { type: 'output', text: '  A: Win fights to climb the leaderboard. Outcomes are:' },
        { type: 'output', text: '     KO (knockout), TKO (ref stoppage), SUB (submission), or' },
        { type: 'output', text: '     DEC (judges decision after 3 rounds).' },
        { type: 'output', text: '' },
        { type: 'system', text: '  Q: What is the CLI version?' },
        { type: 'output', text: '  A: A command-line version you can install with npm. Good for' },
        { type: 'output', text: '     creating fighters locally and battling them.' },
        { type: 'output', text: '' },
        { type: 'system', text: '  Q: Is there a token?' },
        { type: 'output', text: '  A: Yes - $FIGHT on Base. Contract: 0xfC01...2a1b07' },
        { type: 'output', text: '' },
        { type: 'output', text: '  More questions? DM @0xreside on X.' },
      ]);
      return;
    }

    if (lower === 'clear') {
      setHistory([]);
      return;
    }

    if (lower === 'register') {
      setRegisterMode({ step: 'name', data: {} });
      add([
        { type: 'fight', text: '  ═══════════════════════════════════════════════════════════════' },
        { type: 'fight', text: '  REGISTER FIGHTER' },
        { type: 'fight', text: '  ═══════════════════════════════════════════════════════════════' },
        { type: 'output', text: '' },
        { type: 'output', text: '  Step 1/4: Enter fighter name:' },
        { type: 'system', text: '  (Escape to cancel)' },
      ]);
      return;
    }

    if (lower === 'fighters' || lower === 'roster') {
      setProcessing(true);
      try {
        const res = await fetch(`${API}/fighters`);
        const data: Fighter[] = await res.json();
        if (!data?.length) {
          add([{ type: 'output', text: '  No fighters registered. Type \'register\' to add one.' }]);
        } else {
          const lines: Entry[] = [
            { type: 'fight', text: '  ═══════════════════════════════════════════════════════════════' },
            { type: 'fight', text: '                         FIGHTER ROSTER' },
            { type: 'fight', text: '  ═══════════════════════════════════════════════════════════════' },
            { type: 'output', text: '' },
          ];
          data.forEach((f, i) => {
            const xHandle = (f.metadata?.xHandle as string) || '@unknown';
            const record = `${f.win_count || 0}W-${(f.metadata?.losses as number) || 0}L`;
            const archetype = Object.keys(ARCHETYPES).find(arch => 
              ARCHETYPES[arch].striking === (f.stats?.striking || 0)
            ) || 'custom';
            
            lines.push({ type: 'fight', text: `  ┌─── ${f.name.toUpperCase()} ${'─'.repeat(Math.max(0, 45 - f.name.length))}┐` });
            lines.push({ type: 'output', text: `  │  Creator: ${xHandle.padEnd(39)}│` });
            lines.push({ type: 'output', text: `  │  Record:  ${record.padEnd(39)}│` });
            lines.push({ type: 'output', text: `  │  Style:   ${archetype.padEnd(39)}│` });
            lines.push({ type: 'system', text: `  │  Type 'stats ${f.name}' for full profile │` });
            lines.push({ type: 'fight', text: `  └${'─'.repeat(48)}┘` });
            lines.push({ type: 'output', text: '' });
          });
          lines.push({ type: 'system', text: `  Total fighters: ${data.length}` });
          lines.push({ type: 'system', text: '  Type \'fight <name> vs <name>\' to match any two fighters' });
          add(lines);
        }
      } catch {
        add([{ type: 'error', text: '  Failed to fetch fighters.' }]);
      }
      setProcessing(false);
      return;
    }

    if (lower === 'leaderboard') {
      setProcessing(true);
      try {
        const res = await fetch(`${API}/fighters`);
        const fighters: Fighter[] = await res.json();
        if (!fighters?.length) {
          add([{ type: 'output', text: '  No fighters ranked yet.' }]);
        } else {
          // Sort by wins
          const sorted = [...fighters].sort((a, b) => (b.win_count || 0) - (a.win_count || 0));
          
          const lines: Entry[] = [
            { type: 'fight', text: '  ═══════════════════════════════════════════════════════════════' },
            { type: 'fight', text: '                           LEADERBOARD                           ' },
            { type: 'fight', text: '  ═══════════════════════════════════════════════════════════════' },
            { type: 'output', text: '' },
          ];
          sorted.forEach((f, i) => {
            const xHandle = (f.metadata?.xHandle as string) || '@unknown';
            const medal = i === 0 ? '#1' : i === 1 ? '#2' : i === 2 ? '#3' : `${String(i + 1).padStart(2)}.`;
            const wins = f.win_count || 0;
            const losses = (f.metadata?.losses as number) || 0;
            const total = wins + losses;
            const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
            
            lines.push({ 
              type: i < 3 ? 'fight' : 'output', 
              text: `   ${medal} ${f.name}` 
            });
            lines.push({ 
              type: 'system', 
              text: `      Creator: ${xHandle} | ${wins}W-${losses}L (${winRate}%)` 
            });
          });
          lines.push({ type: 'output', text: '' });
          lines.push({ type: 'fight', text: '  ═══════════════════════════════════════════════════════════════' });
          add(lines);
        }
      } catch {
        add([{ type: 'error', text: '  Failed to fetch leaderboard.' }]);
      }
      setProcessing(false);
      return;
    }

    if (lower === 'history') {
      setProcessing(true);
      try {
        const res = await fetch(`${API}/fights?limit=15`);
        const data = await res.json();
        if (!data?.length) {
          add([{ type: 'output', text: '  No fights recorded yet.' }]);
        } else {
          // Fetch fighter names from IDs
          const ids = new Set<string>();
          data.forEach((f: any) => {
            if (f.agent1_id) ids.add(f.agent1_id);
            if (f.agent2_id) ids.add(f.agent2_id);
          });
          let nameMap: Record<string, string> = {};
          if (supabase && ids.size > 0) {
            const { data: fighters } = await supabase.from('fighters').select('id, name').in('id', [...ids]);
            fighters?.forEach((f: any) => { nameMap[f.id] = f.name; });
          }

          const lines: Entry[] = [
            { type: 'fight', text: '  ═══════════════════════════════════════════════' },
            { type: 'fight', text: '                  FIGHT HISTORY                  ' },
            { type: 'fight', text: '  ═══════════════════════════════════════════════' },
          ];
          data.forEach((f: any) => {
            const a = nameMap[f.agent1_id] || 'Unknown';
            const b = nameMap[f.agent2_id] || 'Unknown';
            const winner = f.winner_id ? (nameMap[f.winner_id] || 'Unknown') : 'DRAW';
            const date = new Date(f.created_at).toLocaleDateString();
            lines.push({ type: 'output', text: `  ${a} vs ${b}` });
            lines.push({ type: 'fight', text: `  Winner: ${winner} via ${f.method} R${f.round}  —  ${date}` });
            lines.push({ type: 'system', text: '  ─────────────────────────────────────────────' });
          });
          add(lines);
        }
      } catch {
        add([{ type: 'error', text: '  Failed to fetch fight history.' }]);
      }
      setProcessing(false);
      return;
    }

    if (lower.startsWith('stats ')) {
      const name = raw.slice(6).trim();
      setProcessing(true);
      try {
        const res = await fetch(`${API}/fighters`);
        const all: Fighter[] = await res.json();
        const f = all.find(x => x.name.toLowerCase().includes(name.toLowerCase()));
        if (!f) {
          add([{ type: 'error', text: `  Fighter "${name}" not found. Check spelling or type 'fighters'.` }]);
        } else {
          const s = f.stats || {};
          const wins = f.win_count || 0;
          const total = f.metadata?.totalFights || 0;
          const losses = f.metadata?.losses || 0;
          const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
          add([
            { type: 'fight', text: `  ╔═══ ${f.name.toUpperCase()} ${'═'.repeat(Math.max(0, 38 - f.name.length))}╗` },
            { type: 'output', text: `  Record:   ${wins}W - ${losses}L  (${winRate}% win rate)` },
            { type: 'output', text: `  Fights:   ${total}` },
            { type: 'system', text: `  ─── STRIKING ─────────────────────────────────` },
            { type: 'output', text: `  Striking:  ${bar(s.striking || 50)} ${s.striking || 50}` },
            { type: 'output', text: `  Pch Speed: ${bar(s.punchSpeed || 50)} ${s.punchSpeed || 50}` },
            { type: 'output', text: `  Kick Pwr:  ${bar(s.kickPower || 50)} ${s.kickPower || 50}` },
            { type: 'output', text: `  Head Mov:  ${bar(s.headMovement || 50)} ${s.headMovement || 50}` },
            { type: 'system', text: `  ─── GRAPPLING ────────────────────────────────` },
            { type: 'output', text: `  Wrestling: ${bar(s.wrestling || 50)} ${s.wrestling || 50}` },
            { type: 'output', text: `  TDD:       ${bar(s.takedownDefense || 50)} ${s.takedownDefense || 50}` },
            { type: 'output', text: `  Subs:      ${bar(s.submissions || 50)} ${s.submissions || 50}` },
            { type: 'system', text: `  ─── PHYSICAL ─────────────────────────────────` },
            { type: 'output', text: `  Cardio:    ${bar(s.cardio || 50)} ${s.cardio || 50}` },
            { type: 'output', text: `  Chin:      ${bar(s.chin || 50)} ${s.chin || 50}` },
            { type: 'output', text: `  Recovery:  ${bar(s.recovery || 50)} ${s.recovery || 50}` },
            { type: 'fight', text: `  ╚${'═'.repeat(46)}╝` },
          ]);
        }
      } catch {
        add([{ type: 'error', text: '  Failed to fetch fighter stats.' }]);
      }
      setProcessing(false);
      return;
    }

    if (lower.startsWith('record ')) {
      const name = raw.slice(7).trim();
      setProcessing(true);
      try {
        const res = await fetch(`${API}/fighters`);
        const all: Fighter[] = await res.json();
        const fighter = all.find(x => x.name.toLowerCase().includes(name.toLowerCase()));
        if (!fighter) {
          add([{ type: 'error', text: `  Fighter "${name}" not found.` }]);
          setProcessing(false);
          return;
        }
        if (!supabase) {
          add([{ type: 'error', text: '  Database not connected.' }]);
          setProcessing(false);
          return;
        }
        const { data: fights } = await supabase
          .from('fights')
          .select('agent1_id, agent2_id, winner_id, method, round, created_at')
          .or(`agent1_id.eq.${fighter.id},agent2_id.eq.${fighter.id}`)
          .order('created_at', { ascending: false })
          .limit(20);

        if (!fights?.length) {
          add([{ type: 'output', text: `  ${fighter.name} has no fights yet.` }]);
        } else {
          // Get opponent names
          const opponentIds = fights.map((f: any) =>
            f.agent1_id === fighter.id ? f.agent2_id : f.agent1_id
          ).filter(Boolean);
          const { data: opponents } = await supabase.from('fighters').select('id, name').in('id', opponentIds);
          const nameMap: Record<string, string> = {};
          opponents?.forEach((o: any) => { nameMap[o.id] = o.name; });

          const lines: Entry[] = [
            { type: 'fight', text: `  ═══ ${fighter.name.toUpperCase()} — FIGHT RECORD ═══` },
          ];
          fights.forEach((f: any) => {
            const oppId = f.agent1_id === fighter.id ? f.agent2_id : f.agent1_id;
            const opponent = nameMap[oppId] || 'Unknown';
            const won = f.winner_id === fighter.id;
            const isDraw = !f.winner_id;
            const result = isDraw ? 'D' : won ? 'W' : 'L';
            lines.push({
              type: won ? 'fight' : isDraw ? 'system' : 'error',
              text: `  [${result}] vs ${opponent} — ${f.method} R${f.round}`,
            });
          });
          add(lines);
        }
      } catch {
        add([{ type: 'error', text: '  Failed to fetch fight record.' }]);
      }
      setProcessing(false);
      return;
    }

    if (lower.startsWith('fight ') || lower === 'random') {
      // CPU fight branch - check if "vs cpu" pattern
      const cpuMatch = lower.match(/^fight\s+(.+?)\s+vs\s+cpu(\s+(easy|medium|hard))?$/);
      if (cpuMatch) {
        const fighterName = cpuMatch[1].trim();
        const difficulty = (cpuMatch[3] || 'medium') as 'easy' | 'medium' | 'hard';

        const diffMultiplier = { easy: 0.65, medium: 0.85, hard: 1.05 }[difficulty];

        setProcessing(true);
        add([{ type: 'loading', text: `  Setting up CPU opponent (${difficulty})...` }]);

        try {
          const res = await fetch(`${API}/fighters`);
          const all: Fighter[] = await res.json();
          const fighter = all.find((x: Fighter) => x.name.toLowerCase().includes(fighterName.toLowerCase()));

          if (!fighter) {
            add([{ type: 'error', text: `  Fighter "${fighterName}" not found. Type 'fighters' to see roster.` }]);
            setProcessing(false);
            return;
          }

          const raw = (fighter as any).stats || {};
          const getS = (key: string, fallback = 50) => Math.round(((raw[key] || fallback)) * diffMultiplier);

          const f1: EngineFighter = {
            id: fighter.id,
            name: fighter.name,
            stats: 'grappling' in raw ? {
              striking: raw.striking || 50, punchSpeed: raw.speed || 50, punchPower: raw.power || 50,
              wrestling: raw.grappling || 50, submissions: Math.round((raw.grappling || 50) * 0.8),
              cardio: raw.stamina || 50, chin: raw.chin || 50,
              headMovement: Math.round((raw.speed || 50) * 0.8), takedownDefense: Math.round((raw.grappling || 50) * 0.7),
            } : {
              striking: raw.striking || 50, punchSpeed: raw.punchSpeed || 50, punchPower: raw.strength || 50,
              wrestling: raw.wrestling || 50, submissions: raw.submissions || 50,
              cardio: raw.cardio || 50, chin: raw.chin || 50,
              headMovement: raw.headMovement || 50, takedownDefense: raw.takedownDefense || 50,
            },
          };

          const CPU_NAMES = ['Iron Fist', 'The Crusher', 'Phantom Strike', 'Steel Storm', 'The Dominator'];
          const cpuName = CPU_NAMES[Math.floor(Math.random() * CPU_NAMES.length)];
          const f2: EngineFighter = {
            id: 'cpu',
            name: `${cpuName} [CPU]`,
            stats: {
              striking: getS('striking'), punchSpeed: getS('punchSpeed', 50),
              punchPower: getS('strength', 50), wrestling: getS('wrestling'),
              submissions: getS('submissions'), cardio: getS('cardio'),
              chin: getS('chin'), headMovement: getS('headMovement'),
              takedownDefense: getS('takedownDefense'),
            },
          };

          add([
            { type: 'fight', text: '  ═══════════════════════════════════════════════════════════════' },
            { type: 'fight', text: `  ${f1.name.toUpperCase()} vs ${f2.name.toUpperCase()} (PRACTICE)` },
            { type: 'fight', text: '  ═══════════════════════════════════════════════════════════════' },
            { type: 'output', text: '' },
          ]);

          const result = runLocalFight(f1, f2);

          // Activate arena
          setArenaState({ aName: f1.name, bName: f2.name, round: 1, currentAction: '' });

          for (const line of result.log) {
            const roundMatch = line.match(/^\[Round (\d+)\]/);
            const isRound = !!roundMatch;
            const isEnd = line.startsWith('End of Round') || line.startsWith('[Decision]');
            const isCritical = line.startsWith('[CRITICAL]') || line.includes('referee stops');

            if (isRound) {
              const r = parseInt(roundMatch![1]);
              setArenaState(prev => prev ? { ...prev, round: r, currentAction: '' } : prev);
              await delay(600);
              add([{ type: 'system', text: `  ${line}` }]);
              await delay(200);
            } else if (isCritical) {
              setArenaState(prev => prev ? { ...prev, currentAction: line } : prev);
              add([{ type: 'fight', text: `  ${line}` }]);
              await delay(500);
            } else if (isEnd) {
              setArenaState(prev => prev ? { ...prev, currentAction: '' } : prev);
              add([{ type: 'system', text: `  ${line}` }]);
              await delay(400);
            } else {
              setArenaState(prev => prev ? { ...prev, currentAction: line } : prev);
              add([{ type: 'output', text: `  ${line}` }]);
              await delay(line.trim() ? 160 : 60);
            }
          }

          await delay(600);
          setArenaState(prev => prev
            ? { ...prev, currentAction: result.winner !== 'DRAW' ? `${result.winner} wins victory` : '' }
            : prev);
          add([
            { type: 'output', text: '' },
            { type: 'fight', text: '  ═══════════════════════════════════════════════════════════════' },
            result.winner === 'DRAW'
              ? { type: 'fight', text: '  DRAW — PRACTICE FIGHT (no ranking change)' }
              : { type: 'fight', text: `  WINNER: ${result.winner} by ${result.method} R${result.round} — PRACTICE FIGHT` },
            { type: 'fight', text: '  ═══════════════════════════════════════════════════════════════' },
            { type: 'system', text: '  CPU fights are practice only — rankings not affected.' },
          ]);
          await delay(2000);
          setArenaState(null);
        } catch (e: any) {
          setArenaState(null);
          add([{ type: 'error', text: `  Fight error: ${e.message}` }]);
        }
        setProcessing(false);
        return;
      }

      let nameA: string, nameB: string;

      setProcessing(true);
      try {
        const res = await fetch(`${API}/fighters`);
        const all: Fighter[] = await res.json();

        if (lower === 'random') {
          if (all.length < 2) {
            add([{ type: 'error', text: '  Need at least 2 fighters. Type \'register\' to add more.' }]);
            setProcessing(false);
            return;
          }
          const shuffled = [...all].sort(() => Math.random() - 0.5);
          nameA = shuffled[0].name;
          nameB = shuffled[1].name;
        } else {
          const parts = raw.slice(6).trim().split(/\s+vs\s+|\s+v\s+|\s*,\s*/i);
          if (parts.length !== 2) {
            add([{ type: 'error', text: '  Usage: fight <name> vs <name>  OR  fight <name>, <name>' }]);
            setProcessing(false);
            return;
          }
          nameA = parts[0].trim();
          nameB = parts[1].trim();
        }

        const fA = all.find(x => x.name.toLowerCase().includes(nameA.toLowerCase()));
        const fB = all.find(x => x.name.toLowerCase().includes(nameB.toLowerCase()));

        if (!fA || !fB) {
          add([{ type: 'error', text: `  Could not find one or both fighters. Type 'fighters' to see roster.` }]);
          setProcessing(false);
          return;
        }
        if (fA.id === fB.id) {
          add([{ type: 'error', text: "  A fighter can't fight themselves!" }]);
          setProcessing(false);
          return;
        }

        add([
          { type: 'system', text: '' },
          { type: 'system', text: '  [MAIN EVENT]' },
          { type: 'fight', text: `  ${fA.name.toUpperCase()} VS ${fB.name.toUpperCase()}` },
          { type: 'system', text: '  [FIGHT STARTS]' },
          { type: 'output', text: '' },
        ]);

        // Activate arena before API call
        setArenaState({ aName: fA.name, bName: fB.name, round: 1, currentAction: '' });

        const fightRes = await fetch(`${API}/fights`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fighter1_id: fA.id, fighter2_id: fB.id }),
        });
        const result = await fightRes.json();

        if (!fightRes.ok) {
          setArenaState(null);
          add([{ type: 'error', text: `  Fight failed: ${result.error || 'Unknown error'}` }]);
          setProcessing(false);
          return;
        }

        // Play-by-play reveal with correct engine log format detection
        if (result.fight_log?.length) {
          for (const l of result.fight_log) {
            const roundMatch = (l as string).match(/^\[Round (\d+)\]/);
            const isRound = !!roundMatch;
            const isEnd = l.startsWith('End of Round') || l.startsWith('[Decision]');
            const isCritical = l.startsWith('[CRITICAL]') || l.includes('referee stops');

            if (isRound) {
              const r = parseInt(roundMatch![1]);
              setArenaState(prev => prev ? { ...prev, round: r, currentAction: '' } : prev);
              await delay(600);
              add([{ type: 'system', text: `  ${l}` }]);
              await delay(200);
            } else if (isCritical) {
              setArenaState(prev => prev ? { ...prev, currentAction: l } : prev);
              add([{ type: 'fight', text: `  ${l}` }]);
              await delay(500);
            } else if (isEnd) {
              setArenaState(prev => prev ? { ...prev, currentAction: '' } : prev);
              add([{ type: 'system', text: `  ${l}` }]);
              await delay(400);
            } else {
              setArenaState(prev => prev ? { ...prev, currentAction: l } : prev);
              add([{ type: 'output', text: `  ${l}` }]);
              await delay((l as string).trim() ? 160 : 60);
            }
          }
        }

        // Final result — show victory pose then fade arena
        await delay(600);
        const winner = result.winner || 'DRAW';
        if (winner !== 'DRAW') {
          setArenaState(prev => prev ? { ...prev, currentAction: `${winner} wins victory` } : prev);
        }
        add([
          { type: 'output', text: '' },
          { type: 'system', text: '  [RESULT]' },
          { type: 'fight', text: `  WINNER: ${winner}` },
          { type: 'fight', text: `  METHOD: ${result.method} R${result.round}` },
        ]);
        await delay(2000);
        setArenaState(null);
      } catch (e: any) {
        setArenaState(null);
        add([{ type: 'error', text: `  Fight error: ${e.message}` }]);
      }
      setProcessing(false);
      return;
    }

    add([{ type: 'error', text: `  Command not recognized: '${cmd}'. Type 'help'.` }]);
  }, [add]);

  const handleRegisterStep = useCallback(async (value: string) => {
    if (!registerMode) return;
    const { step, data } = registerMode;

    if (step === 'name') {
      if (value.length < 2 || value.length > 30) {
        add([{ type: 'error', text: '  Name must be 2-30 characters.' }]);
        return;
      }
      setRegisterMode({ step: 'xhandle', data: { ...data, name: value } });
      add([
        { type: 'output', text: `  Name: ${value}` },
        { type: 'output', text: '' },
        { type: 'output', text: '  Step 2/4: Enter your X (Twitter) handle:' },
        { type: 'output', text: '  (e.g., @elonmusk or elonmusk)' },
        { type: 'system', text: '  This links the fighter to you for the leaderboard.' },
      ]);
      return;
    }

    if (step === 'xhandle') {
      const xHandle = value.startsWith('@') ? value : `@${value}`;
      if (value.length < 2 || value.length > 20) {
        add([{ type: 'error', text: '  X handle must be 2-20 characters.' }]);
        return;
      }
      setRegisterMode({ step: 'wallet', data: { ...data, xHandle } });
      add([
        { type: 'output', text: `  X Handle: ${xHandle}` },
        { type: 'output', text: '' },
        { type: 'output', text: '  Step 3/4: Base wallet address for $FIGHT rewards:' },
        { type: 'system', text: '  (Press Enter to skip)' },
      ]);
      return;
    }

    if (step === 'wallet') {
      const walletAddress = value.trim();
      // Basic validation: must be 0x... or empty (skip)
      if (walletAddress && !/^0x[0-9a-fA-F]{40}$/.test(walletAddress)) {
        add([{ type: 'error', text: '  Invalid address. Must be 0x... (42 chars), or press Enter to skip.' }]);
        return;
      }
      setRegisterMode({ step: 'archetype', data: { ...data, walletAddress: walletAddress || undefined } });
      add([
        { type: 'output', text: walletAddress ? `  Wallet: ${walletAddress}` : '  Wallet: skipped' },
        { type: 'output', text: '' },
        { type: 'output', text: '  Step 4/4: Choose archetype:' },
        { type: 'output', text: '  [striker] [grappler] [balanced] [pressure] [counter]' },
        { type: 'system', text: '  Stats will be auto-assigned based on your choice.' },
      ]);
      return;
    }

    if (step === 'archetype') {
      const arch = value.toLowerCase();
      if (!ARCHETYPES[arch]) {
        add([{ type: 'error', text: `  Unknown archetype. Choose: striker, grappler, balanced, pressure, counter` }]);
        return;
      }

      const stats = ARCHETYPES[arch];
      setRegisterMode(null);
      add([
        { type: 'output', text: `  Archetype: ${arch}` },
        { type: 'system', text: '  Auto-assigned stats:' },
        { type: 'output', text: `    Striking: ${stats.striking} | Wrestling: ${stats.wrestling} | Cardio: ${stats.cardio}` },
        { type: 'output', text: `    Chin: ${stats.chin} | Recovery: ${stats.recovery} | Strength: ${stats.strength}` },
        { type: 'loading', text: '  Registering fighter...' },
      ]);

      try {
        const res = await fetch(`${API}/fighters`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.name,
            stats: { ...stats, name: data.name },
            metadata: {
              xHandle: data.xHandle,
              walletAddress: data.walletAddress || undefined,
              totalFights: 0,
              losses: 0,
            },
          }),
        });
        const result = await res.json();

        if (!res.ok) {
          add([{ type: 'error', text: `  Registration failed: ${result.error}${result.details ? ' — ' + result.details.join(', ') : ''}` }]);
        } else {
          add([
            { type: 'fight', text: '' },
            { type: 'fight', text: `  >> ${data.name} has entered the arena!` },
            { type: 'output', text: `  Archetype: ${arch}` },
            { type: 'output', text: `  X Handle: ${data.xHandle}` },
            ...(data.walletAddress ? [{ type: 'output' as const, text: `  Wallet: ${data.walletAddress}` }] : []),
            { type: 'output', text: `  ID: ${result.id}` },
            { type: 'output', text: '' },
            { type: 'system', text: '  Stats auto-assigned based on your archetype.' },
            { type: 'system', text: '  Type \'stats ' + data.name.toLowerCase() + '\' to see full breakdown.' },
            { type: 'output', text: '' },
            { type: 'output', text: `  Type 'fight ${data.name.toLowerCase()} vs <opponent>' to battle!` },
          ]);
        }
      } catch (e: any) {
        add([{ type: 'error', text: `  Registration error: ${e.message}` }]);
      }
    }
  }, [registerMode, add]);

  const handleSubmit = useCallback(() => {
    if (!input.trim() || processing) return;
    add([{ type: 'input', text: `❯ ${input}` }]);
    setCmdHistory(prev => [input, ...prev]);
    setHistoryIdx(-1);
    if (registerMode) {
      handleRegisterStep(input.trim());
    } else {
      process(input);
    }
    setInput('');
  }, [input, processing, registerMode, handleRegisterStep, process, add]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIdx < cmdHistory.length - 1) {
        const idx = historyIdx + 1;
        setHistoryIdx(idx);
        setInput(cmdHistory[idx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx > 0) {
        const idx = historyIdx - 1;
        setHistoryIdx(idx);
        setInput(cmdHistory[idx]);
      } else {
        setHistoryIdx(-1);
        setInput('');
      }
    } else if (e.key === 'Escape' && registerMode) {
      setRegisterMode(null);
      add([{ type: 'system', text: '  Registration cancelled.' }]);
    }
  };

  return (
    <div
      className="h-full bg-black flex flex-col scanline-overlay crt-flicker"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Pixel arena — shown during fights, sticky above scroll */}
      {arenaState && (
        <FightArena
          aName={arenaState.aName}
          bName={arenaState.bName}
          currentAction={arenaState.currentAction}
          round={arenaState.round}
          active={true}
        />
      )}

      {/* Terminal body -- no header since App provides nav */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 pb-0 font-mono">
        {history.map((entry, i) => (
          <div
            key={i}
            className={`text-sm leading-relaxed whitespace-pre-wrap break-all ${
              entry.type === 'input'   ? 'text-orange-500 terminal-glow' :
              entry.type === 'fight'  ? 'text-orange-400 terminal-glow-strong' :
              entry.type === 'error'  ? 'status-error' :
              entry.type === 'loading'? 'text-zinc-500 animate-pulse' :
              entry.type === 'system' ? 'text-zinc-300' :
              'text-zinc-500'
            }`}
          >
            {entry.text}
          </div>
        ))}

        {/* Input line */}
        <div className="flex items-center gap-2 py-2 text-sm">
          <span className="text-orange-500 terminal-glow">
            {registerMode ? '»' : '❯'}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-orange-500 caret-orange-500 font-mono"
            autoFocus
            spellCheck={false}
            autoComplete="off"
            disabled={processing}
            placeholder={processing ? 'Processing...' : registerMode ? 'Type your answer...' : 'Type a command...'}
          />
        </div>
      </div>

    </div>
  );
}

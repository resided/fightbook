// FightBook - Full Terminal CLI
// Adapted from fightbook-live visual design, wired to FightBook backend

import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const API = '/api';

const WELCOME = [
  '',
  '  ███████╗██╗ ██████╗ ██╗  ██╗████████╗██████╗  ██████╗  ██████╗ ██╗  ██╗',
  '  ██╔════╝██║██╔════╝ ██║  ██║╚══██╔══╝██╔══██╗██╔═══██╗██╔═══██╗██║ ██╔╝',
  '  █████╗  ██║██║  ███╗███████║   ██║   ██████╔╝██║   ██║██║   ██║█████╔╝ ',
  '  ██╔══╝  ██║██║   ██║██╔══██║   ██║   ██╔══██╗██║   ██║██║   ██║██╔═██╗ ',
  '  ██║     ██║╚██████╔╝██║  ██║   ██║   ██████╔╝╚██████╔╝╚██████╔╝██║  ██╗',
  '  ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═════╝  ╚═════╝  ╚═════╝ ╚═╝  ╚═╝',
  '',
  '  ═══════════════════════════════════════════════════════════════════',
  '  AI Combat Arena v1.1.17  |  skills.md Powered  |  1200pt Budget',
  '  ═══════════════════════════════════════════════════════════════════',
  '',
  '  $ fightbook --help',
  '',
  '  FightBook — AI Combat Arena',
  '  Configure a fighter with skills.md. Watch it battle.',
  '',
  '  1. curl SKILL.md   → download your fighter template',
  '  2. edit the file   → set striking, wrestling, cardio',
  "  3. fight a.md b.md → 3-minute rounds, live action",
  '',
  '  ═══════════════════════════════════════════════════════════════════',
  '  QUICK START',
  '  ═══════════════════════════════════════════════════════════════════',
  '',
  '  CLI Install:',
  '  $ npm install -g fightbook',
  '  $ fightbook init my-fighter && fightbook fight a.md b.md',
  '',
  '  Web CLI:',
  '  Type \'help\' for available commands',
  '  Type \'register\' to create a fighter',
  '  Type \'fighters\' to see the roster',
  '',
  '  $FIGHT on Base: 0xfC01A7760CfE6a3f4D2635f0BdCaB992DB2a1b07',
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

export default function TerminalCLI() {
  const [history, setHistory] = useState<Entry[]>(
    WELCOME.map(t => ({ type: 'system' as const, text: t }))
  );
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [processing, setProcessing] = useState(false);
  const [registerMode, setRegisterMode] = useState<null | { step: string; data: Record<string, any> }>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [history]);

  const add = useCallback((entries: Entry[]) => {
    setHistory(prev => [...prev, ...entries]);
  }, []);

  const process = useCallback(async (cmd: string) => {
    const lower = cmd.trim().toLowerCase();
    const raw = cmd.trim();

    if (lower === 'help') {
      add([
        { type: 'system', text: '╔════════════════════════════════════════════════════════╗' },
        { type: 'system', text: '║                 FIGHTBOOK COMMANDS                     ║' },
        { type: 'system', text: '╠════════════════════════════════════════════════════════╣' },
        { type: 'system', text: '║  register           - Register a new fighter           ║' },
        { type: 'system', text: '║  fighters           - List all registered fighters     ║' },
        { type: 'system', text: '║  stats <name>       - View fighter stats               ║' },
        { type: 'system', text: '║  fight <a> vs <b>   - Run a fight simulation           ║' },
        { type: 'system', text: '║  random             - Random matchup                   ║' },
        { type: 'system', text: '║  leaderboard        - Rankings by wins                 ║' },
        { type: 'system', text: '║  history            - Recent fight history             ║' },
        { type: 'system', text: '║  record <name>      - Fighter\'s fight record           ║' },
        { type: 'system', text: '║  clear              - Clear terminal                   ║' },
        { type: 'system', text: '║  about              - About FightBook                  ║' },
        { type: 'system', text: '╚════════════════════════════════════════════════════════╝' },
      ]);
      return;
    }

    if (lower === 'about') {
      add([
        { type: 'fight', text: '  FightBook v1.1.17 — AI Combat Arena' },
        { type: 'output', text: '  Register fighters via skills.md or the API.' },
        { type: 'output', text: '  Fight engine: 3 rounds, 40+ MMA techniques, position-based combat.' },
        { type: 'output', text: '' },
        { type: 'system', text: '  BUDGET SYSTEM:' },
        { type: 'output', text: '  1200 points distributed across 23 physical stats. Max 95 per stat.' },
        { type: 'output', text: '  Mental stats (fight_iq, heart, aggression) are free.' },
        { type: 'output', text: '' },
        { type: 'system', text: '  API:' },
        { type: 'output', text: '  POST /api/fighters   — Register a fighter' },
        { type: 'output', text: '  POST /api/fights     — Run a fight' },
        { type: 'output', text: '  GET  /api/leaderboard' },
        { type: 'output', text: '' },
        { type: 'system', text: '  CLI:' },
        { type: 'output', text: '  npm install -g fightbook' },
        { type: 'output', text: '  fightbook init my-fighter && fightbook fight a.md b.md' },
        { type: 'output', text: '' },
        { type: 'output', text: '  $FIGHT on Base: 0xfC01A7760CfE6a3f4D2635f0BdCaB992DB2a1b07' },
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
        { type: 'system', text: '  ═══ REGISTER FIGHTER ═══' },
        { type: 'output', text: '  Archetypes: striker, grappler, balanced, pressure, counter' },
        { type: 'output', text: '  Stats auto-distributed within 1200pt budget. Max 95 per stat.' },
        { type: 'output', text: '' },
        { type: 'output', text: '  Enter fighter name:' },
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
            { type: 'system', text: '  ┌──────────────────────┬──────┬──────────┐' },
            { type: 'system', text: '  │ FIGHTER              │ WINS │ FIGHTS   │' },
            { type: 'system', text: '  ├──────────────────────┼──────┼──────────┤' },
          ];
          data.forEach(f => {
            const name = f.name.slice(0, 20).padEnd(20);
            const wins = String(f.win_count || 0).padStart(4);
            const total = String((f.metadata?.totalFights) || 0).padStart(8);
            lines.push({ type: 'output', text: `  │ ${name} │ ${wins} │ ${total} │` });
          });
          lines.push({ type: 'system', text: '  └──────────────────────┴──────┴──────────┘' });
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
        const res = await fetch(`${API}/leaderboard`);
        const data: LeaderboardEntry[] = await res.json();
        if (!data?.length) {
          add([{ type: 'output', text: '  No fighters ranked yet.' }]);
        } else {
          const lines: Entry[] = [
            { type: 'fight', text: '  ═══════════════════════════════════════════════' },
            { type: 'fight', text: '                 🏆 LEADERBOARD 🏆               ' },
            { type: 'fight', text: '  ═══════════════════════════════════════════════' },
            { type: 'system', text: '   #   │ FIGHTER              │ WINS │ W-L     ' },
            { type: 'system', text: '  ─────┼──────────────────────┼──────┼─────────' },
          ];
          data.forEach((f, i) => {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${String(i + 1).padStart(3)} `;
            const name = f.name.slice(0, 20).padEnd(20);
            const wins = String(f.win_count).padStart(4);
            const record = `${f.win_count}-${f.losses}`.padStart(7);
            lines.push({
              type: i < 3 ? 'fight' : 'output',
              text: `   ${medal} │ ${name} │ ${wins} │ ${record} `,
            });
          });
          lines.push({ type: 'fight', text: '  ═══════════════════════════════════════════════' });
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
          { type: 'fight', text: '' },
          { type: 'fight', text: '  ═══════════════════════════════════════════════' },
          { type: 'fight', text: `  ⚔  ${fA.name}  vs  ${fB.name}  ⚔` },
          { type: 'fight', text: '  ═══════════════════════════════════════════════' },
          { type: 'loading', text: '  🤖 Simulating fight... this takes ~15s...' },
        ]);

        const fightRes = await fetch(`${API}/fights`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fighter1_id: fA.id, fighter2_id: fB.id }),
        });
        const result = await fightRes.json();

        if (!fightRes.ok) {
          add([{ type: 'error', text: `  Fight failed: ${result.error || 'Unknown error'}` }]);
          setProcessing(false);
          return;
        }

        const lines: Entry[] = [{ type: 'system', text: '' }];

        // Show fight log (sample — first 12 lines)
        if (result.fight_log?.length) {
          lines.push({ type: 'system', text: '  ─── FIGHT LOG ──────────────────────────────' });
          const sample = result.fight_log.slice(0, 12);
          sample.forEach((l: string) => {
            const isHeavy = /CRUSHING|BRUTAL|DEVASTATING|MASSIVE/.test(l);
            lines.push({ type: isHeavy ? 'fight' : 'output', text: `  ${l}` });
          });
          if (result.fight_log.length > 12) {
            lines.push({ type: 'system', text: `  ... ${result.fight_log.length - 12} more actions` });
          }
        }

        // Result
        lines.push({ type: 'fight', text: '' });
        lines.push({ type: 'fight', text: '  ═══════════════════════════════════════════════' });
        if (!result.winner) {
          lines.push({ type: 'fight', text: '  📊 RESULT: DRAW' });
        } else {
          lines.push({ type: 'fight', text: `  🏆 WINNER: ${result.winner}` });
          lines.push({ type: 'fight', text: `  💥 Method: ${result.method} (Round ${result.round})` });
        }
        lines.push({ type: 'fight', text: '  ═══════════════════════════════════════════════' });

        add(lines);
      } catch (e: any) {
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
      setRegisterMode({ step: 'archetype', data: { ...data, name: value } });
      add([
        { type: 'output', text: `  Name: ${value}` },
        { type: 'output', text: '  Choose archetype:' },
        { type: 'output', text: '  [striker] [grappler] [balanced] [pressure] [counter]' },
      ]);
      return;
    }

    if (step === 'archetype') {
      const arch = value.toLowerCase();
      if (!ARCHETYPES[arch]) {
        add([{ type: 'error', text: `  Unknown archetype. Choose: striker, grappler, balanced, pressure, counter` }]);
        return;
      }

      setRegisterMode(null);
      add([
        { type: 'output', text: `  Archetype: ${arch}` },
        { type: 'loading', text: '  Registering fighter...' },
      ]);

      try {
        const res = await fetch(`${API}/fighters`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.name,
            stats: { ...ARCHETYPES[arch], name: data.name },
          }),
        });
        const result = await res.json();

        if (!res.ok) {
          add([{ type: 'error', text: `  Registration failed: ${result.error}${result.details ? ' — ' + result.details.join(', ') : ''}` }]);
        } else {
          add([
            { type: 'fight', text: '' },
            { type: 'fight', text: `  ✅ ${data.name} has entered the arena!` },
            { type: 'output', text: `  Archetype: ${arch}` },
            { type: 'output', text: `  ID: ${result.id}` },
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
      className="flex-1 bg-black flex flex-col scanline-overlay crt-flicker min-h-0"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 text-sm">❯_</span>
          <span className="text-sm text-orange-500 font-mono terminal-glow">fightbook</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="status-online">●</span>
            <span className="text-zinc-500">Online</span>
          </div>
          <span className="text-zinc-600">v1.1.17</span>
        </div>
      </div>

      {/* Terminal body */}
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

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-1.5 border-t border-zinc-800 bg-zinc-900 text-xs text-zinc-600 shrink-0">
        <span>FightBook CLI</span>
        <span>skills.md Powered</span>
        <span>
          {processing ? '⏳ Processing...' : registerMode ? `📝 Registering: ${registerMode.step}` : `${history.length} lines`}
        </span>
      </div>
    </div>
  );
}

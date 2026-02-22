#!/usr/bin/env node

// FightBook CLI
// Command-line interface for running AI combat simulations

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { runFight as engineRunFight } from './lib/fightEngine';
import type { Fighter as EngineFighter } from './lib/fightEngine';
import { parseSkillsMd, createNewAgent, generateFullSkillsMd, validateSkillsBudget, DEFAULT_SKILLS, POINT_BUDGET, calculatePointsSpent } from './types/agent';
import type { FightState } from './types/fight';

const args = process.argv.slice(2);
const command = args[0];

function printHelp() {
  console.log(`
FightBook CLI - AI Combat Arena

Commands:
  fightbook init <name>           Create a new fighter template
  fightbook fight <agent1> <agent2>  Run a fight between two agents
  fightbook validate <file>       Validate a skills.md file
  fightbook version               Show version

Examples:
  fightbook init my-fighter
  fightbook fight ./agent1.md ./agent2.md
  fightbook validate ./skills.md
`);
}

function initFighter(name: string) {
  const agent = createNewAgent(name);
  const skillsMd = generateFullSkillsMd(agent);
  const filename = `${name.toLowerCase().replace(/\s+/g, '-')}.md`;
  
  fs.writeFileSync(filename, skillsMd);
  console.log(`✅ Created ${filename}`);
  console.log('Edit the file to customize your fighter, then run:');
  console.log(`  fightbook fight ${filename} <opponent.md>`);
}

function validateSkills(filePath: string) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const skills = parseSkillsMd(content);
  
  console.log('✅ Valid skills.md');
  console.log(`  Name: ${skills.name || 'Not set'}`);
  console.log(`  Striking: ${skills.striking}`);
  console.log(`  Wrestling: ${skills.wrestling}`);
  console.log(`  Submissions: ${skills.submissions}`);
  console.log(`  Cardio: ${skills.cardio}`);

  // Merge with defaults to get complete config for budget calculation
  const fullSkills = { ...DEFAULT_SKILLS, ...skills };
  const spent = calculatePointsSpent(fullSkills);
  const validation = validateSkillsBudget(fullSkills);

  console.log(`  Budget: ${spent} / ${POINT_BUDGET.TOTAL} points used`);

  if (validation.warnings.length > 0) {
    for (const warn of validation.warnings) {
      console.log(`  Warning: ${warn}`);
    }
  }

  if (!validation.valid) {
    for (const err of validation.errors) {
      console.error(`  Error: ${err}`);
    }
    process.exit(1);
  }
}

async function saveCLIFight(fightResult: FightState, fighter1Name: string, fighter2Name: string): Promise<void> {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.log('Fight not saved (no DB configured)');
    return;
  }
  try {
    const supabase = createClient(url, key);
    // CLI fights use null IDs — no real fighter records exist for CLI agents
    const { error } = await supabase.from('fights').insert({
      agent1_id: null,
      agent2_id: null,
      winner_id: null,
      method: fightResult.method || 'DEC',
      round: fightResult.endRound || fightResult.currentRound,
      prize_awarded: false,
      prize_amount: 0,
      is_practice: true,
      fight_data: fightResult as unknown as Record<string, unknown>,
    });
    if (error) {
      console.log(`Fight not saved: ${error.message}`);
    } else {
      console.log('Fight saved to history.');
    }
  } catch (err) {
    console.log('Fight not saved (DB error)');
  }
}

// ── CLI fight arena (ASCII, TTY-only) ────────────────────────────────────────

const C = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
  cyan:   '\x1b[36m',
  white:  '\x1b[37m',
};

const isTTY = Boolean(process.stdout.isTTY);
const cliDelay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

// Simple stick-figure fighters. A faces right, B faces left.
const A_IDLE    = ['  o   ', ' /|\\  ', ' / \\  '];
const B_IDLE    = ['   o  ', '  /|\\', '  / \\'];
const A_PUNCH   = ['  o      ', ' /|=>>>> ', ' / \\     '];
const B_PUNCH   = ['      o  ', ' <<<<|=\\ ', '     / \\ '];
const A_DOWN    = ['        ', ' o-|----', '/       '];
const B_DOWN    = ['        ', '----|--o', '       \\'];
const A_VICTORY = ['  \\o/  ', '   |   ', '  / \\  '];
const B_VICTORY = ['  \\o/  ', '   |   ', '  / \\  '];

function printArenaFrame(
  aName: string, bName: string,
  aSprite: string[], bSprite: string[],
  label: string,
) {
  if (!isTTY) return;
  const W = 52;
  const border = '-'.repeat(W);
  const mid = label.padStart(Math.floor((W + label.length) / 2)).padEnd(W);
  process.stdout.write(`\n${C.dim}  ${border}${C.reset}\n`);
  process.stdout.write(`  ${C.dim}|${C.reset} ${C.yellow}${C.bold}${aName.slice(0, 14).padEnd(14)}${C.reset}  ${C.dim}${mid.slice(16, W - 16)}${C.reset}  ${C.red}${C.bold}${bName.slice(0, 14).padStart(14)}${C.reset} ${C.dim}|${C.reset}\n`);
  process.stdout.write(`  ${C.dim}|${C.reset}${''.padEnd(W)}${C.dim}|${C.reset}\n`);
  const rows = Math.max(aSprite.length, bSprite.length);
  const GAP = W - 10; // space between sprites
  for (let i = 0; i < rows; i++) {
    const aLine = (aSprite[i] || '').padEnd(9);
    const bLine = (bSprite[i] || '').padStart(9);
    process.stdout.write(`  ${C.dim}|${C.reset} ${C.yellow}${aLine}${C.reset}${' '.repeat(GAP - 10)}${C.red}${bLine}${C.reset} ${C.dim}|${C.reset}\n`);
  }
  process.stdout.write(`  ${C.dim}|${C.reset}${''.padEnd(W)}${C.dim}|${C.reset}\n`);
  process.stdout.write(`  ${C.dim}${border}${C.reset}\n\n`);
}

function printImpact(text: string) {
  if (!isTTY) return;
  process.stdout.write(`  ${C.bold}${C.yellow}*** ${text} ***${C.reset}\n`);
}

function printWinnerBanner(winner: string, method: string) {
  const W = 52;
  const border = '='.repeat(W);
  const line1 = `WINNER: ${winner}`.padStart(Math.floor((W + 8 + winner.length) / 2)).padEnd(W);
  const line2 = `by ${method}`.padStart(Math.floor((W + 3 + method.length) / 2)).padEnd(W);
  process.stdout.write(`\n  ${C.bold}${C.yellow}${border}${C.reset}\n`);
  process.stdout.write(`  ${C.bold}${C.yellow}${line1}${C.reset}\n`);
  process.stdout.write(`  ${C.bold}${C.yellow}${line2}${C.reset}\n`);
  process.stdout.write(`  ${C.bold}${C.yellow}${border}${C.reset}\n\n`);
}

// ── runFight ──────────────────────────────────────────────────────────────────

async function runFight(file1: string, file2: string) {
  if (!fs.existsSync(file1)) { console.error(`File not found: ${file1}`); process.exit(1); }
  if (!fs.existsSync(file2)) { console.error(`File not found: ${file2}`); process.exit(1); }

  const skills1 = parseSkillsMd(fs.readFileSync(file1, 'utf-8'));
  const skills2 = parseSkillsMd(fs.readFileSync(file2, 'utf-8'));

  const f1: EngineFighter = {
    id: 'agent_1',
    name: (skills1.name as string) || 'Agent 1',
    stats: {
      striking: (skills1.striking as number) || 50,
      punchSpeed: (skills1.punchSpeed as number) || 50,
      punchPower: (skills1.strength as number) || 50,
      wrestling: (skills1.wrestling as number) || 50,
      submissions: (skills1.submissions as number) || 50,
      cardio: (skills1.cardio as number) || 50,
      chin: (skills1.chin as number) || 50,
      headMovement: (skills1.headMovement as number) || 50,
      takedownDefense: (skills1.takedownDefense as number) || 50,
    },
  };

  const f2: EngineFighter = {
    id: 'agent_2',
    name: (skills2.name as string) || 'Agent 2',
    stats: {
      striking: (skills2.striking as number) || 50,
      punchSpeed: (skills2.punchSpeed as number) || 50,
      punchPower: (skills2.strength as number) || 50,
      wrestling: (skills2.wrestling as number) || 50,
      submissions: (skills2.submissions as number) || 50,
      cardio: (skills2.cardio as number) || 50,
      chin: (skills2.chin as number) || 50,
      headMovement: (skills2.headMovement as number) || 50,
      takedownDefense: (skills2.takedownDefense as number) || 50,
    },
  };

  const result = engineRunFight(f1, f2);

  // Opening banner
  printArenaFrame(f1.name, f2.name, A_IDLE, B_IDLE, '-- FIGHT --');

  // Play-by-play with delays (TTY) or plain dump (piped)
  for (const line of result.log) {
    const roundMatch = line.match(/^\[Round (\d+)\]/);
    const isRound = !!roundMatch;
    const isEnd = line.startsWith('End of Round') || line.startsWith('[Decision]');
    const isCritical = line.startsWith('[CRITICAL]') || line.includes('referee stops') || line.includes('taps');

    if (isRound) {
      const r = parseInt(roundMatch![1]);
      printArenaFrame(f1.name, f2.name, A_IDLE, B_IDLE, `-- ROUND ${r} --`);
      console.log(line);
      await cliDelay(isTTY ? 400 : 0);
    } else if (isCritical) {
      console.log(line);
      if (isTTY) {
        printImpact(line.startsWith('[CRITICAL]') ? 'CRITICAL HIT' : 'FIGHT OVER');
        await cliDelay(600);
      }
    } else if (isEnd) {
      console.log(line);
      await cliDelay(isTTY ? 300 : 0);
    } else {
      console.log(line);
      await cliDelay(isTTY ? 120 : 0);
    }
  }

  // Winner
  if (result.winner === 'DRAW') {
    printArenaFrame(f1.name, f2.name, A_IDLE, B_IDLE, '-- DRAW --');
    console.log('\n  DRAW\n');
  } else {
    const aWon = result.winner === f1.name;
    printArenaFrame(f1.name, f2.name, aWon ? A_VICTORY : A_DOWN, aWon ? B_DOWN : B_VICTORY, '-- FINAL --');
    printWinnerBanner(result.winner, result.method || 'DEC');
  }

  await saveCLIFight({ winner: result.winner, method: result.method, endRound: 3, currentRound: 3 } as any, f1.name, f2.name);
}

// Main
async function main() {
  switch (command) {
    case 'init':
      if (!args[1]) {
        console.error('Usage: fightbook init <name>');
        process.exit(1);
      }
      initFighter(args[1]);
      break;
      
    case 'fight':
      if (!args[1] || !args[2]) {
        console.error('Usage: fightbook fight <agent1.md> <agent2.md>');
        process.exit(1);
      }
      await runFight(args[1], args[2]);
      break;
      
    case 'validate':
      if (!args[1]) {
        console.error('Usage: fightbook validate <skills.md>');
        process.exit(1);
      }
      validateSkills(args[1]);
      break;
      
    case 'version':
    case '-v':
    case '--version':
      console.log('fightbook v1.1.17');
      break;
      
    case 'help':
    case '-h':
    case '--help':
    default:
      printHelp();
  }
}

main().catch(console.error);

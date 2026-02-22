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

  console.log(`\n${f1.name} vs ${f2.name}\n`);
  const result = engineRunFight(f1, f2);
  result.log.forEach(line => console.log(line));
  console.log('\n' + '='.repeat(40));
  if (result.winner === 'DRAW') {
    console.log('DRAW');
  } else {
    console.log(`WINNER: ${result.winner} by ${result.method}`);
  }
  console.log('='.repeat(40) + '\n');

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

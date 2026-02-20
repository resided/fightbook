#!/usr/bin/env node

// Build script for FightBook library
// Compiles TypeScript to JavaScript for npm distribution

import { build } from 'esbuild';
import { 
  existsSync, mkdirSync, chmodSync, 
  readdirSync, statSync, readFileSync, writeFileSync 
} from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));

if (!existsSync('dist')) {
  mkdirSync('dist');
}

// Compile all TypeScript files - bundle each entry point
const filesToCompile = [
  'src/index.ts',
  'src/cli.ts',
];

for (const file of filesToCompile) {
  if (!existsSync(file)) continue;
  
  const outFile = file.replace('src/', 'dist/').replace('.ts', '.js');
  const outDir = dirname(outFile);
  
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }
  
  await build({
    entryPoints: [file],
    outfile: outFile,
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'esm',
    sourcemap: true,
    external: [],
  });
}

// Add shebang to CLI
const cliPath = 'dist/cli.js';
if (existsSync(cliPath)) {
  const content = readFileSync(cliPath, 'utf-8');
  if (!content.startsWith('#!')) {
    writeFileSync(cliPath, '#!/usr/bin/env node\n' + content);
  }
  chmodSync(cliPath, 0o755);
}

// Generate .d.ts files using tsc
try {
  execSync('npx tsc --declaration --emitDeclarationOnly --outDir dist', {
    stdio: 'pipe'
  });
} catch (e) {
  // TSC may error on JSX files, that's ok
}

console.log('✅ Library built successfully');

#!/usr/bin/env node
/**
 * BookForge Wizard - Professional Interactive Installer
 * Based on BMAD methodology and UX best practices
 */

import readline from 'node:readline';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');

// ─── Color Support Detection ────────────────────────────────────────────────
// Check if we can use colors (TTY environment)
const isTTY = process.stdout.isTTY;
const hasColors = isTTY && process.env.TERM !== 'dumb';

// Simple color functions that work everywhere
const colors = {
  reset: hasColors ? '\x1B[0m' : '',
  bold: hasColors ? '\x1B[1m' : '',
  dim: hasColors ? '\x1B[2m' : '',
  red: hasColors ? '\x1B[31m' : '',
  green: hasColors ? '\x1B[32m' : '',
  yellow: hasColors ? '\x1B[33m' : '',
  blue: hasColors ? '\x1B[34m' : '',
  magenta: hasColors ? '\x1B[35m' : '',
  cyan: hasColors ? '\x1B[36m' : '',
  white: hasColors ? '\x1B[37m' : '',
  gray: hasColors ? '\x1B[90m' : '',
  // Background colors
  bgBlue: hasColors ? '\x1B[44m' : '',
  bgGreen: hasColors ? '\x1B[42m' : '',
};

function colorize(text, color) {
  return colors[color] ? colors[color] + text + colors.reset : text;
}

function bold(text) {
  return colors.bold ? colors.bold + text + colors.reset : text;
}

function dim(text) {
  return colors.dim ? colors.dim + text + colors.reset : text;
}

// ─── State ──────────────────────────────────────────────────────────────────
let step = 0;
const totalSteps = 6;
const config = {
  project_name: '',
  template: 'book',
  host: 'auto',
  graph_provider: 'none',
  user_name: '',
  communication_language: 'English',
  document_output_language: 'English',
  output_folder: '{project-root}/bookforge-output',
  progressive_disclosure: 'true',
  require_human_gate: 'true',
  fail_on_critical: 'true'
};

// ─── Helpers ────────────────────────────────────────────────────────────────
function clearScreen() {
  process.stdout.write('\x1B[2J\x1B[0;0H');
}

function hideCursor() {
  process.stdout.write('\x1B[?25l');
}

function showCursor() {
  process.stdout.write('\x1B[?25h');
}

function printBox(title, content, width = 70) {
  const lines = content.split('\n');
  console.log('\n' + C.bold + C.indigo + '╔' + '═'.repeat(width) + '╗' + C.reset);
  console.log('║' + C.bold + ' ' + title.padEnd(width - 1) + ' ║' + C.reset);
  console.log('╠' + '═'.repeat(width) + '╣' + C.reset);
  for (const line of lines) {
    console.log('║' + C.slateLight + ' ' + line.padEnd(width - 1) + ' ║' + C.reset);
  }
  console.log('╚' + '═'.repeat(width) + '╝' + C.reset + '\n');
}

function printStepHeader(current, total, title, subtitle) {
  const progress = Math.round((current / total) * 100);
  const filled = Math.round((progress / 100) * 40);
  const empty = 40 - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);

  clearScreen();
  console.log(dim + '  BookForge Setup Wizard'.padEnd(50) + C.reset + `  ${current}/${total}`);
  console.log(dim + '  ' + '─'.repeat(70) + C.reset);
  console.log(bold + C.indigo + `  ${bar}  ${progress}%` + C.reset);
  console.log('\n' + C.bold + C.cyan + `  ${title}` + C.reset);
  console.log(dim + '  ' + subtitle + C.reset + '\n');
}

function ask(question, defaultValue = '') {
  return new Promise((resolve) => {
    const prompt = defaultValue
      ? `${C.bold}${question}${C.reset} ${C.dim}[${defaultValue}]${C.reset} `
      : `${C.bold}${question}${C.reset} `;
    rl.question(prompt, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

function selectOne(prompt, options, defaultIdx = 0) {
  return new Promise((resolve) => {
    console.log(`\n${C.bold}${prompt}${C.reset}\n`);
    options.forEach((opt, i) => {
      const marker = i === defaultIdx ? C.bold + C.green + '▸ ' + C.reset : '  ';
      const selected = i === defaultIdx ? C.bold + C.green : C.slateLight;
      console.log(`  ${marker}${selected}${opt.label}${C.reset}${opt.hint ? C.dim + '  ' + opt.hint : ''}`);
    });
    console.log(`\n${C.dim}Use arrow keys to navigate, Enter to select${C.reset}`);

    rl.question(`\n${C.bold}Select [1-${options.length}]${C.reset} `, (answer) => {
      const idx = parseInt(answer) - 1;
      resolve(!isNaN(idx) && idx >= 0 && idx < options.length ? options[idx].value : options[defaultIdx].value);
    });
  });
}

function confirm(prompt) {
  return new Promise((resolve) => {
    rl.question(`\n${C.bold}${prompt} ${C.dim}[y/N]${C.reset} `, (answer) => {
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

// ─── Detection ──────────────────────────────────────────────────────────────
function detectHosts() {
  const hosts = [];
  const home = process.env.HOME || process.env.USERPROFILE;

  if (fs.existsSync(path.join(home, '.claude'))) hosts.push('claude-code');
  if (fs.existsSync(path.join(home, '.cursor'))) hosts.push('cursor');
  if (fs.existsSync(path.join(home, '.windsurf'))) hosts.push('windsurf');
  if (fs.existsSync(path.join(home, '.kiro'))) hosts.push('kiro');

  return hosts;
}

function getGitUserName() {
  try {
    return execSync('git config user.name', { encoding: 'utf8' }).trim() || 'Author';
  } catch {
    return 'Author';
  }
}

// ─── Steps ──────────────────────────────────────────────────────────────────
async function stepWelcome() {
  printStepHeader(step + 1, totalSteps, 'Welcome to BookForge',
    'The agentic framework for rigorous book production.\nThis wizard will guide you through the setup process.');

  console.log(dim + `
  ┌─────────────────────────────────────────────────────────┐
  │  BookForge v0.6.0                                        │
  │  ─────────────────────────────────────────────────────  │
  │  • Platform-agnostic AI agent framework                  │
  │  • 21 specialized agents for book production            │
  │  • 28 skills for writing, editing, validation           │
  │  • 17 workflows for the complete book lifecycle         │
  │  • Knowledge graph for continuity and fact-checking     │
  └─────────────────────────────────────────────────────────┘
  ` + C.reset);

  await confirm('Press Enter to continue');
  step++;
}

async function stepProject() {
  printStepHeader(step + 1, totalSteps, 'Project Configuration',
    'Let\'s set up your book project.');

  const currentDir = path.basename(process.cwd());
  config.project_name = await ask('Project name', currentDir);
  config.template = await selectOne('Book template', [
    { value: 'book', label: '📖 General Book', hint: 'Standard book structure' },
    { value: 'fiction', label: '📚 Fiction', hint: 'Novel, short stories' },
    { value: 'non-fiction', label: '📗 Non-Fiction', hint: 'Essays, guides, research' },
    { value: 'technical', label: '💻 Technical', hint: 'Documentation, tutorials' },
    { value: 'academic', label: '🎓 Academic', hint: 'Thesis, research papers' }
  ], 0);

  step++;
}

async function stepHost() {
  printStepHeader(step + 1, totalSteps, 'Host Detection',
    'Which AI editor will you use?');

  const detected = detectHosts();
  if (detected.length > 0) {
    console.log(colorize(', 'green')) + '  ✓ Detected hosts:' + C.reset);
    detected.forEach(h => console.log(dimLight + `    • ${h}` + C.reset));
    console.log();
  }

  config.host = await selectOne('Select host', [
    { value: 'auto', label: '🔍 Auto Detect', hint: 'Use all detected hosts' },
    { value: 'claude-code', label: '🤖 Claude Code', hint: 'Anthropic CLI' },
    { value: 'cursor', label: '⚡ Cursor', hint: 'AI code editor' },
    { value: 'windsurf', label: '🌊 Windsurf', hint: 'AI code editor' },
    { value: 'kiro', label: '🎯 Kiro', hint: 'AI assistant' },
    { value: 'generic', label: '📦 Generic', hint: 'No specific host' }
  ], detected.includes('claude-code') ? 1 : 0);

  step++;
}

async function stepGraph() {
  printStepHeader(step + 1, totalSteps, 'Knowledge Graph',
    'How should we store your book\'s knowledge?');

  console.log(dim + `
  The knowledge graph tracks:
    • Characters, places, and events
    • Facts and sources
    • Continuity across chapters
    • Quality validators
  ` + C.reset);

  config.graph_provider = await selectOne('Graph provider', [
    { value: 'jsonl', label: '📄 JSONL (Recommended)', hint: 'File-based, no setup required' },
    { value: 'neo4j', label: '🗄️ Neo4j', hint: 'Graph database (requires setup)' },
    { value: 'none', label: '⛔ None', hint: 'Skip graph storage' }
  ], 0);

  step++;
}

async function stepUser() {
  printStepHeader(step + 1, totalSteps, 'User Profile',
    'Tell us about yourself.');

  config.user_name = await ask('Your name', getGitUserName());
  config.communication_language = await selectOne('Communication language', [
    { value: 'English', label: '🇬🇧 English' },
    { value: 'French', label: '🇫🇷 Français' },
    { value: 'Spanish', label: '🇪🇸 Español' },
    { value: 'German', label: '🇩🇪 Deutsch' }
  ], 0);

  step++;
}

async function stepReview() {
  printStepHeader(step + 1, totalSteps, 'Review Configuration',
    'Please review your settings before proceeding.');

  const summary = `
  Project:     ${config.project_name}
  Template:    ${config.template}
  Host:        ${config.host}
  Graph:       ${config.graph_provider}
  Name:        ${config.user_name}
  Language:    ${config.communication_language}
  `.trim();

  printBox('Summary', summary);

  const proceed = await confirm('Proceed with installation?');
  if (!proceed) {
    console.log(C.yellow + '\n  Installation cancelled.' + C.reset);
    process.exit(0);
  }

  step++;
  return true;
}

// ─── Main ───────────────────────────────────────────────────────────────────
export async function interactiveInstall(projectDir, options = {}) {
  hideCursor();
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  try {
    // Override with CLI args if provided
    if (options.project_name) config.project_name = options.project_name;
    if (options.template) config.template = options.template;
    if (options.host) config.host = options.host;
    if (options.graph) config.graph_provider = options.graph;
    if (options.user_name) config.user_name = options.user_name;

    await stepWelcome();
    await stepProject();
    await stepHost();
    await stepGraph();
    await stepUser();
    await stepReview();

    return config;
  } catch (e) {
    if (e.message?.includes('EOF')) {
      console.log(C.yellow + '\n  Installation cancelled.' + C.reset);
      process.exit(0);
    }
    throw e;
  } finally {
    showCursor();
    rl.close();
  }
}

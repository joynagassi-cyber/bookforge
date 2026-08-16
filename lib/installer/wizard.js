#!/usr/bin/env node
/**
 * BookForge Wizard - Professional Interactive Installer
 * Inspired by BMAD methodology with modern UI
 */

import readline from 'node:readline';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');

// ─── Color Support Detection ────────────────────────────────────────────────
const isTTY = process.stdout.isTTY;
const hasColors = isTTY && process.env.TERM !== 'dumb';

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
  bgBlue: hasColors ? '\x1B[44m' : '',
  bgGreen: hasColors ? '\x1B[42m' : '',
};

// ─── ASCII Art Banner ───────────────────────────────────────────────────────
function printBanner(version) {
  const banner = `
┌─────────────────────────────────────────────────────────────┐
│  ███████╗██╗   ██╗███████╗████████╗███████╗███╗   ██╗       │
│  ██╔════╝██║   ██║██╔════╝╚══██╔══╝██╔════╝████╗  ██║       │
│  ███████╗██║   ██║███████╗   ██║   █████╗  ██╔██╗ ██║       │
│  ╚════██║██║   ██║╚════██║   ██║   ██╔══╝  ██║╚██╗██║       │
│  ███████║╚██████╔╝███████║   ██║   ███████╗██║ ╚████║       │
│  ╚══════╝ ╚═════╝ ╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═══╝       │
│  v${version.padEnd(45)}│
└─────────────────────────────────────────────────────────────┘
`;
  console.log(colors.cyan + banner + colors.reset);
}

// ─── Box Printer ─────────────────────────────────────────────────────────────
function printBox(title, content, width = 60) {
  const lines = content.split('\n');
  console.log('\n' + colors.bold + colors.blue + '┌' + '─'.repeat(width) + '┐' + colors.reset);
  console.log('│' + colors.bold + ' ' + title.padEnd(width - 1) + ' │' + colors.reset);
  console.log('├' + '─'.repeat(width) + '┤' + colors.reset);
  for (const line of lines) {
    console.log('│' + colors.gray + ' ' + line.padEnd(width - 1) + ' │' + colors.reset);
  }
  console.log('└' + '─'.repeat(width) + '┘' + colors.reset + '\n');
}

// ─── Progress Bar ────────────────────────────────────────────────────────────
function printProgress(current, total, title) {
  const progress = Math.round((current / total) * 100);
  const filled = Math.round((progress / 100) * 40);
  const empty = 40 - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);

  console.log(colors.dim + '  BookForge Setup Wizard'.padEnd(50) + colors.reset + `  ${current}/${total}`);
  console.log(colors.dim + '  ' + '─'.repeat(70) + colors.reset);
  console.log(colors.bold + colors.blue + `  ${bar}  ${progress}%` + colors.reset);
  console.log('\n' + colors.bold + colors.cyan + `  ${title}` + colors.reset);
  console.log(colors.dim + '  ' + ''.padEnd(70) + colors.reset + '\n');
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
function ask(question, defaultValue = '') {
  return new Promise((resolve) => {
    const prompt = defaultValue
      ? `${colors.bold}${question}${colors.reset} ${colors.dim}[${defaultValue}]${colors.reset} `
      : `${colors.bold}${question}${colors.reset} `;
    rl.question(prompt, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

function selectOne(prompt, options, defaultIdx = 0) {
  return new Promise((resolve) => {
    console.log(`\n${colors.bold}${prompt}${colors.reset}\n`);
    options.forEach((opt, i) => {
      const marker = i === defaultIdx ? colors.bold + colors.green + '▸ ' + colors.reset : '  ';
      const selected = i === defaultIdx ? colors.bold + colors.green : colors.gray;
      console.log(`  ${marker}${selected}${opt.label}${colors.reset}${opt.hint ? colors.dim + '  ' + opt.hint : ''}`);
    });
    console.log(`\n${colors.dim}Use arrow keys to navigate, Enter to select${colors.reset}`);

    rl.question(`\n${colors.bold}Select [1-${options.length}]${colors.reset} `, (answer) => {
      const idx = parseInt(answer) - 1;
      resolve(!isNaN(idx) && idx >= 0 && idx < options.length ? options[idx].value : options[defaultIdx].value);
    });
  });
}

function confirm(prompt) {
  return new Promise((resolve) => {
    rl.question(`\n${colors.bold}${prompt} ${colors.dim}[y/N]${colors.reset} `, (answer) => {
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
  if (fs.existsSync(path.join(home, '.codex'))) hosts.push('codex-cli');
  if (fs.existsSync(path.join(home, '.devin'))) hosts.push('devin');
  if (fs.existsSync(path.join(home, '.opencode'))) hosts.push('opencode');
  if (fs.existsSync(path.join(home, '.kilocode'))) hosts.push('kilocode');
  if (fs.existsSync(path.join(home, '.antigravity'))) hosts.push('antigravity');
  if (fs.existsSync(path.join(home, '.gemini'))) hosts.push('gemini');

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
  printProgress(step + 1, totalSteps, 'Welcome to BookForge');

  printBox('BookForge v0.6.0', `
  • Platform-agnostic AI agent framework
  • 21 specialized agents for book production
  • 28 skills for writing, editing, validation
  • 17 workflows for the complete book lifecycle
  • Knowledge graph for continuity and fact-checking
  • 10 host adapters (Claude Code, Cursor, Windsurf, etc.)
  `);

  await confirm('Press Enter to continue');
  step++;
}

async function stepProject() {
  printProgress(step + 1, totalSteps, 'Project Configuration');

  const currentDir = path.basename(process.cwd());
  config.project_name = await ask('Project name', currentDir);

  const templates = [
    { value: 'book', label: '📖 General Book', hint: 'Standard book structure' },
    { value: 'fiction', label: '📚 Fiction', hint: 'Novel, short stories' },
    { value: 'non-fiction', label: '📗 Non-Fiction', hint: 'Essays, guides, research' },
    { value: 'technical', label: '💻 Technical', hint: 'Documentation, tutorials' },
    { value: 'academic', label: '🎓 Academic', hint: 'Thesis, research papers' }
  ];

  config.template = await selectOne('Book template', templates, 0);
  step++;
}

async function stepHost() {
  printProgress(step + 1, totalSteps, 'Host Detection');

  const detected = detectHosts();
  if (detected.length > 0) {
    console.log(colors.green + '  ✓ Detected hosts:' + colors.reset);
    detected.forEach(h => console.log(colors.gray + `    • ${h}` + colors.reset));
    console.log();
  }

  const hosts = [
    { value: 'auto', label: '🔍 Auto Detect', hint: 'Use all detected hosts' },
    { value: 'claude-code', label: '🤖 Claude Code', hint: 'Anthropic CLI' },
    { value: 'cursor', label: '⚡ Cursor', hint: 'AI code editor' },
    { value: 'windsurf', label: '🌊 Windsurf', hint: 'AI code editor' },
    { value: 'kiro', label: '🎯 Kiro', hint: 'AI assistant' },
    { value: 'generic', label: '📦 Generic', hint: 'No specific host' }
  ];

  config.host = await selectOne('Select host', hosts, detected.includes('claude-code') ? 1 : 0);
  step++;
}

async function stepGraph() {
  printProgress(step + 1, totalSteps, 'Knowledge Graph');

  printBox('Knowledge Graph', `
  Tracks:
    • Characters, places, and events
    • Facts and sources
    • Continuity across chapters
    • Quality validators
  `);

  const graphs = [
    { value: 'jsonl', label: '📄 JSONL (Recommended)', hint: 'File-based, no setup required' },
    { value: 'neo4j', label: '🗄️ Neo4j', hint: 'Graph database (requires setup)' },
    { value: 'none', label: '⛔ None', hint: 'Skip graph storage' }
  ];

  config.graph_provider = await selectOne('Graph provider', graphs, 0);
  step++;
}

async function stepUser() {
  printProgress(step + 1, totalSteps, 'User Profile');

  config.user_name = await ask('Your name', getGitUserName());

  const languages = [
    { value: 'English', label: '🇬🇧 English' },
    { value: 'French', label: '🇫🇷 Français' },
    { value: 'Spanish', label: '🇪🇸 Español' },
    { value: 'German', label: '🇩🇪 Deutsch' }
  ];

  config.communication_language = await selectOne('Communication language', languages, 0);
  step++;
}

async function stepReview() {
  printProgress(step + 1, totalSteps, 'Review Configuration');

  const summary = `
  Project:     ${config.project_name}
  Template:    ${config.template}
  Host:        ${formatHostName(config.host)}
  Graph:       ${config.graph_provider}
  Name:        ${config.user_name}
  Language:    ${config.communication_language}
  `;

  printBox('Review Configuration', summary.trim());

  const proceed = await confirm('Proceed with installation?');
  if (!proceed) {
    console.log(colors.yellow + '\n  Installation cancelled.' + colors.reset);
    process.exit(0);
  }

  step++;
  return true;
}

// ─── Main ───────────────────────────────────────────────────────────────────
export async function interactiveInstall(projectDir, options = {}) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  // Override with CLI args if provided
  if (options.project_name) config.project_name = options.project_name;
  if (options.template) config.template = options.template;
  if (options.host) config.host = options.host;
  if (options.graph) config.graph_provider = options.graph;
  if (options.user_name) config.user_name = options.user_name;

  try {
    const version = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
    printBanner(version);

    await stepWelcome();
    await stepProject();
    await stepHost();
    await stepGraph();
    await stepUser();
    await stepReview();

    return config;
  } catch (e) {
    if (e.message?.includes('EOF')) {
      console.log(colors.yellow + '\n  Installation cancelled.' + colors.reset);
      process.exit(0);
    }
    throw e;
  } finally {
    rl.close();
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatHostName(host) {
  const names = {
    'claude-code': 'Claude Code',
    'cursor': 'Cursor',
    'windsurf': 'Windsurf',
    'kiro': 'Kiro',
    'codex-cli': 'Codex CLI',
    'devin': 'Devin',
    'opencode': 'OpenCode',
    'kilocode': 'KiloCode',
    'antigravity': 'Antigravity',
    'github-copilot': 'GitHub Copilot',
    'gemini': 'Gemini',
    'generic': 'Generic'
  };
  return names[host] || host;
}

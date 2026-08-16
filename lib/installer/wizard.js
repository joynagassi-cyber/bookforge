#!/usr/bin/env node
/**
 * BookForge Wizard - Professional Interactive Installer
 * Inspired by BMAD methodology
 */

import readline from 'node:readline';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

// ─── Color Support Detection ────────────────────────────────────────────────
const isTTY = process.stdout.isTTY;
const hasColors = isTTY && process.env.TERM !== 'dumb';

const C = {
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
  brightCyan: hasColors ? '\x1B[96m' : '',
  brightGreen: hasColors ? '\x1B[92m' : '',
};

// ─── State ──────────────────────────────────────────────────────────────────
let currentStep = 0;
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

// ─── ASCII Art Banner ───────────────────────────────────────────────────────
function printBanner(version) {
  const versionStr = version.padEnd(14);
  const banner = `
${C.bold}${C.cyan}+======================================================================+${C.reset}
${C.bold}${C.cyan}|                                                                      |${C.reset}
${C.bold}${C.cyan}|${C.reset}  ${C.bold}${C.brightCyan} ____   ${C.reset}${C.brightCyan}/ _  /  ${C.reset}${C.brightCyan}/ ___ /  ${C.reset}${C.brightCyan}/  _____/ ${C.reset}${C.brightCyan}/ ___ / ${C.reset}${C.brightCyan}/ _  /${C.reset}  ${C.gray}v${versionStr}${C.reset}  ${C.bold}${C.cyan}|${C.reset}
${C.bold}${C.cyan}|${C.reset}  ${C.bold}${C.brightCyan}/ __/   ${C.reset}${C.brightCyan}/ /_  /  ${C.reset}${C.brightCyan}/ /_/ /   ${C.reset}${C.brightCyan}/ /_/ /   ${C.reset}${C.brightCyan}/ /_/ / ${C.reset}${C.brightCyan}/ /_  /${C.reset}  ${C.gray}         ${C.reset}  ${C.bold}${C.cyan}|${C.reset}
${C.bold}${C.cyan}|${C.reset}  ${C.bold}${C.brightCyan}/ /     ${C.reset}${C.brightCyan}/ ___ /  ${C.reset}${C.brightCyan}/ ___ /   ${C.reset}${C.brightCyan}/  __/    ${C.reset}${C.brightCyan}/  ___ / ${C.reset}${C.brightCyan}/ _  / ${C.reset}  ${C.gray}         ${C.reset}  ${C.bold}${C.cyan}|${C.reset}
${C.bold}${C.cyan}|${C.reset}  ${C.bold}${C.brightCyan}/ /___  ${C.reset}${C.brightCyan}/ /  /   ${C.reset}${C.brightCyan}/ /   /   ${C.reset}${C.brightCyan}/ /       ${C.reset}${C.brightCyan}/ /   /  ${C.reset}${C.brightCyan}/_/ /_${C.reset}  ${C.gray}         ${C.reset}  ${C.bold}${C.cyan}|${C.reset}
${C.bold}${C.cyan}|${C.reset}  ${C.bold}${C.brightCyan}/_____/  ${C.reset}${C.brightCyan}/_/  /___${C.reset}${C.brightCyan}/_/   /___${C.reset}${C.brightCyan}/_/       ${C.reset}${C.brightCyan}/_/   /___${C.reset}${C.brightCyan}/_____/ ${C.reset}  ${C.gray}         ${C.reset}  ${C.bold}${C.cyan}|${C.reset}
${C.bold}${C.cyan}|${C.reset}                                                                      ${C.gray}|${C.reset}
${C.bold}${C.cyan}|${C.reset}   ${C.bold}The agentic framework for rigorous book production${C.reset}                ${C.gray}|${C.reset}
${C.bold}${C.cyan}|${C.reset}   ${C.dim}Build More, Write Smarter · (c) BookForge${C.reset}                          ${C.gray}|${C.reset}
${C.bold}${C.cyan}|${C.reset}                                                                      ${C.gray}|${C.reset}
${C.bold}${C.cyan}+======================================================================+${C.reset}
`;
  console.log(banner);
}

// ─── Progress Bar ────────────────────────────────────────────────────────────
function printProgressBar() {
  const progress = Math.round((currentStep / totalSteps) * 100);
  const filled = Math.round((progress / 100) * 50);
  const empty = 50 - filled;
  const bar = C.green + '='.repeat(filled) + C.gray + '-'.repeat(empty) + C.reset;

  console.log(`\n${C.dim}  BookForge Setup Wizard${C.reset}${C.gray}  ${currentStep}/${totalSteps}${C.reset}`);
  console.log(`  ${C.gray}+${'-'.repeat(50)}+${C.reset}`);
  console.log(`  ${bar}  ${progress}%${C.reset}`);
  console.log();
}

// ─── Step Header ─────────────────────────────────────────────────────────────
function printStepHeader(title, subtitle) {
  const width = 58;
  console.log(`${C.bold}${C.cyan}+${'-'.repeat(width)}+${C.gray}|${C.reset}`);
  console.log(`${C.gray}|${C.reset} ${C.bold}${C.cyan} ${title}${' '.repeat(width - title.length)} ${C.gray}|${C.reset}`);
  console.log(`${C.gray}+${'-'.repeat(width)}+${C.gray}|${C.reset}`);
  console.log(`${C.gray}|${C.reset} ${C.dim}${subtitle}${' '.repeat(width - subtitle.length)} ${C.gray}|${C.reset}`);
  console.log(`${C.gray}+${'-'.repeat(width)}+${C.gray}|${C.reset}\n`);
}

// ─── Info Box ────────────────────────────────────────────────────────────────
function printInfoBox(title, lines) {
  const width = 58;
  console.log(`\n${C.bold}${C.blue}+${'-'.repeat(width)}+${C.gray}|${C.reset}`);
  console.log(`${C.gray}|${C.reset} ${C.bold}${C.blue} ${title}${' '.repeat(width - title.length)} ${C.gray}|${C.reset}`);
  console.log(`${C.gray}+${'-'.repeat(width)}+${C.gray}|${C.reset}`);
  for (const line of lines) {
    console.log(`${C.gray}|${C.reset} ${C.gray}${line}${' '.repeat(width - line.length)} ${C.gray}|${C.reset}`);
  }
  console.log(`${C.gray}+${'-'.repeat(width)}+${C.gray}|${C.reset}\n`);
}

// ─── Help Box ────────────────────────────────────────────────────────────────
function printHelpBox() {
  const width = 50;
  console.log(`${C.dim}
  ${C.gray}+${'-'.repeat(width)}+${C.reset}
  ${C.gray}|${C.reset}  ${C.bold}Navigation:${C.reset}                                                ${C.gray}|${C.reset}
  ${C.gray}|${C.reset}    * Press ${C.yellow}Enter${C.reset} to accept default                          ${C.gray}|${C.reset}
  ${C.gray}|${C.reset}    * Type a value and press ${C.yellow}Enter${C.reset} to continue              ${C.gray}|${C.reset}
  ${C.gray}|${C.reset}    * Press ${C.red}Ctrl+C${C.reset} to cancel at any time                   ${C.gray}|${C.reset}
  ${C.gray}+${'-'.repeat(width)}+${C.reset}
${C.reset}`);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function ask(question, defaultValue = '') {
  return new Promise((resolve) => {
    const suffix = defaultValue ? ` ${C.dim}[${defaultValue}]${C.reset}` : '';
    rl.question(`${C.bold}${question}${C.reset}${suffix} `, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

function selectOne(prompt, options, defaultIdx = 0) {
  return new Promise((resolve) => {
    console.log(`\n${C.bold}${prompt}${C.reset}\n`);
    options.forEach((opt, i) => {
      const marker = i === defaultIdx ? C.bold + C.green + '> ' + C.reset : '  ';
      const text = i === defaultIdx ? C.bold + C.green : C.gray;
      const hint = opt.hint ? `  ${C.dim}${opt.hint}${C.reset}` : '';
      console.log(`  ${marker}${text}${opt.label}${C.reset}${hint}`);
    });
    console.log(`\n${C.dim}Select [1-${options.length}]${C.reset}: `);

    rl.question('', (answer) => {
      const idx = parseInt(answer) - 1;
      resolve(!isNaN(idx) && idx >= 0 && idx < options.length ? options[idx].value : options[defaultIdx].value);
    });
  });
}

function confirm(prompt) {
  return new Promise((resolve) => {
    rl.question(`${C.bold}${prompt} ${C.dim}[y/N]${C.reset} `, (answer) => {
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

function getGitUserName() {
  try {
    return execSync('git config user.name', { encoding: 'utf8' }).trim() || 'Author';
  } catch {
    return 'Author';
  }
}

// ─── Steps ──────────────────────────────────────────────────────────────────
async function stepWelcome() {
  currentStep = 1;
  printProgressBar();
  printStepHeader('Welcome to BookForge', 'The agentic framework for rigorous book production.');

  printInfoBox('Features', [
    '* Platform-agnostic AI agent framework',
    '* 21 specialized agents for book production',
    '* 28 skills for writing, editing, validation',
    '* 17 workflows for the complete book lifecycle',
    '* Knowledge graph for continuity and fact-checking',
    '* 10 host adapters (Claude Code, Cursor, Windsurf, etc.)'
  ]);

  await confirm('Press Enter to continue');
}

async function stepProject() {
  currentStep = 2;
  printProgressBar();
  printStepHeader('Project Configuration', 'Let\'s set up your book project.');

  const currentDir = path.basename(process.cwd());
  config.project_name = await ask('Project name', currentDir);

  const templates = [
    { value: 'book', label: 'General Book', hint: 'Standard book structure' },
    { value: 'fiction', label: 'Fiction', hint: 'Novel, short stories' },
    { value: 'non-fiction', label: 'Non-Fiction', hint: 'Essays, guides, research' },
    { value: 'technical', label: 'Technical', hint: 'Documentation, tutorials' },
    { value: 'academic', label: 'Academic', hint: 'Thesis, research papers' }
  ];

  config.template = await selectOne('Book template', templates, 0);
}

async function stepHost() {
  currentStep = 3;
  printProgressBar();
  printStepHeader('Host Detection', 'Which AI editor will you use?');

  const detected = detectHosts();
  if (detected.length > 0) {
    console.log(`${C.green}  + Detected hosts:${C.reset}`);
    detected.forEach(h => console.log(`${C.gray}    * ${formatHostName(h)}${C.reset}`));
    console.log();
  }

  const hosts = [
    { value: 'auto', label: 'Auto Detect', hint: 'Use all detected hosts' },
    { value: 'claude-code', label: 'Claude Code', hint: 'Anthropic CLI' },
    { value: 'cursor', label: 'Cursor', hint: 'AI code editor' },
    { value: 'windsurf', label: 'Windsurf', hint: 'AI code editor' },
    { value: 'kiro', label: 'Kiro', hint: 'AI assistant' },
    { value: 'generic', label: 'Generic', hint: 'No specific host' }
  ];

  const defaultIdx = detected.includes('claude-code') ? 1 : 0;
  config.host = await selectOne('Select host', hosts, defaultIdx);
}

async function stepGraph() {
  currentStep = 4;
  printProgressBar();
  printStepHeader('Knowledge Graph', 'How should we store your book\'s knowledge?');

  printInfoBox('Knowledge Graph', [
    'Tracks:',
    '  * Characters, places, and events',
    '  * Facts and sources',
    '  * Continuity across chapters',
    '  * Quality validators'
  ]);

  const graphs = [
    { value: 'jsonl', label: 'JSONL (Recommended)', hint: 'File-based, no setup required' },
    { value: 'neo4j', label: 'Neo4j', hint: 'Graph database (requires setup)' },
    { value: 'none', label: 'None', hint: 'Skip graph storage' }
  ];

  config.graph_provider = await selectOne('Graph provider', graphs, 0);
}

async function stepUser() {
  currentStep = 5;
  printProgressBar();
  printStepHeader('User Profile', 'Tell us about yourself.');

  config.user_name = await ask('Your name', getGitUserName());

  const languages = [
    { value: 'English', label: 'English' },
    { value: 'French', label: 'French' },
    { value: 'Spanish', label: 'Spanish' },
    { value: 'German', label: 'German' }
  ];

  config.communication_language = await selectOne('Communication language', languages, 0);
}

async function stepReview() {
  currentStep = 6;
  printProgressBar();
  printStepHeader('Review Configuration', 'Please review your settings before proceeding.');

  const summary = [
    `Project:     ${config.project_name}`,
    `Template:    ${config.template}`,
    `Host:        ${formatHostName(config.host)}`,
    `Graph:       ${config.graph_provider}`,
    `Name:        ${config.user_name}`,
    `Language:    ${config.communication_language}`
  ];

  printInfoBox('Review Configuration', summary);

  const proceed = await confirm('Proceed with installation?');
  if (!proceed) {
    console.log(`${C.yellow}  Installation cancelled.${C.reset}`);
    process.exit(0);
  }

  return true;
}

// ─── Main ───────────────────────────────────────────────────────────────────
let rl;

export async function interactiveInstall(projectDir, options = {}) {
  rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  // Override with CLI args if provided
  if (options.project_name) config.project_name = options.project_name;
  if (options.template) config.template = options.template;
  if (options.host) config.host = options.host;
  if (options.graph) config.graph_provider = options.graph;
  if (options.user_name) config.user_name = options.user_name;

  try {
    const version = pkg.version;
    printBanner(version);
    printHelpBox();

    await stepWelcome();
    await stepProject();
    await stepHost();
    await stepGraph();
    await stepUser();
    await stepReview();

    return config;
  } catch (e) {
    if (e.message?.includes('EOF')) {
      console.log(`${C.yellow}  Installation cancelled.${C.reset}`);
      process.exit(0);
    }
    throw e;
  } finally {
    if (rl) rl.close();
  }
}

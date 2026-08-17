#!/usr/bin/env node
/**
 * BookForge Wizard v2 — Interactive Book Production Setup
 *
 * Features:
 * - Multi-phase guided setup with coaching tips
 * - Agent selection (pick what you need)
 * - Skill selection (customize your toolkit)
 * - Workflow selection (choose your pipeline)
 * - Host/IDE auto-detection with smart defaults
 * - Knowledge graph configuration
 * - Quality settings personalization
 * - Progress tracking and resume
 */

import readline from 'node:readline';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

// ============================================================
// Color System
// ============================================================
const isTTY = process.stdout.isTTY;
const hasColors = isTTY && process.env.TERM !== 'dumb';

const C = {
  reset: hasColors ? '\x1B[0m' : '',
  bold: hasColors ? '\x1B[1m' : '',
  dim: hasColors ? '\x1B[2m' : '',
  italic: hasColors ? '\x1B[3m' : '',
  red: hasColors ? '\x1B[31m' : '',
  green: hasColors ? '\x1B[32m' : '',
  yellow: hasColors ? '\x1B[33m' : '',
  blue: hasColors ? '\x1B[34m' : '',
  magenta: hasColors ? '\x1B[35m' : '',
  cyan: hasColors ? '\x1B[36m' : '',
  white: hasColors ? '\x1B[37m' : '',
  gray: hasColors ? '\x1B[90m' : '',
  brightRed: hasColors ? '\x1B[91m' : '',
  brightGreen: hasColors ? '\x1B[92m' : '',
  brightYellow: hasColors ? '\x1B[93m' : '',
  brightBlue: hasColors ? '\x1B[94m' : '',
  brightMagenta: hasColors ? '\x1B[95m' : '',
  brightCyan: hasColors ? '\x1B[96m' : '',
  brightWhite: hasColors ? '\x1B[97m' : '',
  bgBlue: hasColors ? '\x1B[44m' : '',
  bgGreen: hasColors ? '\x1B[42m' : '',
  bgYellow: hasColors ? '\x1B[43m' : '',
};

// ============================================================
// State
// ============================================================
let rl;
let currentStep = 0;
let totalSteps = 0;

const config = {
  // Project
  project_name: '',
  book_title: '',
  author_name: '',
  genre: 'general',
  target_audience: '',
  target_length: 'medium', // short, medium, long

  // Host & IDE
  hosts: [],
  selected_hosts: [],

  // Agents (selected by user)
  selected_agents: [],
  agent_phases: { upstream: true, execution: true, editing: true, integrity: true, packaging: true, governance: true },

  // Skills
  selected_skills: [],

  // Workflows
  selected_workflows: [],

  // Knowledge Graph
  graph_provider: 'jsonl',

  // Quality
  auto_correct: true,
  max_revisions: 3,
  require_human_gate: true,

  // Language
  communication_language: 'English',
  document_language: 'English',

  // Output
  output_folder: 'bookforge-output',
};

// ============================================================
// Data: Agents, Skills, Workflows
// ============================================================

// ============================================================
// Module-Based Organization
// Each module bundles agents + skills + workflows together
// ============================================================

const MODULES = {
  core: {
    id: 'core',
    name: 'Core Foundation',
    icon: '⚙️',
    color: C.gray,
    desc: 'Essential context engineering, routing, and packet management',
    required: true,
    agents: ['context-engineer'],
    skills: ['context-packer', 'context-router', 'context-compressor'],
    workflows: ['help'],
    validators: []
  },
  upstream: {
    id: 'upstream',
    name: 'Book Architecture',
    icon: '🏗️',
    color: C.brightBlue,
    desc: 'Planning, research, contract, outline, and voice definition',
    required: true,
    agents: ['analyst', 'book-architect', 'researcher', 'outline-architect', 'voice-director'],
    skills: ['book-contract', 'outline-builder', 'voice-modeler', 'idea-validation', 'deep-research'],
    workflows: ['idea-validation', 'deep-research', 'book-contract', 'outline', 'voice-profile'],
    validators: ['structure-validator', 'voice-validator']
  },
  writing: {
    id: 'writing',
    name: 'Chapter Writing',
    icon: '✍️',
    color: C.brightGreen,
    desc: 'Draft chapters with genre patterns and voice constraints',
    required: true,
    agents: ['writer'],
    skills: ['chapter-generator', 'revision-loop'],
    workflows: ['chapter-plan', 'draft-chapter'],
    validators: []
  },
  quality: {
    id: 'quality',
    name: 'Quality Assurance',
    icon: '✅',
    color: C.brightGreen,
    desc: 'Validation, audit, and automated correction',
    required: false,
    agents: [],
    skills: ['ai-slop-detector', 'ai-slop-validator', 'cliche-detector', 'cliche-validator', 'repetition-detector', 'filler-detector', 'voice-drift-detector', 'originality-audit'],
    workflows: ['chapter-qa'],
    validators: ['ai-slop-validator', 'cliche-validator', 'repetition-validator', 'filler-validator', 'voice-validator']
  },
  editing: {
    id: 'editing',
    name: 'Editorial Suite',
    icon: '📝',
    color: C.brightYellow,
    desc: 'Developmental, line, and copy editing',
    required: false,
    agents: ['developmental-editor', 'line-editor', 'copy-editor'],
    skills: ['humanize-prose', 'human-voice-editor', 'human-editor-panel'],
    workflows: ['book-edit'],
    validators: []
  },
  integrity: {
    id: 'integrity',
    name: 'Integrity & Verification',
    icon: '🔍',
    color: C.brightMagenta,
    desc: 'Fact-checking, continuity, originality, and plagiarism',
    required: false,
    agents: ['fact-checker', 'continuity-auditor', 'originality-auditor', 'ai-slop-auditor', 'cliche-auditor', 'human-voice-editor'],
    skills: ['fact-checker', 'continuity-checker', 'claim-ledger', 'source-ledger', 'plagiarism-risk-audit'],
    workflows: ['integrity-audit'],
    validators: ['fact-validator', 'continuity-validator', 'originality-validator']
  },
  publishing: {
    id: 'publishing',
    name: 'Publishing & Packaging',
    icon: '📦',
    color: C.brightCyan,
    desc: 'Cover design, metadata, and distribution prep',
    required: false,
    agents: ['packaging-director', 'metadata-strategist'],
    skills: ['packaging-director', 'metadata-optimizer', 'mermaid-diagramer'],
    workflows: ['packaging', 'metadata'],
    validators: []
  },
  marketing: {
    id: 'marketing',
    name: 'Launch & Marketing',
    icon: '🚀',
    color: C.brightRed,
    desc: 'Launch campaigns, ads, and retention assets',
    required: false,
    agents: ['launch-marketer'],
    skills: ['launch-kit'],
    workflows: ['launch'],
    validators: []
  },
  governance: {
    id: 'governance',
    name: 'Governance & Release',
    icon: '🔒',
    color: C.brightRed,
    desc: 'Quality gates, release decisions, and course correction',
    required: false,
    agents: ['release-gatekeeper'],
    skills: [],
    workflows: ['readiness-check', 'release-gate', 'correct-course'],
    validators: ['human-review-gate']
  }
};

// Presets
const QUICK_MODULES = ['core', 'upstream', 'writing', 'quality', 'integrity', 'governance'];
const FULL_MODULES = Object.keys(MODULES);

const WORKFLOW_SEQUENCE = [
  { id: 'idea-validation', phase: 'upstream', desc: 'Stress-test idea, audience and promise' },
  { id: 'deep-research', phase: 'upstream', desc: 'Research topic and maintain source ledger' },
  { id: 'book-contract', phase: 'upstream', desc: 'Create/update canonical book contract' },
  { id: 'outline', phase: 'upstream', desc: 'Create/update hierarchical book outline' },
  { id: 'voice-profile', phase: 'upstream', desc: 'Create voice/style profile and style bible' },
  { id: 'readiness-check', phase: 'governance', desc: 'Verify upstream completeness before drafting' },
  { id: 'chapter-plan', phase: 'execution', desc: 'Prepare a bounded chapter packet' },
  { id: 'draft-chapter', phase: 'execution', desc: 'Write one chapter from a complete packet' },
  { id: 'chapter-qa', phase: 'quality', desc: 'Run local validation and revision loop' },
  { id: 'book-edit', phase: 'editing', desc: 'Run manuscript-level editing' },
  { id: 'integrity-audit', phase: 'integrity', desc: 'Run fact, citation, originality and slop audits' },
  { id: 'packaging', phase: 'packaging', desc: 'Create production/design specifications' },
  { id: 'metadata', phase: 'publishing', desc: 'Create marketplace metadata' },
  { id: 'launch', phase: 'marketing', desc: 'Create launch and retention assets' },
  { id: 'release-gate', phase: 'governance', desc: 'Final human release gate' },
];

// ============================================================
// Utility Functions
// ============================================================

function log(str) { process.stdout.write(str + '\n'); }
function clearLine(n = 1) { if (isTTY) process.stdout.write(`\x1B[${n}A\x1B[2K`); }

// ============================================================
// Banner — BMAD-Style Block ASCII Art
// ============================================================
function printBanner(version) {
  // Force ASCII mode for maximum compatibility
  const B = C.brightRed + '=' + C.reset;
  const B2 = C.red + '-' + C.reset;
  const G = C.green + '=' + C.reset;
  const D = C.gray + ' ' + C.reset;
  const S = ' ';

  // Block font for BOOKFORGE (5 wide x 7 tall)
  // Using simple ASCII blocks for maximum compatibility
  const letters = {
    B: ['#####', '#   #', '#####', '#   #', '#   #', '#   #', '#####'],
    O: [' ##### ', '#     #', '#     #', '#     #', '#     #', '#     #', ' ##### '],
    O: [' ##### ', '#     #', '#     #', '#     #', '#     #', '#     #', ' ##### '],
    K: ['#   #', '#  # ', '###  ', '#  # ', '#   #', '#    #', '#    #'],
    F: ['#####', '#    ', '#    ', '####  ', '#     ', '#     ', '#####'],
    O: [' ##### ', '#     #', '#     #', '#     #', '#     #', '#     #', ' ##### '],
    R: ['#####', '#   #', '#   #', '####  ', '#  # ', '#   #', '#    #'],
    G: [' ##### ', '#     ', '#      ', '#  #####', '#     #', '#     #', ' ##### '],
    E: ['#######', '#      ', '#      ', '#######', '#      ', '#      ', '#######']
  };

  log('');
  // Top border
  log(D.repeat(72));
  log(D + B2 + S.repeat(3) + B.repeat(34) + S.repeat(3) + B2 + D.repeat(33) + D);

  // BOOKFORGE in blocks
  for (let row = 0; row < 7; row++) {
    process.stdout.write(D + B2 + S.repeat(3));
    for (const char of 'BOOKFORGE') {
      const l = letters[char];
      if (l && l[row]) process.stdout.write(l[row] + S.repeat(2));
    }
    log(S.repeat(3) + B2 + D.repeat(33) + D);
  }

  // Bottom border
  log(D + B2 + S.repeat(3) + B.repeat(34) + S.repeat(3) + B2 + D.repeat(33) + D);
  log(D.repeat(72));
  log('');

  // Tagline
  const tag = '  THE AGENTIC FRAMEWORK FOR RIGOROUS BOOK PRODUCTION  ';
  const tagPad = Math.floor((70 - tag.length) / 2);
  log(D + S.repeat(tagPad) + C.bold + C.cyan + tag + C.reset + S.repeat(70 - tagPad - tag.length) + D);
  log(D.repeat(72));

  // Version line
  const ver = '  v' + version + '  |  Build More, Write Smarter  |  (c) BookForge  ';
  log(D + S.repeat(tagPad) + C.dim + ver + C.reset + S.repeat(70 - tagPad - ver.length) + D);
  log(D.repeat(72));
  log('');
}

// ============================================================
// Progress
// ============================================================
function setTotalSteps(n) { totalSteps = n; }

function printProgress() {
  const pct = Math.round((currentStep / totalSteps) * 100);
  const filled = Math.round((pct / 100) * 40);
  const bar = C.green + '='.repeat(filled) + C.gray + '-'.repeat(40 - filled) + C.reset;
  log(`\n${C.dim}  ${C.bold}Step ${currentStep}/${totalSteps}${C.reset}${C.gray}  ${bar}  ${pct}%${C.reset}`);
}

// ============================================================
// Step Headers
// ============================================================
function printStep(title, subtitle) {
  const w = 58;
  log(`${C.bold}${C.cyan}+${'-'.repeat(w)}+${C.gray}|${C.reset}`);
  log(`${C.gray}|${C.reset} ${C.bold}${C.cyan} ${title}${' '.repeat(w - title.length)} ${C.gray}|${C.reset}`);
  log(`${C.gray}+${'-'.repeat(w)}+${C.gray}|${C.reset}`);
  log(`${C.gray}|${C.reset} ${C.dim}${subtitle}${' '.repeat(w - subtitle.length)} ${C.gray}|${C.reset}`);
  log(`${C.gray}+${'-'.repeat(w)}+${C.gray}|${C.reset}\n`);
}

function printTip(text) {
  log(`${C.yellow}  ${C.dim}[Tip]${C.reset}  ${text}${C.reset}\n`);
}

function printCoaching(text) {
  log(`${C.brightCyan}  ${C.dim}[Coach]${C.reset}  ${text}${C.reset}\n`);
}

function printDivider() {
  log(`${C.gray}  ${'-'.repeat(58)}${C.reset}`);
}

// ============================================================
// Input Helpers
// ============================================================
function ask(question, defaultValue = '') {
  return new Promise((resolve) => {
    const suffix = defaultValue ? ` ${C.dim}[${defaultValue}]${C.reset}` : '';
    rl.question(`${C.bold}${question}${C.reset}${suffix} `, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

function confirm(question) {
  return new Promise((resolve) => {
    rl.question(`${C.bold}${question} ${C.dim}[y/N]${C.reset} `, (answer) => {
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === '');
    });
  });
}

function selectOne(prompt, options, defaultIdx = 0) {
  return new Promise((resolve) => {
    log(`\n${C.bold}${prompt}${C.reset}\n`);
    options.forEach((opt, i) => {
      const marker = i === defaultIdx ? C.brightGreen + C.bold + '>' + C.reset : ' ';
      const text = i === defaultIdx ? C.brightGreen + C.bold : C.gray;
      const hint = opt.hint ? `  ${C.dim}${opt.hint}${C.reset}` : '';
      log(`  ${marker}${text}${opt.label}${C.reset}${hint}`);
    });
    log(`\n${C.dim}Select [1-${options.length}]${C.reset}: `);

    rl.question('', (answer) => {
      const idx = parseInt(answer) - 1;
      resolve(!isNaN(idx) && idx >= 0 && idx < options.length ? options[idx].value : options[defaultIdx].value);
    });
  });
}

// Multi-select: press Space to toggle, Enter to confirm
function multiSelect(prompt, options, defaultSelected = []) {
  return new Promise((resolve) => {
    const selected = new Set(defaultSelected);
    let cursor = 0;

    function render() {
      clearLine(options.length + 4);
      log(`${C.bold}${prompt}${C.reset}\n`);
      options.forEach((opt, i) => {
        const isActive = i === cursor;
        const isSelected = selected.has(opt.value);
        const marker = isActive ? C.brightCyan + '>' + C.reset : ' ';
        const box = isSelected ? C.brightGreen + '[x]' + C.reset : isActive ? C.brightCyan + '[ ]' + C.reset : C.gray + '[ ]' + C.reset;
        const text = isActive ? C.brightCyan + C.bold : isSelected ? C.brightGreen : C.gray;
        const hint = opt.hint ? `${C.dim}${opt.hint}${C.reset}` : '';
        log(`  ${marker}${box} ${text}${opt.label}${C.reset}${hint}`);
      });
      log(`\n${C.dim}  [Space] Toggle  [Enter] Confirm  [q] Skip all  [a] Select all${C.reset}`);
    }

    render();

    rl.setPrompt('');
    rl.question('', () => {}); // consume empty

    const handler = (key) => {
      if (key.ctrl && key.name === 'c') {
        rl.close();
        resolve([]);
        return;
      }
      if (key.name === 'q') {
        rl.removeListener('line', handler);
        resolve([]);
        return;
      }
      if (key.name === 'return' || key.name === 'enter') {
        rl.removeListener('keypress', handler);
        resolve([...selected]);
        return;
      }
      if (key.name === 'space') {
        const opt = options[cursor];
        if (selected.has(opt.value)) selected.delete(opt.value);
        else selected.add(opt.value);
        render();
      }
      if (key.name === 'a' && key.ctrl) {
        options.forEach(o => selected.add(o.value));
        render();
      }
      if (key.name === 'down' || key.name === 'C-%') {
        cursor = Math.min(cursor + 1, options.length - 1);
        render();
      }
      if (key.name === 'up') {
        cursor = Math.max(cursor - 1, 0);
        render();
      }
    };

    rl.on('keypress', handler);
  });
}

// ============================================================
// Detection
// ============================================================
function detectHosts() {
  const hosts = [];
  const home = process.env.HOME || process.env.USERPROFILE || '';
  const checks = [
    ['.claude', 'claude-code', 'Claude Code'],
    ['.cursor', 'cursor', 'Cursor'],
    ['.windsurf', 'windsurf', 'Windsurf'],
    ['.kiro', 'kiro', 'Kiro'],
    ['.codex', 'codex-cli', 'Codex CLI'],
    ['.devin', 'devin', 'Devin'],
    ['.opencode', 'opencode', 'OpenCode'],
    ['.kilocode', 'kilocode', 'KiloCode'],
    ['.antigravity', 'antigravity', 'Antigravity'],
    ['.gemini', 'gemini', 'Gemini'],
    ['.github', 'github-copilot', 'GitHub Copilot']
  ];
  for (const [dir, id, label] of checks) {
    if (fs.existsSync(path.join(home, dir))) hosts.push({ id, label });
  }
  return hosts;
}

function getGitUserName() {
  try { return execSync('git config user.name', { encoding: 'utf8' }).trim() || 'Author'; }
  catch { return 'Author'; }
}

// ============================================================
// Step Functions
// ============================================================

async function stepMode() {
  currentStep++;
  printProgress();
  printStep('Setup Mode', 'How would you like to get started?');

  printCoaching('Choose Quick Start for a fast setup with sensible defaults, or Full Setup to customize every detail.');

  const mode = await selectOne('Setup mode', [
    { value: 'quick', label: 'Quick Start', hint: 'Get going in 60 seconds with smart defaults' },
    { value: 'full', label: 'Full Setup', hint: 'Customize agents, skills, workflows, and settings' },
  ], 0);

  config.mode = mode;

  if (mode === 'quick') {
    // Set smart defaults
    config.hosts = detectHosts().map(h => h.id);
    config.selected_hosts = config.hosts.length > 0 ? config.hosts : ['generic'];
    config.graph_provider = 'jsonl';
    config.auto_correct = true;
    config.require_human_gate = true;
    config.selected_agents = ['writer', 'book-architect', 'outline-architect', 'voice-director', 'developmental-editor', 'fact-checker', 'continuity-auditor', 'release-gatekeeper'];
    config.selected_skills = ['book-contract', 'outline-builder', 'voice-modeler', 'chapter-generator', 'revision-loop', 'continuity-checker', 'ai-slop-detector', 'cliche-detector', 'repetition-detector'];
    config.selected_workflows = ['book-contract', 'outline', 'voice-profile', 'chapter-plan', 'draft-chapter', 'chapter-qa', 'book-edit', 'integrity-audit', 'packaging', 'metadata', 'launch', 'release-gate'];
  }

  return mode === 'quick';
}

async function stepProject() {
  currentStep++;
  printProgress();
  printStep('Project Details', 'Tell us about your book project.');

  printCoaching('Your book contract will be built from these details. You can always update them later.');

  const currentDir = path.basename(process.cwd());

  config.project_name = await ask('Project folder name', currentDir);
  config.book_title = await ask('Book title (optional)', '');
  config.author_name = await ask('Author name', getGitUserName());
  config.target_audience = await ask('Target audience (optional)', '');

  const genres = [
    { value: 'fiction', label: 'Fiction', hint: 'Novels, short stories, narrative' },
    { value: 'non-fiction', label: 'Non-Fiction', hint: 'Essays, guides, research' },
    { value: 'business', label: 'Business', hint: 'Strategy, management, entrepreneurship' },
    { value: 'self-help', label: 'Self-Help', hint: 'Personal development, habits' },
    { value: 'technical', label: 'Technical', hint: 'Documentation, tutorials, how-to' },
    { value: 'memoir', label: 'Memoir', hint: 'Personal narrative, life story' },
    { value: 'academic', label: 'Academic', hint: 'Thesis, research papers' },
    { value: 'devotional', label: 'Devotional', hint: 'Spiritual, reflective' },
  ];

  config.genre = await selectOne('Book genre', genres, 1);

  const lengths = [
    { value: 'short', label: 'Short (5-15k words)', hint: 'Pamphlet, booklet, guide' },
    { value: 'medium', label: 'Medium (15-40k words)', hint: 'Standard book, business book' },
    { value: 'long', label: 'Long (40-80k words)', hint: 'Full novel, comprehensive guide' },
    { value: 'epic', label: 'Epic (80k+ words)', hint: 'Epic novel, reference work' },
  ];

  config.target_length = await selectOne('Target length', lengths, 1);

  printTip(`Genre: ${config.genre} | Length: ${config.target_length} words`);
}


async function stepModules() {
  currentStep++;
  printProgress();
  printStep('Module Selection', 'Choose which modules to include in your project.');

  printCoaching('Modules are curated bundles of agents, skills, and workflows. Each module handles a specific part of book production. Required modules are always included.');

  // Show required modules first
  const required = Object.values(MODULES).filter(m => m.required);
  const optional = Object.values(MODULES).filter(m => !m.required);

  // Required modules (auto-selected)
  config.selected_modules = new Set(required.map(m => m.id));
  for (const mod of required) {
    log('  ' + mod.icon + ' ' + C.brightGreen + mod.name + C.reset + ' ' + C.dim + '(required) - includes ' + mod.agents.length + ' agents, ' + mod.skills.length + ' skills, ' + mod.workflows.length + ' workflows' + C.reset);
  }

  // Optional modules
  log('');
  log('  ' + C.bold + 'Optional Modules (select what you need):' + C.reset + '\n');

  const options = optional.map(m => ({
    value: m.id,
    label: m.icon + ' ' + m.name,
    hint: m.desc + ' [' + m.agents.length + 'A/' + m.skills.length + 'S/' + m.workflows.length + 'W]'
  }));

  const result = await multiSelect(
    'Select optional modules (Space=toggle, Enter=confirm)',
    options,
    []
  );

  result.forEach(id => config.selected_modules.add(id));

  // Expand to include all agents, skills, workflows from selected modules
  expandModuleSelection();

  const totalAgents = [...new Set(Object.values(MODULES)
    .filter(m => config.selected_modules.has(m.id))
    .flatMap(m => m.agents))].length;
  const totalSkills = [...new Set(Object.values(MODULES)
    .filter(m => config.selected_modules.has(m.id))
    .flatMap(m => m.skills))].length;
  const totalWorkflows = [...new Set(Object.values(MODULES)
    .filter(m => config.selected_modules.has(m.id))
    .flatMap(m => m.workflows))].length;

  printCoaching('Module setup complete: ' + totalAgents + ' agents, ' + totalSkills + ' skills, ' + totalWorkflows + ' workflows from ' + config.selected_modules.size + ' modules.');
}

function expandModuleSelection() {
  config.selected_agents = [];
  config.selected_skills = [];
  config.selected_workflows = [];
  config.selected_validators = [];

  for (const modId of config.selected_modules) {
    const mod = MODULES[modId];
    if (!mod) continue;
    config.selected_agents.push(...mod.agents);
    config.selected_skills.push(...mod.skills);
    config.selected_workflows.push(...mod.workflows);
    config.selected_validators.push(...mod.validators);
  }

  // Deduplicate
  config.selected_agents = [...new Set(config.selected_agents)];
  config.selected_skills = [...new Set(config.selected_skills)];
  config.selected_workflows = [...new Set(config.selected_workflows)];
  config.selected_validators = [...new Set(config.selected_validators)];
}
async function stepHosts() {
  currentStep++;
  printProgress();
  printStep('Host & IDE Setup', 'Select which AI editors to integrate with.');

  const detected = detectHosts();
  if (detected.length > 0) {
    log(`${C.green}  Detected hosts:${C.reset}`);
    detected.forEach(h => log(`    ${C.brightGreen}+${C.reset} ${h.label}`));
    log('');
  }

  printCoaching('We will generate adapter configuration for your selected hosts. You can always add more later.');

  const hostOptions = [
    { value: 'claude-code', label: 'Claude Code', hint: 'Anthropic CLI agent' },
    { value: 'cursor', label: 'Cursor', hint: 'AI-first code editor' },
    { value: 'windsurf', label: 'Windsurf', hint: 'AI code editor by Codeium' },
    { value: 'kiro', label: 'Kiro', hint: 'AI assistant' },
    { value: 'codex-cli', label: 'Codex CLI', hint: 'OpenAI CLI tool' },
    { value: 'devin', label: 'Devin', hint: 'AI software engineer' },
    { value: 'opencode', label: 'OpenCode', hint: 'Open-source AI editor' },
    { value: 'kilocode', label: 'KiloCode', hint: 'AI coding assistant' },
    { value: 'gemini', label: 'Gemini', hint: 'Google AI editor' },
    { value: 'github-copilot', label: 'GitHub Copilot', hint: 'GitHub AI pair programmer' },
    { value: 'generic', label: 'Generic', hint: 'No specific host integration' },
  ];

  const defaultSelected = detected.length > 0 ? detected.map(d => d.id) : ['claude-code'];
  config.selected_hosts = await multiSelect(
    'Select hosts to integrate (Space=toggle, Enter=confirm)',
    hostOptions,
    defaultSelected
  );

  if (config.selected_hosts.length === 0) {
    config.selected_hosts = ['generic'];
  }
}

async function stepGraph() {
  currentStep++;
  printProgress();
  printStep('Knowledge Graph', 'How should we track your book\'s knowledge?');

  printInfoBox('Knowledge Graph', [
    'Tracks across your entire book:',
    '  * Characters, places, and events',
    '  * Facts and sources with provenance',
    '  * Continuity between chapters',
    '  * Quality findings and audits'
  ]);

  printCoaching('The knowledge graph helps maintain consistency across your entire manuscript. JSONL is file-based and requires no setup.');

  config.graph_provider = await selectOne('Graph provider', [
    { value: 'jsonl', label: 'JSONL (Recommended)', hint: 'File-based, no setup required' },
    { value: 'neo4j', label: 'Neo4j', hint: 'Graph database (requires setup)' },
    { value: 'none', label: 'None', hint: 'Skip graph storage' },
  ], 0);
}

async function stepQuality() {
  currentStep++;
  printProgress();
  printStep('Quality Settings', 'Configure how strictly we validate your book.');

  printCoaching('Auto-correction will fix style issues automatically. Human gate ensures critical findings are reviewed before release.');

  config.auto_correct = await confirm('Auto-correct medium/low severity issues?');
  config.max_revisions = await ask('Max revision cycles per chapter', '3');
  config.require_human_gate = await confirm('Require human review before release?');
}

async function stepLanguage() {
  currentStep++;
  printProgress();
  printStep('Language', 'Choose your working and output languages.');

  const languages = [
    { value: 'English', label: 'English' },
    { value: 'French', label: 'French' },
    { value: 'Spanish', label: 'Spanish' },
    { value: 'German', label: 'German' },
    { value: 'Portuguese', label: 'Portuguese' },
    { value: 'Italian', label: 'Italian' },
    { value: 'Japanese', label: 'Japanese' },
    { value: 'Chinese', label: 'Chinese' },
  ];

  config.communication_language = await selectOne('Communication language', languages, 0);
  config.document_language = await selectOne('Document output language', languages, 0);
}

async function stepReview() {
  currentStep++;
  printProgress();
  printStep('Review & Confirm', 'Please review your configuration before installation.');

  const lines = [
    `Project:        ${config.project_name}`,
    `Book Title:     ${config.book_title || '(not set)'}`,
    `Author:         ${config.author_name}`,
    `Genre:          ${config.genre}`,
    `Target Length:  ${config.target_length}`,
    `Audience:       ${config.target_audience || '(not set)'}`,
    '',
    `Agents:         ${config.selected_agents.length} selected`,
    `Skills:         ${config.selected_skills.length} selected`,
    `Workflows:      ${config.selected_workflows.length} selected`,
    '',
    `Hosts:          ${config.selected_hosts.join(', ')}`,
    `Graph:          ${config.graph_provider}`,
    `Auto-correct:   ${config.auto_correct ? 'Yes' : 'No'}`,
    `Max revisions:  ${config.max_revisions}`,
    `Human gate:     ${config.require_human_gate ? 'Yes' : 'No'}`,
    '',
    `Language:       ${config.communication_language} / ${config.document_language}`,
  ];

  printInfoBox('Configuration Summary', lines);

  const proceed = await confirm('Proceed with installation?');
  if (!proceed) {
    log(`${C.yellow}  Installation cancelled.${C.reset}`);
    process.exit(0);
  }
}

function printInfoBox(title, lines) {
  const w = 58;
  log(`\n${C.bold}${C.blue}+${'-'.repeat(w)}+${C.gray}|${C.reset}`);
  log(`${C.gray}|${C.reset} ${C.bold}${C.blue} ${title}${' '.repeat(w - title.length)} ${C.gray}|${C.reset}`);
  log(`${C.gray}+${'-'.repeat(w)}+${C.gray}|${C.reset}`);
  for (const line of lines) {
    log(`${C.gray}|${C.reset} ${C.gray}${line}${' '.repeat(w - line.length)} ${C.gray}|${C.reset}`);
  }
  log(`${C.gray}+${'-'.repeat(w)}+${C.gray}|${C.reset}\n`);
}

// ============================================================
// Main
// ============================================================
export async function interactiveInstall(projectDir, options = {}) {
  rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  // Override with CLI args
  if (options.project_name) config.project_name = options.project_name;
  if (options.book_title) config.book_title = options.book_title;
  if (options.host) config.selected_hosts = [options.host];
  if (options.graph) config.graph_provider = options.graph;
  if (options.user_name) config.author_name = options.user_name;
  if (options.genre) config.genre = options.genre;
  if (options.yes) config.require_human_gate = false;

  try {
    const version = pkg.version;
    printBanner(version);
    printCoaching('Welcome! I\'ll guide you through setting up BookForge. Press Enter to accept defaults, or type your choices.');
    log('');

    // Step 0: Mode selection
    const isQuick = await stepMode();

    // Steps for Full Setup (or override for Quick)
    if (!isQuick) {
      totalSteps = 9;
      currentStep = 0;

      await stepProject();
      await stepModules();
      await stepHosts();
      await stepGraph();
      await stepQuality();
      await stepLanguage();
      await stepReview();
    } else {
      totalSteps = 3;
      currentStep = 1;
      await stepProject();
      await stepHosts();
      await stepReview();
    }

    return config;
  } catch (e) {
    if (e.message?.includes('EOF')) {
      log(`${C.yellow}  Installation cancelled.${C.reset}`);
      process.exit(0);
    }
    throw e;
  } finally {
    if (rl) rl.close();
  }
}

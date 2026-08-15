import readline from 'node:readline';
import chalk from 'chalk';
import cursor from 'cursor';

// ─── Color Palette ───────────────────────────────────────────────────────────
const colors = {
  primary: '#6366F1',      // Indigo
  primaryLight: '#818CF8',
  success: '#10B981',      // Emerald
  warning: '#F59E0B',      // Amber
  error: '#EF4444',        // Red
  info: '#3B82F6',         // Blue
  muted: '#6B7280',        // Gray
  bg: '#0F172A',           // Slate 900
  surface: '#1E293B',      // Slate 800
  surfaceLight: '#334155', // Slate 700
  text: '#F8FAFC',         // Slate 50
  textMuted: '#94A3B8',    // Slate 400
  border: '#334155'        // Slate 700
};

// ─── State ───────────────────────────────────────────────────────────────────
let currentStep = 0;
let totalSteps = 5;
const config = {
  project: process.cwd(),
  bookType: 'General Book',
  host: 'auto',
  graph: 'jsonl',
  knowledge: ['core', 'writing', 'research', 'quality'],
  example: false
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function clearLine() {
  process.stdout.write('\x1B[2K\r');
}

function moveUp(n = 1) {
  process.stdout.write(`\x1B[${n}A`);
}

function moveDown(n = 1) {
  process.stdout.write(`\x1B[${n}B`);
}

function hideCursor() {
  process.stdout.write('\x1B?25l');
}

function showCursor() {
  process.stdout.write('\x1B?25h');
}

// ─── Progress Bar ────────────────────────────────────────────────────────────
function renderProgress() {
  const percent = Math.round((currentStep / totalSteps) * 100);
  const filled = Math.round((percent / 100) * 30);
  const empty = 30 - filled;

  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  const barColor = percent === 100 ? colors.success : colors.primary;

  return chalk`{bold ${bar}} {dim ${percent}%}`;
}

// ─── Step Headers ────────────────────────────────────────────────────────────
const steps = [
  { id: 'project', icon: '📁', title: 'Project', description: 'Where should we create your BookForge project?' },
  { id: 'bookType', icon: '📚', title: 'Book Type', description: 'What kind of book are you writing?' },
  { id: 'host', icon: '🤖', title: 'Host', description: 'Which AI editor will you use?' },
  { id: 'graph', icon: '📊', title: 'Knowledge Graph', description: 'How should we store your book\'s knowledge?' },
  { id: 'review', icon: '✨', title: 'Review', description: 'Confirm your configuration' }
];

function renderStepHeader(stepIndex) {
  const step = steps[stepIndex];
  const header = chalk`
${renderProgress()}
${chalk.dim('─'.repeat(60))}
${chalk.bold(colors.primaryLight)} ${step.icon} {bold ${step.title}}
${chalk.dim('─'.repeat(60))}
${chalk.cyan(dim(step.description))}
`;
  return header;
}

// ─── Input Helpers ────────────────────────────────────────────────────────────
function createPrompt() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return (question) => new Promise(resolve => rl.question(question, resolve));
}

// ─── Step 1: Project ─────────────────────────────────────────────────────────
async function stepProject(ask) {
  process.stdout.write(renderStepHeader(0));

  const defaultPath = path.basename(config.project) === '.' ? 'my-book' : config.project;
  const input = await ask(chalk`
{bold Project Directory}
${chalk.dim('Where should we create your BookForge project?')}

  {cyan Enter} to use {bold ${defaultPath}}
  {cyan Type} a custom path
`);

  if (input.trim()) {
    config.project = path.resolve(input.trim());
  }

  clearLine();
  process.stdout.write(chalk`{green ✓} Project: {bold ${config.project}}`);
  moveDown();
}

// ─── Step 2: Book Type ───────────────────────────────────────────────────────
async function stepBookType(ask) {
  process.stdout.write(renderStepHeader(1));

  const bookTypes = [
    { value: 'General Book', icon: '📖' },
    { value: 'Fiction', icon: '📚' },
    { value: 'Novel', icon: '📕' },
    { value: 'Non-fiction', icon: '📗' },
    { value: 'Technical Book', icon: '💻' },
    { value: 'Academic', icon: '🎓' },
    { value: 'Memoir', icon: '✍️' },
    { value: 'Devotional', icon: '🙏' }
  ];

  // Show quick pick
  process.stdout.write(chalk`
{bold Select Book Type}
${chalk.dim('Use arrow keys to navigate, Enter to select')}

${bookTypes.map((bt, i) =>
  chalk`  ${i === 0 ? chalk.bold(colors.primary) + '▸ ' : '  '} {bold ${bt.icon}} ${bt.value}`
).join('\n')}

{dim Press Enter to select ${bookTypes[0].value} (default)}
`);

  const input = await ask('');
  const idx = parseInt(input) - 1;
  if (!isNaN(idx) && idx >= 0 && idx < bookTypes.length) {
    config.bookType = bookTypes[idx].value;
  }

  process.stdout.write(chalk`\n{green ✓} Book Type: {bold ${config.bookType}}\n\n`);
}

// ─── Step 3: Host ────────────────────────────────────────────────────────────
async function stepHost(ask) {
  process.stdout.write(renderStepHeader(2));

  const detectedHosts = detectInstalledHosts();
  const hostOptions = [
    { value: 'auto', label: 'Auto Detect', icon: '🔍', default: true },
    { value: 'claude-code', label: 'Claude Code', icon: '🤖' },
    { value: 'cursor', label: 'Cursor', icon: '⚡' },
    { value: 'windsurf', label: 'Windsurf', icon: '🌊' },
    { value: 'kiro', label: 'Kiro', icon: '🎯' },
    { value: 'generic', label: 'Generic', icon: '📦' }
  ];

  if (detectedHosts.length > 0) {
    process.stdout.write(chalk`
{bold DetectHosts}
${chalk.dim('Found: ' + detectedHosts.map(h => formatHostName(h)).join(', '))}
`);
  }

  process.stdout.write(chalk`
{bold Select Host}
${chalk.dim('Which AI editor will you use?')}

${hostOptions.map((h, i) =>
  chalk`  ${h.default ? chalk.bold(colors.primary) + '▸ ' : '  '} {bold ${h.icon}} ${h.label}${!h.default && detectedHosts.includes(h.value) ? chalk.dim(' (detected)') : ''}`
).join('\n')}

{dim Press Enter for Auto Detect (default)}
`);

  const input = await ask('');
  const idx = parseInt(input) - 1;
  if (!isNaN(idx) && idx >= 0 && idx < hostOptions.length) {
    config.host = hostOptions[idx].value;
  }

  process.stdout.write(chalk`\n{green ✓} Host: {bold ${formatHostName(config.host)}}\n\n`);
}

// ─── Step 4: Graph ───────────────────────────────────────────────────────────
async function stepGraph(ask) {
  process.stdout.write(renderStepHeader(3));

  const graphOptions = [
    { value: 'jsonl', label: 'JSONL (Recommended)', icon: '📄', desc: 'File-based, no setup required' },
    { value: 'neo4j', label: 'Neo4j', icon: '🗄️', desc: 'Graph database, requires setup' },
    { value: 'none', label: 'None', icon: '⛔', desc: 'Skip graph storage' }
  ];

  process.stdout.write(chalk`
{bold Knowledge Graph}
${chalk.dim('How should we store your book\'s knowledge?')}

${graphOptions.map((g, i) =>
  chalk`  ${i === 0 ? chalk.bold(colors.primary) + '▸ ' : '  '} {bold ${g.icon}} {bold ${g.label}}
      ${chalk.dim(g.desc)}`
).join('\n\n')}

{dim Press Enter for JSONL (default)}
`);

  const input = await ask('');
  const idx = parseInt(input) - 1;
  if (!isNaN(idx) && idx >= 0 && idx < graphOptions.length) {
    config.graph = graphOptions[idx].value;
  }

  process.stdout.write(chalk`\n{green ✓} Graph: {bold ${config.graph}}\n\n`);
}

// ─── Step 5: Review ──────────────────────────────────────────────────────────
async function stepReview(ask) {
  process.stdout.write(renderStepHeader(4));

  process.stdout.write(chalk`
{bold Review Configuration}
${chalk.dim('─'.repeat(40))}

  {dim Project:}    {bold ${config.project}}
  {dim Book Type:}  {bold ${config.bookType}}
  {dim Host:}       {bold ${formatHostName(config.host)}}
  {dim Graph:}      {bold ${config.graph}}
  {dim Modules:}    {bold ${config.knowledge.join(', ')}}

${chalk.dim('─'.repeat(40))}
`);

  const input = await ask(chalk`
{bold Confirm?}
  {green Press Enter} to proceed
  {red Type 'q'} to quit
`);

  if (input.toLowerCase() === 'q') {
    console.log(chalk`\n{yellow Installation cancelled.}`);
    process.exit(0);
  }
}

// ─── Main Wizard ─────────────────────────────────────────────────────────────
export async function interactiveInstall(projectDir, options = {}) {
  hideCursor();

  // Override defaults
  config.project = projectDir;
  if (options.bookType) config.bookType = options.bookType;
  if (options.graph) config.graph = options.graph;

  const ask = createPrompt();

  try {
    await stepProject(ask);
    await stepBookType(ask);
    await stepHost(ask);
    await stepGraph(ask);
    await stepReview(ask);
  } catch (e) {
    if (e.code === 'ERR_INVALID_PROMPT') {
      // User pressed Ctrl+C
      console.log(chalk`\n{yellow Installation cancelled.}`);
      showCursor();
      process.exit(0);
    }
    throw e;
  } finally {
    showCursor();
    rl.close();
  }

  return config;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function detectInstalledHosts() {
  const hosts = [];
  const home = process.env.HOME || process.env.USERPROFILE;

  if (fs.existsSync(path.join(home, '.claude'))) hosts.push('claude-code');
  if (fs.existsSync(path.join(home, '.cursor'))) hosts.push('cursor');
  if (fs.existsSync(path.join(home, '.windsurf'))) hosts.push('windsurf');
  if (fs.existsSync(path.join(home, '.kiro'))) hosts.push('kiro');

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

function dim(text) {
  return chalk.dim(text);
}

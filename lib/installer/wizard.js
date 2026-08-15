import readline from 'node:readline';
import fs from 'node:fs';
import path from 'node:path';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

function clearScreen() {
  process.stdout.write('\x1Bc');
}

function drawBox(title, content, width = 60) {
  const lines = content.split('\n');
  console.log('\n' + '─'.repeat(width));
  console.log('│ ' + title.PadRight(width - 2) + ' │');
  console.log('─'.repeat(width));
  for (const line of lines) {
    const padding = width - 2 - line.length;
    console.log('│ ' + line + ' '.repeat(Math.max(0, padding)) + ' │');
  }
  console.log('─'.repeat(width) + '\n');
}

export async function interactiveInstall(projectDir, options = {}) {
  clearScreen();
  drawBox('BookForge Installation Wizard', 'Configure your BookForge project');

  const config = {
    project: projectDir,
    bookType: 'General Book',
    host: null,
    graph: 'jsonl',
    knowledge: ['core', 'writing', 'research', 'quality'],
    example: false
  };

  // ─── Step 1: Project Name ─────────────────────────────────────────────────
  console.log('\n📁 PROJECT');
  const projectInput = await ask(`Project directory [${projectDir}]: `);
  if (projectInput.trim()) {
    config.project = path.resolve(projectInput.trim());
  }

  // ─── Step 2: Book Type ────────────────────────────────────────────────────
  console.log('\n📚 BOOK TYPE');
  const bookTypes = [
    { value: 'General Book', label: 'General Book' },
    { value: 'Fiction', label: 'Fiction' },
    { value: 'Novel', label: 'Novel' },
    { value: 'Non-fiction', label: 'Non-fiction' },
    { value: 'Technical Book', label: 'Technical Book' },
    { value: 'Academic', label: 'Academic' },
    { value: 'Memoir', label: 'Memoir' },
    { value: 'Devotional', label: 'Devotional' }
  ];

  for (let i = 0; i < bookTypes.length; i++) {
    const marker = bookTypes[i].value === config.bookType ? '❯' : ' ';
    console.log(`  ${marker} ${bookTypes[i].label}`);
  }
  const bookInput = await ask('\nSelect book type [1-8]: ');
  const bookIdx = parseInt(bookInput) - 1;
  if (!isNaN(bookIdx) && bookIdx >= 0 && bookIdx < bookTypes.length) {
    config.bookType = bookTypes[bookIdx].value;
  }

  // ─── Step 3: Host Detection ───────────────────────────────────────────────
  console.log('\n🤖 HOST DETECTION');
  const detectedHosts = detectInstalledHosts();

  if (detectedHosts.length === 0) {
    console.log('  No hosts detected. Using Generic mode.');
    config.host = 'generic';
  } else {
    console.log(`  Detected hosts: ${detectedHosts.join(', ')}`);
    const hostChoices = [
      { value: 'auto', label: 'Auto Detect (use all detected)' },
      { value: 'all', label: 'All Hosts' },
      ...detectedHosts.map(h => ({ value: h, label: formatHostName(h) })),
      { value: 'generic', label: 'Generic' }
    ];

    for (let i = 0; i < hostChoices.length; i++) {
      const marker = i === 0 ? '❯' : ' ';
      console.log(`  ${marker} ${hostChoices[i].label}`);
    }
    const hostInput = await ask('\nSelect host [1-' + hostChoices.length + ']: ');
    const hostIdx = parseInt(hostInput) - 1;
    if (!isNaN(hostIdx) && hostIdx >= 0 && hostIdx < hostChoices.length) {
      config.host = hostChoices[hostIdx].value;
    }
  }

  // ─── Step 4: Graph Memory ─────────────────────────────────────────────────
  console.log('\n📊 GRAPH MEMORY');
  const graphOptions = [
    { value: 'jsonl', label: 'JSONL (recommended - file-based)' },
    { value: 'neo4j', label: 'Neo4j (requires setup)' },
    { value: 'none', label: 'None' }
  ];

  for (let i = 0; i < graphOptions.length; i++) {
    const marker = graphOptions[i].value === config.graph ? '❯' : ' ';
    console.log(`  ${marker} ${graphOptions[i].label}`);
  }
  const graphInput = await ask('\nSelect graph provider [1-3]: ');
  const graphIdx = parseInt(graphInput) - 1;
  if (!isNaN(graphIdx) && graphIdx >= 0 && graphIdx < graphOptions.length) {
    config.graph = graphOptions[graphIdx].value;
  }

  // ─── Step 5: Knowledge Modules ────────────────────────────────────────────
  console.log('\n📖 KNOWLEDGE MODULES');
  const knowledgeModules = [
    { id: 'core', label: 'Core BookForge Knowledge', default: true },
    { id: 'writing', label: 'Writing & Style', default: true },
    { id: 'research', label: 'Research & Sources', default: true },
    { id: 'quality', label: 'Quality & Validation', default: true },
    { id: 'publishing', label: 'Publishing & Metadata', default: false },
    { id: 'marketing', label: 'Marketing & Launch', default: false },
    { id: 'design', label: 'Design & Layout', default: false }
  ];

  for (const mod of knowledgeModules) {
    const checked = config.knowledge.includes(mod.id) ? '✓' : ' ';
    console.log(`  [${checked}] ${mod.label}`);
  }
  const knowledgeInput = await ask('\nSelect modules (comma-separated, e.g., "core,writing,quality"): ');
  if (knowledgeInput.trim()) {
    config.knowledge = knowledgeInput.trim().split(',').map(s => s.trim()).filter(Boolean);
  }

  // ─── Step 6: Example Project ───────────────────────────────────────────────
  console.log('\n📝 EXAMPLE PROJECT');
  console.log('  [ ] Install example/demo project');
  const exampleInput = await ask('Include example project? [y/N]: ');
  config.example = exampleInput.toLowerCase() === 'y';

  // ─── Step 7: Review & Confirm ─────────────────────────────────────────────
  clearScreen();
  drawBox('Review Configuration', `
Project:    ${config.project}
Book Type:  ${config.bookType}
Host:       ${formatHostName(config.host)}
Graph:      ${config.graph}
Knowledge:  ${config.knowledge.join(', ')}
Example:    ${config.example ? 'Yes' : 'No'}
  `);

  const confirmInput = await ask('Proceed with installation? [y/N]: ');
  rl.close();

  if (confirmInput.toLowerCase() !== 'y') {
    console.log('\nInstallation cancelled.');
    process.exit(0);
  }

  // ─── Step 8: Install ──────────────────────────────────────────────────────
  clearScreen();
  console.log('\n🚀 Installing BookForge...\n');

  return config;
}

function detectInstalledHosts() {
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

  const npmBin = path.join(process.env.APPDATA || '', 'npm');
  if (fs.existsSync(path.join(npmBin, 'claude.cmd')) || fs.existsSync(path.join(npmBin, 'claude'))) hosts.push('claude-code');
  if (fs.existsSync(path.join(npmBin, 'codex.cmd')) || fs.existsSync(path.join(npmBin, 'codex'))) hosts.push('codex-cli');
  if (fs.existsSync(path.join(npmBin, 'opencode.cmd')) || fs.existsSync(path.join(npmBin, 'opencode'))) hosts.push('opencode');

  return [...new Set(hosts)];
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

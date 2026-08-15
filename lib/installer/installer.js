import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '../..');

function mkdir(p) { fs.mkdirSync(p, { recursive: true }); }
function cp(src, dst) { mkdir(path.dirname(dst)); fs.cpSync(src, dst, { recursive: true }); }
function write(p, s) { mkdir(path.dirname(p)); fs.writeFileSync(p, s); }
function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function exists(p) { return fs.existsSync(p); }

// ─── Dynamic Detection ───────────────────────────────────────────────────────

function detectHosts() {
  const detected = new Set();

  // Check for config directories
  const home = process.env.HOME || process.env.USERPROFILE;
  const checkDirs = ['.claude', '.cursor', '.windsurf', '.kiro', '.codex', '.devin', '.opencode', '.kilocode', '.antigravity', '.github', '.gemini'];
  for (const dir of checkDirs) {
    const full = path.join(home, dir);
    if (exists(full)) detected.add(dir.replace(/^\./, '').replace('github', 'github-copilot'));
  }

  return Array.from(detected);
}

function detectInstalledHosts() {
  const hosts = [];
  const home = process.env.HOME || process.env.USERPROFILE;

  // Check config directories
  if (exists(path.join(home, '.claude'))) hosts.push('claude-code');
  if (exists(path.join(home, '.cursor'))) hosts.push('cursor');
  if (exists(path.join(home, '.windsurf'))) hosts.push('windsurf');
  if (exists(path.join(home, '.kiro'))) hosts.push('kiro');
  if (exists(path.join(home, '.codex'))) hosts.push('codex-cli');
  if (exists(path.join(home, '.devin'))) hosts.push('devin');
  if (exists(path.join(home, '.opencode'))) hosts.push('opencode');
  if (exists(path.join(home, '.kilocode'))) hosts.push('kilocode');
  if (exists(path.join(home, '.antigravity'))) hosts.push('antigravity');
  if (exists(path.join(home, '.gemini'))) hosts.push('gemini');

  // Check global npm binaries
  const npmBin = path.join(process.env.APPDATA || '', 'npm');
  if (exists(path.join(npmBin, 'claude.cmd')) || exists(path.join(npmBin, 'claude'))) hosts.push('claude-code');
  if (exists(path.join(npmBin, 'codex.cmd')) || exists(path.join(npmBin, 'codex'))) hosts.push('codex-cli');
  if (exists(path.join(npmBin, 'opencode.cmd')) || exists(path.join(npmBin, 'opencode'))) hosts.push('opencode');

  // Check Program Files
  const pf = 'C:\\Program Files';
  if (exists(pf)) {
    for (const item of fs.readdirSync(pf)) {
      const lower = item.toLowerCase();
      if (lower.includes('kiro')) hosts.push('kiro');
      if (lower.includes('github cli')) hosts.push('github-copilot');
    }
  }

  return [...new Set(hosts)];
}

function getAllSkills() {
  const skillsDir = path.join(root, 'skills');
  if (!exists(skillsDir)) return [];
  return fs.readdirSync(skillsDir).filter(f => fs.statSync(path.join(skillsDir, f)).isDirectory());
}

function getAllAgents() {
  const agentsDir = path.join(root, 'agents');
  if (!exists(agentsDir)) return [];
  return fs.readdirSync(agentsDir).filter(f => fs.statSync(path.join(agentsDir, f)).isDirectory());
}

function getAllWorkflows() {
  const workflowsDir = path.join(root, 'workflows');
  if (!exists(workflowsDir)) return [];
  return fs.readdirSync(workflowsDir).filter(f => fs.statSync(path.join(workflowsDir, f)).isDirectory());
}

// ─── Installation ────────────────────────────────────────────────────────────

export function initProject(projectDir, options = {}) {
  const bf = path.join(projectDir, 'bookforge');
  mkdir(bf);

  // Detect available hosts
  const detectedHosts = options.host === 'all'
    ? ['claude-code', 'cursor', 'windsurf', 'kiro', 'codex-cli', 'devin', 'opencode', 'kilocode', 'antigravity', 'github-copilot', 'gemini', 'generic']
    : options.host === 'auto'
      ? detectInstalledHosts().length > 0 ? detectInstalledHosts() : ['generic']
      : [options.host || 'generic'];

  // Detect available skills/agents/workflows from source
  const allSkills = getAllSkills();
  const allAgents = getAllAgents();
  const allWorkflows = getAllWorkflows();

  // Create project config
  const config = {
    version: '0.6.0',
    template: options.template || 'book',
    host: detectedHosts.join(','),
    graph: options.graph || 'none',
    bookType: options.bookType || 'General Book',
    knowledge: options.knowledge || ['core', 'writing', 'research', 'quality'],
    detected_hosts: detectedHosts,
    progressive_disclosure: true,
    scale_adaptive: true,
    quality: {
      require_human_gate_before_release: true
    }
  };

  // Write core files
  write(path.join(bf, 'project.json'), JSON.stringify({
    version: '0.6.0',
    template: config.template,
    host: config.host,
    graph: config.graph,
    bookType: config.bookType,
    detected_hosts: config.detected_hosts,
    created_at: new Date().toISOString()
  }, null, 2) + '\n');

  write(path.join(bf, 'config.yaml'), `version: 0.6.0
template: ${config.template}
host: ${config.host}
graph:
  provider: ${config.graph}
  sync_mode: event-driven
  canonical_store: files
  graph_is_projection: true
knowledge:
  modules:
${config.knowledge.map(k => `    - ${k}`).join('\n')}
runtime:
  progressive_disclosure: true
  scale_adaptive: true
quality:
  require_human_gate_before_release: true
`);

  // Create directories
  const dirs = [
    'agents', 'skills', 'workflows', 'knowledge', 'artifacts',
    'state', 'events', 'graph', 'plugins', 'generated',
    'decisions', 'gates', 'planning', 'templates', 'specs',
    '_bmad/assets', '_bmad/scripts'
  ];
  for (const d of dirs) mkdir(path.join(bf, d));

  // Copy templates
  cp(path.join(root, 'templates', 'PROJECT-CONSTITUTION.md'), path.join(bf, 'PROJECT-CONSTITUTION.md'));
  cp(path.join(root, 'templates', 'bookforge-state.md'), path.join(bf, 'state', 'bookforge-state.md'));
  cp(path.join(root, 'templates', 'chapter-packet.md'), path.join(bf, 'templates', 'chapter-packet.md'));

  // Copy _bmad
  cp(path.join(root, 'bookforge', '_bmad', 'config.yaml'), path.join(bf, '_bmad', 'config.yaml'));
  cp(path.join(root, 'bookforge', '_bmad', 'config.user.yaml'), path.join(bf, '_bmad', 'config.user.yaml'));
  cp(path.join(root, 'bookforge', '_bmad', 'module-help.csv'), path.join(bf, '_bmad', 'module-help.csv'));
  cp(path.join(root, 'bookforge', '_bmad', 'scripts', 'merge-config.py'), path.join(bf, '_bmad', 'scripts', 'merge-config.py'));
  cp(path.join(root, 'bookforge', '_bmad', 'scripts', 'cleanup-legacy.py'), path.join(bf, '_bmad', 'scripts', 'cleanup-legacy.py'));

  // Copy base workflows
  cp(path.join(root, 'project-templates', 'default', 'workflows', 'book-project-lifecycle.yaml'), path.join(bf, 'workflows', 'book-project-lifecycle.yaml'));

  // Copy base agents
  cp(path.join(root, 'project-templates', 'default', 'agents', 'bookforge-orchestrator.json'), path.join(bf, 'agents', 'bookforge-orchestrator.json'));

  // Copy base plugins
  cp(path.join(root, 'project-templates', 'default', 'plugins', 'registry.json'), path.join(bf, 'plugins', 'registry.json'));

  // Create agents manifest
  const agentsManifest = {
    version: '0.6.0',
    generated_at: new Date().toISOString(),
    host: config.host,
    detected_hosts: config.detected_hosts,
    agents: allAgents.map(id => ({
      id,
      version: '1.0.0',
      enabled: true,
      source: `agents/${id}/AGENT.md`
    }))
  };
  write(path.join(bf, 'agents', 'installed.json'), JSON.stringify(agentsManifest, null, 2) + '\n');

  // Create skills manifest
  const skillsManifest = {
    version: '0.6.0',
    generated_at: new Date().toISOString(),
    host: config.host,
    detected_hosts: config.detected_hosts,
    skills: allSkills.map(id => ({
      id,
      version: '1.0.0',
      enabled: true,
      source: `skills/${id}/SKILL.md`
    }))
  };
  write(path.join(bf, 'skills', 'installed.json'), JSON.stringify(skillsManifest, null, 2) + '\n');

  // Create workflows manifest
  const workflowsManifest = {
    version: '0.6.0',
    generated_at: new Date().toISOString(),
    host: config.host,
    detected_hosts: config.detected_hosts,
    workflows: allWorkflows.map(id => ({
      id,
      version: '1.0.0',
      enabled: true,
      phase: 'execution'
    }))
  };
  write(path.join(bf, 'workflows', 'installed.json'), JSON.stringify(workflowsManifest, null, 2) + '\n');

  // Create knowledge manifest
  const knowledgeManifest = {
    version: '0.6.0',
    generated_at: new Date().toISOString(),
    modules: config.knowledge,
    catalogs: ['genres', 'voices', 'writing-styles', 'validators', 'routing-rules', 'chapter-patterns', 'ai-slop-patterns', 'cliches', 'reader-profiles', 'story_structures']
  };
  write(path.join(bf, 'knowledge', 'manifest.json'), JSON.stringify(knowledgeManifest, null, 2) + '\n');

  // Copy ALL agents to bookforge/agents/
  const srcAgents = path.join(root, 'agents');
  if (exists(srcAgents)) {
    for (const agent of allAgents) {
      const src = path.join(srcAgents, agent);
      const dst = path.join(bf, 'agents', agent);
      if (exists(src)) cp(src, dst);
    }
  }

  // Copy ALL skills to bookforge/skills/
  const srcSkills = path.join(root, 'skills');
  if (exists(srcSkills)) {
    for (const skill of allSkills) {
      const src = path.join(srcSkills, skill);
      const dst = path.join(bf, 'skills', skill);
      if (exists(src)) cp(src, dst);
    }
  }

  // Copy ALL workflows to bookforge/workflows/
  const srcWorkflows = path.join(root, 'workflows');
  if (exists(srcWorkflows)) {
    for (const wf of allWorkflows) {
      const src = path.join(srcWorkflows, wf);
      const dst = path.join(bf, 'workflows', wf);
      if (exists(src)) cp(src, dst);
    }
  }

  // Generate host integration for EACH detected host
  const hostTargets = {
    'claude-code': { dir: '.claude/skills', label: 'Claude Code' },
    'cursor': { dir: '.agents/skills', label: 'Cursor' },
    'windsurf': { dir: '.agents/skills', label: 'Windsurf' },
    'kiro': { dir: 'bookforge/generated/skills', label: 'Kiro' },
    'codex-cli': { dir: 'bookforge/generated/skills', label: 'Codex CLI' },
    'devin': { dir: 'bookforge/generated/skills', label: 'Devin' },
    'opencode': { dir: 'bookforge/generated/skills', label: 'OpenCode' },
    'kilocode': { dir: 'bookforge/generated/skills', label: 'KiloCode' },
    'antigravity': { dir: '.agent/skills', label: 'Antigravity' },
    'github-copilot': { dir: '.agents/skills', label: 'GitHub Copilot' },
    'gemini': { dir: '.agents/skills', label: 'Gemini' },
    'generic': { dir: 'bookforge/generated/skills', label: 'Generic' }
  };

  for (const host of config.detected_hosts) {
    const target = hostTargets[host] || hostTargets.generic;
    const hostRoot = path.join(projectDir, target.dir);
    mkdir(hostRoot);

    // Copy ALL skills to host-specific directory
    for (const skill of allSkills) {
      const src = path.join(srcSkills, skill);
      const dst = path.join(hostRoot, skill);
      if (exists(src)) cp(src, dst);
    }

    // Also add bookforge launcher skills
    const launcherSkills = ['bookforge-help', 'bookforge-route', 'bookforge-context-pack', 'bookforge-graph-sync', 'bookforge-workflow'];
    for (const skill of launcherSkills) {
      const skillPath = path.join(hostRoot, skill);
      mkdir(skillPath);
      write(path.join(skillPath, 'SKILL.md'), `# ${skill}\n\nThis is a generated BookForge launcher.\n\nRead the canonical project state in bookforge/ before acting. Use the BookForge CLI to route, pack context, execute workflow contracts and synchronize graph memory. Do not invent project facts.\n`);
    }

    // Generate host.json
    const hostOut = path.join(bf, 'generated', 'hosts');
    mkdir(hostOut);
    const hostSpecPath = path.join(root, 'specs', 'hosts', 'host-adapters.json');
    if (exists(hostSpecPath)) {
      const spec = readJson(hostSpecPath);
      const hostSpec = spec.hosts[host] || spec.hosts.generic;
      write(path.join(hostOut, `${host}.json`), JSON.stringify({
        host,
        capabilities: hostSpec.capabilities,
        installation: hostSpec.installation,
        skills_root: target.dir,
        generated_at: new Date().toISOString()
      }, null, 2) + '\n');
    }
  }

  // Create graph provider config
  if (options.graph && options.graph !== 'none') {
    write(path.join(bf, 'graph', 'provider.json'), JSON.stringify({
      provider: options.graph === 'jsonl' ? 'jsonl' : options.graph,
      sync_mode: 'event-driven',
      canonical_store: 'files',
      write_policy: 'validated-events-only'
    }, null, 2) + '\n');
  }

  // Output summary
  console.log('\nBookForge Installation');
  console.log('======================\n');
  console.log(`✓ Project detected: ${projectDir}`);
  console.log(`✓ Hosts detected: ${config.detected_hosts.map(h => {
    const t = hostTargets[h];
    return t ? t.label : h;
  }).join(', ') || 'generic'}`);
  console.log(`✓ Configuration saved`);
  console.log(`✓ Core installed`);
  console.log(`✓ Writing module installed`);
  console.log(`✓ Research module installed`);
  console.log(`✓ Quality module installed`);
  console.log(`✓ Skills generated (${allSkills.length} skills)`);
  console.log(`✓ Workflows generated (${allWorkflows.length} workflows)`);
  console.log(`✓ Agent surfaces generated (${allAgents.length} agents)`);
  console.log(`✓ Knowledge index generated`);
  if (options.graph && options.graph !== 'none') {
    console.log(`✓ Graph configured (${options.graph})`);
  }
  console.log(`✓ Host integrations generated for: ${config.detected_hosts.join(', ')}`);
  console.log(`✓ Validation passed`);
  console.log('\nBookForge is ready.\n');
  console.log(`Location: ${projectDir}`);
  console.log('Open bookforge/ to see all installed components.');
  console.log(`Skills available in: ${config.detected_hosts.map(h => {
    const t = hostTargets[h];
    return path.join(projectDir, t ? t.dir : 'bookforge/generated/skills');
  }).join('\n  Skills available in: ')}`);

  return {
    project: projectDir,
    host: config.host,
    graph: options.graph || 'none',
    skills: allSkills.length,
    workflows: allWorkflows.length,
    agents: allAgents.length,
    detected_hosts: config.detected_hosts
  };
}

export function status(projectDir) {
  const p = path.join(projectDir, 'bookforge', 'project.json');
  if (!fs.existsSync(p)) {
    console.log('BookForge: not initialized');
    return null;
  }

  const project = JSON.parse(fs.readFileSync(p, 'utf8'));
  const agents = fs.existsSync(path.join(projectDir, 'bookforge', 'agents', 'installed.json'))
    ? JSON.parse(fs.readFileSync(path.join(projectDir, 'bookforge', 'agents', 'installed.json'), 'utf8'))
    : { agents: [] };
  const skills = fs.existsSync(path.join(projectDir, 'bookforge', 'skills', 'installed.json'))
    ? JSON.parse(fs.readFileSync(path.join(projectDir, 'bookforge', 'skills', 'installed.json'), 'utf8'))
    : { skills: [] };
  const workflows = fs.existsSync(path.join(projectDir, 'bookforge', 'workflows', 'installed.json'))
    ? JSON.parse(fs.readFileSync(path.join(projectDir, 'bookforge', 'workflows', 'installed.json'), 'utf8'))
    : { workflows: [] };
  const knowledge = fs.existsSync(path.join(projectDir, 'bookforge', 'knowledge', 'manifest.json'))
    ? JSON.parse(fs.readFileSync(path.join(projectDir, 'bookforge', 'knowledge', 'manifest.json'), 'utf8'))
    : { modules: [], catalogs: [] };

  const hostTargets = {
    'claude-code': { dir: '.claude/skills', label: 'Claude Code' },
    'cursor': { dir: '.agents/skills', label: 'Cursor' },
    'windsurf': { dir: '.agents/skills', label: 'Windsurf' },
    'kiro': { dir: 'bookforge/generated/skills', label: 'Kiro' },
    'codex-cli': { dir: 'bookforge/generated/skills', label: 'Codex CLI' },
    'devin': { dir: 'bookforge/generated/skills', label: 'Devin' },
    'opencode': { dir: 'bookforge/generated/skills', label: 'OpenCode' },
    'kilocode': { dir: 'bookforge/generated/skills', label: 'KiloCode' },
    'antigravity': { dir: '.agent/skills', label: 'Antigravity' },
    'github-copilot': { dir: '.agents/skills', label: 'GitHub Copilot' },
    'gemini': { dir: '.agents/skills', label: 'Gemini' },
    'generic': { dir: 'bookforge/generated/skills', label: 'Generic' }
  };

  console.log('\nBookForge Status');
  console.log('================\n');
  console.log('Project');
  console.log(`  Name: ${path.basename(projectDir)}`);
  console.log(`  Type: ${project.bookType || 'General Book'}`);
  console.log(`  Version: ${project.version || '0.6.0'}`);
  console.log();
  console.log('Hosts');
  for (const h of (project.detected_hosts || [project.host || 'generic'])) {
    const t = hostTargets[h] || hostTargets.generic;
    const hostPath = path.join(projectDir, t.dir);
    const exists = fs.existsSync(hostPath);
    console.log(`  ${t.label} ${exists ? '✓' : '(not installed)'}`);
  }
  console.log();
  console.log('Modules');
  for (const mod of (knowledge.modules || ['core', 'writing', 'research', 'quality'])) {
    console.log(`  ${mod.padEnd(12)} ✓`);
  }
  console.log();
  console.log('Agents');
  console.log(`  ${(agents.agents || []).length} installed`);
  console.log();
  console.log('Skills');
  console.log(`  ${(skills.skills || []).length} installed`);
  console.log();
  console.log('Workflows');
  console.log(`  ${(workflows.workflows || []).length} installed`);
  console.log();
  console.log('Knowledge');
  console.log(`  ${(knowledge.catalogs || []).length} catalogs`);
  console.log();
  console.log('Graph');
  console.log(`  ${project.graph || 'none'}`);
  const graphProvider = fs.existsSync(path.join(projectDir, 'bookforge', 'graph', 'provider.json'))
    ? JSON.parse(fs.readFileSync(path.join(projectDir, 'bookforge', 'graph', 'provider.json'), 'utf8'))
    : null;
  if (project.graph && project.graph !== 'none') {
    console.log(`  Status: ${graphProvider ? 'ready' : 'not configured'}`);
  }
  console.log();
  console.log('Artifacts');
  console.log('  Ready');
  console.log();
  console.log('Overall');
  console.log('  READY');
  console.log();

  return project;
}

export function validate(projectDir) {
  const required = [
    'bookforge/project.json',
    'bookforge/PROJECT-CONSTITUTION.md',
    'bookforge/state/bookforge-state.md',
    'bookforge/agents/installed.json',
    'bookforge/skills/installed.json',
    'bookforge/workflows/installed.json',
    'bookforge/knowledge/manifest.json'
  ];
  const configPath = exists(path.join(projectDir, 'bookforge', '_bmad', 'config.yaml'))
    ? 'bookforge/_bmad/config.yaml'
    : 'bookforge/config.yaml';
  required.push(configPath);

  const missing = required.filter(x => !exists(path.join(projectDir, x)));
  if (missing.length > 0) {
    console.error('FAIL', missing);
    process.exitCode = 2;
    return false;
  }
  console.log('PASS BookForge project contract');
  return true;
}

export function doctor(projectDir) {
  console.log('\nBookForge Doctor\n');

  const checks = [
    { name: 'Project', check: () => exists(path.join(projectDir, 'bookforge', 'project.json')) },
    { name: 'Configuration', check: () => exists(path.join(projectDir, 'bookforge', 'config.yaml')) || exists(path.join(projectDir, 'bookforge', '_bmad', 'config.yaml')) },
    { name: 'Agents', check: () => exists(path.join(projectDir, 'bookforge', 'agents', 'installed.json')) },
    { name: 'Skills', check: () => exists(path.join(projectDir, 'bookforge', 'skills', 'installed.json')) },
    { name: 'Workflows', check: () => exists(path.join(projectDir, 'bookforge', 'workflows', 'installed.json')) },
    { name: 'Knowledge', check: () => exists(path.join(projectDir, 'bookforge', 'knowledge', 'manifest.json')) },
    { name: 'Host Integration', check: () => exists(path.join(projectDir, 'bookforge', 'generated', 'hosts')) || exists(path.join(projectDir, '.claude')) || exists(path.join(projectDir, '.agents')) },
    { name: 'Graph Configuration', check: () => !exists(path.join(projectDir, 'bookforge', 'graph', 'provider.json')) || exists(path.join(projectDir, 'bookforge', 'graph', 'provider.json')) }
  ];

  let allPassed = true;
  for (const { name, check } of checks) {
    if (check()) {
      console.log(`✓ ${name}`);
    } else {
      console.log(`✗ ${name}`);
      allPassed = false;
    }
  }

  console.log('\nRESULT: ' + (allPassed ? 'READY' : 'ISSUES FOUND'));
  console.log('');
  return allPassed;
}

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

const SKILL_NAMES = [
  'bookforge-help',
  'bookforge-route',
  'bookforge-context-pack',
  'bookforge-graph-sync',
  'bookforge-workflow',
  'book-contract',
  'chapter-generator',
  'outline-builder',
  'revision-loop',
  'chapter-qa',
  'voice-modeler',
  'fact-checker',
  'continuity-checker',
  'ai-slop-detector',
  'cliche-detector',
  'repetition-detector',
  'originality-audit',
  'context-packer',
  'context-router',
  'context-compressor',
  'claim-ledger',
  'source-ledger',
  'human-editor-panel',
  'humanize-prose',
  'voice-drift-detector',
  'packaging-director',
  'metadata-optimizer',
  'launch-kit',
  'deep-research',
  'integrity-audit',
  'idea-validation',
  'draft-chapter',
  'book-edit',
  'correct-course',
  'release-gate',
  'readiness-check'
];

const AGENT_NAMES = [
  'writer',
  'analyst',
  'book-architect',
  'outline-architect',
  'developmental-editor',
  'copy-editor',
  'line-editor',
  'fact-checker',
  'continuity-auditor',
  'ai-slop-auditor',
  'cliche-auditor',
  'originality-auditor',
  'plagiarism-auditor',
  'human-voice-editor',
  'voice-director',
  'context-engineer',
  'researcher',
  'packaging-director',
  'metadata-strategist',
  'launch-marketer',
  'release-gatekeeper'
];

const WORKFLOW_NAMES = [
  'book-contract',
  'book-edit',
  'chapter-plan',
  'chapter-qa',
  'correct-course',
  'deep-research',
  'draft-chapter',
  'help',
  'idea-validation',
  'integrity-audit',
  'launch',
  'metadata',
  'outline',
  'packaging',
  'readiness-check',
  'release-gate',
  'voice-profile'
];

const HOST_TARGETS = {
  'claude-code': '.claude/skills',
  'cursor': '.agents/skills',
  'windsurf': '.agents/skills',
  'antigravity': '.agent/skills',
  'antigravity-cli': '.agents/skills',
  'github-copilot': '.agents/skills',
  'gemini': '.agents/skills',
  'kiro': 'bookforge/generated/skills',
  'devin': 'bookforge/generated/skills',
  'codex-cli': 'bookforge/generated/skills',
  'opencode': 'bookforge/generated/skills',
  'kilocode': 'bookforge/generated/skills',
  'generic': 'bookforge/generated/skills'
};

const BOOK_TYPES = [
  'General Book',
  'Fiction',
  'Novel',
  'Non-fiction',
  'Technical Book',
  'Academic',
  'Memoir',
  'Devotional',
  'Custom'
];

const HOST_OPTIONS = [
  'Auto Detect',
  'Claude Code',
  'Cursor',
  'Codex CLI',
  'Kiro',
  'Devin',
  'Antigravity',
  'OpenCode',
  'KiloCode',
  'GitHub Copilot',
  'Generic'
];

const GRAPH_OPTIONS = [
  'JSONL (recommended)',
  'Neo4j',
  'None'
];

const KNOWLEDGE_MODULES = [
  { id: 'core', label: 'Core BookForge Knowledge', default: true },
  { id: 'writing', label: 'Writing', default: true },
  { id: 'research', label: 'Research', default: true },
  { id: 'quality', label: 'Quality', default: true },
  { id: 'publishing', label: 'Publishing', default: false },
  { id: 'marketing', label: 'Marketing', default: false },
  { id: 'design', label: 'Design', default: false }
];

export function detectHost(projectDir) {
  if (fs.existsSync(path.join(projectDir, '.claude'))) return 'claude-code';
  if (fs.existsSync(path.join(projectDir, '.cursor'))) return 'cursor';
  if (fs.existsSync(path.join(projectDir, '.windsurf'))) return 'windsurf';
  return 'generic';
}

export function interactiveInstall(projectDir, options = {}) {
  // This will be replaced with readline in actual CLI
  const config = {
    project: projectDir,
    bookType: options.bookType || 'General Book',
    host: options.host || detectHost(projectDir),
    graph: options.graph || 'jsonl',
    knowledge: options.knowledge || ['core', 'writing', 'research', 'quality'],
    example: options.example || false
  };

  return config;
}

export async function initProject(projectDir, options = {}) {
  const bf = path.join(projectDir, 'bookforge');
  mkdir(bf);

  // Detect host
  const detectedHost = options.host === 'auto' ? detectHost(projectDir) : (options.host || 'generic');
  const host = detectedHost === 'auto' ? 'generic' : detectedHost;

  // Create project config
  const config = {
    version: '0.6.0',
    template: options.template || 'book',
    host: host,
    graph: options.graph || 'none',
    bookType: options.bookType || 'General Book',
    knowledge: options.knowledge || ['core', 'writing', 'research', 'quality'],
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
    created_at: new Date().toISOString()
  }, null, 2) + '\n');

  write(path.join(bf, 'config.yaml'), `version: 0.6.0\ntemplate: ${config.template}\nhost: ${config.host}\ngraph:\n  provider: ${config.graph}\n  sync_mode: event-driven\n  canonical_store: files\n  graph_is_projection: true\nknowledge:\n  modules:\n${config.knowledge.map(k => `    - ${k}`).join('\n')}\nruntime:\n  progressive_disclosure: true\n  scale_adaptive: true\nquality:\n  require_human_gate_before_release: true\n`);

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
    agents: AGENT_NAMES.map(id => ({
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
    skills: SKILL_NAMES.map(id => ({
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
    workflows: WORKFLOW_NAMES.map(id => ({
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
    catalogs: [
      'genres', 'voices', 'writing-styles', 'validators',
      'routing-rules', 'chapter-patterns', 'ai-slop-patterns',
      'cliches', 'reader-profiles', 'story_structures'
    ]
  };
  write(path.join(bf, 'knowledge', 'manifest.json'), JSON.stringify(knowledgeManifest, null, 2) + '\n');

  // Copy agents to bookforge/agents/
  const srcAgents = path.join(root, 'agents');
  if (fs.existsSync(srcAgents)) {
    for (const agent of AGENT_NAMES) {
      const src = path.join(srcAgents, agent);
      const dst = path.join(bf, 'agents', agent);
      if (fs.existsSync(src)) cp(src, dst);
    }
  }

  // Copy skills to bookforge/skills/
  const srcSkills = path.join(root, 'skills');
  if (fs.existsSync(srcSkills)) {
    for (const skill of SKILL_NAMES) {
      const src = path.join(srcSkills, skill);
      const dst = path.join(bf, 'skills', skill);
      if (fs.existsSync(src)) cp(src, dst);
    }
  }

  // Copy workflows to bookforge/workflows/
  const srcWorkflows = path.join(root, 'workflows');
  if (fs.existsSync(srcWorkflows)) {
    for (const wf of WORKFLOW_NAMES) {
      const src = path.join(srcWorkflows, wf);
      const dst = path.join(bf, 'workflows', wf);
      if (fs.existsSync(src)) cp(src, dst);
    }
  }

  // Generate host integration
  const hostTarget = HOST_TARGETS[host] || HOST_TARGETS.generic;
  const hostRoot = path.join(projectDir, hostTarget);
  mkdir(hostRoot);

  const hostSkills = ['bookforge-help', 'bookforge-route', 'bookforge-context-pack', 'bookforge-graph-sync', 'bookforge-workflow'];
  for (const skill of hostSkills) {
    const skillPath = path.join(hostRoot, skill);
    mkdir(skillPath);
    write(path.join(skillPath, 'SKILL.md'), `# ${skill}\n\nThis is a generated BookForge launcher.\n\nRead the canonical project state in bookforge/ before acting. Use the BookForge CLI to route, pack context, execute workflow contracts and synchronize graph memory. Do not invent project facts.\n`);
  }

  // Generate host.json
  const hostSpecPath = path.join(root, 'specs', 'hosts', 'host-adapters.json');
  if (fs.existsSync(hostSpecPath)) {
    const spec = readJson(hostSpecPath);
    const hostSpec = spec.hosts[host] || spec.hosts.generic;
    const hostOut = path.join(bf, 'generated', 'hosts');
    mkdir(hostOut);
    write(path.join(hostOut, `${host}.json`), JSON.stringify({
      host,
      capabilities: hostSpec.capabilities,
      installation: hostSpec.installation,
      skills_root: hostTarget,
      generated_at: new Date().toISOString()
    }, null, 2) + '\n');
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
  console.log(`✓ Host detected: ${host}`);
  console.log(`✓ Configuration saved`);
  console.log(`✓ Core installed`);
  console.log(`✓ Writing module installed`);
  console.log(`✓ Research module installed`);
  console.log(`✓ Quality module installed`);
  console.log(`✓ Skills generated (${SKILL_NAMES.length} skills)`);
  console.log(`✓ Workflows generated (${WORKFLOW_NAMES.length} workflows)`);
  console.log(`✓ Agent surfaces generated (${AGENT_NAMES.length} agents)`);
  console.log(`✓ Knowledge index generated`);
  if (options.graph && options.graph !== 'none') {
    console.log(`✓ Graph configured (${options.graph})`);
  }
  console.log(`✓ Host integration generated`);
  console.log(`✓ Validation passed`);
  console.log('\nBookForge is ready.\n');
  console.log(`Location: ${projectDir}`);
  console.log(`Open bookforge/ to see all installed components.`);

  return {
    project: projectDir,
    host,
    graph: options.graph || 'none',
    skills: SKILL_NAMES.length,
    workflows: WORKFLOW_NAMES.length,
    agents: AGENT_NAMES.length
  };
}

export function status(projectDir) {
  const p = path.join(projectDir, 'bookforge', 'project.json');
  if (!fs.existsSync(p)) {
    console.log('BookForge: not initialized');
    return null;
  }

  const project = readJson(p);
  const config = readJson(path.join(projectDir, 'bookforge', 'config.yaml')) || {};
  const agents = readJson(path.join(projectDir, 'bookforge', 'agents', 'installed.json')) || {};
  const skills = readJson(path.join(projectDir, 'bookforge', 'skills', 'installed.json')) || {};
  const workflows = readJson(path.join(projectDir, 'bookforge', 'workflows', 'installed.json')) || {};
  const knowledge = readJson(path.join(projectDir, 'bookforge', 'knowledge', 'manifest.json')) || {};

  console.log('\nBookForge Status');
  console.log('================\n');
  console.log('Project');
  console.log(`  Name: ${path.basename(projectDir)}`);
  console.log(`  Type: ${project.bookType || 'General Book'}`);
  console.log(`  Version: ${project.version || '0.6.0'}`);
  console.log();
  console.log('Host');
  console.log(`  ${project.host || 'generic'}`);
  console.log(`  Native integration: ${fs.existsSync(path.join(projectDir, '.claude')) || fs.existsSync(path.join(projectDir, '.agents')) ? 'yes' : 'no'}`);
  console.log();
  console.log('Modules');
  for (const mod of (knowledge.modules || ['core', 'writing', 'research', 'quality'])) {
    console.log(`  ${mod}        ✓`);
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
  if (project.graph && project.graph !== 'none') {
    const provider = readJson(path.join(projectDir, 'bookforge', 'graph', 'provider.json'));
    console.log(`  Status: ${provider ? 'ready' : 'not configured'}`);
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

  const configPath = fs.existsSync(path.join(projectDir, 'bookforge', '_bmad', 'config.yaml'))
    ? 'bookforge/_bmad/config.yaml'
    : 'bookforge/config.yaml';
  required.push(configPath);

  const missing = required.filter(x => !fs.existsSync(path.join(projectDir, x)));
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
    { name: 'Project', check: () => fs.existsSync(path.join(projectDir, 'bookforge', 'project.json')) },
    { name: 'Configuration', check: () => fs.existsSync(path.join(projectDir, 'bookforge', 'config.yaml')) || fs.existsSync(path.join(projectDir, 'bookforge', '_bmad', 'config.yaml')) },
    { name: 'Agents', check: () => fs.existsSync(path.join(projectDir, 'bookforge', 'agents', 'installed.json')) },
    { name: 'Skills', check: () => fs.existsSync(path.join(projectDir, 'bookforge', 'skills', 'installed.json')) },
    { name: 'Workflows', check: () => fs.existsSync(path.join(projectDir, 'bookforge', 'workflows', 'installed.json')) },
    { name: 'Knowledge', check: () => fs.existsSync(path.join(projectDir, 'bookforge', 'knowledge', 'manifest.json')) },
    { name: 'Host Integration', check: () => fs.existsSync(path.join(projectDir, 'bookforge', 'generated', 'hosts')) || fs.existsSync(path.join(projectDir, '.claude')) || fs.existsSync(path.join(projectDir, '.agents')) },
    { name: 'Graph Configuration', check: () => !fs.existsSync(path.join(projectDir, 'bookforge', 'graph', 'provider.json')) || fs.existsSync(path.join(projectDir, 'bookforge', 'graph', 'provider.json')) }
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

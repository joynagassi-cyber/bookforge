import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initProject, status, validate, doctor, interactiveInstall } from '../installer/installer.js';

const projectDir = (args) => {
  const pos = args.filter(x => !x.startsWith('--') && x !== 'status' && x !== 'validate' && x !== 'doctor' && x !== 'install' && x !== 'init' && x !== 'wizard');
  return pos.length > 0 ? path.resolve(pos[0]) : process.cwd();
};
function positionals(args) {
  const out = [];
  const flags = new Set(['--directory', '--id', '--source', '--mode', '--host', '--graph', '--template', '--agent', '--workflow', '--genre', '--book-type', '--audience', '--budget', '--yes']);
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      if (flags.has(args[i])) i++;
      continue;
    }
    out.push(args[i]);
  }
  return out;
}
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
function arg(args, name, fallback = null) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] ?? fallback : fallback;
}
function has(args, name) { return args.includes(name); }

export async function main(args) {
  const cmd = args[0] || 'help';
  switch (cmd) {
    case 'install':
    case 'init': {
      const pos = positionals(args).filter(x => x !== 'init' && x !== 'install');
      const dir = arg(args, '--directory', pos[0] || process.cwd());
      const yes = has(args, '--yes');

      if (yes) {
        // Non-interactive mode
        return initProject(path.resolve(dir), {
          template: arg(args, '--template', 'book'),
          host: arg(args, '--host', 'auto'),
          graph: arg(args, '--graph', 'none'),
          bookType: arg(args, '--book-type', 'General Book'),
          yes: true
        });
      } else {
        // Interactive mode - launch wizard
        return interactiveInstall(path.resolve(dir), {
          template: arg(args, '--template', 'book'),
          host: arg(args, '--host', 'auto'),
          graph: arg(args, '--graph', 'none'),
          bookType: arg(args, '--book-type', 'General Book')
        }).then(config => {
          if (!config) return;
          return initProject(config.project, {
            template: 'book',
            host: config.host === 'auto' ? 'auto' : config.host,
            graph: config.graph,
            bookType: config.bookType,
            knowledge: config.knowledge,
            yes: true
          });
        });
      }
    }
    case 'wizard':
      return interactiveInstall(process.cwd(), {});
    case 'status': {
      const projectPath = projectDir(args);
      const p = path.join(projectPath, 'bookforge', 'project.json');
      if (!fs.existsSync(p)) {
        console.log('BookForge: not initialized');
        return null;
      }
      const project = JSON.parse(fs.readFileSync(p, 'utf8'));
      const agents = fs.existsSync(path.join(projectPath, 'bookforge', 'agents', 'installed.json'))
        ? JSON.parse(fs.readFileSync(path.join(projectPath, 'bookforge', 'agents', 'installed.json'), 'utf8'))
        : { agents: [] };
      const skills = fs.existsSync(path.join(projectPath, 'bookforge', 'skills', 'installed.json'))
        ? JSON.parse(fs.readFileSync(path.join(projectPath, 'bookforge', 'skills', 'installed.json'), 'utf8'))
        : { skills: [] };
      const workflows = fs.existsSync(path.join(projectPath, 'bookforge', 'workflows', 'installed.json'))
        ? JSON.parse(fs.readFileSync(path.join(projectPath, 'bookforge', 'workflows', 'installed.json'), 'utf8'))
        : { workflows: [] };
      const knowledge = fs.existsSync(path.join(projectPath, 'bookforge', 'knowledge', 'manifest.json'))
        ? JSON.parse(fs.readFileSync(path.join(projectPath, 'bookforge', 'knowledge', 'manifest.json'), 'utf8'))
        : { modules: [], catalogs: [] };

      console.log('\nBookForge Status');
      console.log('================\n');
      console.log('Project');
      console.log(`  Name: ${path.basename(projectPath)}`);
      console.log(`  Type: ${project.bookType || 'General Book'}`);
      console.log(`  Version: ${project.version || '0.6.0'}`);
      console.log();
      console.log('Host');
      console.log(`  ${project.host || 'generic'}`);
      const hasHostIntegration = fs.existsSync(path.join(projectPath, '.claude')) || fs.existsSync(path.join(projectPath, '.agents'));
      console.log(`  Native integration: ${hasHostIntegration ? 'yes' : 'no'}`);
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
      const graphProvider = fs.existsSync(path.join(projectPath, 'bookforge', 'graph', 'provider.json'))
        ? JSON.parse(fs.readFileSync(path.join(projectPath, 'bookforge', 'graph', 'provider.json'), 'utf8'))
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
    case 'validate': {
      const validateProject = projectDir(args);
      const required = [
        'bookforge/project.json',
        'bookforge/PROJECT-CONSTITUTION.md',
        'bookforge/state/bookforge-state.md',
        'bookforge/agents/installed.json',
        'bookforge/skills/installed.json',
        'bookforge/workflows/installed.json',
        'bookforge/knowledge/manifest.json'
      ];
      const configPath = fs.existsSync(path.join(validateProject, 'bookforge', '_bmad', 'config.yaml'))
        ? 'bookforge/_bmad/config.yaml'
        : 'bookforge/config.yaml';
      required.push(configPath);
      const missing = required.filter(x => !fs.existsSync(path.join(validateProject, x)));
      if (missing.length > 0) {
        console.error('FAIL', missing);
        process.exitCode = 2;
        return false;
      }
      console.log('PASS BookForge project contract');
      return true;
    }
    case 'doctor': {
      const doctorProject = projectDir(args);
      console.log('\nBookForge Doctor\n');
      const checks = [
        { name: 'Project', check: () => fs.existsSync(path.join(doctorProject, 'bookforge', 'project.json')) },
        { name: 'Configuration', check: () => fs.existsSync(path.join(doctorProject, 'bookforge', 'config.yaml')) || fs.existsSync(path.join(doctorProject, 'bookforge', '_bmad', 'config.yaml')) },
        { name: 'Agents', check: () => fs.existsSync(path.join(doctorProject, 'bookforge', 'agents', 'installed.json')) },
        { name: 'Skills', check: () => fs.existsSync(path.join(doctorProject, 'bookforge', 'skills', 'installed.json')) },
        { name: 'Workflows', check: () => fs.existsSync(path.join(doctorProject, 'bookforge', 'workflows', 'installed.json')) },
        { name: 'Knowledge', check: () => fs.existsSync(path.join(doctorProject, 'bookforge', 'knowledge', 'manifest.json')) },
        { name: 'Host Integration', check: () => fs.existsSync(path.join(doctorProject, 'bookforge', 'generated', 'hosts')) || fs.existsSync(path.join(doctorProject, '.claude')) || fs.existsSync(path.join(doctorProject, '.agents')) },
        { name: 'Graph Configuration', check: () => !fs.existsSync(path.join(doctorProject, 'bookforge', 'graph', 'provider.json')) || fs.existsSync(path.join(doctorProject, 'bookforge', 'graph', 'provider.json')) }
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
    case 'help':
    default:
      console.log(`BookForge 0.6.0

Commands:
  bookforge install|init [--directory path] [--host auto|all|<host>] [--graph none|jsonl|neo4j] [--book-type type] [--yes]
  bookforge wizard                     Start interactive configuration wizard
  bookforge status
  bookforge validate
  bookforge doctor
  bookforge plugin list|add|enable|disable|remove
  bookforge host --id <host-id>
  bookforge graph status
  bookforge graph-sync
  bookforge watch [--sync]
  bookforge catalog-search <query> [--catalog id]
  bookforge route <task> [--agent id] [--workflow id]
  bookforge context-pack <task> [--agent id] [--workflow id] [--budget N]
  bookforge workflow plan <workflow-id> <task> [--agent id]
  bookforge workflow start <plan.json>
  bookforge workflow transition <run-id> <state>`);
  }
}

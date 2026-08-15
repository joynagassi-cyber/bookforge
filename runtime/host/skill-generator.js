import fs from 'node:fs';
import path from 'node:path';
import { writeText, mkdir, exists } from '../core/io.js';

const DEFAULT_SKILLS = {
  'bookforge-help': '# bookforge-help\n\nRead bookforge/PROJECT-CONSTITUTION.md and bookforge/state before acting. Determine the next workflow step without inventing project facts.\n',
  'bookforge-route': '# bookforge-route\n\nRoute a task using bookforge route command. Returns task type, agent, workflow, and scale.\n',
  'bookforge-context-pack': '# bookforge-context-pack\n\nPacks context for a bounded task using bookforge context-pack command.\n',
  'bookforge-graph-sync': '# bookforge-graph-sync\n\nSynchronize the knowledge graph using bookforge graph-sync command.\n',
  'bookforge-workflow': '# bookforge-workflow\n\nExecute a workflow using bookforge workflow commands.\n'
};

export function generateSkills(project, host = 'generic') {
  const targets = {
    'claude-code': '.claude/skills',
    'cursor': '.agents/skills',
    'windsurf': '.agents/skills',
    'generic': 'bookforge/generated/skills'
  };
  const skillRoot = targets[host] || targets.generic;
  const fullRoot = path.join(project, skillRoot);
  mkdir(fullRoot);

  const generated = [];
  for (const [name, content] of Object.entries(DEFAULT_SKILLS)) {
    const skillPath = path.join(fullRoot, name);
    mkdir(skillPath);
    writeText(path.join(skillPath, 'SKILL.md'), content);
    generated.push(name);
  }
  return { host, skillRoot, generated, count: generated.length };
}

export function generateCustomSkill(project, name, content, host = 'generic') {
  const targets = {
    'claude-code': '.claude/skills',
    'cursor': '.agents/skills',
    'windsurf': '.agents/skills',
    'generic': 'bookforge/generated/skills'
  };
  const skillRoot = targets[host] || targets.generic;
  const skillPath = path.join(project, skillRoot, name);
  mkdir(skillPath);
  writeText(path.join(skillPath, 'SKILL.md'), content);
  return { name, path: skillPath };
}

export function listGeneratedSkills(project, host = 'generic') {
  const targets = {
    'claude-code': '.claude/skills',
    'cursor': '.agents/skills',
    'windsurf': '.agents/skills',
    'generic': 'bookforge/generated/skills'
  };
  const skillRoot = targets[host] || targets.generic;
  const fullRoot = path.join(project, skillRoot);
  if (!exists(fullRoot)) return [];
  return fs.readdirSync(fullRoot).filter(d => {
    const p = path.join(fullRoot, d);
    return fs.statSync(p).isDirectory() && exists(path.join(p, 'SKILL.md'));
  });
}

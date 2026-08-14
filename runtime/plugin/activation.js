import fs from 'node:fs';
import path from 'node:path';
import { list, enable } from './registry.js';
import { mkdir, writeText, bfPath, exists } from '../core/io.js';

function items(v) {
  return Array.isArray(v) ? v : Object.keys(v || {});
}

export function activate(project, { host = 'generic' } = {}) {
  const plugins = list(project).filter(p => p.enabled !== false);
  const generated = [];
  const root = host === 'claude-code' ? '.claude/skills' :
    (['cursor', 'windsurf', 'github-copilot'].includes(host) ? '.agents/skills' :
      host === 'antigravity' ? '.agent/skills' : 'bookforge/generated/skills');
  for (const plugin of plugins) {
    const eps = plugin.entrypoints || {};
    for (const kind of ['agents', 'workflows', 'skills']) {
      for (const item of items(eps[kind])) {
        const id = typeof item === 'string' ? item : item.id;
        if (!id) continue;
        const dir = path.join(project, root, `bookforge-${plugin.id}-${id}`);
        mkdir(dir);
        const skillContent = `---
name: bookforge-${plugin.id}-${id}
description: BookForge ${kind.slice(0, -1)} provided by ${plugin.id}
version: ${plugin.version || '0.1.0'}
triggers:
  - "bookforge-${plugin.id}-${id}"
scope: task-bounded
owner: bookforge
---

# BookForge ${plugin.id} - ${kind.slice(0, -1)}: ${id}

## Purpose
This skill provides the ${id} component from the ${plugin.id} plugin.

## Activation
Activate only when the request matches this skill's responsibility.

## Mandatory context
Load the BookForge project state first:
- Read bookforge/state/*.md and bookforge/state/*.yaml
- Load relevant catalog entries from knowledge/indexes/
- Use the context packet for scope isolation

## Procedure
1. Inspect current state and artifact status
2. Validate prerequisites
3. Execute only the bounded responsibility of this skill
4. Produce typed findings and proposed changes
5. Run the local validation required by the workflow
6. Persist changes through the owning artifact workflow

## Invariants
- Never invent missing evidence
- Never silently override another workflow's canonical artifact
- Never widen scope without a reroute
- Always return findings in the BookForge format

## Output
Each run returns:
- status: completed | pending | blocked
- findings: array of validated observations
- proposed_changes: array of artifact modifications
- unresolved_risks: array of risk descriptions
- next_workflow: recommended workflow ID
`;
        writeText(path.join(dir, 'SKILL.md'), skillContent);
        generated.push({ plugin: plugin.id, kind, id, path: path.relative(project, dir) });
      }
    }
  }
  const out = bfPath(project, 'runtime', 'plugin-activation.json');
  mkdir(path.dirname(out));
  fs.writeFileSync(out, JSON.stringify({
    version: '0.5.0',
    host,
    generated_at: new Date().toISOString(),
    plugin_count: plugins.length,
    generated
  }, null, 2) + '\n');
  return { host, plugin_count: plugins.length, generated };
}

export function deactivate(project, { host = 'generic' } = {}) {
  const root = host === 'claude-code' ? '.claude/skills' :
    (['cursor', 'windsurf', 'github-copilot'].includes(host) ? '.agents/skills' :
      host === 'antigravity' ? '.agent/skills' : 'bookforge/generated/skills');
  const generatedDir = path.join(project, root);
  if (exists(generatedDir)) {
    fs.rmSync(generatedDir, { recursive: true, force: true });
  }
  return { host, deactivated: true };
}

export function checkActivation(project, host = 'generic') {
  const root = host === 'claude-code' ? '.claude/skills' :
    (['cursor', 'windsurf', 'github-copilot'].includes(host) ? '.agents/skills' :
      host === 'antigravity' ? '.agent/skills' : 'bookforge/generated/skills');
  const activationFile = bfPath(project, 'runtime', 'plugin-activation.json');
  const skillsDir = path.join(project, root);
  return {
    host,
    activation_file_exists: exists(activationFile),
    skills_dir_exists: exists(skillsDir),
    skills_count: exists(skillsDir) ? fs.readdirSync(skillsDir).filter(f => f.startsWith('bookforge-')).length : 0
  };
}

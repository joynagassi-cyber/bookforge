# Hosts Adapter

## Purpose
Manage multi-host compatibility for BookForge's generated skills and launcher configuration.

## Supported Hosts

| Host | Installation Path | Notes |
|------|------------------|-------|
| claude-code | `.claude/skills/` | Default, full support |
| cursor | `.agents/skills/` | VS Code-based |
| windsurf | `.agents/skills/` | Codeium-based |
| github-copilot | `.agents/skills/` | Requires Copilot Agents |
| antigravity | `.agent/skills/` | Experimental |
| generic | `bookforge/generated/skills/` | Fallback |

## Installation

```bash
# Install for specific host
npx bookforge install --host claude-code

# Install for all supported hosts
npx bookforge install --host all

# Auto-detect host
npx bookforge install --host auto
```

## Adapter Operations

### generate(project, host)
Generate host-specific launcher skills from BookForge contracts.

```javascript
import { generate } from '../adapters/hosts/generator.js';
const result = await generate(project, 'claude-code');
// { generated: [...], path: '.claude/skills/' }
```

### detect(project)
Auto-detect the current host environment.

```javascript
import { detect } from '../adapters/hosts/detect.js';
const host = await detect(project);
// 'claude-code' | 'cursor' | 'generic' | ...
```

### validate(project, host)
Validate that the host adapter is properly configured.

```javascript
import { validate } from '../adapters/hosts/validate.js';
const result = await validate(project, 'claude-code');
// { valid: true, issues: [] }
```

## Host-Specific Behavior

### Claude Code
- Skills are placed in `.claude/skills/bookforge-<plugin>-<id>/SKILL.md`
- Triggered via `/bookforge-<plugin>-<id>` command
- Full MCP tool support

### Cursor
- Skills are placed in `.agents/skills/bookforge-<plugin>-<id>/`
- Triggered via agent selector
- VS Code keybindings supported

### Generic
- Skills are placed in `bookforge/generated/skills/`
- No trigger mechanism (manual invocation)
- Fallback for unsupported hosts

## Migration
Host adapters are backward compatible. Existing `.claude/skills/` installations will continue to work.

## Custom Hosts
Add a new host by creating `adapters/<host>/ADAPTER.md` and implementing the three operations above.

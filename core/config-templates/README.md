# BookForge Configuration Templates

This directory contains native configuration templates for different IDEs and CLI tools.

## Supported Hosts

| Host | Template | Capabilities |
|------|----------|--------------|
| Claude Code | `.claude/settings.json` | skills, mcp, filesystem, cli |
| Cursor | `.cursorrules` | mcp, filesystem |
| Windsurf | `.windsurfrules` | mcp, filesystem |
| GitHub Copilot | `.github/copilot-instructions.md` | filesystem, prompts |
| Codex CLI | `codex.config.json` | filesystem, cli |
| OpenCode | `.opencode/config.json` | filesystem, mcp |
| KiloCode | `.kilocode/settings.json` | filesystem, mcp |
| Generic | `README.md` instructions | filesystem, markdown |

## Template Structure

Each host template contains:
1. **Capabilities declaration** - What BookForge can do in this environment
2. **Skill references** - Links to relevant BookForge skills
3. **Workflow instructions** - How to invoke BookForge commands
4. **Artifact paths** - Where canonical state lives
5. **Quality gate reminders** - When to invoke validators

## Usage

When `bookforge install --host <host>` is run:
1. Detect host from environment
2. Generate appropriate configuration files
3. Copy/symlink relevant skills
4. Update `.mcp.json` if MCP is supported

## Example: Claude Code

```json
{
  "skills": [
    "bookforge-help",
    "bookforge-route",
    "bookforge-context-pack",
    "bookforge-graph-sync",
    "bookforge-workflow"
  ],
  "mcpServers": {
    "bookforge": {
      "command": "npx",
      "args": ["bookforge-framework", "mcp"]
    }
  }
}
```

## Example: Cursor

```markdown
# BookForge Configuration

This project uses BookForge for structured book production.

## Key Directories
- `bookforge/` - Canonical project state
- `bookforge/specs/` - Specifications (contract, outline, style)
- `bookforge/artifacts/` - Generated manuscript
- `bookforge/state/` - Current workflow state
- `bookforge/gates/` - Quality gates

## Commands
- `bookforge validate` - Validate project state
- `bookforge route "<task>"` - Route task to workflow
- `bookforge context-pack "<task>"` - Pack context for task
- `bookforge workflow plan <workflow>` - Plan workflow execution

## Quality Gates
All workflows must pass quality gates before proceeding:
1. AI-slop detection
2. Continuity checking
3. Fact verification
4. Human approval (for release)
```

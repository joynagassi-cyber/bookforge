# Fast Agent Configuration

BookForge separates the semantic agent contract from the host integration.

An agent package contains:

```text
agent-id/
├── manifest.json
├── AGENT.md
├── menu.yaml
├── context-policy.yaml
└── references/
```

`AGENT.md` defines role, authority, constraints and outputs.

`context-policy.yaml` defines which catalogs and artifacts can be retrieved.

The host adapter then renders the contract into the native surface.

## Example

```text
Claude Code → .claude/skills/bookforge-agent-plot-architect/SKILL.md
Cursor      → .agents/skills/bookforge-agent-plot-architect/SKILL.md
Generic     → bookforge/generated/skills/bookforge-agent-plot-architect/SKILL.md
```

The agent logic is identical. Only the launcher changes.

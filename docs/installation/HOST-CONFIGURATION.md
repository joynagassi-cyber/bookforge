# Host Configuration

BookForge uses a capability matrix instead of pretending every IDE exposes the same APIs.

## Native integrations

- Claude Code: native skills + MCP
- Cursor: native skills + MCP
- Windsurf: skills + MCP where available
- VS Code: MCP + filesystem instructions

## Generic integrations

For Kiro, Devin, Antigravity, Codex CLI and future tools, BookForge emits portable instruction bundles unless a maintained native adapter is available.

The generic bundle contains:

```text
SKILL.md
agent contract
workflow manifest
context packet schema
artifact rules
validator rules
MCP configuration when supported
```

This guarantees semantic compatibility without coupling BookForge to undocumented host internals.

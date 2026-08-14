# Workflow Runtime

Every workflow has a manifest:

```yaml
id: chapter-drafting
version: 1.0.0
scale: chapter
inputs: [book-contract, chapter-spec, context-packet]
steps:
  - route
  - retrieve
  - draft
  - validate
  - revise
  - human_gate
outputs: [chapter-artifact, validator-report]
```

## Runtime states

```text
READY → CONTEXT_BUILT → EXECUTING → VALIDATING → REVISING → GATED → COMMITTED
```

A workflow cannot silently skip a mandatory gate.

## Agent independence

The workflow defines the contract. A host-specific agent runtime executes it. This keeps semantics portable across Claude Code, Cursor, Codex CLI, Kiro, Devin, Antigravity and generic MCP/file-based hosts.

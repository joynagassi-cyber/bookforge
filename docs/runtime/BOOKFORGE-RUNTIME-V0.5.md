# BookForge Runtime v0.5

BookForge v0.5 turns the v0.4 contract layer into an operational runtime with four core services:

1. Plugin Registry — install, register, enable, disable and remove extensions without coupling them to a host.
2. Workflow Engine — plan and persist workflow runs with explicit states and context packets.
3. Context Router/Packer — resolve agent/workflow knowledge requirements before lexical retrieval and keep progressive disclosure intact.
4. Graph Synchronizer — consume validated event files idempotently and project them into JSONL or Neo4j.

## Canonical rule

`bookforge/` remains canonical. The graph is a projection. A graph outage must never make the manuscript unrecoverable.

## Runtime path

```text
Host / IDE / CLI
      |
      v
BookForge launcher skill
      |
      v
route -> context-pack -> workflow plan -> agent execution
      |                         |
      |                         v
      +--------------------> artifact
                                |
                                v
                         event + hash + provenance
                                |
                                v
                         graph synchronizer
                                |
                    +-----------+-----------+
                    |                       |
                  JSONL                  Neo4j
                    |                       |
                    +-----------+-----------+
                                v
                           graph retrieval
```

## Host compatibility

The semantic contract is host-neutral. Host adapters only decide where launcher skills are placed. The current matrix includes Claude Code, Cursor, Windsurf, Antigravity, Antigravity CLI, GitHub Copilot, Gemini, Kiro, Devin, Codex CLI, OpenCode, KiloCode and a generic filesystem mode.

The external Agent Skills ecosystem is also useful as a distribution bridge because its CLI installs `SKILL.md` packages across many agent hosts. BookForge can therefore publish skills as ordinary Agent Skills while retaining its own canonical runtime and state model.

## Commands

```bash
npx bookforge install --host auto
npx bookforge host --id cursor
npx bookforge plugin add --source github:owner/bookforge-plugin
npx bookforge plugin list
npx bookforge route "write chapter 3" --agent writer --workflow draft-chapter
npx bookforge context-pack "write chapter 3" --agent writer --workflow draft-chapter
npx bookforge workflow plan draft-chapter "write chapter 3" --agent writer
npx bookforge graph-sync
```

## Plugin lifecycle

```text
source
 -> manifest validation
 -> compatibility check
 -> copy into bookforge/plugins/<id>
 -> registry registration
 -> activation
 -> host launcher generation
```

Installing a plugin never grants it automatic access to all project files. Its component receives the contract and the context packet that the runtime selects.

## Graph providers

### JSONL

Zero external dependency. Recommended default for Git-first projects and CI.

### Neo4j

Optional direct projection using the official JavaScript driver. Neo4j also exposes an official MCP server, which is useful when the host itself is MCP-capable.

### Graphiti

Graphiti is best treated as an optional temporal context-graph layer rather than the canonical store. It supports incremental updates, provenance, temporal facts and hybrid retrieval. BookForge should feed it validated episodes/events and keep the manuscript artifacts as the authoritative record.

Do not make BookForge depend on Graphiti for correctness. Its role is acceleration of historical and relationship retrieval.

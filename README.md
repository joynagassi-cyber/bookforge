# BookForge — Context Engineering Framework for AI-Assisted Book Creation

[![npm version](https://img.shields.io/npm/v/bookforge.svg)](https://www.npmjs.com/package/bookforge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.12.0-brightgreen.svg)](https://nodejs.org/)
[![Tests](https://img.shields.io/badge/tests-45%2F45%20passing-brightgreen.svg)](https://github.com/joynagassi-cyber/bookforge)

BookForge is a platform-agnostic, specification-driven framework for turning a general-purpose AI agent into a disciplined book-production system capable of working on long manuscripts without relying on chat history as the source of truth.

## 🚀 Quick Start

```bash
# Install from npm
npm install -g bookforge-framework

# Initialize in your project
npx bookforge-framework install --host auto

# Validate your project
bookforge validate
```

## ✨ Features

- **Artifact-First Continuity** — Chat history is ephemeral; canonical artifacts are persistent
- **Progressive Context Disclosure** — Budget-aware information delivery (L1-L4)
- **Scale-Adaptive Execution** — Tiny edits → Book-scale projects
- **Multi-Agent Support** — 21 specialized editorial agents
- **Quality Gates** — 15 validation dimensions (AI-slop, clichés, continuity, etc.)
- **Knowledge System** — 54 knowledge catalogs with deterministic retrieval
- **Host Agnostic** — Works with Claude Code, Cursor, Codex, and more
- **Plugin System** — Extensible architecture with namespace isolation
- **Party Mode** — Multi-agent conversation orchestration
- **Graph Integration** — JSONL (default) + Neo4j support

## 📦 Installation

```bash
# From npm (after publication)
npm install -g bookforge-framework

# From GitHub (development)
npx --yes github:joynagassi-cyber/bookforge install --host auto

# All hosts
npx bookforge-framework install --host all
```

## 🛠️ CLI Commands

```bash
# Core commands
bookforge validate                      # Validate project state
bookforge-framework route "write chapter 3"       # Route task to appropriate workflow
bookforge-framework context-pack "write chapter 3" # Pack context for task
bookforge-framework workflow plan draft-chapter   # Plan workflow execution

# Plugin management
bookforge-framework plugin add --source github:owner/plugin
bookforge-framework plugin list
bookforge-framework plugin enable <id>
bookforge-framework plugin disable <id>
bookforge-framework plugin remove <id>

# Graph synchronization
bookforge-framework graph-sync                    # Sync events to graph
bookforge-framework watch --sync                  # Watch for changes

# Party mode (multi-agent)
bookforge-party create my-party
bookforge-party add my-party --member '{"name":"Alice","role":"writer"}'
bookforge-party history my-party
```

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    USER / AUTHOR                          │
└────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│                    ROUTER / HELP                          │
└────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
        UPSTREAM / SPEC                DOWNSTREAM / EXEC
        intent → research             chapter → packaging
        → book contract               → distribution
                │                           │
                └─────────────┬─────────────┘
                              ▼
┌────────────────────────────────────────────────────────────┐
│                 CONTEXT ENGINE                            │
│ progressive disclosure · retrieval · compression          │
└────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│                  CANONICAL ARTIFACTS                       │
│ contract · outline · style bible · source ledger           │
└────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│          AGENTS + WORKFLOWS + VALIDATORS                   │
└────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│             IDE / CLI / HOST ADAPTERS                      │
└────────────────────────────────────────────────────────────┘
```

## 📊 Project Stats

| Metric | Value |
|--------|-------|
| Agents | 21 specialized roles |
| Skills | 28 reusable capabilities |
| Workflows | 17 complete workflows |
| Knowledge Catalogs | 54 + 18 legacy |
| Host Adapters | 8 supported |
| Tests | 45/45 passing (100%) |
| Runtime Lines | ~1,149 |
| Test Lines | ~542 |

## 🎯 Scale-Adaptive Execution

BookForge selects the smallest workflow that safely satisfies the task:

- **Tiny** — Single local correction (typo fix)
- **Small** — Bounded rewrite or polishing
- **Medium** — New chapter/section
- **Large** — Structural change, packaging or publication
- **Book-scale** — New book or major rewrite

## 🧪 Testing

```bash
# Run all tests
npm test

# Run runtime tests only
npm run runtime:test

# Validate project
npm run validate

# Check package
npm run pack:check
```

## 📚 Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Workflow Guide](docs/WORKFLOW.md)
- [Context Engineering](docs/CONTEXT-ENGINEERING.md)
- [Quality Gates](docs/QUALITY-GATES.md)
- [Adapter Contract](docs/ADAPTER-CONTRACT.md)
- [Extension Model](docs/EXTENSION-MODEL.md)
- [Scaling Guide](docs/SCALING.md)

## 🔌 Plugin System

```javascript
// Install from GitHub
bookforge-framework plugin add --source github:owner/bookforge-plugin

// Install from npm
bookforge-framework plugin add --source npm:bookforge-plugin

// Install from local file
bookforge-framework plugin add --source file:./my-plugin
```

Plugins provide:
- Agents
- Workflows
- Skills
- Validators
- Catalogs
- Adapters
- Graph providers
- Templates

## 🎭 Party Mode

Multi-agent conversation orchestration:

```bash
# Create a party
bookforge-party create novel-review --members '[
  {"name":"Alice","role":"writer"},
  {"name":"Bob","role":"editor"},
  {"name":"Carol","role":"critic"}
]'

# Add turns
bookforge-party turn novel-review --speaker Alice --content "I think the ending needs work."

# Get history
bookforge-party history novel-review
```

## 📈 Performance

| Operation | Latency |
|-----------|---------|
| Workflow Plan | ~1.5ms |
| Context Route | ~2.0ms |
| Event Emit | ~12.7ms |
| Plugin Register | ~62.7ms |
| Graph Sync | ~74.8ms |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🔗 Links

- [GitHub Repository](https://github.com/joynagassi-cyber/bookforge)
- [npm Package](https://www.npmjs.com/package/bookforge)
- [Issue Tracker](https://github.com/joynagassi-cyber/bookforge/issues)

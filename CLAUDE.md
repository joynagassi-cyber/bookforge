# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BookForge is a platform-agnostic, specification-driven framework for AI-assisted book production. It turns a general-purpose AI agent into a disciplined book-production system capable of working on long manuscripts without relying on chat history as the source of truth.

**Core invariant:** No agent may make an irreversible project-level assumption that is not reflected in a canonical artifact. Chat history is ephemeral; canonical artifacts are persistent.

## Runtime Commands

```bash
# Install from local tgz
npm install -g ./bookforge-0.5.0.tgz

# Validate current project state
node bin/bookforge.js validate
npm run validate

# Run all tests
npm test

# Run runtime tests specifically
npm run runtime:test

# Dry-run package check
npm run pack:check
```

Development requires Node.js >= 20.12.0. No runtime dependencies are declared in `package.json`.

## Architecture

### Logical Layers (bottom → top)

```
IDE / CLI / Host Adapters
      ↓
Agents + Workflows + Validators
      ↓
Canonical Artifacts (contract, outline, style bible, source ledger, etc.)
      ↓
Context Engine (progressive disclosure, retrieval, compression)
      ↓
Router / Help (complexity · intent · next workflow · readiness)
      ↓
User / Author
```

**Upstream** (intent/specification): idea validation → research → book contract → outline → voice/style. Outputs are treated as specification artifacts.

**Downstream** (bounded execution): chapter drafting → revision → continuity → fact-checking → illustration → packaging → metadata → launch. Each task receives the smallest complete context required.

**Scale-adaptive execution:** BookForge selects the smallest workflow that safely satisfies the task (e.g., typo → direct edit; new chapter → chapter planning + drafting + QA; structural change → outline reconciliation + impact analysis).

### Key Directories

| Directory | Role |
|---|---|
| `bookforge/` | Canonical project state — artifacts, state, templates, workflows, agents, plugins |
| `agents/` | Agent role definitions (writer, book-architect, fact-checker, etc.) |
| `skills/` | Reusable capability skills (context-packer, chapter-generator, etc.) |
| `workflows/` | Multi-step workflow compositions |
| `runtime/` | Runtime core: context, graph, workflow engine, plugin registry |
| `lib/cli/` | CLI entry logic |
| `bin/bookforge.js` | CLI binary |
| `catalogs/` | CSV-based knowledge catalogs (genres, voices, writing-styles, validators, etc.) |
| `knowledge/` | Master Specification integration (54-catalog) — schemas, indexes, sources, reports |
| `adapters/` | Host adapters: claude-code, codex-cli, cursor, kilocode, opencode, generic-agent, graph |
| `harness/` | Evaluation layer — fixtures, golden tests, regression tracking |
| `specs/` | Schema specs for plugins, hosts, graph contract |
| `tests/` | Test suite (runtime + golden fixtures) |
| `project-templates/` | Project scaffolding templates |

### Quality & Integrity Gates

Quality validators run across 15 dimensions (structure, voice, continuity, facts, citations, similarity, AI-slop, cliche, repetition, etc.). Severity levels: CRITICAL, HIGH, MEDIUM, LOW.

**Anti-bypass rule:** A validator may report PASS only for its own domain. No validator can certify the complete manuscript. Human review is required before release (`bookforge.yaml` → `quality.require_human_gate_before_release: true`).

## Development Rules

1. **Add behavior as skills/workflows/validators/catalogs/adapters** — never hard-code domain knowledge into the core router.
2. **Maintain artifact ownership** — canonical artifacts in `bookforge/` must never be silently overwritten.
3. **Keep adapters thin** — they translate generic BookForge operations into specific host environments.
4. **Add regression fixtures** for important bug fixes (see `harness/fixtures/`).
5. **Document new catalog fields** in the relevant knowledge catalog.
6. **Progressive context disclosure** — load context in levels: registry (L1) → skill contract (L2) → knowledge (L3) → project state (L4). Do not load all levels at once.

## Context Packet Structure

Every bounded task is represented as a packet:

```yaml
task_id: CH-03
intent: draft
scope:
  chapter: 3
required_artifacts:
  - bookforge/state/book-contract.md
  - bookforge/state/outline/chapter-03.yaml
  - bookforge/state/style-bible.md
constraints:
  max_words: 5000
quality_targets:
  - continuity
  - low-repetition
```

## Knowledge Catalogs

Catalogs live in `catalogs/*.csv` and are indexed under `knowledge/indexes/`. The Master Specification (54 catalogs) lives under `knowledge/catalogs/`. Indexes support deterministic retrieval with progressive disclosure.

Key catalogs: `genres.csv`, `voices.csv`, `writing-styles.csv`, `validators.csv`, `routing-rules.csv`, `chapter-patterns.csv`, `ai-slop-patterns.csv`, `cliches.csv`, `reader-profiles.csv`.

## Configuration

`bookforge.yaml` controls framework behavior. Key settings:
- `context.progressive_disclosure: true`
- `context.compaction_threshold: 0.75`
- `quality.require_human_gate_before_release: true`
- `knowledge.deterministic_indexes: true`

Local overrides go in `bookforge.local.yaml` (gitignored).

## Testing

Tests use Node.js built-in `node --test`. Runtime tests live in `tests/runtime/`. Golden tests in `harness/fixtures/` cover continuity across 20+ chapters, fact verification, voice consistency, slop reduction, and artifact ownership.

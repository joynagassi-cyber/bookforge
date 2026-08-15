# BookForge Runtime v0.6 Documentation

## Overview

BookForge Runtime v0.6 is a comprehensive framework for AI-assisted book production. It provides a specification-driven, artifact-first approach to managing long-form content creation.

## Architecture

### Logical Layers

```
IDE / CLI / Host Adapters
      ↓
Agents + Workflows + Validators
      ↓
Canonical Artifacts (contract, outline, style bible, etc.)
      ↓
Context Engine (progressive disclosure, retrieval, compression)
      ↓
Router / Help (complexity · intent · next workflow · readiness)
      ↓
User / Author
```

### Key Components

#### Workflow Engine v0.6

- **State Machine**: Strict state transitions (READY → CONTEXT_BUILT → EXECUTING → VALIDATING → REVISING → GATED → COMMITTED)
- **Step Dependencies**: Topological sorting with cycle detection
- **Condition Evaluation**: Boolean, variable, and complex conditions (and/or/not)
- **Agent Assignment**: Per-step agent specification
- **Output Tracking**: Step outputs propagated through workflow

#### Context System

- **Router**: Task type detection (tiny/small/medium/large/book-scale)
- **Packer**: Context packet creation with progressive disclosure
- **Budget**: Token budget management per tier

#### Memory System

- **L0 (Deterministic)**: Direct facts extracted from source
- **L1 (Structural)**: Headings, lists, relationships
- **L2 (Semantic)**: Inferred entity-relation triples

#### Graph System

- **Event Model**: Standardized event creation and validation
- **Providers**: JSONL and Neo4j support
- **Synchronizer**: Idempotent sync with SHA-256 hashing

#### Quality Engine

- **Validators**: Registry-based with dimension tracking
- **Critical Findings**: Automatic detection and summary
- **Dimension Status**: Per-dimension pass/fail/concerns

## Commands

```bash
# Validate project
node bin/bookforge.js validate

# Run doctor
node bin/bookforge.js doctor

# Route a task
node bin/bookforge.js route <task> [--agent id] [--workflow id]

# Pack context
node bin/bookforge.js context-pack <task> [--budget N]

# Plan workflow
node bin/bookforge.js workflow plan <workflow-id> <task>

# Execute workflow
node bin/bookforge.js workflow start <plan.json>

# Synchronize graph
node bin/bookforge.js graph-sync

# Run tests
npm test
```

## Testing

- **Unit Tests**: 70+ tests across all runtime components
- **Golden Tests**: E2E integration tests
- **Regression Tests**: Fixture-based testing in harness/fixtures/

## Versioning

- **Package Version**: Semantic versioning (npm)
- **Runtime Contract**: v0.6.0 (specification compliance)

## Host Support

- Claude Code
- Cursor
- Windsurf
- Generic/Other agents

## Publishing

```bash
# Build package
npm run pack:check

# Publish to npm
npm publish
```

## Module System

Modules extend BookForge capabilities. Each module declares:

```yaml
id: my-module
version: 1.0.0
type: module
provides:
  - agents
  - workflows
  - skills
entrypoints:
  agents:
    - my-agent
  workflows:
    - my-workflow
  skills:
    - my-skill
```

## Plugin to Module Migration

Use the migration script to convert legacy plugins:

```bash
node migration/plugin-to-module.js /path/to/project
```

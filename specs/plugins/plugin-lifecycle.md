# BookForge Plugin Lifecycle

A plugin is a versioned capability package. It is never allowed to mutate canonical book state directly.

```text
DISCOVER → VERIFY → INSTALL → REGISTER → ENABLE → RUN → VALIDATE → DISABLE/REMOVE
```

Every plugin declares `id`, `version`, `kind`, framework compatibility, capabilities, dependencies, entrypoints, inputs and outputs.

## Kinds

- module: bundle of agents/workflows/skills
- agent: persona + operating contract
- workflow: deterministic process graph
- skill: host-loadable instruction surface
- validator: quality/integrity gate
- catalog: structured knowledge
- adapter: external tool/system bridge
- graph-provider: memory/knowledge graph backend
- host-adapter: IDE/CLI integration
- bundle: distributable combination

## Isolation

Plugins write only to their own namespace and emit artifacts/events. Canonical state changes pass through BookForge contracts.

# Versioning Policy — BookForge

## Overview

BookForge uses a **dual-versioning scheme** to separate:

1. **Package version** — npm release version (semantic versioning)
2. **Runtime contract version** — API/contract stability version

This prevents version confusion and allows the package to evolve independently from the runtime contracts.

---

## Version Components

```yaml
# package.json
version: "2.2.0"           # npm semantic version

# bookforge.yaml
version: "0.6.0"           # framework contract version

# specs/runtime/runtime-contract.schema.json
schema_version: "0.6.0"    # runtime contract version

# plugins/modules
version: "1.0.0"           # extension version

# workflows
version: "1.0.0"           # workflow schema version

# schemas
schema_version: "1.0.0"    # schema version
```

---

## Versioning Rules

### Package Version (npm)

Follows [Semantic Versioning](https://semver.org/):

- **MAJOR** — Breaking changes to the package API or installed project structure
- **MINOR** — New features, backwards-compatible
- **PATCH** — Bug fixes, backwards-compatible

Examples:
- `2.2.0` → `2.3.0` (new feature: module system)
- `2.3.0` → `2.3.1` (bug fix: context router)
- `2.3.1` → `3.0.0` (breaking change: runtime contract v0.7)

### Runtime Contract Version

Tracks stability of the internal APIs that extensions and hosts depend on:

- **0.x** — Pre-stable, breaking changes allowed
- **1.0+** — Stable, only minor/major bumps for breaking changes

Current: `0.6.0`

### Workflow Schema Version

Tracks changes to workflow definition format:

- **1.0.0** — Current stable format
- Bump MAJOR when steps structure changes
- Bump MINOR when new optional fields added
- Bump PATCH when bugs fixed (no format change)

### Plugin/Module Version

Each extension manages its own version independently.

---

## Migration Policy

When a contract version changes:

1. Document the migration path in `docs/migrations/`
2. Keep backward compatibility layer for 1 minor version
3. Add deprecation warnings before removing old format
4. Update tests to cover both old and new formats during transition

---

## Current Versions

| Component | Version | File |
|-----------|---------|------|
| Package | 2.2.0 | `package.json` |
| Framework | 0.6.0 | `bookforge.yaml` |
| Runtime Contract | 0.6.0 | `specs/runtime/runtime-contract.schema.json` |
| Workflow Schema | 1.0.0 | `specs/workflows/workflow.schema.json` |
| Plugin API | 1.0.0 | `specs/plugins/plugin.schema.json` |
| Graph Contract | 1.0.0 | `specs/graph/graph-contract.schema.json` |
| Task Packet | 1.0.0 | `schemas/task-packet.schema.json` |
| Validator Report | 1.0.0 | `schemas/validator-report.schema.json` |

# Plugin System

A plugin becomes visible only after registration in `bookforge/plugins/registry.json`.

```text
plugin package
   ↓
manifest validation
   ↓
compatibility check
   ↓
dependency check
   ↓
namespace registration
   ↓
host skill generation
   ↓
workflow/agent discovery
   ↓
quality gate
```

## Discovery

The CLI scans installed modules, project plugins and configured registries. It never loads arbitrary plugin code merely because a folder exists.

## Namespace

Each plugin owns:

```text
bookforge/plugins/<plugin-id>/
```

Its artifacts, generated skills and configuration are namespaced.

## Extension surfaces

A plugin can provide any combination of:

- agents
- workflows
- skills
- validators
- catalogs
- adapters
- graph providers
- host adapters
- templates

## Runtime isolation

Agents receive contracts and context packets, not unrestricted access to every catalog or project artifact.

# Module System

BookForge modules are self-contained packages that extend the framework with agents, workflows, skills, catalogs, validators, and more.

## Module Structure

```
module/
├── module.yaml              # Module definition
├── agents/                  # Agent contracts
├── workflows/               # Workflow definitions
├── skills/                  # Reusable skills
├── catalogs/                # Knowledge catalogs
├── validators/              # Quality validators
├── schemas/                 # JSON schemas
├── templates/               # Project templates
├── adapters/                # Host adapters
├── evaluations/             # Test cases
└── resources/               # Static assets
```

## Module Definition (module.yaml)

```yaml
id: bookforge.demo
version: 0.1.0
type: module

name: "Demo Module"
description: "Example module demonstrating BookForge extension capabilities"

provides:
  - demo.agent
  - demo.workflow
  - demo.skill

dependencies: []

config:
  sample_setting: "default_value"
```

## Module Lifecycle

1. **Discover** — Scan for module.yaml files
2. **Validate** — Check structure and dependencies
3. **Register** — Add to module registry
4. **Activate** — Generate host-specific artifacts
5. **Deactivate** — Clean up generated artifacts
6. **Remove** — Delete module from registry

## Module Commands

```bash
# List installed modules
bookforge module list

# Inspect a module
bookforge module inspect <module-id>

# Add a module from local path
bookforge module add --source ./path/to/module

# Add a module from GitHub
bookforge module add --source github:owner/module

# Enable/disable a module
bookforge module enable <module-id>
bookforge module disable <module-id>

# Remove a module
bookforge module remove <module-id>
```

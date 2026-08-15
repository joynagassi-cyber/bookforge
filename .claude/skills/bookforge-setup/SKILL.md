---
name: bookforge-setup
description: "Sets up BookForge in a project. Use when the user requests to 'install bookforge', 'configure bookforge', or 'setup bookforge project'."
version: "1.0.0"
triggers:
  - "bookforge-setup"
  - "install bookforge"
  - "setup bookforge"
scope: "project-initialization"
owner: "bookforge"
---

# BookForge Setup

## Overview
Installs and configures BookForge in a project. Collects user preferences and writes them to configuration files.

## Configuration Files

The installer writes to three files:

1. **`bookforge/bookforge-config/config.yaml`** — Shared project config with core settings and module configuration
2. **`bookforge/bookforge-config/config.user.yaml`** — Personal settings (gitignored): `user_name`, `communication_language`
3. **`bookforge/bookforge-config/module-help.csv`** — Registers BookForge capabilities for the help system

## On Activation

1. Check if `bookforge/bookforge-config/config.yaml` exists — if present, this is an update; otherwise it's a fresh install
2. Check for legacy config at `bookforge/config.yaml` and migrate if needed
3. Collect configuration from the user (or use arguments if `--headless` or `--yes` is passed)
4. Run the merge-config.py script to write configuration
5. Create output directories as configured
6. Display confirmation summary

## Collect Configuration

Ask the user for values. Show defaults in brackets. Present all values together so the user can respond once.

**Core config** (only if no config exists):
- `project_name` (default: empty)
- `template` (default: "book")
- `host` (default: "auto")
- `graph_provider` (default: "none")
- `user_name` (default: from git config or "Author")
- `communication_language` (default: "English")
- `document_output_language` (default: same as communication_language)
- `output_folder` (default: "{project-root}/bookforge-output")

**Module config**:
- `progressive_disclosure` (default: "true")
- `default_budget` (default: "medium")
- `require_human_gate` (default: "true")
- `fail_on_critical` (default: "true")

## Write Configuration

Run the merge-config script:

```bash
python3 bookforge/bookforge-config/scripts/merge-config.py \
  --config-path "bookforge/bookforge-config/config.yaml" \
  --module-yaml "bookforge/bookforge-config/assets/module.yaml" \
  --answers <temp-file> \
  --user-config-path "bookforge/bookforge-config/config.user.yaml" \
  --legacy-dir "bookforge"
```

## Create Output Directories

After writing config, create any configured output directories:

```bash
mkdir -p {output_folder}
```

## Confirm

Display what was configured:
- Core settings (project name, template, host, graph)
- User settings (name, language)
- Quality settings
- Output folders
- Fresh install vs update

## Headless Mode

If `--headless` or `-H` is passed, or if the user provides inline arguments like `user_name=JOY,language=French`, skip interactive prompting and use the provided values.

## Outcome

Once `user_name` and `communication_language` are known, use them consistently for the remainder of the session.

#!/usr/bin/env python3
"""Merge BookForge configuration into shared config.yaml and config.user.yaml.

Reads a module.yaml definition and a JSON answers file, then writes or updates
the shared config.yaml (core values at root + module section) and config.user.yaml
(user_name, communication_language, plus any module variable with user_setting: true).
Uses an anti-zombie pattern for the module section in config.yaml.

Legacy migration: when --legacy-dir is provided, reads old per-module config files
from {legacy-dir}/{module-code}/config.yaml and {legacy-dir}/core/config.yaml.
Matching values serve as fallback defaults (answers override them). After a
successful merge, the legacy config.yaml files are deleted.

Exit codes: 0=success, 1=validation error, 2=runtime error
"""

import argparse
import json
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    print("Error: pyyaml is required. Install with: pip install pyyaml", file=sys.stderr)
    sys.exit(2)


def parse_args():
    parser = argparse.ArgumentParser(
        description="Merge BookForge configuration into shared config files."
    )
    parser.add_argument(
        "--config-path",
        required=True,
        help="Path to the target bookforge/_bmad/config.yaml file",
    )
    parser.add_argument(
        "--module-yaml",
        required=True,
        help="Path to the module.yaml definition file",
    )
    parser.add_argument(
        "--answers",
        required=True,
        help="Path to JSON file with collected answers",
    )
    parser.add_argument(
        "--user-config-path",
        required=True,
        help="Path to the target bookforge/_bmad/config.user.yaml file",
    )
    parser.add_argument(
        "--legacy-dir",
        help="Path to bookforge/ directory to check for legacy config files",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Print detailed progress to stderr",
    )
    return parser.parse_args()


def load_yaml_file(path: str) -> dict:
    """Load a YAML file, returning empty dict if file doesn't exist."""
    file_path = Path(path)
    if not file_path.exists():
        return {}
    with open(file_path, "r", encoding="utf-8") as f:
        content = yaml.safe_load(f)
    return content if content else {}


def save_yaml_file(path: str, data: dict):
    """Save data to a YAML file."""
    file_path = Path(path)
    file_path.parent.mkdir(parents=True, exist_ok=True)
    with open(file_path, "w", encoding="utf-8") as f:
        yaml.dump(data, f, default_flow_style=False, allow_unicode=True)


def load_json_file(path: str) -> dict:
    """Load a JSON file."""
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


# Keys that live at config root (shared across all modules)
_CORE_KEYS = frozenset({
    "user_name",
    "communication_language",
    "document_output_language",
    "output_folder",
    "project_name",
    "template",
    "host",
    "graph_provider"
})


def load_legacy_values(legacy_dir: str, module_code: str, module_yaml: dict, verbose: bool = False) -> tuple:
    """Read legacy config files and return core/module value dicts."""
    legacy_core = {}
    legacy_module = {}
    files_found = []

    # Read core legacy config
    core_path = Path(legacy_dir) / "config.yaml"
    if core_path.exists():
        core_data = load_yaml_file(str(core_path))
        files_found.append(str(core_path))
        for k, v in core_data.items():
            if k in _CORE_KEYS:
                legacy_core[k] = v
        if verbose:
            print(f"Legacy core config: {list(legacy_core.keys())}", file=sys.stderr)

    # Read user legacy config
    user_path = Path(legacy_dir) / "config.user.yaml"
    if user_path.exists():
        user_data = load_yaml_file(str(user_path))
        files_found.append(str(user_path))
        for k, v in user_data.items():
            if k in _CORE_KEYS:
                if k not in legacy_core:
                    legacy_core[k] = v
            elif k not in ["user_name", "communication_language", "document_output_language", "output_folder"]:
                # Check if it matches a module variable
                if k in module_yaml and isinstance(module_yaml[k], dict):
                    legacy_module[k] = v
        if verbose:
            print(f"Legacy user config: {list(legacy_module.keys())}", file=sys.stderr)

    return legacy_core, legacy_module, files_found


def apply_legacy_defaults(answers: dict, legacy_core: dict, legacy_module: dict) -> dict:
    """Apply legacy values as fallback defaults."""
    merged = dict(answers)

    if legacy_core:
        core = merged.get("core", {})
        for k, v in legacy_core.items():
            if k not in core:
                core[k] = v
        merged["core"] = core

    if legacy_module:
        module = merged.get("module", {})
        for k, v in legacy_module.items():
            if k not in module:
                module[k] = v
        merged["module"] = module

    return merged


def merge_config(args) -> dict:
    """Main merge logic."""
    verbose = args.verbose
    module_yaml_path = Path(args.module_yaml)
    answers_path = Path(args.answers)

    # Load module definition
    if verbose:
        print(f"Loading module definition from {module_yaml_path}", file=sys.stderr)
    module_yaml = load_yaml_file(str(module_yaml_path))
    if not module_yaml:
        print(f"Error: Could not load module.yaml from {module_yaml_path}", file=sys.stderr)
        sys.exit(1)

    # Load answers
    if verbose:
        print(f"Loading answers from {answers_path}", file=sys.stderr)
    answers = load_json_file(str(answers_path))

    # Load legacy values
    legacy_core = {}
    legacy_module = {}
    if args.legacy_dir:
        legacy_core, legacy_module, files_found = load_legacy_values(
            args.legacy_dir, "bf", module_yaml, verbose
        )
        if verbose:
            print(f"Found {len(files_found)} legacy config files: {files_found}", file=sys.stderr)
            if files_found:
                print("Legacy values loaded as fallback defaults", file=sys.stderr)

    # Apply legacy defaults
    if legacy_core or legacy_module:
        answers = apply_legacy_defaults(answers, legacy_core, legacy_module)

    # Load existing configs
    config_path = Path(args.config_path)
    user_config_path = Path(args.user_config_path)

    existing_config = load_yaml_file(str(config_path)) if config_path.exists() else {}
    existing_user_config = load_yaml_file(str(user_config_path)) if user_config_path.exists() else {}

    # Merge core values
    core_answers = answers.get("core", {})
    for k, v in core_answers.items():
        if k in _CORE_KEYS:
            existing_config[k] = v

    # Merge module values
    module_answers = answers.get("module", {})
    module_section = existing_config.get("modules", {}).get("bf", {})
    for k, v in module_answers.items():
        if k in module_yaml:
            module_section[k] = v
    existing_config["modules"] = existing_config.get("modules", {})
    existing_config["modules"]["bf"] = module_section

    # Merge user-specific values
    for k, v in core_answers.items():
        if k in ["user_name", "communication_language", "document_output_language"]:
            existing_user_config[k] = v

    # Save configs
    save_yaml_file(str(config_path), existing_config)
    save_yaml_file(str(user_config_path), existing_user_config)

    # Clean up legacy files
    legacy_deleted = []
    if args.legacy_dir:
        for f in files_found:
            if Path(f).exists():
                Path(f).unlink()
                legacy_deleted.append(f)

    return {
        "config_written": str(config_path),
        "user_config_written": str(user_config_path),
        "core_keys_set": list(core_answers.keys()),
        "module_keys_set": list(module_answers.keys()),
        "legacy_configs_deleted": legacy_deleted,
        "is_fresh_install": not config_path.exists() or not existing_config
    }


def main():
    args = parse_args()
    try:
        result = merge_config(args)
        print(json.dumps(result, indent=2))
        sys.exit(0)
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(2)


if __name__ == "__main__":
    main()

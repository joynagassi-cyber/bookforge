#!/usr/bin/env python3
"""Clean up legacy BMAD-style installer directories after configuration merge.

Verifies that every skill in the legacy directories exists at the target skills
directory before removing anything. Only removes directories that are safe to
remove (no skills found at target).

Exit codes: 0=success, 1=validation error, 2=runtime error
"""

import argparse
import json
import sys
from pathlib import Path


def parse_args():
    parser = argparse.ArgumentParser(
        description="Clean up legacy BMAD installer directories."
    )
    parser.add_argument(
        "--bmad-dir",
        required=True,
        help="Path to the _bmad/ directory",
    )
    parser.add_argument(
        "--module-code",
        required=True,
        help="Module code to check (e.g., 'bf')",
    )
    parser.add_argument(
        "--also-remove",
        nargs="*",
        help="Additional directories to remove if empty",
    )
    parser.add_argument(
        "--skills-dir",
        required=True,
        help="Path to the target skills directory (e.g., .claude/skills/)",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Print detailed progress to stderr",
    )
    return parser.parse_args()


def find_skills_in_dir(directory: Path, verbose: bool = False) -> list:
    """Find all SKILL.md files in a directory tree."""
    skills = []
    if not directory.exists():
        return skills
    for skill_file in directory.rglob("SKILL.md"):
        skills.append(skill_file.relative_to(directory))
        if verbose:
            print(f"  Found skill: {skill_file}", file=sys.stderr)
    return skills


def main():
    args = parse_args()
    bmad_dir = Path(args.bmad_dir)
    module_code = args.module_code
    skills_dir = Path(args.skills_dir)
    verbose = args.verbose

    result = {
        "directories_removed": [],
        "files_removed_count": 0,
        "validation_passed": True,
        "errors": []
    }

    # Check module directory
    module_dir = bmad_dir / module_code
    if module_dir.exists():
        module_skills = find_skills_in_dir(module_dir, verbose)
        target_module_dir = skills_dir / module_code

        if module_skills:
            # Has skills - verify they exist at target
            if not target_module_dir.exists():
                target_module_dir.mkdir(parents=True, exist_ok=True)

            for skill in module_skills:
                target_skill = target_module_dir / skill
                if not target_skill.exists():
                    result["errors"].append(f"Skill not found at target: {target_skill}")
                    result["validation_passed"] = False
                    if verbose:
                        print(f"  ERROR: Missing skill at target: {target_skill}", file=sys.stderr)
            if verbose:
                print(f"Module dir has {len(module_skills)} skills, validation passed", file=sys.stderr)
        else:
            # No skills - safe to remove
            if verbose:
                print(f"Module dir has no skills, removing: {module_dir}", file=sys.stderr)
            result["directories_removed"].append(str(module_dir))
            module_dir.rmdir()
            result["files_removed_count"] += 1

    # Check for also-remove directories
    for dir_name in (args.also_remove or []):
        dir_path = bmad_dir / dir_name
        if dir_path.exists():
            skills = find_skills_in_dir(dir_path, verbose)
            if not skills:
                if verbose:
                    print(f"Removing directory: {dir_path}", file=sys.stderr)
                result["directories_removed"].append(str(dir_path))
                dir_path.rmdir()
                result["files_removed_count"] += 1
            else:
                result["errors"].append(f"Directory has skills, cannot remove: {dir_path}")
                result["validation_passed"] = False

    print(json.dumps(result, indent=2))
    sys.exit(0 if result["validation_passed"] else 1)


if __name__ == "__main__":
    main()

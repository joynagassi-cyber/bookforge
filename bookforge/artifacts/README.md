# BookForge Artifacts Directory

This directory contains generated book artifacts.

## Contents

- `manuscript/` - Chapter files and manuscript
- `packaging/` - Publication-ready files
- `metadata/` - ISBN, descriptions, keywords
- `launch/` - Marketing and launch assets

## Rules

1. Artifacts are produced by downstream workflows
2. Each artifact has an owning workflow declared in its frontmatter
3. Artifacts are immutable once approved (use supersede pattern)
4. Artifact versions are tracked via content hashes

## Current State

No artifacts exist yet. Chapters will be generated in `manuscript/` during execution.

# BookForge Specs Directory

This directory contains technical specifications for book production.

## Contents

- `book-contract.md` - Canonical book contract (promise, audience, constraints)
- `outline.md` - Hierarchical outline with chapter specifications
- `style-bible.md` - Voice and style guidelines
- `voice-profile.yaml` - Authorial voice configuration

## Rules

1. Specs are the source of truth for downstream execution
2. Only the owning workflow can modify a spec
3. Cross-workflow spec changes must propose, not overwrite
4. Spec versions are tracked via content hashes

## Current State

No specifications exist yet. Run `bookforge workflow plan book-contract "describe your book"` to begin.

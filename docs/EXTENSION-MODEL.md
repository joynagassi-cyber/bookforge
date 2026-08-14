# Extension Model

Extensions are first-class packages.

## Package types

- `agent`
- `workflow`
- `skill`
- `validator`
- `catalog`
- `adapter`
- `template`
- `schema`
- `evaluation`

## Dependency rules

Extensions declare:

- id
- version
- capability
- dependencies
- inputs
- outputs
- compatible framework versions

## Catalogs as extension surfaces

Catalogs are data, not prompt text.

This allows:

- community additions;
- domain packs;
- language packs;
- genre packs;
- publisher-specific packs;
- organization-specific style libraries.

## Override model

Defaults live in the package.

Project-level overrides live in:

`bookforge/local/`

User-level overrides may live outside version control.

A sparse override changes only the intended field.

## Versioning

Every canonical artifact should support:

- semantic version;
- source workflow;
- generated_by;
- created_at;
- updated_at;
- status;
- supersedes.

# Catalog Index

Catalogs are a knowledge layer, not agent prompts.

## Writing
- writing-styles.csv
- voices.csv
- tones.csv
- rhetorical-devices.csv
- cliches.csv
- ai-slop-patterns.csv
- chapter-patterns.csv

## Book/domain
- genres.csv
- reader-profiles.csv
- mermaid-schemas.csv
- design-patterns.csv
- packaging-patterns.csv
- marketing-assets.csv

## Operations
- validators.csv
- quality-metrics.csv
- routing-rules.csv

## Extension principle

A catalog row should be:

- atomic;
- named;
- testable;
- versionable;
- retrievable without loading the entire catalog.

Future implementation should index catalogs and retrieve rows by metadata instead of loading complete CSVs into context.


## Knowledge Master integration

The legacy CSV catalogs remain backward-compatible. The 54-catalog Master Specification is integrated under `knowledge/catalogs/` as specialized, versioned packages. Existing CSVs are preserved and referenced as extension sources rather than overwritten.

Quality controls explicitly cover similarity/originality, AI-slop, clichés and human-voice refinement. Similarity is never an automatic plagiarism verdict; human-voice refinement is never detector-evasion.

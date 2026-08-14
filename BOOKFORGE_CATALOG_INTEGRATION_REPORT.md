# BookForge Catalog Integration Report — v0.3.0 candidate

## Audit result

The V0.2.0 repository was inspected before integration. The Master Catalog contains exactly 54 catalogs. The legacy BookForge repository contains 18 CSV catalogs. The integration is non-destructive.

## Migration classification

- Master catalogs: 54
- Existing legacy catalogs preserved: 18
- Master catalogs mapped as extensions of legacy catalogs: 15
- New specialized Master catalog packages: 39
- Explicit quality extensions added: 3 (`originality_similarity`, `cliche_library`, `human_voice`)
- Total knowledge catalog surfaces after integration: 57 (54 Master + 3 extensions), plus 18 legacy CSV surfaces

## Existing → Master extensions

| Existing surface | Master catalog(s) | Strategy |
|---|---|---|
| `genres.csv` | `genres` | extend, do not overwrite |
| `chapter-patterns.csv` | `story_structures` | partial extension; keep chapter-specific patterns |
| `voices.csv` | `voice` | extend |
| `writing-styles.csv` | `style` | extend |
| `tones.csv` | `tone` | extend |
| `rhetorical-devices.csv` | `rhetoric` | extend |
| `reader-profiles.csv` | `reader_experience` | partial extension |
| `ai-slop-patterns.csv` | `ai_slop` | extend |
| `quality-metrics.csv` | `quality_metrics` | extend |
| `packaging-patterns.csv` | `book_structure`, `digital_publishing` | partial extension |
| `design-patterns.csv` | `typography`, `layout`, `accessibility` | partial extension; do not merge semantics blindly |
| `marketing-assets.csv` | `marketing` | extend |

The remaining legacy catalogs (`agent-roster`, `workflow-roster`, `routing-rules`, `validators`, `cliches`, `mermaid-schemas`) remain framework-operational catalogs and are not incorrectly forced into the Master knowledge taxonomy.

## New knowledge layer

Each Master catalog now has a versioned package containing `manifest.json`, `schema.json`, `entries.json`, and `README.md`. Seed entries are explicitly marked `generated_seed` and `needs_review=true`; they are not represented as verified knowledge.

Indexes added:

- `knowledge/indexes/catalog-index.json`
- `knowledge/indexes/entry-index.json`
- `knowledge/indexes/tag-index.json`
- `knowledge/indexes/agent-catalog-map.json`
- `knowledge/indexes/workflow-catalog-map.json`
- `knowledge/relations/catalog-relations.json`
- `knowledge/sources/registry.json`

## Quality-control additions

The framework already contained AI-slop, cliché, originality and human-voice capabilities in V0.2.0. The integration makes them explicit at the Knowledge System level rather than duplicating them as unrelated agents.

Added:

- `originality_similarity`: similarity/originality evidence model
- `cliche_library`: language-aware cliché/overused-expression model
- `human_voice`: authorial refinement model
- `agents/plagiarism-auditor`
- `skills/plagiarism-risk-audit`
- `skills/humanize-prose`
- `catalogs/quality-controls.csv`

Similarity remains evidence for review, not an automatic plagiarism verdict. Human-voice refinement is editorial improvement and is explicitly not detector evasion.

## Automation

`scripts/catalog/` now contains deterministic tooling for loading, splitting, normalizing, merging, validating, indexing, relation building, source checks, deduplication, conversion, diffing, searching, reporting and statistics.

## Validation

- Master catalog count check: PASS
- Unique catalog IDs: PASS
- Source presence check: PASS
- Catalog validation: 0 errors / 0 warnings
- Python compilation: PASS
- CLI catalog-status command: PASS

Relation labels are retained as candidate relations until their target entities are resolved; they are not silently guessed.

## Remaining work

1. Populate seed entries from verified/licensed/independently authored sources.
2. Resolve the 218 relation labels to concrete target IDs.
3. Replace heuristic consumer aliases with explicit agent IDs where new specialized agents are later introduced.
4. Connect external similarity/plagiarism adapters without turning similarity into an automatic accusation.
5. Expand golden cases for every P0 catalog and every retrieval route.

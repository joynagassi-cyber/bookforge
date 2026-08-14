# Context Engineering

BookForge treats context as a finite attention budget rather than a storage bin.

## Progressive disclosure

Level 1 — registry:

- skill id
- purpose
- triggers
- inputs
- outputs
- dependencies

Level 2 — skill contract:

- full instructions
- routing rules
- invariants
- gotchas
- examples

Level 3 — knowledge:

- catalogs
- pattern libraries
- genre references
- style resources
- validator rules

Level 4 — project state:

- current outline slice
- chapter packet
- relevant entities
- current decisions
- relevant sources
- quality findings

The agent should not load all levels at once.

## Context packet

Every bounded task should be represented as a packet:

```yaml
task_id: CH-03
intent: draft
scope:
  chapter: 3
required_artifacts:
  - bookforge/state/book-contract.md
  - bookforge/state/outline/chapter-03.yaml
  - bookforge/state/style-bible.md
  - manuscript/chapter-02.md
optional_artifacts:
  - relevant source notes
constraints:
  max_words: 5000
  voice_profile: author-primary
quality_targets:
  - continuity
  - low-repetition
  - low-cliche
  - factual grounding
```

## Retrieval rules

Prefer:

1. exact current task scope;
2. canonical project rules;
3. nearest dependencies;
4. targeted knowledge catalog entries;
5. broader context only when required.

## Context compression

Before compaction, persist:

- decisions;
- unresolved issues;
- current chapter state;
- changes;
- next actions;
- important evidence;
- references.

Never compress away canonical identifiers.

## Context poisoning defense

Flag contradictions between:

- old outline and current outline;
- superseded decisions and current decisions;
- draft claims and verified source ledger;
- local style notes and global style bible.

The newest canonical artifact wins only when its status is explicitly updated.

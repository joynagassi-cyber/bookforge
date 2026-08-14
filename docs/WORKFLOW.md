# BookForge Workflow

## Lifecycle

```text
IDEA
  ↓
ANALYSIS
  ↓
BOOK BRIEF
  ↓
RESEARCH
  ↓
BOOK CONTRACT
  ↓
OUTLINE
  ↓
STYLE / VOICE
  ↓
READINESS GATE
  ↓
CHAPTER LOOP
  ↓
BOOK-LEVEL EDITING
  ↓
INTEGRITY AUDIT
  ↓
PACKAGING
  ↓
PUBLISHING
  ↓
MARKETING
  ↓
RELEASE GATE
```

## Phase 0 — Help / Routing

`bf-help` inspects the workspace and identifies:

- current phase;
- missing mandatory artifacts;
- active blockers;
- next safe workflow;
- optional workflows.

## Phase 1 — Analysis

Typical workflows:

- idea validation
- market/reader research
- genre discovery
- audience definition
- premise pressure test

Outputs:

- `brief.md`
- `research/`
- `positioning.md`

## Phase 2 — Book Contract

The Book Architect creates the canonical:

- promise;
- audience;
- genre;
- constraints;
- non-goals;
- target length;
- structural model;
- style direction;
- quality thresholds.

## Phase 3 — Outline

The outline is hierarchical and machine-readable enough to support bounded chapter work.

Required fields:

- chapter purpose;
- reader promise;
- required inputs;
- beats/sections;
- dependencies;
- expected evidence;
- emotional or rhetorical movement;
- transition target;
- completion criteria.

## Phase 4 — Chapter Loop

For each chapter:

1. hydrate context;
2. prepare chapter packet;
3. draft;
4. local structural review;
5. voice review;
6. continuity review;
7. factual/citation review when applicable;
8. slop/cliche/repetition checks;
9. revise;
10. update state.

## Phase 5 — Book-Level Editing

Runs across the whole manuscript:

- structural coherence;
- narrative continuity;
- argument continuity;
- voice drift;
- repetitions;
- pacing;
- chapter balance;
- terminology;
- source integrity.

## Phase 6 — Integrity

Mandatory pre-publication checks:

- similarity/plagiarism review;
- factual verification;
- citation verification;
- source provenance;
- AI-slop review;
- cliche review;
- copyright-sensitive content review;
- disclosure requirements as applicable.

Similarity is a signal, not an automatic plagiarism verdict.

## Phase 7 — Packaging

- cover brief;
- cover review;
- interior design system;
- ebook formatting;
- print formatting;
- audiobook production specification;
- metadata.

## Phase 8 — Marketing

- positioning message;
- blurb;
- sales copy;
- author page;
- launch sequence;
- email funnel;
- campaign assets.

## Phase 9 — Human Release Gate

No automated validator can independently mark a book as publication-ready.

The release gate records:

- outstanding issues;
- unresolved risks;
- human reviewer decision;
- release scope;
- final artifact hashes/versions.

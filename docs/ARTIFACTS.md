# Canonical Artifact Model

```text
bookforge/
├── manifest.yaml
├── state/
│   ├── book-contract.md
│   ├── style-bible.md
│   ├── voice-profile.yaml
│   ├── outline/
│   ├── continuity/
│   ├── sources/
│   ├── claims/
│   ├── decisions/
│   ├── qa/
│   └── release/
├── runtime/
└── local/
```

## Core artifacts

- `book-contract.md`
- `outline/index.yaml`
- `style-bible.md`
- `voice-profile.yaml`
- `source-ledger.csv`
- `claim-ledger.csv`
- `decision-log.md`
- `book-state.yaml`
- `qa/`
- `release/`

## Status values

`draft` → `review` → `approved` → `superseded` → `archived`

## Single-writer principle

Each artifact has an owning workflow.

For example:

- outline owner → outline workflow;
- style bible owner → voice/style workflow;
- source ledger owner → research workflow;
- release report owner → release gate.

Other skills can propose changes but do not silently mutate another workflow's canonical artifact.

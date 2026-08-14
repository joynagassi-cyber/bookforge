# BookForge Gates Directory

Quality gates and validation checkpoints.

## Gate Types

| Gate ID | Name | Phase | Required Artifacts | Validator |
|---------|------|-------|-------------------|-----------|
| UPSTREAM-READY | Upstream Ready | Pre-Execution | book-contract.md, outline.md | readiness-check |
| CHAPTER-READY | Chapter Ready | Pre-Draft | outline.yaml, style-bible.md | chapter-plan |
| CHAPTER-QA | Chapter QA | Post-Draft | chapter.md, validator-report.json | chapter-qa |
| BOOK-EDIT | Book Edit | Post-Completion | all chapters | book-edit |
| INTEGRITY | Integrity Audit | Pre-Release | qa-reports, continuity-check | integrity-audit |
| RELEASE | Release Gate | Final | release-report.json, human-approval.json | release-gate |

## Gate Status

```
UPSTREAM-READY    : PENDING
CHAPTER-READY     : N/A
CHAPTER-QA        : N/A
BOOK-EDIT         : N/A
INTEGRITY         : N/A
RELEASE           : N/A
```

## Rules

1. Gates are checked before workflow transitions
2. CRITICAL findings block gate passage
3. HIGH findings require human approval
4. Gated workflows cannot proceed without approval
5. Gate decisions are logged in paper-trail.md

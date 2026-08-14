---
name: "ai-slop-validator"
description: "Validate text for AI-generated patterns and slop indicators."
version: "0.2.0"
triggers:
  - "ai-slop-validator"
  - "validate slop"
scope: "task-bounded"
owner: "bookforge"
---

# AI-Slop Validator

## Purpose
Analyze text for AI-generated patterns including generic phrasing, hollow intensifiers, and structural slop.

## Activation
Activate when text quality needs validation against AI-slop patterns.

## Mandatory context
- Load the ai-slop-patterns catalog from knowledge/indexes/
- Read the source ledger for provenance context
- Load the project's voice profile if available

## Procedure
1. Analyze text against known AI-slop patterns
2. Score each pattern occurrence
3. Aggregate into a slop density metric
4. Compare against project's quality threshold
5. Return findings with severity and remediation suggestions

## Invariants
- Slop detection is evidence, not verdict
- Always suggest concrete replacements
- Never reject text solely based on AI-slop score
- Human review required for HIGH severity findings

## Output
```yaml
status: pass | warning | fail
slop_score: 0.0-1.0
findings:
  - pattern: "hollow-intensifier"
    span: "the absolute best"
    severity: medium
    suggestion: "Be specific about what makes it best"
remediation:
  - replace hollow intensifiers with specific claims
  - add concrete evidence
  - vary sentence structure
```

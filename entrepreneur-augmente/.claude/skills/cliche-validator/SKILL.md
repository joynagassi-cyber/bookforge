---
name: "cliche-validator"
description: "Validate text for clichés and overused expressions."
version: "0.2.0"
triggers:
  - "cliche-validator"
  - "check cliches"
scope: "task-bounded"
owner: "bookforge"
---

# Cliché Validator

## Purpose
Detect clichés, platitudes, and overused expressions in text.

## Activation
Activate when reviewing text for originality and fresh expression.

## Mandatory context
- Load the cliches catalog from knowledge/catalogs/cliches.csv
- Load the rhetorical-devices catalog for alternatives
- Read the voice profile for project-specific cliche tolerance

## Procedure
1. Scan text against known cliché patterns
2. Identify metaphorical and literal clichés
3. Suggest fresh alternatives based on context
4. Calculate cliche density score
5. Flag project-specific banned phrases

## Invariants
- Cliché detection is advisory, not blocking
- Suggestions must fit the project's voice
- Never flag domain-specific technical terms as clichés
- Distinguish between accepted idioms and hollow clichés

## Output
```yaml
status: pass | warning | fail
cliche_density: 0.0-1.0
findings:
  - text: "think outside the box"
    type: "metaphorical-cliche"
    severity: low
    alternatives:
      - "approach the problem differently"
      - "consider unconventional solutions"
      - "break from standard practice"
remediation:
  - Replace 3 high-severity clichés
  - Review 5 medium-severity for context fit
```

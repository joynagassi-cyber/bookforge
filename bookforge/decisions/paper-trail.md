# BookForge Paper Trail
# Immutable decision log - append only, never modify past entries

## Entries

### Decision Log Format

```yaml
id: DEC-NNN
date: ISO-8601
phase: current-phase
actor: agent-name | human
summary: "Brief description of decision"
context:
  artifact: "path/to/artifact.md"
  rationale: "Why this decision was made"
  alternatives_considered:
    - "Option A - reason rejected"
    - "Option B - reason rejected"
status: approved | rejected | superseded
supersedes: DEC-NNN  # if applicable
signatures:
  - agent: writer
    approved_at: ISO-8601
  - agent: human
    approved_at: ISO-8601
```

### Current Phase
null

### Active Decisions
(empty until first decision)

### Approved Artifacts
(empty until artifacts are approved)

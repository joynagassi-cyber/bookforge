---
name: "voice-drift-detector"
description: "Detect divergence from the approved author voice."
version: "0.2.0"
triggers:
  - "voice-drift-detector"
scope: "task-bounded"
owner: "bookforge"
---

# voice-drift-detector

## Activation
Activate only when the request matches this skill's responsibility.

## Mandatory context
Load the task packet, owning canonical artifacts, and only the catalog entries required for the task.

## Procedure
1. Inspect current state and artifact status.
2. Validate prerequisites.
3. Execute only the bounded responsibility of this skill.
4. Produce typed findings and proposed changes.
5. Run the local validation required by the workflow.
6. Persist changes through the owning artifact workflow.

## Invariants
- Never invent missing evidence.
- Never silently override another workflow's canonical artifact.
- Never widen scope without a reroute.
- Surface uncertainty explicitly.
- Preserve source/provenance information when applicable.

## Output
Return:
- `status`
- `result`
- `evidence`
- `changes`
- `risks`
- `next_workflow`

## Progressive disclosure
Detailed reference material is in `references/DETAILS.md`.
Load additional resources only when the task requires them.

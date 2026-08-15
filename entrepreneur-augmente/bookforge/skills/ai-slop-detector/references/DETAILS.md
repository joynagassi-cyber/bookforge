# ai-slop-detector

## Purpose

Detect generic, formulaic and low-specificity prose patterns.

## Activation

Activate only when the task matches the skill's declared responsibility.

## Context requirements

Load:

1. current task packet;
2. owning canonical artifacts;
3. only relevant catalog entries;
4. direct dependencies.

## Invariants

- Do not invent facts.
- Do not silently expand scope.
- Preserve canonical artifact ownership.
- Emit structured findings.

## Output contract

Return:

- result;
- changes;
- evidence;
- risks;
- recommended next workflow.

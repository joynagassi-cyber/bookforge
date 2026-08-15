# metadata

## Purpose

Create marketplace metadata

## Phase

publishing

## Inputs

See the corresponding artifact contract and task packet.

## Procedure

1. inspect current canonical state;
2. load only required context;
3. execute the bounded task;
4. validate outputs;
5. persist canonical changes;
6. emit findings and next action.

## Stop conditions

- required artifact missing;
- contradictory canonical state;
- unresolved CRITICAL finding;
- insufficient evidence;
- human approval required.

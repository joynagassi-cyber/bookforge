# Runtime Adapter Contract

BookForge does not assume a universal agent runtime API.

An adapter translates generic BookForge operations into a specific environment.

## Required adapter operations

```text
discover()
install()
invoke_agent(agent_id, context_packet)
run_workflow(workflow_id, inputs)
read_artifact(path)
write_artifact(path, content)
list_artifacts(query)
run_command(command)
run_validator(validator_id, target)
request_human_gate(gate_id, report)
```

## Adapter behavior

The adapter must preserve:

- artifact paths;
- operation status;
- run id;
- agent/workflow id;
- error messages;
- validator findings.

## IDE adapters

The adapter may install:

- `.claude/skills/`
- `.agents/skills/`
- IDE-specific instruction files
- generated prompt wrappers

The core artifacts remain IDE-neutral.

## CLI adapters

A CLI adapter can invoke an external runtime, for example:

- Claude Code
- Codex
- OpenCode
- KiloCode
- custom local agent

The external program is an implementation detail.

## Safety

Adapters must never silently replace canonical artifacts. Writes should be atomic where practical.

---
name: "demo-agent"
description: "Example agent for demonstration purposes"
version: "0.1.0"
scope: "task-bounded"
owner: "bookforge.demo"
---

# Demo Agent

## Purpose
This is a demonstration agent that shows how to create a BookForge module agent.

## Activation
Activate when the user requests demo-related tasks.

## Procedure
1. Load the task context
2. Process according to the demo workflow
3. Return structured findings

## Output Format
- status: completed | pending | blocked
- findings: array of observations
- next_workflow: recommended workflow ID

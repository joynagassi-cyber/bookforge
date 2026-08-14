# Graph Provider Selection

Default: `json` so BookForge remains zero-service and portable.

Recommended production path: Neo4j when a persistent queryable graph is required across agents and machines.

Recommended memory-oriented path: Neo4j Agent Memory when hybrid graph/vector memory and MCP-native memory operations are desired.

Optional community adapter: MemoryGraph.

The graph provider is replaceable. BookForge canonical Markdown/JSON artifacts remain authoritative.

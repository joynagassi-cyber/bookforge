# Book Graph Memory

BookForge maintains two layers:

1. Canonical layer: Markdown/JSON/YAML artifacts in Git.
2. Projection layer: graph database or event log.

The projection is continuously updated from validated events.

## Recommended stack

For zero-dependency local mode: JSONL event log.

For a durable queryable graph: Neo4j + MCP. Neo4j's official MCP server supports MCP clients such as Claude, Cursor and VS Code and exposes structured graph access.

For memory-centric operation: Neo4j Agent Memory, which exposes hybrid vector+graph memory through MCP and supports Claude Code, Cursor and other MCP hosts.

Community option: MemoryGraph, a graph-based MCP memory server.

## Real-time path

```text
artifact save
   ↓
filesystem watcher
   ↓
artifact hash
   ↓
graph event
   ↓
validation
   ↓
provider adapter
   ↓
Neo4j / local graph
   ↓
agent retrieval
```

The watcher is near-real-time. External provider writes must remain idempotent and provenance-bound.

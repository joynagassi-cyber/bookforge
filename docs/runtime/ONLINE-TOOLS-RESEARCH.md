# Online / CLI integrations worth supporting

## 1. Agent Skills CLI

`npx skills add` is a strong interoperability layer for distributing BookForge launcher skills. The project documents support for Claude Code, Cursor, Codex, OpenCode and many other agents, with project and global installation modes. BookForge should publish standard `SKILL.md` launchers rather than creating one proprietary prompt format.

## 2. Neo4j MCP

Neo4j maintains an official MCP server. It gives MCP-compatible clients structured access to Neo4j and can therefore serve as a graph projection/retrieval surface while BookForge keeps files canonical.

## 3. Graphiti

Graphiti is an open-source temporal context-graph framework with incremental updates, provenance, temporal validity and hybrid retrieval. It also exposes an MCP server. It is particularly interesting for BookForge because a book graph is not static: characters, claims, chapter decisions, sources and canonical facts change over time.

## 4. Recommended BookForge hierarchy

```text
BookForge artifacts / Git
        = canonical truth

BookForge event log
        = deterministic change stream

Neo4j or Graphiti
        = projection / acceleration layer

MCP / Agent Skills
        = host-facing interface
```

This avoids turning an external graph or agent protocol into a hidden source of truth.

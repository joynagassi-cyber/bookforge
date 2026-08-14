# BookForge Architecture

## 1. Purpose

BookForge is a domain-specific application of context engineering for long-form book production.
It borrows the strongest structural ideas of specification-driven agent frameworks while keeping the
domain model independent from any particular implementation runtime.

The framework is split into:

1. Core contracts
2. Context engine
3. Artifact/state layer
4. Agent layer
5. Workflow layer
6. Quality/integrity layer
7. Knowledge catalogs
8. Runtime adapters

## 2. Core invariant

No agent is allowed to make an irreversible project-level assumption that is not reflected in a
canonical artifact.

Chat history is ephemeral. Canonical artifacts are persistent.

## 3. Logical layers

```text
┌────────────────────────────────────────────────────────────┐
│                    USER / AUTHOR                          │
└────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│                    ROUTER / HELP                         │
│ complexity · intent · next workflow · readiness          │
└────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
        UPSTREAM / SPEC                DOWNSTREAM / EXEC
        intent → research             chapter → packaging
        → book contract               → distribution
                │                           │
                └─────────────┬─────────────┘
                              ▼
┌────────────────────────────────────────────────────────────┐
│                 CONTEXT ENGINE                            │
│ progressive disclosure · retrieval · compression          │
│ task context · scope isolation · budgets                  │
└────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│                  CANONICAL ARTIFACTS                       │
│ contract · outline · style bible · source ledger           │
│ continuity · decisions · state · QA reports                │
└────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│          AGENTS + WORKFLOWS + VALIDATORS                   │
└────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│             IDE / CLI / HOST ADAPTERS                      │
└────────────────────────────────────────────────────────────┘
```

## 4. Upstream / Downstream

### Upstream

Upstream establishes intent and constraints:

- idea validation
- audience and positioning
- research
- book contract
- genre model
- outline
- voice and style
- design direction
- publishing strategy

Upstream outputs are treated as specification artifacts.

### Downstream

Downstream executes bounded work:

- chapter drafting
- revision
- continuity correction
- fact checking
- illustration briefs
- packaging
- metadata
- launch assets

The downstream agent should receive the smallest complete context required for its task.

## 5. Scale-adaptive mode

BookForge selects the smallest workflow that safely satisfies the task.

Examples:

- typo → direct edit + local QA
- paragraph rewrite → local editing workflow
- new chapter → chapter planning + drafting + QA
- structural change → outline reconciliation + impact analysis
- new book → complete upstream flow
- publication → packaging + metadata + integrity + release gate

A change classified as high-impact must not bypass upstream reconciliation.

## 6. Multi-agent model

Default roles are:

- Librarian / Context Engineer
- Analyst
- Book Architect
- Researcher
- Outline Architect
- Voice Director
- Chapter Writer
- Developmental Editor
- Line Editor
- Copy Editor
- Fact Checker
- Continuity Auditor
- Originality / Similarity Auditor
- AI-Slop Auditor
- Cliche Auditor
- Human-Voice Editor
- Packaging Director
- Metadata Strategist
- Launch Marketer
- Release Gatekeeper

Agents are not autonomous by default. They operate through workflows and explicit artifacts.

## 7. Party mode

Party mode is an optional coordination pattern in which multiple specialist agents review one bounded
artifact from different perspectives. It must not become unrestricted conversation. Each participant
receives the same artifact contract and produces a typed finding set.

## 8. Extension model

Everything below is extensible without modifying the core:

- agents
- workflows
- catalogs
- validators
- adapters
- templates
- schemas
- evaluation suites

# BookForge Architecture Derived from BMAD Patterns

BMAD currently uses an installer that materializes agents, workflows, tasks and tools as IDE-loadable skills. Its modules are installable units and its installer regenerates skills when modules change.

BookForge adopts the useful architectural pattern but changes the domain model:

```text
BMAD pattern                 BOOKFORGE equivalent
-----------------------------------------------------------
module                       module / book domain pack
agent                        agent / editorial role
workflow                     book workflow
skill                        host-loadable instruction
artifact                     canonical book artifact
project context              PROJECT-CONSTITUTION + state
module help                  bookforge-help
module setup                 plugin registration
progressive disclosure      retrieval + context-packet
MCP/tool integration         adapter layer
```

## Critical difference

BookForge treats canonical artifacts as the source of truth and the graph as a projection. A graph failure must not destroy the book.

## Scale-adaptive execution

```text
idea
 ├─ quick edit → task → validator
 ├─ chapter → chapter workflow → context packet → validators
 └─ book architecture → full planning workflow → graph/index build → chapter workflows
```

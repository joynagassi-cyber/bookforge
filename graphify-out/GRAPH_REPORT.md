# Graph Report - bookforge-runtime-v0.5.0  (2026-08-14)

## Corpus Check
- 51 files · ~27,314 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 129 nodes · 187 edges · 9 communities detected
- Extraction: 69% EXTRACTED · 31% INFERRED · 0% AMBIGUOUS · INFERRED: 58 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]

## God Nodes (most connected - your core abstractions)
1. `mkdir()` - 15 edges
2. `main()` - 12 edges
3. `bfPath()` - 10 edges
4. `readJson()` - 8 edges
5. `generate()` - 8 edges
6. `loadRegistry()` - 7 edges
7. `saveRegistry()` - 7 edges
8. `initProject()` - 6 edges
9. `main()` - 6 edges
10. `writeJson()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `graphStatus()`  [INFERRED]
  lib\cli\main.js → lib\installer\installer.js
- `write_json()` --calls--> `mkdir()`  [INFERRED]
  scripts\catalog\_lib.py → runtime\core\io.js
- `load_master()` --calls--> `get()`  [INFERRED]
  scripts\catalog\_lib.py → runtime\plugin\registry.js
- `main()` --calls--> `initProject()`  [INFERRED]
  lib\cli\main.js → lib\installer\installer.js
- `main()` --calls--> `status()`  [INFERRED]
  lib\cli\main.js → runtime\bookforge_cli\bookforge\cli.py

## Communities

### Community 0 - "Community 0"
Cohesion: 0.2
Nodes (13): loadWorkflow(), plan(), start(), transition(), generate(), hostSpec(), target(), bfPath() (+5 more)

### Community 1 - "Community 1"
Cohesion: 0.27
Nodes (11): main(), enable(), get(), list(), loadRegistry(), register(), registryPath(), remove() (+3 more)

### Community 2 - "Community 2"
Cohesion: 0.22
Nodes (8): pack(), contextPack(), load(), search(), flatten(), loadMaps(), route(), safe()

### Community 3 - "Community 3"
Cohesion: 0.19
Nodes (8): activate(), items(), main(), main(), main(), mkdir(), writeText(), create()

### Community 4 - "Community 4"
Cohesion: 0.38
Nodes (9): configureHost(), cp(), graphStatus(), initProject(), installPlugin(), mkdir(), readJson(), status() (+1 more)

### Community 5 - "Community 5"
Cohesion: 0.33
Nodes (7): sync(), arg(), has(), main(), positionals(), projectDir(), watch()

### Community 6 - "Community 6"
Cohesion: 0.47
Nodes (8): catalog_status(), init_project(), load_manifest(), main(), route(), status(), validate(), exists()

### Community 7 - "Community 7"
Cohesion: 0.6
Nodes (5): copyDir(), install(), readManifest(), stageGithub(), stageNpm()

### Community 8 - "Community 8"
Cohesion: 0.4
Nodes (2): load_master(), write_json()

## Knowledge Gaps
- **Thin community `Community 8`** (5 nodes): `load_master()`, `slug()`, `stable_hash()`, `write_json()`, `_lib.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `mkdir()` connect `Community 3` to `Community 0`, `Community 1`, `Community 6`, `Community 7`, `Community 8`?**
  _High betweenness centrality (0.229) - this node is a cross-community bridge._
- **Why does `main()` connect `Community 5` to `Community 2`, `Community 4`, `Community 6`?**
  _High betweenness centrality (0.178) - this node is a cross-community bridge._
- **Why does `generate()` connect `Community 0` to `Community 3`, `Community 4`?**
  _High betweenness centrality (0.177) - this node is a cross-community bridge._
- **Are the 13 inferred relationships involving `mkdir()` (e.g. with `init_project()` and `sync()`) actually correct?**
  _`mkdir()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `main()` (e.g. with `initProject()` and `status()`) actually correct?**
  _`main()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Are the 9 inferred relationships involving `bfPath()` (e.g. with `loadMaps()` and `eventFiles()`) actually correct?**
  _`bfPath()` has 9 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `readJson()` (e.g. with `safe()` and `sync()`) actually correct?**
  _`readJson()` has 6 INFERRED edges - model-reasoned connections that need verification._
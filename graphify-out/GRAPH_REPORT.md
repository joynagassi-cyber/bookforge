# Graph Report - bookforge-runtime-v0.5.0  (2026-08-17)

## Corpus Check
- 100 files · ~105,671 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 415 nodes · 895 edges · 17 communities detected
- Extraction: 66% EXTRACTED · 34% INFERRED · 0% AMBIGUOUS · INFERRED: 306 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]

## God Nodes (most connected - your core abstractions)
1. `exists()` - 52 edges
2. `bfPath()` - 38 edges
3. `mkdir()` - 33 edges
4. `log()` - 28 edges
5. `loadRegistry()` - 25 edges
6. `readJson()` - 22 edges
7. `main()` - 20 edges
8. `writeJson()` - 20 edges
9. `initProject()` - 14 edges
10. `interactiveInstall()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `mkdir()` --calls--> `write_json()`  [INFERRED]
  runtime\core\io.js → scripts\catalog\_lib.py
- `exists()` --calls--> `listGeneratedSkills()`  [INFERRED]
  runtime\core\io.js → runtime\host\skill-generator.js
- `list()` --calls--> `listInstalled()`  [INFERRED]
  runtime\plugin\registry.js → runtime\plugin\installer.js
- `main()` --calls--> `log()`  [INFERRED]
  bin\bookforge-party.js → lib\installer\wizard.js
- `main()` --calls--> `find()`  [INFERRED]
  bin\bookforge-party.js → runtime\graph\api.js

## Communities

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (44): autoBuildPacket(), buildBatchPackets(), buildQualityTargets(), extractField(), getRelevantPatterns(), loadBookContract(), loadContinuityNotes(), loadStyleBible() (+36 more)

### Community 1 - "Community 1"
Cohesion: 0.15
Nodes (31): uninstall(), checkCompatibility(), count(), detectType(), disable(), enable(), getAgent(), getPluginPath() (+23 more)

### Community 2 - "Community 2"
Cohesion: 0.1
Nodes (23): items(), main(), main(), main(), main(), load_master(), write_json(), apply_legacy_defaults() (+15 more)

### Community 3 - "Community 3"
Cohesion: 0.1
Nodes (21): createRunLog(), gradeResult(), listFixtures(), loadAllFixtures(), loadFixture(), saveRunLog(), generateReport(), runAllGoldenCases() (+13 more)

### Community 4 - "Community 4"
Cohesion: 0.21
Nodes (27): check(), main(), doctor(), ask(), confirm(), detectHosts(), expandModuleSelection(), getGitUserName() (+19 more)

### Community 5 - "Community 5"
Cohesion: 0.1
Nodes (20): createExecutionPacket(), sync(), copyDir(), install(), listInstalled(), readManifest(), stageFile(), stageGithub() (+12 more)

### Community 6 - "Community 6"
Cohesion: 0.13
Nodes (19): activate(), findBestHost(), generateHostBridge(), loadHostSpecs(), mapCapabilityToHost(), resolveCapabilities(), generate(), hostSpec() (+11 more)

### Community 7 - "Community 7"
Cohesion: 0.16
Nodes (20): checkActivation(), deactivate(), find_skills_in_dir(), main(), parse_args(), Find all SKILL.md files in a directory tree., catalog_status(), init_project() (+12 more)

### Community 8 - "Community 8"
Cohesion: 0.24
Nodes (18): abortRun(), evaluateCondition(), executeStep(), getRun(), getRunArtifacts(), loadRun(), loadWorkflow(), loadWorkflowFile() (+10 more)

### Community 9 - "Community 9"
Cohesion: 0.26
Nodes (14): main(), appendMemory(), clearMemory(), getMemory(), initMemory(), memoryDir(), addMember(), addTurn() (+6 more)

### Community 10 - "Community 10"
Cohesion: 0.28
Nodes (14): cp(), detectHosts(), detectInstalledHosts(), exists(), getAllAgents(), getAllSkills(), getAllWorkflows(), initProject() (+6 more)

### Community 11 - "Community 11"
Cohesion: 0.27
Nodes (10): conflicts(), deleteNode(), find(), get(), listEvents(), neighborhood(), related(), upsert() (+2 more)

### Community 12 - "Community 12"
Cohesion: 0.29
Nodes (11): checkAISlop(), checkCliches(), checkContinuity(), checkRepetition(), checkVoice(), extractDescription(), getValidators(), hasCriticalFindings() (+3 more)

### Community 13 - "Community 13"
Cohesion: 0.53
Nodes (5): extractAll(), extractL0(), extractL1(), extractL2(), saveExtracted()

### Community 14 - "Community 14"
Cohesion: 0.6
Nodes (3): applyBudget(), estimateTokens(), truncateToBudget()

### Community 15 - "Community 15"
Cohesion: 0.6
Nodes (3): normalizeEvent(), standardizeEvent(), validateEventType()

### Community 16 - "Community 16"
Cohesion: 0.83
Nodes (3): benchmark(), main(), setupBenchmarkProject()

## Knowledge Gaps
- **5 isolated node(s):** `Find all SKILL.md files in a directory tree.`, `Load a YAML file, returning empty dict if file doesn't exist.`, `Save data to a YAML file.`, `Read legacy config files and return core/module value dicts.`, `Apply legacy values as fallback defaults.`
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `exists()` connect `Community 7` to `Community 0`, `Community 1`, `Community 2`, `Community 5`, `Community 6`, `Community 8`, `Community 9`, `Community 12`?**
  _High betweenness centrality (0.188) - this node is a cross-community bridge._
- **Why does `log()` connect `Community 4` to `Community 3`, `Community 5`, `Community 6`, `Community 9`, `Community 10`, `Community 11`, `Community 16`?**
  _High betweenness centrality (0.129) - this node is a cross-community bridge._
- **Why does `main()` connect `Community 5` to `Community 0`, `Community 3`, `Community 4`, `Community 6`, `Community 7`, `Community 10`?**
  _High betweenness centrality (0.113) - this node is a cross-community bridge._
- **Are the 51 inferred relationships involving `exists()` (e.g. with `find_skills_in_dir()` and `main()`) actually correct?**
  _`exists()` has 51 INFERRED edges - model-reasoned connections that need verification._
- **Are the 37 inferred relationships involving `bfPath()` (e.g. with `registryPath()` and `loadBookContract()`) actually correct?**
  _`bfPath()` has 37 INFERRED edges - model-reasoned connections that need verification._
- **Are the 31 inferred relationships involving `mkdir()` (e.g. with `main()` and `save_yaml_file()`) actually correct?**
  _`mkdir()` has 31 INFERRED edges - model-reasoned connections that need verification._
- **Are the 16 inferred relationships involving `log()` (e.g. with `check()` and `main()`) actually correct?**
  _`log()` has 16 INFERRED edges - model-reasoned connections that need verification._
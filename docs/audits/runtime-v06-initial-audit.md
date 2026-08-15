# Runtime v0.6 — Audit Initial du Dépôt BookForge

**Date :** 2026-08-14
**Version audité :** 2.2.0
**Objectif :** Documenter l'état actuel avant d'implémenter le Runtime v0.6

---

## 1. Architecture Actuelle

```
┌─────────────────────────────────────────────────────────────┐
│                    USER / AUTHOR                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    CLI (bin/bookforge.js)                   │
│  install | validate | status | route | workflow | plugin    │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
      ┌─────────────────┐         ┌─────────────────┐
      │ Installer       │         │ Runtime         │
      │ (lib/installer) │         │ (runtime/)      │
      └─────────────────┘         └─────────────────┘
                │                           │
                ▼                           ▼
      ┌─────────────────┐         ┌─────────────────┐
      │ Project         │         │ Workflow Engine │
      │ bookforge/      │         │ (state machine) │
      └─────────────────┘         └─────────────────┘
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
      ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
      │ Plugin      │ │ Context     │ │ Graph       │
      │ System      │ │ Router      │ │ Sync        │
      └─────────────┘ └─────────────┘ └─────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
      ┌─────────────────┐         ┌─────────────────┐
      │ Host Generator  │         │ Party Mode      │
      │ (adapters/)     │         │ (multi-agent)   │
      └─────────────────┘         └─────────────────┘
```

### Sous-systèmes identifiés

| Sous-système | Fichier principal | Lignes | Statut |
|-------------|-------------------|--------|--------|
| CLI | `lib/cli/main.js` | ~40 | ✅ Fonctionnel |
| Installer | `lib/installer/installer.js` | ~45 | ✅ Fonctionnel |
| Workflow Engine | `runtime/workflow/engine.js` | ~220 | ✅ Fonctionnel |
| Plugin Registry | `runtime/plugin/registry.js` | ~120 | ✅ Fonctionnel |
| Plugin Installer | `runtime/plugin/installer.js` | ~90 | ✅ Fonctionnel |
| Plugin Activation | `runtime/plugin/activation.js` | ~100 | ✅ Fonctionnel |
| Context Router | `runtime/context/router.js` | ~80 | ✅ Fonctionnel |
| Context Packer | `runtime/context/packer.js` | ~60 | ✅ Fonctionnel |
| Retrieval | `runtime/retrieval.js` | ~15 | ⚠️ Minimal |
| Graph Synchronizer | `runtime/graph/synchronizer.js` | ~80 | ✅ Fonctionnel |
| JSONL Provider | `runtime/providers/jsonl.js` | ~70 | ✅ Fonctionnel |
| Neo4j Provider | `runtime/providers/neo4j.js` | ~70 | ✅ Fonctionnel |
| Host Generator | `runtime/host/generator.js` | ~15 | ✅ Fonctionnel |
| Party Orchestrator | `runtime/party/orchestrator.js` | ~80 | ✅ Fonctionnel |
| Party Memory | `runtime/party/memory.js` | ~60 | ✅ Fonctionnel |
| Watch | `runtime/watch.js` | ~15 | ⚠️ Minimal |
| CLI Runtime | `runtime/cli-runtime.js` | ~10 | ✅ Fonctionnel |

---

## 2. Modules Existants

### 2.1 Plugin System (runtime/plugin/)

**Fichiers :**
- `registry.js` — CRUD registry, validation manifest, dependency check
- `installer.js` — Install from npm/github/file, stage, copy
- `activation.js` — Generate host skills from plugin entrypoints

**Limitations identifiées :**
- Pas de système de Modules (seulement Plugins)
- Pas de lockfile pour les dépendances
- Pas de Capability Registry
- Pas de versioning contractuel

### 2.2 Workflow Engine (runtime/workflow/)

**Fichiers :**
- `engine.js` — State machine, plan/start/transition/execute

**Limitations identifiées :**
- Les workflows n'ont pas de steps structurés (pas de dependencies, conditions)
- Pas d'agent resolution dans le workflow
- Pas de context budget enforcement
- Pas de memory extraction post-execution

### 2.3 Context Engine (runtime/context/)

**Fichiers :**
- `router.js` — Route task → required/optional catalogs
- `packer.js` — Build context packet from route

**Limitations identifiées :**
- Retrieval is purely lexical (no semantic)
- Pas de graph-based retrieval
- Pas de progressive disclosure enforcement
- Pas de token budget enforcement

### 2.4 Graph System (runtime/graph/)

**Fichiers :**
- `synchronizer.js` — Event emit, sync, get, list
- `providers/jsonl.js` — JSONL storage
- `providers/neo4j.js` — Neo4j storage

**Limitations identifiées :**
- Pas d'API graph abstraite (find, neighborhood, etc.)
- Pas de graph contract formel (seulement schema)
- Pas de memory system (seulement party memory)
- Les providers sont fonctionnels mais pas abstraits

---

## 3. Agents Existants

**Nombre :** 21 agents dans `agents/`

| Agent | Fichier | Lignes | Purpose |
|-------|---------|--------|---------|
| ai-slop-auditor | AGENT.md | 27 | Detect generic AI prose |
| analyst | AGENT.md | 27 | Validate idea/audience |
| book-architect | AGENT.md | 27 | Book contract & architecture |
| cliche-auditor | AGENT.md | 27 | Detect clichés |
| context-engineer | AGENT.md | 27 | Context management |
| continuity-auditor | AGENT.md | 27 | Cross-chapter continuity |
| copy-editor | AGENT.md | 27 | Copy editing |
| developmental-editor | AGENT.md | 27 | Structural editing |
| fact-checker | AGENT.md | 27 | Fact verification |
| human-voice-editor | AGENT.md | 27 | Human voice refinement |
| launch-marketer | AGENT.md | 27 | Launch marketing |
| line-editor | AGENT.md | 27 | Line editing |
| metadata-strategist | AGENT.md | 27 | Metadata optimization |
| originality-auditor | AGENT.md | 27 | Originality checking |
| outline-architect | AGENT.md | 27 | Outline creation |
| packaging-director | AGENT.md | 27 | Packaging for publication |
| plagiarism-auditor | AGENT.md | 27 | Plagiarism detection |
| release-gatekeeper | AGENT.md | 27 | Release validation |
| researcher | AGENT.md | 27 | Research gathering |
| voice-director | AGENT.md | 27 | Voice/style direction |
| writer | AGENT.md | 27 | Chapter drafting |

**Limitations :**
- Pas de system prompts détaillés (seulement AGENT.md)
- Pas d'agent resolver
- Pas d'exécution packet standard

---

## 4. Workflows Existants

**Nombre :** 17 workflows dans `workflows/`

| Workflow | Phase | Purpose |
|----------|-------|---------|
| book-contract | upstream | Create/update book contract |
| book-edit | editing | Run manuscript editing |
| chapter-plan | execution | Prepare chapter packet |
| chapter-qa | quality | Validate chapter quality |
| correct-course | governance | Major change reconciliation |
| deep-research | upstream | Comprehensive research |
| draft-chapter | execution | Write one chapter |
| help | any | Help and routing |
| idea-validation | upstream | Validate book idea |
| integrity-audit | quality | Full manuscript audit |
| launch | downstream | Launch preparation |
| metadata | downstream | Metadata optimization |
| outline | upstream | Create/update outline |
| packaging | downstream | Package for publication |
| readiness-check | quality | Check upstream readiness |
| release-gate | quality | Final release validation |
| voice-profile | upstream | Define voice/profile |

**Limitations :**
- Pas de steps avec dependencies
- Pas de agents assignés aux steps
- Pas de validators assignés
- Format WORKFLOW.md simple (pas de structure YAML complexe)

---

## 5. Skills Existants

**Nombre :** 28 skills dans `skills/`

Chaque skill a :
- `SKILL.md` — Instructions
- `references/` — References complémentaires

**Limitations :**
- Pas de skill resolver
- Pas de dépendances entre skills
- Pas de versionning

---

## 6. Runtime Exist

### 6.1 State Machine

**États définis :**
```
READY → CONTEXT_BUILT → EXECUTING → VALIDATING → REVISING → GATED → COMMITTED
                                                          ↓
                                                    FAILED
                                                    ABORTED
```

**Transitions validées :** Oui, strictes dans `engine.js`

### 6.2 Event Model

**Format actuel :**
```json
{
  "event_id": "evt-123",
  "operation": "draft",
  "agent": "writer",
  "workflow": "draft-chapter",
  "emitted_at": "2026-08-14T..."
}
```

**Limitations :**
- Pas de standardisation complète
- Pas de schema formel pour tous les événements
- Pas d'événements memory/workflow/quality standardisés

---

## 7. Plugin System

**Implémenté :**
- Registry CRUD (register, list, get, enable, disable, remove)
- Manifest validation
- Dependency checking
- Host skill generation

**Limitations :**
- Pas de module system
- Pas de lockfile
- Pas de capability registry
- Versioning basique

---

## 8. Graph System

**Implémenté :**
- JSONL provider (fonctionnel)
- Neo4j provider (fonctionnel)
- Event emit/sync/get/list
- Idempotent sync avec hash

**Limitations :**
- Pas d'API graph abstraite
- Pas de types de noeuds standardisés
- Pas de policy d'extraction
- Graph est une projection (comme spécifié)

---

## 9. Host System

**Implémenté :**
- 13 hosts dans `specs/hosts/host-adapters.json`
- Host generator génère skills pour chaque hôte
- Capacité de détection auto

**Limitations :**
- Pas de host bridge abstrait
- Pas de capability matching
- Pas de skill generator générique

---

## 10. Tests Existants

**Nombre :** 45 tests, 100% passing

| Catégorie | Tests | Fichier |
|-----------|-------|---------|
| Workflow Engine | 7 | `tests/runtime/workflow-engine.test.js` |
| Plugin System | 7 | `tests/runtime/plugin-system.test.js` |
| Context Router | 7 | `tests/runtime/context-router.test.js` |
| Graph Sync | 5 | `tests/runtime/graph-sync.test.js` |
| Party Mode | 7 | `tests/runtime/party-mode.test.js` |
| Golden Routing | 5 | `tests/golden/routing.test.js` |
| Golden Quality | 1 | `tests/golden/quality.test.js` |
| Golden Continuity | 2 | `tests/golden/continuity.test.js` |

**Limitations :**
- Pas de tests d'intégration
- Pas de tests E2E
- Pas de tests de performance
- Golden cases limités

---

## 11. Incohérences Identifiées

### 11.1 Versioning

| Élément | Version actuelle | Problème |
|---------|------------------|----------|
| package.json | 2.2.0 | Version npm |
| bookforge.yaml | 0.5.0 | Version framework |
| MANIFEST.json | 0.5.0 | Version manifest |
| runtime/*.js | 0.5.0 | Version runtime |
| schemas/*.json | 1.0.0 | Version schema |

**Problème :** 4 versions différentes pour le même système.

### 11.2 Workflow Manifest vs Workflow File

- `manifests/workflows.json` définit les workflows avec `entry`, `requires`, `human_approval`
- `workflows/<id>/WORKFLOW.md` contient les instructions détaillées
- Il n'y a pas de lien explicite entre les deux dans le code

### 11.3 Context Router vs Retrieval

- `runtime/context/router.js` fait le routing
- `runtime/retrieval.js` fait la recherche
- Mais `runtime/retrieval.js` est très minimal (15 lignes)
- Le router ne utilise pas le retrieval directement

---

## 12. Risques

### 12.1 Risques Architecturaux

1. **Pas de module system** — Les plugins sont limités, pas de composition
2. **Pas de capability registry** — Le runtime ne sait pas ce qui est disponible
3. **Pas de memory system** — Seule la party mode a de la mémoire
4. **Pas de quality engine** — Les validators sont des skills, pas un système
5. **Pas de host bridge** — La génération de skills est directe, pas via bridge

### 12.2 Risques Fonctionnels

1. **Context budget non enforce** — Le packer génère mais ne limite pas
2. **Workflow steps non structurés** — Pas de dependencies entre steps
3. **Pas de graph API** — Les providers sont accédés directement
4. **Pas de event model standardisé** — Chaque provider définit ses events

---

## 13. Gaps par rapport au Runtime v0.6 Spec

| Phase | Spec v0.6 | État Actuel | Gap |
|-------|-----------|-------------|-----|
| Phase 1 | Versioning | 4 versions différentes | 🔴 Critique |
| Phase 2 | Module System | Plugin System seulement | 🔴 Critique |
| Phase 3 | Module Registry + Lockfile | Plugin Registry seulement | 🔴 Critique |
| Phase 4 | Capability Registry | Aucun | 🔴 Critique |
| Phase 5 | Agent Resolver | Aucun | 🔴 Critique |
| Phase 6 | Execution Packet | Context Packet seulement | 🟡 Important |
| Phase 7 | Context Router | Routeur existant | 🟢 Exists |
| Phase 8 | Context Budget | Non enforce | 🟡 Important |
| Phase 9 | Workflow Engine v0.6 | Engine existant | 🟡 Important |
| Phase 10 | Run State Machine | Implémenté | 🟢 Exists |
| Phase 11 | Host Bridge | Host Generator direct | 🟡 Important |
| Phase 12 | Skill Generator | Dans activation.js | 🟡 Important |
| Phase 13 | Memory System | Party memory seulement | 🔴 Critique |
| Phase 14 | Memory Extraction | Aucun | 🔴 Critique |
| Phase 15 | Graph API | Aucun | 🔴 Critique |
| Phase 16 | Graph Contract | Schema existant | 🟢 Exists |
| Phase 17 | Graph Examples | Aucun | 🟡 Important |
| Phase 18 | Event Model | Basic | 🟡 Important |
| Phase 19 | Graph Projection | Implémenté | 🟢 Exists |
| Phase 20 | Quality Engine | Validators分散 | 🔴 Critique |
| Phase 21 | Quality Gate | Gates文档és | 🟡 Important |
| Phase 22 | Doctor Command | Aucun | 🟡 Important |
| Phase 23 | Golden Path E2E | Aucun | 🔴 Critique |
| Phase 24 | Tests | 45 passing | 🟢 Exists |
| Phase 25 | Migration | Aucun | N/A |
| Phase 26 | Documentation | Partial | 🟡 Important |
| Phase 27 | Performance | Aucun | 🟡 Important |
| Phase 28 | Offline First | ✅ Respecté | 🟢 Exists |
| Phase 29 | Security | Aucun audit | 🟡 Important |
| Phase 30 | Final Audit | En cours | 🟡 In Progress |

---

## 14. Plan d'Implémentation

### Phase 0 — Audit (EN COURS)
- [x] Identifier tous les composants existants
- [x] Documenter les incohérences
- [x] Lister les gaps

### Phase 1 — Normalisation des Versions
- Créer `docs/VERSIONING.md`
- Créer `specs/runtime/runtime-contract.schema.json`
- Unifier toutes les versions

### Phase 2 — Module System
- Créer `runtime/module/registry.js`
- Créer `runtime/module/resolver.js`
- Migration Plugin → Module
- Créer `examples/modules/bookforge-demo/`

### Phase 3 — Module Registry + Lockfile
- Créer `bookforge/modules/registry.json`
- Créer `bookforge/modules/lock.json`
- Commands: add, install, list, inspect, enable, disable, update, remove

### Phase 4 — Capability Registry
- Créer `runtime/capabilities/registry.js`
- Command: `bookforge capabilities`
- Command: `bookforge capabilities inspect <id>`

### Phase 5 — Agent Resolver
- Créer `runtime/agent/registry.js`
- Créer `runtime/agent/resolver.js`
- Créer `runtime/agent/loader.js`
- Créer `runtime/agent/validator.js`
- Créer `runtime/agent/execution-packet.js`

### Phase 6 — Execution Packet
- Standardiser le format
- Créer `specs/execution-packet.schema.json`
- Command: `bookforge agent packet <agent-id>`

### Phase 7 — Context Router (Enhancement)
- Améliorer le router existant
- Ajouter support semantic
- Ajouter support graph

### Phase 8 — Context Budget
- Enforce le budget dans le packer
- Priorisation L1→L4
- Truncation intelligente

### Phase 9 — Workflow Engine v0.6
- Structurer les steps avec dependencies
- Assign agents aux steps
- Assign validators aux steps
- Conditions et outputs

### Phase 10 — Run State Machine (Validation)
- Valider les transitions existantes
- Ajouter tests pour chaque transition
- Documenter le state machine

### Phase 11 — Host Bridge
- Créer `runtime/host/registry.js`
- Créer `runtime/host/resolver.js`
- Créer `runtime/host/capability-matcher.js`
- Créer `runtime/host/bridge.js`

### Phase 12 — Skill Generator
- Créer `runtime/skill/generator.js`
- Generator générique pour tous les hosts
- Templates par host

### Phase 13 — Memory System
- Créer `runtime/memory/manager.js`
- Créer `runtime/memory/extractor.js`
- Créer `runtime/memory/reconciler.js`
- Créer `runtime/memory/index.js`
- Créer `runtime/memory/policy.js`
- Créer `runtime/memory/events.js`
- 4 types: canonical, working, inferred, conflict

### Phase 14 — Memory Extraction
- L0 deterministic (Markdown parser)
- L1 structural (pattern matching)
- L2 semantic (LLM fallback)

### Phase 15 — Graph API
- Créer `runtime/graph/api.js`
- Methods: find, get, neighborhood, related, upsert, delete, conflicts
- Abstraction au-dessus des providers

### Phase 16 — Graph Contract (Enhancement)
- Formaliser les types
- Créer `node-types.yaml`
- Créer `relationship-types.yaml`
- Créer `extraction-policy.yaml`
- Créer `sync-policy.yaml`

### Phase 17 — Graph Examples
- Créer des exemples complets
- Démo chapter-4 → graph projection

### Phase 18 — Event Model
- Standardiser tous les événements
- Créer `specs/events/event-model.schema.json`
- Événements: artifact, memory, workflow, validation, graph, module

### Phase 19 — Graph Projection
- Conserver l'existant
- Renforcer l'idempotence
- Ajouter incremental sync

### Phase 20 — Quality Engine
- Créer `runtime/quality/engine.js`
- Créer `runtime/quality/registry.js`
- Créer `runtime/quality/runner.js`
- Créer `runtime/quality/report.js`
- Providers: continuity, factuality, originality, ai-slop, cliches, human-voice, style, terminology, citation, structure

### Phase 21 — Quality Gate
- Intégrer dans le workflow engine
- Bloquer si CRITICAL
- Require human pour HIGH

### Phase 22 — Doctor Command
- Créer `bin/bookforge-doctor.js`
- Vérifier: project, config, versions, modules, lockfile, host, runtime, graph, knowledge, workflows, schemas, tests

### Phase 23 — Golden Path E2E
- Créer le scénario complet
- Test: empty project → install → module → workflow → artifact → quality → memory → graph

### Phase 24 — Tests
- Unit tests pour tous les nouveaux composants
- Integration tests
- E2E test

### Phase 25 — Migration
- Migrer Plugin → Module
- Migrer Context Router → Enhanced
- Migrer Graph providers → API

### Phase 26 — Documentation
- Docs pour chaque nouveau composant
- Examples pédagogiques

### Phase 27 — Performance
- Indexing
- Caching
- Incremental sync
- Event replay

### Phase 28 — Offline First
- Valider que tout fonctionne sans Neo4j
- Valider que tout fonctionne sans MCP

### Phase 29 — Security
- Module integrity verification
- Path traversal prevention
- Plugin permission sandbox

### Phase 30 — Final Audit
- Documenter tout ce qui a été fait
- Lister les gaps restants
- Prochaines étapes

---

## 15. Prochaine Phase

**PHASE 1 — NORMALISATION DES VERSIONS**

Action immédiate :
1. Créer `docs/VERSIONING.md`
2. Créer `specs/runtime/runtime-contract.schema.json`
3. Unifier les versions dans le code
4. Ajouter un test de vérification

---

*Audit terminé. Aucune modification n'a été faite au code pendant cet audit.*

# BookForge v0.5.0 — Plan d'Amélioration pour la Création Rapide de Livres

## Synthèse de l'Analyse Complète

### Diagnostic du Codebase

| Composant | État Actuel | Problème |
|-----------|-------------|----------|
| **Skills (28)** | Templates génériques identiques | Pas de contenu procédural réel |
| **Workflows (18+)** | Boilerplate identique | Pas d'orchestration multi-agents |
| **Workflow Engine** | État-machine manuel (9 états) | Pas d'automatisation intelligente |
| **Retrieval** | Lexical pur (`runtime/retrieval.js`) | Pas de recherche sémantique |
| **Quality Engine** | 15 dimensions | Pas de boucle de correction auto |
| **Templates** | 1 seul (`default`) | Pas de variabilité par genre |
| **Adapters (8)** | Wrappers fins | Pas de guidance spécifique |
| **Onboarding** | CLI wizard complexe | Trop complexe pour débutants |

---

## 🎯 Améliorations Proposées — Plan d'Action

### 🔴 Priorité 1 : Pipeline Automatisé

#### 1.1 — `runtime/workflow/pipeline.js` (NOUVEAU)

```javascript
// runtime/workflow/pipeline.js — NOUVEAU
export async function runPipeline(project, chapterRange, options = {}) {
  const outline = loadOutline(project);
  const contextPackets = await buildContextPackets(project, chapterRange);
  
  for (let i = chapterRange.start; i <= chapterRange.end; i++) {
    const packet = contextPackets[i];
    
    // Enchaînement automatique
    await startWorkflow(project, 'chapter-plan', packet);
    await transitionWorkflow(project, packet.runId, 'CONTEXT_BUILT');
    await startWorkflow(project, 'draft-chapter', packet);
    await transitionWorkflow(project, packet.runId, 'EXECUTING');
    
    // Auto-validation
    const qaResult = await runQualityChecks(project, packet);
    if (qaResult.hasCritical) {
      await startWorkflow(project, 'revision-loop', packet);
    }
    
    await transitionWorkflow(project, packet.runId, 'COMMITTED');
    updateProgress(project, i, 'complete');
  }
}
```

**Impact :** Réduction de 80% du temps manuel pour créer un chapitre.

---

#### 1.2 — `runtime/context/autobuilder.js` (NOUVEAU)

```javascript
// runtime/context/autobuilder.js — NOUVEAU
export async function autoBuildPacket(project, chapter, outline) {
  const packet = {
    task_id: `CH-${chapter.toString().padStart(2, '0')}`,
    intent: 'draft',
    scope: { chapter, outline_node: outline.chapters[chapter] },
    required_artifacts: [
      'bookforge/state/book-contract.md',
      `bookforge/state/outline/chapter-${chapter.toString().padStart(2, '0')}.yaml`,
      'bookforge/state/style-bible.md',
      ...(chapter > 1 ? [`manuscript/chapter-${(chapter-1).toString().padStart(2, '0')}.md`] : [])
    ],
    constraints: {
      max_words: outline.chapters[chapter].target_words || 3000,
      voice_profile: outline.chapters[chapter].voice || 'primary'
    },
    quality_targets: ['continuity', 'low-repetition', 'low-cliche']
  };
  return packet;
}
```

**Impact :** Plus besoin de configurer manuellement chaque chapitre.

---

### 🔴 Priorité 2 : Remplir les Skills avec du Contenu Réel

#### 2.1 — `skills/chapter-generator/SKILL.md` (AMÉLIORÉ)

```markdown
# chapter-generator

## Purpose
Generate a chapter from an approved chapter packet using genre-specific patterns.

## Procedure
1. Load chapter packet and validate prerequisites
2. Retrieve genre-specific chapter pattern from `catalogs/chapter-patterns.csv`
3. Generate prose following the pattern:
   - [Fiction] Use scene → complication → choice → consequence structure
   - [Nonfiction] Use claim → evidence → analysis → takeaway structure
4. Apply voice constraints from `bookforge/state/style-bible.md`
5. Run local validators (continuity, repetition, cliche)
6. Persist chapter to `manuscript/chapter-N.md`

## Genre-Specific Logic
- **Thriller**: Short chapters, cliffhanger endings, high tension
- **Memoir**: Chronological flow, reflective passages, emotional honesty
- **Business**: Problem → Mechanism → Application framework
- **Self-Help**: Promise → Proof → Practice structure
```

---

#### 2.2 — `skills/outline-builder/SKILL.md` (AMÉLIORÉ)

```markdown
# outline-builder

## Purpose
Create a chapter-by-chapter outline from the book contract.

## Procedure
1. Load `bookforge/state/book-contract.md`
2. Determine genre from contract
3. Select chapter pattern from `catalogs/chapter-patterns.csv`:
   - For fiction: use `ch-003` (scene → complication → choice → consequence)
   - For business: use `ch-007` (problem → mechanism → application)
4. Generate outline nodes with:
   - chapter_number
   - title
   - goal (what this chapter achieves)
   - beats (3-5 key moments)
   - target_words
   - dependencies (prior chapters needed)
5. Validate against book contract constraints
6. Persist to `bookforge/state/outline/outline.yaml`
```

---

### 🔴 Priorité 3 : Correction Automatique Quality Engine

#### 3.1 — `runtime/quality/resolver.js` (NOUVEAU)

```javascript
// runtime/quality/resolver.js — NOUVEAU
export async function resolveFindings(project, findings) {
  const corrections = [];
  
  for (const finding of findings) {
    if (finding.severity === 'critical') continue;
    
    const resolver = getResolver(finding.validator_id);
    if (resolver && resolver.canAutoFix(finding)) {
      const fix = await resolver.apply(project, finding);
      corrections.push(fix);
      await applyCorrection(project, fix);
    }
  }
  
  return corrections;
}

const resolvers = {
  'cliche-detector': {
    canAutoFix: (f) => f.severity === 'medium' || f.severity === 'low',
    apply: async (project, finding) => {
      const alternatives = await findAlternatives(project, finding.pattern);
      return { type: 'replace', text: finding.text, replacement: alternatives[0] };
    }
  },
  'ai-slop-detector': {
    canAutoFix: (f) => f.severity === 'medium' || f.severity === 'low',
    apply: async (project, finding) => {
      return { type: 'rewrite', section: finding.section, instructions: 'Add concrete details' };
    }
  }
};
```

**Impact :** Élimine 60-80% des révisions manuelles pour les problèmes de style.

---

### 🔴 Priorité 4 : Retrieval Sémantique

#### 4.1 — `runtime/retrieval.js` (AMÉLIORÉ)

```javascript
// runtime/retrieval.js — AMÉLIORÉ
export async function search(project, q, { catalog = null, limit = 20, mode = 'hybrid' } = {}) {
  // 1. Lexical search (fast, deterministic)
  const lexicalResults = await lexicalSearch(project, q, { catalog, limit });
  
  if (mode === 'lexical-only') return lexicalResults;
  
  // 2. Semantic search (more accurate)
  const semanticResults = await semanticSearch(project, q, { catalog, limit });
  
  // 3. Hybrid: combine and rerank
  return combineResults(lexicalResults, semanticResults, limit);
}

async function semanticSearch(project, q, options) {
  const embeddings = loadEmbeddings(project);
  const queryEmbedding = computeEmbedding(q);
  
  return Object.entries(embeddings)
    .map(([id, emb]) => ({ id, score: cosineSimilarity(emb, queryEmbedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, options.limit);
}
```

**Impact :** Les agents reçoivent un contexte 3x plus pertinent.

---

### 🔴 Priorité 5 : Templates par Genre

#### 5.1 — `project-templates/fiction-thriller/` (NOUVEAU)

```
project-templates/
├── fiction-thriller/
│   ├── bookforge.yaml
│   ├── state/
│   │   ├── book-contract.md
│   │   └── style-bible.md
│   └── workflows/
│       └── chapter-plan.yaml
├── nonfiction-business/
│   ├── ...
└── memoir/
    ├── ...
```

---

### 🔴 Priorité 6 : Onboarding Rapide

#### 6.1 — `bookforge init --quick` (NOUVEAU)

```bash
# Commande rapide — 3 questions max
bookforge init --quick --topic "Productivity for Remote Workers" --audience beginners
```

**Résultat :** Projet créé avec defaults intelligents (genre, template, workflow, auto_revision).

---

## 📋 Plan d'Implémentation Phasé

### Phase 1 : Pipeline Automatisé (Semaines 1-2)
- Créer `runtime/workflow/pipeline.js`
- Créer `runtime/context/autobuilder.js`
- Ajouter `RUN.md` tracker
- Tests golden : 20+ chapitres sans intervention manuelle

### Phase 2 : Skills avec Contenu (Semaines 3-4)
- Remplir les 5 skills critiques :
  - `chapter-generator` (patterns par genre)
  - `outline-builder` (génération auto)
  - `continuity-checker` (vérification cross-chapitre)
  - `voice-modeler` (extraction patterns)
  - `revision-loop` (corrections ciblées)

### Phase 3 : Correction Automatique (Semaines 5-6)
- Créer `runtime/quality/resolver.js`
- Implémenter résolveurs pour cliche, repetition, ai-slop
- Ajouter mode dry-run
- Tests de sécurité : jamais de correction sur critical

### Phase 4 : Retrieval Sémantique (Semaines 7-8)
- Implémenter embeddings pour catalogs
- Ajouter recherche hybride
- Tests de pertinence

### Phase 5 : Templates par Genre (Semaines 9-10)
- Créer 3 templates : `fiction-thriller`, `nonfiction-business`, `memoir`
- Implémenter `bookforge init --quick`
- Tests utilisateurs réels

---

## 🎯 Résumé des Gains Attendus

| Amélioration | Gain de Temps | Effort | Risque |
|--------------|---------------|--------|--------|
| Pipeline automatisé | 80% | Medium | Low |
| Skills avec contenu | 60% | Medium | Low |
| Correction automatique | 70% | Medium | Medium |
| Retrieval sémantique | 40% | High | Medium |
| Templates par genre | 50% | Low | Low |
| Onboarding rapide | 90% | Low | Low |

**Gain total estimé :** Réduction de 70-80% du temps de création d'un livre complet.

---

## ✅ Prochaines Étapes Immédiates

1. **Implémenter Phase 1** (Pipeline automatisé) — Impact le plus rapide
2. **Remplir les 5 skills critiques** — Contenu procédural réel
3. **Ajouter `bookforge init --quick`** — Onboarding simplifié
4. **Tests golden sur 20+ chapitres** — Validation de bout en bout

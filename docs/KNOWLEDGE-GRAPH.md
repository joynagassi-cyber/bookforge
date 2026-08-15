# Livre Agentique — Construction du Graph de Connaissance

## Vue d'ensemble

Le graph de connaissance BookForge est un **système événementiel** qui construit une représentation temporelle et relationnelle de tout le livre, en temps réel.

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARCHITECTURE DU GRAPH                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Agents     │    │   Workflows  │    │   Skills     │      │
│  │  (writers,   │───▶│  (chapter-   │───▶│ (validators, │      │
│  │   editors,   │    │   plan,      │    │  fact-      │      │
│  │   reviewers) │    │   draft)     │    │   checker)  │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│         │                   │                   │               │
│         │                   │                   │               │
│         ▼                   ▼                   ▼               │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              EMET D'ÉVÉNEMENTS                        │      │
│  │  upsert_node, create_edge, delete_node, snapshot      │      │
│  └──────────────────────┬───────────────────────────────┘      │
│                         │                                       │
│                         ▼                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │            SYNCHRONISATEUR (synchronizer.js)          │      │
│  │  • Reçoit les événements                            │      │
│  │  • Valide (SHA-256 hash)                            │      │
│  │  • Déduplique (idempotent)                          │      │
│  │  • Applique au provider                           │      │
│  └──────────────────────┬───────────────────────────────┘      │
│                         │                                       │
│         ┌───────────────┼───────────────┐                       │
│         ▼               ▼               ▼                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                 │
│  │   JSONL    │  │   Neo4j    │  │   Memory   │                 │
│  │  (fichiers)│  │ (base grap)│  │ (extraction│                 │
│  │            │  │            │  │  L0/L1/L2) │                 │
│  └────────────┘  └────────────┘  └────────────┘                 │
│         │               │               │                       │
│         └───────────────┴───────────────┘                       │
│                         │                                       │
│                         ▼                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              CONSULTATION (API)                       │      │
│  │  find(), get(), neighborhood(), related()            │      │
│  └──────────────────────┬───────────────────────────────┘      │
│                         │                                       │
│                         ▼                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              AGENT (vue temps réel)                   │      │
│  │  • Ce qui existe dans le livre                      │      │
│  │  • Les relations entre entités                       │      │
│  │  • L'historique des changements                      │      │
│  │  • Les faits vérifiés                                │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Les Entités du Livre (Nodes)

### Types de nœuds principaux

```json
{
  "type": "chapter",
  "properties": {
    "id": "ch-01",
    "number": 1,
    "title": "Le Départ",
    "word_count": 3500,
    "status": "draft"
  }
}
```

### Hiérarchie des nœuds

```
Book (livre entier)
├── Part (partie/acte)
│   └── Chapter (chapitre)
│       ├── Section (section)
│       │   └── Scene (scène)
│       ├── Character (personnage apparu)
│       ├── Place (lieu mentionné)
│       └── Fact (fait vérifié)
├── Character (personnage principal)
│   ├── trait (trait de caractère)
│   ├── arc (arc narratif)
│   └── relationship (relation)
├── Place (lieu)
│   ├── description
│   └── appearance (apparitions)
├── Theme (thème)
├── Claim (affirmation/fait)
│   ├── evidence (preuves)
│   └── source (source)
└── Source (source externe)
    └── citation (citations)
```

---

## 2. Les Relations (Edges)

### Relations structurelles

```
CONTAINS        → Structure hiérarchique
FOLLOWS         → Ordre chronologique
DEPENDS_ON      → Dépendance narrative
```

### Relations sémantiques

```
APPEARS_IN      → Un personnage apparaît dans un chapitre
LOCATED_IN      → Une scène se déroule dans un lieu
KNOWS           → Relation entre personnages
RELATED_TO      → Lien thématique
```

### Relations de validation

```
CITES           → Source citée
VALIDATED_BY    → Fait validé par source
FLAGS           → Problème signalé
SUPPORTS        → Argument qui supporte un autre
CONTRADICTS     → Argument qui contredit
SUPERSEDES      → Version qui remplace une autre
```

---

## 3. Le Système Événementiel

### Comment les agents écrivent dans le graph

#### Exemple 1: Création d'un chapitre

```javascript
// L'agent writer émet un événement
const event = {
  event_id: 'evt-1234567890-abc123',
  operation: 'upsert_node',
  entity: {
    id: 'ch-01',
    type: 'chapter',
    properties: {
      title: 'Le Départ',
      number: 1,
      word_count: 3500,
      status: 'draft',
      created_at: '2026-08-15T14:30:00Z'
    }
  },
  source_artifact: 'bookforge/artifacts/chapters/ch-01.md',
  source_hash: 'a1b2c3d4...',
  timestamp: '2026-08-15T14:30:00Z'
};

// Le synchronisateur reçoit et applique
await emit(project, event);
```

#### Exemple 2: Ajout d'un personnage

```javascript
const event = {
  event_id: 'evt-1234567890-def456',
  operation: 'upsert_node',
  entity: {
    id: 'char-sarah',
    type: 'character',
    properties: {
      name: 'Sarah',
      role: 'protagonist',
      age: 28,
      occupation: 'writer',
      traits: ['curious', 'determined']
    }
  },
  source_artifact: 'bookforge/artifacts/characters/sarah.md',
  timestamp: '2026-08-15T14:35:00Z'
};
```

#### Exemple 3: Création d'une relation

```javascript
const event = {
  event_id: 'evt-1234567890-ghi789',
  operation: 'upsert_edge',
  entity: {
    id: 'ch-01',
    type: 'chapter'
  },
  edge: {
    from: 'ch-01',
    to: 'char-sarah',
    type: 'features',
    properties: {
      importance: 'primary'
    }
  },
  timestamp: '2026-08-15T14:36:00Z'
};
```

---

## 4. Stockage des Événements

### Structure des fichiers

```
bookforge/
├── graph/
│   ├── provider.json          # Configuration du provider
│   └── sync-state.json       # État de synchronisation
│       {
│         "provider": "jsonl",
│         "updated_at": "2026-08-15T14:36:00Z",
│         "applied": 45,
│         "skipped": 12,
│         "events": {
│           "evt-1234567890-abc123": "sha256-hash",
│           "evt-1234567890-def456": "sha256-hash"
│         }
│       }
│
├── events/                    # Tous les événements bruts
│   ├── evt-1234567890-abc123.json
│   ├── evt-1234567890-def456.json
│   └── ...
│
└── graph/
    └── events.jsonl          # Version syncronisée (JSONL)
        {"event_id":"evt-...","operation":"upsert_node",...}
        {"event_id":"evt-...","operation":"create_edge",...}
```

### Fichier JSONL (exemple)

```jsonl
{"event_id":"evt-001","operation":"upsert_node","entity":{"id":"book-01","type":"book","properties":{"title":"Mon Livre"}},"timestamp":"2026-08-15T10:00:00Z"}
{"event_id":"evt-002","operation":"upsert_node","entity":{"id":"ch-01","type":"chapter","properties":{"title":"Chapitre 1"}},"timestamp":"2026-08-15T10:05:00Z"}
{"event_id":"evt-003","operation":"upsert_edge","edge":{"from":"book-01","to":"ch-01","type":"CONTAINS"}},"timestamp":"2026-08-15T10:05:00Z"}
{"event_id":"evt-004","operation":"upsert_node","entity":{"id":"char-sarah","type":"character","properties":{"name":"Sarah"}},"timestamp":"2026-08-15T10:10:00Z"}
{"event_id":"evt-005","operation":"upsert_edge","edge":{"from":"ch-01","to":"char-sarah","type":"features"}},"timestamp":"2026-08-15T10:10:00Z"}
```

---

## 5. Extraction de Connaissance (L0/L1/L2)

### Niveaux d'extraction

```
┌─────────────────────────────────────────────────────────────┐
│                    NIVEAUX D'EXTRACTION                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  L0: DÉTERMINISTE (Faits bruts)                             │
│  ├─ Dates: "1990-05-15"                                     │
│  ├─ Noms propres: "Sarah", "New York"                       │
│  └─ Chiffres: "3500 words"                                  │
│                                                             │
│  L1: STRUCTUREL (Organisation)                              │
│  ├─ Titres: "# Chapitre 1"                                  │
│  ├─ Listes: "- Point important"                             │
│  └─ Hiérarchie:_sections, sous-sections                     │
│                                                             │
│  L2: SÉMANTIQUE (Relations inférées)                         │
│  ├─ "Sarah is a writer" → (Sarah, IS, writer)              │
│  ├─ "Paris is in France" → (Paris, LOCATED_IN, France)     │
│  └─ "She has a dog" → (Sarah, HAS, dog)                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Exemple d'extraction

```javascript
const extraction = extractAll(project, {
  id: 'ch-01',
  content: `# Chapitre 1: Le Départ

Sarah lived in Paris. She was a writer born in 1990.
Her novel about climate change won the award.`
});

// Résultat:
{
  levels: {
    deterministic: {
      facts: [
        { type: 'date', value: '1990' },
        { type: 'proper-noun', value: 'Sarah' },
        { type: 'proper-noun', value: 'Paris' }
      ]
    },
    structural: {
      facts: [
        { type: 'heading', level: 1, text: 'Chapitre 1: Le Départ' }
      ]
    },
    semantic: {
      facts: [
        { subject: 'Sarah', relation: 'lived', object: 'Paris' },
        { subject: 'Sarah', relation: 'is', object: 'writer' },
        { subject: 'Sarah', relation: 'born', object: '1990' },
        { subject: 'novel', relation: 'about', object: 'climate change' }
      ]
    }
  }
}
```

---

## 6. Consultation en Temps Réel

### API du graph

```javascript
// Récupérer une entité
const chapter = await get(project, 'ch-01');

// Trouver des entités par query
const results = await find(project, 'Sarah');
// → Retourne tous les nodes contenant "Sarah"

// Voir le voisinage (depth=1)
const neighbors = await neighborhood(project, 'ch-01', 1);
// → Retourne: characters, places, facts liés au chapitre

// Relations spécifiques
const characterAppearances = await related(project, 'ch-01', 'features');
// → Retourne: [{ from: 'ch-01', to: 'char-sarah', type: 'features' }]

// Requêtes avancées
const allEvents = await listEvents(project);
const chapterEvents = await listEvents(project, { operation: 'upsert_node' });
```

### Exemple de vue agent

```javascript
async function getBookContext(project, chapterId) {
  // 1. Récupérer le chapitre
  const chapter = await get(project, chapterId);
  
  // 2. Récupérer les personnages dans ce chapitre
  const characters = await related(project, chapterId, 'features');
  
  // 3. Récupérer les lieux
  const places = await neighborhood(project, chapterId, 1)
    .filter(e => e.entity?.type === 'place');
  
  // 4. Récupérer les faits
  const facts = await find(project, 'fact');
  
  // 5. Construire le contexte
  return {
    chapter,
    characters: characters.map(e => e.entity),
    places: places.map(e => e.entity),
    facts: facts.filter(f => f.entity?.type === 'fact'),
    total_events: (await listEvents(project)).length
  };
}
```

---

## 7. Workflow Complet

### Cycle de vie d'une modification

```
┌─────────────────────────────────────────────────────────────────┐
│                    WORKFLOW DE MODIFICATION                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. AGENT ÉCRIT                                                 │
│     ┌─────────────────────────────────────────────┐            │
│     │ writer.js → Génère le contenu du chapitre   │            │
│     │ fact-checker.js → Vérifie les faits         │            │
│     └──────────────────┬──────────────────────────┘            │
│                        │                                        │
│                        ▼                                        │
│  2. ÉMISSION D'ÉVÉNEMENTS                                       │
│     ┌─────────────────────────────────────────────┐            │
│     │ emit(project, {                             │            │
│     │   operation: 'upsert_node',                │            │
│     │   entity: { id: 'ch-01', type: 'chapter' },│            │
│     │   source_artifact: 'path/to/file.md',      │            │
│     │   source_hash: 'sha256(...)'               │            │
│     │ })                                          │            │
│     └──────────────────┬──────────────────────────┘            │
│                        │                                        │
│                        ▼                                        │
│  3. SYNCHRONISATION                                             │
│     ┌─────────────────────────────────────────────┐            │
│     │ synchronizer.js →                           │            │
│     │   • Calcule le hash SHA-256                 │            │
│     │   • Vérifie si déjà présent (idempotent)    │            │
│     │   • Applique au provider (JSONL/Neo4j)      │            │
│     │   • Met à jour sync-state.json              │            │
│     └──────────────────┬──────────────────────────┘            │
│                        │                                        │
│                        ▼                                        │
│  4. EXTRACTION DE CONNAISSANCE                                  │
│     ┌─────────────────────────────────────────────┐            │
│     │ extractor.js →                              │            │
│     │   • L0: Dates, noms propres                 │            │
│     │   • L1: Structure, titres                   │            │
│     │   • L2: Relations, inférences               │            │
│     └──────────────────┬──────────────────────────┘            │
│                        │                                        │
│                        ▼                                        │
│  5. CONSULTATION (vue temps réel)                               │
│     ┌─────────────────────────────────────────────┐            │
│     │ agent reçoit:                               │            │
│     │   • Tous les chapitres                      │            │
│     │   • Les personnages liés                    │            │
│     │   • Les lieux mentionnés                    │            │
│     │   • Les faits vérifiés                      │            │
│     │   • L'historique des changements            │            │
│     └─────────────────────────────────────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Exemple Pratique

### Scénario: Écriture d'un chapitre

```bash
# 1. L'agent writer crée le chapitre
bookforge workflow run draft-chapter "Write chapter about Sarah"

# 2. Le graph est mis à jour automatiquement
#    → Nœud chapter créé
#    → Nœuds character créés (Sarah, etc.)
#    → Arêtes relations créées

# 3. L'agent fact-checker vérifie
bookforge workflow run fact-check "Validate chapter 1"

#    → Nœuds fact créés
#    → Arêtes VALIDATED_BY créées

# 4. L'agent continuity-checker vérifie la cohérence
bookforge workflow run continuity-check "Check continuity"

#    → Requêtes le graph pour trouver les incohérences
```

### Vue temps réel pour l'agent

```javascript
// Avant d'écrire un nouveau chapitre, l'agent peut voir:
const context = {
  // Tous les chapitres existants
  chapters: await listEvents(project, { type: 'chapter' }),
  
  // Personnages déjà créés
  characters: await find(project, 'character'),
  
  // Lieux déjà mentionnés
  places: await find(project, 'place'),
  
  // Faits vérifiés
  facts: await find(project, 'fact'),
  
  // Qui apparaît dans quel chapitre
  appearances: await related(project, 'ch-01', 'features'),
  
  // Historique des changements
  history: await listEvents(project)
};

// L'agent peut maintenant écrire en connaissance de cause!
```

---

## 9. Commands Utiles

```bash
# Synchroniser le graph
bookforge graph-sync

# Voir l'état du graph
bookforge graph status

# Requête simple
node -e "
import('./runtime/graph/api.js').then(m => 
  m.find(process.cwd(), 'Sarah')
    .then(r => console.log(JSON.stringify(r, null, 2)))
)"
```

---

## 10. Résumé

| Composant | Rôle |
|-----------|------|
| **Events** | Unité de base (tout changement est un événement) |
| **Synchronizer** | Valide et applique les événements (idempotent) |
| **Provider JSONL** | Stockage fichier (par défaut) |
| **Provider Neo4j** | Stockage graphe (optionnel) |
| **Extractor L0/L1/L2** | Extrait la connaissance du contenu |
| **API** | Interface de consultation pour les agents |

Le graph est **toujours cohérent** car:
1. Chaque événement a un hash unique
2. La synchronisation est idempotente (pas de doublons)
3. La source de vérité reste les fichiers canoniques
4. Le graph est une projection, pas la source

# Deep Research — Context Engineering Skills for AI-Assisted 500-Page Book Creation

## 0. Objectif

Construire un ensemble de skills spécialisés qui donnent à un petit modèle ou à un agent généraliste les capacités contextuelles, éditoriales, structurales, documentaires, visuelles et opérationnelles nécessaires pour accompagner la création d’un livre long (jusqu’à ~500 pages), de l’idée au packaging, à la publication et au marketing.

Le système ne doit pas être conçu comme « un gros prompt pour écrire un livre ». Il doit fonctionner comme un système éditorial à mémoire externe, avec activation sélective des skills, fichiers d’état, sources, règles de style, validations et boucles de révision.

## 1. Résultats majeurs de la recherche

### 1.1 Le problème principal est la gestion du contexte, pas seulement la génération

Le dépôt Agent-Skills-for-Context-Engineering définit le context engineering comme la curation de l’ensemble de l’état disponible au modèle : instructions, outils, documents récupérés, historique et sorties d’outils. Il insiste sur le fait que le signal utile doit être sélectionné et que charger tout le corpus en permanence peut dégrader les performances. Le dépôt utilise également la progressive disclosure, la séparation des modules, la mémoire persistante, le filesystem context, l’évaluation et l’harness engineering. La version 2.3.0 rapporte un benchmark où l’activation ciblée des skills surpasse le chargement de tout le corpus. [GitHub](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering)

### 1.2 Un livre long doit être traité comme un système hiérarchique

Les travaux récents sur la génération longue montrent que la cohérence, la planification macro, la continuité et la qualité se dégradent lorsque le texte s’allonge. Le travail NAACL 2025 sur la génération narrative longue met explicitement en avant les limites des approches sans macro-planification et propose une planification hiérarchique enrichie par mémoire. Le travail SuperWriter 2026 renforce la même idée via planification structurée, génération puis raffinement. [NAACL 2025](https://aclanthology.org/2025.naacl-long.63/) [ACL Findings 2026](https://aclanthology.org/2026.findings-acl.428/)

### 1.3 Les fenêtres de contexte longues ne remplacent pas une mémoire architecturée

La recherche « Lost in the Middle » montre que l’accès à l’information peut se dégrader lorsque l’information pertinente se trouve au milieu d’un contexte long. Pour un livre de 500 pages, il faut donc externaliser le canon, l’état, les personnages, les décisions, les sources, les contraintes et les plans au lieu de compter sur un historique géant. [Liu et al., 2023](https://arxiv.org/abs/2307.03172)

### 1.4 L’évaluation créative par LLM est utile mais insuffisante

LitBench 2026 rapporte que le meilleur juge LLM testé atteint 73 % d’accord avec les préférences humaines sur sa tâche, tandis que des modèles entraînés spécifiquement atteignent 78 %. Une autre étude EACL 2026 montre que les métriques de créativité et les juges LLM sont instables, sensibles au prompt et biaisés. Le système doit donc utiliser des évaluations spécialisées, des comparaisons pairwise, des tests déterministes et, pour les décisions importantes, une validation humaine. [LitBench](https://aclanthology.org/2026.eacl-long.362/) [EACL 2026 Creativity Evaluation](https://aclanthology.org/2026.eacl-long.297/)

## 2. Ce que le système doit réellement savoir faire

### A. Cadrage éditorial

1. Identifier l’objectif du livre.
2. Définir le lecteur primaire et les lecteurs secondaires.
3. Définir promesse, transformation ou expérience recherchée.
4. Identifier le genre et les sous-genres.
5. Identifier les conventions du genre.
6. Identifier les attentes du marché via comparables.
7. Définir longueur cible, densité, registre et niveau de difficulté.
8. Choisir le format : fiction, essai, guide, manuel, mémoire, récit, autobiographie, spiritualité, jeunesse, etc.
9. Définir les contraintes éditoriales et légales.

### B. Recherche documentaire

1. Décomposer les questions de recherche.
2. Distinguer faits, hypothèses, interprétations et opinions.
3. Rechercher des sources primaires lorsque possible.
4. Utiliser des sources secondaires pour synthèse et contextualisation.
5. Enregistrer chaque source avec provenance, date, auteur, URL, type et niveau de confiance.
6. Associer chaque affirmation importante à ses sources.
7. Détecter contradictions entre sources.
8. Détecter faits non vérifiés.
9. Construire une bibliographie exploitable.
10. Maintenir un « source ledger » plutôt qu’une simple liste de liens.

### C. Architecture du livre

Pour tout livre, séparer au moins :

- positionnement ;
- promesse ;
- architecture globale ;
- parties ;
- chapitres ;
- scènes ou unités argumentatives ;
- objectifs par unité ;
- transitions ;
- preuves/exemples ;
- payoff ;
- résumé/recall ;
- éléments visuels ;
- annexes ;
- front matter ;
- back matter.

Pour la fiction, ajouter :

- personnages ;
- objectifs ;
- motivations ;
- conflits ;
- relations ;
- arcs ;
- monde ;
- chronologie ;
- scènes ;
- points de vue ;
- voix par personnage ;
- conventions de genre ;
- moments obligatoires.

Pour la non-fiction, ajouter :

- thèse centrale ;
- sous-thèses ;
- chaîne d’arguments ;
- preuves ;
- contre-arguments ;
- exemples ;
- études de cas ;
- exercices ;
- réflexions ;
- actions ;
- synthèses ;
- progression pédagogique.

Story Grid est une source utile pour formaliser conventions de genre et moments obligatoires, y compris en non-fiction. [Story Grid](https://storygrid.com/genre-conventions/) [Story Grid Non-fiction](https://storygrid.com/non-fiction-conventions-and-obligatory-scenes/)

### D. Mémoire de livre

Le système doit maintenir plusieurs mémoires distinctes plutôt qu’un seul fichier « BOOK_STATE.md » :

1. `BOOK_CONTRACT.md` — règles absolues et promesse.
2. `BOOK_STATE.md` — état opérationnel courant.
3. `BOOK_OUTLINE.md` — structure canonique.
4. `STYLE_BIBLE.md` — style et voix.
5. `WORLD_BIBLE.md` — univers et faits stables.
6. `CHARACTER_BIBLE.md` — personnages et arcs.
7. `TIMELINE.md` — chronologie.
8. `SOURCE_LEDGER.md` — sources et preuves.
9. `CLAIMS_LEDGER.md` — affirmations importantes et statut de vérification.
10. `DECISIONS.md` — décisions éditoriales.
11. `CHANGELOG.md` — changements structurants.
12. `QA_REPORT.md` — état qualité.

Cette séparation réduit la pollution du contexte et permet d’injecter uniquement les fragments pertinents.

## 3. Architecture de skills recommandée

Le plan initial de 16 skills est fonctionnel mais trop compact. Il faut distinguer capacités fondamentales, capacités de domaine et capacités de validation.

### Layer 0 — Core Context Engineering

`context-fundamentals`

`context-degradation`

`context-compression`

`context-optimization`

`filesystem-context`

`memory-systems`

`multi-agent-patterns`

`tool-design`

`evaluation`

`advanced-evaluation`

`harness-engineering`

Ces skills sont directement inspirés du corpus Agent Skills for Context Engineering. Chaque skill doit rester sous une forme compacte, action-oriented, avec ownership, activation, boundaries, gotchas, exemples et références. [Repository](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering)

### Layer 1 — Book Context Architecture

`book-context-bootstrap`

Initialise le projet livre et crée les contrats, dossiers, manifestes et états.

`book-memory-manager`

Gère BOOK_STATE, mémoires persistantes, résumés, snapshots et récupération sélective.

`book-canon-manager`

Garantit le canon contre les contradictions et régressions.

`book-style-bible`

Construit et maintient la voix, le registre, les préférences syntaxiques et lexicales.

`book-source-ledger`

Gère les sources et leur provenance.

`book-decision-log`

Stocke les décisions et empêche le système de les annuler silencieusement.

### Layer 2 — Editorial Intelligence

`book-idea-analyzer`

Analyse idée, problème, promesse, audience et faisabilité éditoriale.

`book-market-positioner`

Analyse genre, niche, comparables, attentes du lectorat et positionnement.

`book-outline-architect`

Transforme l’idée en architecture de livre hiérarchique.

`book-chapter-architect`

Conçoit chaque chapitre avant rédaction.

`book-scene-architect`

Conçoit les unités locales de fiction.

`book-argument-architect`

Conçoit les chaînes argumentatives de non-fiction.

`book-pedagogy-architect`

Construit les progressions pédagogiques, exercices, rappels et transformations.

### Layer 3 — Writing Skills

`book-voice-matcher`

Analyse des échantillons et construit une représentation opérationnelle de la voix.

`book-draft-writer`

Rédige selon outline + contexte local + style bible + canon.

`book-dialogue-writer`

Gestion des dialogues, sous-texte, voix distinctes et rythme.

`book-description-writer`

Description des lieux, sensations, actions, idées et objets sans surcharge.

`book-transition-writer`

Transitions interparagraphes, interscènes et interchapitres.

`book-rewrite-engine`

Réécrit selon un objectif précis sans détruire le canon.

`book-translation-adapter`

Adapte langue et conventions sans traduction littérale aveugle.

### Layer 4 — Editorial QA & Integrity

La validation doit être une couche de première classe. Aucun détecteur isolé ne doit déclarer un manuscrit « sûr » ou « prêt à publier » : les signaux doivent être triangulés, comparés au canon et, pour les décisions importantes, soumis à une revue humaine.

`book-developmental-editor`

Vérifie structure, rythme, arcs, progression, promesse et valeur par chapitre.

`book-continuity-editor`

Cherche contradictions globales : personnages, dates, lieux, faits, terminologie, chronologie, règles du monde et décisions éditoriales.

`book-fact-checker`

Vérification des faits, chiffres, noms, dates, citations et causalités. Distingue fait, hypothèse, interprétation et opinion.

`book-source-provenance-auditor`

Vérifie la provenance des informations, la qualité des sources et les passages nécessitant attribution. Maintient la traçabilité claim → source → passage.

`book-citation-auditor`

Vérifie claims, citations, notes et bibliographie ; signale les citations absentes, incohérentes ou non vérifiables.

`book-plagiarism-detector`

Détecte les similarités internes, les chevauchements avec les corpus du projet et, lorsqu’un outil externe est disponible, les correspondances externes. Il rapporte une similarité ; il ne transforme pas automatiquement cette similarité en accusation de plagiat.

`book-originality-reviewer`

Évalue la spécificité des idées, exemples, métaphores, formulations et structures par rapport aux sources et aux conventions du genre. Il distingue originalité, influence légitime, formule de genre et copie potentielle.

`book-ai-slop-detector`

Détecte les patterns de prose générique ou mécaniquement optimisée : transitions répétitives, abstractions, symétrie excessive, listes prévisibles, enthousiasme artificiel, formulations interchangeables, conclusions redondantes et absence de détails concrets.

`book-cliche-detector`

Détecte clichés, métaphores mortes, banalités, promesses vagues et expressions surutilisées. Distingue cliché, formule de genre, expression commune et réemploi stylistique intentionnel.

`book-generic-prose-detector`

Repère les passages qui pourraient appartenir à presque n’importe quel livre : faible spécificité, faible densité de détails, vocabulaire abstrait et absence de signature de l’auteur.

`book-human-voice-editor`

Transforme un signalement de prose artificielle en amélioration éditoriale réelle : précision, variations rythmiques, détails concrets, intention, personnalité, texture et cohérence avec la Style Bible. Il ne doit pas être optimisé pour contourner des détecteurs AI.

`book-voice-drift-detector`

Compare chaque section avec la représentation opérationnelle de la voix et signale les dérives de registre, cadence, lexique, distance narrative ou posture argumentative.

`book-repetition-detector`

Détecte répétitions lexicales, conceptuelles, structurelles et rhétoriques à plusieurs distances : paragraphe, chapitre, partie et manuscrit.

`book-filler-detector`

Repère paragraphes, transitions, introductions et conclusions qui occupent de l’espace sans apporter information, scène, argument, émotion ou payoff.

`book-genre-convention-validator`

Vérifie le respect des conventions et des moments obligatoires du genre sans transformer la convention en formule mécanique.

`book-show-dont-tell-validator`

Pour la fiction, détecte les passages où l’explication remplace inutilement action, perception, sous-texte ou scène ; il ne doit pas imposer « show, don't tell » partout.

`book-pacing-validator`

Analyse vitesse, densité, alternance des scènes/arguments, longueur des sections et zones de décrochage possibles.

`book-structure-validator`

Vérifie que chaque partie, chapitre et unité locale possède une fonction et que l’ensemble sert la promesse du livre.

`book-prose-quality-evaluator`

Évalue prose, lisibilité, précision, variété et efficacité sans réécrire automatiquement.

`book-copy-editor`

Clarté, grammaire, cohérence linguistique, terminologie et conventions éditoriales après résolution des problèmes structurels.

`book-final-proofreader`

Dernière passe mécanique après stabilisation du manuscrit et du design.

`book-human-editor-simulator`

Simule plusieurs lectures spécialisées : developmental editor, line editor, copy editor, fact checker, genre editor, skeptical reader, bored reader et target reader. Chaque persona produit des observations séparées et non une note globale unique.

`book-human-review-gate`

Orchestre la revue humaine finale, en présentant un dossier de décision : anomalies ouvertes, provenance, modifications proposées, risques et éléments nécessitant une décision d’auteur.

### Layer 5 — Design & Packaging

`book-front-matter-builder`

`book-back-matter-builder`

`book-interior-layout-planner`

`book-cover-art-director`

`book-cover-prompt-engineer`

`book-cover-compliance-checker`

`book-illustration-director`

`book-illustration-consistency-manager`

`book-epub-validator`

`book-print-pdf-validator`

Le système doit comprendre que design et édition sont interdépendants : front matter, body et back matter forment des ensembles distincts. [Reedsy](https://reedsy.com/blog/guide/parts-of-a-book/) Le design intérieur doit traiter marges, veuves/orphelines, hyphénation, justification, etc. [IngramSpark](https://www.ingramspark.com/blog/topic/book-design)

### Layer 6 — Publishing & Metadata

`book-metadata-architect`

`book-bisac-classifier`

`book-kdp-metadata-optimizer`

`book-isbn-manager`

`book-format-packager`

`book-rights-and-ai-policy`

`book-distribution-planner`

BISAC fournit un standard de catégorisation utilisé dans la chaîne du livre ; l’ISBN possède un manuel international de référence. [BISG](https://www.bisg.org/BISAC-Subject-Codes-main/) [International ISBN Agency](https://www.isbn-international.org/content/isbn-users-manual/29)

KDP documente notamment les contraintes de trim size, bleed et marges ; pour 301–500 pages, la marge intérieure minimale indiquée est de 0,625 pouce, et les couvertures doivent être traitées selon les exigences spécifiques de la plateforme. [KDP](https://kdp.amazon.com/en_US/help/topic/GVBQ3CMEQW3W2VL6)

### Layer 7 — Marketing & Author Business

`book-blurb-writer`

`book-amazon-description-optimizer`

`book-keyword-researcher`

`book-category-strategist`

`book-author-page-builder`

`book-launch-planner`

`book-preorder-planner`

`book-email-funnel-builder`

`book-reader-magnet-builder`

`book-ad-creative-generator`

`book-amazon-ads-planner`

`book-bookbub-planner`

`book-content-repurposer`

`book-series-marketing-manager`

KDP autorise jusqu’à sept mots-clés pour une fiche de titre, avec recommandation d’éviter les termes vagues. [KDP](https://kdp.amazon.com/en_US/help/topic/G201743260)

Amazon Ads documente Sponsored Products, Sponsored Brands, page auteur et optimisation des campagnes pour les auteurs. [Amazon Ads](https://advertising.amazon.com/en-us/library/guides/advertising-books-on-amazon-authors/)

Reedsy structure le marketing autour de plan, audience, mailing list, canaux et mesure. [Reedsy Marketing 101](https://reedsy.com/learning/courses/marketing/book-marketing-101)

BookBub documente preorder alerts, new release alerts, publicité et campagnes de lancement. [BookBub](https://support.bookbub.com/articles/bookbubs-marketing-tools/)

## 4. Artifacts obligatoires du projet

Chaque livre doit avoir un workspace persistant.

```text
book-project/
├── 00-contract/
│   ├── BOOK_CONTRACT.md
│   ├── AUDIENCE.md
│   ├── POSITIONING.md
│   └── SUCCESS_CRITERIA.md
├── 01-research/
│   ├── SOURCE_LEDGER.md
│   ├── CLAIMS_LEDGER.md
│   ├── RESEARCH_NOTES/
│   └── BIBLIOGRAPHY/
├── 02-architecture/
│   ├── BOOK_OUTLINE.md
│   ├── PARTS/
│   ├── CHAPTERS/
│   └── DEPENDENCIES.md
├── 03-canon/
│   ├── BOOK_STATE.md
│   ├── STYLE_BIBLE.md
│   ├── CHARACTER_BIBLE.md
│   ├── WORLD_BIBLE.md
│   ├── TIMELINE.md
│   └── DECISIONS.md
├── 04-draft/
│   ├── CH01.md
│   ├── CH02.md
│   └── ...
├── 05-editorial/
│   ├── DEVELOPMENTAL/
│   ├── CONTINUITY/
│   ├── COPYEDIT/
│   ├── FACTCHECK/
│   └── PROOF/
├── 06-design/
│   ├── COVER/
│   ├── INTERIOR/
│   └── ILLUSTRATIONS/
├── 07-publishing/
│   ├── METADATA.md
│   ├── ISBN.md
│   ├── KDP/
│   └── DISTRIBUTION/
├── 08-marketing/
│   ├── LAUNCH_PLAN.md
│   ├── BLURBS/
│   ├── EMAIL/
│   └── ADS/
└── 09-qa/
    ├── QA_REPORT.md
    ├── OPEN_ISSUES.md
    └── RELEASE_GATE.md
```

## 5. Workflow hiérarchique recommandé

```text
IDEA
 ↓
MARKET + AUDIENCE + PROMISE
 ↓
RESEARCH
 ↓
BOOK ARCHITECTURE
 ↓
PART ARCHITECTURE
 ↓
CHAPTER ARCHITECTURE
 ↓
SCENE / ARGUMENT ARCHITECTURE
 ↓
DRAFT
 ↓
LOCAL EDIT
 ↓
GLOBAL CONTINUITY CHECK
 ↓
FACT / SOURCE AUDIT
 ↓
PLAGIARISM / ORIGINALITY AUDIT
 ↓
AI-SLOP / CLICHÉ / GENERIC-PROSE AUDIT
 ↓
VOICE / CONTINUITY AUDIT
 ↓
DEVELOPMENTAL EDIT
 ↓
HUMAN-VOICE EDIT
 ↓
COPY EDIT
 ↓
PROOF
 ↓
HUMAN EDITOR REVIEW GATE
 ↓
DESIGN
 ↓
FORMAT VALIDATION
 ↓
METADATA
 ↓
PUBLISHING
 ↓
LAUNCH + MARKETING
 ↓
POST-LAUNCH LEARNING
```

Une phase ne doit pas être déclarée terminée uniquement parce qu’un agent a produit un texte. Elle doit satisfaire des critères de sortie vérifiables.

## 6. Modèle de génération d’un chapitre

Pour chaque chapitre :

1. Charger le contrat du livre.
2. Charger uniquement les contraintes pertinentes.
3. Charger l’objectif du chapitre.
4. Charger le résumé des chapitres adjacents.
5. Charger les personnages/scènes/claims nécessaires.
6. Charger les sources nécessaires.
7. Charger la section pertinente de STYLE_BIBLE.
8. Produire un plan local.
9. Produire un premier jet.
10. Auto-auditer le chapitre.
11. Réviser les erreurs détectées.
12. Mettre à jour BOOK_STATE et les ledgers.
13. Exécuter une vérification de continuité ciblée.
14. Passer au chapitre suivant.

Le système ne doit pas injecter automatiquement tout le livre dans chaque appel.

## 7. Style system : ce qui doit être modélisé

Le « style » ne doit pas être une instruction vague comme « écris comme X ».

Le STYLE_BIBLE doit représenter au minimum :

- longueur moyenne des phrases ;
- variation de longueur ;
- densité lexicale ;
- vocabulaire préféré ;
- vocabulaire interdit ;
- niveau de formalité ;
- niveau d’abstraction ;
- fréquence des métaphores ;
- type de métaphores ;
- densité d’adjectifs ;
- usage des adverbes ;
- rythme ;
- cadence ;
- préférences de paragraphes ;
- utilisation des listes ;
- conventions de dialogue ;
- point de vue ;
- temps verbal ;
- distance narrative ;
- humour ;
- intensité émotionnelle ;
- transitions ;
- degré de répétition volontaire ;
- niveau de pédagogie ;
- signature rhétorique ;
- exemples représentatifs et anti-exemples.

Pour chaque attribut, enregistrer : valeur cible, exemples positifs, contre-exemples et niveau de criticité.

## 8. Erreurs typiques à prévenir

### Contexte

- perdre une décision antérieure ;
- contradiction entre chapitres ;
- oublier une contrainte ;
- surcharger le contexte ;
- mélanger état actuel et hypothèse ;
- réinjecter de vieilles versions comme si elles étaient canoniques.

### Fiction

- personnage qui connaît une information qu’il ne devrait pas connaître ;
- changement soudain de motivation ;
- âge/date/chronologie incohérents ;
- objets qui apparaissent/disparaissent ;
- lieux incompatibles ;
- arc émotionnel artificiel ;
- répétition de conflits ;
- résolution trop facile ;
- exposition déguisée en dialogue ;
- voix identiques entre personnages ;
- enjeux mal escaladés.

### Non-fiction

- affirmation sans source ;
- source secondaire présentée comme primaire ;
- chiffre sans date ;
- faux lien causal ;
- généralisation abusive ;
- preuve qui ne répond pas à la thèse ;
- répétition de la même idée sous plusieurs formulations ;
- chapitre sans valeur nouvelle ;
- exercices décoratifs sans relation à la promesse ;
- conclusion qui ne transforme pas l’argument en action.

### Prose IA

- banalités ;
- abstractions répétitives ;
- transitions mécaniques ;
- surusage de formulations symétriques ;
- accumulation artificielle de trois adjectifs ;
- « en résumé », « il est important de noter » répétitifs ;
- métaphores interchangeables ;
- voix générique ;
- rythme uniforme ;
- phrases excessivement propres ou uniformes ;
- paragraphes trop similaires en longueur et structure.

## 8.1.0 BookForge quality-control contract

The quality layer is explicitly split into four independent signals: similarity/originality, cliché risk, AI-slop/synthetic-prose signals, and human-voice refinement. These controls must not be collapsed into a single "AI detection" score. Similarity is evidence for investigation, not an automatic plagiarism verdict. Human-voice refinement is editorial improvement and must not be optimized to evade AI detectors.

Required operational components:

- `plagiarism/similarity auditor`: evidence-producing comparison against project/imported/licensed corpora when available;
- `originality auditor`: assesses specificity and provenance separately from textual similarity;
- `ai-slop auditor`: detects probabilistic stylistic signals and reports false-positive risk;
- `cliche auditor`: uses a versioned, language-aware library of overused expressions and patterns;
- `human-voice editor`: converts findings into authorial, specific, intentional prose while preserving meaning and the Style Bible;
- `quality validator`: aggregates findings, provenance, severity and required human review without replacing human judgment.

## 8.1 Integrity, originality et qualité stylistique

Cette couche est obligatoire et transversale. Elle ne doit pas être exécutée uniquement à la fin du manuscrit : les contrôles doivent être effectués au niveau chapitre, partie et livre complet.

### 8.1.1 Plagiat et similarité

Le système doit conserver trois notions distinctes :

- `similarity` — deux textes partagent des segments ou structures similaires ;
- `attribution` — le passage nécessite une citation ou une reconnaissance de source ;
- `suspected plagiarism` — la combinaison de similarité, provenance et absence d’attribution justifie une investigation humaine.

Le détecteur doit produire des preuves : passage, source comparable, nature de la correspondance, longueur du chevauchement, contexte et décision recommandée. Un score de similarité ne doit jamais être traité comme une preuve automatique de plagiat.

Le système doit permettre au moins :

1. comparaison intra-manuscrit ;
2. comparaison avec les documents importés ;
3. comparaison avec un corpus sous licence ou service externe lorsque disponible ;
4. détection de reformulation proche ;
5. contrôle de provenance et d’attribution ;
6. journalisation de la décision humaine.

### 8.1.2 AI slop

`AI slop` désigne ici un ensemble de propriétés stylistiques et structurelles associées à une prose générée de manière générique, répétitive ou peu spécifique. Le skill doit détecter les symptômes, pas essayer d’identifier de manière certaine l’origine humaine ou machine du texte.

Patterns à surveiller :

- ouvertures génériques ;
- transitions mécaniques ;
- répétition des mêmes cadres syntaxiques ;
- séries artificielles de trois éléments ;
- adjectifs et adverbes décoratifs ;
- abstraction excessive ;
- enthousiasme non justifié ;
- slogans et bénéfices non démontrés ;
- fausse précision ;
- reformulation d’une même idée sous plusieurs synonymes ;
- conclusions répétitives ;
- absence de détails propres au sujet ;
- cadence et longueur de paragraphes trop uniformes ;
- métaphores interchangeables ;
- voix dépourvue de point de vue identifiable.

Le détecteur doit fournir un diagnostic local et une recommandation. Il ne doit pas réécrire automatiquement un passage sans demander quel objectif éditorial doit être préservé.

### 8.1.3 Clichés et expressions à éviter

Le système doit maintenir une `CLICHE_PATTERN_LIBRARY` versionnée par langue et genre. Chaque entrée doit contenir :

- expression ou pattern ;
- catégorie ;
- fréquence estimée ;
- niveau de banalité ;
- contextes où elle peut être légitime ;
- alternatives possibles ;
- règle « do not auto-replace » lorsque le contexte peut justifier son usage.

Catégories minimales :

- cliché lexical ;
- métaphore morte ;
- formule marketing générique ;
- transition scolaire ;
- promesse vague ;
- aphorisme sans contenu ;
- surdramatisation ;
- expression propre à un genre mais surutilisée ;
- anglicisme ou traduction calquée lorsque problématique.

Exemples de patterns à contrôler, sans en faire une liste d’interdits absolus : `dans le monde d’aujourd’hui`, `il est important de noter`, `en fin de compte`, `ce voyage va changer votre vie`, `il ne s’agit pas seulement de X, mais aussi de Y`, `dans un monde en constante évolution`. La règle est de vérifier la nécessité et la spécificité, pas de bannir mécaniquement une chaîne de caractères.

### 8.1.4 Human voice

Le `book-human-voice-editor` doit chercher :

- précision ;
- détails observables ;
- variation rythmique ;
- intention locale ;
- choix lexicaux cohérents avec l’auteur ;
- formulations qui portent une opinion ou une perception réelles ;
- transitions motivées par la logique du texte ;
- tension ou curiosité ;
- imperfections stylistiques intentionnelles ;
- suppression du remplissage.

Il ne doit pas viser l’évasion d’un détecteur AI et ne doit pas dégrader la lisibilité dans l’objectif de rendre le texte artificiellement « humain ».

### 8.1.5 Human reviewer

Aucun score automatique ne doit fermer seul le release gate. La revue humaine doit pouvoir :

- accepter un faux positif ;
- conserver intentionnellement un cliché ;
- accepter une formulation très conventionnelle si elle est stratégique ;
- valider une similarité légitime ;
- modifier la Style Bible ;
- marquer une décision comme définitive ;
- ouvrir une nouvelle règle éditoriale.

Cette décision doit être enregistrée dans `HUMAN_REVIEW.md` et `DECISIONS.md`.

### 8.1.6 Quality scorecard

Conserver des scores séparés, jamais fusionnés dans une note unique :

`Originality`
`Provenance Integrity`
`Cliche Density`
`AI-Slop Density`
`Generic-Prose Density`
`Repetition`
`Human Voice`
`Continuity`
`Factual Reliability`
`Citation Integrity`
`Genre Fit`
`Structure`
`Pacing`
`Reader Value`

Chaque score doit être accompagné de preuves et de seuils propres au type de livre.

## 9. Editing pipeline obligatoire

Reedsy distingue explicitement : editorial assessment, developmental editing, copy editing, proofreading et fact-checking. Le copy editing vient après la résolution des problèmes structurels ; le proofreading intervient à la fin. [Reedsy 2026](https://reedsy.com/blog/guide/editing/)

Le système doit reproduire cet ordre :

`ASSESS → DEVELOP → CONTINUITY → FACTCHECK → COPY → PROOF`

Il ne faut pas demander au même passage de résoudre simultanément structure, style, faits et typographie sans séparation des objectifs.

## 10. Design / packaging

Le packaging doit être traité comme un système de communication du produit.

### Couverture

Entrées :

- genre ;
- sous-genre ;
- comps ;
- lecteur ;
- promesse ;
- humeur ;
- éléments obligatoires ;
- contraintes de plateforme.

Sorties :

- creative brief ;
- art direction ;
- typography direction ;
- palette direction ;
- composition ;
- prompt de génération ;
- variantes ;
- checklist de lisibilité miniature ;
- conformité.

IngramSpark recommande d’étudier les couvertures comparables du genre et souligne que le design doit à la fois respecter les conventions du genre et aider le livre à se différencier. [IngramSpark](https://www.ingramspark.com/hubfs/downloads/How-to-Self-Publish-Guide.pdf)

### Intérieur

Contrôles :

- trim size ;
- bleed ;
- gutter ;
- marges ;
- césures ;
- justification ;
- veuves/orphelines ;
- titres ;
- chapitres ;
- folios ;
- tables ;
- notes ;
- images ;
- légendes ;
- front matter ;
- back matter.

KDP fournit des marges minimales dépendant du nombre de pages et des règles spécifiques de bleed. [KDP](https://kdp.amazon.com/en_US/help/topic/GVBQ3CMEQW2VL6)

### Ebook

Ne jamais supposer que le PDF print est un ebook. IngramSpark demande un EPUB pour l’intérieur et précise que les références de pages ne doivent pas être conservées comme si l’ebook était une reproduction fixe du print. [IngramSpark](https://www.ingramspark.com/blog/file-requirements-for-ebooks)

## 11. Audiobook

Le pipeline doit traiter :

- découpage narratif ;
- prononciation ;
- noms propres ;
- dialogues ;
- indications de ton ;
- voix ;
- pauses ;
- normalisation ;
- contrôle de rythme ;
- QC audio ;
- métadonnées audio.

L’objectif n’est pas uniquement « transformer le texte en voix », mais produire un script narratif exploitable.

## 12. Marketing system

### Positionnement

Le livre doit disposer d’un message en une phrase :

`Pour [audience], [titre] est un [genre/type] qui aide/permet de [promesse], contrairement à [alternatives], grâce à [différenciateur].`

### Metadata

Le système doit générer :

- title ;
- subtitle ;
- author ;
- series ;
- description ;
- keywords ;
- categories ;
- BISAC ;
- audience ;
- language ;
- publication data ;
- ISBN mapping ;
- format mapping.

### Launch

Le launch planner doit gérer :

- cover reveal ;
- announcement ;
- preorder ;
- email sequence ;
- ARC/review strategy ;
- social assets ;
- author page ;
- retailer links ;
- launch week ;
- post-launch follow-up.

BookBub décrit des stratégies de preorder, alertes, lancement, publicité et réutilisation des actifs marketing. [BookBub](https://insights.bookbub.com/ultimate-guide-promoting-book-launch/)

### Ads

Le skill doit distinguer :

- discovery ;
- retargeting lorsque disponible ;
- keyword targeting ;
- author/comparable targeting ;
- category targeting ;
- creative testing ;
- budget testing ;
- attribution ;
- ROI/ROAS ;
- stop/scale rules.

Amazon Ads documente notamment Sponsored Products et Sponsored Brands pour les auteurs. [Amazon Ads](https://advertising.amazon.com/en-us/library/guides/advertising-books-on-amazon-authors/)

## 13. Droits, IA et provenance

Le système doit maintenir un registre de provenance pour :

- texte humain ;
- texte généré ;
- texte réécrit ;
- image générée ;
- image licenciée ;
- image créée par l’auteur ;
- traduction ;
- citations ;
- extraits protégés ;
- sources ;
- permissions.

KDP distingue actuellement l’AI-generated de l’AI-assisted : produire le contenu à l’aide d’une IA est considéré comme AI-generated même après modifications substantielles, tandis que l’édition ou l’amélioration de contenu créé par l’auteur est AI-assisted. Amazon indique également que l’auteur reste responsable de la conformité du contenu. [KDP Content Guidelines](https://kdp.amazon.com/en_US/help/topic/G200672390)

Aux États-Unis, le Copyright Office a conclu en 2025 qu’une œuvre issue de générative AI peut être protégée lorsque l’auteur humain a déterminé suffisamment d’éléments expressifs ; le simple fait de fournir des prompts ne suffit pas à lui seul. [U.S. Copyright Office](https://www.copyright.gov/newsnet/2025/1060.html)

Ce point doit être modélisé comme une capacité de gouvernance et non comme un simple texte de disclaimer.

## 14. Outils à prévoir dans l’écosystème

### Recherche

- web search ;
- academic search ;
- file search/RAG ;
- PDF extraction ;
- citation extraction ;
- source ranking ;
- browser snapshots ;
- source archive.

Les plateformes modernes d’agents combinent déjà web search, file search, computer use, MCP et observabilité dans des workflows multi-outils. [OpenAI](https://openai.com/index/new-tools-for-building-agents/) [OpenAI Responses updates](https://openai.com/index/new-tools-and-features-in-the-responses-api/)

### Mémoire / données

- filesystem ;
- vector search ;
- metadata filtering ;
- semantic retrieval ;
- summaries ;
- snapshots ;
- append-only logs ;
- structured JSON/YAML state.

### Écriture / édition

- document parser ;
- diff engine ;
- style linter ;
- grammar checker ;
- duplicate/repetition detector ;
- continuity checker ;
- citation validator ;
- terminology checker.

### Design

- image generation ;
- image editing ;
- typography system ;
- cover mockup renderer ;
- PDF renderer ;
- EPUB renderer ;
- visual regression screenshots.

### Publication

- EPUB validation ;
- PDF preflight ;
- metadata validator ;
- ISBN registry interface ;
- KDP packaging ;
- IngramSpark packaging.

### Marketing

- keyword research ;
- category intelligence ;
- competitor/comparable analysis ;
- email generator ;
- landing page generator ;
- social repurposing ;
- ad creative generator ;
- campaign tracker.

## 15. Design des SKILL.md

Chaque skill doit suivre un format compact et action-oriented :

```markdown
---
name: book-continuity-editor
description: ...
---

# Purpose

# When to Activate

# Inputs

# Outputs

# Required Context

# Procedure

# Decision Rules

# Checks

# Gotchas

# Do Not Activate When

# Handoff

# Examples

# References
```

Le skill ne doit pas être un manuel théorique. Il doit donner au modèle des actions, des critères et des règles de routage. Le dépôt de référence a explicitement évolué d’une approche « textbook » vers une approche « toolbox » et impose des sections comme Gotchas, boundaries et references. [Release v2.0/v2.3](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering/releases)

## 16. Router / Activation

Le système doit disposer d’un router qui répond à trois questions :

1. Quel type de travail est en cours ?
2. Quel contexte minimal est nécessaire ?
3. Quel skill possède l’ownership de l’action ?

Il ne faut pas charger tous les skills. L’activation sélective est un principe central du dépôt de référence et est appuyée par ses benchmarks. [Repository](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering)

## 17. Critères de qualité du système

### Structure

- couverture des exigences ;
- cohérence hiérarchique ;
- dépendances satisfaites ;
- absence de chapitres redondants.

### Continuité

- zéro contradiction critique ;
- chronologie stable ;
- canon stable ;
- noms et termes stables.

### Recherche

- claims critiques sourcés ;
- provenance conservée ;
- contradictions documentées ;
- sources primaires privilégiées.

### Style

- conformité au style bible ;
- voix stable ;
- variation naturelle ;
- faible répétitivité.

### Qualité narrative/argumentative

- progression ;
- tension ou intérêt ;
- valeur par chapitre ;
- transitions ;
- payoff.

### Packaging

- conformité technique ;
- lisibilité ;
- cohérence métadonnées/couverture ;
- validation EPUB/PDF.

### Marketing

- promesse cohérente avec le livre ;
- métadonnées cohérentes ;
- assets cohérents ;
- tracking des résultats.

## 18. Principe de release gate

Un livre ne doit pas passer en « publié » uniquement quand tous les chapitres existent.

Le release gate doit exiger au minimum :

```text
[ ] Outline stable
[ ] Canon stable
[ ] Style Bible stable
[ ] Research audit complete
[ ] Claims/source provenance audit complete
[ ] Developmental edit complete
[ ] Continuity audit complete
[ ] Fact-check complete where applicable
[ ] Plagiarism/similarity audit complete
[ ] Originality review complete
[ ] AI-slop audit complete
[ ] Cliché audit complete
[ ] Generic-prose audit complete
[ ] Voice-drift audit complete
[ ] Repetition audit complete
[ ] Human-voice edit complete
[ ] Copy edit complete
[ ] Proofread complete
[ ] Human review gate passed
[ ] Cover approved
[ ] Interior validated
[ ] EPUB validated
[ ] Print PDF validated where applicable
[ ] Metadata validated
[ ] Rights/provenance ledger complete
[ ] Marketing plan ready
[ ] Final human approval
```

## 19. Priorité d’implémentation

### Phase 1 — Foundation

Context engineering, filesystem context, memory, router, evaluation, harness.

### Phase 2 — Book state

Book contract, state, canon, style bible, source ledger, claims ledger, decision log.

### Phase 3 — Planning

Idea, positioning, market, outline, chapter architecture, fiction/non-fiction branching.

### Phase 4 — Writing

Voice matcher, draft writer, rewrite engine, dialogue, transitions.

### Phase 5 — Integrity + Editorial QA

Developmental, continuity, fact-check, provenance, plagiarism/similarity, originality, AI-slop, clichés, generic prose, voice drift, repetition, human-voice edit, copy, proof et human review gate.

### Phase 6 — Packaging

Front/back matter, cover, illustration, layout, EPUB/PDF validation.

### Phase 7 — Publishing + Marketing

Metadata, KDP, BISAC, ISBN, distribution, author page, launch, email, ads.

## 20. Conclusion

Le bon produit n’est pas « un agent qui écrit 500 pages ». C’est une architecture de skills capable de transformer un modèle relativement petit en exécutant éditorial spécialisé par externalisation du contexte, mémoire structurée, décomposition hiérarchique, activation sélective, outils, vérification et boucles de correction.

La capacité centrale à construire est donc :

`BOOK KNOWLEDGE + BOOK STATE + ROUTING + EXECUTION + QA + PACKAGING + DISTRIBUTION + MARKETING`

et non simplement `WRITE_BOOK_PROMPT`.

## Sources principales

- Agent Skills for Context Engineering — https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering
- Lost in the Middle — https://arxiv.org/abs/2307.03172
- NAACL 2025 — https://aclanthology.org/2025.naacl-long.63/
- SuperWriter 2026 — https://aclanthology.org/2026.findings-acl.428/
- LitBench 2026 — https://aclanthology.org/2026.eacl-long.362/
- Creativity Evaluation 2026 — https://aclanthology.org/2026.eacl-long.297/
- AIWriteBook — https://aiwritebook.com/
- AIWriteBook pricing/features — https://aiwritebook.com/en/pricing/
- KDP Content Guidelines — https://kdp.amazon.com/en_US/help/topic/G200672390
- KDP Trim Size / Bleed / Margins — https://kdp.amazon.com/en_US/help/topic/GVBQ3CMEQW2VL6
- KDP Keywords — https://kdp.amazon.com/en_US/help/topic/G201743260
- BISAC — https://www.bisg.org/BISAC-Subject-Codes-main/
- ISBN Users' Manual — https://www.isbn-international.org/content/isbn-users-manual/29
- IngramSpark Ebook Requirements — https://www.ingramspark.com/blog/file-requirements-for-ebooks
- IngramSpark Book Design — https://www.ingramspark.com/blog/topic/book-design
- Reedsy Editing — https://reedsy.com/blog/guide/editing/
- Reedsy Book Parts — https://reedsy.com/blog/guide/parts-of-a-book/
- Reedsy Marketing 101 — https://reedsy.com/learning/courses/marketing/book-marketing-101
- Amazon Ads for Authors — https://advertising.amazon.com/en-us/library/guides/advertising-books-on-amazon-authors/
- BookBub Marketing Tools — https://support.bookbub.com/articles/bookbubs-marketing-tools/
- Story Grid Genre Conventions — https://storygrid.com/genre-conventions/
- U.S. Copyright Office AI Report — https://www.copyright.gov/policy/artificial-intelligence/

# S03 — PIPELINE IA STAGES 1-2 — Classification + Schema Inference

> **Sprint**: 03 | **Semaines**: W5-W6
> **Leads**: @NEURON (AI Pipeline) + @CONDUIT (Integration M365)
> **Support**: @PHANTOM (Security review) + @NEXUS (Architecture review)
> **Phase**: A — "Prouver la Magie"

---

## OBJECTIF

Implémenter les deux premières étapes du pipeline IA contraint : Stage 1 (Classification d'intent via Claude Haiku) et Stage 2 (Inférence de schéma déterministe depuis les colonnes Excel). À la fin de S03, un utilisateur peut soumettre un prompt + un fichier Excel, et le système identifie l'archetype d'app et infère un schéma typé depuis les données.

---

## DÉPENDANCES

| Direction | Tâche | Agent |
|-----------|-------|-------|
| **Bloqué par** | S01 (shared types, monorepo) | @NEXUS |
| **Bloqué par** | S02 (auth + token proxy pour Graph API) | @PHANTOM + @FORGE |
| **Bloque** | S04 (Stage 3-4 — generation + validation) | @NEURON |
| **Bloque** | S06 (Excel sync — réutilise le schema inference) | @CONDUIT |

---

## TÂCHES DÉTAILLÉES

### TÂCHE 3.1 — Orchestrateur Pipeline + Types
**Assigné à**: @NEURON
**Complexité**: L
**Dépendance**: S01 (shared types)

```
CHECKLIST :
□ Créer packages/ai-pipeline/src/types/pipeline.types.ts :
    - PipelineInput { userPrompt: string; excelData?: ExcelSheet; tenantId: string; userId: string }
    - PipelineOutput { appSchema: AppSchema; metadata: PipelineMetadata }
    - PipelineMetadata { stages: StageResult[]; totalLatencyMs: number; totalCostEur: number }
    - StageResult { stage: 1|2|3|4; status: 'success'|'error'; latencyMs: number; costEur: number }
    - ClassificationResult { archetype: AppArchetype; confidence: number; reasoning: string }
    - InferredSchema { columns: TypedColumn[]; rowCount: number; suggestedComponents: ComponentType[] }
    - TypedColumn { name: string; originalName: string; type: ColumnDataType; nullable: boolean; sampleValues: unknown[] }
    - ColumnDataType = 'text'|'number'|'date'|'boolean'|'email'|'phone'|'url'|'currency'|'percentage'|'enum'
□ Créer packages/ai-pipeline/src/pipeline.ts :
    - Fonction principale : executePipeline(input: PipelineInput): Promise<Result<PipelineOutput, PipelineError>>
    - Exécution séquentielle : stage1 → stage2 → stage3 → stage4
    - Chaque stage retourne Result<T, E> (pas de throw)
    - Si un stage échoue, pipeline s'arrête et retourne l'erreur avec contexte
    - Mesure latence + coût à chaque stage
    - Logging structuré à chaque transition
□ Créer packages/ai-pipeline/src/errors.ts :
    - PipelineError union type avec discriminant par stage
    - ClassificationError, SchemaInferenceError, GenerationError, ValidationError
    - Chaque erreur a : code, message, stage, recoverable (boolean)
□ Tests :
    - Pipeline complète avec mocks pour chaque stage
    - Pipeline s'arrête correctement si Stage 1 échoue
    - Métriques latence/coût collectées correctement
```

---

### TÂCHE 3.2 — Stage 1 : Intent Classification (Claude Haiku)
**Assigné à**: @NEURON
**Complexité**: XL
**Dépendance**: 3.1

```
CHECKLIST :
□ Installer @anthropic-ai/sdk dans packages/ai-pipeline
□ Créer packages/ai-pipeline/src/stages/01-classify.ts :
    - Fonction : classifyIntent(userPrompt: string, excelPreview?: string[]): Promise<Result<ClassificationResult, ClassificationError>>
    - Modèle : Claude Haiku (claude-haiku-4-5-20251001)
    - Timeout : 5 secondes
    - Retry : 1 retry avec backoff exponentiel
□ Créer packages/ai-pipeline/src/prompts/classify.prompt.ts :
    - System prompt pour la classification :
      """
      Tu es un classificateur d'applications métier. Tu reçois une description
      en langage naturel d'un besoin utilisateur et optionnellement un aperçu
      de données Excel.

      Tu dois classifier ce besoin en EXACTEMENT UN des 8 archétypes suivants :
      1. crud_form — Formulaire de saisie/édition de données
      2. dashboard — Tableau de bord avec KPIs et graphiques
      3. tracker — Suivi de tâches/projets (type kanban)
      4. report — Rapport de données avec filtres et export
      5. approval — Workflow de validation/approbation
      6. checklist — Liste de vérification avec cases à cocher
      7. gallery — Galerie d'images/fichiers avec métadonnées
      8. multi_view — Application multi-pages combinant plusieurs vues

      Réponds UNIQUEMENT en JSON avec le format :
      {
        "archetype": "<un des 8 types>",
        "confidence": <0.0 à 1.0>,
        "reasoning": "<explication courte en français>"
      }

      Règles :
      - Si confidence < 0.6, choisis "multi_view" par défaut
      - Si les données Excel contiennent des images → considère "gallery"
      - Si le prompt mentionne "suivi", "kanban", "statut" → considère "tracker"
      - Si le prompt mentionne "rapport", "analyse", "stats" → considère "report"
      - Si le prompt mentionne "valider", "approuver" → considère "approval"
      """
□ Implémenter le parsing de la réponse :
    - JSON.parse strict (pas de regex)
    - Validation Zod de la réponse
    - Si parsing échoue → retry 1 fois
    - Si retry échoue → erreur recoverable avec archetype "multi_view" par défaut
□ Implémenter le cost tracking :
    - Compter input_tokens + output_tokens depuis la réponse API
    - Calculer le coût : (input * 0.25 + output * 1.25) / 1_000_000
    - Logger le coût dans PipelineMetadata
□ Créer un jeu de tests exhaustif (30+ cas) :
    - "Je veux un formulaire pour saisir les incidents terrain" → crud_form
    - "Montre-moi les KPIs de vente du mois" → dashboard
    - "Je veux suivre l'avancement des tâches de mon équipe" → tracker
    - "Génère un rapport des ventes par région" → report
    - "Les managers doivent valider les demandes de congé" → approval
    - "Checklist d'inspection pour les magasins" → checklist
    - "Galerie photos des produits avec fiches" → gallery
    - "App complète pour gérer mon équipe" → multi_view
    - Prompts ambigus → vérifier confidence < 0.6 → multi_view
    - Prompts en français, anglais, franglais
    - Prompts très courts (3 mots) vs très longs (200 mots)
    - Prompts avec et sans données Excel
□ Quality gate : taux de classification correcte > 80% sur le jeu de test
```

**Critères d'acceptance** :
- Classification correcte sur > 80% du jeu de test (30+ cas)
- Latence P95 < 500ms
- Coût moyen < 0.002 EUR par appel
- Retry automatique en cas d'erreur API
- Pas de crash si Claude retourne du JSON invalide

---

### TÂCHE 3.3 — Stage 2 : Schema Inference (Déterministe)
**Assigné à**: @CONDUIT + @NEURON
**Complexité**: XL
**Dépendance**: 3.1, S02 (token proxy)

```
CHECKLIST :
□ Créer packages/ai-pipeline/src/stages/02-infer-schema.ts :
    - Fonction : inferSchema(excelData: ExcelSheet): Result<InferredSchema, SchemaInferenceError>
    - DÉTERMINISTE — Pas d'appel IA, pas d'aléatoire
    - Même input = même output, toujours
□ Implémenter les 10 règles de typage (dans l'ordre de priorité) :
    Règle 1 : Détection email — regex ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$
    Règle 2 : Détection téléphone — regex adaptée FR (+33, 0X XX XX XX XX)
    Règle 3 : Détection URL — regex ^https?://
    Règle 4 : Détection date — ISO 8601, formats FR (DD/MM/YYYY), formats US (MM/DD/YYYY)
    Règle 5 : Détection booléen — oui/non, true/false, vrai/faux, 0/1
    Règle 6 : Détection pourcentage — nombre + % ou valeur 0-1 avec label contenant "%"
    Règle 7 : Détection monétaire — nombre + €/$, ou label contenant "prix", "coût", "montant"
    Règle 8 : Détection nombre — parseFloat réussit sur >80% des valeurs non-null
    Règle 9 : Détection enum — <20 valeurs uniques ET ratio uniques/total < 0.3
    Règle 10 : Défaut → text
□ Implémenter la logique de typage :
    - Prendre un échantillon de N valeurs (min(50, totalRows))
    - Pour chaque colonne, tester les règles dans l'ordre
    - La première règle qui matche sur >80% des valeurs non-null gagne
    - Calculer nullable : si >5% des valeurs sont null/vide
    - Stocker 5 sampleValues représentatifs
□ Implémenter le nettoyage des noms de colonnes :
    - snake_case normalisé
    - Supprimer les accents (normaliser NFD + strip diacritiques)
    - Remplacer espaces/spéciaux par _
    - Tronquer à 64 caractères
    - Préserver le originalName pour l'affichage
□ Implémenter la suggestion de composants par archetype :
    - crud_form → [FormField, DataTable, FilterBar, Container]
    - dashboard → [KPICard, BarChart, FilterBar, Container]
    - tracker → [KanbanBoard, FilterBar, Container] (Phase B)
    - report → [DataTable, BarChart, FilterBar, Container]
    - approval → [FormField, DataTable, Container] (+ workflow Phase B)
    - checklist → [FormField, DataTable, Container]
    - gallery → [ImageGallery, FilterBar, Container] (Phase B)
    - multi_view → [PageNav, DataTable, FormField, KPICard, Container]
□ Créer le parseur Excel :
    - Utiliser SheetJS (xlsx) pour parser les fichiers .xlsx/.xls/.csv
    - Extraire : sheetNames, headers, rows (limité à 1000 premières lignes pour l'inférence)
    - Gérer les cas edge : cellules fusionnées, headers sur ligne 2+, feuilles multiples
□ Tests exhaustifs :
    - Excel avec colonnes typiques FR (Nom, Prénom, Email, Téléphone, Date, Montant)
    - Excel avec données sales (null, espaces, types mixtes)
    - Excel avec >100 colonnes (doit tronquer/prioriser)
    - CSV encodé en UTF-8, Latin-1, Windows-1252
    - Fichier vide ou 1 seule ligne
    - Colonnes sans headers
    - Dates dans 5 formats différents
□ Quality gate : inférence correcte sur > 90% des colonnes d'un jeu de test de 10 fichiers Excel variés
```

**Critères d'acceptance** :
- 10 règles de typage implémentées et testées individuellement
- Inférence correcte > 90% sur jeu de test varié
- Latence < 100ms pour un fichier de 1000 lignes
- Coût : 0 EUR (déterministe)
- Gestion propre des fichiers corrompus/vides
- Noms de colonnes normalisés en snake_case

---

### TÂCHE 3.4 — Endpoint API Generation (Phase 1-2 seulement)
**Assigné à**: @FORGE + @NEURON
**Complexité**: M
**Dépendance**: 3.2, 3.3, S02 (auth)

```
CHECKLIST :
□ Créer src/routes/generation.routes.ts :
    - POST /api/generate/classify
      * Body : { prompt: string }
      * Auth required
      * Rate limited (plan-based)
      * Retourne : { archetype, confidence, reasoning }
    - POST /api/generate/infer-schema
      * Body : multipart/form-data avec fichier Excel
      * Ou : { dataSourceId: string } pour une source déjà connectée
      * Retourne : { columns: TypedColumn[], rowCount, suggestedComponents }
    - POST /api/generate/preview (S03 — stages 1+2 combinés)
      * Body : { prompt: string, file?: File, dataSourceId?: string }
      * Exécute Stage 1 + Stage 2
      * Retourne : { classification, schema, estimatedCost, estimatedLatency }
      * L'utilisateur peut reviewer avant de lancer Stage 3-4
□ Gérer l'upload de fichier Excel :
    - Taille max : 10MB
    - Types acceptés : .xlsx, .xls, .csv
    - Stockage temporaire (pas persisté — data-in-situ)
    - Supprimé après traitement
□ Tests endpoint avec fichiers de test réalistes
```

---

### TÂCHE 3.5 — Accès Graph API pour lire les fichiers Excel
**Assigné à**: @CONDUIT
**Complexité**: L
**Dépendance**: S02 (token proxy)

```
CHECKLIST :
□ Créer packages/api/src/services/graph-api.service.ts :
    - listDriveFiles(userId: string): récupérer les fichiers Excel du OneDrive
      * GET /me/drive/root/search(q='.xlsx')
      * Limiter à 50 résultats
      * Retourner : id, name, size, lastModified, webUrl
    - getExcelContent(fileId: string): télécharger et parser un fichier Excel
      * GET /me/drive/items/{id}/content
      * Parser avec SheetJS
      * Retourner les données brutes (headers + rows)
    - listSharePointLists(siteId: string): lister les listes SharePoint
      * GET /sites/{id}/lists
    - getSharePointListItems(siteId: string, listId: string): lire les items
      * GET /sites/{id}/lists/{id}/items
□ Toutes les requêtes passent par le token proxy (jamais de token côté client)
□ Gérer les erreurs Graph API :
    - 401 → refresh token automatique
    - 429 → retry avec backoff (respecter Retry-After header)
    - 403 → permission manquante → message explicite
    - 404 → fichier supprimé/déplacé
□ Créer un endpoint pour le file picker frontend :
    - GET /api/data-sources/files → liste les fichiers Excel accessibles
    - GET /api/data-sources/files/:id/preview → aperçu des premières lignes
□ Tests avec mocks Graph API (pas de vrais appels en CI)
```

---

## LIVRABLES S03

| Livrable | Chemin | Owner |
|----------|--------|-------|
| Pipeline orchestrateur | `packages/ai-pipeline/src/pipeline.ts` | @NEURON |
| Stage 1 Classification | `packages/ai-pipeline/src/stages/01-classify.ts` | @NEURON |
| Stage 2 Schema Inference | `packages/ai-pipeline/src/stages/02-infer-schema.ts` | @CONDUIT + @NEURON |
| Prompts Classification | `packages/ai-pipeline/src/prompts/classify.prompt.ts` | @NEURON |
| Graph API Service | `packages/api/src/services/graph-api.service.ts` | @CONDUIT |
| Generation Endpoints | `packages/api/src/routes/generation.routes.ts` | @FORGE |
| Jeu de test 30+ cas | `packages/ai-pipeline/tests/classify.test.ts` | @NEURON |
| Jeu de test Excel 10 fichiers | `tests/fixtures/excel/` | @CONDUIT |

---

## DEFINITION OF DONE S03

- [ ] Stage 1 : > 80% classification correcte sur 30+ cas
- [ ] Stage 2 : > 90% inférence correcte sur 10 fichiers Excel variés
- [ ] Latence Stage 1 < 500ms P95
- [ ] Latence Stage 2 < 100ms
- [ ] Coût Stage 1 < 0.002 EUR/appel
- [ ] Graph API service fonctionnel (list files, get content)
- [ ] Endpoint /api/generate/preview retourne classification + schema
- [ ] Zero token OAuth dans les réponses/logs
- [ ] CI passe en vert

---

## HANDOFF → S04

```
## HANDOFF: @NEURON + @CONDUIT → @NEURON + @PRISM
**Sprint**: S04
**Statut**: READY
**Livrables prêts**:
  - Pipeline orchestrateur avec Stage 1 + 2 fonctionnels
  - Classification 8 archetypes avec Claude Haiku
  - Schema inference déterministe avec 10 règles de typage
  - Graph API service pour lire les fichiers Excel
**Prochaine étape**: @NEURON implémente Stage 3 (Constrained Generation)
**Prochaine étape**: @PRISM implémente Stage 4 (Validation) + AppRenderer
```

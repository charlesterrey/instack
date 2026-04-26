# S04 — PIPELINE IA STAGES 3-4 — Constrained Generation + Validation

> **Sprint**: 04 | **Semaines**: W7-W8
> **Leads**: @NEURON (AI Pipeline) + @PRISM (Frontend/Validation)
> **Support**: @PHANTOM (AST Security Scan) + @MOSAIC (Component specs)
> **Phase**: A — "Prouver la Magie"

---

## OBJECTIF

Implémenter les deux dernières étapes du pipeline IA : Stage 3 (Génération contrainte via Claude Sonnet 4 en mode tool_use JSON strict) et Stage 4 (Validation déterministe + rendu React). À la fin de S04, le pipeline complet fonctionne end-to-end : prompt → classification → schema → JSON app → composants React.

**C'est le sprint le plus critique de la Phase A. Si Stage 3 ne génère pas du JSON valide à >90%, le produit ne marche pas.**

---

## DÉPENDANCES

| Direction | Tâche | Agent |
|-----------|-------|-------|
| **Bloqué par** | S03 (Stage 1-2, pipeline orchestrateur) | @NEURON |
| **Bloqué par** | S01 (shared types, component types) | @NEXUS |
| **Bloque** | S05 (Composants UI — besoin du format JSON exact) | @PRISM + @MOSAIC |
| **Bloque** | S07 (Sandbox — besoin du pipeline complet) | @FORGE |
| **Bloque** | S08 (Integration E2E) | @BLUEPRINT |

---

## TÂCHES DÉTAILLÉES

### TÂCHE 4.1 — Stage 3 : Constrained Generation (Claude Sonnet 4)
**Assigné à**: @NEURON
**Complexité**: XXL — C'est la tâche la plus complexe du MVP
**Dépendance**: S03 (Stage 1+2 output)

```
CHECKLIST :
□ Créer packages/ai-pipeline/src/stages/03-generate.ts :
    - Fonction : generateAppSchema(
        classification: ClassificationResult,
        schema: InferredSchema,
        userPrompt: string
      ): Promise<Result<AppSchema, GenerationError>>
    - Modèle : Claude Sonnet 4 (claude-sonnet-4-6)
    - Mode : tool_use avec JSON schema strict
    - Timeout : 15 secondes
    - Retry : 2 retries avec backoff
□ Créer packages/ai-pipeline/src/prompts/generate.prompt.ts :
    - System prompt pour la génération contrainte :
      """
      Tu es un assembleur d'applications métier. Tu reçois :
      1. Un archétype d'application (classifié à l'étape précédente)
      2. Un schéma de données typé (inféré depuis un fichier Excel)
      3. Le prompt original de l'utilisateur

      Tu dois générer un JSON qui décrit l'application en assemblant
      UNIQUEMENT les composants pré-approuvés suivants :

      COMPOSANTS PHASE A (disponibles maintenant) :
      - form_field : Champ de formulaire (text, number, date, select, checkbox, textarea, email, phone)
      - data_table : Tableau de données avec tri et pagination
      - kpi_card : Carte métrique avec valeur, tendance, icône
      - bar_chart : Graphique en barres (vertical ou horizontal)
      - filter_bar : Barre de filtres combinés
      - container : Conteneur de layout (stack, grid, columns, sidebar)

      RÈGLES STRICTES :
      1. Tu ne peux utiliser QUE les composants listés ci-dessus
      2. Chaque composant doit avoir un id unique (format: {type}_{index})
      3. Les data bindings doivent référencer des colonnes existantes du schéma
      4. Le layout doit être responsive (utiliser container avec grid/columns)
      5. Maximum 20 composants par app
      6. Maximum 3 niveaux de nesting (container dans container dans container)
      7. Les KPI cards utilisent des agrégations : count, sum, avg, min, max
      8. Les filtres doivent correspondre à des colonnes existantes

      MAPPING ARCHETYPE → LAYOUT :
      - crud_form : Container(columns:2) > FormFields + DataTable en dessous
      - dashboard : Container(grid:3) > KPICards en haut + BarCharts en dessous + FilterBar
      - tracker : DataTable avec status column + FilterBar (kanban en Phase B)
      - report : FilterBar en haut + DataTable + BarChart en dessous
      - approval : FormField(status) + DataTable des items + actions
      - checklist : DataTable avec checkbox column + progress KPICard
      - gallery : DataTable en mode card (gallery en Phase B)
      - multi_view : Container(sidebar) > navigation + contenu principal
      """
□ Définir le JSON Schema pour tool_use :
    - Utiliser le mode tool_use de Claude avec un outil "create_app"
    - Le schema de l'outil définit EXACTEMENT la structure attendue
    - Claude est FORCÉ de retourner du JSON valide selon ce schema
    - Schema détaillé :
      {
        name: "create_app",
        description: "Crée une application métier à partir de composants pré-approuvés",
        input_schema: {
          type: "object",
          required: ["name", "description", "layout", "components", "dataBindings"],
          properties: {
            name: { type: "string", maxLength: 100 },
            description: { type: "string", maxLength: 500 },
            layout: {
              type: "object",
              required: ["type", "gap"],
              properties: {
                type: { enum: ["stack", "grid", "columns", "sidebar"] },
                columns: { type: "integer", minimum: 1, maximum: 4 },
                gap: { enum: ["sm", "md", "lg"] }
              }
            },
            components: {
              type: "array",
              maxItems: 20,
              items: {
                type: "object",
                required: ["id", "type", "props", "position"],
                properties: {
                  id: { type: "string", pattern: "^[a-z_]+_[0-9]+$" },
                  type: { enum: ["form_field", "data_table", "kpi_card", "bar_chart", "filter_bar", "container"] },
                  props: { type: "object" },
                  position: {
                    type: "object",
                    required: ["row", "col"],
                    properties: {
                      row: { type: "integer", minimum: 0 },
                      col: { type: "integer", minimum: 0 },
                      span: { type: "integer", minimum: 1, maximum: 4 }
                    }
                  },
                  dataBinding: { type: "string" }
                }
              }
            },
            dataBindings: {
              type: "array",
              items: {
                type: "object",
                required: ["id", "sourceColumn", "transform"],
                properties: {
                  id: { type: "string" },
                  sourceColumn: { type: "string" },
                  transform: { enum: ["raw", "count", "sum", "avg", "min", "max", "distinct", "group_by"] }
                }
              }
            }
          }
        }
      }
□ Implémenter le post-processing :
    - Vérifier que tous les composants référencent des colonnes existantes
    - Vérifier que les IDs sont uniques
    - Vérifier les limites (20 composants, 3 niveaux nesting)
    - Si violations → corriger automatiquement quand possible (sinon erreur)
□ Implémenter le cost tracking :
    - Input tokens + output tokens
    - Coût Sonnet : (input * 3.0 + output * 15.0) / 1_000_000
    - Logger dans PipelineMetadata
□ Tests (20+ cas) :
    - Un prompt + schema → JSON valide pour chaque archétype (8 tests)
    - Prompt ambigu → génération raisonnable
    - Schema avec beaucoup de colonnes (>30) → sélection intelligente
    - Schema avec peu de colonnes (<3) → app minimale mais fonctionnelle
    - Vérifier que le JSON est TOUJOURS valide (pas de crash)
    - Mesurer le temps de génération (<5s P95)
□ Quality gate : JSON valide sur > 90% des cas de test
```

**Critères d'acceptance** :
- JSON valide sur > 90% des cas de test
- Latence P95 < 5 secondes
- Coût moyen < 0.025 EUR par génération
- Le JSON respecte le schema strict (validé par Zod)
- Pas de composants non-autorisés dans le JSON
- Tous les data bindings référencent des colonnes existantes

---

### TÂCHE 4.2 — Stage 4 : Validation & Sanitization (Déterministe)
**Assigné à**: @NEURON + @PHANTOM
**Complexité**: L
**Dépendance**: 4.1

```
CHECKLIST :
□ Créer packages/ai-pipeline/src/stages/04-validate.ts :
    - Fonction : validateAppSchema(schema: unknown): Result<ValidatedAppSchema, ValidationError>
    - DÉTERMINISTE — Pas d'IA, même input = même output
□ Implémenter les 3 passes de validation :

    PASSE 1 — Type Checking (Zod) :
    □ Valider le JSON complet contre le Zod schema
    □ Vérifier tous les champs requis présents
    □ Vérifier les types de chaque champ
    □ Vérifier les contraintes (maxItems, maxLength, enum values)
    □ Si invalide → retourner les erreurs précises (path + message)

    PASSE 2 — Layout Validation :
    □ Vérifier qu'il n'y a pas de composants qui se chevauchent (même position)
    □ Vérifier le nesting max 3 niveaux
    □ Vérifier que chaque container a au moins 1 enfant
    □ Vérifier que le layout est cohérent (pas de colonnes > 4)
    □ Vérifier que les data bindings existent dans le schema source
    □ Si incohérence → corriger automatiquement (re-positionner, flatten)

    PASSE 3 — AST Security Scan (@PHANTOM) :
    □ Scanner le JSON pour des patterns dangereux :
      - Pas de <script> dans les valeurs string
      - Pas de javascript: dans les URLs
      - Pas de on* event handlers
      - Pas de data: URLs (sauf images data:image/*)
      - Pas de SQL injection patterns dans les valeurs
      - Pas de template literals ${} dans les strings
    □ Si pattern dangereux trouvé → sanitizer la valeur (escape) ou rejeter
    □ Logger tout pattern suspect dans l'audit log

□ Créer packages/ai-pipeline/src/validators/ :
    - schema.validator.ts — Zod schema pour AppSchema
    - layout.validator.ts — Règles de layout
    - security.validator.ts — AST security scan
□ Tests :
    - JSON valide → passe les 3 passes → retourne ValidatedAppSchema
    - JSON avec champ manquant → Passe 1 rejette avec erreur précise
    - JSON avec composants chevauchants → Passe 2 corrige automatiquement
    - JSON avec <script> dans une valeur → Passe 3 sanitize
    - JSON avec injection SQL → Passe 3 rejette
    - Performance : validation < 50ms pour un schema de 20 composants
```

**Critères d'acceptance** :
- 3 passes de validation exécutées séquentiellement
- Correction automatique quand possible (pas de rejet si corrigeable)
- Security scan bloque tous les patterns dangereux connus
- Latence < 50ms
- Coût : 0 EUR (déterministe)

---

### TÂCHE 4.3 — AppRenderer (JSON → React)
**Assigné à**: @PRISM
**Complexité**: XL
**Dépendance**: 4.2, S01 (ui package skeleton)

```
CHECKLIST :
□ Créer packages/web/src/components/AppRenderer/AppRenderer.tsx :
    - Props : { schema: ValidatedAppSchema; data: Record<string, unknown>[] }
    - DÉTERMINISTE : même schema + même data = même rendu, toujours
    - Pas de side effects, pas de state interne (pure function component)
□ Implémenter le mapping type → composant :
    const COMPONENT_MAP: Record<ComponentType, React.FC<any>> = {
      form_field: FormField,
      data_table: DataTable,
      kpi_card: KPICard,
      bar_chart: BarChart,
      filter_bar: FilterBar,
      container: Container,
    };
□ Implémenter la résolution des data bindings :
    - Pour chaque composant avec dataBinding, résoudre la référence
    - Appliquer les transforms (count, sum, avg, etc.) sur les données
    - Injecter les données résolues dans les props du composant
□ Implémenter le layout engine :
    - Trier les composants par position (row, col)
    - Construire l'arbre de containers
    - Appliquer le CSS Grid/Flexbox selon le layout type
    - Responsive : stack sur mobile, grid sur desktop
□ Implémenter l'error boundary :
    - Si un composant crashe, afficher un placeholder d'erreur
    - Ne pas crasher toute l'app pour un composant défaillant
    - Logger l'erreur dans Sentry
□ Créer le composant AppPreview (pour le wizard de génération) :
    - Version read-only du renderer
    - Avec des données d'exemple
    - Animation de transition quand le schema change
□ Tests :
    - Render un schema simple (1 KPICard) → vérifier le DOM
    - Render un dashboard (4 KPIs + 2 charts) → layout correct
    - Render avec données → data bindings résolus correctement
    - Render avec composant invalide → error boundary catches
    - Snapshot tests pour chaque archétype
```

**Critères d'acceptance** :
- Rendu correct pour les 6 archétypes actifs (gallery/kanban en Phase B)
- Data bindings résolus (count, sum, avg fonctionnent)
- Layout responsive (mobile stack, desktop grid)
- Error boundary en place (pas de crash total)
- Performance : render < 100ms pour 20 composants

---

### TÂCHE 4.4 — Endpoint Pipeline Complet
**Assigné à**: @FORGE + @NEURON
**Complexité**: L
**Dépendance**: 4.1, 4.2, 4.3

```
CHECKLIST :
□ Compléter POST /api/generate :
    - Body : { prompt: string, dataSourceId?: string, file?: File }
    - Exécuter le pipeline complet (4 stages)
    - Retourner : {
        app: { id, name, schema_json, archetype, status: 'draft' },
        pipeline: { stages: [...], totalLatencyMs, totalCostEur }
      }
    - Sauvegarder l'app en DB avec status 'draft'
    - Audit log : 'app.generated'
    - Rate limit : basé sur le plan
□ Créer POST /api/generate/retry :
    - Re-exécuter Stage 3-4 avec un prompt affiné
    - Garder la même classification et le même schema
    - Permet à l'utilisateur de "réessayer" si le résultat ne convient pas
□ Créer GET /api/apps/:id/render :
    - Retourne le schema JSON + les données pour le rendering frontend
    - Le frontend appelle AppRenderer avec ces données
□ Streaming (optionnel S04, obligatoire S15) :
    - SSE pour streamer le progress (Stage 1 done... Stage 2 done...)
    - Le frontend montre une progress bar en temps réel
□ Tests E2E du pipeline complet :
    - Prompt + Excel → app créée en DB → renderable par AppRenderer
    - Mesurer la latence totale (target < 5s)
    - Mesurer le coût total (target < 0.03 EUR)
```

---

## LIVRABLES S04

| Livrable | Chemin | Owner |
|----------|--------|-------|
| Stage 3 Generation | `packages/ai-pipeline/src/stages/03-generate.ts` | @NEURON |
| Stage 4 Validation | `packages/ai-pipeline/src/stages/04-validate.ts` | @NEURON + @PHANTOM |
| Generation Prompt | `packages/ai-pipeline/src/prompts/generate.prompt.ts` | @NEURON |
| AppRenderer | `packages/web/src/components/AppRenderer/AppRenderer.tsx` | @PRISM |
| Pipeline Endpoint | `packages/api/src/routes/generation.routes.ts` | @FORGE |
| ADR #003 Pipeline | `docs/adr/003-ai-pipeline-constrained-generation.md` | @NEURON |

---

## DEFINITION OF DONE S04

- [ ] Pipeline complet : prompt → classification → schema → JSON → React
- [ ] Stage 3 : JSON valide > 90% sur 20+ cas de test
- [ ] Stage 4 : 3 passes validation fonctionnelles
- [ ] AppRenderer : rendu correct pour les 6 archétypes actifs
- [ ] Latence pipeline totale < 5s P95
- [ ] Coût pipeline total < 0.03 EUR
- [ ] Security scan bloque les injections
- [ ] Endpoint /api/generate retourne une app fonctionnelle
- [ ] CI passe en vert

---

## HANDOFF → S05

```
## HANDOFF: @NEURON + @PRISM → @PRISM + @MOSAIC
**Sprint**: S05
**Statut**: READY
**Livrables prêts**:
  - Pipeline complet 4 stages fonctionnel
  - AppRenderer transforme JSON → React
  - Format JSON exact défini (tool_use schema)
**Prochaine étape**: @PRISM + @MOSAIC implémentent les 6 composants atomiques en détail
**Note**: Les composants ont des skeletons depuis S01, il faut maintenant les remplir complètement
```

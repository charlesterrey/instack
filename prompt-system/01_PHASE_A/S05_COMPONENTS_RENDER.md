# S05 — 6 COMPOSANTS ATOMIQUES + DESIGN SYSTEM

> **Sprint**: 05 | **Semaines**: W9-W10
> **Leads**: @PRISM (Frontend) + @MOSAIC (Design System)
> **Support**: @SPECTRUM (UX Specs) + @NEURON (data binding format)
> **Phase**: A — "Prouver la Magie"

---

## OBJECTIF

Implémenter les 6 composants atomiques Phase A en production-ready : FormField, DataTable, KPICard, BarChart, FilterBar, Container. Chaque composant est un wrapper typé qui compose les primitives Untitled UI (copiées localement via CLI) + React Aria, connecté au système de data binding du pipeline IA, responsive, accessible (WCAG 2.1 AA), et testé. Stylé via classes Tailwind CSS v4 utilisant les tokens du theme.css Untitled UI.

---

## DÉPENDANCES

| Direction | Tâche | Agent |
|-----------|-------|-------|
| **Bloqué par** | S01 (ui skeleton + design tokens) | @MOSAIC |
| **Bloqué par** | S04 (AppRenderer + JSON format exact) | @PRISM + @NEURON |
| **Bloque** | S07 (Sandbox demo — besoin des composants rendus) | @FORGE |
| **Bloque** | S08 (Integration E2E) | @BLUEPRINT |
| **Bloque** | S10 (6 composants avancés — même pattern) | @PRISM |

---

## TÂCHES DÉTAILLÉES

### TÂCHE 5.1 — FormField (Composant le plus complexe)
**Assigné à**: @PRISM
**Complexité**: XL
**Dépendance**: S01 (skeleton), S04 (data binding format)
**Ref Design System**: `02_DESIGN_SYSTEM.md` → FormField interface

```
CHECKLIST :
□ Implémenter packages/ui/src/components/FormField/FormField.tsx :
    - 8 types de champs : text, number, date, select, checkbox, textarea, email, phone
    - Chaque type compose le composant Untitled UI copié localement :
      * text/email/phone/number → <Input> de @/components/input
      * date → <DatePicker> de @/components/date-picker ou <Input type="date">
      * select → <Select> de @/components/select
      * checkbox → <Checkbox> de @/components/checkbox
      * textarea → <Textarea> de @/components/textarea
    - Props complètes selon l'interface de 02_DESIGN_SYSTEM.md
    - Validation inline :
      * required → message d'erreur si vide au blur
      * email → regex validation
      * phone → regex FR
      * number → min/max si défini
      * Custom validation via prop validation: ValidationRule[]
    - États visuels : default, focused, error, disabled, loading
    - Intégration data binding : le composant peut être pré-rempli depuis les données Excel
□ Créer FormField.stories.tsx (Storybook) :
    - Story pour chaque type (8 stories)
    - Story état erreur
    - Story disabled
    - Story avec pré-remplissage
□ Créer FormField.test.tsx :
    - Render chaque type
    - Validation déclenche l'erreur
    - onChange appelé avec la bonne valeur
    - Accessible : aria-label, aria-invalid, aria-describedby
    - Keyboard navigation : Tab entre les champs
□ Accessibility :
    - <label> associé via htmlFor
    - aria-invalid quand en erreur
    - aria-describedby pour helpText et errorMessage
    - Focus ring visible (outline, pas box-shadow)
```

---

### TÂCHE 5.2 — DataTable
**Assigné à**: @PRISM
**Complexité**: XL
**Dépendance**: S01, S04

```
CHECKLIST :
□ Implémenter packages/ui/src/components/DataTable/DataTable.tsx :
    - Utiliser <Table> de @/components/table (copié depuis Untitled UI) comme base
    - Colonnes dynamiques depuis ColumnDef[]
    - Tri côté client : clic sur header → asc/desc/none
    - Pagination côté client : pageSize configurable, navigation
    - Recherche globale : filtre texte sur toutes les colonnes
    - Sélection de lignes : checkbox colonne avec select all
    - Types de colonnes avec rendu spécialisé :
      * text → texte brut, tronqué avec tooltip si >50 chars
      * number → formaté avec séparateur milliers (FR: 1 234,56)
      * date → formaté en DD/MM/YYYY
      * badge → <Badge> (de @/components/badge) avec couleur par valeur
      * avatar → <Avatar> (de @/components/avatar) avec initiales si pas d'image
      * actions → boutons edit/delete en row hover
    - État vide : illustration + message "Aucune donnée"
    - État loading : skeleton rows
    - Responsive : scroll horizontal sur mobile, colonnes prioritaires
□ Performance :
    - Virtualisation si > 100 lignes (react-window ou intersection observer)
    - Mémorisation des colonnes triées
    - Pas de re-render sur scroll
□ Tests : tri, pagination, recherche, sélection, types colonnes, empty state
□ Storybook : 5+ stories couvrant les cas d'usage
```

---

### TÂCHE 5.3 — KPICard
**Assigné à**: @PRISM
**Complexité**: M
**Dépendance**: S01, S04

```
CHECKLIST :
□ Implémenter packages/ui/src/components/KPICard/KPICard.tsx :
    - Utiliser <Card> de @/components/card (copié depuis Untitled UI) comme base
    - Affichage : titre, valeur principale (grande), tendance (flèche + %)
    - Tendance : vert si increase, rouge si decrease, gris si neutral
    - Calcul du changement : ((current - previous) / previous * 100).toFixed(1)
    - Sparkline mini : petit graphique de tendance (optionnel)
      * Utiliser <svg> simple, pas de librairie lourde
    - Tailles : sm (compact), md (standard), lg (featured)
    - Icône optionnelle en haut à gauche
    - Responsive : full width sur mobile
□ Formatage intelligent des valeurs :
    - Nombre > 1000 → "1.2K", > 1000000 → "1.2M"
    - Monétaire → "1 234 €"
    - Pourcentage → "67%"
    - Durée → "2h 34min"
□ Tests : rendu valeur, tendance, formatage, tailles
□ Storybook : increase/decrease/neutral, 3 tailles, avec/sans sparkline
```

---

### TÂCHE 5.4 — BarChart
**Assigné à**: @PRISM
**Complexité**: L
**Dépendance**: S01, S04

```
CHECKLIST :
□ Installer recharts dans packages/ui
□ Implémenter packages/ui/src/components/BarChart/BarChart.tsx :
    - Utiliser <BarChart> de recharts
    - Wrapper avec les design tokens instack (couleurs, fonts)
    - Props complètes selon 02_DESIGN_SYSTEM.md
    - Features :
      * Vertical (défaut) ou horizontal
      * Stacked ou grouped
      * Multiple Y series (multi-couleur)
      * Légende optionnelle
      * Grille optionnelle
      * Tooltip au hover (formaté)
      * Axes labels avec rotation si nombreux
    - Couleurs par défaut : palette instack (primary, success, warning, error + gris)
    - Responsive : hauteur adaptative, labels tronqués sur mobile
    - Empty state : "Pas de données à afficher"
    - Loading state : skeleton
□ Accessibilité :
    - role="img" avec aria-label descriptif
    - Données accessibles en tableau caché pour screen readers
□ Tests : rendu avec données, multi-series, stacked, responsive
□ Storybook : vertical, horizontal, stacked, multi-series, empty
```

---

### TÂCHE 5.5 — FilterBar
**Assigné à**: @PRISM
**Complexité**: M
**Dépendance**: S01, S04

```
CHECKLIST :
□ Implémenter packages/ui/src/components/FilterBar/FilterBar.tsx :
    - Barre horizontale de filtres combinés
    - Types de filtres :
      * select → dropdown Untitled UI
      * search → input texte avec icône loupe
      * date_range → 2 date pickers (du / au)
      * toggle → switch on/off
      * multi_select → dropdown avec checkboxes
    - Bouton "Réinitialiser" qui clear tous les filtres
    - Badge compteur "X filtres actifs"
    - Layout horizontal par défaut, vertical sur mobile
    - Les filtres sont générés dynamiquement depuis FilterDef[]
    - Chaque changement de filtre appelle onChange(key, value)
□ Intégration avec DataTable :
    - FilterBar filtre les données affichées dans le DataTable
    - Les filtres sont générés depuis les colonnes du schema
    - Type de filtre déduit du type de colonne :
      * enum → select
      * text → search
      * date → date_range
      * boolean → toggle
      * number → range slider (futur) ou search
□ Tests : chaque type de filtre, reset, badge compteur
□ Storybook : horizontal, vertical, avec DataTable
```

---

### TÂCHE 5.6 — Container
**Assigné à**: @PRISM
**Complexité**: M
**Dépendance**: S01

```
CHECKLIST :
□ Implémenter packages/ui/src/components/Container/Container.tsx :
    - Layout primitive — le plus important des composants de structure
    - 4 modes de layout :
      * stack → flexbox vertical (children empilés)
      * grid → CSS Grid avec N colonnes
      * columns → flexbox horizontal (children côte à côte, wrap)
      * sidebar → flexbox avec sidebar fixe + contenu scrollable
    - Gap configurable (design tokens spacing)
    - Padding configurable
    - Background : white (card), gray (section), transparent
    - Border optionnelle (1px solid gray-200)
    - Border radius configurable
    - Responsive :
      * grid → 1 colonne sur mobile, N colonnes sur desktop
      * columns → stack sur mobile
      * sidebar → drawer sur mobile
    - Nestable : Container peut contenir des Containers (max 3 niveaux)
□ Tests : chaque layout mode, responsive, nesting
□ Storybook : stack, grid(2/3/4 cols), columns, sidebar
```

---

### TÂCHE 5.7 — Intégration Composants dans AppRenderer
**Assigné à**: @PRISM
**Complexité**: L
**Dépendance**: 5.1 à 5.6, S04 (AppRenderer)

```
CHECKLIST :
□ Mettre à jour AppRenderer pour utiliser les vrais composants :
    - Remplacer les placeholders par les composants réels
    - Résoudre les data bindings → injecter dans les props
    - Gérer les agrégations (count, sum, avg) dans un hook useDataAggregation
□ Créer un hook useDataAggregation :
    - count(data, column?) → nombre de lignes (ou valeurs non-null)
    - sum(data, column) → somme des valeurs numériques
    - avg(data, column) → moyenne
    - min(data, column) → minimum
    - max(data, column) → maximum
    - distinct(data, column) → valeurs uniques
    - group_by(data, column) → { [value]: count }
□ Tester le rendu complet pour chaque archétype :
    - crud_form : formulaire + tableau de données
    - dashboard : 4 KPI cards + 2 bar charts + filtre
    - report : filtres + tableau + graphique
    - checklist : tableau avec checkboxes + KPI progression
□ Snapshot tests pour chaque archétype
□ Performance test : 20 composants render < 100ms
```

---

## LIVRABLES S05

| Livrable | Chemin | Owner |
|----------|--------|-------|
| FormField | `packages/ui/src/components/FormField/` | @PRISM |
| DataTable | `packages/ui/src/components/DataTable/` | @PRISM |
| KPICard | `packages/ui/src/components/KPICard/` | @PRISM |
| BarChart | `packages/ui/src/components/BarChart/` | @PRISM |
| FilterBar | `packages/ui/src/components/FilterBar/` | @PRISM |
| Container | `packages/ui/src/components/Container/` | @PRISM |
| AppRenderer complet | `packages/web/src/components/AppRenderer/` | @PRISM |
| Storybook | `packages/ui/.storybook/` | @MOSAIC |

---

## DEFINITION OF DONE S05

- [ ] 6 composants implémentés, typés, testés
- [ ] Chaque composant a 3+ stories Storybook
- [ ] WCAG 2.1 AA vérifié (contrast, labels, keyboard)
- [ ] Responsive testé (mobile, tablet, desktop)
- [ ] AppRenderer assemble correctement les 6 composants
- [ ] Data bindings résolus avec agrégations
- [ ] Snapshot tests pour chaque archétype
- [ ] Performance : 20 composants < 100ms
- [ ] CI passe en vert

---

## HANDOFF → S06

```
## HANDOFF: @PRISM + @MOSAIC → @CONDUIT + @CORTEX
**Sprint**: S06
**Statut**: READY
**Livrables prêts**:
  - 6 composants production-ready
  - AppRenderer fonctionnel
  - Data bindings avec agrégations
**Prochaine étape**: @CONDUIT implémente le sync Excel read-only via Graph API
**Note**: Les composants peuvent afficher les données Excel dès que @CONDUIT livre le sync
```

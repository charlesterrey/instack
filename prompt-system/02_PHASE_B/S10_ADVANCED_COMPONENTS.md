# S10 — 6 COMPOSANTS AVANCÉS — Charts, Kanban, Gallery

> **Sprint**: 10 | **Semaines**: W19-W20
> **Leads**: @PRISM (Frontend) + @MOSAIC (Design System)
> **Support**: @SPECTRUM (UX) + @NEURON (pipeline update pour nouveaux composants)
> **Phase**: B — "Convertir et Gouverner"

---

## OBJECTIF

Implémenter les 6 composants restants : PieChart, LineChart, KanbanBoard, DetailView, ImageGallery, PageNav. Mettre à jour le pipeline IA pour générer des apps utilisant ces nouveaux composants. Passer de 6 à 12 composants atomiques complète l'arsenal pour couvrir 95% des cas d'usage.

---

## DÉPENDANCES

| Direction | Tâche | Agent |
|-----------|-------|-------|
| **Bloqué par** | S05 (Pattern établi pour les 6 premiers composants) | @PRISM |
| **Bloqué par** | S09 (Write-back — KanbanBoard l'utilise) | @CONDUIT |
| **Bloque** | S11 (App Store — plus de variété d'apps) | @PULSE |
| **Bloque** | S15 (Polish — tous les composants doivent exister) | @PRISM |

---

## TÂCHES DÉTAILLÉES

### TÂCHE 10.1 — PieChart
**Assigné à**: @PRISM
**Complexité**: M

```
CHECKLIST :
□ Implémenter packages/ui/src/components/PieChart/PieChart.tsx :
    - Recharts <PieChart> + <Pie> avec tokens instack
    - Mode donut (innerRadius > 0)
    - Labels : valeur + pourcentage
    - Légende interactive (clic → highlight)
    - Tooltip au hover
    - Animation d'entrée (draw)
    - Couleurs : palette instack (max 8 segments, "Autre" pour le reste)
    - Responsive : légende en bas sur mobile
□ Tests + Storybook (pie, donut, avec/sans labels, responsive)
```

### TÂCHE 10.2 — LineChart
**Assigné à**: @PRISM
**Complexité**: M

```
CHECKLIST :
□ Implémenter packages/ui/src/components/LineChart/LineChart.tsx :
    - Recharts <LineChart> + <Line> avec tokens instack
    - Area mode (remplissage sous la courbe)
    - Multi-séries (plusieurs lignes, couleurs différentes)
    - Dots au hover (pas par défaut — trop dense)
    - Grille optionnelle
    - Axes avec formatage intelligent (dates, nombres)
    - Responsive : rotation labels X-axis sur mobile
□ Tests + Storybook (line, area, multi-series, temporal)
```

### TÂCHE 10.3 — KanbanBoard (le plus complexe de S10)
**Assigné à**: @PRISM
**Complexité**: XL

```
CHECKLIST :
□ Implémenter packages/ui/src/components/KanbanBoard/KanbanBoard.tsx :
    - Colonnes configurables (titre, couleur, limite WIP)
    - Cards : titre, description, assignee avatar, labels, due date
    - Drag & drop entre colonnes (utiliser @dnd-kit/core)
    - onCardMove callback → déclenche write-back pour mettre à jour le statut
    - Ajout de card (bouton + en bas de colonne)
    - Compteur cards par colonne
    - WIP limit : colonne rouge si dépassée
    - Responsive : scroll horizontal, 1 colonne visible sur mobile
    - Performance : virtualisation si > 50 cards
□ Intégration data binding :
    - La colonne "statut" du schema détermine les colonnes du kanban
    - Les valeurs uniques de la colonne statut = les colonnes
    - Le drag & drop modifie la valeur de statut via write-back
□ Tests : render, drag-drop (simulé), WIP limit, add card
□ Storybook : 3 colonnes, 5 colonnes, avec assignees, responsive
```

### TÂCHE 10.4 — DetailView
**Assigné à**: @PRISM
**Complexité**: M

```
CHECKLIST :
□ Implémenter packages/ui/src/components/DetailView/DetailView.tsx :
    - Vue détaillée d'un enregistrement (clic sur une ligne de DataTable)
    - Sections avec paires label/valeur
    - Types de valeurs : text, badge, link, date, image
    - Actions en haut à droite (Edit, Delete, Share)
    - Breadcrumb : Back link
    - Responsive : stack sur mobile
□ Intégration : DataTable onRowClick → ouvre DetailView en slide-over ou page
□ Tests + Storybook
```

### TÂCHE 10.5 — ImageGallery
**Assigné à**: @PRISM
**Complexité**: L

```
CHECKLIST :
□ Implémenter packages/ui/src/components/ImageGallery/ImageGallery.tsx :
    - 3 layouts : grid (défaut), masonry, carousel
    - Lightbox au clic (overlay plein écran)
    - Navigation clavier dans le lightbox (←→, Escape)
    - Captions sous les images
    - Lazy loading des images (Intersection Observer)
    - Placeholder blur pendant le chargement
    - Responsive : 1 col mobile, 2 tablet, 3-4 desktop
□ Intégration : les images viennent de SharePoint/OneDrive via Graph API
□ Tests + Storybook (grid, masonry, carousel, lightbox)
```

### TÂCHE 10.6 — PageNav
**Assigné à**: @PRISM
**Complexité**: M

```
CHECKLIST :
□ Implémenter packages/ui/src/components/PageNav/PageNav.tsx :
    - 3 variants : tabs (haut), sidebar (gauche), breadcrumb
    - Tabs : Untitled UI <Tabs> component
    - Sidebar : navigation verticale avec icônes, collapsible
    - Breadcrumb : fil d'Ariane
    - Badge optionnel par page (nombre de notifications/items)
    - Active state clair (couleur primary)
    - Responsive : tabs → dropdown sur mobile, sidebar → drawer
□ Intégration : permet les apps multi_view (plusieurs pages dans une app)
□ Tests + Storybook (tabs, sidebar, breadcrumb, responsive)
```

### TÂCHE 10.7 — Mise à jour Pipeline IA (12 composants)
**Assigné à**: @NEURON
**Complexité**: L
**Dépendance**: 10.1-10.6

```
CHECKLIST :
□ Mettre à jour le prompt de Stage 3 (generate.prompt.ts) :
    - Ajouter les 6 nouveaux composants dans la liste autorisée
    - Mettre à jour les mappings archetype → layout :
      * tracker → [KanbanBoard, FilterBar, Container] (plus DataTable en fallback)
      * gallery → [ImageGallery, FilterBar, Container]
      * multi_view → [PageNav, DataTable, FormField, KPICard, BarChart, LineChart, Container]
      * dashboard → [KPICard, BarChart, PieChart, LineChart, FilterBar, Container]
      * report → [DataTable, BarChart, PieChart, LineChart, FilterBar, Container]
□ Mettre à jour le JSON schema tool_use :
    - Ajouter les 6 nouveaux types dans l'enum component_type
    - Ajouter les props spécifiques de chaque nouveau composant
□ Mettre à jour Stage 4 (validation) :
    - Valider les props des nouveaux composants
    - Layout rules pour KanbanBoard (full width obligatoire)
□ Mettre à jour AppRenderer :
    - Ajouter les 6 nouveaux composants dans COMPONENT_MAP
□ Re-exécuter les quality gates avec les 12 composants
□ Quality gate : > 88% succès (objectif augmenté)
```

---

## DEFINITION OF DONE S10

- [ ] 12 composants atomiques complets et testés
- [ ] KanbanBoard avec drag & drop fonctionnel
- [ ] ImageGallery avec lightbox
- [ ] PageNav avec 3 variants
- [ ] Pipeline mis à jour pour utiliser les 12 composants
- [ ] Quality gates > 88% succès
- [ ] Storybook à jour avec tous les composants
- [ ] CI passe en vert

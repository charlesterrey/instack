# 02 — DESIGN SYSTEM — Untitled UI React (Copy-Paste) + Tailwind CSS v4

> **Owner**: @MOSAIC (Design System Architect) + @SPECTRUM (UX/UI Lead)
> **Reference**: https://www.untitledui.com/react/docs/introduction
> **GitHub**: https://github.com/untitleduico/react
> **Stack**: React 19 + Tailwind CSS v4 + React Aria + TypeScript
> **Inspirations**: Linear, Stripe, Notion

---

## DIRECTIVE

Tout composant UI d'instack est construit sur **Untitled UI React** — une bibliothèque **copy-paste** (comme shadcn/ui). Les composants sont copiés dans le projet source, PAS installés comme un package npm. On utilise le design system tel quel ("déjà tout formaté"), on ne réinvente pas les tokens. Chaque composant instack est un wrapper typé autour des primitives Untitled UI copiées localement.

**Règles fondamentales** :
1. **JAMAIS** `import from '@untitledui/react'` — les composants sont locaux
2. **TOUJOURS** utiliser les tokens Untitled UI via Tailwind CSS v4 `@theme`
3. **JAMAIS** de CSS custom properties `--ink-*` — utiliser les classes Tailwind
4. **TOUJOURS** consulter le repo GitHub avant de créer un composant custom

---

## INSTALLATION & SETUP

### Étape 1 — Initialisation du projet (une seule fois)

```bash
# Dans packages/web/ (le frontend React)
npx untitledui@latest init --vite
```

Cela génère automatiquement :
- `theme.css` — Tous les design tokens (couleurs, typo, spacing, shadows...)
- `globals.css` — Imports Tailwind + plugins
- `lib/utils.ts` — Fonction utilitaire `cx` pour le class merging
- Configuration Tailwind CSS v4 adaptée

### Étape 2 — Dépendances npm (automatiques ou manuelles)

```bash
# Dépendances requises (installées par init, vérifier)
npm install @untitledui/icons          # Icônes officielles
npm install react-aria-components      # Primitives accessibles (React Aria v1.16+)
npm install tailwindcss-react-aria-components  # Plugin Tailwind pour React Aria states
npm install tailwind-merge             # Merge intelligent de classes Tailwind
npm install tailwindcss-animate        # Animations Tailwind
```

### Étape 3 — Ajouter des composants (copy-paste via CLI)

```bash
# Ajouter un composant spécifique — copié dans le projet
npx untitledui@latest add button
npx untitledui@latest add input
npx untitledui@latest add select
npx untitledui@latest add checkbox
npx untitledui@latest add table
npx untitledui@latest add badge
npx untitledui@latest add card
npx untitledui@latest add avatar
npx untitledui@latest add date-picker
npx untitledui@latest add textarea
npx untitledui@latest add progress-bar
npx untitledui@latest add toggle
npx untitledui@latest add tooltip
npx untitledui@latest add modal
npx untitledui@latest add dropdown-menu
npx untitledui@latest add tabs
```

Les composants sont copiés dans `src/components/` (configurable). Ils deviennent du code source local, modifiable.

### Import pattern (CORRECT)

```tsx
// ✅ CORRECT — Import depuis les composants locaux copiés par la CLI
import { Button } from '@/components/buttons';
import { Input } from '@/components/input';
import { Badge } from '@/components/badge';
import { Table } from '@/components/table';
import { Card } from '@/components/card';

// ✅ CORRECT — Icônes depuis le package npm
import { ArrowUpRight, ChartBar, Filter } from '@untitledui/icons';

// ✅ CORRECT — Utilitaire cx pour le class merging
import { cx } from '@/lib/utils';

// ❌ INTERDIT — PAS un package npm
// import { Button } from '@untitledui/react';  ← N'EXISTE PAS

// Nos wrappers instack (composants métier au-dessus des primitives)
import { DataTable, KPICard, FormField } from '@instack/ui';
```

**Documentation** : https://www.untitledui.com/react/docs/introduction
**Source** : https://github.com/untitleduico/react
- Consulter les composants disponibles avant de créer un custom
- Utiliser les variants existants avant d'en créer de nouveaux
- Respecter les props API de Untitled UI
- Consulter le repo GitHub pour les exemples et issues connues

---

## DESIGN TOKENS — Tailwind CSS v4 `@theme`

Untitled UI fournit un fichier `theme.css` complet qui utilise la directive `@theme` de Tailwind CSS v4. **On utilise ce fichier tel quel.** Pas de custom properties `--ink-*`, pas de tokens maison.

### globals.css (point d'entrée CSS)

```css
@import "tailwindcss";
@import "./theme.css";

@plugin "tailwindcss-animate";
@plugin "tailwindcss-react-aria-components";

@custom-variant dark (&:where(.dark-mode, .dark-mode *));
```

### theme.css (extrait — tokens Untitled UI)

Le fichier complet est généré par `npx untitledui@latest init`. Voici la structure :

```css
@theme {
  /* ========================================
     COULEURS — Brand (configurable pour instack)
     ======================================== */
  --color-brand-25: #F5F8FF;
  --color-brand-50: #EFF4FF;
  --color-brand-100: #D1E0FF;
  --color-brand-200: #B2CCFF;
  --color-brand-300: #84ADFF;
  --color-brand-400: #528BFF;
  --color-brand-500: #2970FF;    /* PRIMARY instack */
  --color-brand-600: #155EEF;
  --color-brand-700: #004EEB;
  --color-brand-800: #0040C1;
  --color-brand-900: #00359E;
  --color-brand-950: #002266;

  /* Gray scale */
  --color-gray-25: #FCFCFD;
  --color-gray-50: #F9FAFB;
  --color-gray-100: #F2F4F7;
  --color-gray-200: #EAECF0;
  --color-gray-300: #D0D5DD;
  --color-gray-400: #98A2B3;
  --color-gray-500: #667085;
  --color-gray-600: #475467;
  --color-gray-700: #344054;
  --color-gray-800: #182230;
  --color-gray-900: #101828;
  --color-gray-950: #0C111D;

  /* Utility colors — Success */
  --color-success-25: #F6FEF9;
  --color-success-50: #ECFDF3;
  --color-success-100: #DCFAE6;
  --color-success-300: #75E0A7;
  --color-success-500: #17B26A;
  --color-success-600: #079455;
  --color-success-700: #067647;

  /* Utility colors — Warning */
  --color-warning-25: #FFFCF5;
  --color-warning-50: #FFFAEB;
  --color-warning-300: #FEC84B;
  --color-warning-500: #F79009;
  --color-warning-600: #DC6803;
  --color-warning-700: #B54708;

  /* Utility colors — Error */
  --color-error-25: #FFFBFA;
  --color-error-50: #FEF3F2;
  --color-error-300: #FDA29B;
  --color-error-500: #F04438;
  --color-error-600: #D92D20;
  --color-error-700: #B42318;

  /* ========================================
     SEMANTIC TOKENS — Utilisés dans les composants
     ======================================== */
  /* Text */
  --color-text-primary: var(--color-gray-900);
  --color-text-secondary: var(--color-gray-700);
  --color-text-tertiary: var(--color-gray-600);
  --color-text-quaternary: var(--color-gray-500);
  --color-text-placeholder: var(--color-gray-500);
  --color-text-disabled: var(--color-gray-400);
  --color-text-brand-primary: var(--color-brand-500);
  --color-text-error-primary: var(--color-error-600);
  --color-text-success-primary: var(--color-success-600);
  --color-text-warning-primary: var(--color-warning-600);

  /* Background */
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: var(--color-gray-50);
  --color-bg-tertiary: var(--color-gray-100);
  --color-bg-disabled: var(--color-gray-100);
  --color-bg-brand-primary: var(--color-brand-500);
  --color-bg-brand-secondary: var(--color-brand-50);
  --color-bg-error-primary: var(--color-error-500);
  --color-bg-error-secondary: var(--color-error-50);
  --color-bg-success-primary: var(--color-success-500);
  --color-bg-success-secondary: var(--color-success-50);
  --color-bg-warning-primary: var(--color-warning-500);
  --color-bg-warning-secondary: var(--color-warning-50);

  /* Border */
  --color-border-primary: var(--color-gray-300);
  --color-border-secondary: var(--color-gray-200);
  --color-border-brand: var(--color-brand-300);
  --color-border-error: var(--color-error-300);

  /* Foreground (icons) */
  --color-fg-brand-primary: var(--color-brand-500);
  --color-fg-error-primary: var(--color-error-500);
  --color-fg-success-primary: var(--color-success-500);
  --color-fg-warning-primary: var(--color-warning-500);

  /* ========================================
     TYPOGRAPHIE — Inter
     ======================================== */
  --font-family-display: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-family-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

  /* Display sizes */
  --font-size-display-2xl: 4.5rem;     /* 72px */
  --font-size-display-xl: 3.75rem;     /* 60px */
  --font-size-display-lg: 3rem;        /* 48px */
  --font-size-display-md: 2.25rem;     /* 36px */
  --font-size-display-sm: 1.875rem;    /* 30px */
  --font-size-display-xs: 1.5rem;      /* 24px */

  /* Text sizes */
  --font-size-text-xl: 1.25rem;        /* 20px */
  --font-size-text-lg: 1.125rem;       /* 18px */
  --font-size-text-md: 1rem;           /* 16px — Base */
  --font-size-text-sm: 0.875rem;       /* 14px */
  --font-size-text-xs: 0.75rem;        /* 12px */

  /* ========================================
     SHADOWS / ELEVATION
     ======================================== */
  --shadow-xs: 0px 1px 2px rgba(16, 24, 40, 0.05);
  --shadow-sm: 0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06);
  --shadow-md: 0px 4px 8px -2px rgba(16, 24, 40, 0.1), 0px 2px 4px -2px rgba(16, 24, 40, 0.06);
  --shadow-lg: 0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03);
  --shadow-xl: 0px 20px 24px -4px rgba(16, 24, 40, 0.08), 0px 8px 8px -4px rgba(16, 24, 40, 0.03);
  --shadow-2xl: 0px 24px 48px -12px rgba(16, 24, 40, 0.18);

  /* ========================================
     BORDER RADIUS
     ======================================== */
  --radius-none: 0;
  --radius-xxs: 2px;
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 10px;
  --radius-xl: 12px;
  --radius-2xl: 16px;
  --radius-3xl: 20px;
  --radius-4xl: 24px;
  --radius-full: 9999px;

  /* ========================================
     SPACING — 4px Grid (via Tailwind classes)
     ======================================== */
  --spacing-0: 0;
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-5: 1.25rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  --spacing-10: 2.5rem;
  --spacing-12: 3rem;
  --spacing-16: 4rem;
  --spacing-20: 5rem;
  --spacing-24: 6rem;
}
```

### Dark Mode

Le dark mode utilise la classe `.dark-mode` (pas `.dark`). Les tokens sémantiques sont inversés automatiquement :

```css
@custom-variant dark (&:where(.dark-mode, .dark-mode *));
```

Les composants Untitled UI gèrent le dark mode nativement via les tokens sémantiques (text-primary, bg-primary, etc. sont mappés différemment en dark mode).

**Règle** : JAMAIS de couleurs hardcodées dans les composants. Toujours utiliser les classes Tailwind qui référencent les tokens du theme.

### Utilisation des tokens en Tailwind

```tsx
// ✅ CORRECT — Classes Tailwind utilisant les tokens du theme
<div className="bg-bg-primary text-text-primary shadow-md rounded-xl p-4">
  <h2 className="text-display-xs font-semibold text-text-primary">Titre</h2>
  <p className="text-text-sm text-text-secondary">Description</p>
  <Button className="bg-brand-500 hover:bg-brand-600 text-white rounded-lg">
    Action
  </Button>
</div>

// ❌ INTERDIT — CSS custom properties maison
// style={{ color: 'var(--ink-primary-500)' }}
// style={{ backgroundColor: '#2970FF' }}
```

### Utilitaire `cx` (class merging)

```typescript
// lib/utils.ts — Généré par npx untitledui@latest init
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({
  // Configuration étendue pour les tokens Untitled UI
});

export function cx(...inputs: (string | undefined | null | false)[]) {
  return twMerge(inputs.filter(Boolean).join(' '));
}
```

Usage :
```tsx
import { cx } from '@/lib/utils';

<div className={cx(
  'rounded-xl border border-border-primary',
  isActive && 'border-brand-500 shadow-md',
  isDisabled && 'opacity-50 cursor-not-allowed'
)} />
```

---

## ICONOGRAPHIE — @untitledui/icons

```bash
npm install @untitledui/icons
```

```tsx
import { ArrowUpRight, BarChart03, Filter, Search, Plus, X } from '@untitledui/icons';

// Taille standard : 20px (sm), 24px (md), 32px (lg)
<ArrowUpRight className="w-5 h-5" />           // 20px
<BarChart03 className="w-6 h-6" />             // 24px
<Filter className="w-8 h-8" />                 // 32px

// Couleur : currentColor (hérite du texte parent)
<span className="text-fg-brand-primary">
  <ArrowUpRight className="w-5 h-5" />
</span>
```

---

## 12 COMPOSANTS ATOMIQUES — Spécifications

> **Architecture** : Les composants Untitled UI (copiés localement) sont les **primitives**.
> Les 12 composants ci-dessous sont des **wrappers métier instack** qui composent ces primitives
> pour les besoins spécifiques du pipeline IA et de l'AppRenderer.
> 
> Emplacement : `packages/ui/src/components/`
> Les primitives Untitled UI : `packages/web/src/components/` (copiées par CLI)

### Phase A (S05) — 6 Composants

#### 1. FormField
```typescript
// @instack/ui/components/FormField/FormField.tsx
// Compose: Input, Select, Checkbox, Textarea (copiés depuis Untitled UI)
interface FormFieldProps {
  id: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea' | 'email' | 'phone';
  label: string;
  placeholder?: string;
  required?: boolean;
  validation?: ValidationRule[];
  options?: SelectOption[];        // Pour type 'select'
  defaultValue?: unknown;
  disabled?: boolean;
  helpText?: string;
  errorMessage?: string;
  onChange: (value: unknown) => void;
}
```

#### 2. DataTable
```typescript
// @instack/ui/components/DataTable/DataTable.tsx
// Compose: Table (copié depuis Untitled UI) + tri/pagination custom
interface DataTableProps {
  id: string;
  columns: ColumnDef[];
  data: Record<string, unknown>[];
  sortable?: boolean;
  filterable?: boolean;
  pagination?: { pageSize: number; totalItems: number };
  selectable?: boolean;
  onRowClick?: (row: Record<string, unknown>) => void;
  emptyState?: React.ReactNode;
  loading?: boolean;
}

interface ColumnDef {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'badge' | 'avatar' | 'actions';
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}
```

#### 3. KPICard
```typescript
// @instack/ui/components/KPICard/KPICard.tsx
// Compose: Card (copié depuis Untitled UI) + metric display custom
interface KPICardProps {
  id: string;
  title: string;
  value: string | number;
  previousValue?: string | number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  changePercent?: number;
  icon?: React.ReactNode;
  description?: string;
  trend?: { data: number[]; color?: string };
  size?: 'sm' | 'md' | 'lg';
}
```

#### 4. BarChart
```typescript
// @instack/ui/components/BarChart/BarChart.tsx
// Uses: Recharts (bundled) + tokens Untitled UI via classes Tailwind
interface BarChartProps {
  id: string;
  data: ChartDataPoint[];
  xKey: string;
  yKeys: string[];
  colors?: string[];
  stacked?: boolean;
  horizontal?: boolean;
  showLegend?: boolean;
  showGrid?: boolean;
  height?: number;
  title?: string;
  loading?: boolean;
}

interface ChartDataPoint {
  [key: string]: string | number;
}
```

#### 5. FilterBar
```typescript
// @instack/ui/components/FilterBar/FilterBar.tsx
// Compose: Select, Input, DatePicker (copiés depuis Untitled UI) en barre horizontale
interface FilterBarProps {
  id: string;
  filters: FilterDef[];
  values: Record<string, unknown>;
  onChange: (filterKey: string, value: unknown) => void;
  onReset?: () => void;
  layout?: 'horizontal' | 'vertical';
}

interface FilterDef {
  key: string;
  label: string;
  type: 'select' | 'search' | 'date_range' | 'toggle' | 'multi_select';
  options?: SelectOption[];
  placeholder?: string;
}
```

#### 6. Container
```typescript
// @instack/ui/components/Container/Container.tsx
// Layout primitive — wraps children with spacing/grid (Tailwind classes)
interface ContainerProps {
  id: string;
  layout: 'stack' | 'grid' | 'columns' | 'sidebar' | 'centered';
  gap?: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12';
  columns?: number;                // Pour layout 'grid' ou 'columns'
  padding?: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12';
  background?: 'primary' | 'secondary' | 'tertiary' | 'transparent';
  border?: boolean;
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  children: React.ReactNode;
}
```

### Phase B (S10) — 6 Composants Avancés

#### 7. PieChart
```typescript
interface PieChartProps {
  id: string;
  data: { name: string; value: number; color?: string }[];
  donut?: boolean;
  showLabels?: boolean;
  showLegend?: boolean;
  height?: number;
  title?: string;
}
```

#### 8. LineChart
```typescript
interface LineChartProps {
  id: string;
  data: ChartDataPoint[];
  xKey: string;
  yKeys: string[];
  colors?: string[];
  area?: boolean;
  showDots?: boolean;
  showGrid?: boolean;
  height?: number;
  title?: string;
}
```

#### 9. KanbanBoard
```typescript
interface KanbanBoardProps {
  id: string;
  columns: KanbanColumn[];
  onCardMove: (cardId: string, fromCol: string, toCol: string) => void;
  onCardClick?: (card: KanbanCard) => void;
  allowAddCard?: boolean;
  onAddCard?: (columnId: string) => void;
}

interface KanbanColumn {
  id: string;
  title: string;
  color?: string;
  cards: KanbanCard[];
  limit?: number;
}

interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  assignee?: { name: string; avatar?: string };
  labels?: { text: string; color: string }[];
  dueDate?: string;
}
```

#### 10. DetailView
```typescript
interface DetailViewProps {
  id: string;
  title: string;
  subtitle?: string;
  sections: DetailSection[];
  actions?: ActionButton[];
  backLink?: { label: string; href: string };
}

interface DetailSection {
  title: string;
  fields: { label: string; value: React.ReactNode; type?: 'text' | 'badge' | 'link' | 'date' }[];
}
```

#### 11. ImageGallery
```typescript
interface ImageGalleryProps {
  id: string;
  images: GalleryImage[];
  layout: 'grid' | 'masonry' | 'carousel';
  columns?: number;
  lightbox?: boolean;
  onImageClick?: (image: GalleryImage) => void;
}

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  thumbnail?: string;
}
```

#### 12. PageNav
```typescript
interface PageNavProps {
  id: string;
  pages: NavPage[];
  activePage: string;
  onChange: (pageId: string) => void;
  variant?: 'tabs' | 'sidebar' | 'breadcrumb';
}

interface NavPage {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}
```

---

## AppRenderer — Le moteur de rendu

```typescript
// src/packages/web/components/AppRenderer/AppRenderer.tsx
// Transforme le JSON généré par le pipeline IA en arbre React

interface AppSchema {
  id: string;
  name: string;
  archetype: AppArchetype;
  layout: LayoutConfig;
  components: ComponentInstance[];
  dataBindings: DataBinding[];
  theme?: Partial<ThemeOverride>;
}

interface ComponentInstance {
  id: string;
  type: ComponentType;          // Les 12 types atomiques
  props: Record<string, unknown>;
  position: { row: number; col: number; span?: number };
  dataBinding?: string;         // Référence à une DataBinding
}

// Le renderer est DÉTERMINISTE — même JSON = même UI, toujours
function AppRenderer({ schema, data }: { schema: AppSchema; data: AppData }) {
  // 1. Valider le schema (Zod)
  // 2. Résoudre les data bindings
  // 3. Construire l'arbre de composants
  // 4. Rendre avec les classes Tailwind du design system
}
```

---

## CONVENTIONS UI

### Responsive Breakpoints
- **Mobile first** : styles de base = mobile
- `sm` (640px) : téléphone paysage
- `md` (768px) : tablette
- `lg` (1024px) : desktop
- `xl` (1280px) : desktop large

### Accessibility (WCAG 2.1 AA)
- React Aria fournit l'accessibilité par défaut sur tous les composants Untitled UI
- Contraste minimum : 4.5:1 pour texte normal, 3:1 pour texte large
- Focus visible sur tous les éléments interactifs (géré par React Aria)
- Labels sur tous les inputs
- Aria-labels sur les icônes-boutons
- Navigation clavier complète (Tab, Enter, Escape, Arrow keys)
- Skip links sur les pages longues

### Dark Mode
- Activé via la classe `.dark-mode` sur le `<html>` ou `<body>`
- Les tokens sémantiques Untitled UI s'inversent automatiquement
- JAMAIS de couleurs hardcodées — toujours les classes Tailwind
- Tester chaque composant en light ET dark
- Contrast ratio vérifié dans les deux modes

### Animation
- Durée max : 300ms pour les transitions UI
- `prefers-reduced-motion: reduce` respecté
- Pas d'animation bloquante (pas de loading spinner full-page sans contenu)
- Utiliser `transform` et `opacity` uniquement (compositing layer)
- Plugin `tailwindcss-animate` pour les animations déclaratives

### Classe utilitaire `cx`
- TOUJOURS utiliser `cx()` pour combiner les classes (pas de template literals)
- `cx` gère le merge intelligent (la dernière classe gagne en cas de conflit)
- Importer depuis `@/lib/utils`

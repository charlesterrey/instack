import type { ComponentType } from '../types/app.types';

export const COMPONENT_TYPES = [
  'form_field',
  'data_table',
  'kpi_card',
  'bar_chart',
  'pie_chart',
  'line_chart',
  'kanban_board',
  'detail_view',
  'image_gallery',
  'filter_bar',
  'container',
  'page_nav',
] as const satisfies readonly ComponentType[];

export const COMPONENT_LABELS: Record<ComponentType, string> = {
  form_field: 'Champ de formulaire',
  data_table: 'Tableau de donnees',
  kpi_card: 'Carte KPI',
  bar_chart: 'Graphique barres',
  pie_chart: 'Graphique camembert',
  line_chart: 'Graphique ligne',
  kanban_board: 'Tableau Kanban',
  detail_view: 'Vue detail',
  image_gallery: 'Galerie images',
  filter_bar: 'Barre de filtres',
  container: 'Conteneur',
  page_nav: 'Navigation pages',
};

/** Phase A components (S05) */
export const PHASE_A_COMPONENTS: readonly ComponentType[] = [
  'form_field',
  'data_table',
  'kpi_card',
  'bar_chart',
  'filter_bar',
  'container',
];

/** Phase B components (S10) */
export const PHASE_B_COMPONENTS: readonly ComponentType[] = [
  'pie_chart',
  'line_chart',
  'kanban_board',
  'detail_view',
  'image_gallery',
  'page_nav',
];

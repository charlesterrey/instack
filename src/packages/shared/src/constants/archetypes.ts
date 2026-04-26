import type { AppArchetype } from '../types/app.types';

export const APP_ARCHETYPES = [
  'crud_form',
  'dashboard',
  'tracker',
  'report',
  'approval',
  'checklist',
  'gallery',
  'multi_view',
] as const satisfies readonly AppArchetype[];

export const ARCHETYPE_LABELS: Record<AppArchetype, string> = {
  crud_form: 'Formulaire CRUD',
  dashboard: 'Tableau de bord',
  tracker: 'Suivi',
  report: 'Rapport',
  approval: 'Approbation',
  checklist: 'Checklist',
  gallery: 'Galerie',
  multi_view: 'Multi-vues',
};

/**
 * Quality Gates — Pipeline reliability test suite.
 * @NEURON owns this file.
 *
 * Tests 20 realistic prompts against 5 demo datasets = 100 combinations.
 * Validates: pipeline success, valid JSON, renderable components, latency <5s.
 * Target: >85% success rate.
 *
 * IMPORTANT: These tests call the real Claude API and are SKIPPED by default.
 * Run with ANTHROPIC_API_KEY env var to execute:
 *   ANTHROPIC_API_KEY=sk-... npx vitest run tests/quality-gates.test.ts
 */

import { describe, it, expect } from 'vitest';

// Quality gates are skipped unless ANTHROPIC_API_KEY is set (expensive: 100 API calls)
const API_KEY = process.env['ANTHROPIC_API_KEY'];
const shouldRun = Boolean(API_KEY);

const TEST_PROMPTS: readonly string[] = [
  'Je veux suivre mes interventions terrain avec statut et priorite',
  'Creer un dashboard pour mes projets en cours',
  'Formulaire de visite client avec suivi commercial',
  'Application de suivi budgetaire par departement',
  'Audit de conformite magasins avec checklist',
  'Tableau de bord des ventes par region',
  'Suivi des reclamations clients',
  'Gestion des conges et absences equipe',
  'Dashboard KPI performance commerciale',
  'Formulaire de saisie des incidents terrain',
  'Rapport mensuel des depenses par categorie',
  'Suivi avancement des taches projet',
  'Liste de controle maintenance equipements',
  'Galerie photos des interventions',
  'Tableau de bord RH effectifs',
  'Suivi des commandes fournisseurs',
  'Application inventaire stock',
  'Formulaire demande achat',
  'Dashboard satisfaction client NPS',
  'Suivi des formations equipe',
];

const DEMO_DATASETS = [
  {
    id: 'interventions',
    headers: ['Technicien', 'Site', 'Date', 'Statut', 'Priorite', 'Duree_h', 'Type', 'Cout_EUR', 'Region'],
    sampleRow: { Technicien: 'Martin Dupont', Site: 'Lyon Centre', Date: '2024-03-15', Statut: 'Termine', Priorite: 'Haute', Duree_h: 2.5, Type: 'Reparation', Cout_EUR: 350, Region: 'Rhone-Alpes' },
  },
  {
    id: 'projets',
    headers: ['Projet', 'Responsable', 'Budget_EUR', 'Avancement_pct', 'Echeance', 'Departement', 'Statut'],
    sampleRow: { Projet: 'Optimisation ligne A', Responsable: 'Sophie Martin', Budget_EUR: 45000, Avancement_pct: 72, Echeance: '2024-06-30', Departement: 'Production', Statut: 'En cours' },
  },
  {
    id: 'visites',
    headers: ['Client', 'Date', 'Contact', 'Produits', 'Montant_EUR', 'Suite', 'Resultat', 'Commercial'],
    sampleRow: { Client: 'Galeries Mode', Date: '2024-03-20', Contact: 'Marie Leroy', Produits: 'Collection Ete', Montant_EUR: 12000, Suite: 'Devis envoye', Resultat: 'Positif', Commercial: 'Clara Rousseau' },
  },
  {
    id: 'audits',
    headers: ['Magasin', 'Date_audit', 'Proprete', 'Signaletique', 'Stock', 'Securite', 'Conformite', 'Score'],
    sampleRow: { Magasin: 'Paris Rivoli', Date_audit: '2024-03-10', Proprete: 'oui', Signaletique: 'oui', Stock: 'non', Securite: 'oui', Conformite: 'non', Score: 75 },
  },
  {
    id: 'budgets',
    headers: ['Departement', 'Budget_EUR', 'Depenses_EUR', 'Reste_EUR', 'Trimestre', 'Responsable'],
    sampleRow: { Departement: 'Marketing', Budget_EUR: 120000, Depenses_EUR: 95000, Reste_EUR: 25000, Trimestre: 'T1', Responsable: 'Vincent Durand' },
  },
];

const VALID_COMPONENT_TYPES = [
  'form_field', 'data_table', 'kpi_card', 'bar_chart', 'pie_chart',
  'line_chart', 'kanban_board', 'detail_view', 'image_gallery',
  'filter_bar', 'container', 'page_nav',
];

// Skip the entire suite if no API key
const describeFn = shouldRun ? describe : describe.skip;

describeFn('Quality Gates: Pipeline x Demo Data', () => {
  let successCount = 0;
  let totalCount = 0;

  for (const dataset of DEMO_DATASETS) {
    describe(`Dataset: ${dataset.id}`, () => {
      for (const prompt of TEST_PROMPTS) {
        const shortPrompt = prompt.slice(0, 40);

        it(`"${shortPrompt}..." → valid app`, async () => {
          totalCount++;
          const { executePipeline } = await import('../src/pipeline');

          const rows = Array.from({ length: 10 }, () => ({ ...dataset.sampleRow }));
          const excelData = {
            sheetName: 'Sheet1',
            headers: dataset.headers,
            rows,
            totalRows: rows.length,
          };

          const start = Date.now();
          const result = await executePipeline(
            { userPrompt: prompt, tenantId: 'test-qg', userId: 'test-qg', excelData },
            { anthropicApiKey: API_KEY as string },
          );
          const latencyMs = Date.now() - start;

          // Gate 1: No pipeline error
          expect(result.ok).toBe(true);
          if (!result.ok) return;

          // Gate 2: Valid app schema structure
          const schema = result.value.appSchema;
          expect(schema.name).toBeTruthy();
          expect(schema.archetype).toBeTruthy();
          expect(schema.components.length).toBeGreaterThan(0);
          expect(schema.components.length).toBeLessThanOrEqual(20);

          // Gate 3: All components are renderable types
          for (const comp of schema.components) {
            expect(VALID_COMPONENT_TYPES).toContain(comp.type);
            expect(comp.id).toBeTruthy();
            expect(comp.position).toBeDefined();
          }

          // Gate 4: Latency under 5 seconds
          expect(latencyMs).toBeLessThan(5000);

          // Gate 5: Metadata is complete
          expect(result.value.metadata.stages.length).toBe(4);
          expect(result.value.metadata.totalCostEur).toBeGreaterThan(0);

          successCount++;
        }, 15000);
      }
    });
  }

  // Summary assertion runs after all tests
  it('achieves >85% success rate across all combinations', () => {
    if (totalCount === 0) return; // skip if nothing ran
    const rate = successCount / totalCount;
    expect(rate).toBeGreaterThanOrEqual(0.85);
  });
});

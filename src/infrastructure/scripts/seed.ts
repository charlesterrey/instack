/**
 * Seed script — creates realistic test data for development
 * Run: npx tsx infrastructure/scripts/seed.ts
 *
 * Creates:
 * - 2 tenants (Leroy Merlin, Bonduelle)
 * - 5 users (1 admin, 2 creators, 2 viewers)
 * - 3 demo apps
 */
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../../packages/api/drizzle/schema';

const DATABASE_URL = process.env['DATABASE_URL'];
if (!DATABASE_URL) {
  // eslint-disable-next-line no-console
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const db = drizzle(sql, { schema });

async function seed(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('Seeding database...');

  // Tenant 1: Leroy Merlin
  const [tenant1] = await db
    .insert(schema.tenants)
    .values({
      name: 'Leroy Merlin France',
      m365TenantId: 'lm-tenant-001',
      plan: 'pro',
      settings: { maxApps: 50, maxUsers: 25, allowPublicApps: true },
    })
    .returning();

  // Tenant 2: Bonduelle
  const [tenant2] = await db
    .insert(schema.tenants)
    .values({
      name: 'Bonduelle Group',
      m365TenantId: 'bonduelle-tenant-002',
      plan: 'enterprise',
      settings: { allowPublicApps: true },
    })
    .returning();

  if (!tenant1 || !tenant2) {
    throw new Error('Failed to create tenants');
  }

  // Users for Tenant 1
  const [adminUser] = await db
    .insert(schema.users)
    .values({
      tenantId: tenant1.id,
      email: 'philippe.garnier@leroymerlin.fr',
      name: 'Philippe Garnier',
      role: 'admin',
      m365UserId: 'lm-user-admin-001',
    })
    .returning();

  const [creator1] = await db
    .insert(schema.users)
    .values({
      tenantId: tenant1.id,
      email: 'sandrine.morel@leroymerlin.fr',
      name: 'Sandrine Morel',
      role: 'creator',
      m365UserId: 'lm-user-creator-001',
    })
    .returning();

  const [viewer1] = await db
    .insert(schema.users)
    .values({
      tenantId: tenant1.id,
      email: 'clara.rousseau@leroymerlin.fr',
      name: 'Clara Rousseau',
      role: 'viewer',
      m365UserId: 'lm-user-viewer-001',
    })
    .returning();

  // Users for Tenant 2
  const [creator2] = await db
    .insert(schema.users)
    .values({
      tenantId: tenant2.id,
      email: 'mehdi.benali@bonduelle.com',
      name: 'Mehdi Benali',
      role: 'creator',
      m365UserId: 'bd-user-creator-001',
    })
    .returning();

  const [viewer2] = await db
    .insert(schema.users)
    .values({
      tenantId: tenant2.id,
      email: 'vincent.durand@bonduelle.com',
      name: 'Vincent Durand',
      role: 'viewer',
      m365UserId: 'bd-user-viewer-001',
    })
    .returning();

  if (!adminUser || !creator1 || !viewer1 || !creator2 || !viewer2) {
    throw new Error('Failed to create users');
  }

  // App 1: Suivi terrain (Leroy Merlin)
  await db.insert(schema.apps).values({
    tenantId: tenant1.id,
    creatorId: creator1.id,
    name: 'Suivi Interventions Terrain',
    description:
      'Application de suivi des interventions terrain pour les equipes maintenance',
    schemaJson: {
      id: 'app-suivi-terrain',
      name: 'Suivi Interventions Terrain',
      archetype: 'tracker',
      layout: { type: 'single_page', columns: 2 },
      components: [
        {
          id: 'filter-1',
          type: 'filter_bar',
          props: { filters: [] },
          position: { row: 0, col: 0, span: 2 },
        },
        {
          id: 'table-1',
          type: 'data_table',
          props: { columns: [] },
          position: { row: 1, col: 0, span: 2 },
        },
      ],
      dataBindings: [],
    },
    archetype: 'tracker',
    status: 'active',
    visibility: 'team',
  });

  // App 2: Dashboard Ventes (Leroy Merlin)
  await db.insert(schema.apps).values({
    tenantId: tenant1.id,
    creatorId: adminUser.id,
    name: 'Dashboard Ventes Hebdomadaire',
    description: 'Tableau de bord des ventes par rayon et par magasin',
    schemaJson: {
      id: 'app-dashboard-ventes',
      name: 'Dashboard Ventes Hebdomadaire',
      archetype: 'dashboard',
      layout: { type: 'single_page', columns: 3 },
      components: [
        {
          id: 'kpi-ca',
          type: 'kpi_card',
          props: { title: 'CA Semaine' },
          position: { row: 0, col: 0 },
        },
        {
          id: 'kpi-panier',
          type: 'kpi_card',
          props: { title: 'Panier Moyen' },
          position: { row: 0, col: 1 },
        },
        {
          id: 'kpi-visites',
          type: 'kpi_card',
          props: { title: 'Visites' },
          position: { row: 0, col: 2 },
        },
        {
          id: 'chart-ventes',
          type: 'bar_chart',
          props: { title: 'Ventes par Rayon' },
          position: { row: 1, col: 0, span: 3 },
        },
      ],
      dataBindings: [],
    },
    archetype: 'dashboard',
    status: 'active',
    visibility: 'public',
  });

  // App 3: Suivi Projet (Bonduelle)
  await db.insert(schema.apps).values({
    tenantId: tenant2.id,
    creatorId: creator2.id,
    name: 'Suivi Projets R&D',
    description: 'Suivi des projets de recherche et developpement produit',
    schemaJson: {
      id: 'app-projets-rd',
      name: 'Suivi Projets R&D',
      archetype: 'tracker',
      layout: { type: 'single_page', columns: 1 },
      components: [
        {
          id: 'table-projets',
          type: 'data_table',
          props: { columns: [] },
          position: { row: 0, col: 0 },
        },
      ],
      dataBindings: [],
    },
    archetype: 'tracker',
    status: 'draft',
    visibility: 'private',
  });

  // eslint-disable-next-line no-console
  console.log('Seed complete!');
  // eslint-disable-next-line no-console
  console.log(`  - 2 tenants: ${tenant1.name}, ${tenant2.name}`);
  // eslint-disable-next-line no-console
  console.log('  - 5 users: 1 admin, 2 creators, 2 viewers');
  // eslint-disable-next-line no-console
  console.log('  - 3 apps: 2 active, 1 draft');
}

seed().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', error);
  process.exit(1);
});

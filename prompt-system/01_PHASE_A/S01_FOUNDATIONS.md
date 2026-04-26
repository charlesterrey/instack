# S01 — FOUNDATIONS — Monorepo, Database, CI

> **Sprint**: 01 | **Semaines**: W1-W2
> **Leads**: @NEXUS (System Architect) + @WATCHDOG (DevOps)
> **Support**: @CORTEX (Data Arch) + @MOSAIC (Design Tokens)
> **Phase**: A — "Prouver la Magie"

---

## OBJECTIF

Poser les fondations techniques du projet : monorepo Turborepo, schéma PostgreSQL 7 tables avec RLS, CI/CD GitHub Actions, et la structure de tous les packages. À la fin de S01, n'importe quel ingénieur peut cloner le repo, installer les dépendances, et commencer à coder sur son package.

---

## DÉPENDANCES

| Direction | Tâche | Agent |
|-----------|-------|-------|
| **Bloqué par** | Rien — S01 est le point de départ | — |
| **Bloque** | S02 (Auth + API skeleton) | @FORGE |
| **Bloque** | S03 (Pipeline IA) | @NEURON |
| **Bloque** | S05 (Composants UI) | @PRISM |
| **Bloque** | S06 (Excel Sync) | @CONDUIT |

---

## TÂCHES DÉTAILLÉES

### TÂCHE 1.1 — Initialiser le monorepo Turborepo
**Assigné à**: @NEXUS
**Complexité**: L
**Dépendance**: Aucune

```
CHECKLIST :
□ Initialiser le repo Git avec .gitignore (node_modules, .env, dist, .wrangler)
□ Créer turbo.json avec pipelines : build, dev, test, lint, typecheck
□ Créer package.json root avec workspaces :
    - packages/api
    - packages/web
    - packages/shared
    - packages/ai-pipeline
    - packages/ui
□ Créer tsconfig.base.json avec strict mode :
    - strict: true
    - noUncheckedIndexedAccess: true
    - exactOptionalPropertyTypes: true
    - noImplicitReturns: true
    - forceConsistentCasingInFileNames: true
□ Chaque package a son package.json + tsconfig.json qui extends base
□ Installer les devDependencies root :
    - typescript@^5.5
    - turbo@^2
    - vitest@^2
    - eslint@^9 + @typescript-eslint
    - prettier
□ Créer .eslintrc.js avec règles strictes (no-any, no-explicit-any, etc.)
□ Créer .prettierrc (singleQuote: true, trailingComma: 'all', printWidth: 100)
□ Vérifier : `npm install` puis `turbo build` passe sans erreur
```

**Critères d'acceptance** :
- `turbo build` compile tous les packages sans erreur
- `turbo typecheck` passe en strict mode
- `turbo lint` passe avec 0 warnings
- Chaque package exporte un barrel `index.ts`

---

### TÂCHE 1.2 — Package @instack/shared — Types & Schemas
**Assigné à**: @NEXUS
**Complexité**: M
**Dépendance**: 1.1

```
CHECKLIST :
□ Installer Zod dans packages/shared
□ Créer src/types/tenant.types.ts
    - Tenant, TenantPlan ('free' | 'pro' | 'enterprise'), TenantSettings
□ Créer src/types/user.types.ts
    - User, UserRole ('admin' | 'creator' | 'viewer')
□ Créer src/types/app.types.ts
    - App, AppStatus, AppVisibility, AppArchetype (8 types)
    - AppSchema (le JSON complet de l'app générée)
    - ComponentInstance, ComponentType (12 types)
□ Créer src/types/data-source.types.ts
    - DataSource, DataSourceType, SyncConfig, SyncStatus
□ Créer src/types/context-graph.types.ts
    - GraphNode, GraphEdge, NodeType (6 types), RelationType (9 types)
□ Créer src/types/audit.types.ts
    - AuditEntry, AuditAction (enum exhaustif)
□ Créer src/schemas/ avec Zod schemas correspondant à chaque type
    - Validation runtime pour chaque entité
    - Réutilisés côté API (validation input) et côté pipeline (validation output)
□ Créer src/constants/
    - APP_ARCHETYPES, COMPONENT_TYPES, USER_ROLES, PLAN_LIMITS
□ Créer src/utils/
    - result.ts — Result<T, E> pattern (pas de throw)
    - id.ts — generateId() wrapper UUID
□ Exporter tout depuis src/index.ts
□ Tests unitaires pour chaque Zod schema (valid + invalid inputs)
```

**Critères d'acceptance** :
- Tous les types documentés avec JSDoc
- Zod schemas testés avec >95% coverage
- Result<T, E> pattern utilisé partout (pas de throw)
- Zero `any` dans tout le package

---

### TÂCHE 1.3 — Schéma PostgreSQL + Migrations Drizzle
**Assigné à**: @NEXUS + @CORTEX
**Complexité**: XL
**Dépendance**: 1.2

```
CHECKLIST :
□ Installer Drizzle ORM + drizzle-kit + @neondatabase/serverless dans packages/api
□ Créer packages/api/drizzle/schema.ts avec les 7 tables :
    1. tenants — id, name, m365_tenant_id (UNIQUE), plan, settings (JSONB), timestamps
    2. users — id, tenant_id (FK), email, name, role, m365_user_id, last_active_at, timestamps
       UNIQUE(tenant_id, email)
    3. apps — id, tenant_id (FK), creator_id (FK), name, description, schema_json (JSONB),
       archetype (CHECK constraint), status, visibility, expires_at, timestamps
    4. app_components — id, app_id (FK CASCADE), tenant_id (FK), component_type (CHECK),
       config_json (JSONB), position, created_at
    5. data_sources — id, tenant_id (FK), app_id (FK SET NULL), source_type (CHECK),
       m365_resource_id, sync_config (JSONB), last_synced_at, sync_status, created_at
    6. context_graph — id, tenant_id (FK), node_type (CHECK), node_id,
       edges (JSONB array), metadata (JSONB), timestamps
       UNIQUE(tenant_id, node_type, node_id)
    7. audit_log — id, tenant_id (FK), user_id (FK), action, resource_type,
       resource_id, metadata (JSONB), ip_address (INET), created_at
□ Configurer RLS sur TOUTES les 7 tables :
    - ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;
    - Policy pattern : tenant_id = current_setting('app.current_tenant_id')::UUID
□ Créer les indexes :
    - apps: (tenant_id, status), (tenant_id, creator_id), (tenant_id, archetype)
    - users: (tenant_id, email), (tenant_id, role)
    - data_sources: (tenant_id, app_id), (tenant_id, sync_status)
    - context_graph: (tenant_id, node_type, node_id), GIN index sur edges
    - audit_log: (tenant_id, created_at DESC), (tenant_id, action)
□ Créer la première migration : drizzle-kit generate
□ Créer un seed script : infrastructure/scripts/seed.ts
    - 2 tenants de test
    - 5 users (1 admin, 2 creators, 2 viewers)
    - 3 apps de démo
    - Données réalistes (pas de "foo/bar")
□ Tester la migration sur une DB Neon de dev
□ Documenter le schéma dans un ADR
```

**Critères d'acceptance** :
- `drizzle-kit push` applique le schéma sans erreur
- RLS activé et vérifié (test : requête sans session variable retourne 0 rows)
- Seed script crée des données réalistes
- Indexes optimisés pour les requêtes les plus fréquentes
- ADR documenté dans `docs/adr/001-database-schema.md`

---

### TÂCHE 1.4 — CI/CD Pipeline GitHub Actions
**Assigné à**: @WATCHDOG
**Complexité**: M
**Dépendance**: 1.1

```
CHECKLIST :
□ Créer .github/workflows/ci.yml :
    - Trigger : push sur main + PR
    - Jobs :
      1. install — npm ci + cache node_modules
      2. typecheck — turbo typecheck
      3. lint — turbo lint
      4. test — turbo test (vitest)
      5. build — turbo build
    - Matrix : Node 20.x
    - Fail fast : premier job qui fail stoppe tout
□ Créer .github/workflows/deploy-preview.yml :
    - Trigger : PR only
    - Deploy preview sur Cloudflare Workers (wrangler deploy --env preview)
□ Créer .github/workflows/deploy-production.yml :
    - Trigger : merge sur main
    - Deploy production (wrangler deploy --env production)
    - Post-deploy : health check + smoke test
□ Créer les secrets GitHub nécessaires :
    - CLOUDFLARE_API_TOKEN
    - CLOUDFLARE_ACCOUNT_ID
    - NEON_DATABASE_URL
    - ANTHROPIC_API_KEY (pour pipeline IA)
□ Créer infrastructure/wrangler/ avec :
    - wrangler.toml (dev)
    - wrangler.preview.toml
    - wrangler.production.toml
□ Vérifier : push → CI passe en vert en <5 minutes
```

**Critères d'acceptance** :
- CI complète en <5 minutes
- Aucun job ne skip de tests
- Preview deploy fonctionnel sur chaque PR
- Secrets jamais exposés dans les logs

---

### TÂCHE 1.5 — Design Tokens CSS + Package @instack/ui skeleton
**Assigné à**: @MOSAIC
**Complexité**: M
**Dépendance**: 1.1

```
CHECKLIST :
□ Initialiser Untitled UI React dans packages/web/ :
    - npx untitledui@latest init --vite (génère theme.css, globals.css, lib/utils.ts)
    - Vérifier les deps : @untitledui/icons, react-aria-components, tailwind-merge, tailwindcss-animate
    - Personnaliser theme.css : remplacer les couleurs brand-* par la palette instack (#2970FF)
□ Configurer globals.css : @import "tailwindcss"; @import "./theme.css"; + plugins
□ Ajouter les composants de base via CLI :
    - npx untitledui@latest add button input select checkbox table badge card avatar textarea
□ Créer packages/ui/ pour les wrappers métier instack (au-dessus des primitives Untitled UI)
□ Créer le skeleton pour les 6 composants Phase A :
    - src/components/FormField/FormField.tsx + FormField.test.tsx
    - src/components/DataTable/DataTable.tsx + DataTable.test.tsx
    - src/components/KPICard/KPICard.tsx + KPICard.test.tsx
    - src/components/BarChart/BarChart.tsx + BarChart.test.tsx
    - src/components/FilterBar/FilterBar.tsx + FilterBar.test.tsx
    - src/components/Container/Container.tsx + Container.test.tsx
□ Chaque composant : interface TypeScript complète (voir 02_DESIGN_SYSTEM.md)
□ Chaque composant : placeholder render + "TODO S05" comment
□ Exporter tout depuis src/index.ts
□ Configurer Storybook (optionnel S01, obligatoire S05)
```

**Critères d'acceptance** :
- Untitled UI React initialisé (theme.css, globals.css, composants copiés)
- Palette brand customisée pour instack dans theme.css
- TypeScript interfaces définies pour les 6 composants wrappers
- `turbo build` compile les packages web et ui sans erreur
- Tokens accessibles via classes Tailwind CSS v4

---

### TÂCHE 1.6 — Package @instack/api skeleton (Hono)
**Assigné à**: @NEXUS
**Complexité**: M
**Dépendance**: 1.1, 1.3

```
CHECKLIST :
□ Installer hono + @hono/zod-validator dans packages/api
□ Créer src/index.ts — entry point Hono app :
    - Health check route : GET /health → { status: 'ok', version, timestamp }
    - CORS middleware
    - Error handler global (ne jamais leak les stack traces)
□ Créer src/routes/ skeleton :
    - apps.routes.ts (CRUD apps — vide pour S02)
    - auth.routes.ts (OAuth callback — vide pour S02)
    - data-sources.routes.ts (sync — vide pour S06)
    - generation.routes.ts (pipeline IA — vide pour S03)
□ Créer src/middleware/ skeleton :
    - auth.middleware.ts (JWT validation — vide pour S02)
    - tenant.middleware.ts (set RLS session variable — vide pour S02)
    - rate-limit.middleware.ts (basic rate limiter — vide pour S02)
    - error.middleware.ts (error handler structuré)
□ Créer src/lib/
    - db.ts — Drizzle client configuré pour Neon serverless
    - logger.ts — Structured logger (pas de console.log)
    - env.ts — Environment variables validation (Zod)
□ Configurer wrangler.toml pour dev local
□ Tester : `wrangler dev` → GET /health retourne 200
```

**Critères d'acceptance** :
- `wrangler dev` démarre sans erreur
- `/health` retourne `{ status: 'ok' }` en <50ms
- Logger structuré en place (JSON, pas de console.log)
- Env variables validées au startup (fail fast si manquante)

---

## LIVRABLES S01

| Livrable | Chemin | Owner |
|----------|--------|-------|
| Monorepo configuré | `src/` | @NEXUS |
| Types & Schemas partagés | `src/packages/shared/` | @NEXUS |
| Schéma DB + Migrations | `src/packages/api/drizzle/` | @NEXUS + @CORTEX |
| CI/CD Pipeline | `.github/workflows/` | @WATCHDOG |
| Design Tokens | `src/packages/ui/src/tokens/` | @MOSAIC |
| API Skeleton | `src/packages/api/src/` | @NEXUS |
| ADR #001 Database Schema | `docs/adr/001-database-schema.md` | @NEXUS |

---

## DEFINITION OF DONE S01

- [ ] `npm install` propre (zero warnings)
- [ ] `turbo build` compile tous les 5 packages
- [ ] `turbo typecheck` passe en strict mode
- [ ] `turbo lint` passe avec 0 warnings
- [ ] `turbo test` passe (tests Zod schemas)
- [ ] CI GitHub Actions passe en vert
- [ ] `wrangler dev` → /health retourne 200
- [ ] Migration DB appliquée sur Neon dev
- [ ] RLS vérifié (test isolation tenant)
- [ ] Seed data réaliste en place

---

## HANDOFF → S02

```
## HANDOFF: @NEXUS → @FORGE + @PHANTOM
**Sprint**: S02
**Statut**: READY
**Livrables prêts**:
  - Monorepo compilable avec 5 packages
  - Schéma DB 7 tables avec RLS
  - API skeleton Hono avec /health
  - Types partagés dans @instack/shared
**Prochaine étape**: @FORGE implémente l'auth OAuth + CRUD routes
**Prochaine étape**: @PHANTOM implémente le token proxy + CSP
```

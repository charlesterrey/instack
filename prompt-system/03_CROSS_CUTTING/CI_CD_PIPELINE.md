# CROSS-CUTTING — CI/CD PIPELINE

> **Owner**: @WATCHDOG (DevOps)
> **Stack**: GitHub Actions + Wrangler (Cloudflare) + Neon (PostgreSQL)

---

## ENVIRONMENTS

| Env | URL | Branch | DB | Deploy |
|-----|-----|--------|----|--------|
| Development | localhost:* | feature/* | Neon dev | `wrangler dev` |
| Preview | pr-{N}.preview.instack.io | PR | Neon preview (branch) | Auto on PR |
| Staging | staging.instack.io | main | Neon staging | Auto on merge |
| Production | instack.io | release/* | Neon production | Manual approval |

---

## PIPELINES

### PR Pipeline (`.github/workflows/ci.yml`)
```
Trigger: Pull Request → main
Duration target: < 5 minutes

Jobs (parallel):
  ├── typecheck: turbo typecheck
  ├── lint: turbo lint  
  ├── test: turbo test -- --coverage
  ├── build: turbo build
  └── security: npm audit --audit-level=high

Post-success:
  └── deploy-preview: wrangler deploy --env preview
```

### Merge Pipeline (`.github/workflows/deploy-staging.yml`)
```
Trigger: Push → main
Duration target: < 8 minutes

Jobs (sequential):
  1. ci: typecheck + lint + test + build
  2. migrate: drizzle-kit push (Neon staging)
  3. deploy: wrangler deploy --env staging
  4. e2e: playwright test (against staging)
  5. notify: Slack #deployments
```

### Production Pipeline (`.github/workflows/deploy-production.yml`)
```
Trigger: Tag v*.*.* OR manual dispatch
Duration target: < 10 minutes
Requires: Manual approval by @ARCHITECT or @WATCHDOG

Jobs (sequential):
  1. ci: full test suite
  2. migrate: drizzle-kit push (Neon production) — REVERSIBLE CHECK
  3. deploy: wrangler deploy --env production
  4. health-check: curl /health → 200
  5. smoke-test: critical API endpoints
  6. e2e: playwright test (against production, read-only scenarios)
  7. notify: Slack #deployments + email team
  
Rollback (if any job fails):
  - Automatic: wrangler rollback to previous version
  - DB: run drizzle-kit down migration
```

---

## SECRETS MANAGEMENT

```
GitHub Secrets (encrypted):
  CLOUDFLARE_API_TOKEN
  CLOUDFLARE_ACCOUNT_ID
  NEON_DATABASE_URL_DEV
  NEON_DATABASE_URL_STAGING
  NEON_DATABASE_URL_PRODUCTION
  ANTHROPIC_API_KEY
  STRIPE_SECRET_KEY
  STRIPE_WEBHOOK_SECRET
  SENTRY_DSN
  POSTHOG_API_KEY
  MICROSOFT_CLIENT_ID
  MICROSOFT_CLIENT_SECRET

Cloudflare Workers Secrets (runtime):
  (Same keys, deployed via wrangler secret put)
```

---

## BRANCHING STRATEGY

```
main ← feature branches (squash merge)
  │
  ├── feat/S01-monorepo-setup
  ├── feat/S02-auth-oauth
  ├── feat/S03-pipeline-stage1-2
  ├── fix/pipeline-timeout
  └── ...

Tags: v0.1.0 (Phase A complete), v0.2.0 (Phase B complete), v1.0.0 (GA)
```

Convention :
- `feat/SXX-description` — Feature d'un sprint
- `fix/description` — Bug fix
- `refactor/description` — Refactoring
- `docs/description` — Documentation
- Squash merge only (1 commit par PR)
- PR title = commit message conventionnel

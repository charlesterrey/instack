# CROSS-CUTTING — MONITORING & OBSERVABILITY

> **Owner**: @WATCHDOG (DevOps) + @CATALYST (Product Analytics)
> **Stack**: PostHog (analytics EU) + Sentry (errors) + Cloudflare Analytics

---

## TROIS PILIERS

### 1. Errors & Exceptions (Sentry)
- SDK : @sentry/react (frontend) + @sentry/cloudflare (backend)
- Source maps uploadés en CI
- Alertes :
  - Nouvelle erreur non-vue → Slack immédiat
  - Error rate > 5% → Slack + email
  - Error rate > 10% → PagerDuty (si configuré)
- Contexte enrichi : user_id, tenant_id, plan, request_path
- PII scrubbing : emails, noms masqués dans les breadcrumbs

### 2. Product Analytics (PostHog EU)
- 40+ events taxonomie (définie en S08)
- Feature flags pour A/B testing
- Session replay (opt-in, RGPD consent)
- Funnels :
  - Acquisition : Visit → Signup → Sandbox → Microsoft Auth
  - Activation : Signup → First App → Shared App → 2+ Users
  - Retention : WAU, MAU, cohort retention
  - Revenue : Trial → Pro → Enterprise
  - Referral : Shares, Clones, Invitations
- Dashboards :
  - North Star : Weekly Active Apps with 2+ users
  - Pipeline : success rate, latency, cost
  - Activation : funnel drop-off
  - Revenue : MRR, churn, LTV

### 3. Infrastructure (Cloudflare Analytics + Custom)
- Request count, latency P50/P95/P99 (Cloudflare dashboard)
- Worker CPU time, memory
- KV read/write latency
- DB connection pool, query latency (Neon dashboard)
- Custom health endpoint : GET /health/detailed
  ```json
  {
    "status": "healthy",
    "version": "0.1.0",
    "uptime_seconds": 86400,
    "db": { "status": "connected", "latency_ms": 5 },
    "kv": { "status": "connected", "latency_ms": 2 },
    "claude": { "status": "available", "latency_ms": 200 },
    "graph_api": { "status": "available", "latency_ms": 150 }
  }
  ```

---

## ALERTES

| Alerte | Seuil | Canal | Responsable |
|--------|-------|-------|-------------|
| Site down | /health != 200 pendant 2min | Slack + SMS | @WATCHDOG |
| Error rate | > 5% sur 5min | Slack | @WATCHDOG |
| Pipeline failures | > 20% sur 1h | Slack | @NEURON |
| API latency P99 | > 500ms sur 5min | Slack | @FORGE |
| DB connections | > 80% pool | Slack | @CORTEX |
| Stripe webhook fail | Tout échec | Email | @FORGE |
| Security event | Tout login suspect | Slack #security | @PHANTOM |

---

## STRUCTURED LOGGING

```typescript
// Pattern de log (JSON, pas de console.log)
logger.info('app.created', {
  tenantId: ctx.tenant.id,
  userId: ctx.user.id,
  appId: app.id,
  archetype: app.archetype,
  latencyMs: performance.now() - start,
});

// Niveaux : debug, info, warn, error
// En production : info et au-dessus uniquement
// Jamais de PII dans les logs (emails, noms)
```

# S02 — AUTH & API — OAuth 2.0, Token Proxy, CRUD Routes

> **Sprint**: 02 | **Semaines**: W3-W4
> **Leads**: @FORGE (Backend) + @PHANTOM (Security)
> **Support**: @NEXUS (Architecture review) + @CONDUIT (Graph API prep)
> **Phase**: A — "Prouver la Magie"

---

## OBJECTIF

Implémenter l'authentification OAuth 2.0 avec Microsoft Entra ID, le token proxy pattern (les apps ne voient jamais les tokens), les middlewares de sécurité (RLS, CSP, rate limiting), et les routes CRUD de base pour les apps, users, et data sources.

---

## DÉPENDANCES

| Direction | Tâche | Agent |
|-----------|-------|-------|
| **Bloqué par** | S01 (DB schema, API skeleton) | @NEXUS |
| **Bloque** | S03 (Pipeline IA — besoin auth pour les endpoints) | @NEURON |
| **Bloque** | S06 (Excel Sync — besoin token proxy pour Graph API) | @CONDUIT |
| **Bloque** | S07 (Sandbox — besoin CRUD pour créer des apps) | @FORGE |

---

## TÂCHES DÉTAILLÉES

### TÂCHE 2.1 — OAuth 2.0 Flow avec Microsoft Entra ID
**Assigné à**: @PHANTOM
**Complexité**: XL
**Dépendance**: S01 (users table, env config)

```
CHECKLIST :
□ Enregistrer l'app dans Microsoft Entra ID (Azure AD) :
    - Application ID + Client Secret
    - Redirect URI : {API_URL}/auth/callback
    - Scopes : User.Read, Files.Read.All, Sites.Read.All
□ Implémenter le flow OAuth 2.0 Authorization Code :
    1. GET /auth/login → Redirect vers Microsoft login
       - state parameter (CSRF protection, random + signed)
       - PKCE code_challenge (S256)
       - scope = openid profile email User.Read Files.Read.All Sites.Read.All
    2. GET /auth/callback → Exchange code for tokens
       - Valider state parameter
       - Exchange authorization_code → access_token + refresh_token + id_token
       - Décoder id_token pour extraire : oid, email, name, tid (tenant_id)
       - Upsert user dans la DB (via m365_user_id = oid)
       - Upsert tenant (via m365_tenant_id = tid)
       - Stocker tokens chiffrés (AES-256-GCM) — voir tâche 2.2
       - Générer JWT session token pour le frontend
       - Redirect vers le frontend avec le JWT
    3. POST /auth/refresh → Rafraîchir l'access_token via refresh_token
    4. POST /auth/logout → Invalider la session + supprimer tokens
□ Implémenter le JWT session token :
    - Payload : { sub: user_id, tid: tenant_id, role, email, iat, exp }
    - Expiration : 1 heure
    - Signature : HS256 avec secret rotatif
    - HttpOnly cookie (pas de localStorage)
□ Créer src/middleware/auth.middleware.ts :
    - Extraire le JWT du cookie
    - Valider signature + expiration
    - Injecter user + tenant dans le contexte Hono
    - 401 si invalide/expiré
□ Tests :
    - Test flow complet avec mock Microsoft endpoints
    - Test JWT validation (valide, expiré, mauvaise signature, manquant)
    - Test PKCE challenge/verifier
    - Test state parameter CSRF
```

**Critères d'acceptance** :
- Flow OAuth fonctionnel end-to-end
- PKCE + state CSRF en place
- JWT dans HttpOnly cookie (pas localStorage)
- Refresh automatique transparent
- Tests couvrant les cas d'erreur (token expiré, callback invalide, etc.)

---

### TÂCHE 2.2 — Token Proxy Pattern
**Assigné à**: @PHANTOM
**Complexité**: L
**Dépendance**: 2.1

```
CHECKLIST :
□ Implémenter le chiffrement des tokens :
    - AES-256-GCM envelope encryption
    - Master key dans Cloudflare Workers secrets
    - Chaque token chiffré avec une DEK unique
    - DEK stockée chiffrée à côté du token
□ Créer la table token_store (ou ajouter à users) :
    - encrypted_access_token, encrypted_refresh_token
    - token_expires_at
    - encryption_iv, encryption_tag
□ Implémenter le Token Proxy :
    - Les apps générées appellent l'API instack (pas Microsoft directement)
    - L'API déchiffre le token, fait l'appel Graph API, retourne le résultat
    - Le token OAuth n'est JAMAIS exposé au frontend ou aux apps
    - Pattern : App → instack API → Graph API → instack API → App
□ Endpoint proxy : POST /api/graph-proxy
    - Body : { endpoint: string, method: 'GET'|'POST', body?: any }
    - Whitelist des endpoints autorisés (pas de proxy open-bar)
    - Rate limiting per-user
□ Tests :
    - Token chiffrement/déchiffrement roundtrip
    - Proxy appel Graph API mocké
    - Vérifier que le token n'est jamais dans les logs
    - Vérifier que le token n'est jamais dans les réponses HTTP
```

**Critères d'acceptance** :
- Tokens JAMAIS visibles côté client (vérifier network tab)
- AES-256-GCM avec IV unique par chiffrement
- Whitelist d'endpoints Graph API (pas de proxy ouvert)
- Logs ne contiennent aucun token (même en debug mode)

---

### TÂCHE 2.3 — Middleware RLS + Tenant Isolation
**Assigné à**: @FORGE + @PHANTOM
**Complexité**: L
**Dépendance**: S01 (RLS policies), 2.1 (auth middleware)

```
CHECKLIST :
□ Créer src/middleware/tenant.middleware.ts :
    - Après auth middleware, extraire tenant_id du JWT
    - SET LOCAL app.current_tenant_id = '{tenant_id}' sur chaque requête DB
    - Vérifier que RLS filtre correctement
□ Créer un test d'isolation :
    - Tenant A crée une app
    - Tenant B essaie de la lire → 404 (pas 403, pour ne pas leak l'existence)
    - Tenant B essaie de la modifier → 404
    - Sans tenant_id → requête retourne 0 résultats
□ Créer src/middleware/rate-limit.middleware.ts :
    - Limites par plan :
      * Free : 60 req/min, 10 app generations/jour
      * Pro : 300 req/min, 100 app generations/jour
      * Enterprise : 1000 req/min, unlimited generations
    - Utiliser Cloudflare Workers KV pour le compteur
    - Header X-RateLimit-Remaining dans la réponse
□ Créer src/middleware/cors.middleware.ts :
    - Origin whitelist : *.instack.io, localhost:* en dev
    - Credentials : true (pour les cookies)
□ Créer src/middleware/csp.middleware.ts :
    - Content-Security-Policy strict :
      * default-src 'self'
      * script-src 'self' (pas de inline, pas de eval)
      * style-src 'self' 'unsafe-inline' (nécessaire pour les design tokens)
      * img-src 'self' data: https:
      * connect-src 'self' https://graph.microsoft.com
      * frame-ancestors 'none'
      * form-action 'self'
    - Referrer-Policy : strict-origin-when-cross-origin
    - X-Content-Type-Options : nosniff
    - X-Frame-Options : DENY
```

**Critères d'acceptance** :
- Isolation tenant prouvée par tests automatisés
- Rate limiting fonctionnel avec headers corrects
- CSP header présent sur TOUTES les réponses
- Zero cross-tenant data leak possible

---

### TÂCHE 2.4 — Routes CRUD Apps
**Assigné à**: @FORGE
**Complexité**: L
**Dépendance**: 2.1, 2.3

```
CHECKLIST :
□ Implémenter src/routes/apps.routes.ts :
    - POST /api/apps — Créer une app
      * Body validé par Zod (name, description?, archetype)
      * Vérifie la limite du plan (Free: max 3 apps)
      * Crée l'app avec status 'draft'
      * Audit log : 'app.created'
      * Retourne 201 + app complète
    - GET /api/apps — Lister mes apps
      * Pagination : ?page=1&limit=20
      * Filtres : ?status=active&archetype=dashboard
      * Tri : ?sort=created_at&order=desc
      * Retourne uniquement les apps du tenant (RLS)
    - GET /api/apps/:id — Détail d'une app
      * Inclure les components (join)
      * Inclure les data sources (join)
      * 404 si pas trouvé ou autre tenant
    - PATCH /api/apps/:id — Modifier une app
      * Partial update (name, description, status, visibility, expires_at)
      * Validation Zod
      * Audit log : 'app.updated'
    - DELETE /api/apps/:id — Archiver une app (soft delete → status='archived')
      * Audit log : 'app.archived'
    - POST /api/apps/:id/share — Changer la visibilité
      * Body : { visibility: 'private' | 'team' | 'public' }
      * Audit log : 'app.shared'
□ Créer src/services/app.service.ts :
    - Business logic séparée des routes
    - Vérifie les limites du plan
    - Vérifie les permissions (creator ou admin)
□ Créer src/repositories/app.repository.ts :
    - Requêtes Drizzle typées
    - Joins optimisés (pas de N+1)
□ Tests pour chaque endpoint :
    - Happy path
    - Validation errors (400)
    - Auth errors (401)
    - Not found (404)
    - Plan limits (403)
    - Pagination edge cases
```

---

### TÂCHE 2.5 — Routes CRUD Users & Tenants
**Assigné à**: @FORGE
**Complexité**: M
**Dépendance**: 2.1, 2.3

```
CHECKLIST :
□ GET /api/users/me — Profil utilisateur courant
□ GET /api/users — Lister les users du tenant (admin only)
□ PATCH /api/users/:id/role — Changer le rôle (admin only)
□ GET /api/tenants/me — Info du tenant courant
□ PATCH /api/tenants/me — Modifier settings tenant (admin only)
□ GET /api/tenants/me/stats — Stats rapides (nb apps, nb users, nb active)
□ Tests pour chaque endpoint
```

---

### TÂCHE 2.6 — Frontend Auth Flow
**Assigné à**: @PRISM (prep)
**Complexité**: M
**Dépendance**: 2.1

```
CHECKLIST :
□ Créer packages/web/src/pages/Login/Login.tsx :
    - Bouton "Se connecter avec Microsoft"
    - Logo instack + message d'accueil
    - Utiliser les design tokens Untitled UI
□ Créer packages/web/src/hooks/useAuth.ts :
    - État : user, tenant, isAuthenticated, isLoading
    - login() → redirect vers /auth/login
    - logout() → appelle /auth/logout + clear state
    - Vérifier le JWT cookie au mount
□ Créer packages/web/src/components/ProtectedRoute.tsx :
    - Redirect vers Login si pas authentifié
    - Afficher loader pendant la vérification
□ Créer packages/web/src/api/client.ts :
    - Fetch wrapper avec :
      * Base URL configurable
      * Credentials: 'include' (pour les cookies)
      * Error handling (401 → redirect login, 429 → retry with backoff)
      * Response typing (generics)
□ Créer packages/web/src/App.tsx :
    - Router : / → Dashboard, /login → Login, /apps → AppList, /apps/:id → AppDetail
    - ProtectedRoute wrapper
```

---

## LIVRABLES S02

| Livrable | Chemin | Owner |
|----------|--------|-------|
| OAuth 2.0 Flow | `packages/api/src/routes/auth.routes.ts` | @PHANTOM |
| Token Proxy | `packages/api/src/services/token-proxy.service.ts` | @PHANTOM |
| RLS Middleware | `packages/api/src/middleware/tenant.middleware.ts` | @FORGE + @PHANTOM |
| Security Headers | `packages/api/src/middleware/csp.middleware.ts` | @PHANTOM |
| CRUD Apps | `packages/api/src/routes/apps.routes.ts` | @FORGE |
| CRUD Users | `packages/api/src/routes/users.routes.ts` | @FORGE |
| Frontend Auth | `packages/web/src/pages/Login/` | @PRISM |
| ADR #002 Auth | `docs/adr/002-auth-oauth-token-proxy.md` | @PHANTOM |

---

## DEFINITION OF DONE S02

- [ ] OAuth flow fonctionnel avec Microsoft (test avec compte réel)
- [ ] Token proxy vérifié — aucun token dans les réponses HTTP
- [ ] RLS isolation prouvée par tests automatisés (2 tenants)
- [ ] CSP header sur toutes les réponses
- [ ] CRUD apps fonctionnel (6 endpoints, 18+ tests)
- [ ] Rate limiting fonctionnel avec headers
- [ ] Frontend login flow fonctionnel
- [ ] CI passe en vert

---

## HANDOFF → S03

```
## HANDOFF: @FORGE + @PHANTOM → @NEURON + @CONDUIT
**Sprint**: S03
**Statut**: READY
**Livrables prêts**:
  - Auth OAuth complète + token proxy
  - CRUD endpoints pour apps
  - RLS middleware avec tenant isolation
  - API client frontend
**Prochaine étape**: @NEURON implémente Stage 1-2 du pipeline IA
**Prochaine étape**: @CONDUIT prépare l'accès Graph API via token proxy
```

---
title: "INSTACK MVP Project Dashboard"
source_file: "MVP/dashboard/INSTACK_MVP_Project_Dashboard.html"
type: html
date_converted: "2026-04-26"
parent_folder: "dashboard"
---

# INSTACK MVP Project Dashboard

## Teams

| Code | Team | Lead |
| --- | --- | --- |
| SA-01 | Backend & API | Alexandre Duval |
| SA-02 | Frontend & Design System | Marie Chen |
| SA-03 | AI/ML Pipeline | Karim Benali |
| SA-04 | Infrastructure & DevOps | Sophie Laurent |
| SA-05 | Security & Compliance | Thomas Weber |
| SA-06 | Product Management | Elena Rossi |
| SA-07 | UX/Design | Lucas Martin |
| SA-08 | Growth & Marketing | Camille Dubois |
| SA-09 | Sales & GTM | Pierre Moreau |
| SA-10 | Strategy & Business | Isabelle Fournier |

## Task Summary

**Total tasks:** 57

- todo: 57

## Backend & API (SA-01) - Lead: Alexandre Duval

### Phase A

| ID | Title | Week | Status | Priority |
| --- | --- | --- | --- | --- |
| BE-001 | Schema PostgreSQL multi-tenant + RLS | S1-S2 | todo | P0 |
| BE-002 | API REST Hono.js — 24 endpoints CRUD | S1-S3 | todo | P0 |
| BE-003 | Connecteur SharePoint/OneDrive — lecture Excel | S3-S5 | todo | P0 |
| BE-004 | Context graph JSONB — inference schema Excel | S5-S7 | todo | P1 |
| BE-005 | API App Store — listing, search, metadata | S6-S8 | todo | P1 |

#### BE-001: Schema PostgreSQL multi-tenant + RLS

**Status:** todo | **Priority:** P0 | **Week:** S1-S2 | **Phase:** A

Creer le schema complet PostgreSQL avec Row Level Security par tenant_id. Tables: tenants, users, apps, app_components, data_sources, context_graph (JSONB), audit_logs, sessions.

**Notes:** Socle de tout le projet. Rien ne peut commencer sans ce schema valide.

**Subtasks:**
- [ ] Definir le schema DDL complet (8 tables) (todo)
- [ ] Implementer les RLS policies par tenant_id (todo)
- [ ] Creer les indexes de performance (todo)
- [ ] Ecrire les migrations Neon (todo)
- [ ] Tests unitaires schema + RLS (todo)

#### BE-002: API REST Hono.js — 24 endpoints CRUD

**Status:** todo | **Priority:** P0 | **Week:** S1-S3 | **Phase:** A

Developper l'API REST sur Hono.js/Cloudflare Workers. 24 endpoints couvrant tenants, users, apps, data_sources, components. Middleware auth JWT + rate limiting.

**Dependencies:** BE-001

**Notes:** Objectif latence P95 < 200ms.

**Subtasks:**
- [ ] Setup Hono.js sur Cloudflare Workers (todo)
- [ ] Endpoints CRUD tenants + users (todo)
- [ ] Endpoints CRUD apps + app_components (todo)
- [ ] Endpoints data_sources + context_graph (todo)
- [ ] Middleware auth JWT + rate limiting (todo)
- [ ] Documentation OpenAPI/Swagger (todo)

#### BE-003: Connecteur SharePoint/OneDrive — lecture Excel

**Status:** todo | **Priority:** P0 | **Week:** S3-S5 | **Phase:** A

Integration Microsoft Graph API pour lire les fichiers Excel depuis SharePoint/OneDrive. Delta queries pour sync incrementale. Parser les feuilles, colonnes, types.

**Dependencies:** BE-002

**Notes:** Mode lecture seule en Phase A. Write-back en Phase B.

**Subtasks:**
- [ ] Integration Microsoft Graph API OAuth (todo)
- [ ] Parser Excel via Microsoft Graph (todo)
- [ ] Inference automatique du schema colonnes (todo)
- [ ] Delta queries pour sync incrementale (todo)
- [ ] Gestion des erreurs et retry logic (todo)

#### BE-004: Context graph JSONB — inference schema Excel

**Status:** todo | **Priority:** P1 | **Week:** S5-S7 | **Phase:** A

Stocker le contexte du fichier Excel (colonnes, types, relations entre feuilles) dans le champ JSONB context_graph pour alimenter le pipeline IA.

**Dependencies:** BE-003

**Notes:** Remplace Neo4j (reporte V2). Le JSONB couvre 90% des besoins MVP.

**Subtasks:**
- [ ] Schema JSONB pour context_graph (todo)
- [ ] Inference automatique types colonnes (todo)
- [ ] Detection relations entre feuilles (todo)
- [ ] API endpoint GET context pour le pipeline IA (todo)

#### BE-005: API App Store — listing, search, metadata

**Status:** todo | **Priority:** P1 | **Week:** S6-S8 | **Phase:** A

Endpoints pour lister, chercher et afficher les apps publiees dans le store interne. Tri par popularite, date, categorie.

**Dependencies:** BE-002

**Subtasks:**
- [ ] Endpoint search/filter apps (todo)
- [ ] Endpoint metadata app (createur, usage) (todo)
- [ ] Endpoint clone/fork app (todo)
- [ ] Pagination + tri (populaire, recent) (todo)

### Phase B

| ID | Title | Week | Status | Priority |
| --- | --- | --- | --- | --- |
| BE-006 | Write-back Excel bidirectionnel | S9-S11 | todo | P0 |
| BE-007 | Integration Stripe Billing — Free/Pro/Enterprise | S11-S13 | todo | P0 |
| BE-008 | Admin Consent flow + SSO Azure AD | S13-S15 | todo | P1 |
| BE-009 | Cockpit DSI backend — analytics, kill-switch, audit | S14-S16 | todo | P1 |

#### BE-006: Write-back Excel bidirectionnel

**Status:** todo | **Priority:** P0 | **Week:** S9-S11 | **Phase:** B

Permettre aux apps generees d'ecrire dans le fichier Excel source via Microsoft Graph API. Gestion des conflits et locks. Queue async.

**Dependencies:** BE-003

**Notes:** Feature la plus demandee par les Ops Managers.

**Subtasks:**
- [ ] Microsoft Graph API write operations (todo)
- [ ] Gestion des locks fichier Excel (todo)
- [ ] Conflict resolution (last-write-wins + notif) (todo)
- [ ] Queue de write-back async (todo)
- [ ] Tests avec fichiers Excel reels (todo)

#### BE-007: Integration Stripe Billing — Free/Pro/Enterprise

**Status:** todo | **Priority:** P0 | **Week:** S11-S13 | **Phase:** B

Billing complet: Free (0) / Pro (299/mois) / Enterprise (custom). Webhooks Stripe, checkout, customer portal, gestion quotas par tier.

**Dependencies:** BE-002

**Notes:** Valider pricing 299 par 10 interviews avant implementation.

**Subtasks:**
- [ ] Setup Stripe products + prices (todo)
- [ ] Checkout flow + customer portal (todo)
- [ ] Webhooks subscription lifecycle (todo)
- [ ] Gestion quotas par tier (todo)
- [ ] Grace period + dunning emails (todo)

#### BE-008: Admin Consent flow + SSO Azure AD

**Status:** todo | **Priority:** P1 | **Week:** S13-S15 | **Phase:** B

Permettre au DSI d'autoriser Instack pour toute l'organisation via Admin Consent. SSO SAML/OIDC. User provisioning basique.

**Dependencies:** BE-003, SEC-003

**Notes:** Pre-requis pour les clients Enterprise.

**Subtasks:**
- [ ] Azure AD Admin Consent flow (todo)
- [ ] SSO SAML/OIDC integration (todo)
- [ ] User provisioning basique (todo)
- [ ] Tests avec Azure AD sandbox (todo)

#### BE-009: Cockpit DSI backend — analytics, kill-switch, audit

**Status:** todo | **Priority:** P1 | **Week:** S14-S16 | **Phase:** B

Endpoints pour le cockpit DSI complet: analytics usage, gestion permissions, kill-switch app, export audit trail.

**Dependencies:** BE-005

**Subtasks:**
- [ ] API analytics usage (apps, users, data access) (todo)
- [ ] Kill-switch endpoint (desactiver une app) (todo)
- [ ] Export audit trail CSV/JSON (todo)
- [ ] Politique de retention des donnees (todo)

## Frontend & Design System (SA-02) - Lead: Marie Chen

### Phase A

| ID | Title | Week | Status | Priority |
| --- | --- | --- | --- | --- |
| FE-001 | Setup React/Vite + Design tokens + Storybook | S1-S2 | todo | P0 |
| FE-002 | Composants Phase A (1/2): FormField, DataTable, KPICard | S2-S4 | todo | P0 |
| FE-003 | Composants Phase A (2/2): BarChart, FilterBar, Container | S4-S6 | todo | P0 |
| FE-004 | AppRenderer — JSON-to-React deterministe | S3-S6 | todo | P0 |
| FE-005 | Chat UI creation d\ | S5-S8 | todo | P0 |

#### FE-001: Setup React/Vite + Design tokens + Storybook

**Status:** todo | **Priority:** P0 | **Week:** S1-S2 | **Phase:** A

Initialiser le projet React/Vite/TypeScript, configurer le design system avec tokens, setup Storybook pour documentation composants.

**Notes:** Base Radix UI pour accessibilite WCAG 2.1 AA.

**Subtasks:**
- [ ] Init React + Vite + TypeScript (todo)
- [ ] Configurer Tailwind + custom tokens (todo)
- [ ] Setup Storybook (todo)
- [ ] Tokens: colors, spacing, typography, shadows, radii (todo)

#### FE-002: Composants Phase A (1/2): FormField, DataTable, KPICard

**Status:** todo | **Priority:** P0 | **Week:** S2-S4 | **Phase:** A

Les 3 composants les plus demandes avec interfaces TypeScript strictes et tests visuels.

**Dependencies:** FE-001

**Notes:** Tester avec 3 jeux de donnees reels (Leroy Merlin, Bonduelle, Descamps).

**Subtasks:**
- [ ] FormField: input, select, date, checkbox, radio, validation (todo)
- [ ] DataTable: tri, filtre, pagination, export CSV, selection (todo)
- [ ] KPICard: valeur, delta, trend sparkline, icone (todo)
- [ ] Tests visuels Storybook pour chaque composant (todo)
- [ ] Tests accessibilite WCAG 2.1 AA (todo)

#### FE-003: Composants Phase A (2/2): BarChart, FilterBar, Container

**Status:** todo | **Priority:** P0 | **Week:** S4-S6 | **Phase:** A

Completer les 6 composants Phase A avec BarChart responsive, FilterBar multi-critere, Container layout grid.

**Dependencies:** FE-002

**Subtasks:**
- [ ] BarChart: horizontal/vertical, stacked, responsive, legend (todo)
- [ ] FilterBar: multi-critere, date range, search, presets (todo)
- [ ] Container: layout grid responsive, breakpoints (todo)
- [ ] Integration donnees reelles via API (todo)

#### FE-004: AppRenderer — JSON-to-React deterministe

**Status:** todo | **Priority:** P0 | **Week:** S3-S6 | **Phase:** A

Le coeur du rendu: transformer le JSON genere par le pipeline IA en arbre React. Zero eval(), zero code libre. Validation schema avant rendu.

**Dependencies:** FE-002, AI-002

**Notes:** Piece maitresse du frontend.

**Subtasks:**
- [ ] Parser JSON schema -> arbre composants React (todo)
- [ ] Renderer deterministe avec error boundaries (todo)
- [ ] Validation schema strict avant rendu (reject invalid) (todo)
- [ ] Preview live pendant la conversation chat (todo)
- [ ] Fallback gracieux avec message utilisateur (todo)

#### FE-005: Chat UI creation d\

**Status:** todo | **Priority:** P0 | **Week:** S5-S8 | **Phase:** A

Interface conversationnelle: upload Excel drag & drop, decrire le besoin en langage naturel, voir le preview live en split-screen.

**Dependencies:** FE-004

**Notes:** Objectif: time-to-aha < 5 minutes.

**Subtasks:**
- [ ] Chat UI avec streaming SSE responses (todo)
- [ ] Upload Excel drag & drop + progress (todo)
- [ ] Preview live split-screen (resize) (todo)
- [ ] Historique conversations + reprendre (todo)
- [ ] Mode "essayer sans inscription" (donnees demo) (todo)

### Phase B

| ID | Title | Week | Status | Priority |
| --- | --- | --- | --- | --- |
| FE-006 | 6 composants Phase B — PieChart, LineChart, Kanban... | S9-S11 | todo | P1 |
| FE-007 | App Store UI — Netflix-like browse + clone wizard | S10-S13 | todo | P0 |
| FE-008 | Cockpit DSI UI — dashboard, audit, kill-switch | S12-S16 | todo | P1 |

#### FE-006: 6 composants Phase B — PieChart, LineChart, Kanban...

**Status:** todo | **Priority:** P1 | **Week:** S9-S11 | **Phase:** B

PieChart, LineChart, KanbanBoard, DetailView, ImageGallery, PageNav.

**Dependencies:** FE-003

**Subtasks:**
- [ ] PieChart + donut variant (todo)
- [ ] LineChart multi-series + zoom + tooltip (todo)
- [ ] KanbanBoard drag & drop + swimlanes (todo)
- [ ] DetailView formulaire read/edit mode (todo)
- [ ] ImageGallery grid + lightbox (todo)
- [ ] PageNav multi-page + tabs + breadcrumbs (todo)

#### FE-007: App Store UI — Netflix-like browse + clone wizard

**Status:** todo | **Priority:** P0 | **Week:** S10-S13 | **Phase:** B

Interface decouverte: carousels par categorie, recherche par probleme, detail app avec preview, clone/fork en 2 clics.

**Dependencies:** BE-005, FE-006

**Notes:** Clone/fork wizard critique pour la viralite K-factor.

**Subtasks:**
- [ ] Page d\'accueil store avec carousels (todo)
- [ ] Recherche par probleme (NLP friendly) (todo)
- [ ] Page detail app + live preview (todo)
- [ ] Clone/fork wizard 2 etapes (todo)
- [ ] Categories: retail, logistique, RH, finance, qualite (todo)

#### FE-008: Cockpit DSI UI — dashboard, audit, kill-switch

**Status:** todo | **Priority:** P1 | **Week:** S12-S16 | **Phase:** B

Dashboard DSI: KPIs usage, liste apps filtrables, detail app (qui, quoi, quelles donnees), kill-switch, export audit.

**Dependencies:** BE-009

**Notes:** Read-only en Phase A (simple table), complet en Phase B.

**Subtasks:**
- [ ] Dashboard overview (KPIs, charts usage) (todo)
- [ ] Liste apps avec filtre/tri/search (todo)
- [ ] Detail app: createur, utilisateurs, donnees accedees (todo)
- [ ] Kill-switch avec dialog de confirmation (todo)
- [ ] Export audit trail CSV (todo)

## AI/ML Pipeline (SA-03) - Lead: Karim Benali

### Phase A

| ID | Title | Week | Status | Priority |
| --- | --- | --- | --- | --- |
| AI-001 | Etage 1 — Classification Haiku (routage requete) | S1-S3 | todo | P0 |
| AI-002 | Etage 2-3 — Inference schema + Generation Sonnet 4 | S2-S5 | todo | P0 |
| AI-003 | Etage 4 — Validation AST + sanitization | S4-S6 | todo | P0 |
| AI-004 | Few-shot library — 50+ exemples par vertical | S5-S8 | todo | P1 |

#### AI-001: Etage 1 — Classification Haiku (routage requete)

**Status:** todo | **Priority:** P0 | **Week:** S1-S3 | **Phase:** A

Premier etage du pipeline 4 etages: classifier la requete utilisateur (type d'app, complexite, composants necessaires) via Claude Haiku. Routage vers le bon schema d'inference.

**Notes:** Etage le plus critique: un mauvais routage cascade en echec total.

**Subtasks:**
- [ ] Prompt engineering classification (8 types apps) (todo)
- [ ] Taxonomy: dashboard, formulaire, tracker, rapport, planning, inventaire, kanban, custom (todo)
- [ ] 3 niveaux complexite: simple (1-2 composants), medium (3-4), complexe (5-6) (todo)
- [ ] Routage vers le schema d\'inference adapte (todo)
- [ ] Benchmark precision routage (objectif >95%) (todo)
- [ ] Metriques PostHog par type de classification (todo)

#### AI-002: Etage 2-3 — Inference schema + Generation Sonnet 4

**Status:** todo | **Priority:** P0 | **Week:** S2-S5 | **Phase:** A

Generer le JSON schema de l'app via Sonnet 4 en mode tool_use strict. Le LLM recoit les 6 composants comme tools et assemble un JSON structure.

**Dependencies:** AI-001

**Notes:** Generation contrainte JSON = 92-95% vs 82-87% code libre.

**Subtasks:**
- [ ] Definir le JSON schema de sortie strict (todo)
- [ ] Prompt engineering generation contrainte (todo)
- [ ] Mode tool_use Sonnet 4 avec composants comme tools (todo)
- [ ] Context injection (schema Excel, colonnes, types) (todo)
- [ ] Fallback Haiku si Sonnet echoue (todo)
- [ ] Benchmark taux succes (objectif >92%) (todo)

#### AI-003: Etage 4 — Validation AST + sanitization

**Status:** todo | **Priority:** P0 | **Week:** S4-S6 | **Phase:** A

Valider le JSON genere par un AST validator strict avant envoi au renderer React. Rejeter les schemas invalides, tenter re-generation partielle.

**Dependencies:** AI-002

**Subtasks:**
- [ ] AST validator pour le JSON schema (todo)
- [ ] Regles de validation par type de composant (todo)
- [ ] Error recovery: re-generation partielle ciblée (todo)
- [ ] Logging detaille des echecs pour amelioration (todo)

#### AI-004: Few-shot library — 50+ exemples par vertical

**Status:** todo | **Priority:** P1 | **Week:** S5-S8 | **Phase:** A

Constituer une base d'exemples de generation par secteur: retail (stock, planning, prix), industrie (qualite, maintenance), logistique (tournees, suivi colis).

**Dependencies:** AI-003

**Subtasks:**
- [ ] 20 exemples retail (suivi stock, planning equipe, grille prix, inventaire) (todo)
- [ ] 15 exemples industrie (controle qualite, maintenance preventive, suivi production) (todo)
- [ ] 15 exemples logistique (tournees, suivi colis, planning chauffeurs) (todo)
- [ ] Systeme de selection dynamique des few-shots pertinents (todo)

### Phase B

| ID | Title | Week | Status | Priority |
| --- | --- | --- | --- | --- |
| AI-005 | Feedback loop — collecte + amelioration continue | S9-S12 | todo | P1 |
| AI-006 | Contexte Excel enrichi — suggestions proactives | S12-S16 | todo | P1 |

#### AI-005: Feedback loop — collecte + amelioration continue

**Status:** todo | **Priority:** P1 | **Week:** S9-S12 | **Phase:** B

Collecter les feedbacks utilisateur (app OK / modifiee / regeneree) pour alimenter l'amelioration continue du pipeline.

**Dependencies:** AI-004

**Subtasks:**
- [ ] UI feedback: pouce haut/bas, edit manual, regenerate (todo)
- [ ] Pipeline collecte et aggregation des feedbacks (todo)
- [ ] Analyse mensuelle des patterns d\'echec recurrents (todo)
- [ ] Mise a jour automatique few-shot library (todo)

#### AI-006: Contexte Excel enrichi — suggestions proactives

**Status:** todo | **Priority:** P1 | **Week:** S12-S16 | **Phase:** B

Exploiter le context_graph JSONB pour enrichir les prompts et proposer des suggestions proactives basees sur le schema du fichier Excel.

**Dependencies:** BE-004, AI-004

**Subtasks:**
- [ ] Injection context_graph structuree dans le prompt systeme (todo)
- [ ] Suggestions proactives: "Ce fichier semble etre un inventaire, voulez-vous un dashboard stock ?" (todo)
- [ ] Detection automatique du meilleur composant par type de colonne (todo)

## Infrastructure & DevOps (SA-04) - Lead: Sophie Laurent

### Phase A

| ID | Title | Week | Status | Priority |
| --- | --- | --- | --- | --- |
| INF-001 | Provisioning Cloudflare Workers + Neon PostgreSQL | S1 | todo | P0 |
| INF-002 | CI/CD GitHub Actions — lint, test, deploy | S2-S3 | todo | P0 |
| INF-003 | Observabilite — PostHog + Sentry + alerting | S3-S4 | todo | P0 |
| INF-004 | Performance — CDN, cache, latence monitoring | S5-S8 | todo | P1 |

#### INF-001: Provisioning Cloudflare Workers + Neon PostgreSQL

**Status:** todo | **Priority:** P0 | **Week:** S1 | **Phase:** A

Provisionner l'infrastructure de base: Cloudflare Workers, Neon PostgreSQL EU-West, DNS, secrets management.

**Notes:** Cout total estime: 208/mois pour 1000 tenants.

**Subtasks:**
- [ ] Compte Cloudflare Workers (paid plan) (todo)
- [ ] Neon PostgreSQL EU-West provisioning (todo)
- [ ] DNS: instack.io + *.apps.instack.io + api.instack.io (todo)
- [ ] Secrets management (Cloudflare env vars) (todo)

#### INF-002: CI/CD GitHub Actions — lint, test, deploy

**Status:** todo | **Priority:** P0 | **Week:** S2-S3 | **Phase:** A

Pipeline CI/CD complet: lint (ESLint/Prettier), tests (Vitest), build, deploy staging auto, deploy prod avec approval gate.

**Dependencies:** INF-001

**Notes:** Neon branches = zero-cost preview environments.

**Subtasks:**
- [ ] GitHub Actions workflow CI (lint + test + typecheck) (todo)
- [ ] Deploy staging automatique sur PR merge to main (todo)
- [ ] Deploy prod avec manual approval gate (todo)
- [ ] Neon branch automatique par PR pour preview DB (todo)

#### INF-003: Observabilite — PostHog + Sentry + alerting

**Status:** todo | **Priority:** P0 | **Week:** S3-S4 | **Phase:** A

Stack monitoring: PostHog (analytics + feature flags), Sentry (error tracking + session replay), alertes Slack.

**Dependencies:** INF-001

**Subtasks:**
- [ ] PostHog setup + events tracking plan (30+ events) (todo)
- [ ] Sentry integration frontend + backend (todo)
- [ ] Session replay pour debugging UX (todo)
- [ ] Alertes Slack sur erreurs critiques (> 5/min) (todo)

#### INF-004: Performance — CDN, cache, latence monitoring

**Status:** todo | **Priority:** P1 | **Week:** S5-S8 | **Phase:** A

Optimiser les performances: CDN Cloudflare pour assets, cache headers, monitoring latence P50/P95/P99.

**Dependencies:** INF-003

**Subtasks:**
- [ ] Cache headers optimaux (immutable assets, API max-age) (todo)
- [ ] Dashboard latence P50/P95/P99 par endpoint (todo)
- [ ] Alertes si P95 > 500ms (todo)

### Phase B

| ID | Title | Week | Status | Priority |
| --- | --- | --- | --- | --- |
| INF-005 | Multi-region EU + auto-scaling + load testing | S12-S16 | todo | P2 |

#### INF-005: Multi-region EU + auto-scaling + load testing

**Status:** todo | **Priority:** P2 | **Week:** S12-S16 | **Phase:** B

Preparer multi-region (EU-West + EU-Central) pour Enterprise. Auto-scaling Workers. Load test 10K concurrent.

**Dependencies:** INF-004

**Notes:** Necessaire avant le premier client Enterprise.

**Subtasks:**
- [ ] Neon read replicas EU-Central (todo)
- [ ] Cloudflare Workers geo-routing (todo)
- [ ] Load testing 10K users concurrents (k6) (todo)

## Security & Compliance (SA-05) - Lead: Thomas Weber

### Phase A

| ID | Title | Week | Status | Priority |
| --- | --- | --- | --- | --- |
| SEC-001 | Modele securite 4 couches — V8, CSP, iframe, domaine | S1-S3 | todo | P0 |
| SEC-002 | OAuth Personal mode + Token Proxy server-side | S3-S6 | todo | P0 |
| SEC-004 | Audit trail — logging securise de toutes les actions | S1-S8 | todo | P0 |

#### SEC-001: Modele securite 4 couches — V8, CSP, iframe, domaine

**Status:** todo | **Priority:** P0 | **Week:** S1-S3 | **Phase:** A

Implementer les 4 couches d'isolation: V8 Isolate (Cloudflare Workers), CSP Header strict, iframe sandbox attributes, domaine separe pour apps generees.

**Dependencies:** INF-001

**Notes:** Le domaine separe est non-negociable pour isoler le CSP.

**Subtasks:**
- [ ] Content Security Policy headers (script-src, frame-src) (todo)
- [ ] iframe sandbox: allow-scripts, allow-same-origin deny (todo)
- [ ] Domaine separe *.apps.instack.io avec wildcard cert (todo)
- [ ] Validation composants rendus (pas d\'injection) (todo)
- [ ] Tests de securite basiques (OWASP top 10) (todo)

#### SEC-002: OAuth Personal mode + Token Proxy server-side

**Status:** todo | **Priority:** P0 | **Week:** S3-S6 | **Phase:** A

Chaque utilisateur connecte son propre compte Microsoft (zero IT involvement). Tous les tokens transitent par un proxy server-side, jamais exposes cote client.

**Dependencies:** SEC-001, BE-002

**Notes:** Mode personal = zero friction pour l'Ops Manager qui veut tester.

**Subtasks:**
- [ ] OAuth 2.0 PKCE flow implementation (todo)
- [ ] Token Proxy backend (encrypt + store + rotate) (todo)
- [ ] Token refresh automatique transparent (todo)
- [ ] Revocation propre + session cleanup (todo)

#### SEC-004: Audit trail — logging securise de toutes les actions

**Status:** todo | **Priority:** P0 | **Week:** S1-S8 | **Phase:** A

Logger toutes les actions sensibles: creation/suppression app, acces donnees Excel, partage, modification permissions. Retention 90 jours.

**Dependencies:** BE-001

**Notes:** A implementer des S1 — les DSI le demanderont immediatement.

**Subtasks:**
- [ ] Schema audit_logs PostgreSQL (action, actor, resource, timestamp, metadata) (todo)
- [ ] Middleware logging automatique sur tous les endpoints sensibles (todo)
- [ ] Retention policy configurable (90j defaut) (todo)
- [ ] API export pour le cockpit DSI (JSON/CSV) (todo)

### Phase B

| ID | Title | Week | Status | Priority |
| --- | --- | --- | --- | --- |
| SEC-003 | Admin Consent + SSO enterprise (SAML/OIDC) | S9-S12 | todo | P0 |
| SEC-005 | Pentest externe + gap analysis SOC2 Type I | S14-S16 | todo | P1 |

#### SEC-003: Admin Consent + SSO enterprise (SAML/OIDC)

**Status:** todo | **Priority:** P0 | **Week:** S9-S12 | **Phase:** B

Flow Admin Consent pour autorisation organisation-wide. SSO SAML/OIDC. Mapping roles Azure AD vers roles Instack.

**Dependencies:** SEC-002

**Subtasks:**
- [ ] Azure AD Admin Consent flow complet (todo)
- [ ] SSO SAML 2.0 + OIDC support (todo)
- [ ] Mapping roles Azure AD -> roles Instack (admin, creator, viewer) (todo)
- [ ] Tests avec tenant Azure AD sandbox (todo)

#### SEC-005: Pentest externe + gap analysis SOC2 Type I

**Status:** todo | **Priority:** P1 | **Week:** S14-S16 | **Phase:** B

Mandater un pentest externe et realiser un gap analysis SOC2 Type I pour les premiers clients Enterprise.

**Dependencies:** SEC-003

**Notes:** Pre-requis pour signer les premiers Enterprise.

**Subtasks:**
- [ ] Selection prestataire pentest (budget 5-10K) (todo)
- [ ] Pentest execution: black box + grey box (todo)
- [ ] Remediation des findings critiques et hauts (todo)
- [ ] Gap analysis SOC2 Type I (todo)

## Product Management (SA-06) - Lead: Elena Rossi

### Phase A

| ID | Title | Week | Status | Priority |
| --- | --- | --- | --- | --- |
| PM-001 | Scope freeze Phase A — 6 US P0 gravees dans le marbre | S1 | todo | P0 |
| PM-002 | North Star Metric + Aha Moment — tracking setup | S1-S2 | todo | P0 |
| PM-003 | Sprint cadence — 4 sprints de 2 semaines avec demos | S2-S8 | todo | P0 |

#### PM-001: Scope freeze Phase A — 6 US P0 gravees dans le marbre

**Status:** todo | **Priority:** P0 | **Week:** S1 | **Phase:** A

Finaliser et geler le scope Phase A. Pas d'ajout, pas de feature creep. Les 6 user stories P0 sont : creation app, cockpit DSI read-only, connect Excel, partage, souverainete, mobile.

**Notes:** Le scope freeze est sacre. Zero compromis.

**Subtasks:**
- [ ] Finaliser les 6 user stories P0 avec acceptance criteria (todo)
- [ ] Definition of Done par user story (todo)
- [ ] Scope freeze officiel communique a TOUTES les equipes (todo)
- [ ] Document scope freeze signe par les leads (todo)

#### PM-002: North Star Metric + Aha Moment — tracking setup

**Status:** todo | **Priority:** P0 | **Week:** S1-S2 | **Phase:** A

North Star: Weekly Active Apps with 2+ users. Aha Moment: app creee + partagee + 2 users < 48h. Setup tracking PostHog pour ces metriques.

**Dependencies:** INF-003

**Subtasks:**
- [ ] Documenter la North Star Metric formellement (todo)
- [ ] Definir le Aha Moment avec seuils mesurables (todo)
- [ ] Setup tracking PostHog (events + funnels) (todo)
- [ ] Dashboard metriques produit (daily/weekly/monthly) (todo)

#### PM-003: Sprint cadence — 4 sprints de 2 semaines avec demos

**Status:** todo | **Priority:** P0 | **Week:** S2-S8 | **Phase:** A

Sprints bi-hebdomadaires: planning le lundi, daily async Slack, demo le vendredi. 4 sprints en Phase A.

**Dependencies:** PM-001

**Subtasks:**
- [ ] Sprint 1 (S1-S2): fondations tech + design tokens (todo)
- [ ] Sprint 2 (S3-S4): composants core + pipeline IA etages 1-2 (todo)
- [ ] Sprint 3 (S5-S6): integration E2E + chat UI (todo)
- [ ] Sprint 4 (S7-S8): polish + perf + beta prep (todo)

### Phase B

| ID | Title | Week | Status | Priority |
| --- | --- | --- | --- | --- |
| PM-004 | Scope Phase B — priorisation RICE sur base feedback beta | S9 | todo | P0 |
| PM-005 | Spec cockpit DSI complet — permissions, analytics, kill-switch | S9-S16 | todo | P1 |

#### PM-004: Scope Phase B — priorisation RICE sur base feedback beta

**Status:** todo | **Priority:** P0 | **Week:** S9 | **Phase:** B

Definir le scope Phase B en fonction des retours beta Phase A. RICE scoring des features candidates.

**Dependencies:** PM-003

**Subtasks:**
- [ ] Analyse systematique feedback beta Phase A (todo)
- [ ] RICE scoring des 15+ features candidates (todo)
- [ ] Scope freeze Phase B (todo)
- [ ] Sprint planning S9-S16 (4 sprints) (todo)

#### PM-005: Spec cockpit DSI complet — permissions, analytics, kill-switch

**Status:** todo | **Priority:** P1 | **Week:** S9-S16 | **Phase:** B

Specification fonctionnelle detaillee du cockpit DSI avec wireframes, user stories, et tests avec 5 DSI du programme Early Access.

**Dependencies:** PM-004

**Subtasks:**
- [ ] Wireframes cockpit DSI (Figma) (todo)
- [ ] Spec fonctionnelle detaillee (15+ pages) (todo)
- [ ] User stories DSI completes (todo)
- [ ] Tests avec 5 DSI Early Access (todo)

## UX/Design (SA-07) - Lead: Lucas Martin

### Phase A

| ID | Title | Week | Status | Priority |
| --- | --- | --- | --- | --- |
| UX-001 | Wireframes onboarding — upload, prompt, preview | S1-S2 | todo | P0 |
| UX-002 | UI Kit Figma — tokens, 6 composants, patterns | S2-S4 | todo | P0 |
| UX-003 | Tests utilisateurs beta — 10 testeurs, 5 entreprises | S6-S8 | todo | P0 |

#### UX-001: Wireframes onboarding — upload, prompt, preview

**Status:** todo | **Priority:** P0 | **Week:** S1-S2 | **Phase:** A

Designer le parcours magique: Upload Excel → Decrire le besoin → Voir l'app generee. Objectif < 90 secondes.

**Notes:** Objectif: onboarding < 90 secondes, time-to-aha < 5 minutes.

**Subtasks:**
- [ ] Wireframes lo-fi: ecran upload (drag & drop) (todo)
- [ ] Wireframes lo-fi: chat de creation (split screen) (todo)
- [ ] Wireframes lo-fi: preview app generee (todo)
- [ ] Tests guerilla rapides avec 5 Ops Managers (todo)

#### UX-002: UI Kit Figma — tokens, 6 composants, patterns

**Status:** todo | **Priority:** P0 | **Week:** S2-S4 | **Phase:** A

UI Kit complet dans Figma: tokens visuels, 6 composants Phase A avec toutes les variantes, patterns d'interaction (modals, toasts, loading).

**Dependencies:** UX-001

**Subtasks:**
- [ ] Tokens Figma: couleurs, typo, spacing, radii, shadows (todo)
- [ ] 6 composants Figma avec variants (light/dark, sizes, states) (todo)
- [ ] Patterns: modals, toasts, loading skeletons, empty states (todo)
- [ ] Prototype interactif clickable (todo)

#### UX-003: Tests utilisateurs beta — 10 testeurs, 5 entreprises

**Status:** todo | **Priority:** P0 | **Week:** S6-S8 | **Phase:** A

Sessions de test avec utilisateurs reels des entreprises pilotes. 2 testeurs par persona. Protocol + synthese.

**Dependencies:** FE-005

**Subtasks:**
- [ ] Recruter 10 testeurs (2 par persona) (todo)
- [ ] Protocole de test + script detaille (todo)
- [ ] Sessions de test remote (Maze ou manual) (todo)
- [ ] Synthese + 10 recommendations actionnables (todo)

### Phase B

| ID | Title | Week | Status | Priority |
| --- | --- | --- | --- | --- |
| UX-004 | Maquettes hi-fi App Store + cockpit DSI | S9-S11 | todo | P1 |

#### UX-004: Maquettes hi-fi App Store + cockpit DSI

**Status:** todo | **Priority:** P1 | **Week:** S9-S11 | **Phase:** B

Maquettes haute fidelite pour l'App Store Netflix-like et le cockpit DSI. Mobile responsive.

**Dependencies:** UX-003

**Subtasks:**
- [ ] Maquettes App Store (accueil, recherche, detail, clone) (todo)
- [ ] Clone/fork wizard design (2 etapes max) (todo)
- [ ] Maquettes cockpit DSI (dashboard, detail, kill-switch) (todo)
- [ ] Responsive mobile (priorite: creation + consultation) (todo)

## Growth & Marketing (SA-08) - Lead: Camille Dubois

### Phase A

| ID | Title | Week | Status | Priority |
| --- | --- | --- | --- | --- |
| GR-001 | Landing page + SEO + blog setup | S1-S4 | todo | P0 |
| GR-002 | Video demo 60s — le moment magique capture | S4-S6 | todo | P0 |
| GR-003 | Beta launch — objectif 500 signups | S6-S8 | todo | P0 |

#### GR-001: Landing page + SEO + blog setup

**Status:** todo | **Priority:** P0 | **Week:** S1-S4 | **Phase:** A

Landing page positionnee "App Store Interne Gouverne". Setup SEO technique. Blog pour content marketing.

**Subtasks:**
- [ ] Landing page: hero, demo video, features, pricing, CTA (todo)
- [ ] SEO: metas, structured data, sitemap, robots.txt (todo)
- [ ] Blog setup (Next.js ou Ghost) (todo)
- [ ] Analytics: PostHog goals + UTM tracking (todo)

#### GR-002: Video demo 60s — le moment magique capture

**Status:** todo | **Priority:** P0 | **Week:** S4-S6 | **Phase:** A

Video de demo: upload Excel → description naturelle → app en 30 secondes. Asset marketing #1.

**Dependencies:** FE-005

**Notes:** A produire AVANT le lancement beta.

**Subtasks:**
- [ ] Script + storyboard (3 actes: probleme, magie, resultat) (todo)
- [ ] Capture ecran avec donnees reelles (inventaire retail) (todo)
- [ ] Montage + voiceover professionnel (todo)
- [ ] Publication YouTube + embed landing page + LinkedIn (todo)

#### GR-003: Beta launch — objectif 500 signups

**Status:** todo | **Priority:** P0 | **Week:** S6-S8 | **Phase:** A

Lancer la beta privee. 500 signups via liste d'attente, LinkedIn organique, outreach direct.

**Dependencies:** GR-001, GR-002

**Subtasks:**
- [ ] Liste d\'attente avec referral integre (bonus queue position) (todo)
- [ ] Campagne LinkedIn organique (3 posts/semaine) (todo)
- [ ] Outreach direct: 50 Ops Managers identifies en interviews (todo)
- [ ] PR: manifeste "La fin du Excel hell en entreprise" (todo)

### Phase B

| ID | Title | Week | Status | Priority |
| --- | --- | --- | --- | --- |
| GR-004 | PLG funnel AARRR + A/B tests onboarding | S9-S12 | todo | P0 |
| GR-005 | Boucles virales + referral — K-factor 0.15-0.30 | S12-S16 | todo | P1 |

#### GR-004: PLG funnel AARRR + A/B tests onboarding

**Status:** todo | **Priority:** P0 | **Week:** S9-S12 | **Phase:** B

Funnel complet Acquisition → Activation → Retention → Revenue → Referral. A/B test 3 variantes onboarding.

**Dependencies:** GR-003

**Subtasks:**
- [ ] Funnel tracking complet PostHog (todo)
- [ ] A/B test: 3 variantes page d\'accueil (todo)
- [ ] Email drip sequence 7 jours (welcome → tutorial → share) (todo)
- [ ] Activation trigger: 1ere app partagee a un collegue (todo)

#### GR-005: Boucles virales + referral — K-factor 0.15-0.30

**Status:** todo | **Priority:** P1 | **Week:** S12-S16 | **Phase:** B

Activer les 5 boucles virales: share-to-use, template clone, DSI approve-to-scale, cross-team discover, success story.

**Dependencies:** GR-004, FE-007

**Notes:** K-factor objectif: 0.15-0.30.

**Subtasks:**
- [ ] Share link avec preview visuelle de l\'app (todo)
- [ ] Template gallery publique (SEO) (todo)
- [ ] Referral: inviter un collegue → +5 apps gratuites (todo)
- [ ] Metriques K-factor par type de boucle (todo)

## Sales & GTM (SA-09) - Lead: Pierre Moreau

### Phase A

| ID | Title | Week | Status | Priority |
| --- | --- | --- | --- | --- |
| SL-001 | 50 interviews terrain + 30 LOI signees | S1-S4 | todo | P0 |
| SL-002 | Programme DSI Early Access — 20 co-createurs | S1-S4 | todo | P0 |
| SL-003 | Battle cards — Power Apps, Retool, AppSheet, Glide | S4-S8 | todo | P1 |

#### SL-001: 50 interviews terrain + 30 LOI signees

**Status:** todo | **Priority:** P0 | **Week:** S1-S4 | **Phase:** A

CONDITION #1. 50 interviews qualitatives + 30 lettres d'intention avec engagement financier. Cible: Ops Managers retail/industrie 200-1000 employes.

**Notes:** CONDITION NON-NEGOCIABLE. Pas de code avant 30 LOI.

**Subtasks:**
- [ ] Liste de 100 prospects qualifies (LinkedIn Sales Nav) (todo)
- [ ] Script d\'interview structure (30 min) (todo)
- [ ] 50 interviews realisees et documentees (todo)
- [ ] 30 LOI signees avec montant indicatif (todo)
- [ ] Synthese insights → ajustements produit (todo)

#### SL-002: Programme DSI Early Access — 20 co-createurs

**Status:** todo | **Priority:** P0 | **Week:** S1-S4 | **Phase:** A

Recruter 20 DSI co-createurs du cockpit. Programme d'acces privilegie avec benefices exclusifs.

**Subtasks:**
- [ ] Design du programme (benefices: early access, input produit, pricing prefentiel) (todo)
- [ ] Outreach 50 DSI cibles (LinkedIn + intro reseau) (todo)
- [ ] Selection et onboarding 20 DSI (todo)
- [ ] Premier workshop co-creation cockpit (visio) (todo)

#### SL-003: Battle cards — Power Apps, Retool, AppSheet, Glide

**Status:** todo | **Priority:** P1 | **Week:** S4-S8 | **Phase:** A

Documents de comparaison concurrentielle detailles pour chaque concurrent majeur.

**Dependencies:** SL-001

**Subtasks:**
- [ ] Battle card Power Apps (forces, faiblesses, objections) (todo)
- [ ] Battle card Retool (todo)
- [ ] Battle card Google AppSheet (todo)
- [ ] Battle card Glide (todo)
- [ ] Matrice de comparaison synthetique 1 page (todo)

### Phase B

| ID | Title | Week | Status | Priority |
| --- | --- | --- | --- | --- |
| SL-004 | 20 beta entreprises + validation pricing 299/mois | S9-S12 | todo | P0 |
| SL-005 | Premiers clients payants — objectif 5K MRR | S13-S16 | todo | P0 |

#### SL-004: 20 beta entreprises + validation pricing 299/mois

**Status:** todo | **Priority:** P0 | **Week:** S9-S12 | **Phase:** B

Convertir les beta testeurs en pilotes actifs. Valider le willingness-to-pay a 299/mois via 10 interviews pricing.

**Dependencies:** SL-001, GR-003

**Subtasks:**
- [ ] Selectionner 20 entreprises beta les plus actives (todo)
- [ ] Onboarding guide dedie + support Slack (todo)
- [ ] 10 interviews willingness-to-pay structurees (todo)
- [ ] Ajuster pricing si < 60% acceptation (todo)

#### SL-005: Premiers clients payants — objectif 5K MRR

**Status:** todo | **Priority:** P0 | **Week:** S13-S16 | **Phase:** B

Convertir les pilotes en clients payants Pro (299/mois). Setup CRM. Weekly pipeline reviews.

**Dependencies:** SL-004, BE-007

**Subtasks:**
- [ ] Process de conversion beta → payant (todo)
- [ ] Onboarding payant avec dedicated success manager (todo)
- [ ] CRM setup (Attio ou HubSpot) (todo)
- [ ] Weekly forecast + pipeline review discipline (todo)

## Strategy & Business (SA-10) - Lead: Isabelle Fournier

### Phase A

| ID | Title | Week | Status | Priority |
| --- | --- | --- | --- | --- |
| ST-001 | Plan financier 18 mois — bear/base/bull scenarios | S1 | todo | P0 |
| ST-002 | Pre-seed pitch deck — 15 slides + annexes | S1-S4 | todo | P0 |
| ST-003 | Recrutement CTO cofondateur — pipeline 10 candidats | S1-S2 | todo | P0 |
| ST-004 | DPA + SCCs Anthropic — couverture juridique RGPD | S1-S3 | todo | P0 |

#### ST-001: Plan financier 18 mois — bear/base/bull scenarios

**Status:** todo | **Priority:** P0 | **Week:** S1 | **Phase:** A

Modele financier detaille sur 18 mois: revenue, burn rate, runway, milestones de financement par scenario.

**Subtasks:**
- [ ] Modele financier Excel/Sheets detaille (todo)
- [ ] Scenario bear: 50% des objectifs (runway analysis) (todo)
- [ ] Scenario base: objectifs nominaux (todo)
- [ ] Scenario bull: 150% des objectifs (todo)
- [ ] Calcul runway par scenario + trigger de levee (todo)

#### ST-002: Pre-seed pitch deck — 15 slides + annexes

**Status:** todo | **Priority:** P0 | **Week:** S1-S4 | **Phase:** A

Pitch deck pre-seed: probleme, solution, demo, marche (TAM/SAM/SOM), modele, equipe, traction, ask 735K, use of funds.

**Dependencies:** ST-001

**Subtasks:**
- [ ] Narrative arc: 15 slides (probleme → solution → why now → marche → modele → equipe → ask) (todo)
- [ ] Design professionnel (Figma ou Pitch) (todo)
- [ ] Annexes: modele financier, comp table, product screenshots (todo)
- [ ] 5 rehearsals + feedback d\'angels/mentors (todo)

#### ST-003: Recrutement CTO cofondateur — pipeline 10 candidats

**Status:** todo | **Priority:** P0 | **Week:** S1-S2 | **Phase:** A

CONDITION #2. Identifier et recruter un CTO cofondateur senior: Microsoft Graph API + IA generative + infra serverless.

**Notes:** CONDITION NON-NEGOCIABLE. Sans CTO, le MVP est irrealisable.

**Subtasks:**
- [ ] Fiche de poste detaillee + package equity (todo)
- [ ] Sourcing: reseau personnel, LinkedIn, angels tech, communities (todo)
- [ ] Pipeline 10 candidats qualifies (todo)
- [ ] Entretiens techniques + culture fit (todo)
- [ ] Offre + negociation equity (10-20%) (todo)

#### ST-004: DPA + SCCs Anthropic — couverture juridique RGPD

**Status:** todo | **Priority:** P0 | **Week:** S1-S3 | **Phase:** A

CONDITION #3. Negocier et signer le Data Processing Agreement + Standard Contractual Clauses avec Anthropic.

**Notes:** CONDITION NON-NEGOCIABLE. Aucun DSI francais serieux ne signera sans.

**Subtasks:**
- [ ] Contact equipe legal/partnerships Anthropic (todo)
- [ ] Revue DPA + SCCs par avocat specialise RGPD (todo)
- [ ] Negociation clauses specifiques (data residency, sub-processors) (todo)
- [ ] Signature DPA + SCCs (todo)

### Phase B

| ID | Title | Week | Status | Priority |
| --- | --- | --- | --- | --- |
| ST-005 | Preparation Seed — data room, pitch V2, pipeline VCs | S9-S16 | todo | P1 |

#### ST-005: Preparation Seed — data room, pitch V2, pipeline VCs

**Status:** todo | **Priority:** P1 | **Week:** S9-S16 | **Phase:** B

Preparer la levee Seed 1.5-2.5M: data room complete, pitch deck V2 avec metriques, pipeline 30 VCs/angels.

**Dependencies:** ST-002, SL-005

**Subtasks:**
- [ ] Data room complete (financials, legal, product, team) (todo)
- [ ] Pitch deck Seed V2 (metriques reelles) (todo)
- [ ] Pipeline 30 VCs/angels qualifies (todo)
- [ ] Roadshow planning M9-M12 (todo)

---

<details>
<summary>Original HTML Source (for interactive features)</summary>

```html
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>INSTACK — Project Tracker</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;450;500;600;700;800&display=swap" rel="stylesheet">
<style>
/* ══════════════════════════════════════
   LINEAR-INSPIRED LIGHT THEME
   ══════════════════════════════════════ */
:root {
  --bg-app:#ffffff;
  --bg-sidebar:#f9fafb;
  --bg-hover:#f3f4f6;
  --bg-active:#eff6ff;
  --bg-surface:#f9fafb;
  --bg-overlay:rgba(0,0,0,0.04);
  --border:#e5e7eb;
  --border-subtle:#f3f4f6;
  --text-primary:#111827;
  --text-secondary:#6b7280;
  --text-tertiary:#9ca3af;
  --text-quaternary:#d1d5db;
  --accent:#5e6ad2;
  --accent-hover:#4f5bc0;
  --accent-subtle:rgba(94,106,210,0.08);
  --accent-muted:rgba(94,106,210,0.15);
  /* status */
  --s-backlog:#e5e7eb;
  --s-todo:#9ca3af;
  --s-progress:#f59e0b;
  --s-review:#8b5cf6;
  --s-done:#22c55e;
  --s-blocked:#ef4444;
  /* priority */
  --p-urgent:#ef4444;
  --p-high:#f97316;
  --p-medium:#eab308;
  --p-low:#6b7280;
  /* teams */
  --t-backend:#3b82f6;
  --t-frontend:#8b5cf6;
  --t-ai:#06b6d4;
  --t-infra:#10b981;
  --t-security:#f59e0b;
  --t-product:#ec4899;
  --t-ux:#a855f7;
  --t-growth:#f97316;
  --t-sales:#ef4444;
  --t-strategy:#14b8a6;
}
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg-app);color:var(--text-primary);line-height:1.5;-webkit-font-smoothing:antialiased;font-feature-settings:'cv02','cv03','cv04','cv11';overflow:hidden;height:100vh;}
::selection{background:var(--accent-muted);color:var(--accent);}

/* ─── LAYOUT ─── */
.app{display:grid;grid-template-columns:240px 1fr;grid-template-rows:1fr;height:100vh;}
.app.detail-open{grid-template-columns:240px 1fr 480px;}

/* ─── SIDEBAR ─── */
.sidebar{background:var(--bg-sidebar);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow-y:auto;user-select:none;}
.sb-header{padding:16px 16px 12px;display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--border-subtle);}
.sb-logo{width:28px;height:28px;border-radius:7px;background:linear-gradient(135deg,#5e6ad2,#8b5cf6);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:11px;letter-spacing:-0.3px;}
.sb-title{font-size:14px;font-weight:700;color:var(--text-primary);letter-spacing:-0.2px;}

.sb-section{padding:8px 8px 4px;}
.sb-label{font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;color:var(--text-tertiary);padding:8px 10px 6px;user-select:none;}

.sb-item{display:flex;align-items:center;gap:9px;padding:6px 10px;border-radius:6px;font-size:13px;font-weight:500;color:var(--text-secondary);cursor:pointer;transition:all .1s;position:relative;}
.sb-item:hover{background:var(--bg-hover);color:var(--text-primary);}
.sb-item.active{background:var(--accent-subtle);color:var(--accent);font-weight:600;}
.sb-item .sb-icon{width:16px;height:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.sb-item .sb-count{margin-left:auto;font-size:11px;font-weight:600;color:var(--text-tertiary);min-width:20px;text-align:right;}
.sb-item.active .sb-count{color:var(--accent);}
.sb-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}

.sb-divider{height:1px;background:var(--border-subtle);margin:6px 16px;}

/* ─── MAIN PANEL ─── */
.main-panel{display:flex;flex-direction:column;overflow:hidden;background:var(--bg-app);}

/* Toolbar */
.toolbar{padding:12px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;flex-shrink:0;min-height:49px;}
.tb-breadcrumb{font-size:13px;font-weight:600;color:var(--text-primary);display:flex;align-items:center;gap:6px;}
.tb-breadcrumb .sep{color:var(--text-quaternary);font-weight:400;}
.tb-breadcrumb .muted{color:var(--text-tertiary);font-weight:500;}
.tb-spacer{flex:1;}
.tb-group{display:flex;align-items:center;gap:2px;background:var(--bg-surface);border:1px solid var(--border);border-radius:6px;padding:2px;}
.tb-btn{padding:4px 10px;border-radius:4px;font-size:12px;font-weight:500;color:var(--text-secondary);cursor:pointer;border:none;background:none;transition:.1s;white-space:nowrap;}
.tb-btn:hover{color:var(--text-primary);background:var(--bg-hover);}
.tb-btn.on{color:var(--text-primary);background:var(--bg-app);box-shadow:0 1px 2px rgba(0,0,0,0.06);font-weight:600;}
.tb-filter{padding:5px 12px;border-radius:6px;font-size:12px;font-weight:500;color:var(--text-secondary);cursor:pointer;border:1px solid var(--border);background:var(--bg-app);transition:.1s;display:flex;align-items:center;gap:5px;}
.tb-filter:hover{background:var(--bg-hover);color:var(--text-primary);}
.tb-filter svg{width:14px;height:14px;}

/* ─── ISSUE LIST ─── */
.issue-list{flex:1;overflow-y:auto;padding-bottom:40px;}

/* Group header */
.group-header{padding:6px 24px;background:var(--bg-surface);border-bottom:1px solid var(--border-subtle);border-top:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;position:sticky;top:0;z-index:10;cursor:pointer;user-select:none;}
.group-header:first-child{border-top:none;}
.group-header .gh-chevron{width:16px;height:16px;color:var(--text-tertiary);transition:transform .15s;display:flex;align-items:center;justify-content:center;}
.group-header.collapsed .gh-chevron{transform:rotate(-90deg);}
.group-header .gh-dot{width:8px;height:8px;border-radius:50%;}
.group-header .gh-name{font-size:13px;font-weight:600;color:var(--text-primary);}
.group-header .gh-count{font-size:11px;font-weight:600;color:var(--text-tertiary);background:var(--bg-app);padding:1px 8px;border-radius:10px;}
.group-header .gh-pct{font-size:11px;font-weight:600;margin-left:auto;}
.group-header .gh-bar{width:80px;height:3px;background:var(--border);border-radius:2px;overflow:hidden;margin-left:8px;}
.group-header .gh-fill{height:100%;border-radius:2px;transition:width .3s;}

/* Issue row */
.issue-row{display:flex;align-items:center;gap:0;padding:0 24px;height:40px;border-bottom:1px solid var(--border-subtle);cursor:pointer;transition:background .08s;font-size:13px;}
.issue-row:hover{background:var(--bg-hover);}
.issue-row.selected{background:var(--accent-subtle);}

.ir-status{width:32px;flex-shrink:0;display:flex;align-items:center;justify-content:center;}
.status-icon{width:16px;height:16px;border-radius:50%;border:2px solid;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.1s;}
.status-icon:hover{transform:scale(1.15);}
.status-icon.todo{border-color:var(--s-todo);}
.status-icon.progress{border-color:var(--s-progress);border-style:solid;border-top-color:transparent;animation:none;background:conic-gradient(var(--s-progress) 0deg,var(--s-progress) 180deg,transparent 180deg);}
.status-icon.progress{border:2px solid var(--s-progress);background:none;position:relative;}
.status-icon.progress::after{content:'';position:absolute;width:6px;height:6px;border-radius:50%;background:var(--s-progress);}
.status-icon.done{border-color:var(--s-done);background:var(--s-done);}
.status-icon.done::after{content:'';width:5px;height:8px;border:solid #fff;border-width:0 1.5px 1.5px 0;transform:rotate(45deg) translate(-0.5px,-1px);}
.status-icon.blocked{border-color:var(--s-blocked);background:var(--s-blocked);}
.status-icon.blocked::after{content:'';width:8px;height:1.5px;background:#fff;border-radius:1px;}

.ir-priority{width:28px;flex-shrink:0;display:flex;align-items:center;justify-content:center;}
.priority-icon{display:flex;flex-direction:column;gap:1.5px;align-items:center;}
.priority-icon .bar{width:3px;border-radius:1px;}
.priority-icon.P0 .bar{background:var(--p-urgent);}
.priority-icon.P1 .bar{background:var(--p-high);}
.priority-icon.P2 .bar{background:var(--p-medium);}

.ir-id{width:72px;flex-shrink:0;font-size:12px;font-weight:500;color:var(--text-tertiary);font-variant-numeric:tabular-nums;}
.ir-title{flex:1;font-size:13px;font-weight:500;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-right:12px;}
.issue-row.status-done .ir-title{color:var(--text-tertiary);text-decoration:line-through;}

.ir-labels{display:flex;gap:4px;flex-shrink:0;margin-right:12px;}
.ir-label{padding:1px 8px;border-radius:10px;font-size:10.5px;font-weight:600;white-space:nowrap;}

.ir-week{width:64px;flex-shrink:0;font-size:12px;font-weight:500;color:var(--text-tertiary);text-align:right;}
.ir-subtasks{width:56px;flex-shrink:0;font-size:11px;font-weight:500;color:var(--text-tertiary);text-align:right;display:flex;align-items:center;justify-content:flex-end;gap:4px;}
.ir-subtasks svg{width:12px;height:12px;}
.ir-assignee{width:28px;flex-shrink:0;display:flex;justify-content:center;}
.ir-avatar{width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:#fff;}

/* ─── DETAIL PANEL ─── */
.detail-panel{border-left:1px solid var(--border);background:var(--bg-app);display:flex;flex-direction:column;overflow:hidden;animation:slideIn .2s ease;}
@keyframes slideIn{from{opacity:0;transform:translateX(16px);}to{opacity:1;transform:translateX(0);}}

.dp-header{padding:16px 24px 12px;border-bottom:1px solid var(--border);display:flex;align-items:flex-start;gap:12px;flex-shrink:0;}
.dp-close{width:28px;height:28px;border-radius:6px;border:1px solid var(--border);background:var(--bg-app);cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--text-tertiary);transition:.1s;flex-shrink:0;font-size:16px;line-height:1;}
.dp-close:hover{background:var(--bg-hover);color:var(--text-primary);}
.dp-header-info{flex:1;}
.dp-id{font-size:12px;font-weight:500;color:var(--text-tertiary);}
.dp-title{font-size:17px;font-weight:700;color:var(--text-primary);letter-spacing:-0.3px;margin-top:2px;line-height:1.35;}

.dp-body{flex:1;overflow-y:auto;padding:20px 24px;}
.dp-meta-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px 20px;margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--border-subtle);}
.dp-meta-item .dp-ml{font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--text-tertiary);margin-bottom:3px;}
.dp-meta-item .dp-mv{font-size:13px;font-weight:500;color:var(--text-primary);display:flex;align-items:center;gap:6px;}
.dp-mv .status-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}

.dp-section{margin-bottom:24px;}
.dp-section-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--text-tertiary);margin-bottom:10px;display:flex;align-items:center;gap:8px;}
.dp-section-title::after{content:'';flex:1;height:1px;background:var(--border-subtle);}

.dp-desc{font-size:13.5px;color:var(--text-secondary);line-height:1.65;}

.dp-subtask-list{display:flex;flex-direction:column;gap:2px;}
.dp-subtask{display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:6px;font-size:13px;color:var(--text-secondary);transition:.08s;}
.dp-subtask:hover{background:var(--bg-hover);}
.dp-subtask .sub-check{width:16px;height:16px;border-radius:4px;border:1.5px solid var(--text-quaternary);display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;transition:.1s;}
.dp-subtask .sub-check:hover{border-color:var(--accent);}
.dp-subtask.sub-done .sub-check{background:var(--s-done);border-color:var(--s-done);}
.dp-subtask.sub-done .sub-check::after{content:'';width:4px;height:7px;border:solid #fff;border-width:0 1.5px 1.5px 0;transform:rotate(45deg) translate(-0.5px,-0.5px);}
.dp-subtask.sub-done .sub-text{color:var(--text-tertiary);text-decoration:line-through;}
.dp-subtask.sub-progress .sub-check{border-color:var(--s-progress);}
.dp-subtask.sub-progress .sub-check::after{content:'';width:6px;height:6px;border-radius:50%;background:var(--s-progress);}
.dp-progress-bar{height:4px;background:var(--border);border-radius:2px;overflow:hidden;margin-top:8px;}
.dp-progress-fill{height:100%;border-radius:2px;background:var(--s-done);transition:width .3s;}

.dp-deps{display:flex;flex-wrap:wrap;gap:6px;}
.dp-dep{padding:3px 10px;border-radius:6px;font-size:12px;font-weight:500;background:var(--bg-surface);border:1px solid var(--border);color:var(--text-secondary);cursor:pointer;transition:.1s;}
.dp-dep:hover{border-color:var(--accent);color:var(--accent);}

.dp-note{padding:12px 14px;background:#fefce8;border:1px solid #fef08a;border-radius:8px;font-size:12.5px;color:#854d0e;line-height:1.55;}

.dp-status-actions{display:flex;gap:6px;margin-top:6px;}
.dp-sa{padding:6px 14px;border-radius:6px;font-size:12px;font-weight:600;border:1px solid var(--border);background:var(--bg-app);color:var(--text-secondary);cursor:pointer;transition:.1s;}
.dp-sa:hover{background:var(--bg-hover);color:var(--text-primary);}
.dp-sa.primary{background:var(--accent);color:#fff;border-color:var(--accent);}
.dp-sa.primary:hover{background:var(--accent-hover);}

/* Column header */
.col-header{display:flex;align-items:center;gap:0;padding:0 24px;height:32px;border-bottom:1px solid var(--border);background:var(--bg-surface);font-size:11px;font-weight:600;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:.4px;position:sticky;top:0;z-index:11;}
.col-header .ir-status,.col-header .ir-priority{text-align:center;}

/* Empty state */
.empty-state{padding:80px 24px;text-align:center;color:var(--text-tertiary);}
.empty-state .es-icon{font-size:40px;margin-bottom:12px;opacity:.4;}
.empty-state .es-text{font-size:14px;font-weight:500;}

/* scrollbar */
::-webkit-scrollbar{width:6px;height:6px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px;}
::-webkit-scrollbar-thumb:hover{background:var(--text-quaternary);}

/* ─── GANTT VIEW ─── */
.gantt-container{flex:1;overflow:auto;display:flex;flex-direction:column;}
.gantt-toolbar{padding:12px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px;flex-wrap:wrap;flex-shrink:0;}
.gantt-chip{padding:4px 12px;border-radius:16px;font-size:12px;font-weight:600;cursor:pointer;border:1.5px solid var(--border);background:var(--bg-app);color:var(--text-secondary);transition:.12s;white-space:nowrap;display:flex;align-items:center;gap:6px;}
.gantt-chip:hover{border-color:var(--text-quaternary);color:var(--text-primary);}
.gantt-chip.active{border-color:currentColor;background:currentColor;color:#fff !important;}
.gantt-chip .gc-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}
.gantt-chip.active .gc-dot{background:#fff !important;}
.gantt-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--text-tertiary);margin-right:4px;}

.gantt-scroll{flex:1;overflow:auto;position:relative;}
.gantt-grid{display:grid;min-width:1200px;}
.gantt-header-row{display:contents;}
.gantt-header-row .gh-cell{position:sticky;top:0;z-index:5;background:var(--bg-surface);border-bottom:1px solid var(--border);padding:8px 4px;text-align:center;font-size:11px;font-weight:700;color:var(--text-tertiary);}
.gantt-header-row .gh-cell-label{position:sticky;top:0;left:0;z-index:6;background:var(--bg-surface);border-bottom:1px solid var(--border);border-right:1px solid var(--border);padding:8px 12px;font-size:11px;font-weight:700;color:var(--text-tertiary);min-width:260px;}
.gantt-phase-row{display:contents;}
.gantt-phase-row .gp-cell{background:var(--bg-surface);border-bottom:1px solid var(--border-subtle);padding:4px;position:relative;}
.gantt-phase-row .gp-label{position:sticky;left:0;z-index:4;background:var(--bg-surface);border-right:1px solid var(--border);border-bottom:1px solid var(--border-subtle);padding:6px 12px;font-size:12px;font-weight:700;color:var(--accent);display:flex;align-items:center;gap:8px;}
.gantt-task-row{display:contents;}
.gantt-task-row .gt-cell{border-bottom:1px solid var(--border-subtle);padding:3px 2px;position:relative;min-height:32px;}
.gantt-task-row .gt-label{position:sticky;left:0;z-index:3;background:var(--bg-app);border-right:1px solid var(--border);border-bottom:1px solid var(--border-subtle);padding:4px 12px;display:flex;align-items:center;gap:8px;font-size:12.5px;cursor:pointer;transition:background .08s;}
.gantt-task-row .gt-label:hover{background:var(--bg-hover);}
.gantt-task-row .gt-id{font-size:11px;font-weight:500;color:var(--text-tertiary);min-width:52px;}
.gantt-task-row .gt-title{font-weight:500;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;}
.gantt-task-row .gt-status{width:14px;height:14px;border-radius:50%;border:2px solid;flex-shrink:0;}
.gantt-task-row .gt-status.todo{border-color:var(--s-todo);}
.gantt-task-row .gt-status.progress{border-color:var(--s-progress);}
.gantt-task-row .gt-status.progress::after{content:'';position:absolute;width:5px;height:5px;border-radius:50%;background:var(--s-progress);top:50%;left:50%;transform:translate(-50%,-50%);}
.gantt-task-row .gt-status.done{border-color:var(--s-done);background:var(--s-done);}
.gantt-task-row .gt-status.blocked{border-color:var(--s-blocked);background:var(--s-blocked);}
.gantt-bar{position:absolute;top:50%;transform:translateY(-50%);height:22px;border-radius:5px;display:flex;align-items:center;padding:0 8px;font-size:10px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;transition:opacity .12s,box-shadow .12s;box-shadow:0 1px 3px rgba(0,0,0,0.08);}
.gantt-bar:hover{opacity:.88;box-shadow:0 2px 8px rgba(0,0,0,0.15);}
.gantt-bar.status-done{opacity:.5;}
.gantt-bar.status-blocked{background-image:repeating-linear-gradient(45deg,transparent,transparent 4px,rgba(255,255,255,0.15) 4px,rgba(255,255,255,0.15) 8px);}
.gantt-today{position:absolute;top:0;bottom:0;width:2px;background:var(--s-blocked);z-index:2;pointer-events:none;}
.gantt-today::before{content:'Auj.';position:absolute;top:0;left:-12px;font-size:9px;font-weight:700;color:var(--s-blocked);white-space:nowrap;}
.gantt-week-col{border-right:1px solid var(--border-subtle);}
.gantt-week-col:nth-child(even){background:rgba(0,0,0,0.008);}
.gantt-dep-line{position:absolute;pointer-events:none;z-index:1;}

/* Gantt SVG overlay for arrows */
.gantt-svg-overlay{position:absolute;top:0;left:0;pointer-events:none;z-index:5;overflow:visible;}
.gantt-svg-overlay .dep-arrow{fill:none;stroke:var(--accent);stroke-width:1.8;stroke-dasharray:6 3;opacity:.5;marker-end:url(#arrowhead-accent);stroke-linejoin:round;stroke-linecap:round;transition:all .35s ease;}
.gantt-svg-overlay .dep-arrow.critical{stroke:#ef4444;stroke-width:2.2;stroke-dasharray:none;opacity:.45;marker-end:url(#arrowhead-critical);}
/* ── HIGHLIGHT: selected task's inter-team arrows ── */
.gantt-svg-overlay .dep-arrow.highlight{
  opacity:1 !important;stroke-width:4 !important;stroke:#2563eb !important;
  stroke-dasharray:none !important;
  filter:drop-shadow(0 0 8px rgba(37,99,235,0.7)) drop-shadow(0 0 18px rgba(37,99,235,0.35)) !important;
  marker-end:url(#arrowhead-highlight) !important;
}
.gantt-svg-overlay .dep-arrow.critical.highlight{
  opacity:1 !important;stroke-width:4.5 !important;stroke:#ef4444 !important;
  stroke-dasharray:none !important;
  animation:criticalPulse 1.4s ease-in-out infinite !important;
  filter:drop-shadow(0 0 10px rgba(239,68,68,0.8)) drop-shadow(0 0 22px rgba(239,68,68,0.4)) !important;
  marker-end:url(#arrowhead-critical-hl) !important;
}
/* Dim everything else when a task is selected */
.gantt-svg-overlay.has-selection .dep-arrow:not(.highlight){opacity:.08 !important;stroke-width:.8 !important;filter:none !important;}
@keyframes criticalPulse{
  0%,100%{opacity:1;filter:drop-shadow(0 0 10px rgba(239,68,68,0.8)) drop-shadow(0 0 22px rgba(239,68,68,0.4));}
  50%{opacity:.65;filter:drop-shadow(0 0 18px rgba(239,68,68,1)) drop-shadow(0 0 30px rgba(239,68,68,0.6));}
}

/* Critical path bar highlight */
.gantt-bar.critical{box-shadow:0 0 0 2px #ef4444,0 2px 10px rgba(239,68,68,0.25) !important;z-index:3;}
.gantt-bar.critical::before{content:'';position:absolute;inset:-3px;border-radius:8px;border:1.5px dashed rgba(239,68,68,0.4);pointer-events:none;}
/* Dim non-connected bars when a task is selected */
.gantt-bar.dimmed{opacity:.15 !important;transition:opacity .35s;}
.gantt-bar.focused{z-index:6;box-shadow:0 0 0 3px #2563eb,0 2px 16px rgba(37,99,235,0.5) !important;opacity:1 !important;transition:all .25s ease;}
.gantt-bar.focused.critical{box-shadow:0 0 0 3px #ef4444,0 2px 16px rgba(239,68,68,0.5) !important;}

/* Gantt drawer overlay — collapsible */
.gantt-drawer-overlay{position:fixed;top:0;right:0;bottom:0;width:420px;z-index:100;display:flex;flex-direction:column;background:var(--bg-app);border-left:1px solid var(--border);box-shadow:-8px 0 30px rgba(0,0,0,0.08);animation:slideIn .2s ease;transition:width .25s ease,transform .25s ease;}
.gantt-drawer-overlay.collapsed{width:52px;overflow:hidden;cursor:pointer;}
.gantt-drawer-overlay.collapsed .dp-body,
.gantt-drawer-overlay.collapsed .dp-header-info,
.gantt-drawer-overlay.collapsed .dp-close,
.gantt-drawer-overlay.collapsed .gantt-drawer-collapse{display:none;}
.gantt-drawer-overlay.collapsed .dp-header{flex-direction:column;align-items:center;padding:16px 8px;border:none;gap:0;}
.gantt-drawer-overlay.collapsed .gantt-drawer-collapsed-strip{display:flex;}
.gantt-drawer-collapsed-strip{display:none;flex-direction:column;align-items:center;gap:8px;padding:12px 0;flex:1;overflow:hidden;}
.gantt-drawer-collapsed-strip .strip-id{writing-mode:vertical-rl;text-orientation:mixed;font-size:12px;font-weight:700;color:var(--accent);letter-spacing:0.5px;}
.gantt-drawer-collapsed-strip .strip-title{writing-mode:vertical-rl;text-orientation:mixed;font-size:11px;font-weight:500;color:var(--text-secondary);max-height:300px;overflow:hidden;text-overflow:ellipsis;}
.gantt-drawer-collapsed-strip .strip-status{width:10px;height:10px;border-radius:50%;flex-shrink:0;}
.gantt-drawer-collapse{width:28px;height:28px;border-radius:6px;border:1px solid var(--border);background:var(--bg-app);cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--text-tertiary);transition:.1s;flex-shrink:0;font-size:14px;}
.gantt-drawer-collapse:hover{background:var(--bg-hover);color:var(--text-primary);}
.gantt-drawer-backdrop{display:none;}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}

/* ── Sequence (execution order) view — Linear-style ── */
.seq-wrapper{display:flex;flex-direction:column;flex:1;min-height:0;overflow:hidden;}
.seq-toolbar{padding:12px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;flex-wrap:wrap;flex-shrink:0;background:var(--bg-app);}
.seq-scroll{flex:1;overflow-y:auto;overflow-x:hidden;}
.seq-container{padding:0 0 60px;}
.seq-stats{display:flex;gap:14px;font-size:11px;font-weight:600;color:var(--text-tertiary);}
.seq-stats span{display:flex;align-items:center;gap:4px;}
.seq-stats .dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}

/* Week group header */
.seq-week-group{border-bottom:1px solid var(--border-subtle);}
.seq-week-header{display:flex;align-items:center;gap:10px;padding:10px 24px 6px;position:sticky;top:0;background:var(--bg-app);z-index:3;}
.seq-week-badge{font-size:11px;font-weight:800;color:#fff;padding:2px 10px;border-radius:6px;letter-spacing:.3px;}
.seq-week-phase{font-size:11px;font-weight:600;color:var(--text-tertiary);}
.seq-week-count{font-size:10px;font-weight:500;color:var(--text-quaternary);margin-left:auto;}

/* Task row — Linear-style flat row */
.seq-row{display:flex;align-items:center;gap:0;padding:0 24px;border-bottom:1px solid var(--border-subtle);height:44px;cursor:pointer;transition:background .1s;}
.seq-row:hover{background:var(--bg-hover);}
.seq-row.is-done{opacity:.45;}
.seq-row.is-done:hover{opacity:.7;}
.seq-row.is-blocked{background:rgba(239,68,68,0.02);}

/* Status icon button */
.seq-status-btn{width:28px;height:28px;border-radius:6px;border:none;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:.12s;position:relative;}
.seq-status-btn:hover{background:var(--bg-hover);}
.seq-status-btn svg{transition:transform .15s;}

/* Step number */
.seq-step-num{width:24px;font-size:10px;font-weight:700;color:var(--text-quaternary);text-align:center;flex-shrink:0;}

/* Task ID */
.seq-row-id{width:72px;font-size:11px;font-weight:700;color:var(--text-tertiary);font-family:'SF Mono',monospace;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;}
.seq-row-id.crit{color:var(--s-blocked);}

/* Title */
.seq-row-title{flex:1;font-size:13px;font-weight:500;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 12px;}
.seq-row.is-done .seq-row-title{text-decoration:line-through;color:var(--text-tertiary);}

/* Priority pill */
.seq-prio{font-size:10px;font-weight:700;padding:1px 6px;border-radius:4px;flex-shrink:0;margin-right:8px;}
.seq-prio.p0{background:rgba(239,68,68,0.1);color:var(--s-blocked);}
.seq-prio.p1{background:rgba(245,158,11,0.1);color:#d97706;}
.seq-prio.p2{background:rgba(0,0,0,0.04);color:var(--text-tertiary);}

/* Team chip */
.seq-team{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:600;flex-shrink:0;padding:2px 8px;border-radius:10px;background:var(--bg-surface);margin-right:8px;}
.seq-team .dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}

/* Deps indicator */
.seq-deps-ind{font-size:10px;font-weight:600;color:var(--text-quaternary);flex-shrink:0;margin-right:8px;display:flex;align-items:center;gap:3px;}
.seq-deps-ind .cross-badge{color:var(--accent);font-weight:700;}

/* Week label */
.seq-row-week{font-size:10px;font-weight:600;color:var(--text-quaternary);width:48px;text-align:right;flex-shrink:0;}

/* Subtask count */
.seq-row-sub{font-size:10px;color:var(--text-quaternary);width:40px;text-align:right;flex-shrink:0;}

/* Critical badge */
.seq-crit-dot{width:6px;height:6px;border-radius:50%;background:var(--s-blocked);flex-shrink:0;margin-right:4px;}

/* Status cycle animation */
@keyframes seqPop{0%{transform:scale(1);}50%{transform:scale(1.3);}100%{transform:scale(1);}}
.seq-status-btn.pop svg{animation:seqPop .25s ease;}

/* Legend */
.gantt-legend{display:flex;align-items:center;gap:16px;padding:0 8px;margin-left:auto;}
.gantt-legend-item{display:flex;align-items:center;gap:5px;font-size:10.5px;font-weight:600;color:var(--text-tertiary);}
.gantt-legend-line{width:20px;height:0;border-top:2px solid;}
.gantt-legend-line.dep{border-color:var(--text-quaternary);}
.gantt-legend-line.cross{border-color:var(--accent);border-style:dashed;}
.gantt-legend-line.crit{border-color:var(--s-blocked);border-width:2.5px;}

.sb-action-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:5px;padding:6px 8px;border-radius:6px;font-size:11px;font-weight:600;font-family:inherit;color:var(--text-secondary);background:var(--bg-app);border:1px solid var(--border);cursor:pointer;transition:.12s;}
.sb-action-btn:hover{background:var(--bg-hover);color:var(--text-primary);border-color:var(--text-quaternary);}

@media(max-width:900px){
  .app{grid-template-columns:1fr !important;}
  .sidebar{display:none;}
  .detail-panel{position:fixed;right:0;top:0;bottom:0;width:100%;z-index:200;box-shadow:-8px 0 30px rgba(0,0,0,0.1);}
}
</style>
</head>
<body>
<div class="app" id="app">

<!-- ═══ SIDEBAR ═══ -->
<div class="sidebar">
  <div class="sb-header">
    <div class="sb-logo">IN</div>
    <div class="sb-title">Instack MVP</div>
  </div>

  <div class="sb-section">
    <div class="sb-label">Vues</div>
    <div class="sb-item active" data-view="all" onclick="setView('all',this)">
      <div class="sb-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor" opacity=".6"/><rect x="9" y="2" width="5" height="5" rx="1" fill="currentColor" opacity=".6"/><rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor" opacity=".6"/><rect x="9" y="9" width="5" height="5" rx="1" fill="currentColor" opacity=".3"/></svg></div>
      Toutes les taches
      <span class="sb-count" id="countAll"></span>
    </div>
    <div class="sb-item" data-view="active" onclick="setView('active',this)">
      <div class="sb-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" stroke="var(--s-progress)" stroke-width="2" fill="none"/><circle cx="8" cy="8" r="2" fill="var(--s-progress)"/></svg></div>
      En cours
      <span class="sb-count" id="countActive"></span>
    </div>
    <div class="sb-item" data-view="blocked" onclick="setView('blocked',this)">
      <div class="sb-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" stroke="var(--s-blocked)" stroke-width="2" fill="none"/><line x1="5" y1="8" x2="11" y2="8" stroke="var(--s-blocked)" stroke-width="2" stroke-linecap="round"/></svg></div>
      Bloquees
      <span class="sb-count" id="countBlocked"></span>
    </div>
    <div class="sb-item" data-view="done" onclick="setView('done',this)">
      <div class="sb-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" fill="var(--s-done)" opacity=".15"/><path d="M5.5 8L7.2 9.7L10.5 6.3" stroke="var(--s-done)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      Terminees
      <span class="sb-count" id="countDone"></span>
    </div>

    <div class="sb-divider"></div>
    <div class="sb-item" data-view="gantt" onclick="setView('gantt',this)">
      <div class="sb-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="2" width="8" height="2.5" rx="1" fill="currentColor" opacity=".7"/><rect x="5" y="6" width="7" height="2.5" rx="1" fill="currentColor" opacity=".5"/><rect x="2" y="10" width="10" height="2.5" rx="1" fill="currentColor" opacity=".35"/></svg></div>
      Gantt Timeline
    </div>
    <div class="sb-item" data-view="sequence" onclick="setView('sequence',this)">
      <div class="sb-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 3h8M4 6.5h8M4 10h8M4 13.5h8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="2" cy="3" r="1" fill="currentColor"/><circle cx="2" cy="6.5" r="1" fill="currentColor"/><circle cx="2" cy="10" r="1" fill="currentColor"/><circle cx="2" cy="13.5" r="1" fill="currentColor"/></svg></div>
      Ordre d'execution
    </div>
  </div>

  <div class="sb-divider"></div>

  <div class="sb-section">
    <div class="sb-label">Equipes</div>
    <div id="sbTeams"></div>
  </div>

  <div class="sb-divider"></div>

  <div class="sb-section">
    <div class="sb-label">Phases</div>
    <div class="sb-item" data-view="phaseA" onclick="setView('phaseA',this)">
      <div class="sb-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><text x="3" y="12" font-size="10" font-weight="700" fill="var(--accent)">A</text></svg></div>
      Phase A &mdash; S1-S8
    </div>
    <div class="sb-item" data-view="phaseB" onclick="setView('phaseB',this)">
      <div class="sb-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><text x="3" y="12" font-size="10" font-weight="700" fill="var(--t-infra)">B</text></svg></div>
      Phase B &mdash; S9-S16
    </div>
  </div>

  <div style="flex:1;"></div>
  <div style="padding:12px 12px;border-top:1px solid var(--border-subtle);display:flex;flex-direction:column;gap:6px;">
    <div style="display:flex;gap:6px;">
      <button onclick="exportJSON()" class="sb-action-btn" title="Exporter l'etat en JSON">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2v8M8 10l-3-3M8 10l3-3M3 13h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Exporter
      </button>
      <button onclick="document.getElementById('importFile').click()" class="sb-action-btn" title="Importer un fichier JSON">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 10V2M8 2l-3 3M8 2l3 3M3 13h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Importer
      </button>
      <input type="file" id="importFile" accept=".json" style="display:none;" onchange="importJSON(event)">
    </div>
    <div id="saveIndicator" style="font-size:10px;color:var(--text-tertiary);text-align:center;transition:color .3s;">Sauvegarde auto active</div>
  </div>
</div>

<!-- ═══ MAIN ═══ -->
<div class="main-panel">
  <div class="toolbar" id="toolbar"></div>
  <div class="col-header">
    <div class="ir-status" style="width:32px;">St</div>
    <div class="ir-priority" style="width:28px;">Pr</div>
    <div class="ir-id" style="width:72px;">ID</div>
    <div style="flex:1;">Titre</div>
    <div style="width:64px;text-align:right;">Semaine</div>
    <div style="width:56px;text-align:right;">Sub</div>
    <div style="width:28px;"></div>
  </div>
  <div class="issue-list" id="issueList"></div>
</div>

<!-- ═══ DETAIL PANEL (injected dynamically) ═══ -->

</div>

<script>
// ══════════════════════════════════════════
//  DATA
// ══════════════════════════════════════════
const TEAMS=[
  {id:'backend',name:'Backend & API',short:'Backend',lead:'Alexandre Duval',code:'SA-01',color:'var(--t-backend)',hex:'#3b82f6'},
  {id:'frontend',name:'Frontend & Design System',short:'Frontend',lead:'Marie Chen',code:'SA-02',color:'var(--t-frontend)',hex:'#8b5cf6'},
  {id:'ai',name:'AI/ML Pipeline',short:'AI/ML',lead:'Karim Benali',code:'SA-03',color:'var(--t-ai)',hex:'#06b6d4'},
  {id:'infra',name:'Infrastructure & DevOps',short:'Infra',lead:'Sophie Laurent',code:'SA-04',color:'var(--t-infra)',hex:'#10b981'},
  {id:'security',name:'Security & Compliance',short:'Security',lead:'Thomas Weber',code:'SA-05',color:'var(--t-security)',hex:'#f59e0b'},
  {id:'product',name:'Product Management',short:'Product',lead:'Elena Rossi',code:'SA-06',color:'var(--t-product)',hex:'#ec4899'},
  {id:'ux',name:'UX/Design',short:'UX',lead:'Lucas Martin',code:'SA-07',color:'var(--t-ux)',hex:'#a855f7'},
  {id:'growth',name:'Growth & Marketing',short:'Growth',lead:'Camille Dubois',code:'SA-08',color:'var(--t-growth)',hex:'#f97316'},
  {id:'sales',name:'Sales & GTM',short:'Sales',lead:'Pierre Moreau',code:'SA-09',color:'var(--t-sales)',hex:'#ef4444'},
  {id:'strategy',name:'Strategy & Business',short:'Strategy',lead:'Isabelle Fournier',code:'SA-10',color:'var(--t-strategy)',hex:'#14b8a6'}
];

const TASKS=[
  // ═══ BACKEND ═══
  {id:'BE-001',team:'backend',phase:'A',week:'S1-S2',title:'Schema PostgreSQL multi-tenant + RLS',status:'todo',priority:'P0',
    desc:'Creer le schema complet PostgreSQL avec Row Level Security par tenant_id. Tables: tenants, users, apps, app_components, data_sources, context_graph (JSONB), audit_logs, sessions.',
    subtasks:[{t:'Definir le schema DDL complet (8 tables)',s:'todo'},{t:'Implementer les RLS policies par tenant_id',s:'todo'},{t:'Creer les indexes de performance',s:'todo'},{t:'Ecrire les migrations Neon',s:'todo'},{t:'Tests unitaires schema + RLS',s:'todo'}],
    deps:[],notes:'Socle de tout le projet. Rien ne peut commencer sans ce schema valide.',labels:['core','database']},
  {id:'BE-002',team:'backend',phase:'A',week:'S1-S3',title:'API REST Hono.js — 24 endpoints CRUD',status:'todo',priority:'P0',
    desc:'Developper l\'API REST sur Hono.js/Cloudflare Workers. 24 endpoints couvrant tenants, users, apps, data_sources, components. Middleware auth JWT + rate limiting.',
    subtasks:[{t:'Setup Hono.js sur Cloudflare Workers',s:'todo'},{t:'Endpoints CRUD tenants + users',s:'todo'},{t:'Endpoints CRUD apps + app_components',s:'todo'},{t:'Endpoints data_sources + context_graph',s:'todo'},{t:'Middleware auth JWT + rate limiting',s:'todo'},{t:'Documentation OpenAPI/Swagger',s:'todo'}],
    deps:['BE-001'],notes:'Objectif latence P95 < 200ms.',labels:['core','api']},
  {id:'BE-003',team:'backend',phase:'A',week:'S3-S5',title:'Connecteur SharePoint/OneDrive — lecture Excel',status:'todo',priority:'P0',
    desc:'Integration Microsoft Graph API pour lire les fichiers Excel depuis SharePoint/OneDrive. Delta queries pour sync incrementale. Parser les feuilles, colonnes, types.',
    subtasks:[{t:'Integration Microsoft Graph API OAuth',s:'todo'},{t:'Parser Excel via Microsoft Graph',s:'todo'},{t:'Inference automatique du schema colonnes',s:'todo'},{t:'Delta queries pour sync incrementale',s:'todo'},{t:'Gestion des erreurs et retry logic',s:'todo'}],
    deps:['BE-002'],notes:'Mode lecture seule en Phase A. Write-back en Phase B.',labels:['integration','microsoft']},
  {id:'BE-004',team:'backend',phase:'A',week:'S5-S7',title:'Context graph JSONB — inference schema Excel',status:'todo',priority:'P1',
    desc:'Stocker le contexte du fichier Excel (colonnes, types, relations entre feuilles) dans le champ JSONB context_graph pour alimenter le pipeline IA.',
    subtasks:[{t:'Schema JSONB pour context_graph',s:'todo'},{t:'Inference automatique types colonnes',s:'todo'},{t:'Detection relations entre feuilles',s:'todo'},{t:'API endpoint GET context pour le pipeline IA',s:'todo'}],
    deps:['BE-003'],notes:'Remplace Neo4j (reporte V2). Le JSONB couvre 90% des besoins MVP.',labels:['data','ai']},
  {id:'BE-005',team:'backend',phase:'A',week:'S6-S8',title:'API App Store — listing, search, metadata',status:'todo',priority:'P1',
    desc:'Endpoints pour lister, chercher et afficher les apps publiees dans le store interne. Tri par popularite, date, categorie.',
    subtasks:[{t:'Endpoint search/filter apps',s:'todo'},{t:'Endpoint metadata app (createur, usage)',s:'todo'},{t:'Endpoint clone/fork app',s:'todo'},{t:'Pagination + tri (populaire, recent)',s:'todo'}],
    deps:['BE-002'],notes:'',labels:['feature']},
  {id:'BE-006',team:'backend',phase:'B',week:'S9-S11',title:'Write-back Excel bidirectionnel',status:'todo',priority:'P0',
    desc:'Permettre aux apps generees d\'ecrire dans le fichier Excel source via Microsoft Graph API. Gestion des conflits et locks. Queue async.',
    subtasks:[{t:'Microsoft Graph API write operations',s:'todo'},{t:'Gestion des locks fichier Excel',s:'todo'},{t:'Conflict resolution (last-write-wins + notif)',s:'todo'},{t:'Queue de write-back async',s:'todo'},{t:'Tests avec fichiers Excel reels',s:'todo'}],
    deps:['BE-003'],notes:'Feature la plus demandee par les Ops Managers.',labels:['core','integration']},
  {id:'BE-007',team:'backend',phase:'B',week:'S11-S13',title:'Integration Stripe Billing — Free/Pro/Enterprise',status:'todo',priority:'P0',
    desc:'Billing complet: Free (0) / Pro (299/mois) / Enterprise (custom). Webhooks Stripe, checkout, customer portal, gestion quotas par tier.',
    subtasks:[{t:'Setup Stripe products + prices',s:'todo'},{t:'Checkout flow + customer portal',s:'todo'},{t:'Webhooks subscription lifecycle',s:'todo'},{t:'Gestion quotas par tier',s:'todo'},{t:'Grace period + dunning emails',s:'todo'}],
    deps:['BE-002'],notes:'Valider pricing 299 par 10 interviews avant implementation.',labels:['monetization']},
  {id:'BE-008',team:'backend',phase:'B',week:'S13-S15',title:'Admin Consent flow + SSO Azure AD',status:'todo',priority:'P1',
    desc:'Permettre au DSI d\'autoriser Instack pour toute l\'organisation via Admin Consent. SSO SAML/OIDC. User provisioning basique.',
    subtasks:[{t:'Azure AD Admin Consent flow',s:'todo'},{t:'SSO SAML/OIDC integration',s:'todo'},{t:'User provisioning basique',s:'todo'},{t:'Tests avec Azure AD sandbox',s:'todo'}],
    deps:['BE-003','SEC-003'],notes:'Pre-requis pour les clients Enterprise.',labels:['enterprise','security']},
  {id:'BE-009',team:'backend',phase:'B',week:'S14-S16',title:'Cockpit DSI backend — analytics, kill-switch, audit',status:'todo',priority:'P1',
    desc:'Endpoints pour le cockpit DSI complet: analytics usage, gestion permissions, kill-switch app, export audit trail.',
    subtasks:[{t:'API analytics usage (apps, users, data access)',s:'todo'},{t:'Kill-switch endpoint (desactiver une app)',s:'todo'},{t:'Export audit trail CSV/JSON',s:'todo'},{t:'Politique de retention des donnees',s:'todo'}],
    deps:['BE-005'],notes:'',labels:['enterprise','governance']},
  // ═══ FRONTEND ═══
  {id:'FE-001',team:'frontend',phase:'A',week:'S1-S2',title:'Setup React/Vite + Design tokens + Storybook',status:'todo',priority:'P0',
    desc:'Initialiser le projet React/Vite/TypeScript, configurer le design system avec tokens, setup Storybook pour documentation composants.',
    subtasks:[{t:'Init React + Vite + TypeScript',s:'todo'},{t:'Configurer Tailwind + custom tokens',s:'todo'},{t:'Setup Storybook',s:'todo'},{t:'Tokens: colors, spacing, typography, shadows, radii',s:'todo'}],
    deps:[],notes:'Base Radix UI pour accessibilite WCAG 2.1 AA.',labels:['core','design-system']},
  {id:'FE-002',team:'frontend',phase:'A',week:'S2-S4',title:'Composants Phase A (1/2): FormField, DataTable, KPICard',status:'todo',priority:'P0',
    desc:'Les 3 composants les plus demandes avec interfaces TypeScript strictes et tests visuels.',
    subtasks:[{t:'FormField: input, select, date, checkbox, radio, validation',s:'todo'},{t:'DataTable: tri, filtre, pagination, export CSV, selection',s:'todo'},{t:'KPICard: valeur, delta, trend sparkline, icone',s:'todo'},{t:'Tests visuels Storybook pour chaque composant',s:'todo'},{t:'Tests accessibilite WCAG 2.1 AA',s:'todo'}],
    deps:['FE-001'],notes:'Tester avec 3 jeux de donnees reels (Leroy Merlin, Bonduelle, Descamps).',labels:['components']},
  {id:'FE-003',team:'frontend',phase:'A',week:'S4-S6',title:'Composants Phase A (2/2): BarChart, FilterBar, Container',status:'todo',priority:'P0',
    desc:'Completer les 6 composants Phase A avec BarChart responsive, FilterBar multi-critere, Container layout grid.',
    subtasks:[{t:'BarChart: horizontal/vertical, stacked, responsive, legend',s:'todo'},{t:'FilterBar: multi-critere, date range, search, presets',s:'todo'},{t:'Container: layout grid responsive, breakpoints',s:'todo'},{t:'Integration donnees reelles via API',s:'todo'}],
    deps:['FE-002'],notes:'',labels:['components']},
  {id:'FE-004',team:'frontend',phase:'A',week:'S3-S6',title:'AppRenderer — JSON-to-React deterministe',status:'todo',priority:'P0',
    desc:'Le coeur du rendu: transformer le JSON genere par le pipeline IA en arbre React. Zero eval(), zero code libre. Validation schema avant rendu.',
    subtasks:[{t:'Parser JSON schema -> arbre composants React',s:'todo'},{t:'Renderer deterministe avec error boundaries',s:'todo'},{t:'Validation schema strict avant rendu (reject invalid)',s:'todo'},{t:'Preview live pendant la conversation chat',s:'todo'},{t:'Fallback gracieux avec message utilisateur',s:'todo'}],
    deps:['FE-002','AI-002'],notes:'Piece maitresse du frontend.',labels:['core','ai']},
  {id:'FE-005',team:'frontend',phase:'A',week:'S5-S8',title:'Chat UI creation d\'apps — upload, prompt, preview live',status:'todo',priority:'P0',
    desc:'Interface conversationnelle: upload Excel drag & drop, decrire le besoin en langage naturel, voir le preview live en split-screen.',
    subtasks:[{t:'Chat UI avec streaming SSE responses',s:'todo'},{t:'Upload Excel drag & drop + progress',s:'todo'},{t:'Preview live split-screen (resize)',s:'todo'},{t:'Historique conversations + reprendre',s:'todo'},{t:'Mode "essayer sans inscription" (donnees demo)',s:'todo'}],
    deps:['FE-004'],notes:'Objectif: time-to-aha < 5 minutes.',labels:['core','ux']},
  {id:'FE-006',team:'frontend',phase:'B',week:'S9-S11',title:'6 composants Phase B — PieChart, LineChart, Kanban...',status:'todo',priority:'P1',
    desc:'PieChart, LineChart, KanbanBoard, DetailView, ImageGallery, PageNav.',
    subtasks:[{t:'PieChart + donut variant',s:'todo'},{t:'LineChart multi-series + zoom + tooltip',s:'todo'},{t:'KanbanBoard drag & drop + swimlanes',s:'todo'},{t:'DetailView formulaire read/edit mode',s:'todo'},{t:'ImageGallery grid + lightbox',s:'todo'},{t:'PageNav multi-page + tabs + breadcrumbs',s:'todo'}],
    deps:['FE-003'],notes:'',labels:['components']},
  {id:'FE-007',team:'frontend',phase:'B',week:'S10-S13',title:'App Store UI — Netflix-like browse + clone wizard',status:'todo',priority:'P0',
    desc:'Interface decouverte: carousels par categorie, recherche par probleme, detail app avec preview, clone/fork en 2 clics.',
    subtasks:[{t:'Page d\'accueil store avec carousels',s:'todo'},{t:'Recherche par probleme (NLP friendly)',s:'todo'},{t:'Page detail app + live preview',s:'todo'},{t:'Clone/fork wizard 2 etapes',s:'todo'},{t:'Categories: retail, logistique, RH, finance, qualite',s:'todo'}],
    deps:['BE-005','FE-006'],notes:'Clone/fork wizard critique pour la viralite K-factor.',labels:['feature','growth']},
  {id:'FE-008',team:'frontend',phase:'B',week:'S12-S16',title:'Cockpit DSI UI — dashboard, audit, kill-switch',status:'todo',priority:'P1',
    desc:'Dashboard DSI: KPIs usage, liste apps filtrables, detail app (qui, quoi, quelles donnees), kill-switch, export audit.',
    subtasks:[{t:'Dashboard overview (KPIs, charts usage)',s:'todo'},{t:'Liste apps avec filtre/tri/search',s:'todo'},{t:'Detail app: createur, utilisateurs, donnees accedees',s:'todo'},{t:'Kill-switch avec dialog de confirmation',s:'todo'},{t:'Export audit trail CSV',s:'todo'}],
    deps:['BE-009'],notes:'Read-only en Phase A (simple table), complet en Phase B.',labels:['enterprise','governance']},
  // ═══ AI/ML ═══
  {id:'AI-001',team:'ai',phase:'A',week:'S1-S3',title:'Etage 1 — Classification Haiku (routage requete)',status:'todo',priority:'P0',
    desc:'Premier etage du pipeline 4 etages: classifier la requete utilisateur (type d\'app, complexite, composants necessaires) via Claude Haiku. Routage vers le bon schema d\'inference.',
    subtasks:[{t:'Prompt engineering classification (8 types apps)',s:'todo'},{t:'Taxonomy: dashboard, formulaire, tracker, rapport, planning, inventaire, kanban, custom',s:'todo'},{t:'3 niveaux complexite: simple (1-2 composants), medium (3-4), complexe (5-6)',s:'todo'},{t:'Routage vers le schema d\'inference adapte',s:'todo'},{t:'Benchmark precision routage (objectif >95%)',s:'todo'},{t:'Metriques PostHog par type de classification',s:'todo'}],
    deps:[],notes:'Etage le plus critique: un mauvais routage cascade en echec total.',labels:['core','ai']},
  {id:'AI-002',team:'ai',phase:'A',week:'S2-S5',title:'Etage 2-3 — Inference schema + Generation Sonnet 4',status:'todo',priority:'P0',
    desc:'Generer le JSON schema de l\'app via Sonnet 4 en mode tool_use strict. Le LLM recoit les 6 composants comme tools et assemble un JSON structure.',
    subtasks:[{t:'Definir le JSON schema de sortie strict',s:'todo'},{t:'Prompt engineering generation contrainte',s:'todo'},{t:'Mode tool_use Sonnet 4 avec composants comme tools',s:'todo'},{t:'Context injection (schema Excel, colonnes, types)',s:'todo'},{t:'Fallback Haiku si Sonnet echoue',s:'todo'},{t:'Benchmark taux succes (objectif >92%)',s:'todo'}],
    deps:['AI-001'],notes:'Generation contrainte JSON = 92-95% vs 82-87% code libre.',labels:['core','ai']},
  {id:'AI-003',team:'ai',phase:'A',week:'S4-S6',title:'Etage 4 — Validation AST + sanitization',status:'todo',priority:'P0',
    desc:'Valider le JSON genere par un AST validator strict avant envoi au renderer React. Rejeter les schemas invalides, tenter re-generation partielle.',
    subtasks:[{t:'AST validator pour le JSON schema',s:'todo'},{t:'Regles de validation par type de composant',s:'todo'},{t:'Error recovery: re-generation partielle ciblée',s:'todo'},{t:'Logging detaille des echecs pour amelioration',s:'todo'}],
    deps:['AI-002'],notes:'',labels:['core','quality']},
  {id:'AI-004',team:'ai',phase:'A',week:'S5-S8',title:'Few-shot library — 50+ exemples par vertical',status:'todo',priority:'P1',
    desc:'Constituer une base d\'exemples de generation par secteur: retail (stock, planning, prix), industrie (qualite, maintenance), logistique (tournees, suivi colis).',
    subtasks:[{t:'20 exemples retail (suivi stock, planning equipe, grille prix, inventaire)',s:'todo'},{t:'15 exemples industrie (controle qualite, maintenance preventive, suivi production)',s:'todo'},{t:'15 exemples logistique (tournees, suivi colis, planning chauffeurs)',s:'todo'},{t:'Systeme de selection dynamique des few-shots pertinents',s:'todo'}],
    deps:['AI-003'],notes:'',labels:['ai','content']},
  {id:'AI-005',team:'ai',phase:'B',week:'S9-S12',title:'Feedback loop — collecte + amelioration continue',status:'todo',priority:'P1',
    desc:'Collecter les feedbacks utilisateur (app OK / modifiee / regeneree) pour alimenter l\'amelioration continue du pipeline.',
    subtasks:[{t:'UI feedback: pouce haut/bas, edit manual, regenerate',s:'todo'},{t:'Pipeline collecte et aggregation des feedbacks',s:'todo'},{t:'Analyse mensuelle des patterns d\'echec recurrents',s:'todo'},{t:'Mise a jour automatique few-shot library',s:'todo'}],
    deps:['AI-004'],notes:'',labels:['ai','quality']},
  {id:'AI-006',team:'ai',phase:'B',week:'S12-S16',title:'Contexte Excel enrichi — suggestions proactives',status:'todo',priority:'P1',
    desc:'Exploiter le context_graph JSONB pour enrichir les prompts et proposer des suggestions proactives basees sur le schema du fichier Excel.',
    subtasks:[{t:'Injection context_graph structuree dans le prompt systeme',s:'todo'},{t:'Suggestions proactives: "Ce fichier semble etre un inventaire, voulez-vous un dashboard stock ?"',s:'todo'},{t:'Detection automatique du meilleur composant par type de colonne',s:'todo'}],
    deps:['BE-004','AI-004'],notes:'',labels:['ai','ux']},
  // ═══ INFRA ═══
  {id:'INF-001',team:'infra',phase:'A',week:'S1',title:'Provisioning Cloudflare Workers + Neon PostgreSQL',status:'todo',priority:'P0',
    desc:'Provisionner l\'infrastructure de base: Cloudflare Workers, Neon PostgreSQL EU-West, DNS, secrets management.',
    subtasks:[{t:'Compte Cloudflare Workers (paid plan)',s:'todo'},{t:'Neon PostgreSQL EU-West provisioning',s:'todo'},{t:'DNS: instack.io + *.apps.instack.io + api.instack.io',s:'todo'},{t:'Secrets management (Cloudflare env vars)',s:'todo'}],
    deps:[],notes:'Cout total estime: 208/mois pour 1000 tenants.',labels:['core','infra']},
  {id:'INF-002',team:'infra',phase:'A',week:'S2-S3',title:'CI/CD GitHub Actions — lint, test, deploy',status:'todo',priority:'P0',
    desc:'Pipeline CI/CD complet: lint (ESLint/Prettier), tests (Vitest), build, deploy staging auto, deploy prod avec approval gate.',
    subtasks:[{t:'GitHub Actions workflow CI (lint + test + typecheck)',s:'todo'},{t:'Deploy staging automatique sur PR merge to main',s:'todo'},{t:'Deploy prod avec manual approval gate',s:'todo'},{t:'Neon branch automatique par PR pour preview DB',s:'todo'}],
    deps:['INF-001'],notes:'Neon branches = zero-cost preview environments.',labels:['devops']},
  {id:'INF-003',team:'infra',phase:'A',week:'S3-S4',title:'Observabilite — PostHog + Sentry + alerting',status:'todo',priority:'P0',
    desc:'Stack monitoring: PostHog (analytics + feature flags), Sentry (error tracking + session replay), alertes Slack.',
    subtasks:[{t:'PostHog setup + events tracking plan (30+ events)',s:'todo'},{t:'Sentry integration frontend + backend',s:'todo'},{t:'Session replay pour debugging UX',s:'todo'},{t:'Alertes Slack sur erreurs critiques (> 5/min)',s:'todo'}],
    deps:['INF-001'],notes:'',labels:['monitoring']},
  {id:'INF-004',team:'infra',phase:'A',week:'S5-S8',title:'Performance — CDN, cache, latence monitoring',status:'todo',priority:'P1',
    desc:'Optimiser les performances: CDN Cloudflare pour assets, cache headers, monitoring latence P50/P95/P99.',
    subtasks:[{t:'Cache headers optimaux (immutable assets, API max-age)',s:'todo'},{t:'Dashboard latence P50/P95/P99 par endpoint',s:'todo'},{t:'Alertes si P95 > 500ms',s:'todo'}],
    deps:['INF-003'],notes:'',labels:['performance']},
  {id:'INF-005',team:'infra',phase:'B',week:'S12-S16',title:'Multi-region EU + auto-scaling + load testing',status:'todo',priority:'P2',
    desc:'Preparer multi-region (EU-West + EU-Central) pour Enterprise. Auto-scaling Workers. Load test 10K concurrent.',
    subtasks:[{t:'Neon read replicas EU-Central',s:'todo'},{t:'Cloudflare Workers geo-routing',s:'todo'},{t:'Load testing 10K users concurrents (k6)',s:'todo'}],
    deps:['INF-004'],notes:'Necessaire avant le premier client Enterprise.',labels:['enterprise','scaling']},
  // ═══ SECURITY ═══
  {id:'SEC-001',team:'security',phase:'A',week:'S1-S3',title:'Modele securite 4 couches — V8, CSP, iframe, domaine',status:'todo',priority:'P0',
    desc:'Implementer les 4 couches d\'isolation: V8 Isolate (Cloudflare Workers), CSP Header strict, iframe sandbox attributes, domaine separe pour apps generees.',
    subtasks:[{t:'Content Security Policy headers (script-src, frame-src)',s:'todo'},{t:'iframe sandbox: allow-scripts, allow-same-origin deny',s:'todo'},{t:'Domaine separe *.apps.instack.io avec wildcard cert',s:'todo'},{t:'Validation composants rendus (pas d\'injection)',s:'todo'},{t:'Tests de securite basiques (OWASP top 10)',s:'todo'}],
    deps:['INF-001'],notes:'Le domaine separe est non-negociable pour isoler le CSP.',labels:['core','security']},
  {id:'SEC-002',team:'security',phase:'A',week:'S3-S6',title:'OAuth Personal mode + Token Proxy server-side',status:'todo',priority:'P0',
    desc:'Chaque utilisateur connecte son propre compte Microsoft (zero IT involvement). Tous les tokens transitent par un proxy server-side, jamais exposes cote client.',
    subtasks:[{t:'OAuth 2.0 PKCE flow implementation',s:'todo'},{t:'Token Proxy backend (encrypt + store + rotate)',s:'todo'},{t:'Token refresh automatique transparent',s:'todo'},{t:'Revocation propre + session cleanup',s:'todo'}],
    deps:['SEC-001','BE-002'],notes:'Mode personal = zero friction pour l\'Ops Manager qui veut tester.',labels:['core','auth']},
  {id:'SEC-003',team:'security',phase:'B',week:'S9-S12',title:'Admin Consent + SSO enterprise (SAML/OIDC)',status:'todo',priority:'P0',
    desc:'Flow Admin Consent pour autorisation organisation-wide. SSO SAML/OIDC. Mapping roles Azure AD vers roles Instack.',
    subtasks:[{t:'Azure AD Admin Consent flow complet',s:'todo'},{t:'SSO SAML 2.0 + OIDC support',s:'todo'},{t:'Mapping roles Azure AD -> roles Instack (admin, creator, viewer)',s:'todo'},{t:'Tests avec tenant Azure AD sandbox',s:'todo'}],
    deps:['SEC-002'],notes:'',labels:['enterprise','auth']},
  {id:'SEC-004',team:'security',phase:'A',week:'S1-S8',title:'Audit trail — logging securise de toutes les actions',status:'todo',priority:'P0',
    desc:'Logger toutes les actions sensibles: creation/suppression app, acces donnees Excel, partage, modification permissions. Retention 90 jours.',
    subtasks:[{t:'Schema audit_logs PostgreSQL (action, actor, resource, timestamp, metadata)',s:'todo'},{t:'Middleware logging automatique sur tous les endpoints sensibles',s:'todo'},{t:'Retention policy configurable (90j defaut)',s:'todo'},{t:'API export pour le cockpit DSI (JSON/CSV)',s:'todo'}],
    deps:['BE-001'],notes:'A implementer des S1 — les DSI le demanderont immediatement.',labels:['core','compliance']},
  {id:'SEC-005',team:'security',phase:'B',week:'S14-S16',title:'Pentest externe + gap analysis SOC2 Type I',status:'todo',priority:'P1',
    desc:'Mandater un pentest externe et realiser un gap analysis SOC2 Type I pour les premiers clients Enterprise.',
    subtasks:[{t:'Selection prestataire pentest (budget 5-10K)',s:'todo'},{t:'Pentest execution: black box + grey box',s:'todo'},{t:'Remediation des findings critiques et hauts',s:'todo'},{t:'Gap analysis SOC2 Type I',s:'todo'}],
    deps:['SEC-003'],notes:'Pre-requis pour signer les premiers Enterprise.',labels:['enterprise','compliance']},
  // ═══ PRODUCT ═══
  {id:'PM-001',team:'product',phase:'A',week:'S1',title:'Scope freeze Phase A — 6 US P0 gravees dans le marbre',status:'todo',priority:'P0',
    desc:'Finaliser et geler le scope Phase A. Pas d\'ajout, pas de feature creep. Les 6 user stories P0 sont : creation app, cockpit DSI read-only, connect Excel, partage, souverainete, mobile.',
    subtasks:[{t:'Finaliser les 6 user stories P0 avec acceptance criteria',s:'todo'},{t:'Definition of Done par user story',s:'todo'},{t:'Scope freeze officiel communique a TOUTES les equipes',s:'todo'},{t:'Document scope freeze signe par les leads',s:'todo'}],
    deps:[],notes:'Le scope freeze est sacre. Zero compromis.',labels:['core','process']},
  {id:'PM-002',team:'product',phase:'A',week:'S1-S2',title:'North Star Metric + Aha Moment — tracking setup',status:'todo',priority:'P0',
    desc:'North Star: Weekly Active Apps with 2+ users. Aha Moment: app creee + partagee + 2 users < 48h. Setup tracking PostHog pour ces metriques.',
    subtasks:[{t:'Documenter la North Star Metric formellement',s:'todo'},{t:'Definir le Aha Moment avec seuils mesurables',s:'todo'},{t:'Setup tracking PostHog (events + funnels)',s:'todo'},{t:'Dashboard metriques produit (daily/weekly/monthly)',s:'todo'}],
    deps:['INF-003'],notes:'',labels:['metrics']},
  {id:'PM-003',team:'product',phase:'A',week:'S2-S8',title:'Sprint cadence — 4 sprints de 2 semaines avec demos',status:'todo',priority:'P0',
    desc:'Sprints bi-hebdomadaires: planning le lundi, daily async Slack, demo le vendredi. 4 sprints en Phase A.',
    subtasks:[{t:'Sprint 1 (S1-S2): fondations tech + design tokens',s:'todo'},{t:'Sprint 2 (S3-S4): composants core + pipeline IA etages 1-2',s:'todo'},{t:'Sprint 3 (S5-S6): integration E2E + chat UI',s:'todo'},{t:'Sprint 4 (S7-S8): polish + perf + beta prep',s:'todo'}],
    deps:['PM-001'],notes:'',labels:['process']},
  {id:'PM-004',team:'product',phase:'B',week:'S9',title:'Scope Phase B — priorisation RICE sur base feedback beta',status:'todo',priority:'P0',
    desc:'Definir le scope Phase B en fonction des retours beta Phase A. RICE scoring des features candidates.',
    subtasks:[{t:'Analyse systematique feedback beta Phase A',s:'todo'},{t:'RICE scoring des 15+ features candidates',s:'todo'},{t:'Scope freeze Phase B',s:'todo'},{t:'Sprint planning S9-S16 (4 sprints)',s:'todo'}],
    deps:['PM-003'],notes:'',labels:['process']},
  {id:'PM-005',team:'product',phase:'B',week:'S9-S16',title:'Spec cockpit DSI complet — permissions, analytics, kill-switch',status:'todo',priority:'P1',
    desc:'Specification fonctionnelle detaillee du cockpit DSI avec wireframes, user stories, et tests avec 5 DSI du programme Early Access.',
    subtasks:[{t:'Wireframes cockpit DSI (Figma)',s:'todo'},{t:'Spec fonctionnelle detaillee (15+ pages)',s:'todo'},{t:'User stories DSI completes',s:'todo'},{t:'Tests avec 5 DSI Early Access',s:'todo'}],
    deps:['PM-004'],notes:'',labels:['enterprise','governance']},
  // ═══ UX ═══
  {id:'UX-001',team:'ux',phase:'A',week:'S1-S2',title:'Wireframes onboarding — upload, prompt, preview',status:'todo',priority:'P0',
    desc:'Designer le parcours magique: Upload Excel → Decrire le besoin → Voir l\'app generee. Objectif < 90 secondes.',
    subtasks:[{t:'Wireframes lo-fi: ecran upload (drag & drop)',s:'todo'},{t:'Wireframes lo-fi: chat de creation (split screen)',s:'todo'},{t:'Wireframes lo-fi: preview app generee',s:'todo'},{t:'Tests guerilla rapides avec 5 Ops Managers',s:'todo'}],
    deps:[],notes:'Objectif: onboarding < 90 secondes, time-to-aha < 5 minutes.',labels:['core','ux']},
  {id:'UX-002',team:'ux',phase:'A',week:'S2-S4',title:'UI Kit Figma — tokens, 6 composants, patterns',status:'todo',priority:'P0',
    desc:'UI Kit complet dans Figma: tokens visuels, 6 composants Phase A avec toutes les variantes, patterns d\'interaction (modals, toasts, loading).',
    subtasks:[{t:'Tokens Figma: couleurs, typo, spacing, radii, shadows',s:'todo'},{t:'6 composants Figma avec variants (light/dark, sizes, states)',s:'todo'},{t:'Patterns: modals, toasts, loading skeletons, empty states',s:'todo'},{t:'Prototype interactif clickable',s:'todo'}],
    deps:['UX-001'],notes:'',labels:['design-system']},
  {id:'UX-003',team:'ux',phase:'A',week:'S6-S8',title:'Tests utilisateurs beta — 10 testeurs, 5 entreprises',status:'todo',priority:'P0',
    desc:'Sessions de test avec utilisateurs reels des entreprises pilotes. 2 testeurs par persona. Protocol + synthese.',
    subtasks:[{t:'Recruter 10 testeurs (2 par persona)',s:'todo'},{t:'Protocole de test + script detaille',s:'todo'},{t:'Sessions de test remote (Maze ou manual)',s:'todo'},{t:'Synthese + 10 recommendations actionnables',s:'todo'}],
    deps:['FE-005'],notes:'',labels:['research']},
  {id:'UX-004',team:'ux',phase:'B',week:'S9-S11',title:'Maquettes hi-fi App Store + cockpit DSI',status:'todo',priority:'P1',
    desc:'Maquettes haute fidelite pour l\'App Store Netflix-like et le cockpit DSI. Mobile responsive.',
    subtasks:[{t:'Maquettes App Store (accueil, recherche, detail, clone)',s:'todo'},{t:'Clone/fork wizard design (2 etapes max)',s:'todo'},{t:'Maquettes cockpit DSI (dashboard, detail, kill-switch)',s:'todo'},{t:'Responsive mobile (priorite: creation + consultation)',s:'todo'}],
    deps:['UX-003'],notes:'',labels:['design']},
  // ═══ GROWTH ═══
  {id:'GR-001',team:'growth',phase:'A',week:'S1-S4',title:'Landing page + SEO + blog setup',status:'todo',priority:'P0',
    desc:'Landing page positionnee "App Store Interne Gouverne". Setup SEO technique. Blog pour content marketing.',
    subtasks:[{t:'Landing page: hero, demo video, features, pricing, CTA',s:'todo'},{t:'SEO: metas, structured data, sitemap, robots.txt',s:'todo'},{t:'Blog setup (Next.js ou Ghost)',s:'todo'},{t:'Analytics: PostHog goals + UTM tracking',s:'todo'}],
    deps:[],notes:'',labels:['marketing','seo']},
  {id:'GR-002',team:'growth',phase:'A',week:'S4-S6',title:'Video demo 60s — le moment magique capture',status:'todo',priority:'P0',
    desc:'Video de demo: upload Excel → description naturelle → app en 30 secondes. Asset marketing #1.',
    subtasks:[{t:'Script + storyboard (3 actes: probleme, magie, resultat)',s:'todo'},{t:'Capture ecran avec donnees reelles (inventaire retail)',s:'todo'},{t:'Montage + voiceover professionnel',s:'todo'},{t:'Publication YouTube + embed landing page + LinkedIn',s:'todo'}],
    deps:['FE-005'],notes:'A produire AVANT le lancement beta.',labels:['content','marketing']},
  {id:'GR-003',team:'growth',phase:'A',week:'S6-S8',title:'Beta launch — objectif 500 signups',status:'todo',priority:'P0',
    desc:'Lancer la beta privee. 500 signups via liste d\'attente, LinkedIn organique, outreach direct.',
    subtasks:[{t:'Liste d\'attente avec referral integre (bonus queue position)',s:'todo'},{t:'Campagne LinkedIn organique (3 posts/semaine)',s:'todo'},{t:'Outreach direct: 50 Ops Managers identifies en interviews',s:'todo'},{t:'PR: manifeste "La fin du Excel hell en entreprise"',s:'todo'}],
    deps:['GR-001','GR-002'],notes:'',labels:['launch']},
  {id:'GR-004',team:'growth',phase:'B',week:'S9-S12',title:'PLG funnel AARRR + A/B tests onboarding',status:'todo',priority:'P0',
    desc:'Funnel complet Acquisition → Activation → Retention → Revenue → Referral. A/B test 3 variantes onboarding.',
    subtasks:[{t:'Funnel tracking complet PostHog',s:'todo'},{t:'A/B test: 3 variantes page d\'accueil',s:'todo'},{t:'Email drip sequence 7 jours (welcome → tutorial → share)',s:'todo'},{t:'Activation trigger: 1ere app partagee a un collegue',s:'todo'}],
    deps:['GR-003'],notes:'',labels:['growth','plg']},
  {id:'GR-005',team:'growth',phase:'B',week:'S12-S16',title:'Boucles virales + referral — K-factor 0.15-0.30',status:'todo',priority:'P1',
    desc:'Activer les 5 boucles virales: share-to-use, template clone, DSI approve-to-scale, cross-team discover, success story.',
    subtasks:[{t:'Share link avec preview visuelle de l\'app',s:'todo'},{t:'Template gallery publique (SEO)',s:'todo'},{t:'Referral: inviter un collegue → +5 apps gratuites',s:'todo'},{t:'Metriques K-factor par type de boucle',s:'todo'}],
    deps:['GR-004','FE-007'],notes:'K-factor objectif: 0.15-0.30.',labels:['growth','viral']},
  // ═══ SALES ═══
  {id:'SL-001',team:'sales',phase:'A',week:'S1-S4',title:'50 interviews terrain + 30 LOI signees',status:'todo',priority:'P0',
    desc:'CONDITION #1. 50 interviews qualitatives + 30 lettres d\'intention avec engagement financier. Cible: Ops Managers retail/industrie 200-1000 employes.',
    subtasks:[{t:'Liste de 100 prospects qualifies (LinkedIn Sales Nav)',s:'todo'},{t:'Script d\'interview structure (30 min)',s:'todo'},{t:'50 interviews realisees et documentees',s:'todo'},{t:'30 LOI signees avec montant indicatif',s:'todo'},{t:'Synthese insights → ajustements produit',s:'todo'}],
    deps:[],notes:'CONDITION NON-NEGOCIABLE. Pas de code avant 30 LOI.',labels:['validation','critical']},
  {id:'SL-002',team:'sales',phase:'A',week:'S1-S4',title:'Programme DSI Early Access — 20 co-createurs',status:'todo',priority:'P0',
    desc:'Recruter 20 DSI co-createurs du cockpit. Programme d\'acces privilegie avec benefices exclusifs.',
    subtasks:[{t:'Design du programme (benefices: early access, input produit, pricing prefentiel)',s:'todo'},{t:'Outreach 50 DSI cibles (LinkedIn + intro reseau)',s:'todo'},{t:'Selection et onboarding 20 DSI',s:'todo'},{t:'Premier workshop co-creation cockpit (visio)',s:'todo'}],
    deps:[],notes:'',labels:['enterprise','partnership']},
  {id:'SL-003',team:'sales',phase:'A',week:'S4-S8',title:'Battle cards — Power Apps, Retool, AppSheet, Glide',status:'todo',priority:'P1',
    desc:'Documents de comparaison concurrentielle detailles pour chaque concurrent majeur.',
    subtasks:[{t:'Battle card Power Apps (forces, faiblesses, objections)',s:'todo'},{t:'Battle card Retool',s:'todo'},{t:'Battle card Google AppSheet',s:'todo'},{t:'Battle card Glide',s:'todo'},{t:'Matrice de comparaison synthetique 1 page',s:'todo'}],
    deps:['SL-001'],notes:'',labels:['sales-enablement']},
  {id:'SL-004',team:'sales',phase:'B',week:'S9-S12',title:'20 beta entreprises + validation pricing 299/mois',status:'todo',priority:'P0',
    desc:'Convertir les beta testeurs en pilotes actifs. Valider le willingness-to-pay a 299/mois via 10 interviews pricing.',
    subtasks:[{t:'Selectionner 20 entreprises beta les plus actives',s:'todo'},{t:'Onboarding guide dedie + support Slack',s:'todo'},{t:'10 interviews willingness-to-pay structurees',s:'todo'},{t:'Ajuster pricing si < 60% acceptation',s:'todo'}],
    deps:['SL-001','GR-003'],notes:'',labels:['pricing','validation']},
  {id:'SL-005',team:'sales',phase:'B',week:'S13-S16',title:'Premiers clients payants — objectif 5K MRR',status:'todo',priority:'P0',
    desc:'Convertir les pilotes en clients payants Pro (299/mois). Setup CRM. Weekly pipeline reviews.',
    subtasks:[{t:'Process de conversion beta → payant',s:'todo'},{t:'Onboarding payant avec dedicated success manager',s:'todo'},{t:'CRM setup (Attio ou HubSpot)',s:'todo'},{t:'Weekly forecast + pipeline review discipline',s:'todo'}],
    deps:['SL-004','BE-007'],notes:'',labels:['revenue']},
  // ═══ STRATEGY ═══
  {id:'ST-001',team:'strategy',phase:'A',week:'S1',title:'Plan financier 18 mois — bear/base/bull scenarios',status:'todo',priority:'P0',
    desc:'Modele financier detaille sur 18 mois: revenue, burn rate, runway, milestones de financement par scenario.',
    subtasks:[{t:'Modele financier Excel/Sheets detaille',s:'todo'},{t:'Scenario bear: 50% des objectifs (runway analysis)',s:'todo'},{t:'Scenario base: objectifs nominaux',s:'todo'},{t:'Scenario bull: 150% des objectifs',s:'todo'},{t:'Calcul runway par scenario + trigger de levee',s:'todo'}],
    deps:[],notes:'',labels:['finance']},
  {id:'ST-002',team:'strategy',phase:'A',week:'S1-S4',title:'Pre-seed pitch deck — 15 slides + annexes',status:'todo',priority:'P0',
    desc:'Pitch deck pre-seed: probleme, solution, demo, marche (TAM/SAM/SOM), modele, equipe, traction, ask 735K, use of funds.',
    subtasks:[{t:'Narrative arc: 15 slides (probleme → solution → why now → marche → modele → equipe → ask)',s:'todo'},{t:'Design professionnel (Figma ou Pitch)',s:'todo'},{t:'Annexes: modele financier, comp table, product screenshots',s:'todo'},{t:'5 rehearsals + feedback d\'angels/mentors',s:'todo'}],
    deps:['ST-001'],notes:'',labels:['fundraising']},
  {id:'ST-003',team:'strategy',phase:'A',week:'S1-S2',title:'Recrutement CTO cofondateur — pipeline 10 candidats',status:'todo',priority:'P0',
    desc:'CONDITION #2. Identifier et recruter un CTO cofondateur senior: Microsoft Graph API + IA generative + infra serverless.',
    subtasks:[{t:'Fiche de poste detaillee + package equity',s:'todo'},{t:'Sourcing: reseau personnel, LinkedIn, angels tech, communities',s:'todo'},{t:'Pipeline 10 candidats qualifies',s:'todo'},{t:'Entretiens techniques + culture fit',s:'todo'},{t:'Offre + negociation equity (10-20%)',s:'todo'}],
    deps:[],notes:'CONDITION NON-NEGOCIABLE. Sans CTO, le MVP est irrealisable.',labels:['hiring','critical']},
  {id:'ST-004',team:'strategy',phase:'A',week:'S1-S3',title:'DPA + SCCs Anthropic — couverture juridique RGPD',status:'todo',priority:'P0',
    desc:'CONDITION #3. Negocier et signer le Data Processing Agreement + Standard Contractual Clauses avec Anthropic.',
    subtasks:[{t:'Contact equipe legal/partnerships Anthropic',s:'todo'},{t:'Revue DPA + SCCs par avocat specialise RGPD',s:'todo'},{t:'Negociation clauses specifiques (data residency, sub-processors)',s:'todo'},{t:'Signature DPA + SCCs',s:'todo'}],
    deps:[],notes:'CONDITION NON-NEGOCIABLE. Aucun DSI francais serieux ne signera sans.',labels:['legal','critical']},
  {id:'ST-005',team:'strategy',phase:'B',week:'S9-S16',title:'Preparation Seed — data room, pitch V2, pipeline VCs',status:'todo',priority:'P1',
    desc:'Preparer la levee Seed 1.5-2.5M: data room complete, pitch deck V2 avec metriques, pipeline 30 VCs/angels.',
    subtasks:[{t:'Data room complete (financials, legal, product, team)',s:'todo'},{t:'Pitch deck Seed V2 (metriques reelles)',s:'todo'},{t:'Pipeline 30 VCs/angels qualifies',s:'todo'},{t:'Roadshow planning M9-M12',s:'todo'}],
    deps:['ST-002','SL-005'],notes:'',labels:['fundraising']}
];

// ══════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════
let currentView='all';
let groupBy='team'; // team | phase | priority
let selectedTask=null;
let collapsedGroups={};
let sequenceMode=false;
let ganttMode=false;
let ganttTeamFilter=new Set(); // empty = all teams visible

// ══════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════
const getTeam=id=>TEAMS.find(t=>t.id===id);
const tasksByStatus=s=>TASKS.filter(t=>t.status===s);
const allStats=()=>{const t=TASKS.length,d=TASKS.filter(x=>x.status==='done').length;return{total:t,done:d,progress:TASKS.filter(x=>x.status==='progress').length,blocked:TASKS.filter(x=>x.status==='blocked').length,pct:t?Math.round(d/t*100):0};};

function filterTasks(){
  switch(currentView){
    case 'all': return [...TASKS];
    case 'active': return TASKS.filter(t=>t.status==='progress');
    case 'blocked': return TASKS.filter(t=>t.status==='blocked');
    case 'done': return TASKS.filter(t=>t.status==='done');
    case 'phaseA': return TASKS.filter(t=>t.phase==='A');
    case 'phaseB': return TASKS.filter(t=>t.phase==='B');
    default: return TASKS.filter(t=>t.team===currentView);
  }
}

function groupTasks(tasks){
  const groups=[];
  if(groupBy==='team'){
    TEAMS.forEach(team=>{
      const items=tasks.filter(t=>t.team===team.id);
      if(items.length){
        const done=items.filter(t=>t.status==='done').length;
        groups.push({key:team.id,label:team.name,color:team.hex,count:items.length,done,pct:Math.round(done/items.length*100),tasks:items});
      }
    });
  } else if(groupBy==='phase'){
    ['A','B'].forEach(ph=>{
      const label=ph==='A'?'Phase A — Prouver la magie (S1-S8)':'Phase B — Convertir & gouverner (S9-S16)';
      const color=ph==='A'?'#5e6ad2':'#10b981';
      const items=tasks.filter(t=>t.phase===ph);
      if(items.length){const done=items.filter(t=>t.status==='done').length;groups.push({key:'phase-'+ph,label,color,count:items.length,done,pct:Math.round(done/items.length*100),tasks:items});}
    });
  } else if(groupBy==='priority'){
    ['P0','P1','P2'].forEach(pr=>{
      const label=pr==='P0'?'Urgent — P0':pr==='P1'?'High — P1':'Medium — P2';
      const color=pr==='P0'?'#ef4444':pr==='P1'?'#f97316':'#eab308';
      const items=tasks.filter(t=>t.priority===pr);
      if(items.length){const done=items.filter(t=>t.status==='done').length;groups.push({key:'pr-'+pr,label,color,count:items.length,done,pct:Math.round(done/items.length*100),tasks:items});}
    });
  }
  return groups;
}

function cycleStatus(taskId,e){
  if(e){e.stopPropagation();}
  const task=TASKS.find(t=>t.id===taskId);
  const order=['todo','progress','done','blocked'];
  task.status=order[(order.indexOf(task.status)+1)%order.length];
  if(task.status==='done') task.subtasks.forEach(s=>s.s='done');
  if(task.status==='todo') task.subtasks.forEach(s=>s.s='todo');
  render();
}

function cycleSubtask(taskId,idx,e){
  if(e)e.stopPropagation();
  const task=TASKS.find(t=>t.id===taskId);
  const order=['todo','progress','done'];
  const sub=task.subtasks[idx];
  sub.s=order[(order.indexOf(sub.s)+1)%order.length];
  render();
}

function selectTask(taskId){
  selectedTask=selectedTask===taskId?null:taskId;
  render();
}

function setView(v,el){
  ganttMode=(v==='gantt');
  sequenceMode=(v==='sequence');
  if(!ganttMode&&!sequenceMode) currentView=v;
  document.querySelectorAll('.sb-item').forEach(i=>i.classList.remove('active'));
  if(el)el.classList.add('active');
  selectedTask=null;
  render();
}

function setGroupBy(g){groupBy=g;render();}
function toggleGroup(key){collapsedGroups[key]=!collapsedGroups[key];render();}

// ══════════════════════════════════════════
//  RENDER
// ══════════════════════════════════════════
function render(){
  const s=allStats();

  // ── SEQUENCE MODE ──
  if(sequenceMode){
    document.getElementById('countAll').textContent=TASKS.length;
    document.getElementById('countActive').textContent=TASKS.filter(t=>t.status==='progress').length;
    document.getElementById('countBlocked').textContent=TASKS.filter(t=>t.status==='blocked').length;
    document.getElementById('countDone').textContent=TASKS.filter(t=>t.status==='done').length;
    const sbTeams=document.getElementById('sbTeams');
    sbTeams.innerHTML=TEAMS.map(t=>{
      const cnt=TASKS.filter(x=>x.team===t.id).length;
      const done=TASKS.filter(x=>x.team===t.id&&x.status==='done').length;
      return `<div class="sb-item" onclick="setView('${t.id}',this)">
        <div class="sb-dot" style="background:${t.hex}"></div>${t.short}<span class="sb-count">${done}/${cnt}</span></div>`;
    }).join('');
    const app=document.getElementById('app');
    app.classList.remove('detail-open');
    const ep=document.querySelector('.detail-panel');
    if(ep) ep.remove();
    closeGanttDrawer();
    selectedTask=null;
    renderSequence();
    saveToLocalStorage();
    return;
  }

  // ── GANTT MODE ──
  if(ganttMode){
    // sidebar counts still update
    document.getElementById('countAll').textContent=TASKS.length;
    document.getElementById('countActive').textContent=TASKS.filter(t=>t.status==='progress').length;
    document.getElementById('countBlocked').textContent=TASKS.filter(t=>t.status==='blocked').length;
    document.getElementById('countDone').textContent=TASKS.filter(t=>t.status==='done').length;
    const sbTeams=document.getElementById('sbTeams');
    sbTeams.innerHTML=TEAMS.map(t=>{
      const cnt=TASKS.filter(x=>x.team===t.id).length;
      const done=TASKS.filter(x=>x.team===t.id&&x.status==='done').length;
      return `<div class="sb-item" onclick="setView('${t.id}',this)">
        <div class="sb-dot" style="background:${t.hex}"></div>${t.short}<span class="sb-count">${done}/${cnt}</span></div>`;
    }).join('');
    // remove detail panel (list mode)
    const app=document.getElementById('app');
    app.classList.remove('detail-open');
    const ep=document.querySelector('.detail-panel');
    if(ep) ep.remove();
    // close any gantt drawer that might be stale
    closeGanttDrawer();
    selectedTask=null;
    renderGantt();
    saveToLocalStorage();
    return;
  }

  // ── LIST MODE ── restore DOM if coming from gantt
  const mainPanel=document.querySelector('.main-panel');
  if(!document.getElementById('toolbar')){
    mainPanel.innerHTML=`
      <div class="toolbar" id="toolbar"></div>
      <div class="col-header">
        <div class="ir-status" style="width:32px;">St</div>
        <div class="ir-priority" style="width:28px;">Pr</div>
        <div class="ir-id" style="width:72px;">ID</div>
        <div style="flex:1;">Titre</div>
        <div style="width:64px;text-align:right;">Semaine</div>
        <div style="width:56px;text-align:right;">Sub</div>
        <div style="width:28px;"></div>
      </div>
      <div class="issue-list" id="issueList"></div>`;
  }
  // sidebar counts
  document.getElementById('countAll').textContent=TASKS.length;
  document.getElementById('countActive').textContent=TASKS.filter(t=>t.status==='progress').length;
  document.getElementById('countBlocked').textContent=TASKS.filter(t=>t.status==='blocked').length;
  document.getElementById('countDone').textContent=TASKS.filter(t=>t.status==='done').length;

  // sidebar teams
  const sbTeams=document.getElementById('sbTeams');
  sbTeams.innerHTML=TEAMS.map(t=>{
    const cnt=TASKS.filter(x=>x.team===t.id).length;
    const done=TASKS.filter(x=>x.team===t.id&&x.status==='done').length;
    return `<div class="sb-item ${currentView===t.id?'active':''}" onclick="setView('${t.id}',this)">
      <div class="sb-dot" style="background:${t.hex}"></div>
      ${t.short}
      <span class="sb-count">${done}/${cnt}</span>
    </div>`;
  }).join('');

  // toolbar
  const viewLabel={all:'Toutes les taches',active:'En cours',blocked:'Bloquees',done:'Terminees',phaseA:'Phase A',phaseB:'Phase B'}[currentView]||getTeam(currentView)?.name||'';
  document.getElementById('toolbar').innerHTML=`
    <div class="tb-breadcrumb"><span class="muted">Instack MVP</span><span class="sep">/</span>${viewLabel}</div>
    <div class="tb-spacer"></div>
    <div class="tb-group">
      <button class="tb-btn ${groupBy==='team'?'on':''}" onclick="setGroupBy('team')">Equipe</button>
      <button class="tb-btn ${groupBy==='phase'?'on':''}" onclick="setGroupBy('phase')">Phase</button>
      <button class="tb-btn ${groupBy==='priority'?'on':''}" onclick="setGroupBy('priority')">Priorite</button>
    </div>
    <div style="font-size:12px;font-weight:600;color:var(--text-secondary);padding:0 4px;">${s.pct}%</div>
    <div style="width:80px;height:4px;background:var(--border);border-radius:2px;overflow:hidden;"><div style="height:100%;width:${s.pct}%;background:var(--accent);border-radius:2px;transition:width .3s;"></div></div>
  `;

  // issue list
  const filtered=filterTasks();
  const groups=groupTasks(filtered);
  const list=document.getElementById('issueList');

  if(!filtered.length){
    list.innerHTML=`<div class="empty-state"><div class="es-icon">~</div><div class="es-text">Aucune tache dans cette vue</div></div>`;
  } else {
    let html='';
    groups.forEach(g=>{
      const collapsed=collapsedGroups[g.key];
      html+=`<div class="group-header ${collapsed?'collapsed':''}" onclick="toggleGroup('${g.key}')">
        <div class="gh-chevron"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        <div class="gh-dot" style="background:${g.color}"></div>
        <div class="gh-name">${g.label}</div>
        <div class="gh-count">${g.count}</div>
        <div class="gh-pct" style="color:${g.pct>=70?'var(--s-done)':g.pct>0?'var(--text-tertiary)':'var(--text-quaternary)'}">${g.pct}%</div>
        <div class="gh-bar"><div class="gh-fill" style="width:${g.pct}%;background:${g.color}"></div></div>
      </div>`;
      if(!collapsed){
        g.tasks.forEach(task=>{
          const team=getTeam(task.team);
          const subDone=task.subtasks.filter(s=>s.s==='done').length;
          const subTotal=task.subtasks.length;
          const initials=team.lead.split(' ').map(w=>w[0]).join('');
          html+=`<div class="issue-row status-${task.status} ${selectedTask===task.id?'selected':''}" onclick="selectTask('${task.id}')">
            <div class="ir-status"><div class="status-icon ${task.status}" onclick="cycleStatus('${task.id}',event)" title="Cliquer pour changer le statut"></div></div>
            <div class="ir-priority"><div class="priority-icon ${task.priority}">
              <div class="bar" style="height:${task.priority==='P0'?8:task.priority==='P1'?6:4}px;"></div>
              ${task.priority==='P0'?'<div class="bar" style="height:6px;"></div><div class="bar" style="height:4px;"></div>':task.priority==='P1'?'<div class="bar" style="height:4px;"></div><div class="bar" style="height:2px;opacity:.3;"></div>':'<div class="bar" style="height:2px;opacity:.3;"></div><div class="bar" style="height:2px;opacity:.15;"></div>'}
            </div></div>
            <div class="ir-id">${task.id}</div>
            <div class="ir-title">${task.title}</div>
            <div class="ir-labels">${task.labels.slice(0,2).map(l=>`<span class="ir-label" style="background:${team.hex}12;color:${team.hex};">${l}</span>`).join('')}</div>
            <div class="ir-week">${task.week}</div>
            <div class="ir-subtasks"><svg viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h12M2 12h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>${subDone}/${subTotal}</div>
            <div class="ir-assignee"><div class="ir-avatar" style="background:${team.hex}">${initials}</div></div>
          </div>`;
        });
      }
    });
    list.innerHTML=html;
  }

  // detail panel
  const app=document.getElementById('app');
  const existingPanel=document.querySelector('.detail-panel');
  if(existingPanel) existingPanel.remove();

  if(selectedTask){
    app.classList.add('detail-open');
    const task=TASKS.find(t=>t.id===selectedTask);
    const team=getTeam(task.team);
    const subDone=task.subtasks.filter(s=>s.s==='done').length;
    const subTotal=task.subtasks.length;
    const subPct=subTotal?Math.round(subDone/subTotal*100):0;
    const statusLabel={todo:'A faire',progress:'En cours',done:'Termine',blocked:'Bloque'}[task.status];
    const statusColor={todo:'var(--s-todo)',progress:'var(--s-progress)',done:'var(--s-done)',blocked:'var(--s-blocked)'}[task.status];

    const panel=document.createElement('div');
    panel.className='detail-panel';
    panel.innerHTML=`
      <div class="dp-header">
        <button class="dp-close" onclick="selectedTask=null;render();">x</button>
        <div class="dp-header-info">
          <div class="dp-id">${task.id} &bull; ${team.name}</div>
          <div class="dp-title">${task.title}</div>
        </div>
      </div>
      <div class="dp-body">
        <div class="dp-meta-grid">
          <div class="dp-meta-item"><div class="dp-ml">Statut</div><div class="dp-mv"><div class="status-dot" style="background:${statusColor}"></div>${statusLabel}</div></div>
          <div class="dp-meta-item"><div class="dp-ml">Priorite</div><div class="dp-mv">${task.priority==='P0'?'Urgent':task.priority==='P1'?'High':'Medium'} (${task.priority})</div></div>
          <div class="dp-meta-item"><div class="dp-ml">Equipe</div><div class="dp-mv"><div class="status-dot" style="background:${team.hex}"></div>${team.name}</div></div>
          <div class="dp-meta-item"><div class="dp-ml">Responsable</div><div class="dp-mv">${team.lead} (${team.code})</div></div>
          <div class="dp-meta-item"><div class="dp-ml">Phase</div><div class="dp-mv">Phase ${task.phase}${task.phase==='A'?' — Prouver la magie':' — Convertir & gouverner'}</div></div>
          <div class="dp-meta-item"><div class="dp-ml">Semaine</div><div class="dp-mv">${task.week}</div></div>
        </div>

        <div class="dp-section">
          <div class="dp-section-title">Description</div>
          <div class="dp-desc">${task.desc}</div>
        </div>

        <div class="dp-section">
          <div class="dp-section-title">Sous-taches (${subDone}/${subTotal})</div>
          <div class="dp-subtask-list">
            ${task.subtasks.map((sub,idx)=>`
              <div class="dp-subtask sub-${sub.s}" onclick="cycleSubtask('${task.id}',${idx},event)">
                <div class="sub-check"></div>
                <span class="sub-text">${sub.t}</span>
              </div>
            `).join('')}
          </div>
          <div class="dp-progress-bar"><div class="dp-progress-fill" style="width:${subPct}%"></div></div>
        </div>

        ${task.deps.length?`<div class="dp-section">
          <div class="dp-section-title">Dependances</div>
          <div class="dp-deps">${task.deps.map(d=>{
            const dep=TASKS.find(t=>t.id===d);
            const depStatus=dep?dep.status:'todo';
            return `<div class="dp-dep" onclick="selectTask('${d}')" title="${dep?dep.title:d}">
              <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${depStatus==='done'?'var(--s-done)':depStatus==='progress'?'var(--s-progress)':'var(--s-todo)'};margin-right:4px;"></span>
              ${d}${dep?' — '+dep.title.substring(0,40)+(dep.title.length>40?'...':''):''}
            </div>`;
          }).join('')}</div>
        </div>`:''}

        ${task.labels.length?`<div class="dp-section">
          <div class="dp-section-title">Labels</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">${task.labels.map(l=>`<span class="ir-label" style="background:${team.hex}12;color:${team.hex};font-size:12px;padding:3px 10px;">${l}</span>`).join('')}</div>
        </div>`:''}

        ${task.notes?`<div class="dp-section">
          <div class="dp-section-title">Notes</div>
          <div class="dp-note">${task.notes}</div>
        </div>`:''}

        <div class="dp-section">
          <div class="dp-section-title">Actions</div>
          <div class="dp-status-actions">
            <button class="dp-sa" onclick="TASKS.find(t=>t.id==='${task.id}').status='todo';render();">A faire</button>
            <button class="dp-sa primary" onclick="TASKS.find(t=>t.id==='${task.id}').status='progress';render();">Demarrer</button>
            <button class="dp-sa" onclick="TASKS.find(t=>t.id==='${task.id}').status='done';TASKS.find(t=>t.id==='${task.id}').subtasks.forEach(s=>s.s='done');render();" style="color:var(--s-done);border-color:var(--s-done);">Terminer</button>
            <button class="dp-sa" onclick="TASKS.find(t=>t.id==='${task.id}').status='blocked';render();" style="color:var(--s-blocked);border-color:var(--s-blocked);">Bloquer</button>
          </div>
        </div>
      </div>
    `;
    app.appendChild(panel);
  } else {
    app.classList.remove('detail-open');
  }

  // auto-save
  saveToLocalStorage();
}

// ══════════════════════════════════════════
//  GANTT CHART — Critical Path, Dependency Arrows, Drawer
// ══════════════════════════════════════════
function parseWeek(w){
  const parts=w.replace(/\s/g,'').split('-');
  const s=parseInt(parts[0].replace('S',''));
  const e=parts[1]?parseInt(parts[1].replace('S','')):s;
  return {start:s,end:e};
}

function toggleGanttTeam(teamId){
  if(ganttTeamFilter.has(teamId)) ganttTeamFilter.delete(teamId);
  else ganttTeamFilter.add(teamId);
  render();
}
function clearGanttFilter(){ganttTeamFilter.clear();render();}

// ── SCHEDULE + CRITICAL PATH (forward/backward pass) ──
// Returns { scheduled: { taskId: {start, end, duration} }, critical: Set<taskId> }
function computeSchedule(){
  const taskMap={};
  TASKS.forEach(t=>{
    const w=parseWeek(t.week);
    const dur=w.end-w.start+1;
    taskMap[t.id]={id:t.id,deps:t.deps,origStart:w.start,origEnd:w.end,duration:dur,es:0,ef:0,ls:999,lf:999};
  });

  // Topological sort (deps first)
  const visited=new Set(),sorted=[];
  function visit(id){
    if(visited.has(id)) return;
    visited.add(id);
    const t=taskMap[id];
    if(t) t.deps.forEach(d=>visit(d));
    sorted.push(id);
  }
  Object.keys(taskMap).forEach(visit);

  // Forward pass: earliest start = max(original start week, max(dep.ef) for all deps)
  // ef in "week units" where week 1 = index 1
  sorted.forEach(id=>{
    const t=taskMap[id];
    let earliest=t.origStart; // respect original start as minimum
    t.deps.forEach(depId=>{
      if(taskMap[depId]){
        // dep must finish before this starts: start >= dep.end + 1
        earliest=Math.max(earliest, taskMap[depId].ef+1);
      }
    });
    t.es=earliest;
    t.ef=t.es+t.duration-1; // end week inclusive
  });

  // Find project end
  const projectEnd=Math.max(...Object.values(taskMap).map(t=>t.ef));

  // Backward pass: latest finish
  Object.values(taskMap).forEach(t=>{t.lf=projectEnd;t.ls=t.lf-t.duration+1;});
  [...sorted].reverse().forEach(id=>{
    const t=taskMap[id];
    Object.values(taskMap).forEach(other=>{
      if(other.deps.includes(id)){
        t.lf=Math.min(t.lf, other.ls-1);
        t.ls=t.lf-t.duration+1;
      }
    });
  });

  // Critical = slack == 0
  const critical=new Set();
  Object.values(taskMap).forEach(t=>{
    const slack=t.ls-t.es;
    if(slack<=0){
      critical.add(t.id);
    }
  });

  // Build scheduled map
  const scheduled={};
  Object.values(taskMap).forEach(t=>{
    scheduled[t.id]={start:t.es,end:t.ef,duration:t.duration};
  });

  return {scheduled,critical};
}

// ── GANTT DRAWER (overlay) ──
function openGanttDetail(taskId){
  _removeDrawerDOM();
  selectedTask=taskId;
  renderGanttDrawer();
  // Wait for layout to settle (drawer may shift Gantt), then redraw arrows + highlight
  setTimeout(()=>{
    requestAnimationFrame(()=>{
      const scrollEl=document.getElementById('ganttScroll');
      if(scrollEl){
        const {critical:criticalSet}=computeSchedule();
        const visibleTasks=ganttTeamFilter.size>0?TASKS.filter(t=>ganttTeamFilter.has(t.team)):[...TASKS];
        const visibleIds=new Set(visibleTasks.map(t=>t.id));
        drawDependencyArrows(scrollEl,visibleIds,criticalSet);
        highlightArrowsForTask(taskId);
      }
    });
  },50);
}
function _removeDrawerDOM(){
  const bd=document.querySelector('.gantt-drawer-backdrop');
  const dr=document.querySelector('.gantt-drawer-overlay');
  if(bd) bd.remove();
  if(dr) dr.remove();
}
function closeGanttDrawer(){
  selectedTask=null;
  highlightArrowsForTask(null);
  _removeDrawerDOM();
  // Redraw arrows at correct positions after drawer closes (only in gantt mode)
  if(ganttMode){
    setTimeout(()=>{
      requestAnimationFrame(()=>{
        const scrollEl=document.getElementById('ganttScroll');
        if(scrollEl){
          const {critical:criticalSet}=computeSchedule();
          const visibleTasks=ganttTeamFilter.size>0?TASKS.filter(t=>ganttTeamFilter.has(t.team)):[...TASKS];
          const visibleIds=new Set(visibleTasks.map(t=>t.id));
          drawDependencyArrows(scrollEl,visibleIds,criticalSet);
        }
      });
    },50);
  }
}
function toggleDrawerCollapse(){
  const d=document.getElementById('ganttDrawer');
  if(!d) return;
  d.classList.toggle('collapsed');
  // Flip the chevron
  const btn=d.querySelector('.gantt-drawer-collapse svg path');
  if(btn){
    const isCollapsed=d.classList.contains('collapsed');
    btn.setAttribute('d',isCollapsed?'M6 4l4 4-4 4':'M10 4l-4 4 4 4');
  }
}
function renderGanttDrawer(){
  if(!selectedTask) return;
  const task=TASKS.find(t=>t.id===selectedTask);
  if(!task) return;
  const team=getTeam(task.team);
  const subDone=task.subtasks.filter(s=>s.s==='done').length;
  const subTotal=task.subtasks.length;
  const subPct=subTotal?Math.round(subDone/subTotal*100):0;
  const statusLabel={todo:'A faire',progress:'En cours',done:'Termine',blocked:'Bloque'}[task.status];
  const statusColor={todo:'var(--s-todo)',progress:'var(--s-progress)',done:'var(--s-done)',blocked:'var(--s-blocked)'}[task.status];

  // No backdrop — drawer is a side panel, Gantt stays fully interactive

  // Compute scheduled week for this task
  const {scheduled:schedMap}=computeSchedule();
  const sched=schedMap[task.id];
  const origW=parseWeek(task.week);
  const isShifted=sched&&sched.start!==origW.start;
  const schedLabel=sched?`S${sched.start}${sched.end!==sched.start?'-S'+sched.end:''}`:'?';

  const statusDotColor={todo:'var(--s-todo)',progress:'var(--s-progress)',done:'var(--s-done)',blocked:'var(--s-blocked)'}[task.status];

  // drawer
  const drawer=document.createElement('div');
  drawer.className='gantt-drawer-overlay';
  drawer.id='ganttDrawer';
  drawer.innerHTML=`
    <div class="dp-header">
      <button class="gantt-drawer-collapse" onclick="event.stopPropagation();toggleDrawerCollapse()" title="Replier le panneau">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 4l-4 4 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <button class="dp-close" onclick="closeGanttDrawer()">x</button>
      <div class="dp-header-info">
        <div class="dp-id">${task.id} &bull; ${team.name}</div>
        <div class="dp-title">${task.title}</div>
      </div>
    </div>
    <div class="gantt-drawer-collapsed-strip" onclick="toggleDrawerCollapse()">
      <div class="strip-status" style="background:${statusDotColor}"></div>
      <div class="strip-id">${task.id}</div>
      <div class="strip-title">${task.title}</div>
    </div>
    <div class="dp-body">
      <div class="dp-meta-grid">
        <div class="dp-meta-item"><div class="dp-ml">Statut</div><div class="dp-mv"><div class="status-dot" style="background:${statusColor}"></div>${statusLabel}</div></div>
        <div class="dp-meta-item"><div class="dp-ml">Priorite</div><div class="dp-mv">${task.priority==='P0'?'Urgent':task.priority==='P1'?'High':'Medium'} (${task.priority})</div></div>
        <div class="dp-meta-item"><div class="dp-ml">Equipe</div><div class="dp-mv"><div class="status-dot" style="background:${team.hex}"></div>${team.name}</div></div>
        <div class="dp-meta-item"><div class="dp-ml">Responsable</div><div class="dp-mv">${team.lead} (${team.code})</div></div>
        <div class="dp-meta-item"><div class="dp-ml">Phase</div><div class="dp-mv">Phase ${task.phase}${task.phase==='A'?' — Prouver la magie':' — Convertir & gouverner'}</div></div>
        <div class="dp-meta-item"><div class="dp-ml">Semaine</div><div class="dp-mv">${schedLabel}${isShifted?` <span style="font-size:10px;color:var(--s-progress);font-weight:600;">(prevu ${task.week}, decale +${sched.start-origW.start}s par deps)</span>`:''}</div></div>
      </div>

      <div class="dp-section">
        <div class="dp-section-title">Description</div>
        <div class="dp-desc">${task.desc}</div>
      </div>

      <div class="dp-section">
        <div class="dp-section-title">Sous-taches (${subDone}/${subTotal})</div>
        <div class="dp-subtask-list">
          ${task.subtasks.map((sub,idx)=>`
            <div class="dp-subtask sub-${sub.s}" onclick="cycleSubtask('${task.id}',${idx},event);_removeDrawerDOM();openDrawerFor('${task.id}');saveToLocalStorage();">
              <div class="sub-check"></div>
              <span class="sub-text">${sub.t}</span>
            </div>
          `).join('')}
        </div>
        <div class="dp-progress-bar"><div class="dp-progress-fill" style="width:${subPct}%"></div></div>
      </div>

      ${task.deps.length?`<div class="dp-section">
        <div class="dp-section-title">Dependances</div>
        <div class="dp-deps">${task.deps.map(d=>{
          const dep=TASKS.find(t=>t.id===d);
          const depStatus=dep?dep.status:'todo';
          const isCross=dep&&dep.team!==task.team;
          return `<div class="dp-dep" onclick="openDrawerFor('${d}')" title="${dep?dep.title:d}" style="${isCross?'border-color:var(--accent);':''}">
            <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${depStatus==='done'?'var(--s-done)':depStatus==='progress'?'var(--s-progress)':'var(--s-todo)'};margin-right:4px;"></span>
            ${d}${dep?' — '+dep.title.substring(0,35)+(dep.title.length>35?'...':''):''}
            ${isCross?'<span style="font-size:9px;margin-left:4px;color:var(--accent);font-weight:700;">CROSS</span>':''}
          </div>`;
        }).join('')}</div>
      </div>`:''}

      ${task.labels.length?`<div class="dp-section">
        <div class="dp-section-title">Labels</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">${task.labels.map(l=>`<span class="ir-label" style="background:${team.hex}12;color:${team.hex};font-size:12px;padding:3px 10px;">${l}</span>`).join('')}</div>
      </div>`:''}

      ${task.notes?`<div class="dp-section">
        <div class="dp-section-title">Notes</div>
        <div class="dp-note">${task.notes}</div>
      </div>`:''}

      <div class="dp-section">
        <div class="dp-section-title">Actions</div>
        <div class="dp-status-actions">
          <button class="dp-sa" onclick="drawerChangeStatus('${task.id}','todo')">A faire</button>
          <button class="dp-sa primary" onclick="drawerChangeStatus('${task.id}','progress')">Demarrer</button>
          <button class="dp-sa" onclick="drawerChangeStatus('${task.id}','done')" style="color:var(--s-done);border-color:var(--s-done);">Terminer</button>
          <button class="dp-sa" onclick="drawerChangeStatus('${task.id}','blocked')" style="color:var(--s-blocked);border-color:var(--s-blocked);">Bloquer</button>
        </div>
      </div>
    </div>
  `;
  drawer.onclick=e=>e.stopPropagation();
  document.body.appendChild(drawer);
}

// ── DRAW DEPENDENCY ARROWS (SVG) ──
function drawDependencyArrows(scrollEl,visibleIds,criticalSet){
  const existing=scrollEl.querySelector('.gantt-svg-overlay');
  if(existing) existing.remove();

  const gridEl=scrollEl.querySelector('.gantt-grid');
  if(!gridEl) return;

  // Position bars relative to gridEl using getBoundingClientRect
  const gridRect=gridEl.getBoundingClientRect();
  const bars={};
  gridEl.querySelectorAll('.gantt-bar[data-task-id]').forEach(bar=>{
    const id=bar.dataset.taskId;
    const r=bar.getBoundingClientRect();
    const w=r.width, h=r.height;
    if(w<1) return; // skip invisible bars
    const x=r.left-gridRect.left+scrollEl.scrollLeft;
    const y=r.top-gridRect.top+scrollEl.scrollTop;
    bars[id]={x, y, w, h, cx:x+w/2, cy:y+h/2, right:x+w, left:x};
  });
  console.log('[arrows] bars found:',Object.keys(bars).length,'arrow candidates will follow...');

  // Build arrow data — ONLY cross-team + critical path
  const arrows=[];
  let skippedNoBars=0, skippedIntra=0;
  TASKS.forEach(task=>{
    if(!visibleIds.has(task.id)) return;
    task.deps.forEach(depId=>{
      if(!bars[task.id]||!bars[depId]){ skippedNoBars++; return; }
      const fromTask=TASKS.find(t=>t.id===depId);
      const isCross=fromTask&&fromTask.team!==task.team;
      const isCrit=criticalSet.has(task.id)&&criticalSet.has(depId);
      // Skip intra-team non-critical arrows
      if(!isCross&&!isCrit){ skippedIntra++; return; }
      const from=bars[depId];
      const to=bars[task.id];
      arrows.push({from,to,depId,taskId:task.id,isCross,isCrit});
    });
  });
  console.log(`[arrows] drawn:${arrows.length}, skippedNoBars:${skippedNoBars}, skippedIntra:${skippedIntra}`);

  if(!arrows.length) return;

  const svgNs='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(svgNs,'svg');
  svg.classList.add('gantt-svg-overlay');
  const gw=gridEl.scrollWidth;
  const gh=gridEl.scrollHeight;
  svg.setAttribute('width',gw);
  svg.setAttribute('height',gh);
  svg.style.width=gw+'px';
  svg.style.height=gh+'px';

  svg.innerHTML=`
    <defs>
      <marker id="arrowhead-accent" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#5e6ad2"/></marker>
      <marker id="arrowhead-critical" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#ef4444"/></marker>
      <marker id="arrowhead-highlight" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto"><path d="M0,0 L10,4 L0,8 Z" fill="#3b82f6"/></marker>
      <marker id="arrowhead-critical-hl" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto"><path d="M0,0 L10,4 L0,8 Z" fill="#ef4444"/></marker>
    </defs>
  `;

  arrows.forEach(({from,to,depId,taskId,isCross,isCrit})=>{
    const path=document.createElementNS(svgNs,'path');
    // Arrow: prerequisite (from) ──► dependent (to)
    // ALWAYS arrive at target from the LEFT so arrowhead points right ►
    const x1=from.right+3;
    const y1=from.cy;
    const x2=to.left-3;
    const y2=to.cy;
    const dx=x2-x1;
    const dy=y2-y1;
    const absDy=Math.abs(dy);
    let d;

    if(dx>60){
      // Plenty of horizontal room — smooth S-curve
      d=`M${x1},${y1} C${x1+dx*0.4},${y1} ${x2-dx*0.4},${y2} ${x2},${y2}`;
    } else if(dx>10){
      // Small horizontal gap — go down from source, then approach target from left
      const midX=x1+(dx*0.5);
      d=`M${x1},${y1} L${midX},${y1} L${midX},${y2} L${x2},${y2}`;
    } else {
      // Almost no horizontal gap (adjacent weeks) — drop down from source then approach from left
      // Route: go right a bit, drop vertically, go left to align, then right into target
      const stepOut=16;
      const midX=Math.min(x1,x2)-stepOut;
      d=`M${x1},${y1} L${x1+stepOut},${y1} L${x1+stepOut},${y1+dy*0.5} L${midX},${y1+dy*0.5} L${midX},${y2} L${x2},${y2}`;
    }
    path.setAttribute('d',d);
    path.dataset.from=depId;
    path.dataset.to=taskId;
    path.classList.add('dep-arrow');
    if(isCrit) path.classList.add('critical');
    svg.appendChild(path);
  });

  gridEl.style.position='relative';
  gridEl.appendChild(svg);
}

// ── HIGHLIGHT ARROWS + BARS for selected task ──
function highlightArrowsForTask(taskId){
  // Reset all
  document.querySelectorAll('.gantt-svg-overlay').forEach(s=>s.classList.remove('has-selection'));
  document.querySelectorAll('.gantt-svg-overlay .dep-arrow').forEach(p=>p.classList.remove('highlight'));
  document.querySelectorAll('.gantt-bar[data-task-id]').forEach(b=>{b.classList.remove('dimmed','focused');});

  if(!taskId) return;

  // Mark SVG overlay as having a selection (dims non-highlighted arrows via CSS)
  document.querySelectorAll('.gantt-svg-overlay').forEach(s=>s.classList.add('has-selection'));

  // Walk the full dependency chain (up + down) from the selected task
  const connected=new Set();
  function walkUp(id){
    if(connected.has(id)) return;
    connected.add(id);
    const t=TASKS.find(x=>x.id===id);
    if(t) t.deps.forEach(d=>walkUp(d));
  }
  function walkDown(id){
    if(connected.has(id)) return;
    connected.add(id);
    TASKS.filter(t=>t.deps.includes(id)).forEach(t=>walkDown(t.id));
  }
  walkUp(taskId);
  walkDown(taskId);

  // Highlight connected arrows
  let highlighted=0;
  const allArrows=document.querySelectorAll('.gantt-svg-overlay .dep-arrow');
  console.log(`[highlight] task:${taskId}, connected:[${[...connected].join(',')}], arrows in DOM:${allArrows.length}`);
  allArrows.forEach(p=>{
    const f=p.dataset.from, t=p.dataset.to;
    if(connected.has(f)&&connected.has(t)){
      p.classList.add('highlight');
      highlighted++;
      console.log(`[highlight] ✓ ${f} → ${t}`);
    }
  });
  console.log(`[highlight] total highlighted: ${highlighted}`);

  // Dim non-connected bars, focus selected + connected
  document.querySelectorAll('.gantt-bar[data-task-id]').forEach(b=>{
    const id=b.dataset.taskId;
    if(id===taskId){
      b.classList.add('focused');
    } else if(connected.has(id)){
      b.classList.add('focused');
    } else {
      b.classList.add('dimmed');
    }
  });
}

// ══════════════════════════════════════════
//  SEQUENCE VIEW — Topological execution order
// ══════════════════════════════════════════
// Cycle status: todo → progress → done → blocked → todo
const SEQ_STATUS_CYCLE=['todo','progress','done','blocked'];
const SEQ_STATUS_SVG={
  todo:'<circle cx="8" cy="8" r="5.5" stroke="var(--text-quaternary)" stroke-width="1.5" fill="none"/>',
  progress:'<circle cx="8" cy="8" r="5.5" stroke="var(--s-progress)" stroke-width="1.5" fill="none"/><path d="M8 2.5a5.5 5.5 0 0 1 0 11" fill="var(--s-progress)"/>',
  done:'<circle cx="8" cy="8" r="5.5" fill="var(--s-done)"/><path d="M5.5 8.2L7.2 9.9L10.5 6.5" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
  blocked:'<circle cx="8" cy="8" r="5.5" stroke="var(--s-blocked)" stroke-width="1.5" fill="none"/><line x1="5.5" y1="8" x2="10.5" y2="8" stroke="var(--s-blocked)" stroke-width="1.5" stroke-linecap="round"/>'
};

function seqCycleStatus(taskId,ev){
  ev.stopPropagation();
  const task=TASKS.find(t=>t.id===taskId);
  if(!task) return;
  const idx=SEQ_STATUS_CYCLE.indexOf(task.status);
  const next=SEQ_STATUS_CYCLE[(idx+1)%SEQ_STATUS_CYCLE.length];
  task.status=next;
  if(next==='done') task.subtasks.forEach(s=>s.s='done');
  saveToLocalStorage();
  // In-place DOM update
  seqUpdateRow(taskId);
  seqUpdateToolbarStats();
}

function seqUpdateRow(taskId){
  const row=document.querySelector(`.seq-row[data-id="${taskId}"]`);
  if(!row) return;
  const task=TASKS.find(t=>t.id===taskId);
  if(!task) return;
  // Update status icon
  const btn=row.querySelector('.seq-status-btn');
  if(btn){
    btn.innerHTML=`<svg width="16" height="16" viewBox="0 0 16 16">${SEQ_STATUS_SVG[task.status]}</svg>`;
    btn.classList.add('pop');
    setTimeout(()=>btn.classList.remove('pop'),300);
  }
  // Update row classes
  row.className='seq-row'+(task.status==='done'?' is-done':'')+(task.status==='blocked'?' is-blocked':'');
  // Update title strikethrough
  const title=row.querySelector('.seq-row-title');
  if(title){
    title.style.textDecoration=task.status==='done'?'line-through':'none';
    title.style.color=task.status==='done'?'var(--text-tertiary)':'var(--text-primary)';
  }
}

function seqUpdateToolbarStats(){
  const el=document.getElementById('seqStats');
  if(!el) return;
  const done=TASKS.filter(t=>t.status==='done').length;
  const progress=TASKS.filter(t=>t.status==='progress').length;
  const blocked=TASKS.filter(t=>t.status==='blocked').length;
  const todo=TASKS.filter(t=>t.status==='todo').length;
  const pct=Math.round(done/TASKS.length*100);
  el.innerHTML=`
    <span><span class="dot" style="background:var(--s-todo)"></span>${todo}</span>
    <span><span class="dot" style="background:var(--s-progress)"></span>${progress}</span>
    <span><span class="dot" style="background:var(--s-blocked)"></span>${blocked}</span>
    <span><span class="dot" style="background:var(--s-done)"></span>${done}</span>`;
  const bar=document.getElementById('seqProgressBar');
  if(bar) bar.style.width=pct+'%';
  const lbl=document.getElementById('seqPctLabel');
  if(lbl) lbl.textContent=pct+'%';
}

// Generic drawer action: change status, in-place update, reopen drawer
function drawerChangeStatus(taskId,status){
  const task=TASKS.find(t=>t.id===taskId);
  if(!task) return;
  task.status=status;
  if(status==='done') task.subtasks.forEach(s=>s.s='done');
  saveToLocalStorage();
  // In-place updates based on current view
  if(sequenceMode){
    seqUpdateRow(taskId);
    seqUpdateToolbarStats();
  } else if(ganttMode){
    _removeDrawerDOM();
    renderGantt();
  } else {
    _removeDrawerDOM();
    render();
  }
  // Reopen drawer
  setTimeout(()=>openDrawerFor(taskId),sequenceMode?10:60);
}

// Open the drawer from any view
function openDrawerFor(taskId){
  _removeDrawerDOM();
  selectedTask=taskId;
  renderGanttDrawer();
}

function renderSequence(){
  const mainPanel=document.querySelector('.main-panel');
  const {scheduled,critical:criticalSet}=computeSchedule();

  const prioOrder={P0:0,P1:1,P2:2};
  const orderedTasks=[...TASKS].sort((a,b)=>{
    const sa=scheduled[a.id], sb=scheduled[b.id];
    if(sa.start!==sb.start) return sa.start-sb.start;
    const ca=criticalSet.has(a.id)?0:1, cb=criticalSet.has(b.id)?0:1;
    if(ca!==cb) return ca-cb;
    if((prioOrder[a.priority]||2)!==(prioOrder[b.priority]||2)) return (prioOrder[a.priority]||2)-(prioOrder[b.priority]||2);
    return sa.end-sb.end;
  });

  const done=TASKS.filter(t=>t.status==='done').length;
  const progress=TASKS.filter(t=>t.status==='progress').length;
  const blocked=TASKS.filter(t=>t.status==='blocked').length;
  const todo=TASKS.filter(t=>t.status==='todo').length;
  const pct=Math.round(done/TASKS.length*100);

  // Group by start week
  const weekGroups=[];
  let lastW=-1;
  orderedTasks.forEach((t,i)=>{
    const w=scheduled[t.id].start;
    if(w!==lastW){weekGroups.push({week:w,tasks:[]});lastW=w;}
    weekGroups[weekGroups.length-1].tasks.push({task:t,globalIdx:i});
  });

  let html=`<div class="seq-wrapper">
    <div class="seq-toolbar">
      <div class="tb-breadcrumb"><span class="muted">Instack MVP</span><span class="sep">/</span>Ordre d'execution</div>
      <div class="tb-spacer"></div>
      <div class="seq-stats" id="seqStats">
        <span><span class="dot" style="background:var(--s-todo)"></span>${todo}</span>
        <span><span class="dot" style="background:var(--s-progress)"></span>${progress}</span>
        <span><span class="dot" style="background:var(--s-blocked)"></span>${blocked}</span>
        <span><span class="dot" style="background:var(--s-done)"></span>${done}</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        <span id="seqPctLabel" style="font-size:11px;font-weight:700;color:var(--text-secondary);">${pct}%</span>
        <div style="width:64px;height:3px;background:var(--border);border-radius:2px;overflow:hidden;"><div id="seqProgressBar" style="height:100%;width:${pct}%;background:var(--s-done);border-radius:2px;transition:width .4s;"></div></div>
      </div>
      <span style="font-size:11px;font-weight:600;color:var(--text-quaternary);">${orderedTasks.length} taches</span>
    </div>
    <div class="seq-scroll">
    <div class="seq-container">`;

  // Column header
  html+=`<div class="seq-row" style="height:32px;cursor:default;border-bottom:1px solid var(--border);font-size:10px;font-weight:700;color:var(--text-quaternary);text-transform:uppercase;letter-spacing:.4px;">
    <div style="width:28px;"></div>
    <div class="seq-step-num">#</div>
    <div class="seq-row-id">ID</div>
    <div class="seq-row-title" style="font-size:10px;font-weight:700;color:var(--text-quaternary);text-decoration:none !important;">Tache</div>
    <div class="seq-prio" style="background:none;">Prio</div>
    <div class="seq-team" style="background:none;border:none;">Equipe</div>
    <div class="seq-row-week">Sem.</div>
    <div class="seq-row-sub">Sub</div>
  </div>`;

  weekGroups.forEach(({week,tasks:items})=>{
    const phaseLabel=week<=8?'Phase A':'Phase B';
    const wColor=week<=8?'var(--accent)':'var(--t-infra)';
    html+=`<div class="seq-week-group">
      <div class="seq-week-header">
        <span class="seq-week-badge" style="background:${wColor}">S${week}</span>
        <span class="seq-week-phase">${phaseLabel}</span>
        <span class="seq-week-count">${items.length} tache${items.length>1?'s':''}</span>
      </div>`;

    items.forEach(({task,globalIdx})=>{
      const sched=scheduled[task.id];
      const team=getTeam(task.team);
      const isCritical=criticalSet.has(task.id);
      const isDone=task.status==='done';
      const isBlocked=task.status==='blocked';
      const crossDeps=task.deps.filter(d=>{const dep=TASKS.find(x=>x.id===d);return dep&&dep.team!==task.team;});
      const subDone=task.subtasks.filter(s=>s.s==='done').length;
      const subTotal=task.subtasks.length;
      const rowCls='seq-row'+(isDone?' is-done':'')+(isBlocked?' is-blocked':'');

      html+=`<div class="${rowCls}" data-id="${task.id}" onclick="openDrawerFor('${task.id}')">
        <button class="seq-status-btn" onclick="seqCycleStatus('${task.id}',event)" title="Changer le statut">
          <svg width="16" height="16" viewBox="0 0 16 16">${SEQ_STATUS_SVG[task.status]}</svg>
        </button>
        <div class="seq-step-num">${globalIdx+1}</div>
        ${isCritical?'<div class="seq-crit-dot"></div>':''}
        <div class="seq-row-id ${isCritical?'crit':''}">${task.id}</div>
        <div class="seq-row-title">${task.title}</div>
        <div class="seq-prio ${task.priority.toLowerCase()}">${task.priority}</div>
        <div class="seq-team"><span class="dot" style="background:${team.hex}"></span>${team.short}</div>
        ${crossDeps.length?`<div class="seq-deps-ind"><span class="cross-badge">${crossDeps.length}</span> dep${crossDeps.length>1?'s':''}</div>`:''}
        <div class="seq-row-week">S${sched.start}${sched.end>sched.start?'–'+sched.end:''}</div>
        <div class="seq-row-sub">${subTotal?subDone+'/'+subTotal:''}</div>
      </div>`;
    });

    html+=`</div>`;
  });

  html+=`</div></div></div>`;
  mainPanel.innerHTML=html;
}

// ── MAIN GANTT RENDER ──
function renderGantt(){
  const mainPanel=document.querySelector('.main-panel');

  // Compute schedule (forward-pass respecting deps)
  const {scheduled,critical:criticalSet}=computeSchedule();

  // Determine max week to size the grid
  let maxWeek=16;
  Object.values(scheduled).forEach(s=>{if(s.end>maxWeek) maxWeek=s.end;});
  const totalWeeks=Math.max(maxWeek,16);
  const weeks=Array.from({length:totalWeeks},(_,i)=>i+1);

  const visibleTasks=ganttTeamFilter.size>0
    ? TASKS.filter(t=>ganttTeamFilter.has(t.team))
    : [...TASKS];
  const visibleIds=new Set(visibleTasks.map(t=>t.id));

  const teamGroups=[];
  TEAMS.forEach(team=>{
    const items=visibleTasks.filter(t=>t.team===team.id);
    if(items.length) teamGroups.push({team,tasks:items});
  });

  // Count cross-team deps & critical links
  let crossDeps=0,critCount=0;
  visibleTasks.forEach(t=>{t.deps.forEach(d=>{
    const dep=TASKS.find(x=>x.id===d);
    if(dep&&dep.team!==t.team&&visibleIds.has(d)) crossDeps++;
    if(criticalSet.has(t.id)&&criticalSet.has(d)) critCount++;
  });});

  let html=`
    <div class="toolbar">
      <div class="tb-breadcrumb"><span class="muted">Instack MVP</span><span class="sep">/</span>Gantt Timeline</div>
      <div class="tb-spacer"></div>
      <div class="gantt-legend">
        <div class="gantt-legend-item"><div class="gantt-legend-line cross"></div>Inter-equipe (${crossDeps})</div>
        <div class="gantt-legend-item"><div class="gantt-legend-line crit"></div>Chemin critique (${critCount})</div>
      </div>
      <div style="font-size:12px;font-weight:600;color:var(--text-secondary);padding:0 4px;">${visibleTasks.length} taches &bull; ${totalWeeks} sem.</div>
    </div>
    <div class="gantt-toolbar">
      <span class="gantt-label">Equipes</span>
      <div class="gantt-chip ${ganttTeamFilter.size===0?'active':''}" style="${ganttTeamFilter.size===0?'background:var(--accent);border-color:var(--accent);':''}" onclick="clearGanttFilter()">Toutes</div>
      ${TEAMS.map(t=>{
        const active=ganttTeamFilter.has(t.id);
        return `<div class="gantt-chip ${active?'active':''}" style="${active?`background:${t.hex};border-color:${t.hex};color:#fff;`:`color:${t.hex};border-color:${t.hex}40;`}" onclick="toggleGanttTeam('${t.id}')">
          <span class="gc-dot" style="background:${active?'#fff':t.hex}"></span>${t.short}
        </div>`;
      }).join('')}
    </div>
    <div class="gantt-scroll" id="ganttScroll">
      <div class="gantt-grid" style="grid-template-columns:260px repeat(${totalWeeks},minmax(56px,1fr));">
        <div class="gantt-header-row">
          <div class="gh-cell-label">Tache</div>
          ${weeks.map(w=>`<div class="gh-cell gantt-week-col" style="${w===9?'border-left:2px solid var(--accent);':''}">S${w}</div>`).join('')}
        </div>
        <div class="gantt-header-row">
          <div class="gh-cell-label" style="padding:2px 12px;font-size:10px;font-weight:600;">
            <span style="color:var(--accent);">Phase A (S1-S8)</span><span style="color:var(--text-quaternary);margin:0 6px;">|</span><span style="color:var(--t-infra);">Phase B (S9-S16${totalWeeks>16?'+':''})</span>
          </div>
          ${weeks.map(w=>`<div class="gh-cell gantt-week-col" style="padding:2px 4px;font-size:9px;color:${w<=8?'var(--accent)':'var(--t-infra)'};opacity:.6;${w===9?'border-left:2px solid var(--accent);':''}">${w<=8?'A':'B'}</div>`).join('')}
        </div>`;

  teamGroups.forEach(({team,tasks})=>{
    const done=tasks.filter(t=>t.status==='done').length;
    const pct=tasks.length?Math.round(done/tasks.length*100):0;

    html+=`<div class="gantt-phase-row">
      <div class="gp-label">
        <span style="width:10px;height:10px;border-radius:3px;background:${team.hex};flex-shrink:0;"></span>
        <span style="flex:1;">${team.name}</span>
        <span style="font-size:10px;font-weight:700;color:${pct>0?'var(--s-done)':'var(--text-quaternary)'};">${pct}%</span>
      </div>
      ${weeks.map(()=>`<div class="gp-cell gantt-week-col"></div>`).join('')}
    </div>`;

    tasks.forEach(task=>{
      // USE SCHEDULED WEEKS (dependency-aware) instead of static
      const sched=scheduled[task.id];
      const start=sched.start;
      const end=sched.end;
      const origW=parseWeek(task.week);
      const shifted=start!==origW.start; // was pushed by deps
      const statusClass=task.status;
      const isCritical=criticalSet.has(task.id);
      const hasCrossDep=task.deps.some(d=>{const dep=TASKS.find(x=>x.id===d);return dep&&dep.team!==task.team;});

      html+=`<div class="gantt-task-row" data-row-id="${task.id}">
        <div class="gt-label" onclick="event.stopPropagation();openGanttDetail('${task.id}')">
          <div class="gt-status ${statusClass}" style="position:relative;"></div>
          <span class="gt-id">${task.id}</span>
          <span class="gt-title" style="${isCritical?'color:var(--s-blocked);font-weight:600;':''}">${task.title}</span>
          ${hasCrossDep?'<span style="font-size:8px;color:var(--accent);font-weight:800;flex-shrink:0;">CROSS</span>':''}
          ${shifted?`<span style="font-size:8px;color:var(--s-progress);font-weight:700;flex-shrink:0;" title="Decale de S${origW.start} a S${start} par dependances">+${start-origW.start}s</span>`:''}
        </div>
        ${weeks.map(w=>{
          const isStart=(w===start);
          const span=end-start+1;
          if(isStart){
            return `<div class="gt-cell gantt-week-col" style="position:relative;grid-column:span ${span};">
              <div class="gantt-bar status-${statusClass} ${isCritical?'critical':''}" data-task-id="${task.id}" style="left:4px;right:4px;background:${team.hex};cursor:pointer;${shifted?'border:1.5px dashed rgba(255,255,255,0.5);':''}" onclick="event.stopPropagation();openGanttDetail('${task.id}')" title="${task.id}: ${task.title} (S${start}-S${end})${shifted?' [decale depuis S'+origW.start+']':''}${isCritical?' — CHEMIN CRITIQUE':''}">
                ${span>=2?task.id:''}
              </div>
            </div>`;
          } else if(w>start && w<=end){
            return '';
          } else {
            return `<div class="gt-cell gantt-week-col"></div>`;
          }
        }).join('')}
      </div>`;
    });
  });

  html+=`</div></div>`;
  mainPanel.innerHTML=html;

  // Draw arrows after DOM is ready, then re-apply highlight if a task is selected
  requestAnimationFrame(()=>{
    const scrollEl=document.getElementById('ganttScroll');
    if(scrollEl) drawDependencyArrows(scrollEl,visibleIds,criticalSet);
    // Re-apply highlight if drawer is open
    if(selectedTask) highlightArrowsForTask(selectedTask);
  });
}

// ══════════════════════════════════════════
//  PERSISTENCE — localStorage + JSON export/import
// ══════════════════════════════════════════
const STORAGE_KEY='instack_dashboard_v1';

function getState(){
  return {
    version:1,
    savedAt:new Date().toISOString(),
    tasks:TASKS.map(t=>({id:t.id,status:t.status,subtasks:t.subtasks.map(s=>s.s)})),
    currentView,groupBy,collapsedGroups,ganttMode,sequenceMode,ganttTeamFilter:[...ganttTeamFilter]
  };
}

function applyState(state){
  if(!state||!state.tasks) return false;
  state.tasks.forEach(saved=>{
    const task=TASKS.find(t=>t.id===saved.id);
    if(task){
      task.status=saved.status;
      if(saved.subtasks){
        saved.subtasks.forEach((s,i)=>{if(task.subtasks[i]) task.subtasks[i].s=s;});
      }
    }
  });
  if(state.currentView) currentView=state.currentView;
  if(state.groupBy) groupBy=state.groupBy;
  if(state.collapsedGroups) collapsedGroups=state.collapsedGroups;
  if(state.ganttMode!==undefined) ganttMode=state.ganttMode;
  if(state.sequenceMode!==undefined) sequenceMode=state.sequenceMode;
  if(state.ganttTeamFilter) ganttTeamFilter=new Set(state.ganttTeamFilter);
  return true;
}

function saveToLocalStorage(){
  try{
    localStorage.setItem(STORAGE_KEY,JSON.stringify(getState()));
    const ind=document.getElementById('saveIndicator');
    if(ind){
      ind.textContent='Sauvegarde '+new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
      ind.style.color='var(--s-done)';
      setTimeout(()=>{ind.style.color='var(--text-tertiary)';},1500);
    }
  }catch(e){console.warn('localStorage save failed',e);}
}

function loadFromLocalStorage(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY);
    if(!raw) return false;
    return applyState(JSON.parse(raw));
  }catch(e){console.warn('localStorage load failed',e);return false;}
}

function exportJSON(){
  const state=getState();
  const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download=`instack_dashboard_${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importJSON(e){
  const file=e.target.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=function(ev){
    try{
      const state=JSON.parse(ev.target.result);
      if(applyState(state)){
        saveToLocalStorage();
        render();
        // re-activate sidebar item
        document.querySelectorAll('.sb-item').forEach(i=>{
          if(i.dataset.view===currentView) i.classList.add('active');
          else i.classList.remove('active');
        });
        const ind=document.getElementById('saveIndicator');
        if(ind){ind.textContent='Import reussi !';ind.style.color='var(--s-done)';setTimeout(()=>{ind.style.color='var(--text-tertiary)';ind.textContent='Sauvegarde auto active';},2000);}
      }
    }catch(err){alert('Fichier JSON invalide.');}
  };
  reader.readAsText(file);
  e.target.value='';
}

// ══════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════
loadFromLocalStorage();
// activate correct sidebar item
if(ganttMode){
  document.querySelectorAll('.sb-item').forEach(i=>{i.classList.remove('active');if(i.dataset.view==='gantt')i.classList.add('active');});
} else if(sequenceMode){
  document.querySelectorAll('.sb-item').forEach(i=>{i.classList.remove('active');if(i.dataset.view==='sequence')i.classList.add('active');});
} else {
  document.querySelectorAll('.sb-item').forEach(i=>{i.classList.remove('active');if(i.dataset.view===currentView)i.classList.add('active');});
}
render();
</script>
</body>
</html>

```

</details>
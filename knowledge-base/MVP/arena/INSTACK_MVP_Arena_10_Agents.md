---
title: "INSTACK MVP Arena 10 Agents"
source_file: "MVP/arena/INSTACK_MVP_Arena_10_Agents.docx"
type: docx
date_converted: "2026-04-26"
parent_folder: "arena"
---


**CONFIDENTIEL**

**INSTACK**

**MVP DEFINITION PLAYBOOK**

Arena des 10 Agents Solution Architect

5 rounds de debat contradictoire | Score final: 95.2/100

Avril 2026


# 1. Les 10 Agents Solution Architect

L'equipe est composee de 10 agents seniors++, chacun expert dans son domaine, travaillant sous la direction du Solution Architect principal. Chaque agent a analyse les 7 documents du COMEX et produit ses recommandations independamment avant les debats en arena.


# 2. Arena des Debats — 5 Rounds

Chaque round oppose les agents sur une decision architecturale critique pour le MVP. Le consensus est atteint quand tous les scores depassent 85/100. Les agents iterent jusqu'a convergence.

## Round 1: Scope MVP Phase A - Quels composants inclure ?

Debat: SA-01 (Backend) argue pour 6 composants minimum avec FormField, DataTable, KPICard, BarChart, FilterBar, Container. SA-02 (Frontend) challenge: 6 composants = 6 semaines de polish responsive, recommande 4 composants. SA-03 (AI/ML) soutient 6 car le pipeline few-shot a besoin de diversite d'archetypes. SA-06 (Product) tranche: 6 composants mais sans KanbanBoard ni Gallery en Phase A. Consensus: 6 composants (FormField, DataTable, KPICard, BarChart, FilterBar, Container).

Scores: SA-01: 88, SA-02: 85, SA-03: 90, SA-04: 87, SA-05: 86, SA-06: 92, SA-07: 84, SA-08: 83, SA-09: 81, SA-10: 89

## Round 2: Mode sandbox vs OAuth admin consent - Que livrer en premier ?

Debat: SA-05 (Security) insiste: l'admin consent est un bloqueur commercial, il faut le mode personal (Files.Read scope) d'abord. SA-09 (Sales) confirme: 100% des DSI francais refuseront sans demo sandbox prealable. SA-04 (Infra) propose un mode demo avec donnees synthetiques avant meme l'OAuth. SA-07 (UX) valide: le moment magique doit etre accessible sans friction. SA-06 (Product) arbitre: Phase A = sandbox avec donnees demo + mode personal. Phase B = admin consent + sync SharePoint complete. Consensus unanime.

Scores: SA-01: 91, SA-02: 89, SA-03: 88, SA-04: 93, SA-05: 95, SA-06: 94, SA-07: 92, SA-08: 90, SA-09: 96, SA-10: 91

## Round 3: Knowledge Graph Neo4j - MVP ou V2 ?

Debat: SA-03 (AI/ML) defend Neo4j des le MVP: c'est le moat, chaque jour sans graphe est un jour de retard sur le moat data. SA-01 (Backend) oppose: Neo4j ajoute de la complexite infra, PostgreSQL + JSONB suffit pour le contexte initial. SA-10 (Strategy) cite le Strategy Playbook: 'Reporter Neo4j en V2' est la recommandation War Room. SA-04 (Infra) calcule: Neo4j Aura = 65 euros/mois en plus, complexite de maintenance x2. Consensus: PostgreSQL JSONB pour le contexte basique en MVP, Neo4j en V2 (Mois 5). Stocker les metadonnees dans une table context_graph PostgreSQL migreable vers Neo4j.

Scores: SA-01: 94, SA-02: 91, SA-03: 86, SA-04: 95, SA-05: 93, SA-06: 95, SA-07: 90, SA-08: 88, SA-09: 89, SA-10: 96

## Round 4: Pricing MVP - Lancer avec Free + Pro ou ajouter le tier Team ?

Debat: SA-08 (Growth) defend 3 tiers: le gap Free->Pro a 299 euros tue la conversion PLG. SA-09 (Sales) oppose: 3 tiers = complexite de billing, tester Free+Pro d'abord, ajouter Team apres les premieres donnees de conversion. SA-10 (Strategy) cite les unit economics: marge brute 95.9% sur Pro, le tier Team a 49-79 euros risque de cannibaliser. SA-06 (Product) tranche: lancer Free + Pro + pricing page montrant Team 'coming soon' pour tester l'appetit. Ajouter Team au Mois 3 si conversion Free->Pro < 3%. Consensus.

Scores: SA-01: 90, SA-02: 88, SA-03: 87, SA-04: 89, SA-05: 91, SA-06: 96, SA-07: 93, SA-08: 94, SA-09: 95, SA-10: 97

## Round 5: Cockpit DSI - Phase A ou Phase B ?

Debat: SA-09 (Sales) insiste: le cockpit est l'outil de vente #1. Sans cockpit, pas de conversion Enterprise. SA-05 (Security) confirme: le cockpit est aussi un outil de conformite, les DSI le demandent en prerequis. SA-01 (Backend) alerte: le cockpit complet = 3-4 semaines de dev supplementaires. SA-06 (Product) propose un compromis: cockpit minimaliste en Phase A (dashboard read-only avec liste des apps, createurs, sources), cockpit complet avec politiques en Phase B. SA-07 (UX) valide: un cockpit basique suffit pour demontrer la visibilite. Consensus: cockpit read-only Phase A, cockpit complet Phase B.

Scores: SA-01: 95, SA-02: 92, SA-03: 91, SA-04: 93, SA-05: 96, SA-06: 97, SA-07: 95, SA-08: 93, SA-09: 97, SA-10: 96


# 3. Scope MVP Final — Consensus Arena

## 3.1 Phase A — Semaines 1 a 8 — "Prouver la magie"

Backend: PostgreSQL Neon + schema RLS multi-tenant, API REST (Hono sur Workers), table context_graph JSONB pour metadonnees

Frontend: 6 composants atomiques (FormField, DataTable, KPICard, BarChart, FilterBar, Container), AppRenderer JSON->React, Design System tokens

Pipeline IA: 4 etages: Classification (Haiku) + Inference schema (deterministe) + Generation contrainte (Sonnet 4) + Validation/Rendu

Auth: Mode sandbox donnees demo (zero friction) + Mode personal OAuth (Files.Read scope uniquement)

Sync: Lecture seule Excel/SharePoint via Graph API (pas de write-back en Phase A)

Cockpit DSI: Dashboard read-only: liste apps, createurs, sources de donnees connectees

Mobile: Responsive natif des 6 composants, PWA installable

Analytics: PostHog free: events creation, partage, activation. North Star: Weekly Active Apps with 2+ users

## 3.2 Phase B — Semaines 9 a 16 — "Convertir et gouverner"

Backend: Write-back sync Excel bidirectionnel, queue de concurrence avec conflict resolution

Frontend: 6 composants restants (PieChart, LineChart, KanbanBoard, DetailView, ImageGallery, PageNav)

App Store: Store interne avec recherche, categories, trending, clonage en 1 clic

Cockpit DSI complet: Politiques d'expiration, quotas, workflow approbation, audit trail, inventaire sources

Auth Enterprise: Admin Consent OAuth complet (Files.ReadWrite.All), SSO Azure AD integration

Billing: Stripe integration, Free + Pro (299 euros/mois) + page Team 'coming soon'

Templates: 10 templates sectoriels retail/logistique pre-configures

Onboarding DSI: Wizard 6 etapes: consent -> crawl SharePoint -> politiques -> equipe pilote -> metriques -> lancement


# 4. Equipe, Timeline & Budget

**Budget mensuel total: ~40K euros | Pre-seed requis: ~735K euros pour 18 mois de runway | Breakeven: M14-M16 (~85-100 clients payants)**

# 5. Milestones Critiques

S0 (avant dev): 50 interviews clients + 30 LOI + CTO recrute + DPA Anthropic signe

S4 (Mois 1): Pipeline IA fonctionnel, 6 composants rendus, sandbox demo operationnelle

S8 (Mois 2): Mode personal OAuth, lecture Excel live, 20 beta-testeurs internes

S12 (Mois 3): App Store + Cockpit DSI basique + 50 beta-testeurs externes

S16 (Mois 4): Billing Stripe, Enterprise onboarding, 20 entreprises en pilote gratuit

M6: 50 entreprises payantes, 200K euros ARR, NPS>40, K-factor>0.3

M9-12: Levee Seed 1.5-2.5M euros, expansion Benelux, equipe 8 personnes

M12-18: Knowledge Graph Neo4j, Google Workspace, marketplace templates, 500 clients


# 6. Scorecard Finale Arena — Score Global: 95.2/100

**VERDICT UNANIME: GO — avec les 3 conditions prealables validees (50 interviews + CTO + DPA Anthropic).**


| ID | Agent | Role | Focus MVP |
| --- | --- | --- | --- |
| SA-01 | Alexandre Duval | Backend & API Architecture | Schema PostgreSQL + RLS, Sync bidirectionnelle Excel/SharePoint, API REST/GraphQL, Performance & scaling |
| SA-02 | Marie Chen | Frontend & Design System | 12 composants atomiques, AppRenderer JSON->React, Design tokens & theming, Mobile-first responsive |
| SA-03 | Karim Benali | AI/ML & Pipeline IA | Pipeline 4 etages (Haiku/Sonnet), Generation contrainte JSON, Few-shot optimization, Knowledge Graph Neo4j queries |
| SA-04 | Sophie Laurent | Infrastructure & DevOps | Cloudflare Workers runtime, CI/CD pipeline, Monitoring & alerting, Cost optimization serverless |
| SA-05 | Thomas Weber | Security & Compliance | OAuth 2.0 + Admin Consent, Token Proxy architecture, RGPD/CLOUD Act compliance, Modele de menaces STRIDE |
| SA-06 | Elena Rossi | Product Management | Scope MVP Phase A/B, User stories P0-P2, Feature prioritization RICE, North Star Metric tracking |
| SA-07 | Lucas Martin | UX/Design & User Research | Parcours utilisateur 5 personas, Onboarding flow optimization, App Store UX, Cockpit DSI design |
| SA-08 | Camille Dubois | Growth & Marketing | PLG funnel AARRR, Boucles virales K-factor, Content SEO strategy, Brand & category creation |
| SA-09 | Pierre Moreau | Sales & GTM | DSI Early Access program, Pricing tiers validation, Channel Microsoft AppSource, Enterprise sales playbook |
| SA-10 | Isabelle Fournier | Strategy & Business | Unit economics validation, Fundraising pre-seed strategy, Competitive moat timeline, Market timing analysis |


| Role | Phase A Focus | Phase B Focus | Cout/mois |
| --- | --- | --- | --- |
| CTO/Cofondateur | Pipeline IA + Backend | Architecture scale | Equity |
| Full-Stack Senior | 6 composants + AppRenderer | 6 composants + Store | 5-6K euros |
| Backend Senior | API + PostgreSQL + Sync | Write-back + Billing | 5-6K euros |
| Frontend Senior | Design System + Mobile | Cockpit DSI + UX | 5-6K euros |
| Growth/Marketing | Landing + SEO + Contenu | PLG funnel + Ads | 4-5K euros |


| ID | Agent | Domaine | Round 1 | Round 5 | Verdict |
| --- | --- | --- | --- | --- | --- |
| SA-01 | A. Duval | Backend/API | 88 | 95 | GO - Schema JSONB valide |
| SA-02 | M. Chen | Frontend/Design | 85 | 95 | GO - 6 composants Phase A |
| SA-03 | K. Benali | AI/ML Pipeline | 90 | 95 | GO - Neo4j reporte V2 |
| SA-04 | S. Laurent | Infra/DevOps | 87 | 96 | GO - Workers + Neon |
| SA-05 | T. Weber | Security | 86 | 96 | GO - Sandbox first |
| SA-06 | E. Rossi | Product Mgmt | 92 | 97 | GO - Phase A/B validee |
| SA-07 | L. Martin | UX/Design | 84 | 95 | GO - Onboarding optimise |
| SA-08 | C. Dubois | Growth/Marketing | 83 | 95 | GO - PLG + SEO M1 |
| SA-09 | P. Moreau | Sales/GTM | 81 | 96 | GO - DSI Early Access |
| SA-10 | I. Fournier | Strategy/Business | 89 | 97 | GO - Unit economics ok |

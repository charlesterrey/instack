# 01 — ORGANISATION — Registre des 36 Agents

> **Classification**: ALPHA — Registre Complet
> **Protocole**: Chaque agent est identifié par @CODENAME et assigné à une division

---

## DIVISION 1 : C-SUITE (ALPHA Clearance)

Direction stratégique. Chaque C-Level a le dernier mot dans son domaine.

### @SOVEREIGN — CEO / Founder
- **Division**: `equipe/c-suite/`
- **Domaine**: Vision stratégique, fundraising, category creation
- **Décide sur**: Positionnement marché, pricing final, roadmap stratégique, go/no-go
- **Consulte**: Tous les documents dans `knowledge-base/` et `knowledge-strat/`
- **Deliverables**: Pitch deck, investor materials, strategic memos
- **Escalation**: Quand un trade-off impacte la vision produit ou le positionnement

### @ARCHITECT — CTO
- **Division**: `equipe/c-suite/`
- **Domaine**: Architecture technique, sélection techno, dette technique
- **Décide sur**: Choix d'architecture, stack, patterns, ADRs
- **Consulte**: `knowledge-base/instack_technical_blueprint.md`, `MVP/playbooks/INSTACK_MVP_Playbook_Tech_Dev.docx`
- **Deliverables**: ADRs, architecture diagrams, tech specs, code reviews
- **Escalation**: Quand une décision technique impacte la sécurité ou les coûts

### @ORACLE — CPO
- **Division**: `equipe/c-suite/`
- **Domaine**: Vision produit, personas, priorités features, North Star
- **Décide sur**: Scope MVP, user stories, design principles, métriques produit
- **Consulte**: `knowledge-base/instack_product_blueprint.md`, `MVP/playbooks/INSTACK_MVP_Playbook_Product_UX.docx`
- **Deliverables**: PRDs, user story maps, persona cards, roadmap produit
- **Escalation**: Quand un compromis UX impacte l'activation ou la rétention

### @VANGUARD — CMO
- **Division**: `equipe/c-suite/`
- **Domaine**: Brand, content, demand gen, category evangelism
- **Décide sur**: Messaging, brand voice, canaux d'acquisition, budget marketing
- **Consulte**: `knowledge-base/instack_marketing_blueprint.md`, `MVP/playbooks/INSTACK_MVP_Playbook_Marketing_Growth.docx`
- **Deliverables**: Brand guidelines, content calendar, campaign briefs, battle cards
- **Escalation**: Quand le messaging entre en conflit avec le positionnement technique

### @IRONCLAD — CFO
- **Division**: `equipe/c-suite/`
- **Domaine**: Financial model, unit economics, fundraising
- **Décide sur**: Pricing tiers, burn rate, hiring budget, investment allocation
- **Consulte**: `knowledge-strat/`, `MVP/playbooks/INSTACK_MVP_Playbook_Sales_Strategy.docx`
- **Deliverables**: Financial model, cap table, investor materials, pricing analysis
- **Escalation**: Quand un coût technique dépasse le budget prévu

### @SENTINEL — COO
- **Division**: `equipe/c-suite/`
- **Domaine**: Exécution opérationnelle, OKRs, process, hiring
- **Décide sur**: Sprint planning, resource allocation, vendor contracts, OKRs
- **Consulte**: Tous les playbooks dans `MVP/playbooks/`
- **Deliverables**: OKR sheets, sprint reports, hiring pipeline, risk register
- **Escalation**: Quand un sprint est en retard ou qu'une dépendance est bloquée

---

## DIVISION 2 : ENGINEERING (OMEGA Clearance)

Construction technique. Chaque ingénieur est responsable de son domaine end-to-end.

### @NEXUS — Lead System Architect
- **Division**: `equipe/engineering/`
- **Domaine**: Architecture système, API contracts, schéma DB, coûts infra
- **Responsabilités sprint**:
  - S01: Monorepo Turborepo + schéma PostgreSQL 7 tables + RLS policies
  - S02: API skeleton Hono + middleware chain
  - S08: Review intégration E2E
- **Outputs**: `src/packages/api/drizzle/`, `src/packages/shared/types/`, ADRs
- **Bloque**: @FORGE, @CONDUIT, @CORTEX (ils dépendent du schéma)
- **Bloqué par**: Rien — il démarre en premier

### @FORGE — Backend/API Engineer
- **Division**: `equipe/engineering/`
- **Domaine**: API Hono, middleware, auth, endpoints, business logic
- **Responsabilités sprint**:
  - S02: Auth middleware OAuth + JWT + routes CRUD
  - S07: Sandbox demo + seed data
  - S09: Write-back endpoints
  - S13: Billing Stripe integration
- **Outputs**: `src/packages/api/routes/`, `src/packages/api/services/`, `src/packages/api/middleware/`
- **Bloque**: @PRISM (frontend a besoin des APIs), @CONDUIT (sync endpoints)
- **Bloqué par**: @NEXUS (schéma DB), @PHANTOM (security middleware)

### @PRISM — Frontend/UI Engineer
- **Division**: `equipe/engineering/`
- **Domaine**: React 18, composants atomiques, AppRenderer, pages
- **Responsabilités sprint**:
  - S04: AppRenderer (JSON → React)
  - S05: 6 composants Phase A (FormField, DataTable, KPICard, BarChart, FilterBar, Container)
  - S10: 6 composants Phase B (PieChart, LineChart, KanbanBoard, DetailView, ImageGallery, PageNav)
  - S11: App Store UI
  - S12: Cockpit DSI UI
  - S15: Polish + Performance + A11y
- **Outputs**: `src/packages/web/`, `src/packages/ui/`
- **Bloque**: Rien en aval — il produit le frontend final
- **Bloqué par**: @FORGE (APIs), @MOSAIC (design tokens), @NEURON (pipeline output format)

### @PHANTOM — Security & Compliance Engineer
- **Division**: `equipe/engineering/`
- **Domaine**: Sécurité, OAuth 2.0, chiffrement, CSP, RLS audit, RGPD
- **Responsabilités sprint**:
  - S02: OAuth 2.0 flow + Token Proxy + CSP headers
  - S04: AST security scan (Stage 4 pipeline)
  - Continu: Security audit chaque sprint
- **Outputs**: `src/packages/api/middleware/auth.middleware.ts`, security policies, STRIDE threat model
- **Bloque**: @FORGE (auth middleware ready), @NEURON (security scan stage)
- **Bloqué par**: @NEXUS (RLS policies dans le schéma)

### @CONDUIT — Integration Engineer (M365/Graph API)
- **Division**: `equipe/engineering/`
- **Domaine**: Microsoft Graph API, Excel parsing, SharePoint sync
- **Responsabilités sprint**:
  - S03: Schema inference depuis colonnes Excel (Stage 2 pipeline)
  - S06: Excel sync read-only via Graph API
  - S09: Write-back bidirectionnel
- **Outputs**: `src/packages/api/services/graph-api.service.ts`, `src/packages/ai-pipeline/stages/02-infer-schema.ts`
- **Bloque**: @NEURON (Stage 2 feed Stage 3), @PRISM (data pour les composants)
- **Bloqué par**: @PHANTOM (OAuth tokens), @NEXUS (data_sources table)

### @NEURON — AI/ML Pipeline Engineer
- **Division**: `equipe/engineering/`
- **Domaine**: Pipeline IA 4 stages, prompts Claude, validation, coût tracking
- **Responsabilités sprint**:
  - S03: Stage 1 (Intent Classification, Claude Haiku) + Stage 2 (Schema Inference, déterministe)
  - S04: Stage 3 (Constrained Generation, Claude Sonnet 4) + Stage 4 (Validation)
  - S08: Pipeline E2E tests + quality gates
- **Outputs**: `src/packages/ai-pipeline/`
- **Bloque**: @PRISM (app schema pour le rendu), @FORGE (generation endpoint)
- **Bloqué par**: @CONDUIT (Stage 2 schema), @PHANTOM (AST security scan)

### @WATCHDOG — DevOps/SRE
- **Division**: `equipe/engineering/`
- **Domaine**: CI/CD, Cloudflare deployment, monitoring, SLOs
- **Responsabilités sprint**:
  - S01: GitHub Actions CI + Wrangler deploy config
  - S08: Monitoring stack (PostHog + Sentry)
  - S16: Production readiness + load testing
- **Outputs**: `.github/workflows/`, `infrastructure/`, monitoring dashboards
- **Bloque**: Rien — il supporte tout le monde
- **Bloqué par**: @NEXUS (infra decisions)

---

## DIVISION 3 : PRODUCT (DELTA Clearance)

Définition produit et expérience utilisateur.

### @COMPASS — Product Strategy Lead
- **Division**: `equipe/product/`
- **Domaine**: Roadmap, RICE prioritization, competitive landscape, pricing
- **Responsabilités**: Priorisation features, scoring RICE, personas management
- **Interagit avec**: @ORACLE (validation CPO), @BLUEPRINT (sprint planning)

### @SPECTRUM — UX/UI Design Lead
- **Division**: `equipe/product/`
- **Domaine**: Interaction design, visual design, responsive, animations
- **Responsabilités sprint**:
  - S05: Specs visuelles des 6 composants Phase A
  - S07: Sandbox UX flow
  - S11: App Store UX
  - S12: Cockpit DSI UX
  - S14: Onboarding flows
- **Interagit avec**: @PRISM (handoff design→code), @MOSAIC (tokens)

### @ECHO — User Research Lead
- **Division**: `equipe/product/`
- **Domaine**: Recherche utilisateur, interviews, usability tests
- **Responsabilités**: Validation des 5 personas, tests utilisateur post-sprint
- **Interagit avec**: @ORACLE (insights→decisions), @SPECTRUM (UX fixes)

### @CATALYST — Product Analytics Expert
- **Division**: `equipe/product/`
- **Domaine**: Event taxonomy, PostHog config, funnel analysis, A/B tests
- **Responsabilités**:
  - S08: Event taxonomy (40+ events) + PostHog setup
  - S14: Activation funnel instrumentation
- **Interagit avec**: @FLUX (data pipeline), @WILDFIRE (growth metrics)

### @BLUEPRINT — Technical Product Manager
- **Division**: `equipe/product/`
- **Domaine**: User stories, sprint planning, acceptance criteria, dependencies
- **Responsabilités**: Rédaction des user stories détaillées, gestion du backlog
- **Interagit avec**: @SENTINEL (sprint coordination), tous les ingénieurs (acceptance criteria)

### @MOSAIC — Design System Architect
- **Division**: `equipe/product/`
- **Domaine**: Design tokens, component APIs, accessibility, layout engine
- **Responsabilités sprint**:
  - S01: Design token architecture (CSS variables)
  - S05: Component API specifications (TypeScript interfaces)
  - S10: Advanced component specs
  - S15: Accessibility audit (WCAG 2.1 AA)
- **Interagit avec**: @PRISM (implementation), @SPECTRUM (visual specs)
- **Référence**: Untitled UI React — https://www.untitledui.com/react/docs/introduction

---

## DIVISION 4 : GROWTH-MARKETING (SIGMA Clearance)

Acquisition, activation, rétention, viralité.

### @WILDFIRE — Growth Hacking Lead
- **Division**: `equipe/growth-marketing/`
- **Domaine**: PLG optimization, AARRR, viral loops, experimentation
- **Responsabilités**: 200+ experiments/year, ICE-PLG scoring, funnel optimization
- **Interagit avec**: @CATALYST (metrics), @PULSE (PLG), @MATRIX (experiments)

### @SIGNAL — Content & SEO Strategist
- **Division**: `equipe/growth-marketing/`
- **Domaine**: 5 topic clusters SEO, LinkedIn ghostwriting, content strategy
- **Responsabilités**: Content calendar, blog posts, LinkedIn posts pour @SOVEREIGN
- **Interagit avec**: @THUNDER (brand voice), @VANGUARD (messaging approval)

### @PULSE — PLG Architect
- **Division**: `equipe/growth-marketing/`
- **Domaine**: Freemium architecture, conversion walls, PQL scoring, viral loops
- **Responsabilités sprint**:
  - S11: App Store viral mechanics
  - S13: Upgrade flow UX
  - S14: Activation & sharing loops
- **Interagit avec**: @WILDFIRE (experiments), @FORGE (API limits), @PRISM (UI walls)

### @THUNDER — Brand & Creative Director
- **Division**: `equipe/growth-marketing/`
- **Domaine**: Brand identity, visual identity, manifesto, creative direction
- **Responsabilités**: Brand guidelines enforcement, "instack" lowercase always, no sub-brands
- **Interagit avec**: @VANGUARD (brand strategy), @SPECTRUM (design alignment)

### @RADAR — Marketing Analytics & Attribution
- **Division**: `equipe/growth-marketing/`
- **Domaine**: RevOps stack, attribution, UTM governance, dashboards
- **Responsabilités**: PostHog + HubSpot + GA4 + BigQuery + Metabase pipeline
- **Interagit avec**: @FLUX (data pipeline), @LENS (BI dashboards)

### @CONQUEST — Demand Generation & Campaigns
- **Division**: `equipe/growth-marketing/`
- **Domaine**: Multi-channel demand gen, LinkedIn Ads, ABM, email nurture
- **Responsabilités sprint**:
  - S16: Launch campaign assets
- **Interagit avec**: @HUNTER (outbound alignment), @SIGNAL (content), @RADAR (attribution)

---

## DIVISION 5 : SALES-REVENUE (GAMMA Clearance)

Pipeline commercial et revenus.

### @HUNTER — Outbound Prospecting Specialist
- **Division**: `equipe/sales-revenue/`
- **Domaine**: ICP "Power Apps Refugee", sequences outbound, LinkedIn prospecting
- **Responsabilités**: 3 sequences (Power Apps 60%, Excel Heavy 25%, New Role 15%)
- **Interagit avec**: @CONQUEST (campaign alignment), @CLOSER (qualified leads handoff)

### @CLOSER — Account Executive / Deal Closer
- **Division**: `equipe/sales-revenue/`
- **Domaine**: MEDDPICC, discovery calls, demos, proposals, negotiation
- **Responsabilités**: 3 sales motions (Pro 7-14j, Team 14-30j, Enterprise 60-120j)
- **Interagit avec**: @HUNTER (lead intake), @DIPLOMAT (enterprise deals), @ANCHOR (post-close handoff)

### @ANCHOR — Customer Success & Retention
- **Division**: `equipe/sales-revenue/`
- **Domaine**: Onboarding, health scoring, churn prevention, Champions program
- **Responsabilités**: Customer lifecycle (Day 0-7, Week 2-4, Month 2-6), QBRs
- **Interagit avec**: @CLOSER (handoff), @WILDFIRE (expansion signals), @ECHO (user feedback)

### @STRATEGIST — Revenue Operations Lead
- **Division**: `equipe/sales-revenue/`
- **Domaine**: Account scoring, pipeline management, forecasting, comp
- **Responsabilités**: Pipeline 8 stages, lead routing, forecast model
- **Interagit avec**: @IRONCLAD (financial targets), @RADAR (attribution data)

### @DIPLOMAT — Enterprise & DSI Sales Specialist
- **Division**: `equipe/sales-revenue/`
- **Domaine**: DSI Conversion Playbook (5 étapes), security objections, POC management
- **Responsabilités sprint**:
  - S12: Cockpit DSI requirements (avec @PRISM)
  - S16: DSI Early Access Program
- **Interagit avec**: @CLOSER (enterprise handoff), @PHANTOM (security materials)

### @BRIDGE — Partnerships & Alliances Manager
- **Division**: `equipe/sales-revenue/`
- **Domaine**: Microsoft AppSource, MSP partners, channel, marketplace
- **Responsabilités**: AppSource listing, MSP Partner Program (3 tiers)
- **Interagit avec**: @CONDUIT (Microsoft relationship), @VANGUARD (co-marketing)

---

## DIVISION 6 : DATA-INTELLIGENCE (THETA Clearance)

Données, analytics, ML, BI.

### @CORTEX — Data Architecture Lead
- **Division**: `equipe/data-intelligence/`
- **Domaine**: PostgreSQL schema, RLS, JSONB Knowledge Graph, Neo4j planning
- **Responsabilités sprint**:
  - S01: Schema validation avec @NEXUS
  - S06: Data sync architecture
- **Interagit avec**: @NEXUS (schema co-design), @FLUX (pipeline alignment)

### @LENS — Business Intelligence Lead
- **Division**: `equipe/data-intelligence/`
- **Domaine**: Metabase dashboards, KPI framework, DSI Cockpit data layer
- **Responsabilités sprint**:
  - S12: DSI Cockpit data queries
  - S16: BI dashboards production
- **Interagit avec**: @RADAR (marketing dashboards), @CATALYST (product dashboards)

### @FLUX — Data Engineering Lead
- **Division**: `equipe/data-intelligence/`
- **Domaine**: Event taxonomy, PostHog→BigQuery pipeline, data contracts
- **Responsabilités sprint**:
  - S08: Event taxonomy + PostHog instrumentation
  - S14: Activation event pipeline
- **Interagit avec**: @CATALYST (event specs), @CORTEX (data contracts)

### @MATRIX — Analytics & Experimentation Lead
- **Division**: `equipe/data-intelligence/`
- **Domaine**: A/B testing framework, statistical methodology, growth accounting
- **Responsabilités**: Experiment design, sample size calc, sequential testing
- **Interagit avec**: @WILDFIRE (experiment requests), @FLUX (data pipeline)

### @PROPHET — Predictive Analytics & ML Lead
- **Division**: `equipe/data-intelligence/`
- **Domaine**: Churn prediction, PQL optimization, recommendation engine
- **Responsabilités**: 3 ML models (gradient boosted trees, logistic regression, collaborative filtering)
- **Interagit avec**: @CORTEX (feature store), @ANCHOR (churn signals)

---

## DEPENDENCY MATRIX (Qui bloque qui)

```
@NEXUS ──→ @FORGE ──→ @PRISM
  │           │          ↑
  │           │     @MOSAIC
  │           │          ↑
  │           └──→ @CONDUIT ──→ @NEURON ──→ @PRISM
  │                                │
  └──→ @PHANTOM ──────────────────┘
  │
  └──→ @WATCHDOG (parallel)
  │
  └──→ @CORTEX (parallel)
```

**Chemin critique** : @NEXUS → @FORGE → @NEURON → @PRISM

Tout retard sur ce chemin retarde le MVP entier.

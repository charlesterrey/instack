---
title: "INSTACK Knowledge Graph — Dependency Map"
description: "Carte de dépendances entre tous les documents de la knowledge base instack. Fichier conçu pour être lu par Claude Code comme contexte structurel du projet."
date_generated: "2026-04-26"
total_nodes: 15
total_edges: 39
total_clusters: 14
usage: "Lire ce fichier AVANT de travailler sur un document pour comprendre son contexte, ses inputs et ses outputs dans l'écosystème documentaire instack."
---

# INSTACK Knowledge Graph

## Catégories de documents

- **strategy** : Documents de vision, positionnement marché, modèle économique
- **research** : Données terrain, témoignages utilisateurs, pain points validés
- **product** : Spécifications produit, personas, composants, design system
- **technical** : Architecture technique, stack, sécurité, API, déploiement
- **marketing** : Brand, content, demand gen, growth, PLG
- **mvp** : Documents d'exécution du MVP (playbooks, roadmap, dashboard, arena)

---

## Noeuds (documents)

### strategy_playbook
- **Fichier** : `INSTACK_Strategy_Playbook.md`
- **Catégorie** : strategy
- **Sujets clés** : vision, competitive landscape, TAM/SAM/SOM, ICP beachhead retail/logistics, moat building, Microsoft threat, knowledge graph, fenêtre 12-18 mois
- **Dépend de** : user_research_cpo (6 problèmes validés comme evidence)
- **Alimente** : product_blueprint (vision produit), technical_blueprint (knowledge graph moat → archi), marketing_blueprint (beachhead → positionnement), growth_plg_strategy (dual motion PLG+enterprise), strategic_assessment (TAM/SAM/SOM partagé), mvp_arena (War Room → débats), mvp_roadmap (conditions non-négociables), mvp_playbook_sales_strategy (ICP + fundraising)
- **Centralité** : TRÈS HAUTE — hub stratégique principal, alimente presque tous les autres documents

### strategic_assessment
- **Fichier** : `instack_strategic_assessment.md`
- **Catégorie** : strategy
- **Sujets clés** : market opportunity, TAM €13.4B, competitive matrix, Power Apps complaints, devil's advocate, VC lens, hybrid revenue model, sovereign cloud tailwind, kill risks
- **Dépend de** : strategy_playbook (TAM/SAM/SOM partagé), pain_points (Power Apps competitive intel)
- **Alimente** : mvp_roadmap (3 conditions non-négociables → prérequis), mvp_playbook_sales_strategy (GTM → sales playbook), marketing_blueprint (market sizing + competitive positioning)
- **Centralité** : MOYENNE — validation externe de la stratégie

### user_research_cpo
- **Fichier** : `INSTACK_User_Research_CPO_Report.md`
- **Catégorie** : research
- **Sujets clés** : 264 témoignages, 16 axes de recherche, 5 persona journey maps (Sandrine, Philippe, Mehdi, Clara, Vincent), 6 problèmes validés, shadow IT, Power Apps failure, Excel hell, IT backlog, 18 user stories priorisées
- **Dépend de** : pain_points (même base de 264 témoignages, rapport de synthèse)
- **Alimente** : strategy_playbook (evidence pour War Room), product_blueprint (personas → magic moments), marketing_blueprint (pain points → messaging), mvp_playbook_product_ux (user stories directes), mvp_playbook_sales_strategy (personas → pitch et objection handling)
- **Centralité** : HAUTE — source primaire de validation terrain

### pain_points
- **Fichier** : `INSTACK_User_Research_Pain_Points.md`
- **Catégorie** : research
- **Sujets clés** : pain points database (4 sheets), AI app builder security, app dev cost, citizen development failures, Copilot Studio limitations, DSI governance, data sovereignty, Excel hell, field workers, French enterprise, IT backlog, no-code failures, Power Apps sprawl
- **Dépend de** : (source primaire — pas de dépendance amont)
- **Alimente** : user_research_cpo (264 témoignages partagés), product_blueprint (Excel hell → white space), strategic_assessment (Power Apps intel), technical_blueprint (AI security failures → constrained generation), marketing_blueprint (testimonials + stats → content), growth_plg_strategy (field workers → mobile-first PLG), mvp_playbook_sales_strategy (DSI governance → sales positioning), mvp_playbook_marketing_growth (pain point stats → content marketing)
- **Centralité** : HAUTE — base de données racine, alimente toute la chaîne

### product_blueprint
- **Fichier** : `instack_product_blueprint.md`
- **Catégorie** : product
- **Sujets clés** : vision "disposable enterprise apps", 5 personas, 10 JTBD, 10 magic moments, 12 atomic components, data-in-situ, knowledge graph, white space, app expiration, cockpit DSI, design system, roadmap produit
- **Dépend de** : strategy_playbook (vision produit), user_research_cpo (personas → magic moments), pain_points (Excel hell → white space)
- **Alimente** : technical_blueprint (12 components → specs tech), marketing_blueprint (category creation partagée), growth_plg_strategy (magic moments → PLG loops), mvp_playbook_product_ux (blueprint → scope MVP), mvp_arena (12→6 components debate), mvp_playbook_tech_dev (specs → implémentation)
- **Centralité** : TRÈS HAUTE — hub produit principal, fait le pont entre recherche/stratégie et exécution technique

### technical_blueprint
- **Fichier** : `instack_technical_blueprint.md`
- **Catégorie** : technical
- **Sujets clés** : PostgreSQL + Neo4j + Excel sync, Cloudflare Workers, constrained AI pipeline, 12 atomic components specs, security model, knowledge graph moat, cost model, MVP 4 mois, arena methodology, V8 isolates, 81 tables de specs
- **Dépend de** : product_blueprint (12 components → specs tech), strategy_playbook (knowledge graph moat → archi), pain_points (AI security → constrained generation)
- **Alimente** : mvp_playbook_tech_dev (archi full → MVP scope), mvp_arena (Neo4j vs JSONB debate), mvp_dashboard (archi → 57 tasks)
- **Centralité** : HAUTE — référence technique unique

### marketing_blueprint
- **Fichier** : `instack_marketing_blueprint.md`
- **Catégorie** : marketing
- **Sujets clés** : brand strategy, category creation "disposable enterprise apps", content marketing, demand generation, product marketing, EU sovereignty positioning, PLG + top-down hybrid, brand archetypes, sub-brands, beachhead France
- **Dépend de** : strategy_playbook (beachhead → positionnement), product_blueprint (category creation partagée), user_research_cpo (pain points → messaging), pain_points (testimonials → content), strategic_assessment (market sizing)
- **Alimente** : growth_plg_strategy (brand + PLG complémentaires), mvp_playbook_marketing_growth (messaging → MVP launch), mvp_playbook_sales_strategy (brand → sales enablement)
- **Centralité** : MOYENNE — transforme la stratégie en narratif marché

### growth_plg_strategy
- **Fichier** : `instack_growth_plg_strategy.md`
- **Catégorie** : marketing
- **Sujets clés** : PLG architecture, freemium tiers (Free/Pro/Enterprise), aha moment, time-to-value 90s, viral loops, K-factor, AARRR funnel, template marketplace, app store interne, pricing, land & expand, churn prediction
- **Dépend de** : strategy_playbook (dual motion PLG+enterprise), product_blueprint (magic moments → PLG loops), marketing_blueprint (brand + PLG complémentaires), pain_points (field workers → mobile-first)
- **Alimente** : mvp_playbook_marketing_growth (PLG loops → opérationnel), mvp_playbook_sales_strategy (pricing tiers partagés), mvp_arena (pricing debate Round 4)
- **Centralité** : MOYENNE — moteur de croissance opérationnel

### mvp_arena
- **Fichier** : `MVP/arena/INSTACK_MVP_Arena_10_Agents.md`
- **Catégorie** : mvp
- **Sujets clés** : 10 solution architects, 5 rounds de débat, component scope (12→6), sandbox vs OAuth, Neo4j timing (→ JSONB Phase A), pricing tiers, cockpit DSI phasing, Phase A/B split, consensus 95.2/100
- **Dépend de** : strategy_playbook (War Room → débats), product_blueprint (12→6 components debate), technical_blueprint (Neo4j vs JSONB debate), growth_plg_strategy (pricing debate Round 4)
- **Alimente** : mvp_playbook_tech_dev (consensus archi → implémentation), mvp_playbook_product_ux (scope components → design), mvp_roadmap (Phase A/B split → phases), mvp_dashboard (décisions → tasks), mvp_playbook_sales_strategy (pricing et cockpit DSI)
- **Centralité** : TRÈS HAUTE — noeud pivot entre blueprints fondateurs et playbooks d'exécution MVP

### mvp_playbook_product_ux
- **Fichier** : `MVP/playbooks/INSTACK_MVP_Playbook_Product_UX.md`
- **Catégorie** : mvp
- **Sujets clés** : repositioning "App Store Interne Gouverné", user stories, 6 atomic components (scoped), personas, design system, DSI cockpit design, onboarding flows, accessibility
- **Dépend de** : product_blueprint (blueprint → scope MVP), user_research_cpo (user stories directes), mvp_arena (scope components → design)
- **Alimente** : mvp_playbook_tech_dev (product specs → dev), mvp_playbook_marketing_growth (repositioning partagé), mvp_dashboard (Product/UX team tasks)
- **Centralité** : MOYENNE — pont produit→tech dans le MVP

### mvp_playbook_tech_dev
- **Fichier** : `MVP/playbooks/INSTACK_MVP_Playbook_Tech_Dev.md`
- **Catégorie** : mvp
- **Sujets clés** : 3 layers architecture, PostgreSQL Neon, context graph JSONB (pas Neo4j en Phase A), Hono.js Workers, AI pipeline 4 stages, Microsoft Graph API, security, sprint plans Phase A/B
- **Dépend de** : technical_blueprint (archi full → MVP scope), product_blueprint (specs → implémentation), mvp_arena (consensus archi), mvp_playbook_product_ux (product specs → dev), mvp_roadmap (timeline → sprint planning)
- **Alimente** : mvp_dashboard (tasks d'implémentation)
- **Centralité** : MOYENNE — document d'exécution technique terminal

### mvp_playbook_marketing_growth
- **Fichier** : `MVP/playbooks/INSTACK_MVP_Playbook_Marketing_Growth.md`
- **Catégorie** : mvp
- **Sujets clés** : positioning "App Store Interne Gouverné", sub-brand rationalization, PLG growth loops, content strategy, demand generation, community building, launch plan, KPIs
- **Dépend de** : marketing_blueprint (messaging → MVP launch), growth_plg_strategy (PLG loops → opérationnel), mvp_playbook_product_ux (repositioning partagé), pain_points (stats → content)
- **Alimente** : mvp_playbook_sales_strategy (positioning → GTM), mvp_dashboard (Growth/Marketing team tasks)
- **Centralité** : BASSE — document d'exécution marketing terminal

### mvp_playbook_sales_strategy
- **Fichier** : `MVP/playbooks/INSTACK_MVP_Playbook_Sales_Strategy.md`
- **Catégorie** : mvp
- **Sujets clés** : GTM dual motion (PLG bottom-up + enterprise top-down), ICP beachhead, pricing model, fundraising, revenue projections, competitive positioning
- **Dépend de** : growth_plg_strategy (pricing tiers), strategic_assessment (GTM), marketing_blueprint (brand → enablement), mvp_arena (pricing + cockpit DSI), mvp_playbook_marketing_growth (positioning → GTM), pain_points (DSI governance → positioning), strategy_playbook (ICP + fundraising), user_research_cpo (personas → pitch)
- **Alimente** : (document terminal — pas de dépendance aval)
- **Centralité** : BASSE — convergence de tous les inputs en plan commercial

### mvp_roadmap
- **Fichier** : `MVP/roadmap/INSTACK_MVP_Roadmap_Interactive.md`
- **Catégorie** : mvp
- **Sujets clés** : 4 phases (validation terrain, prouver la magie, convertir et gouverner, moat expansion), 16 semaines, 30 LOIs, CTO recruitment, DPA Anthropic, non-negotiable conditions
- **Dépend de** : strategy_playbook (conditions non-négociables), strategic_assessment (3 conditions → prérequis), mvp_arena (Phase A/B split → phases)
- **Alimente** : mvp_dashboard (milestones → task tracking), mvp_playbook_tech_dev (timeline → sprints)
- **Centralité** : MOYENNE — cadre temporel de l'exécution

### mvp_dashboard
- **Fichier** : `MVP/dashboard/INSTACK_MVP_Project_Dashboard.md`
- **Catégorie** : mvp
- **Sujets clés** : 57 tasks, 10 teams (Backend API, Frontend, AI/ML, Infra, Security, Product, UX, Growth, Sales, Strategy), subtasks, dépendances inter-tasks
- **Dépend de** : technical_blueprint (archi → 57 tasks), mvp_arena (décisions → tasks), mvp_roadmap (milestones → tracking), mvp_playbook_product_ux (Product/UX tasks), mvp_playbook_marketing_growth (Growth/Marketing tasks)
- **Alimente** : (document terminal — état d'avancement, pas de dépendance aval)
- **Centralité** : BASSE — agrégateur d'exécution terminal

---

## Arêtes (dépendances directes)

| # | Source | → | Cible | Relation | Force |
|---|--------|---|-------|----------|-------|
| 1 | strategy_playbook | → | strategic_assessment | TAM/SAM/SOM partagé, estimations divergentes (1B vs 13.4B) | 3 |
| 2 | strategy_playbook | → | product_blueprint | Vision produit, ICP, moat strategy → specs produit | 3 |
| 3 | strategy_playbook | → | technical_blueprint | Knowledge graph moat → décisions archi | 3 |
| 4 | strategy_playbook | → | marketing_blueprint | Beachhead strategy → positionnement marketing | 2 |
| 5 | strategy_playbook | → | growth_plg_strategy | Dual motion PLG+enterprise → opérationnalisation | 2 |
| 6 | strategy_playbook | → | mvp_arena | War Room recommendations → débats arena | 3 |
| 7 | strategy_playbook | → | mvp_roadmap | Conditions non-négociables → prérequis roadmap | 3 |
| 8 | user_research_cpo | → | pain_points | 264 témoignages partagés, CPO synthétise le DB | 3 |
| 9 | user_research_cpo | → | product_blueprint | Persona Sandrine + journeys → magic moments | 3 |
| 10 | user_research_cpo | → | strategy_playbook | 6 problèmes validés → evidence War Room | 3 |
| 11 | user_research_cpo | → | marketing_blueprint | Pain points validés → messaging et category creation | 2 |
| 12 | user_research_cpo | → | mvp_playbook_product_ux | User stories directes → MVP product specs | 3 |
| 13 | pain_points | → | product_blueprint | Excel hell, IT backlog, Power Apps → white space | 3 |
| 14 | pain_points | → | strategic_assessment | Competitive intelligence Power Apps/Copilot | 2 |
| 15 | pain_points | → | technical_blueprint | AI security failures → constrained generation | 2 |
| 16 | product_blueprint | → | technical_blueprint | 12 components, knowledge graph, data-in-situ → specs | 3 |
| 17 | product_blueprint | → | marketing_blueprint | Category creation partagée | 3 |
| 18 | product_blueprint | → | growth_plg_strategy | 10 magic moments → PLG viral loops | 3 |
| 19 | product_blueprint | → | mvp_playbook_product_ux | Blueprint vision → scope MVP | 3 |
| 20 | product_blueprint | → | mvp_arena | 12 components → débat scope à 6 | 3 |
| 21 | product_blueprint | → | mvp_playbook_tech_dev | Product specs → implémentation technique | 3 |
| 22 | technical_blueprint | → | mvp_playbook_tech_dev | Architecture complète → scope MVP (JSONB remplace Neo4j) | 3 |
| 23 | technical_blueprint | → | mvp_arena | Neo4j vs PostgreSQL JSONB → débat Round 3 | 3 |
| 24 | technical_blueprint | → | mvp_dashboard | Architecture → décomposition en 57 tasks | 3 |
| 25 | marketing_blueprint | → | growth_plg_strategy | Brand strategy + PLG = piliers complémentaires | 3 |
| 26 | marketing_blueprint | → | mvp_playbook_marketing_growth | Messaging et sub-brands → MVP launch plan | 3 |
| 27 | growth_plg_strategy | → | mvp_playbook_marketing_growth | PLG loops et freemium → opérationnel MVP | 3 |
| 28 | growth_plg_strategy | → | mvp_playbook_sales_strategy | Pricing tiers Free/Pro/Enterprise partagés | 3 |
| 29 | growth_plg_strategy | → | mvp_arena | Pricing → débat Round 4 | 3 |
| 30 | strategic_assessment | → | mvp_roadmap | 3 conditions non-négociables → prérequis | 3 |
| 31 | strategic_assessment | → | mvp_playbook_sales_strategy | GTM strategy → sales playbook | 2 |
| 32 | mvp_arena | → | mvp_playbook_tech_dev | Consensus architecture → implémentation | 3 |
| 33 | mvp_arena | → | mvp_playbook_product_ux | Scope components + cockpit phasing → design | 3 |
| 34 | mvp_arena | → | mvp_roadmap | Phase A/B split → structuration phases | 3 |
| 35 | mvp_arena | → | mvp_dashboard | Décisions consensus → décomposition tasks | 2 |
| 36 | mvp_roadmap | → | mvp_dashboard | Milestones et phases → task tracking | 3 |
| 37 | mvp_playbook_product_ux | → | mvp_playbook_tech_dev | Product specs et component design → dev | 3 |
| 38 | mvp_playbook_product_ux | → | mvp_playbook_marketing_growth | Repositioning App Store Interne Gouverné partagé | 2 |
| 39 | mvp_playbook_marketing_growth | → | mvp_playbook_sales_strategy | Positioning marketing → GTM sales | 2 |

---

## Clusters thématiques (concepts transversaux)

### Personas & User Research
- **Documents** : user_research_cpo, pain_points, product_blueprint, mvp_playbook_product_ux, strategy_playbook
- **Concept** : Les 5 personas (Sandrine, Philippe, Mehdi, Clara, Vincent) et les 264 témoignages qui traversent la recherche, la stratégie, le produit et l'exécution MVP.

### Competitive Landscape & Microsoft Threat
- **Documents** : strategy_playbook, strategic_assessment, pain_points, product_blueprint, marketing_blueprint
- **Concept** : Power Apps sprawl, Copilot Studio limitations, 68% d'échec citizen dev. La menace Microsoft est le principal driver de différenciation.

### Knowledge Graph / Moat Strategy
- **Documents** : strategy_playbook, technical_blueprint, product_blueprint, mvp_arena, mvp_playbook_tech_dev
- **Concept** : Le knowledge graph comme moat défensif. Décision arena : PostgreSQL JSONB en Phase A, Neo4j différé en Phase B.

### Pricing & Business Model
- **Documents** : growth_plg_strategy, strategy_playbook, strategic_assessment, mvp_arena, mvp_playbook_sales_strategy
- **Concept** : Modèle freemium Free/Pro/Enterprise. Débattu en arena Round 4. Hybrid revenue (PLG + enterprise contracts).

### PLG & Viral Growth
- **Documents** : growth_plg_strategy, marketing_blueprint, mvp_playbook_marketing_growth, product_blueprint
- **Concept** : Time-to-value 90s, aha moment, viral loops (K-factor), AARRR funnel, template marketplace.

### EU Sovereignty & GDPR/CLOUD Act
- **Documents** : pain_points, user_research_cpo, marketing_blueprint, strategic_assessment, mvp_roadmap
- **Concept** : Souveraineté des données comme avantage compétitif vs Microsoft. DPA Anthropic comme prérequis roadmap.

### Technical Architecture
- **Documents** : technical_blueprint, mvp_playbook_tech_dev, mvp_arena, product_blueprint, mvp_dashboard
- **Concept** : PostgreSQL Neon + Cloudflare Workers + Hono.js + AI pipeline 4 stages. V8 isolates pour sandbox.

### 12 Atomic Components & Design System
- **Documents** : technical_blueprint, product_blueprint, mvp_arena, mvp_playbook_product_ux, mvp_playbook_tech_dev
- **Concept** : 12 composants définis dans le blueprint, débattus et réduits à 6 pour le MVP en arena Round 1.

### Cockpit DSI & Governance
- **Documents** : product_blueprint, mvp_arena, mvp_playbook_product_ux, pain_points, user_research_cpo, strategy_playbook
- **Concept** : Dashboard de gouvernance pour les DSI. Phasing décidé en arena : version light Phase A, complète Phase B.

### ICP Beachhead (Retail/Logistics France)
- **Documents** : strategy_playbook, strategic_assessment, marketing_blueprint, mvp_playbook_sales_strategy, user_research_cpo
- **Concept** : Segment initial : entreprises retail/logistics françaises 500-5000 employés avec douleur Excel/Power Apps.

### Shadow IT & Excel Hell
- **Documents** : pain_points, user_research_cpo, strategy_playbook, product_blueprint, marketing_blueprint
- **Concept** : Problème #1 validé : prolifération Excel non gouvernée + shadow IT. Driver principal de l'adoption.

### MVP Phase A/B Execution
- **Documents** : mvp_arena, mvp_roadmap, mvp_dashboard, mvp_playbook_tech_dev, mvp_playbook_product_ux
- **Concept** : Phase A (semaines 1-8) = prouver la magie. Phase B (semaines 9-16) = convertir et gouverner. 57 tasks, 10 teams.

### Category Creation (Disposable Enterprise Apps)
- **Documents** : marketing_blueprint, product_blueprint, strategic_assessment, strategy_playbook, mvp_playbook_marketing_growth
- **Concept** : Création de catégorie "applications d'entreprise jetables" → repositionné en "App Store Interne Gouverné" pour le MVP.

### Data-in-Situ (SharePoint/Excel Sync)
- **Documents** : product_blueprint, technical_blueprint, mvp_playbook_tech_dev, mvp_arena, mvp_dashboard
- **Concept** : Approche data-in-situ : les données restent dans SharePoint/Excel, instack synchronise via Microsoft Graph API.

---

## Flux de dépendance (ordre de lecture recommandé)

Pour comprendre le projet instack de manière optimale, lire les documents dans cet ordre :

```
COUCHE 1 — Sources primaires (lire en premier)
├── pain_points                    ← base de données racine
└── user_research_cpo              ← synthèse CPO des témoignages

COUCHE 2 — Vision & Stratégie
├── strategy_playbook              ← vision + positionnement + modèle
└── strategic_assessment           ← validation marché + kill risks

COUCHE 3 — Blueprints (spécifications)
├── product_blueprint              ← specs produit complètes
├── technical_blueprint            ← specs techniques complètes
├── marketing_blueprint            ← plan marketing complet
└── growth_plg_strategy            ← moteur de croissance PLG

COUCHE 4 — Arbitrage MVP
└── mvp_arena                      ← 5 rounds de débat, consensus à 95.2/100

COUCHE 5 — Exécution MVP
├── mvp_roadmap                    ← timeline 16 semaines, 4 phases
├── mvp_playbook_product_ux        ← specs produit/UX scoped MVP
├── mvp_playbook_tech_dev          ← implémentation technique MVP
├── mvp_playbook_marketing_growth  ← plan marketing/growth MVP
├── mvp_playbook_sales_strategy    ← plan commercial MVP
└── mvp_dashboard                  ← 57 tasks, 10 teams, tracking
```

## Décisions clés tracées à travers les documents

| Décision | Origine | Débattue dans | Implémentée dans |
|----------|---------|---------------|------------------|
| Knowledge graph comme moat | strategy_playbook | mvp_arena (Round 3) | mvp_playbook_tech_dev (JSONB Phase A, Neo4j Phase B) |
| 12→6 atomic components pour MVP | product_blueprint | mvp_arena (Round 1) | mvp_playbook_product_ux, mvp_playbook_tech_dev |
| Pricing Free/Pro/Enterprise | growth_plg_strategy | mvp_arena (Round 4) | mvp_playbook_sales_strategy |
| Cockpit DSI phasing | product_blueprint | mvp_arena (Round 5) | mvp_playbook_product_ux (light Phase A) |
| Beachhead retail/logistics France | strategy_playbook | strategic_assessment | mvp_playbook_sales_strategy, marketing_blueprint |
| Data-in-situ via Microsoft Graph | product_blueprint | mvp_arena | mvp_playbook_tech_dev |
| Repositioning → App Store Interne Gouverné | marketing_blueprint | mvp_arena | mvp_playbook_marketing_growth, mvp_playbook_product_ux |
| DPA Anthropic comme prérequis | strategic_assessment | mvp_roadmap | mvp_roadmap (condition non-négociable) |
| Constrained AI generation (pas de code libre) | pain_points (security failures) | technical_blueprint | mvp_playbook_tech_dev (AI pipeline 4 stages) |
| Time-to-value cible 90 secondes | growth_plg_strategy | product_blueprint (magic moments) | mvp_playbook_product_ux (onboarding flow) |

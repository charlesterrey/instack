---
title: "INSTACK — Product Blueprint"
subtitle: "La plateforme d'apps jetables pour entreprises"
document_type: "Document CPO — Analyse produit intégrale"
scope: "12 chapitres • Vision • Recherche • Architecture • Design System • Roadmap • GTM"
date: "Avril 2026"
classification: "Confidentiel"
author: "Charles Terrey, CEO & Fondateur"
methodology: "10 agents spécialistes • CPO synthèse • Scoring 96/100"
source_file: "instack_product_blueprint.docx"
extracted: "2026-04-26"
language: "fr"
---

# INSTACK — Product Blueprint

**La plateforme d'apps jetables pour entreprises**

Document CPO — Analyse produit intégrale
12 chapitres • Vision • Recherche • Architecture • Design System • Roadmap • GTM

**Avril 2026 — Confidentiel**
Préparé par : Charles Terrey, CEO & Fondateur
10 agents spécialistes • CPO synthèse • Scoring 96/100

---

## Table des matières

1. Executive Summary
2. Vision Produit & Création de Catégorie
3. Recherche Utilisateur
4. Paysage Concurrentiel
5. Architecture Produit
6. Design System
7. App Store & Marketplace
8. Cockpit DSI & Gouvernance
9. Stratégie Go-to-Market
10. Roadmap Produit
11. Plan de Sprints MVP
12. Modèle Économique & Financier

---

# 1. Executive Summary

| $13.4B — TAM Global (Citizen Dev 2026) | €630M — SAM Europe (115K entreprises) | $9-14M — SOM 5 ans (ARR cible) | 18-24 mois — Fenêtre de tir |
|---|---|---|---|

> Verdict : GO CONDITIONNEL — L'opportunité est réelle et le timing favorable. Le marché des apps enterprise jetables n'existe pas encore en tant que catégorie — c'est le plus grand risque et le plus grand avantage d'instack.

instack crée une nouvelle catégorie : les « Disposable Enterprise Apps ». La plateforme permet à n'importe quel employé de créer une application métier en 10 minutes en décrivant son besoin en langage naturel à une IA. L'IA n'écrit pas de code — elle assemble 12 composants React atomiques pré-sécurisés en JSON déclaratif. Les données ne quittent jamais l'écosystème de l'entreprise (SharePoint, Google Drive). Les apps expirent automatiquement après 30, 60 ou 90 jours — zéro dette technique, zéro maintenance.

L'architecture repose sur trois couches indépendantes : PostgreSQL (Neon Serverless) comme source de vérité transactionnelle, Neo4j Aura comme knowledge graph organisationnel qui apprend l'entreprise au fil du temps, et une synchronisation bidirectionnelle avec Excel/SharePoint comme couche de présentation. Les apps générées tournent sur Cloudflare Workers avec 0ms de cold start et 4 couches d'isolation sécuritaire.

Le pipeline IA atteint un taux de succès de 92-95% en première tentative grâce à la génération contrainte, contre 82-87% pour les approches code libre (v0, bolt.new). Coût par génération : €0.018. Infrastructure pour 1 000 tenants : €208/mois. Marge brute cible : 95-98%.

### Trois conditions non-négociables

- **Équipe technique senior :** CTO ayant déjà construit sur Microsoft Graph API et maîtrisant l'IA générative. C'est un produit AI-first.
- **Scope réduit au lancement :** M365 uniquement, 5 types d'apps max, verticale retail/industrie France. Focus = PMF en 6 mois.
- **Vitesse d'exécution :** MVP en 4 mois, 20 bêta-testeurs en 6 mois, levée Seed en 9-12 mois. Chaque mois de retard est un risque existentiel.

---

# 2. Vision Produit & Création de Catégorie

## 2.1 Vision Statement

> « Chaque employé peut créer l'app dont il a besoin, en 10 minutes, sans code, sans formation, sans demander à l'IT. L'app vit le temps qu'il faut, puis disparaît. La donnée, elle, reste à sa place. »

instack est à Power Apps ce que Notion est à Confluence : une réinvention radicale de l'expérience qui rend la création accessible à tous. Comme Linear a créé le « modern issue tracking », comme Figma a créé le « collaborative design », instack crée les « Disposable Enterprise Apps » — une catégorie entièrement nouvelle.

## 2.2 Les caractéristiques de la catégorie

- **Jetable par design :** les apps ont une date d'expiration. Elles ne deviennent jamais du legacy. Quand le besoin change, on en crée une nouvelle en 10 minutes.
- **Data-in-situ :** zéro migration de données. Les fichiers Excel, les SharePoint, les Google Sheets restent où ils sont. L'app est une fenêtre intelligente sur la donnée existante.
- **Générée par IA, pas codée :** l'utilisateur décrit, l'IA assemble. Pas de drag-and-drop, pas de formules, pas de tutoriels. La conversation est l'interface.
- **Gouvernée nativement :** chaque app est visible, auditable, révocable par la DSI. Le shadow IT devient un « managed playground ».
- **Souveraine :** self-host EU, zéro donnée métier stockée, compatible RGPD/CLOUD Act/EU Data Act par design.

## 2.3 Les 10 moments magiques

Les moments où l'utilisateur tombe amoureux du produit :

1. **La première app en 90 secondes —** Un Ops Manager tape « je veux suivre mes visites clients avec photos » et voit apparaître une app fonctionnelle connectée à son Excel en temps réel.
2. **Ses vraies données, immédiatement —** L'app affiche les noms de ses vrais clients, ses vraies dates, ses vrais chiffres. Pas de données fictives. La magie du data-in-situ.
3. **Le partage en un clic —** Il envoie un lien à son équipe. Ses collègues ouvrent l'app, voient les mêmes données, commencent à saisir. Zéro onboarding.
4. **L'itération magique —** « Ajoute un filtre par région » — le filtre apparaît en 2 secondes. L'IA comprend le contexte, elle sait quelles colonnes existent.
5. **Le dashboard qui se construit —** « Montre-moi un dashboard de mes ventes par mois » — KPI cards, graphiques, filtres. Tout est là, connecté, interactif.
6. **L'app qui connaît l'entreprise —** Après 3 mois d'usage, le knowledge graph sait que l'équipe Sales utilise « Revenue » et que Finance utilise « CA_mensuel » pour la même chose.
7. **Le store interne —** Un nouvel employé ouvre le store, voit les apps de son équipe, en clone une et l'adapte à son besoin en 2 minutes.
8. **L'expiration sans stress —** L'app expire, une notification arrive : « Renouveler ? » Un clic. Ou on laisse mourir. Les données survivent dans Excel.
9. **Le cockpit DSI —** Le DSI ouvre son cockpit : 47 apps actives, 12 créateurs, 5 fichiers SharePoint touchés, zéro shadow IT. Il sourit.
10. **Le mobile natif —** L'Ops Manager ouvre l'app sur son téléphone en magasin, prend une photo, saisit ses notes. L'app est responsive par défaut.

## 2.4 L'espace blanc d'instack

> Aucun concurrent ne combine ces trois dimensions : (1) apps générées par IA pour non-techniciens, (2) données in-situ (SharePoint/Google Drive), (3) paradigme jetable avec expiration automatique. C'est un white space vérifié.

---

# 3. Recherche Utilisateur

## 3.1 Les 5 personas

### Sandrine Morel — Responsable Opérations

**Entreprise :** Leroy Merlin Région Nord, 1 200 employés

« Je passe 3 heures par semaine à copier-coller entre Excel et des emails. Si je pouvais avoir une app simple pour suivre mes audits magasin, je serais aux anges. »

**Frustrations :** 14 mois d'attente pour une app Power Apps, Excel partagé sur Teams qui plante, pas de vue consolidée terrain

**Objectifs :** Suivre les visites, saisir des données terrain avec photos, avoir un dashboard par magasin

**Maturité technique :** Excel avancé, zéro code, utilise Teams et SharePoint au quotidien

**Rôle dans l'adoption :** Créatrice d'apps — elle découvre instack via un collègue, crée sa 1ère app en 10 min

### Mehdi Benali — Chef de Projet Amélioration Continue

**Entreprise :** Bonduelle, 800 employés sur site

« J'ai 15 Excel de suivi différents. Quand je pars en vacances, personne ne sait lequel utiliser. »

**Frustrations :** Outils éparpillés, pas de standardisation, perd 5h/semaine en consolidation manuelle

**Objectifs :** Standardiser le suivi qualité, partager des outils entre équipes, mesurer l'amélioration

**Maturité technique :** Power user Excel + VBA basique, a essayé Power Apps puis abandonné

**Rôle dans l'adoption :** Power user — crée 5-10 apps, les partage, devient évangéliste interne

### Philippe Garnier — Directeur des Systèmes d'Information (DSI)

**Entreprise :** Groupe Fournier (meubles), 2 000 employés

« J'ai 23 SaaS non référencés dans mon SI. Chaque semaine, on m'en découvre un nouveau. Je veux reprendre le contrôle sans bloquer l'innovation. »

**Frustrations :** Shadow IT incontrôlé, budget SaaS +40% en 2 ans, RGPD anxiogène, Power Apps trop complexe pour les métiers

**Objectifs :** Visibilité sur toutes les apps, gouvernance des données, conformité RGPD, réduction du shadow IT

**Maturité technique :** Expert technique, décide des outils, gère le budget IT

**Rôle dans l'adoption :** Buyer — découvre instack quand 3+ équipes l'utilisent, achète le cockpit de gouvernance

### Clara Rousseau — Commerciale Terrain

**Entreprise :** Descamps (textile), 400 employés

« On m'a donné un lien, j'ai ouvert l'app, j'ai saisi mes visites. C'est tout. C'est parfait. »

**Frustrations :** Trop d'outils différents, CRM lourd, saisie en double, pas de temps pour apprendre

**Objectifs :** Saisir vite sur mobile, retrouver l'info client, ne pas perdre de temps

**Maturité technique :** Smartphone + email, zéro appétence technique

**Rôle dans l'adoption :** Consommatrice — reçoit un lien, utilise l'app, ne sait même pas que c'est instack

### Vincent Durand — DG / COO

**Entreprise :** Maisons du Monde Logistique, 600 employés

« Chaque projet IT coûte 80K€ et prend 6 mois. Si mes équipes peuvent résoudre 80% de leurs problèmes en self-service, c'est un game changer. »

**Frustrations :** Coût IT démesuré, time-to-value trop long, les métiers bricolent en attendant

**Objectifs :** ROI mesurable, autonomie des équipes, réduction des coûts IT, agilité opérationnelle

**Maturité technique :** Utilisateur de dashboards, lit les KPIs, ne crée rien lui-même

**Rôle dans l'adoption :** Sponsor exécutif — voit le ROI après 3 mois, valide le budget, pousse l'adoption

## 3.2 Jobs to Be Done

- Quand je dois suivre une activité répétitive sur le terrain, je veux créer une app de saisie en quelques minutes, pour ne plus dépendre de l'IT ni d'Excel.
- Quand j'ai déjà mes données dans SharePoint, je veux que l'app se connecte directement sans migration, pour éviter la double saisie.
- Quand un collègue a créé un outil utile, je veux le réutiliser et l'adapter à mon contexte, pour gagner du temps.
- Quand je suis sur le terrain avec mon téléphone, je veux saisir des données et prendre des photos dans une app intuitive, pour ne rien oublier.
- Quand je suis DSI, je veux voir toutes les apps créées dans l'entreprise et les données qu'elles touchent, pour éliminer le shadow IT.
- Quand une app n'est plus utile, je veux qu'elle disparaisse automatiquement sans laisser de dette technique.
- Quand j'ai besoin d'un dashboard rapide pour une réunion, je veux le générer en 5 minutes depuis mes données existantes.
- Quand je dirige une entreprise, je veux mesurer le ROI de l'autonomie donnée aux équipes, pour justifier l'investissement.
- Quand mes employés utilisent 30 SaaS différents, je veux une plateforme unique et gouvernée qui remplace le bricolage.
- Quand l'organisation évolue, je veux que les apps s'adaptent en quelques minutes au lieu de mois de développement.

## 3.3 Courbe d'adoption en entreprise

L'adoption d'instack suit le modèle de Rogers avec un « gouffre de Moore » au mois 3 — le moment où l'usage passe de quelques innovateurs à l'adoption institutionnelle via la DSI.

| Phase | Timeline | Acteurs | Métriques cibles |
|---|---|---|---|
| Innovateurs (2.5%) | Semaines 1-4 | 1-2 Ops Managers curieux | 3-5 apps créées, 1 partage |
| Early Adopters (13.5%) | Mois 1-3 | 5-10 créateurs, 2-3 équipes | 20+ apps, ratio 1:5 créateurs/viewers |
| Gouffre de Moore | Mois 3 | DSI découvre l'usage organique | Trigger : >10 créateurs actifs |
| Early Majority (34%) | Mois 3-9 | DSI achète, déploie cockpit | 50+ apps, gouvernance active |
| Late Majority (34%) | Mois 9-18 | Équipes résistantes adoptées | 100+ apps, 80% des équipes |

---

# 4. Paysage Concurrentiel

## 4.1 Matrice concurrentielle

| Plateforme | Cible | Pricing | Backend | IA | Jetable | Souverain |
|---|---|---|---|---|---|---|
| Power Apps | Enterprise MS | $20/user/mo | Dataverse | Copilot | Non | Partiel |
| Retool | Développeurs | $10-50/user | DB propre | Basique | Non | Non |
| Appsmith | Devs OSS | Gratuit-$25 | DB propre | Basique | Non | Self-host |
| Budibase | PME/SMB | $5-15/user | DB propre | Basique | Non | Self-host |
| Glide | Citizen devs | $249-750/mo | Sheets | Oui | Non | Non |
| Softr | Non-tech | $139-269/mo | Airtable | Basique | Non | Non |
| AppSheet | Google users | $5-10/user | Sheets/SQL | Gemini | Non | Non |
| **INSTACK** | **Tous employés** | **€299+€5/créat.** | **Excel SP/GD** | **CORE** | **OUI** | **EU Souv.** |

## 4.2 Positionnement différenciant

- **vs Power Apps :** « 10 minutes au lieu de 10 jours. Sans formation. Sans Dataverse. Vos données restent dans SharePoint. »
- **vs Retool :** « Pour les métiers, pas pour les devs. Zéro dette technique. Zéro code à maintenir. »
- **vs Glide/Softr :** « Vos données restent dans votre Microsoft 365, pas dans un cloud américain. »
- **vs Shadow IT :** « Donnez à vos équipes un terrain de jeu sécurisé au lieu de leur interdire de jouer. »
- **vs v0/bolt.new/Lovable :** « Pas du code jetable, mais des apps métier connectées aux vrais fichiers de l'entreprise. »

## 4.3 Les 5 kill risks

| Risque | Sévérité | Mitigation | Statut |
|---|---|---|---|
| Microsoft Kill Zone | 9/10 | Vitesse d'exécution + agnosticisme Google/MS + UX consumer-grade | Course 18-24 mois |
| Excel-as-Database limites | 7/10 | PG comme source de vérité, migration transparente vers PG standalone | Contrôlable |
| Qualité IA insuffisante | 8/10 | Génération contrainte (12 composants fixes), scope limité, 92-95% succès | Contrôlable |
| Zéro moat | 6/10 | Knowledge graph + templates marketplace + adoption organisationnelle | Moyen terme |
| Adoption DSI | 5/10 | Pitch « remplacez 30 SaaS par 1 cockpit » + zéro data stockée | Argument fort |

## 4.4 Analyse du moat

instack construit sa défensibilité sur 5 couches complémentaires :

1. **Knowledge Graph (moat technique) :** Neo4j apprend l'organisation au fil du temps. Chaque app créée enrichit le graphe. Après 6 mois, instack connaît les relations entre équipes, fichiers, colonnes et patterns d'usage. Aucun concurrent n'a cette couche.
2. **Génération contrainte (moat qualité) :** 12 composants pré-sécurisés au lieu de code libre = 92-95% de succès vs 82-87% pour v0/bolt.new. Moins de liberté = plus de fiabilité.
3. **Data-first (moat friction) :** Les données restent dans l'écosystème existant. L'intégration profonde avec le tenant M365/Google crée de la friction au switch.
4. **Souveraineté européenne (moat réglementaire) :** Self-host EU, zéro donnée métier stockée, compatible RGPD/CLOUD Act/EU Data Act. €80B de dépenses sovereign cloud en 2026.
5. **Template Marketplace (moat réseau) :** Effet Figma Community. 500 templates partagés et clonés = effet de réseau défensif.

---

# 5. Architecture Produit

## 5.1 Les 3 couches indépendantes

L'architecture repose sur trois couches indépendamment scalables qui communiquent via des APIs internes (score de convergence 98/100) :

| Couche | Technologie | Rôle | Coût/mois |
|---|---|---|---|
| Source de vérité | Neon PostgreSQL (Scale) | Données transactionnelles, RLS multi-tenant, ACID | €69 |
| Knowledge Graph | Neo4j Aura Professional | Contexte organisationnel, relations multi-hop | €65 |
| Cache | Dragonfly (Redis-compat) | Sessions, rate limiting, cache schéma | €29 |
| Queue async | BullMQ sur Redis | Jobs sync, génération | €20 |
| Runtime apps | Cloudflare Workers | Servir les apps générées, 0ms cold start | €25 |
| CDN/DNS | Cloudflare | Wildcard SSL, DNS, cache statique | Inclus |
| Monitoring | Sentry + PostHog | Erreurs + analytics | €0 |
| **TOTAL** | | | **€208** |

> Coût par utilisateur : MVP (100 users) €0.26/user/mois • Growth (1K users) €0.27/user/mois • Scale (10K users) €0.15/user/mois. Avec un pricing SaaS de €5-15/user/mois, la marge brute est de 95-98%.

## 5.2 Pipeline IA en 4 étages

> Le LLM n'écrit JAMAIS de code. Il assemble un arbre de composants pré-sécurisés en JSON.

| Étage | Modèle | Durée | Coût | Entrée/Sortie |
|---|---|---|---|---|
| 1. Classification d'intent | Claude Haiku | ~200ms | €0.001 | Prompt → Archétype (1/8) + contexte Neo4j |
| 2. Inférence de schéma | Déterministe | ~50ms | €0 | 100 premières lignes → colonnes typées |
| 3. Génération contrainte | Claude Sonnet 4 | ~3s | €0.018 | Catalogue 12 composants + schéma → arbre JSON |
| 4. Validation + rendu | Déterministe | ~100ms | €0 | JSON → 4 passes validation → React tree |

Les 8 archétypes d'apps supportés : CRUD Form, Dashboard, Tracker/Kanban, Report, Approval Workflow, Checklist, Gallery, Multi-view. Taux de succès visé : 92-95% en première tentative. Coût moyen par app (génération + 2.5 itérations) : €0.031.

## 5.3 Modèle de sécurité (4 couches d'isolation)

| Couche | Mécanisme | Protège contre |
|---|---|---|
| 1. Domaine séparé | {app-id}.apps.instack.io + Cloudflare wildcard SSL | XSS inter-apps (same-origin policy) |
| 2. Iframe sandbox | sandbox="allow-scripts" | Accès DOM parent, navigation, popups |
| 3. CSP strict | default-src 'self'; connect-src api.instack.io | Exfiltration de données, eval() |
| 4. Token proxy | credentials:include + cookie HttpOnly | Vol de tokens OAuth |

## 5.4 Knowledge Graph — Le cerveau de l'entreprise

Le knowledge graph Neo4j est le moat technique central d'instack. Il modélise l'organisation avec 6 types de nœuds (User, Team, App, DataSource, File, Column) et 9 types de relations. La relation SIMILAR_TO utilise des embeddings (text-embedding-3-small) pour détecter la similarité sémantique entre colonnes : quand Sales a « Revenue » et Finance a « CA_mensuel », le graphe sait que c'est la même chose.

Évolution long terme : Phase 1 (M0-6) mapping fichiers/users. Phase 2 (M6-12) auto-découverte de process → 20% des apps créées par suggestion. Phase 3 (M12-18) prédictions temporelles. Phase 4 (M18+) digital twin de l'organisation.

---

# 6. Design System

## 6.1 Principes de design

Le design system d'instack s'inspire de Linear (polish et opiniation), Stripe (clarté et précision), et Notion (flexibilité et warmth). 5 principes guident chaque décision :

1. **Opiné par défaut, flexible quand nécessaire :** chaque composant a un excellent défaut. La personnalisation est possible mais jamais requise.
2. **Données d'abord, décoration ensuite :** la donnée est le héros. Le design s'efface pour laisser les chiffres, les tableaux et les graphiques briller.
3. **Responsive sans compromis :** chaque composant fonctionne sur mobile, tablette et desktop. Le mobile n'est pas un « mode dégradé ».
4. **Accessible par construction :** WCAG 2.1 AA minimum. Clavier, lecteur d'écran, contraste — ce n'est pas un bonus, c'est un prérequis.
5. **Thémable sans fragmentation :** les entreprises personnalisent les couleurs et le logo. Le système reste cohérent via des CSS custom properties.

## 6.2 Design Tokens

### Couleurs

| Token | Valeur | Usage |
|---|---|---|
| --color-primary | #2E75B6 | Actions principales, liens, focus |
| --color-primary-hover | #245E95 | Hover sur actions principales |
| --color-secondary | #1B2A4A | Titres, navigation, header |
| --color-accent | #E8792F | CTA, badges, alertes importantes |
| --color-success | #2E7D32 | Validation, tendance positive |
| --color-warning | #F9A825 | Alertes, expirations proches |
| --color-error | #C62828 | Erreurs, suppressions |
| --color-info | #1565C0 | Information, aide contextuelle |
| --color-bg | #FFFFFF | Fond principal |
| --color-bg-subtle | #F8F9FA | Fond secondaire, cards |
| --color-bg-muted | #F2F2F2 | Fond désactivé, séparateurs |
| --color-text | #333333 | Texte principal |
| --color-text-secondary | #666666 | Texte secondaire, labels |
| --color-text-muted | #999999 | Placeholder, metadata |
| --color-border | #E0E0E0 | Bordures, séparateurs |

### Typographie

| Token | Taille | Poids | Usage |
|---|---|---|---|
| --text-xs | 12px / 0.75rem | 400 | Metadata, timestamps |
| --text-sm | 14px / 0.875rem | 400 | Labels, aide |
| --text-base | 16px / 1rem | 400 | Corps de texte |
| --text-lg | 18px / 1.125rem | 500 | Sous-titres |
| --text-xl | 24px / 1.5rem | 600 | Titres de section |
| --text-2xl | 32px / 2rem | 700 | Titres de page |
| --text-3xl | 48px / 3rem | 800 | KPI values |

Font stack : Inter (primaire), system-ui, -apple-system, sans-serif. Inter est choisie pour sa lisibilité à petite taille et ses variantes numériques tabulaires (idéal pour les tableaux et KPIs).

### Espacement et grille

Système de spacing sur une grille de 4px : 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96. Grille responsive 12 colonnes avec gouttière de 16px (mobile) / 24px (desktop). Breakpoints : mobile <640px, tablette 640-1024px, desktop >1024px.

### Élévation et ombres

| Niveau | Box-shadow | Usage |
|---|---|---|
| --shadow-sm | 0 1px 2px rgba(0,0,0,0.05) | Cards au repos, inputs |
| --shadow-md | 0 4px 6px rgba(0,0,0,0.07) | Cards hover, dropdowns |
| --shadow-lg | 0 10px 15px rgba(0,0,0,0.10) | Modals, lightbox, popovers |

## 6.3 Les 12 composants atomiques

Ces 12 composants couvrent 95% des use cases entreprise identifiés par l'analyse de 200+ templates sur Retool, AppSheet et Airtable. Chaque composant expose une interface TypeScript stricte qui contraint le LLM.

- **FormField —** Formulaire de saisie avec champs typés (text, date, select, image, number, textarea, checkbox, email, phone, url, currency). Supporte insert, update, upsert. 12 types de champs. Responsive : 1 col mobile, 2 col tablette, 3 col desktop.
- **DataTable —** Tableau de données avec tri, filtre, pagination (25 lignes), recherche, sélection de lignes et export CSV. Scroll horizontal sur mobile avec colonnes prioritaires fixées. Role table sémantique.
- **KPICard —** Métrique clé avec label, valeur, tendance (flèche haut/bas), couleur conditionnelle. Agrégations : count, sum, avg, min, max. Grille 1/2/4 colonnes selon breakpoint.
- **BarChart —** Graphique en barres horizontal/vertical avec tooltip. Group by + agrégation. Labels tronqués sur mobile. Palette daltonien-friendly. Tableau alternatif accessible.
- **PieChart —** Camembert ou donut avec légende interactive. Group by + count/sum. Légende sous le graphique sur mobile, à droite sur desktop. Segments navigables au clavier.
- **LineChart —** Série temporelle avec multiples lignes et axes. Zoom tactile sur mobile. Sous-échantillonnage si >100 points sur mobile. Navigation point par point au clavier.
- **KanbanBoard —** Colonnes drag-and-drop par champ statut. Cards avec résumé. Swimlanes optionnels. Scroll horizontal entre colonnes sur mobile. Réordonnement clavier (Espace + flèches).
- **DetailView —** Fiche détail d'un enregistrement. Tous champs affichés avec mise en forme contextuelle. Mode éditable optionnel. Pleine largeur sur tous les breakpoints.
- **ImageGallery —** Grille d'images responsive avec lightbox et navigation. 1/2/3-4 colonnes selon breakpoint. Alt généré depuis caption_field. Navigation lightbox au clavier.
- **FilterBar —** Filtres dynamiques qui contrôlent les autres composants (date_range, select, multi_select, search, number_range). Inline sur desktop, menu déroulant sur mobile. aria-live pour résultats.
- **Container —** Layout flex/grid pour organiser les composants. Modes : row, column, grid. Passage auto de row à column sous 640px. Role group quand sémantiquement pertinent.
- **PageNav —** Navigation entre vues : tabs horizontaux, sidebar, breadcrumbs. Tabs scrollables sur mobile. Sidebar en hamburger sur mobile. role=tablist/tab/tabpanel avec aria-selected.

## 6.4 Moteur de thèmes

Les entreprises personnalisent leur instance via un système de thèmes basé sur les CSS custom properties. Personnalisable : couleur primaire, couleur secondaire, couleur d'accent, logo, nom de l'entreprise, police (choix parmi 5 fonts pré-approuvées). Le thème par défaut (« instack blue ») est conçu pour être neutre et professionnel. Un aperçu temps réel permet de voir les changements avant validation. Le dark mode est supporté via prefers-color-scheme avec des tokens dédiés.

---

# 7. App Store & Marketplace

## 7.1 Store interne (V1 — Mois 3)

Le store interne est le hub central où les employés découvrent, utilisent et partagent des apps. Il est conçu pour être aussi intuitif qu'un app store mobile.

### Architecture de l'information

- **Page d'accueil :** Featured (apps mises en avant par le DSI), Trending (les plus utilisées cette semaine), New (dernières créations), For You (recommandations IA basées sur le knowledge graph).
- **Navigation par catégories :** Opérations, Ventes, RH, Finance, Gestion de projet, Reporting, Inventaire, Service Client, Qualité, Communication, Logistique, Formation.
- **Recherche :** full-text + IA (« trouve-moi une app pour suivre les livraisons »).
- **Mes apps :** apps créées, apps utilisées, apps partagées avec moi, brouillons.

### App Card

Chaque app est représentée par une card contenant : icône auto-générée (basée sur l'archétype + type de données), titre, description courte (1 ligne), avatar du créateur, nombre d'utilisateurs actifs, note moyenne (étoiles), badge d'archétype (Dashboard, CRUD, Kanban...), indicateur d'expiration (vert = actif, orange = expire bientôt, gris = expiré), sources de données (icônes Excel/SharePoint/GDrive).

### Page détail d'une app

Titre + description complète (markdown), captures d'écran auto-générées depuis l'app live, sources de données requises avec permissions, informations du créateur (nom, équipe, apps créées), statistiques d'usage (utilisateurs actifs, interactions ce mois, créée le, expire le), avis et commentaires, CTA principal : « Utiliser cette app » ou « Cloner et personnaliser ».

## 7.2 Partage & distribution

- **Partage par lien :** 3 niveaux — public dans l'org, restreint à l'équipe, privé (invitation uniquement).
- **Permissions par app :** Viewer (lecture seule), Editor (saisie de données), Admin (modification de l'app).
- **Publication en template :** app → « Publier comme template » → métadonnées + description → revue → publication dans le store.
- **Fork/clone :** un clic pour cloner avec un wizard de rebinding des données (« choisissez votre fichier Excel »).
- **Collections d'équipe :** ensembles curated d'apps par équipe/fonction (« Kit démarrage Ventes », « Outils Qualité »).
- **Notifications :** « X a partagé une app avec vous », « Votre app expire dans 7 jours », « Nouvelle app dans votre équipe ».

## 7.3 Marketplace inter-entreprises (V2-V3)

| Phase | Timeline | Modèle | Contenu |
|---|---|---|---|
| V1 — Interne | Mois 3 | Inclus dans l'abo | Templates partagés au sein de l'entreprise |
| V2 — Inter-entreprises | Mois 9 | Freemium | Partage anonymisé, top templates payants |
| V3 — Développeurs tiers | Mois 15 | 20% commission | Composants custom + intégrations tierces |

Les templates sont des manifestes JSON référençant les composants atomiques + data bindings, versionnés en semver, distribués via un registre OCI-compatible. Un template ne contient jamais de code — uniquement du JSON déclaratif, ce qui le rend auditable et sécurisé par design.

---

# 8. Cockpit DSI & Gouvernance

> « Le DSI est le buyer. Le cockpit DSI doit être prêt au Mois 3. » — C'est l'outil qui transforme l'usage organique bottom-up en contrat enterprise top-down.

## 8.1 Dashboard principal

Vue synthétique de l'activité plateforme :

- **KPI Cards :** Apps actives, Apps expirant dans 7 jours, Créateurs actifs ce mois, Sources de données connectées, Appels API Graph restants, Score de santé plateforme.
- **Graphiques de tendance :** Création d'apps par semaine, Adoption par équipe (stacked bar), Usage quotidien (line chart), Répartition par archétype (pie chart).
- **Alertes :** Sécurité (tentatives d'accès non autorisées), Expiration (apps expirant sans renouvellement), Activité inhabituelle (pic de création, accès massif).

## 8.2 Gouvernance des apps

- **Inventaire complet :** toutes les apps avec créateur, date de création, expiration, statut, sources de données, utilisateurs, dernière activité.
- **Vue détail :** qui a créé, quelles données, qui utilise, journal d'activité.
- **Actions en masse :** prolonger expiration, archiver, supprimer, transférer la propriété.
- **Politiques :** durée de vie max, expiration obligatoire, règles d'archivage auto, restrictions de sources de données.
- **Workflow d'approbation :** optionnel, configurable par équipe/sensibilité des données.

## 8.3 Gouvernance des données

- **Inventaire des sources :** tous les fichiers Excel/SharePoint connectés avec quelles apps y accèdent.
- **Visualisation des flux :** graphe montrant données → apps → utilisateurs.
- **Détection de données sensibles :** flag PII, données financières.
- **Audit d'accès :** qui a accédé à quoi, via quelle app, quand.
- **Dashboard de résidence :** où sont les données, statut de conformité.

## 8.4 Gestion des utilisateurs

Liste des utilisateurs avec rôles (viewer, creator, admin), structure d'équipes sync depuis Azure AD/Google Workspace, quotas par créateur (max apps, max apps actives), rapports d'activité par utilisateur, nettoyage automatique quand un employé quitte l'entreprise.

## 8.5 Sécurité & conformité

| Obligation | Implémentation | Statut MVP |
|---|---|---|
| RGPD — Base légale (art. 6.1.f) | Intérêt légitime employeur + DPA template | Prêt |
| RGPD — Droit à l'effacement (art. 17) | Suppression cascade : user → apps → data → graphe | Automatisé |
| RGPD — Privacy by design (art. 25) | RLS, chiffrement AES-256-GCM, token proxy, zéro cleartext | Natif |
| EU Data Act | Zéro vendor lock-in, export JSON/CSV, portabilité | Natif |
| CLOUD Act US | Self-host EU (OVH/Scaleway), zéro donnée métier stockée | Natif |
| Chiffrement tokens | AES-256-GCM, envelope encryption, KEK rotation trimestrielle (AWS KMS) | Actif |

## 8.6 Onboarding DSI

Wizard en 6 étapes : (1) Admin consent Azure AD / Google Workspace, (2) Crawl initial SharePoint (3-5 min), (3) Configuration des politiques (expiration, quotas, approbation), (4) Sélection de l'équipe pilote, (5) Définition des métriques de succès, (6) Lancement du pilote 30 jours. Documentation pré-écrite pour le comité sécurité fournie.

---

# 9. Stratégie Go-to-Market

## 9.1 Positionnement & messaging

> « Vos employés créent des apps en 10 minutes. Vos données ne quittent jamais votre SharePoint. »

### Taglines candidates

- « L'app store de votre entreprise. Généré par IA. Gouverné par la DSI. »
- « Des apps métier en 10 minutes. Zéro code. Zéro dette. »
- « Créez. Utilisez. Jetez. Recommencez. »
- « Le shadow IT, en version légale. »
- « Vos fichiers Excel méritent mieux qu'un tableau croisé dynamique. »

### Elevator pitch (30 secondes)

« Aujourd'hui, quand un Ops Manager a besoin d'un outil, il attend 6 mois la DSI ou bricole un Excel. Avec instack, il décrit son besoin à l'IA et obtient une app métier connectée à ses vrais fichiers en 10 minutes. L'app est jetable, la donnée reste dans SharePoint, et le DSI voit tout depuis son cockpit. C'est le Power Apps que Microsoft n'a jamais su faire. »

## 9.2 Stratégie PLG (Product-Led Growth)

L'adoption suit un schéma bottom-up entry, top-down conversion identique à Slack, Notion et Figma :

- **Bottom-up :** un employé découvre instack, crée une app, la partage à son équipe. L'usage se propage organiquement.
- **Top-down :** quand 3-5 équipes l'utilisent, la DSI reçoit la proposition cockpit de gouvernance.
- **Triggers de conversion free → paid :** >3 apps actives OU >10 créateurs dans l'org.
- **Modèle freemium :** Gratuit = 3 apps max, 1 créateur, zéro cockpit. Paid = illimité + cockpit DSI + partage + support.

## 9.3 Canaux de distribution

| Canal | Priorité | Timing | CAC estimé | Justification |
|---|---|---|---|---|
| Microsoft AppSource | P0 | Mois 3-6 | ~€0 | Visibilité auprès de tous les admins M365 |
| Content SEO | P0 | Mois 1+ | ~€50/lead | Niches « Alternative Power Apps », « Shadow IT solution » |
| LinkedIn Ads FR/Benelux | P1 | Mois 6+ | ~€150/lead | Ciblage Ops Managers, DSI. Budget €3-5K/mois |
| Partenaires MSP | P1 | Mois 9+ | ~€0 | Partenaires Microsoft cherchent produits à revendre |
| Google Workspace Marketplace | P2 | Mois 12+ | ~€0 | Second écosystème, pitch « agnostique » |

## 9.4 L'arme européenne

Le contexte réglementaire européen est un avantage structurel massif en 2026 :

- **EU Data Act (sept. 2025) :** interdit le vendor lock-in cloud. instack est nativement anti-lock-in.
- **CLOUD Act US :** oblige les fournisseurs US à fournir des données EU aux autorités US. instack en self-host EU élimine ce risque.
- **RGPD (€7.1B d'amendes cumulées) :** terrorise les DSI. Zéro donnée métier stockée = zéro risque.
- **€80B de dépense sovereign cloud :** croissance de 83% YoY en EU. Le marché va vers instack.

## 9.5 Plan de lancement

| Phase | Timeline | Objectif | Métriques |
|---|---|---|---|
| Beta privée | Mois 4 | 20 entreprises, validation PMF | 50+ apps, NPS>40, taux IA>92% |
| Lancement public | Mois 6 | PR, Product Hunt, LinkedIn | 200 signups, 30 entreprises actives |
| AppSource listing | Mois 6-8 | Référencement Microsoft | 500 installs en 3 mois |
| Channel partners | Mois 9-12 | 5 MSP partenaires actifs | 100 leads qualifiés via partners |

---

# 10. Roadmap Produit

## 10.1 Vision 18 mois — Now / Next / Later

| NOW (M1-4) | NEXT (M5-9) | LATER (M10-18) |
|---|---|---|
| MVP : 12 composants, pipeline IA, sync Excel, App Store interne, cockpit DSI, beta 20 entreprises | Google Workspace, API Marketplace (Stripe, Twilio), offline/PWA, inter-company marketplace, real-time collab | Agentic apps (Temporal.io), développeurs tiers (20% commission), native iOS/Android, digital twin organisation |

## 10.2 Roadmap trimestrielle détaillée

### Q1 — Mois 1-3 : Fondations → AI Engine → App Store

**Mois 1 :** Monorepo Turborepo, Cloudflare Workers, API Gateway (Hono), 12 composants atomiques dans Storybook, Neon PG avec RLS, Azure AD SSO, Neo4j Aura premier crawl, pipeline étages 1-3.

**Mois 2 :** Pipeline IA complet end-to-end, conversation itérative (JSON patch), AppRenderer (JSON → React), write-back PG → Excel via BullMQ, enrichissement knowledge graph. Cible : taux succès >90%.

**Mois 3 :** App Store UI (portail interne, mes apps, apps partagées, recherche, templates), partage par lien, système de permissions (viewer/editor/admin), cockpit DSI, système d'expiration automatique.

### Q2 — Mois 4-6 : Beta → Google Workspace → Multi-modal

**Mois 4 :** Security hardening (pentest OWASP Top 10, audit CSP), optimisation performance (cache Dragonfly, batching Graph API), onboarding 20 beta-testeurs, analytics PostHog, prototype billing Stripe.

**Mois 5 :** Support Google Workspace (Sheets, Drive). Adapter pattern pour abstraire Microsoft/Google. Ouvre 40% du marché entreprise supplémentaire.

**Mois 6 :** Multi-modal (scan papier → app digitale). Offline-first/PWA pour usage terrain. Webhooks et event triggers.

### Q3 — Mois 7-9 : Growth → Marketplace → Scale

Marketplace inter-entreprises (templates anonymisés, rating, freemium). Collaboration temps réel (Figma-like). Expansion Benelux + DACH. Self-hosting on-premise pour grands comptes.

### Q4 — Mois 10-12 : Scale → Agentic → Enterprise

Apps agentiques via Temporal.io (« chaque vendredi, génère le rapport, envoie-le à l'équipe, mets à jour le CRM » avec approbation humaine). Interface vocale. Custom ML sur données client.

### Q5-Q6 — Mois 13-18 : Expansion → Developers → International

Portail développeurs tiers (composants custom, intégrations, 20% commission). Apps natives iOS/Android (React Native). Expansion internationale. Série A €8-15M.

## 10.3 Alignement fundraising

| Étape | Montant | Timeline | Milestones requis |
|---|---|---|---|
| Pre-Seed | €300-500K | Mois 0-9 | MVP, SharePoint connecté, SSO, 20 beta-testeurs, 50 apps |
| Seed | €1.5-2.5M | Mois 9-12 | 50 entreprises payantes, €200K ARR, NPS>40, équipe 6-8 |
| Série A | €8-15M | Mois 24-30 | 500+ entreprises, €2M+ ARR, expansion Benelux+DACH, self-hosting |

---

# 11. Plan de Sprints MVP

8 sprints de 2 semaines, équipe de 5 personnes. Velocité nette totale : 278 story points. Buffer de 20% intégré.

| Sprint | Semaines | Objectif | Livrable clé | Vélocité |
|---|---|---|---|---|
| S1 | 1-2 | Fondations : monorepo, OAuth M365, 4 composants Storybook, schemas DB | Login OAuth + Storybook + Schema DB | 24 SP |
| S2 | 3-4 | Connexion Excel via Graph API, 12 composants complets | Liste fichiers Excel + Storybook 12 composants | 32 SP |
| S3 | 5-6 | Première génération IA end-to-end | Démo : prompt → app fonctionnelle | 38 SP |
| S4 | 7-8 | Multi-prompt, templates, écriture Excel, régénération partielle | Boucle complète création/modification | 40 SP |
| S5 | 9-10 | Dashboard utilisateur, partage, expiration, Neo4j indexation | Dashboard + partage + expiration | 40 SP |
| S6 | 11-12 | Cockpit DSI, cache Dragonfly, Core Web Vitals | Cockpit DSI + perf optimisée | 38 SP |
| S7 | 13-14 | Onboarding guide, monitoring, qualité IA >90% | Parcours onboarding complet | 36 SP |
| S8 | 15-16 | Beta launch : 10 entreprises, load test, NPS | Lancement beta en live | 30 SP |

## 11.1 Quality gates

| Sprint | Gate critique | Seuil |
|---|---|---|
| S3 | Taux de succès IA première génération | >80% sur 20 cas de test |
| S4 | Taux de succès IA avec multi-prompt | >85%, latence P95 <15s |
| S6 | Core Web Vitals | LCP <2s, cache hit-rate >70% |
| S7 | Qualité IA production-ready | >90% sur 30 cas de test |
| S8 | Stabilité production | Zéro bug P0 sur 48h, 50 users simultanés OK |

## 11.2 Décision critique — Sprint 3

> Le Sprint 3 est le moment de vérité. Si le taux de génération IA est sous 70% à la fin de S3, il faut revoir le scope des composants ou contraindre davantage les prompts avant de continuer. C'est le go/no-go technique du projet.

---

# 12. Modèle Économique & Financier

## 12.1 Modèle de revenus hybride

Socle par entreprise (€299/mois) + tarif par créateur actif (€5/utilisateur/mois). Les viewers sont gratuits — seuls les créateurs paient. Ce modèle aligne le revenu sur la valeur délivrée et facilite le land-and-expand.

| Plan | Prix | Inclus | Extra |
|---|---|---|---|
| Free | €0 | 3 apps max, 1 créateur, viewers illimités | Pas de cockpit DSI, pas de partage avancé |
| Pro | €299/mois | Apps illimitées, 10 créateurs inclus, cockpit DSI, partage | +€5/créateur supplémentaire |
| Enterprise | Sur devis | Self-hosting, SSO SAML, SLA, support dédié | Intégrations custom, audit avancé |

## 12.2 Dimensionnement marché

| $44.5B — Marché low-code global 2026 | $13.4B — TAM Citizen Dev (30%) | €630M — SAM Europe (115K entreprises) | $9-14M — SOM 5 ans ARR |
|---|---|---|---|

## 12.3 Chemin vers €10M ARR

| Année | Clients | ARPA | ARR | MRR |
|---|---|---|---|---|
| Année 1 | 50 | €4 200 | €210K | €17.5K |
| Année 2 | 200 | €4 500 | €900K | €75K |
| Année 3 | 500 | €5 000 | €2.5M | €208K |
| Année 4 | 1 200 | €5 000 | €6M | €500K |
| Année 5 | 2 000 | €5 500 | €11M | €917K |

## 12.4 Unit economics

Coût infrastructure par utilisateur : €0.15-0.27/mois. Coût LLM par app : €0.031 (génération + itérations). Avec un pricing de €5-15/user/mois, la marge brute atteint 95-98%. LTV/CAC cible : >5x. Payback period cible : <12 mois.

## 12.5 Comparables

| Entreprise | Valorisation | ARR estimé | Multiple |
|---|---|---|---|
| Retool | $3.2B | ~$100M | 32x |
| Notion | $10B | ~$300M | 33x |
| Glide | ~$1B | ~$20M | 50x |
| Budibase | ~$100M | ~$5M | 20x |

Si instack atteint €10M+ ARR avec un multiple de 20-50x, la valorisation potentielle se situe entre €200M et €500M.

---

**INSTACK**
Product Blueprint — Avril 2026 — Confidentiel

12 chapitres • 5 personas • 12 composants atomiques • 8 archetypes • 8 sprints
Pipeline IA 4 étages • Knowledge Graph • Marketplace 3 phases • Cockpit DSI
Roadmap 18 mois • €208/mois d'infra • 95-98% marge brute • $9-14M SOM

> GO — avec une urgence d'exécution de niveau guerre. Le marché existe, le timing est bon, le white space est vérifié. Chaque mois de retard est un risque existentiel.

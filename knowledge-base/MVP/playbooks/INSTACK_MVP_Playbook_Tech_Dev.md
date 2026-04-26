---
title: "INSTACK MVP Playbook Tech Dev"
source_file: "MVP/playbooks/INSTACK_MVP_Playbook_Tech_Dev.docx"
type: docx
date_converted: "2026-04-26"
parent_folder: "playbooks"
---







**INSTACK**

MVP Playbook Tech & Development

Guide d'execution pour le CTO

**Phase A (8 semaines) + Phase B (8 semaines)**






Document confidentiel — Usage interne uniquement

Version 1.0 — Avril 2026


# 1. Architecture Technique MVP

L'architecture technique du MVP INSTACK repose sur trois couches fondamentales, concues pour offrir un equilibre optimal entre rapidite de developpement, securite multi-tenant et evolutivite vers la version enterprise. Chaque couche a ete selectionnee pour minimiser la complexite operationnelle tout en garantissant une base solide pour les iterations futures.


## 1.1 Les 3 Couches Fondamentales


**Couche 1 — PostgreSQL Neon (Source de verite transactionnelle)**

PostgreSQL heberge sur Neon constitue la source de verite unique pour l'ensemble des donnees transactionnelles de la plateforme. Neon a ete choisi pour son modele serverless avec auto-scaling, son branching instantane pour les environnements de dev/staging, et sa compatibilite totale avec l'ecosysteme PostgreSQL. Le Row-Level Security (RLS) est active sur chaque table pour garantir l'isolation stricte des donnees entre tenants. Chaque requete est executee dans le contexte d'un tenant specifique via SET app.current_tenant, ce qui empeche tout acces croise entre organisations.


**Couche 2 — Context Graph JSONB (Remplacement Neo4j pour MVP)**

Plutot que d'introduire Neo4j des le MVP (ce qui ajouterait une dependance d'infrastructure significative), le graphe de contexte est stocke dans une colonne JSONB au sein de PostgreSQL. Cette structure capture les relations entre applications, sources de donnees, composants et utilisateurs. Le format JSONB permet des requetes flexibles via les operateurs natifs PostgreSQL (@>, ->>, jsonb_path_query) tout en restant facilement migreable vers Neo4j en V2 lorsque la complexite des traversees de graphe le justifiera. Le context_graph stocke les dependances inter-applications, les lineages de donnees, et les patterns d'usage pour alimenter les recommandations IA.


**Couche 3 — Excel/SharePoint Sync**

La synchronisation avec les fichiers Excel et les listes SharePoint constitue le pont entre INSTACK et les donnees metier existantes des entreprises. En Phase A, cette synchronisation est en lecture seule : INSTACK ingere les donnees depuis SharePoint/Excel via l'API Microsoft Graph pour alimenter les applications generees. En Phase B, le mode bidirectionnel (write-back) est active, permettant aux applications INSTACK de modifier les donnees source. Ce write-back implemente un mecanisme de conflict resolution base sur le timestamp de derniere modification (last-writer-wins avec detection de conflits).


## 1.2 Stack Technologique



## 1.3 Schema PostgreSQL Detaille

Le schema suivant definit les tables principales du MVP. Chaque table inclut une colonne tenant_id utilisee par les policies RLS pour l'isolation des donnees.



## 1.4 Modele Row-Level Security (RLS)

Le modele RLS garantit que chaque requete SQL ne retourne que les donnees du tenant courant. L'implementation repose sur une variable de session PostgreSQL positionnee a chaque connexion par la couche API Hono.


Principe de fonctionnement : a chaque requete entrante, le middleware Hono extrait le tenant_id du JWT, puis execute SET app.current_tenant = '<tenant_uuid>' avant toute operation. Les policies RLS sur chaque table filtrent automatiquement via current_setting('app.current_tenant')::uuid = tenant_id. Ce mecanisme est transparent pour le code applicatif et offre une isolation au niveau base de donnees, independante de tout bug eventuel dans la couche API.

Chaque table possede deux policies : une pour SELECT (lecture) et une combinee pour INSERT/UPDATE/DELETE (ecriture), toutes deux conditionnees sur la correspondance tenant_id. Les super-admins INSTACK disposent d'un bypass role dedie pour les operations cross-tenant (support, monitoring).


# 2. Pipeline IA — 4 Etages

Le pipeline de generation d'applications par intelligence artificielle constitue le coeur technologique d'INSTACK. Il transforme une description en langage naturel et une source de donnees en une application fonctionnelle, en quatre etapes distinctes et validees independamment. Cette architecture en etages permet d'isoler les responsabilites, de debugger efficacement et d'optimiser les couts en utilisant le bon modele au bon moment.


## 2.1 Etage 1 — Classification d'Intent (Claude Haiku)

Le premier etage analyse la requete utilisateur pour determiner l'archetype d'application le plus adapte. Claude Haiku est utilise ici pour son rapport qualite/cout optimal : la classification d'intent est une tache relativement simple qui ne necessite pas la puissance d'un modele frontier.


**Les 8 Archetypes d'Application**


Cout par appel : 0.001 EUR. La classification prend en moyenne 200ms et consomme environ 500 tokens (input + output). A 500 employes generant chacun 2 applications par mois, le cout mensuel de l'etage 1 est inferieur a 1 EUR.


## 2.2 Etage 2 — Inference Schema Deterministe

L'etage 2 est entierement deterministe (sans IA) : il analyse les 100 premieres lignes de la source de donnees pour inferer un schema type. Ce processus applique 10 regles de typage sequentielles pour determiner le type de chaque colonne.


**Les 10 Regles de Typage**

- Detection de dates : patterns ISO 8601, formats francais (JJ/MM/AAAA), formats US (MM/DD/YYYY)
- Detection de numeriques : entiers, decimaux, pourcentages, montants avec devise
- Detection de booleens : true/false, oui/non, 0/1, vrai/faux
- Detection d'emails : regex RFC 5322 simplifiee
- Detection d'URLs : patterns http(s), chemins SharePoint
- Detection d'enumerations : colonnes avec <20 valeurs distinctes sur 100 lignes
- Detection de texte long : colonnes avec moyenne >100 caracteres
- Detection de noms propres : capitalisation, patterns prenom/nom
- Detection de references : patterns de codes (REF-XXX, #1234, UUID)
- Type par defaut : string pour toute colonne non classifiee

Ce schema infere est ensuite utilise par l'etage 3 pour contraindre la generation. Il est egalement stocke avec l'application pour permettre la validation des donnees en temps reel.


## 2.3 Etage 3 — Generation Contrainte (Claude Sonnet 4)

L'etage 3 est le coeur generatif du pipeline. Claude Sonnet 4 est invoque via l'API Anthropic en mode tool_use pour produire un JSON structurant l'application complete. Le system prompt est compose de quatre elements concatenes :


- Le catalogue des 12 composants TypeScript disponibles, avec leurs interfaces strictes et leurs contraintes de composition
- Le schema infere a l'etage 2, incluant types, cardinalites et exemples de valeurs
- Le contexte graphe du tenant (applications existantes, sources utilisees, patterns recurrents)
- 8 few-shot examples couvrant chaque archetype, demontrant le format JSON attendu

Le mode tool_use force Claude a produire un output JSON strict conforme au schema de reponse defini. Cela elimine les hallucinations de format et garantit que chaque composant reference existe dans le catalogue. Le prompt systeme fait environ 4000 tokens et chaque generation consomme entre 800 et 2000 tokens de sortie selon la complexite.


Cout par generation : 0.018 EUR en premiere generation, 0.005 EUR par iteration de raffinement.


## 2.4 Etage 4 — Validation & Rendu

Le dernier etage applique trois passes de validation avant le rendu final :


**Passe 1 — Type Checking**

Chaque composant du JSON genere est valide contre son interface TypeScript. Les types des proprietes sont verifies, les champs requis sont confirmes presents, et les references aux colonnes du schema sont resolues. Tout echec de validation declenche une boucle de correction automatique (re-invocation de l'etage 3 avec le message d'erreur).

**Passe 2 — Layout Validation**

La structure de layout est validee : pas de composants superposés, respect des contraintes de grille (12 colonnes), coherence des breakpoints responsive. Les KPICards doivent reference des colonnes numeriques, les BarCharts necessitent au moins une dimension et une mesure.

**Passe 3 — AST Security Scan**

Un scan de securite statique analyse le JSON pour detecter toute tentative d'injection : pas de balises script, pas d'event handlers inline, pas de references a des URLs externes non-whitelistees, pas d'expressions evaluables. Ce scan utilise un parseur AST dedie, pas une simple regex.


**Rendu React Deterministe**

L'AppRenderer transforme le JSON valide en arbre React. Ce rendu est entierement deterministe : le meme JSON produit toujours la meme interface. Aucun composant genere n'a d'acces direct au DOM, au reseau ou au stockage local. Toute interaction avec les donnees passe par les API INSTACK securisees.


## 2.5 Synthese des Couts IA


# 3. Les 12 Composants Atomiques

INSTACK utilise un systeme de 12 composants atomiques qui constituent les briques de base de toute application generee. Chaque composant possede une interface TypeScript stricte definissant ses proprietes requises et optionnelles, ses sources de donnees, et ses interactions possibles. Ce catalogue ferme est essentiel pour la generation contrainte : l'IA ne peut produire que des combinaisons de ces 12 composants, eliminant ainsi les hallucinations de composants inexistants.


## 3.1 Catalogue Complet


## 3.2 Phasage de Livraison


**Phase A (Semaines 1-8) — 6 Composants Fondamentaux**

Les 6 composants de Phase A couvrent 85% des cas d'usage identifes lors des interviews prospects : formulaires de saisie (FormField), tableaux de donnees (DataTable), indicateurs chiffres (KPICard), graphiques basiques (BarChart), filtres (FilterBar) et mise en page (Container). Cette selection permet de generer des applications de type CRUD Form, Dashboard et Report des le premier mois.


**Phase B (Semaines 9-16) — 6 Composants Avances**

Les 6 composants de Phase B ajoutent les interactions avancees : graphiques complementaires (PieChart, LineChart), Kanban avec write-back, vues detail, galerie d'images et navigation multi-pages. Ces composants debloquent les archetypes Tracker/Kanban, Gallery et Multi-view.


## 3.3 AppRenderer : JSON vers React Deterministe

L'AppRenderer est le moteur de rendu qui transforme le JSON de definition d'application en arbre de composants React. Son fonctionnement est strictement deterministe : pour un JSON identique, le rendu est toujours identique. Le renderer parcourt l'arbre JSON en profondeur, instancie chaque composant avec ses props validees, et connecte les interactions (filtrage, navigation, selection) via un systeme d'evenements interne. Aucun composant n'a d'acces direct au reseau ; toutes les donnees transitent par un DataProvider centralise qui gere le cache, la pagination et la synchronisation avec les sources.


# 4. Modele de Securite

La securite est une exigence non-negociable pour INSTACK, car la plateforme accede aux donnees metier sensibles des entreprises clientes via Microsoft 365. Le modele de securite repose sur quatre principes fondamentaux : moindre privilege, isolation totale, zero-trust et conformite RGPD by design.


## 4.1 OAuth 2.0 avec Admin Consent

L'authentification utilise le flow OAuth 2.0 Authorization Code avec PKCE, implemente via Microsoft Entra ID (anciennement Azure AD). Pour les entreprises, l'Admin Consent est requis : un administrateur Microsoft 365 autorise INSTACK a acceder aux ressources organisationnelles. Ce mecanisme garantit que le DSI controle explicitement les permissions accordees.


**Scopes MVP Demandes**


En Phase B, les scopes Files.ReadWrite.All et Sites.ReadWrite.All seront ajoutes pour le write-back. Chaque ajout de scope necessite un re-consent de l'administrateur.


## 4.2 Token Proxy — Zero Token Exposure

Les applications generees par INSTACK n'ont jamais acces aux tokens Microsoft Graph. Toute requete vers les donnees passe par un Token Proxy server-side execute dans Cloudflare Workers. Ce proxy stocke les tokens chiffres dans Workers KV (AES-256), les dechiffre en memoire uniquement le temps de la requete, et les transmet a l'API Microsoft Graph. Les applications front-end ne recoivent que les donnees, jamais les credentials. Ce design elimine le risque de fuite de token via XSS ou interception client-side.


## 4.3 Les 4 Couches d'Isolation



## 4.4 Conformite RGPD

INSTACK adopte une approche zero donnee metier stockee : les donnees des entreprises clientes transitent par la plateforme mais ne sont jamais persistees dans les bases INSTACK. Seuls les schemas (structure des colonnes, types) et les metadonnees (noms d'applications, configurations de composants) sont stockes. Les donnees elles-memes restent dans SharePoint/OneDrive et sont chargees a la volee.


- DPA (Data Processing Agreement) requis avec Anthropic avant mise en production
- SCCs (Standard Contractual Clauses) pour les transferts de donnees hors UE vers l'API Anthropic
- Registre de traitement RGPD maintenu avec chaque type de donnee, finalite et duree de retention
- Droit a l'effacement implemente : suppression de toutes les metadonnees tenant sur demande sous 72h

## 4.5 Chiffrement


# 5. Planning Semaine par Semaine (S1-S16)

Ce planning detaille les livrables attendus chaque mois, decomposes en sprints de 2 semaines. Chaque sprint se termine par une demo interne et une revue de qualite. Les dependances entre workstreams sont identifiees pour eviter les blocages.


## MOIS 1 — Fondations (S1-S4)

L'objectif du premier mois est de poser l'infrastructure technique complete et de livrer les deux premiers composants fonctionnels avec le debut du pipeline IA.


**S1-S2 : Infrastructure & Schema**

- Deploiement du projet Neon PostgreSQL avec configuration RLS complete
- Creation du schema complet : tables tenants, users, apps, app_components, data_sources, context_graph, audit_logs
- Implementation des policies RLS sur chaque table avec tests unitaires d'isolation
- Setup projet Hono sur Cloudflare Workers avec middleware JWT, CORS, rate limiting
- CI/CD : GitHub Actions avec deploy preview sur chaque PR, migrations automatiques
- Configuration PostHog et Sentry avec alertes de base

**S3-S4 : Pipeline IA Debut + Premiers Composants**

- Implementation de l'etage 1 (classification intent via Haiku) avec les 8 archetypes
- Implementation de l'etage 2 (inference schema deterministe) avec les 10 regles de typage
- Developpement du composant FormField avec validation temps reel et 6 types de champs
- Developpement du composant DataTable avec pagination, tri et filtrage inline
- Tests d'integration pipeline IA etages 1-2 avec 50 cas de test representatifs
- Demo interne : upload d'un fichier Excel, affichage du schema infere et de l'archetype detecte

## MOIS 2 — Pipeline Complet + Interface (S5-S8)

Le deuxieme mois complete le pipeline IA et livre les 4 composants restants de la Phase A, aboutissant a un prototype fonctionnel demonstrable.


**S5-S6 : Generation IA + Composants Visuels**

- Implementation de l'etage 3 (generation contrainte Sonnet 4 avec tool_use)
- Redaction du system prompt avec catalogue composants, schema, contexte et 8 few-shots
- Implementation de l'etage 4 (type checking, layout validation, AST security scan)
- Developpement des composants KPICard et BarChart
- Implementation de l'AppRenderer : transformation JSON vers arbre React
- Tests end-to-end : description textuelle vers application fonctionnelle complete

**S7-S8 : Auth + Sandbox + Cockpit**

- Implementation OAuth 2.0 en mode personal (chaque utilisateur autorise ses propres fichiers)
- Sandbox demo avec donnees synthetiques pour les prospects (aucun OAuth requis)
- Developpement des composants FilterBar et Container
- Cockpit DSI en lecture seule : liste des applications, utilisateurs actifs, logs d'audit
- Integration PostHog : tracking des evenements cles (creation app, erreurs IA, temps de generation)
- Demo de fin de Phase A : generation complete d'une application depuis un fichier Excel

## MOIS 3 — Phase B Debut (S9-S12)

Le troisieme mois marque le debut de la Phase B avec le write-back, les composants avances et l'App Store interne.


**S9-S10 : Write-back + Composants Avances**

- Implementation du sync bidirectionnel Excel/SharePoint avec conflict resolution last-writer-wins
- Developpement des composants PieChart, LineChart et KanbanBoard avec drag-and-drop
- Integration write-back dans le KanbanBoard (deplacement de carte = mise a jour SharePoint)
- Tests de charge : 100 utilisateurs simultanes, 50 write-backs concurrents

**S11-S12 : App Store + Cockpit Complet**

- Developpement des composants DetailView, ImageGallery et PageNav
- App Store interne : catalogue d'applications partagees au sein du tenant, recherche et duplication
- Cockpit DSI complet : politiques de gouvernance (whitelist sources, limites de generation, roles)
- Systeme de templates : applications pre-configurees duplicables en un clic

## MOIS 4 — Lancement (S13-S16)

Le dernier mois prepare le lancement commercial avec la facturation, l'onboarding entreprise et le beta programme.


**S13-S14 : Billing + Onboarding**

- Integration Stripe : plans Free (5 apps), Pro (illimitee), Enterprise (custom)
- Flow d'onboarding DSI entreprise : Admin Consent, configuration tenant, invitation utilisateurs
- Webhooks Stripe pour gestion du cycle de vie des abonnements
- Documentation technique API pour les partenaires integrateurs

**S15-S16 : Beta Launch**

- Templates specifiques retail : suivi stocks, planning equipes, reporting CA magasin
- Beta privee : 20 entreprises selectionnees, support prioritaire, feedback structure
- Monitoring renforce : dashboards operationnels, alertes on-call, runbooks
- Retrospective technique et priorisation de la roadmap V2

# 6. Dette Technique Acceptee

Toute strategie MVP implique des compromis deliberes. Les choix suivants sont documentes, assumes et planifies pour remediation en V2. Chaque element de dette est associe a son impact, sa probabilite de devenir un probleme, et le declencheur prevu pour sa resolution.



# 7. Risques Techniques & Mitigations

Cette section identifie les principaux risques techniques susceptibles d'impacter le succes du MVP, avec pour chacun une strategie de mitigation concrete et un plan de contingence.


## 7.1 Graph API Rate Limiting

Risque : L'API Microsoft Graph impose une limite de 5 requetes par seconde par application et par tenant. Lors de la synchronisation initiale de gros fichiers Excel ou de listes SharePoint volumineuses, cette limite peut provoquer des erreurs 429 (Too Many Requests) et ralentir significativement l'experience utilisateur.


Mitigation : Implementation d'un circuit breaker pattern avec trois etats (closed, open, half-open). Quand le taux d'erreurs 429 depasse 10% sur une fenetre de 30 secondes, le circuit s'ouvre et les requetes sont mises en file d'attente. Un cache Redis sur Cloudflare Workers (via Upstash) stocke les resultats des requetes Graph API avec un TTL de 5 minutes pour les listings et 60 minutes pour le contenu des fichiers. Le delta sync (requetes delta de Graph API) reduit le volume de requetes apres la synchronisation initiale.


Contingence : Si le rate limiting reste problematique malgre le cache, implementation d'un batch sync asynchrone avec notification utilisateur quand la synchronisation est terminee.


## 7.2 Hallucinations du LLM

Risque : Claude pourrait generer des composants inexistants, des references a des colonnes absentes du schema, ou des configurations invalides qui ne peuvent pas etre rendues par l'AppRenderer.


Mitigation : La generation contrainte via tool_use avec un schema JSON strict elimine les hallucinations de format. La validation en 3 passes de l'etage 4 (type checking, layout, AST security) detecte les erreurs semantiques. En cas d'echec de validation, une boucle de correction automatique reinvoque l'etage 3 avec le message d'erreur specifique (maximum 3 tentatives). Les 8 few-shot examples dans le system prompt ancrent les reponses sur des patterns corrects.


Contingence : Si le taux de succes premiere tentative descend sous 85%, ajout de few-shots supplementaires cibles sur les cas d'echec, et envisager un fine-tune Sonnet pour le cas d'usage specifique INSTACK.


## 7.3 Admin Consent Friction

Risque : Le flow Admin Consent Microsoft peut bloquer l'adoption : les utilisateurs finaux ne peuvent pas utiliser INSTACK tant que leur administrateur IT n'a pas approuve l'application. Ce processus peut prendre des jours ou des semaines dans les grandes organisations.


Mitigation : Deux strategies complementaires. D'abord, un mode sandbox avec donnees synthetiques permet de tester INSTACK sans aucune connexion Microsoft (zero friction pour la decouverte). Ensuite, un mode personal OAuth permet aux utilisateurs individuels d'autoriser leurs propres fichiers OneDrive sans Admin Consent (scope User.Read + Files.Read). Le mode Admin Consent complet est propose ensuite pour debloquer les ressources organisationnelles.


Contingence : Creation d'un kit d'adoption DSI avec documentation de securite, audit report, et FAQ pour accelerer le processus d'approbation interne.


## 7.4 Schema Evolution

Risque : Les fichiers Excel sources evoluent (ajout/suppression de colonnes, changement de types) ce qui peut casser les applications generees qui referencent l'ancien schema.


Mitigation : Chaque application stocke un schema_version. Lors de chaque synchronisation, le schema courant est compare au schema stocke. Si un changement est detecte, un mecanisme de migration automatique tente de resoudre les differences : renommage de colonnes (distance de Levenshtein <3), conversion de types compatibles (string vers number si 100% des valeurs sont numeriques), ajout de colonnes (nouveaux champs optionnels dans les composants). Les changements non-resolubles declenchent une notification a l'utilisateur avec un assistant de migration guide.


Contingence : En cas de breaking change majeur, l'application est automatiquement figee sur la derniere version fonctionnelle et l'utilisateur est invite a re-generer une version mise a jour.


# 8. KPIs Techniques

Les indicateurs de performance technique sont suivis en continu via PostHog (metriques produit) et Sentry (metriques infrastructure). Chaque KPI a une cible, un seuil d'alerte et un responsable. Les revues hebdomadaires du CTO incluent un dashboard consolide de ces metriques.



## 8.1 Objectifs par Phase


**Fin de Phase A (S8)**

- Pipeline IA fonctionnel avec taux de succes >85% (objectif conservateur, optimisation en Phase B)
- 6 composants livres et testes avec couverture >90%
- Temps de generation moyen <120 secondes
- Zero faille de securite critique identifiee lors de l'audit interne

**Fin de Phase B (S16)**

- Taux de succes IA >92% sur les 8 archetypes
- 12 composants livres, App Store fonctionnel avec >10 templates
- Time-to-first-app <90 secondes
- 20 entreprises beta actives avec >50 applications generees
- Cout infra total <500 EUR/mois pour l'ensemble de la beta


--- Fin du document ---


INSTACK MVP Playbook Tech & Dev — v1.0 — Avril 2026


| Composant | Technologie | Justification |
| --- | --- | --- |
| Backend / API | Hono on Cloudflare Workers | Latence edge <50ms, zero cold start, cout minimal, TypeScript natif |
| Frontend | React 18 + Vite | Ecosysteme composants riche, SSR possible en V2, compatibilite IA generation |
| Base de donnees | PostgreSQL (Neon Serverless) | RLS natif, JSONB pour flexibilite, branching pour CI/CD |
| Analytics | PostHog (free tier) | Event tracking, funnels, feature flags, self-hostable en V2 |
| Monitoring | Sentry (free tier) | Error tracking, performance monitoring, source maps |
| CDN / Hosting | Cloudflare Pages + Workers | Distribution globale, zero config SSL, Workers KV pour cache |
| Auth | Custom OAuth 2.0 + JWT | Controle total sur le flow Microsoft, token proxy securise |


| Table | Colonnes Principales | Description |
| --- | --- | --- |
| tenants | id (UUID PK), name, domain, plan, settings (JSONB), created_at | Organisations clientes, configuration et plan de facturation |
| users | id (UUID PK), tenant_id (FK), email, role (admin|editor|viewer), ms_oid, last_login | Utilisateurs avec role RBAC et lien vers Microsoft identity |
| apps | id (UUID PK), tenant_id (FK), name, intent, schema_version, status, created_by, created_at | Applications generees par l'IA, avec versioning du schema |
| app_components | id (UUID PK), app_id (FK), type, config (JSONB), layout (JSONB), order_index | Composants individuels avec configuration TypeScript-validated en JSONB |
| data_sources | id (UUID PK), tenant_id (FK), type (excel|sharepoint|manual), connection (JSONB), sync_status, last_sync | Connexions aux sources de donnees externes avec etat de synchronisation |
| context_graph | id (UUID PK), tenant_id (FK), nodes (JSONB), edges (JSONB), metadata (JSONB), updated_at | Graphe de contexte stockant les relations entre entites (remplacement Neo4j) |
| audit_logs | id (UUID PK), tenant_id (FK), user_id, action, resource_type, resource_id, details (JSONB), timestamp | Journal d'audit complet pour conformite et tracabilite DSI |


| Archetype | Description | Exemple Typique |
| --- | --- | --- |
| CRUD Form | Formulaire de saisie/edition avec validation | Fiche employe, bon de commande, demande de conge |
| Dashboard | Vue synthetique avec KPIs et graphiques | Tableau de bord commercial, suivi production |
| Tracker / Kanban | Suivi d'items avec etats et progression | Suivi de tickets, pipeline recrutement |
| Report | Rapport structure avec filtres et export | Rapport mensuel ventes, inventaire |
| Approval Workflow | Circuit de validation multi-etapes | Validation depenses, approbation contrats |
| Checklist | Liste d'actions avec suivi completion | Audit qualite, onboarding employe |
| Gallery | Vue visuelle d'elements avec miniatures | Catalogue produits, portfolio projets |
| Multi-view | Combinaison de plusieurs archetypes | CRM avec liste + fiche + dashboard |


| Metrique | Valeur | Commentaire |
| --- | --- | --- |
| Cout par generation (1ere) | 0.018 EUR | Sonnet 4 tool_use, ~2000 tokens output |
| Cout par iteration | 0.005 EUR | Corrections mineures, ~500 tokens output |
| Cout classification intent | 0.001 EUR | Haiku, ~500 tokens total |
| Cout moyen par app complete | 0.024 EUR | 1 classif + 1 generation + ~1 iteration |
| Cout mensuel 500 employes | 3.30 EUR | Hypothese 10 apps/employe/mois, 1.3 iterations moyenne |


| # | Composant | Phase | Description Fonctionnelle |
| --- | --- | --- | --- |
| 1 | FormField | A | Champ de formulaire avec validation temps reel. Supporte text, number, date, select, checkbox, textarea. Validation basee sur le schema infere. |
| 2 | DataTable | A | Tableau de donnees paginee avec tri, filtrage inline et selection de lignes. Export CSV integre. Colonnes auto-dimensionnees selon le type. |
| 3 | KPICard | A | Carte indicateur avec valeur principale, tendance (fleche), comparaison N-1 et sparkline optionnelle. Se lie a une colonne numerique aggregee. |
| 4 | BarChart | A | Graphique barres verticales/horizontales. Supporte groupes, stacked. Tooltips, legende auto. Source : 1 dimension + 1-3 mesures. |
| 5 | FilterBar | A | Barre de filtres dynamiques connectee aux autres composants. Genere automatiquement les filtres selon les types de colonnes (select pour enum, range pour numerique, datepicker pour date). |
| 6 | Container | A | Conteneur de layout en grille 12 colonnes. Gere le responsive avec breakpoints. Peut imbriquer d'autres containers. Aucune logique metier. |
| 7 | PieChart | B | Graphique circulaire/donut avec legende interactive. Limite auto a 8 segments + 'Autres'. Source : 1 dimension + 1 mesure. |
| 8 | LineChart | B | Graphique lineaire temporel avec multi-series. Zoom, pan, annotations. Ideal pour les tendances sur le temps. |
| 9 | KanbanBoard | B | Tableau Kanban drag-and-drop avec colonnes configurables. Cartes avec champs personnalises. Write-back sur deplacement. |
| 10 | DetailView | B | Vue fiche detaillee d'un enregistrement. Layout sections avec champs read-only ou editables. Navigation entre enregistrements. |
| 11 | ImageGallery | B | Galerie d'images en grille avec lightbox. Source : colonne URL d'image. Filtrage et recherche integres. |
| 12 | PageNav | B | Navigation multi-pages avec tabs ou sidebar. Permet de composer des applications multi-vues complexes. |


| Scope | Type | Utilisation |
| --- | --- | --- |
| Files.Read.All | Application | Lecture des fichiers Excel dans OneDrive/SharePoint pour alimenter les applications |
| Sites.Read.All | Application | Lecture des listes et bibliotheques SharePoint pour la synchronisation de donnees |
| User.Read | Delegated | Profil utilisateur courant pour l'authentification et le RBAC interne |
| offline_access | Delegated | Obtention de refresh tokens pour maintenir la synchronisation en arriere-plan |


| Couche | Mecanisme | Protection |
| --- | --- | --- |
| V8 Isolate | Cloudflare Workers runtime | Chaque requete s'execute dans un isolat V8 separe, sans memoire partagee entre tenants. Isolation au niveau CPU et memoire. |
| CSP Header | Content-Security-Policy strict | Bloque l'execution de scripts inline, restreint les sources de contenu aux domaines INSTACK. Empeche XSS et data exfiltration. |
| iframe Sandbox | sandbox='allow-scripts allow-same-origin' | Les composants generes s'executent dans des iframes sandboxees. Pas d'acces au DOM parent, pas de navigation, pas de popups. |
| Domaine Separe | apps.instack.io vs app.instack.io | Les applications generees sont servies sur un sous-domaine different du cockpit d'administration, empechant l'acces aux cookies de session admin. |


| Contexte | Methode | Detail |
| --- | --- | --- |
| Donnees au repos (at rest) | AES-256 | Workers KV, PostgreSQL Neon avec chiffrement natif, backups chiffres |
| Donnees en transit | TLS 1.3 | Toutes les communications inter-services et client-serveur en HTTPS strict (HSTS) |
| Tokens OAuth | AES-256-GCM | Chiffres dans Workers KV avec cle de rotation trimestrielle |
| Audit logs | Integrite SHA-256 | Chaque entree d'audit est chainee avec un hash du record precedent |


| Dette | Impact | Raison MVP | Plan V2 |
| --- | --- | --- | --- |
| JSONB au lieu de Neo4j pour le context_graph | Requetes de traversee de graphe en O(n) au lieu de O(log n). Acceptable sous 10 000 noeuds par tenant. | Elimine une dependance d'infrastructure (serveur Neo4j), reduit le cout ops de 200 EUR/mois, et simplifie le deploiement. | Migration vers Neo4j Aura (managed) quand un tenant depasse 5 000 noeuds ou quand les recommandations cross-tenant deviennent critiques. |
| Pas de Google Workspace | Exclut ~30% du marche potentiel (entreprises non-Microsoft). | Focus sur un seul ecosysteme pour livrer plus vite. Microsoft represente 70% du marche enterprise en France. | Connecteur Google Drive/Sheets en V2 Q2, Google Admin en V2 Q3. Architecture du sync layer deja concue pour etre multi-source. |
| Anthropic comme seul LLM provider | Dependance fournisseur unique. Risque de panne ou changement de pricing. | Les prompts sont optimises pour Claude. Le multi-LLM necessite un layer d'abstraction et des tests pour chaque modele. | Abstraction LLM en V2 avec fallback OpenAI GPT-4o. Tests de regression automatises par modele. |
| PostHog + Sentry free tier | Limites de retention (1 an PostHog, 30 jours Sentry), pas de SSO admin, pas de SLA. | Cout zero, suffisant pour <1000 utilisateurs et les metriques MVP essentielles. | Migration vers plans Team quand le nombre d'evenements depasse les quotas free, ou quand un client enterprise exige un SLA monitoring. |
| Tables dynamiques en JSONB partitionne | Pas de contraintes SQL strictes sur les donnees metier, validation applicative uniquement. | Flexibilite maximale pour supporter des schemas Excel varies sans migration de base. | Introduction de tables dynamiques DDL en V2 pour les tenants enterprise avec schemas stables et besoins de performance SQL. |


| KPI | Cible | Seuil Alerte | Methode de Mesure | Frequence |
| --- | --- | --- | --- | --- |
| Taux de succes IA 1ere tentative | 92-95% | <88% | Ratio generations validees etage 4 / total generations etage 3, sans boucle de correction | Quotidienne |
| Time-to-first-app | <90 secondes | >120 secondes | Duree entre le clic 'Generer' et l'affichage du premier rendu complet dans le navigateur | Quotidienne |
| Latence API P99 | <200ms | >350ms | Percentile 99 des temps de reponse de toutes les routes API Hono, mesure par Cloudflare Analytics | Temps reel |
| Uptime | 99.5% | <99.0% | Disponibilite des endpoints critiques mesuree par un health check externe toutes les 30 secondes | Mensuelle |
| Cout infra par tenant | <0.21 EUR/mois | >0.35 EUR/mois | Total des couts (Neon + Workers + Anthropic + Redis) divise par le nombre de tenants actifs | Mensuelle |
| Erreurs non-gerees (Sentry) | <5/jour | >20/jour | Nombre d'exceptions non-catchees remontees par Sentry, deduplicees | Quotidienne |
| Temps de sync initial | <30 secondes | >60 secondes | Duree de la premiere synchronisation d'un fichier Excel de 10 000 lignes via Graph API | Hebdomadaire |
| Taille moyenne du JSON genere | <15 KB | >30 KB | Taille du JSON de definition d'application produit par l'etage 3 | Hebdomadaire |

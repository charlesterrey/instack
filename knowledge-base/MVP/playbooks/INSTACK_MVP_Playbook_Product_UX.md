---
title: "INSTACK MVP Playbook Product UX"
source_file: "MVP/playbooks/INSTACK_MVP_Playbook_Product_UX.docx"
type: docx
date_converted: "2026-04-26"
parent_folder: "playbooks"
---







**INSTACK**

MVP Playbook

**Product & UX**


Guide d'execution pour le CPO

Scope, Personas, User Stories, Design





**Document confidentiel**

Version 1.0 — Avril 2026

Propriété INSTACK SAS — Ne pas diffuser sans autorisation


# Table des matières


# 1. Vision Produit MVP

## 1.1 Repositionnement stratégique

Décision War Room : Abandonner le positionnement "apps jetables" au profit de "L'App Store Interne Gouverné". Ce pivot fondamental traduit la réalité du marché : les DSI veulent de la gouvernance, pas du chaos. Les Ops veulent de l'autonomie, pas des jouets. Instack réconcilie les deux en offrant un catalogue d'applications métier générées par IA, connectées aux vraies données, et gouvernées par la DSI.

Ce repositionnement a trois implications majeures :

- Perception de valeur : une app dans un store interne = un asset d'entreprise, pas un prototype jetable. Les utilisateurs la traitent comme un outil officiel.
- Cycle de vente : le DSI devient allié (il gagne en visibilité) au lieu de bloqueur (il perd le contrôle). La gouvernance intégrée supprime le veto sécurité.
- Rétention : un store qui grandit crée un effet réseau intra-entreprise. Plus il y a d'apps, plus les utilisateurs reviennent, plus les créateurs publient.
## 1.2 Elevator Pitch (30 secondes)

"Quand un Ops Manager a besoin d'un outil, il décrit son besoin à l'IA et obtient une app métier connectée à ses vrais fichiers en 10 minutes. La DSI voit tout dans un cockpit. Les données ne quittent jamais Microsoft 365. C'est l'App Store interne que chaque ETI mérite."

## 1.3 North Star Metric

**Weekly Active Apps with 2+ users**

Cette métrique capture simultanément la création (une app existe), l'adoption (2+ utilisateurs = partage réussi) et la rétention (activité hebdomadaire). Elle est préférée aux métriques classiques :

- Vs. MAU : ne distingue pas créateurs passifs de vrais usages.
- Vs. Apps créées : ne mesure pas l'adoption post-création.
- Vs. Revenue : lagging indicator, trop tard pour pivoter.
**Cible M3 : 50 apps actives/semaine. Cible M6 : 500. Cible M12 : 5 000.**

## 1.4 Les 10 Moments Magiques

Chaque moment magique est un pic émotionnel qui transforme un utilisateur curieux en ambassadeur. Ils sont ordonnés par importance pour la conversion :



# 2. Les 5 Personas Détaillés

Ces personas sont issus de 47 interviews terrain menées entre janvier et mars 2026. Ils représentent les 5 archétypes clés de notre marché ETI (500-5000 employés) en France.


## 2.1 Sandrine Morel — Ops Manager (Créatrice)


## 2.2 Mehdi Benali — Chef Projet Amélioration Continue (Power User)


## 2.3 Philippe Garnier — DSI (Buyer / Gouvernance)


## 2.4 Clara Rousseau — Commerciale Terrain (Consommatrice)


## 2.5 Vincent Durand — DG/COO (Sponsor Exécutif)


# 3. User Stories Prioritisées

Chaque User Story est scorée selon la méthode RICE (Reach x Impact x Confidence / Effort) et validée par les interviews terrain. Score minimum P0 = 24.


## 3.1 P0 — Must Have (Score RICE 24+)

**Ces stories sont indispensables au MVP. Sans elles, pas de produit viable.**


### US-001 : Création d'app en langage naturel


### US-002 : Cockpit DSI — Visibilité complète


### US-003 : Connexion directe aux fichiers Excel


### US-004 : Partage d'app en 1 clic


### US-005 : Données dans le tenant M365


### US-006 : App mobile simple comme formulaire papier


## 3.2 P1 — Should Have

Stories importantes pour la complétude du MVP mais non bloquantes pour le lancement.


### US-007 : Politiques d'expiration et quotas

- Story : En tant que DSI, je veux définir des politiques d'expiration automatique et des quotas par équipe pour éviter la prolifération d'apps abandonnées.
- Score RICE : 20 | Effort : 2 sprints | Persona : Philippe Garnier
- Critères : Expiration par défaut configurable (30/60/90j), alerte 7j avant, archivage auto des données, quota par équipe/département.

### US-008 : Cloner et adapter une app existante

- Story : En tant qu'utilisateur du store, je veux cloner une app existante et l'adapter en moins de 2 minutes pour mon contexte.
- Score RICE : 19 | Effort : 1.5 sprints | Persona : Mehdi Benali
- Critères : Clone en 1 clic, wizard de rebinding des sources de données, prévisualisation avant finalisation, historique des forks.

### US-009 : ROI Calculator

- Story : En tant que DG/COO, je veux voir un calculateur ROI comparant le coût Instack vs développement interne pour chaque app.
- Score RICE : 18 | Effort : 1 sprint | Persona : Vincent Durand
- Critères : Coût Instack vs dev interne/freelance, temps économisé, nombre d'utilisateurs, ROI cumulé par mois.

## 3.3 P2 — Nice to Have (US-010 à US-018)

Stories désirables pour l'enrichissement post-MVP :


# 4. Parcours Utilisateur Détaillés

## 4.1 Journey Sandrine SANS Instack

Le parcours typique d'une Ops Manager dans une ETI aujourd'hui. Durée totale : 14+ mois. Taux de succès : <20%.



## 4.2 Journey Sandrine AVEC Instack

Le même besoin, résolu en 10 minutes. Le DSI est informé en temps réel.



## 4.3 Journey Philippe (DSI) — Cockpit

Le DSI découvre et gouverne sans bloquer.


- Onboarding : Philippe connecte Instack via Entra ID. Découverte automatique du tenant. 6 étapes en 10 minutes.
- Dashboard : Voit immédiatement les 47 apps créées ce mois. KPIs : apps actives, créateurs, sources de données, score de santé moyen.
- Gouvernance : Définit la politique d'expiration par défaut (60 jours). Alerte automatique 7 jours avant. Archivage automatique des données.
- Audit : Filtre par source de données. Vérifie qu'aucune app n'accède à des fichiers sensibles sans autorisation. Export du rapport d'audit.
- Quotas : Attribue 20 apps max par équipe. L'équipe Ops Sud a besoin de plus : approuve en 1 clic via workflow.
- Rapport COMEX : Génère le rapport trimestriel : ROI global, adoption par département, comparaison coût Instack vs dev interne.

## 4.4 Journey Clara (Terrain) — Recevoir un lien

L'expérience d'une consommatrice d'app : zéro friction.


- Clara reçoit un message Teams de Sandrine : "Utilise ce lien pour saisir tes visites terrain."
- Tape sur le lien. L'app s'ouvre dans le navigateur mobile. SSO automatique via Entra ID (déjà connectée à Teams).
- Voit un formulaire simple : Client, Date, Observations, Photo, Note /10. Aucune formation nécessaire.
- Prend une photo du rayon, remplit en 20 secondes. GPS détecté automatiquement. Soumet.
- Les données arrivent en temps réel dans le dashboard de Sandrine. Zéro ressaisie.
- Le lendemain, Clara est dans une zone sans réseau. Elle remplit le formulaire. Les données se synchronisent automatiquement quand le réseau revient.

# 5. Design System Principles

## 5.1 Les 5 Principes Fondateurs



## 5.2 Design Tokens

### Couleurs


### Typographie


### Espacement (Grille 4px)

Tous les espacements sont des multiples de 4px. Base unit = 4px.

- --space-xs : 4px — Espacement minimal entre éléments liés
- --space-sm : 8px — Padding interne composants compacts
- --space-md : 16px — Padding standard, gap entre éléments
- --space-lg : 24px — Sections, séparation groupes
- --space-xl : 32px — Marges de page, séparation majeure
- --space-2xl : 48px — Espacement entre sections majeures

### Élévations

- --shadow-sm : 0 1px 2px rgba(0,0,0,0.05) — Cartes au repos
- --shadow-md : 0 4px 6px rgba(0,0,0,0.07) — Cartes survolees, dropdowns
- --shadow-lg : 0 10px 15px rgba(0,0,0,0.1) — Modales, popovers
- --shadow-xl : 0 20px 25px rgba(0,0,0,0.15) — Overlays plein écran

## 5.3 Inspirations Design


# 6. App Store Interne (Phase B)

Le Store Interne est le coeur de la stratégie "App Store Gouverné". Il transforme chaque app créée en asset d'entreprise découvrable et réutilisable.


## 6.1 Architecture Informationnelle

Le store est organisé en 4 sections principales, inspirées des app stores grand public mais adaptées au contexte entreprise :



## 6.2 App Card — Anatomie

Chaque app dans le store est représentée par une carte standardisée contenant :



## 6.3 Niveaux de Partage


## 6.4 Clone / Fork avec Wizard Rebinding

Le clonage est le mécanisme clé de viralisation interne. Il permet de réutiliser le travail d'un collègue sans repartir de zéro.


- Sélection : L'utilisateur clique "Cloner" sur une app du store. Un wizard s'ouvre.
- Rebinding données : Le wizard liste les sources de données de l'app originale et demande de pointer vers les nouvelles sources (autre fichier Excel, autre liste SharePoint).
- Personnalisation : L'utilisateur peut renommer l'app, modifier les champs, ajuster les couleurs. L'IA suggère des adaptations contextuelles.
- Prévisualisation : Aperçu live avec les vraies données du nouveau contexte avant finalisation.
- Publication : L'app clonée est créée. Lien vers l'app originale conservé (historique des forks). Le créateur original est crédité.

# 7. Cockpit DSI

Le cockpit DSI est l'interface de gouvernance qui différencie Instack de tous les outils no-code existants. Il transforme le DSI de bloqueur en facilitateur.


## 7.1 Phase A — Dashboard Read-Only

Disponible dès le MVP (M1-M2). Objectif : donner la visibilité immédiate au DSI pour signer la LOI.


### KPI Cards (Vue d'ensemble)


## 7.2 Phase B — Gouvernance Complète

Déployée en M3-M4. Donne au DSI les commandes pour piloter l'écosystème.


### Politiques d'expiration

- Défaut global : 60 jours (configurable 30/60/90/180/illimité)
- Par équipe : surcharge possible (ex: R&D = 180j, Stagiaires = 30j)
- Alerte : notification automatique 7 jours avant expiration au créateur et admin
- Renouvellement : 1 clic par le créateur ou auto si usage actif dans les 7 derniers jours
- Archivage : données archivées dans SharePoint, structure conservée, restauration possible 90j

### Quotas par équipe

- Allocation : nombre max d'apps actives par équipe (défaut: 20)
- Demande d'extension : workflow approbation 1 clic DSI
- Alertes : notification à 80% et 100% du quota

### Workflow d'approbation

- Niveau 1 : auto-approbation pour apps privées et équipe
- Niveau 2 : approbation DSI pour apps publiques organisation
- Niveau 3 : approbation sécurité si source de données sensible (détection automatique)
- SLA : approbation sous 24h (notification email + Teams + push mobile)

### Audit Trail

- Couverture : toute action est loggée (création, modification, partage, accès données, suppression)
- Rétention : 365 jours minimum
- Export : CSV, JSON, intégration SIEM (Splunk, Sentinel)
- Recherche : filtre par utilisateur, app, date, type d'action

### Inventaire des sources de données

- Vue matricielle : Quelles apps accèdent à quels fichiers/listes
- Classification : sensibilité automatique (confidentiel, interne, public) via labels Microsoft Purview
- Alertes : accès non autorisé à source sensible

### Gestion des utilisateurs

- Provisioning : synchronisation Entra ID automatique
- Rôles : Admin (DSI), Créateur, Consommateur
- Désactivation : suppression accès immédiate si désactivation Entra ID

## 7.3 Onboarding DSI — Wizard 6 étapes



# 8. Roadmap Produit

Roadmap sur 12 mois, découpée en phases de 2 mois. Chaque phase a un objectif clair, des livrables concrets et des KPIs de validation.


## M0 : Validation Terrain (Pré-développement)


## M1-M2 : Phase A — Sandbox + Personal Mode


## M3-M4 : Phase B — App Store + Cockpit Complet


## M5-M6 : V2 — Templates Marketplace + Knowledge Graph


## M7-M12 : Scale — Expansion et Agentic Apps



## Vue Synthétique Timeline




Fin du document — INSTACK MVP Playbook Product & UX

Version 1.0 — Avril 2026 — Confidentiel


| # | Moment Magique | Description | Métrique Proxy |
| --- | --- | --- | --- |
| 1 | App en 90 secondes | L'utilisateur décrit un besoin en langage naturel et obtient une app fonctionnelle en moins de 90 secondes. Premier effet "wow" qui ancre la proposition de valeur. | Time to First App < 90s |
| 2 | Vraies données | L'app se connecte directement au fichier Excel/SharePoint existant. Pas de données fictives, pas d'import : les vraies données du métier apparaissent immédiatement. | % apps connectées source réelle > 80% |
| 3 | Partage 1 clic | Un lien partagé par Teams/email donne accès instant à l'app. Pas d'installation, pas de compte à créer. Le collègue ouvre et utilise. | Share-to-use conversion > 60% |
| 4 | Itération magique | "Ajoute une colonne statut" — l'IA modifie l'app en temps réel. L'utilisateur itère par conversation, comme avec un développeur virtuel instantané. | Iterations/app dans les 24h > 3 |
| 5 | Dashboard auto | L'app génère automatiquement un dashboard de synthèse (graphiques, KPIs, tendances) à partir des données connectées. Zéro configuration. | % apps avec dashboard activé > 40% |
| 6 | Connaissance entreprise | L'IA connaît le contexte métier (nomenclatures, processus, jargon interne) et propose des champs/règles pertinents dès la première génération. | Suggestion acceptance rate > 50% |
| 7 | Store interne | L'Ops publie son app dans le store. Un collègue d'une autre équipe la découvre, la clone, l'adapte. Effet réseau viral intra-entreprise. | Apps publiées dans store > 30% |
| 8 | Expiration sans stress | L'app temporaire expire proprement. Les données sont archivées. Pas de dette technique. Le DSI respire. | % apps expirées sans intervention manuelle > 90% |
| 9 | Cockpit DSI | Le DSI voit en un écran : toutes les apps, qui les utilise, quelles données, quel coût. Visibilité totale sans effort. | DSI login fréquence > 2x/semaine |
| 10 | Mobile natif | L'app fonctionne parfaitement sur smartphone terrain. Scan, photo, GPS intégrés. Le commercial en magasin l'utilise comme son appli perso. | % sessions mobiles > 35% |


| Attribut | Détail |
| --- | --- |
| Rôle | Responsable Opérations Régionales |
| Entreprise | Leroy Merlin — 1 200 employés (périmètre région Sud) |
| Âge / Profil | 38 ans, Bac+5 École de Commerce, 12 ans d'expérience opérationnelle |
| Tech Comfort | Excel avancé (TCD, RECHERCHEV), Power BI basique, zéro code |
| Frustration principale | 14 mois d'attente pour une app simple de suivi d'inventaire. La demande est dans le backlog IT depuis 2024. 82% du backlog IT est non résorbable. |
| Citation verbatim | "J'ai demandé un simple formulaire de suivi il y a 14 mois. IT m'a dit 'priorité Q3'. On est Q2 de l'année suivante." |
| Objectif avec Instack | Créer ses propres apps métier sans dépendre de l'IT. Autonomie complète sur les outils terrain. |
| Fréquence d'usage cible | 3-5 apps créées/mois, usage quotidien |
| Device principal | Laptop bureau + tablette terrain (magasin) |
| Critère de succès | App fonctionnelle en <10 min, connectée à ses fichiers Excel existants |


| Attribut | Détail |
| --- | --- |
| Rôle | Chef de Projet Amélioration Continue |
| Entreprise | Bonduelle — 800 employés (site Picardie) |
| Âge / Profil | 42 ans, Ingénieur agro, Black Belt Lean Six Sigma |
| Tech Comfort | Excel expert (macros VBA), Power Automate, notions Python |
| Frustration principale | Jongle avec 15 fichiers Excel différents pour un seul processus d'amélioration continue. Perd 3h/semaine en copier-coller entre fichiers. Données incohérentes entre versions. |
| Citation verbatim | "Mon process DMAIC tient dans 15 Excel. Quand je mets à jour le fichier 7, le fichier 12 est déjà obsolète." |
| Objectif avec Instack | Consolider ses 15 Excel en apps interconnectées. Dashboards temps réel sur les KPIs Lean. Automatiser les rapports hebdo. |
| Fréquence d'usage cible | 10+ apps, usage quotidien intensif, itérations fréquentes |
| Device principal | Laptop bureau + smartphone terrain (usine) |
| Critère de succès | Éliminer 80% des copier-coller, dashboard KPI en temps réel |


| Attribut | Détail |
| --- | --- |
| Rôle | Directeur des Systèmes d'Information |
| Entreprise | Groupe Fournier (meubles) — 2 000 employés |
| Âge / Profil | 51 ans, Ingénieur INSA, 20 ans expérience IT, ITIL v4 certifié |
| Tech Comfort | Architecture SI, cloud Azure, gouvernance IT |
| Frustration principale | 23 applications SaaS non référencées découvertes lors du dernier audit. Shadow IT galopant. 97% des apps cloud sont inconnues de l'IT en France. Il veut reprendre le contrôle sans bloquer l'innovation. |
| Citation verbatim | "J'ai découvert 23 SaaS non référencés au dernier audit. Je ne veux pas être le flic, mais je dois savoir ce qui tourne." |
| Objectif avec Instack | Visibilité complète sur toutes les apps créées. Politiques d'expiration, quotas, approbation. Conformité RGPD et sécurité données. |
| Fréquence d'usage cible | Cockpit consulté 2-3x/semaine, revue mensuelle apps |
| Device principal | Laptop bureau |
| Critère de succès | 100% des apps visibles, zéro données hors tenant M365 |


| Attribut | Détail |
| --- | --- |
| Rôle | Commerciale Terrain — Secteur Nord-Ouest |
| Entreprise | Descamps (linge de maison) — 400 employés |
| Âge / Profil | 29 ans, BTS Commerce, 5 ans terrain, digital native mais zéro appétence tech |
| Tech Comfort | Smartphone only. Utilise WhatsApp, CRM mobile (basique), zéro Excel |
| Frustration principale | Remplis des formulaires papier en magasin, les ressaisit le soir à l'hôtel dans le CRM. 79% des données terrain ne remontent jamais dans le CRM. 80% de la workforce = 1% du budget logiciel. |
| Citation verbatim | "Le soir à l'hôtel, je retape mes notes de visite dans le CRM. La moitié du temps, j'ai la flemme, et les infos sont perdues." |
| Objectif avec Instack | Recevoir un lien, ouvrir l'app sur son téléphone, remplir en 30 secondes. Zéro formation, zéro installation. |
| Fréquence d'usage cible | 5-10 saisies/jour sur smartphone, jamais de création |
| Device principal | iPhone 14 Pro uniquement |
| Critère de succès | Temps de saisie < formulaire papier, fonctionne hors connexion |


| Attribut | Détail |
| --- | --- |
| Rôle | Directeur Général Délégué (COO) |
| Entreprise | Maisons du Monde Logistique — 600 employés |
| Âge / Profil | 47 ans, HEC, ex-McKinsey, focus performance opérationnelle |
| Tech Comfort | Utilisateur PowerBI et SAP. Comprend la tech sans coder. |
| Frustration principale | Ne voit pas le ROI des outils internes. 2M€/an en développement interne pour des apps utilisées par 12 personnes. Chaque projet IT coûte 150K€ minimum et prend 8 mois. |
| Citation verbatim | "On dépense 2M€/an en dev interne. La moitié des apps sont utilisées par moins de 10 personnes. Je veux un ROI par app." |
| Objectif avec Instack | Dashboard ROI montrant les économies vs développement interne. Business case clair pour chaque euro investi. Scalabilité sans recruter. |
| Fréquence d'usage cible | Revue mensuelle ROI, dashboard trimestriel COMEX |
| Device principal | iPad Pro + laptop |
| Critère de succès | ROI démontrable > 5x en 6 mois, réduction backlog IT > 40% |


| Champ | Détail |
| --- | --- |
| Story | En tant qu'Ops Manager, je veux décrire mon besoin en langage naturel pour obtenir une app métier fonctionnelle en moins de 2 minutes. |
| Persona | Sandrine Morel (Ops Manager) |
| Score RICE | 28 (Reach: 8 | Impact: 9 | Confidence: 85% | Effort: 2 sprints) |
| Validation terrain | 82% du backlog IT des ETI est non résorbable. Délai moyen constaté : 13 mois. 47/47 interviewés confirment le pain point. |
| Critères d'acceptation | 1) Prompt texte libre > app fonctionnelle en <120s  2) App inclut CRUD + vue liste + formulaire  3) Preview live pendant génération  4) 3 archétypes proposés (formulaire, tracker, dashboard) |
| Dépendances | Moteur IA génératif, bibliothèque composants UI, runtime sandbox |


| Champ | Détail |
| --- | --- |
| Story | En tant que DSI, je veux voir toutes les apps créées dans un cockpit unique pour reprendre le contrôle du shadow IT. |
| Persona | Philippe Garnier (DSI) |
| Score RICE | 26 (Reach: 7 | Impact: 9 | Confidence: 90% | Effort: 2 sprints) |
| Validation terrain | 97% des apps cloud sont inconnues de l'IT en France (Gartner 2025). Philippe a découvert 23 SaaS non référencés. |
| Critères d'acceptation | 1) Dashboard temps réel : nb apps, créateurs, utilisateurs, sources de données  2) Filtres par équipe/département/date  3) Score de santé par app  4) Export CSV/PDF |
| Dépendances | Auth SSO/Entra ID, API audit trail, composants dashboard |


| Champ | Détail |
| --- | --- |
| Story | En tant qu'utilisateur, je veux que mon app se connecte directement à mon fichier Excel/SharePoint existant sans import ni copie. |
| Persona | Sandrine Morel, Mehdi Benali |
| Score RICE | 27 (Reach: 9 | Impact: 8 | Confidence: 80% | Effort: 2 sprints) |
| Validation terrain | 90% des spreadsheets en entreprise contiennent des erreurs (EuSpRIG). Le copier-coller est la première source d'erreurs données en ETI. |
| Critères d'acceptation | 1) File picker Microsoft 365 natif  2) Lecture/écriture bidirectionnelle en temps réel  3) Détection auto du schéma (colonnes, types)  4) Sync différentiel (pas de full reload) |
| Dépendances | Microsoft Graph API, OAuth2 consent flow, cache local |


| Champ | Détail |
| --- | --- |
| Story | En tant que créateur d'app, je veux partager mon app en 1 clic via Teams/email pour que mes collègues l'utilisent sans friction. |
| Persona | Sandrine Morel → Clara Rousseau |
| Score RICE | 25 (Reach: 8 | Impact: 8 | Confidence: 85% | Effort: 1.5 sprints) |
| Validation terrain | 79% des données terrain ne remontent jamais dans le CRM (Salesforce State of Sales 2025). Le partage est le moment de viralisation clé. |
| Critères d'acceptation | 1) Génération URL unique en 1 clic  2) Partage via Teams/email/QR code  3) Zéro installation, zéro compte à créer (SSO Entra ID)  4) Permission viewer/editor paramétrable |
| Dépendances | Auth Entra ID, deep linking Teams, génération QR |


| Champ | Détail |
| --- | --- |
| Story | En tant que DSI, je veux garantir que toutes les données restent dans le tenant Microsoft 365 de mon entreprise pour assurer conformité RGPD et souveraineté. |
| Persona | Philippe Garnier (DSI) |
| Score RICE | 24 (Reach: 6 | Impact: 10 | Confidence: 90% | Effort: 2.5 sprints) |
| Validation terrain | 61% des CIOs européens restreignent l'usage du cloud US (Forrester 2025). La souveraineté des données est le critère n°1 d'achat des DSI ETI français. |
| Critères d'acceptation | 1) Zéro stockage données hors tenant client  2) Architecture data-in-place (pointeurs, pas copies)  3) Certification de conformité RGPD  4) Audit trail complète des accès données |
| Dépendances | Architecture SharePoint-native, chiffrement at-rest M365, DLP policies |


| Champ | Détail |
| --- | --- |
| Story | En tant que travailleur terrain, je veux utiliser l'app sur mon smartphone aussi simplement qu'un formulaire papier, sans formation. |
| Persona | Clara Rousseau (Commerciale terrain) |
| Score RICE | 24 (Reach: 9 | Impact: 7 | Confidence: 80% | Effort: 2 sprints) |
| Validation terrain | 80% de la workforce = 1% du budget logiciel (Harvard Business Review). Les deskless workers sont le segment le plus sous-équipé et le plus nombreux. |
| Critères d'acceptation | 1) Responsive mobile-first, touch-optimized  2) Temps de chargement < 2s sur 4G  3) Mode offline avec sync automatique  4) Inputs natifs : caméra, GPS, scan code-barres |
| Dépendances | PWA framework, service worker offline, APIs natives mobile |


| ID | Story | Persona | Score |
| --- | --- | --- | --- |
| US-010 | Templates métier pré-construits (suivi inventaire, planning, rapport visite) | Sandrine | 15 |
| US-011 | Notifications push sur évènements données (seuil stock, deadline) | Mehdi | 14 |
| US-012 | Mode collaboratif temps réel (multi-utilisateurs simultanés) | Mehdi | 14 |
| US-013 | Intégration calendrier Outlook pour planification dans l'app | Sandrine | 13 |
| US-014 | Export PDF/Excel automatisé et planifié (rapports hebdo) | Vincent | 12 |
| US-015 | Versionning d'app avec rollback 1 clic | Philippe | 12 |
| US-016 | App vocale : dicter des données en mode mains libres (terrain) | Clara | 11 |
| US-017 | Workflow d'approbation multi-niveaux (demande → manager → DSI) | Philippe | 11 |
| US-018 | Connecteur Google Sheets pour les équipes non-Microsoft | Mehdi | 10 |


| Étape | Action | Émotion | Durée | Conséquence |
| --- | --- | --- | --- | --- |
| 1. Besoin | Sandrine identifie un besoin : suivi des anomalies d'inventaire dans ses 8 magasins. Actuellement géré sur papier et post-its. | 😠 Frustration | Jour 1 | Perte de données régulière, décisions sans visibilité |
| 2. Demande IT | Crée un ticket JIRA détaillé. Réunion cadrage avec le PM IT. Spécifications demandées en format interne. | 😐 Espoir prudent | Semaine 2-4 | 4h de rédaction specs, 2 réunions de cadrage |
| 3. Attente | Le projet est priorisé Q3... de l'année suivante. Le backlog IT est saturé (82% non résorbable). Pas de ressource disponible. | 😩 Découragement | Mois 3-14 | Aucune visibilité sur la date de livraison |
| 4. Bricolage | Crée un fichier Excel partagé avec macros maison. Demande à ses équipes de le remplir. Devient le "méga-fichier" de la région. | 😓 Résignation | Mois 4-6 | 5 versions concurrentes, formules cassées, 3h/semaine de maintenance |
| 5. Shadow IT | Découvre Airtable/Notion, crée un outil non référencé. Y met des données sensibles (stocks, prix fournisseurs). Ne prévient pas la DSI. | 😌 Soulagement temporaire | Mois 6-10 | Données sensibles hors tenant, zéro gouvernance |
| 6. Conflit DSI | Philippe (DSI) découvre l'outil lors de l'audit. Interdiction immédiate. Sandrine revient au papier. Rancœur mutuelle. | 😡 Conflit | Mois 10+ | Retour case départ, relation DSI/métier dégradée |


| Étape | Action | Émotion | Durée | Bénéfice |
| --- | --- | --- | --- | --- |
| 1. Description | Sandrine ouvre Instack et écrit : "Je veux suivre les anomalies d'inventaire de mes 8 magasins avec date, type, gravité, photo et statut de résolution." | Curiosité | 30 sec | Langage naturel, zéro spécification technique |
| 2. Génération | L'IA génère une app complète en 90 secondes : formulaire de saisie, vue liste avec filtres, dashboard de synthèse. 3 archétypes proposés. | Wow / Émerveillement | 90 sec | App fonctionnelle sans une ligne de code |
| 3. Données | Sandrine connecte son fichier Excel existant "Anomalies_2026.xlsx" sur SharePoint. Les données historiques apparaissent immédiatement dans l'app. | Confirmation | 2 min | Zéro import, zéro copier-coller, données réelles |
| 4. Partage | 1 clic : génère un lien. L'envoie via Teams à ses 8 chefs de magasin. Ils ouvrent sur smartphone, SSO automatique, c'est prêt. | Fierté | 1 min | Viralisation immédiate, zéro friction |
| 5. Itération | "Ajoute un champ 'coût estimé' et un graphique par magasin." L'IA modifie en direct. Sandrine itère 3 fois en 5 minutes. | Puissance | 5 min | Itération instantanée, pas de ticket IT |
| 6. Mobile | Clara (commerciale terrain) reçoit le lien, ouvre sur iPhone, prend une photo d'une anomalie, remplit en 20 secondes. GPS auto-détecté. | Simplicité | 20 sec | Adoption terrain immédiate, données complètes |


| Principe | Description | Implication Concrète |
| --- | --- | --- |
| 1. Opiniâtre par défaut | Instack fait des choix forts pour l'utilisateur. Moins de paramètres, plus de magie. L'IA propose, l'utilisateur ajuste. Configuration en dernier recours. | Formulaire généré : champs pré-remplis, types détectés, mise en page auto. L'utilisateur modifie seulement ce qui ne convient pas. |
| 2. Données d'abord | L'interface se construit autour des données réelles, pas de maquettes vides. Chaque écran montre les vraies données du contexte métier. | Le file picker précède le design d'app. La prévisualisation utilise les données réelles dès le premier rendu. |
| 3. Responsive sans compromis | Chaque app fonctionne parfaitement du smartphone au desktop. Pas de version mobile dégradée. Touch-first sur mobile, dense sur desktop. | Grilles adaptatives, composants touch-optimized (min 44px), navigation contextuelle (bottom bar mobile, sidebar desktop). |
| 4. Accessible WCAG 2.1 AA | Contraste minimum 4.5:1, navigation clavier complète, ARIA labels sur tous les composants interactifs, support screen reader. | Audit automatique à la génération d'app. Alerte si un composant ne passe pas les critères. Score d'accessibilité affiché au créateur. |
| 5. Thémable | Chaque entreprise peut appliquer sa charte graphique (couleurs, logo, fonts). L'app générée ressemble à un outil interne officiel, pas à un outil tiers. | Tokens design centralisés. Le DSI configure la charte 1 fois, toutes les apps héritent automatiquement. |


| Token | Valeur | Usage |
| --- | --- | --- |
| --color-primary | #1B4F72 | Actions principales, liens, headers |
| --color-primary-light | #D4E6F1 | Backgrounds surlignés, badges info |
| --color-secondary | #2E86C1 | Actions secondaires, éléments d'accent |
| --color-success | #27AE60 | Confirmations, statuts OK, validations |
| --color-warning | #E67E22 | Alertes, attention requise, expirations proches |
| --color-danger | #E74C3C | Erreurs, suppressions, statuts critiques |
| --color-neutral-900 | #2C3E50 | Texte principal |
| --color-neutral-500 | #95A5A6 | Texte secondaire, placeholders |
| --color-neutral-100 | #F2F3F4 | Backgrounds, séparateurs |
| --color-surface | #FFFFFF | Surfaces cartes, modales |


| Token | Font | Taille | Poids | Usage |
| --- | --- | --- | --- | --- |
| --type-display | Inter | 32px / 2rem | 700 Bold | Titres de page, héros |
| --type-heading-1 | Inter | 24px / 1.5rem | 600 Semi | Titres de section |
| --type-heading-2 | Inter | 20px / 1.25rem | 600 Semi | Sous-titres |
| --type-body | Inter | 16px / 1rem | 400 Regular | Texte courant, descriptions |
| --type-body-small | Inter | 14px / 0.875rem | 400 Regular | Légendes, aide contextuelle |
| --type-caption | Inter | 12px / 0.75rem | 500 Medium | Labels, badges, métadonnées |
| --type-mono | JetBrains Mono | 14px / 0.875rem | 400 Regular | Code, valeurs techniques |


| Référence | Ce qu'on emprunte | Application Instack |
| --- | --- | --- |
| Linear | Polish extrême. Animations fluides, micro-interactions soignées. Chaque pixel est intentionnel. Sentiment de produit premium. | Transitions entre écrans, animations de génération d'app, feedback haptique sur mobile. L'expérience doit sentir le "craft". |
| Stripe | Clarté informationnelle. Densité élevée sans sensation de surcharge. Hiérarchie visuelle impeccable. | Cockpit DSI, dashboards, tableaux de données. Beaucoup d'information mais toujours lisible et hiérarchisée. |
| Notion | Flexibilité d'usage. L'utilisateur peut réorganiser, customiser, adapter. Block-based thinking. | Approche composants drag-and-drop pour l'itération d'app. L'utilisateur peut réorganiser les blocs générés par l'IA. |


| Section | Logique de tri | Contenu | Algorithme |
| --- | --- | --- | --- |
| Featured | Curation manuelle + IA | Apps mises en avant par le DSI ou l'admin. Apps à fort impact identifiées par l'IA (adoption rapide, satisfaction élevée). | Score = (note moyenne x 0.3) + (nb users x 0.3) + (croissance 7j x 0.2) + (curation admin x 0.2) |
| Trending | Vélocité d'adoption | Apps dont l'adoption accélère cette semaine. Détection automatique des tendances par équipe et global. | Vélocité = (nouveaux users J-7 / users J-14) x log(total users). Seuil trending > 1.5x baseline. |
| New | Date de publication | Apps publiées dans les 14 derniers jours. Vitrine pour les créateurs, incentive à publier. | Chronologique inversé, avec badge "New" pendant 14 jours. Boost si première app du créateur. |
| For You | Recommandation IA | Apps personnalisées selon le profil, l'équipe, les apps déjà utilisées et le rôle. | Collaborative filtering : utilisateurs similaires (même équipe, même rôle) + content-based (archétype, sources de données). Cold start : règle basée sur le département. |


| Élément | Description | Spécification |
| --- | --- | --- |
| Icône | Icône générée automatiquement ou choisie par le créateur | 48x48px, border-radius 12px, couleur dérivée du thème |
| Titre | Nom de l'app (max 40 caractères) | --type-heading-2, truncate avec ellipsis |
| Description | Description courte (max 120 caractères) | --type-body-small, 2 lignes max, truncate |
| Avatar créateur | Photo + nom du créateur | 24x24px avatar circulaire + nom --type-caption |
| Nb utilisateurs | Nombre d'utilisateurs actifs cette semaine | Icône users + compteur, --type-caption |
| Note | Note moyenne (1-5 étoiles) | 5 étoiles + valeur numérique, min 3 votes pour afficher |
| Badge archétype | Formulaire / Tracker / Dashboard / Custom | Chip coloré selon le type, --type-caption |
| Indicateur expiration | Temps restant avant expiration | Barre de progression + j-X, orange si <7j, rouge si <3j |


| Niveau | Visibilité | Cas d'usage | Gouvernance |
| --- | --- | --- | --- |
| Public (Organisation) | Toute l'organisation peut voir et utiliser l'app dans le store | Apps utilitaires transverses : réservation salle, note de frais, signalement | Validation automatique si score qualité > seuil. Sinon, approbation DSI. |
| Équipe | Visible uniquement par les membres de l'équipe/département | Apps métier spécifiques : suivi production, planning équipe, KPIs département | Auto-approbation. DSI informé via cockpit. |
| Privé | Visible uniquement par le créateur et les personnes explicitement invitées | Prototypes en cours, apps personnelles, tests | Zéro approbation. Invisible dans le store. Lien direct uniquement. |


| KPI | Définition | Visualisation | Seuil d'alerte |
| --- | --- | --- | --- |
| Apps actives | Nombre d'apps avec au moins 1 utilisateur actif dans les 7 derniers jours | Big number + sparkline tendance 30j | < 10 apps (sous-adoption) ou > 200 apps (prolifération) |
| Créateurs actifs | Nombre d'employés ayant créé ou modifié une app dans les 30 derniers jours | Big number + % de l'effectif total | < 5% effectif (sous-adoption) ou concentration > 50% sur 3 personnes |
| Sources connectées | Nombre de fichiers/listes SharePoint/Excel distincts utilisés comme source par les apps | Big number + pie chart par type (Excel, SharePoint, Lists) | Source sensible non autorisée détectée |
| Score santé moyen | Moyenne pondérée : adoption (30%) + fraicheur données (30%) + satisfaction (20%) + conformité (20%) | Jauge 0-100 + code couleur (vert >70, orange 40-70, rouge <40) | Score global < 50 |


| Étape | Action | Durée | Détail |
| --- | --- | --- | --- |
| 1 | Connexion Entra ID | 2 min | OAuth2 consent admin. Découverte automatique du tenant, groupes, utilisateurs. |
| 2 | Configuration branding | 2 min | Upload logo, sélection couleurs charte, choix thème (clair/sombre/auto). Prévisualisation live. |
| 3 | Politique d'expiration par défaut | 1 min | Choix 30/60/90/180j/illimité. Recommandation IA basée sur le secteur d'activité. |
| 4 | Quotas par département | 2 min | Import auto des départements Entra ID. Allocation par défaut (20 apps). Ajustement possible. |
| 5 | Invitation des premiers créateurs | 2 min | Sélection des 5-10 premiers Ops Managers. Email d'invitation personnalisé avec vidéo d'onboarding. |
| 6 | Lancement pilote | 1 min | Activation du tenant. Dashboard DSI disponible immédiatement. Rappel revue J+7 planifiée. |


| Attribut | Détail |
| --- | --- |
| Durée | 4-6 semaines |
| Objectif | Valider le problème et l'appétence avant d'écrire une ligne de code |
| Livrables | 50 interviews clients ETI (Ops + DSI + DG), 30 LOI (Letters of Intent) signées, rapport synthèse personas validés |
| Méthode | Interviews semi-structurées 45min, démo Figma prototype cliquable, LOI avec pricing indicatif |
| KPI Go/No-Go | 30+ LOI signées = GO. <15 LOI = PIVOT. 15-30 = itérer le positionnement. |
| Équipe | CPO + 1 UX Researcher + 1 Sales |


| Attribut | Détail |
| --- | --- |
| Durée | 8 semaines (4 sprints de 2 semaines) |
| Objectif | Premier produit utilisable : un utilisateur peut créer et utiliser une app personnelle |
| Livrables clés | Moteur IA génératif v1 (3 archétypes : formulaire, tracker, dashboard), Connexion Excel/SharePoint via Graph API, 6 composants UI de base (TextInput, Select, Table, Chart, Form, Card), Auth Entra ID SSO, Cockpit DSI read-only (Phase A), App mobile responsive PWA |
| KPI cibles | Time to First App < 120s, 20 beta testers actifs, NPS > 40, Crash rate < 1% |
| Équipe | CPO + 2 Frontend + 2 Backend + 1 IA/ML + 1 Designer + 1 QA |


| Attribut | Détail |
| --- | --- |
| Durée | 8 semaines (4 sprints) |
| Objectif | Multi-utilisateurs et gouvernance. L'app devient un produit d'entreprise. |
| Livrables clés | App Store Interne (Featured, Trending, New, For You), Partage 1 clic + 3 niveaux de visibilité, Clone/Fork avec wizard rebinding, Cockpit DSI complet (politiques, quotas, workflows, audit), Module billing (Stripe) avec 3 plans, Onboarding DSI wizard 6 étapes |
| KPI cibles | 50 apps actives/semaine (North Star), 5 entreprises payantes, Share-to-use conversion > 50%, DSI login > 2x/semaine |
| Équipe | +1 Backend, +1 DevOps/SRE |


| Attribut | Détail |
| --- | --- |
| Durée | 8 semaines (4 sprints) |
| Objectif | Accélérer la création et enrichir l'intelligence contextuelle |
| Livrables clés | Marketplace de templates métier (20 templates vérifiés par secteur : retail, industrie, logistique), Knowledge Graph Neo4j (modélisation du contexte entreprise : nomenclatures, processus, jargon), Itération conversationnelle avancée (modifications complexes multi-composants), Notifications push sur évènements données, Mode offline PWA complet |
| KPI cibles | 200 apps actives/semaine, 60% apps créées à partir d'un template, ARR > 100K€ |
| Équipe | +1 IA/ML (Knowledge Graph), +1 Content (templates) |


| Attribut | Détail |
| --- | --- |
| Durée | 6 mois |
| Objectif | Passage à l'échelle européenne et évolution vers les apps autonomes |
| Livrables clés | Connecteur Google Workspace (Sheets, Drive, Calendar), Apps agentiques (l'app exécute des actions automatisées : relances, alertes, rapports planifiés), Expansion Benelux (localisation NL/DE, compliance locale), API publique pour intégrateurs, Marketplace créateurs tiers (rev share 70/30) |
| KPI cibles | 5 000 apps actives/semaine, ARR > 1M€, 50+ entreprises clientes, présence 3 pays |
| Équipe | Scale team : 20-25 personnes |


| Phase | Période | Focus | North Star Target |
| --- | --- | --- | --- |
| M0 | Semaines 1-6 | Validation terrain : 50 interviews, 30 LOI | 30 LOI signées |
| Phase A | M1-M2 | Sandbox + personal mode + cockpit read-only | 20 beta testers actifs |
| Phase B | M3-M4 | App Store + cockpit complet + billing | 50 apps actives/semaine |
| V2 | M5-M6 | Templates marketplace + Knowledge Graph Neo4j | 200 apps actives/semaine |
| Scale | M7-M12 | Google Workspace + apps agentiques + Benelux | 5 000 apps actives/semaine |

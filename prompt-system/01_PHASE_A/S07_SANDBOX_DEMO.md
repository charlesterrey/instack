# S07 — SANDBOX DEMO — Environnement de démonstration

> **Sprint**: 07 | **Semaines**: W13-W14
> **Leads**: @FORGE (Backend) + @SPECTRUM (UX)
> **Support**: @PRISM (Frontend) + @NEURON (Pipeline quality)
> **Phase**: A — "Prouver la Magie"

---

## OBJECTIF

Créer l'environnement Sandbox qui permet à un utilisateur de tester instack SANS connecter son compte Microsoft. Données fictives réalistes, pipeline IA fonctionnel, et le wizard complet de création d'app. C'est le moment "Aha!" du produit — un utilisateur crée sa première app en <90 secondes.

**Ce sprint est critique pour le PLG : si le Sandbox ne convainc pas en 90 secondes, le produit échoue.**

---

## DÉPENDANCES

| Direction | Tâche | Agent |
|-----------|-------|-------|
| **Bloqué par** | S04 (Pipeline complet) | @NEURON |
| **Bloqué par** | S05 (6 composants) | @PRISM |
| **Bloqué par** | S06 (Sync engine — pour le pattern data) | @CONDUIT |
| **Bloque** | S08 (Integration E2E) | @BLUEPRINT |
| **Bloque** | S14 (Onboarding — réutilise le Sandbox flow) | @WILDFIRE |

---

## TÂCHES DÉTAILLÉES

### TÂCHE 7.1 — Données de démonstration réalistes
**Assigné à**: @FORGE + @SPECTRUM
**Complexité**: L
**Dépendance**: S03 (schema inference format)

```
CHECKLIST :
□ Créer 5 jeux de données fictifs correspondant aux 5 personas :
    1. "Suivi Interventions Terrain" (Sandrine — Ops Manager)
       - 15 colonnes : Technicien, Site, Date, Statut, Priorité, Durée, Photos, Notes...
       - 200 lignes de données réalistes (noms FR, adresses FR, dates récentes)
       - Mix de statuts : En cours, Terminé, Planifié, Annulé
    2. "Dashboard Projet Amélioration Continue" (Mehdi — Chef de Projet)
       - 12 colonnes : Projet, Responsable, Budget, Avancement%, Échéance, Département...
       - 50 lignes avec des projets réalistes (industrie agroalimentaire)
       - KPIs calculables : budget total, avancement moyen, retards
    3. "Visites Clients" (Clara — Commerciale)
       - 10 colonnes : Client, Date, Contact, Produits présentés, Montant, Suite à donner...
       - 80 lignes de visites (retail textile)
    4. "Audit Magasins" (Sandrine — variante checklist)
       - 20 colonnes : Magasin, Date audit, Propreté, Signalétique, Stock, Conforme (oui/non)...
       - 100 lignes
    5. "Suivi Budget Départements" (Vincent — DG)
       - 8 colonnes : Département, Budget alloué, Dépenses, Reste, Trimestre...
       - 30 lignes avec 4 trimestres × 7-8 départements
□ Format : fichiers JSON dans tests/fixtures/demo-data/
□ Chaque jeu de données a un fichier Excel correspondant dans tests/fixtures/demo-excel/
□ Les données doivent être cohérentes et raconter une histoire :
    - Des tendances visibles dans les graphiques
    - Des anomalies repérables (un projet en retard, un technicien surchargé)
    - Des distributions réalistes (pas de valeurs uniformes)
```

---

### TÂCHE 7.2 — Sandbox Mode Backend
**Assigné à**: @FORGE
**Complexité**: L
**Dépendance**: 7.1, S02 (auth)

```
CHECKLIST :
□ Créer un mode "sandbox" dans l'auth :
    - POST /api/auth/sandbox → Créer une session sandbox
      * Pas de Microsoft OAuth requis
      * Crée un tenant temporaire "sandbox_{random_id}"
      * Crée un user "Utilisateur Démo"
      * JWT avec flag sandbox: true
      * Expiration : 24 heures (puis cleanup automatique)
    - Le tenant sandbox a les mêmes limites que le plan Free
    - Les apps sandbox sont marquées avec un badge "Démo"
□ Créer la data source "demo_data" :
    - source_type = 'demo_data'
    - Pas d'appel Graph API — les données viennent des fixtures
    - L'utilisateur choisit un des 5 jeux de données
    - Le sync est instantané (pas de polling)
□ Limites sandbox :
    - Maximum 5 apps
    - Pas de partage (pas de vrai tenant)
    - Pas d'export
    - Banner "Mode démo — Connectez votre compte Microsoft pour continuer"
□ Cleanup automatique :
    - Cron qui supprime les tenants sandbox expirés (>24h)
    - Supprimer les apps, composants, data sources associés
□ Tests : création session sandbox, limites, cleanup
```

---

### TÂCHE 7.3 — Wizard de Création d'App (UX centrale)
**Assigné à**: @SPECTRUM (UX) + @PRISM (Implementation)
**Complexité**: XL
**Dépendance**: S04 (pipeline), S05 (composants), 7.2 (sandbox)

```
CHECKLIST :
□ Créer packages/web/src/pages/CreateApp/CreateApp.tsx — Le wizard en 4 étapes :

    ÉTAPE 1 : "Décrivez votre besoin" (5 secondes)
    □ Grande zone de texte au centre (placeholder inspirant)
    □ Suggestions rapides cliquables :
      - "Suivi des interventions terrain"
      - "Dashboard de projet"
      - "Formulaire de visite client"
      - "Audit magasin"
      - "Suivi budgétaire"
    □ En sandbox : les suggestions correspondent aux 5 jeux de données
    □ Bouton : "Créer mon app →"
    □ Design : minimaliste, Linear-style, focus sur le texte

    ÉTAPE 2 : "Choisissez vos données" (15 secondes)
    □ En mode réel : File Picker (OneDrive/SharePoint) de S06
    □ En mode sandbox : Sélection d'un des 5 jeux de données démo
    □ Preview des premières 5 lignes + colonnes détectées
    □ Indication du type inféré par colonne (badge)
    □ Bouton : "Utiliser ces données →"

    ÉTAPE 3 : "Votre app est prête !" (60 secondes — pipeline tourne)
    □ Animation de loading avec progress :
      - "Classification de votre besoin..." (Stage 1)
      - "Analyse de vos données..." (Stage 2)
      - "Création de votre app..." (Stage 3)
      - "Vérification finale..." (Stage 4)
    □ Chaque étape s'anime quand elle commence/finit
    □ Si erreur → message explicite + bouton "Réessayer"
    □ Quand terminé : preview de l'app (AppRenderer)

    ÉTAPE 4 : "Personnalisez" (optionnel, 15 secondes)
    □ Nom de l'app (pré-rempli par l'IA)
    □ Description (pré-remplie)
    □ Ajuster la visibilité (privé/équipe/public)
    □ Bouton : "Publier" ou "Sauvegarder en brouillon"

□ Responsive : le wizard fonctionne sur mobile (étapes en plein écran)
□ Animation entre les étapes (slide ou fade, smooth)
□ Bouton retour pour revenir à l'étape précédente
□ Confetti ou animation de succès à la fin (discret, pas infantile)
□ Tests : flow complet sandbox, chaque étape isolée, erreur pipeline
```

---

### TÂCHE 7.4 — Page Dashboard Principal
**Assigné à**: @PRISM
**Complexité**: L
**Dépendance**: S02 (CRUD apps), 7.3

```
CHECKLIST :
□ Créer packages/web/src/pages/Dashboard/Dashboard.tsx :
    - Header : "Bonjour {prénom}" + bouton "Créer une app"
    - Section "Mes apps" : grille de cartes (AppCard)
      * Chaque carte : nom, archétype (icône), nb composants, dernière modification
      * Clic → ouvre l'app (AppRenderer)
      * Menu ··· → Modifier, Partager, Archiver
    - Section "Apps partagées avec moi" (future — placeholder)
    - Empty state (premier utilisateur) :
      * Illustration + "Créez votre première app en 90 secondes"
      * CTA vers le wizard
    - En sandbox : banner en haut "Mode démo — Connectez votre compte"
□ Créer packages/web/src/components/AppCard/AppCard.tsx :
    - Card Untitled UI avec miniature de l'app
    - Badge archétype (couleur par type)
    - Badge statut (draft/active/archived)
    - Hover : effet d'élévation subtil
□ Tests : dashboard vide, avec apps, sandbox banner
```

---

### TÂCHE 7.5 — Page App Viewer
**Assigné à**: @PRISM
**Complexité**: M
**Dépendance**: S04 (AppRenderer), S06 (données)

```
CHECKLIST :
□ Créer packages/web/src/pages/AppView/AppView.tsx :
    - Header : nom de l'app + breadcrumb
    - Toolbar : Sync status, Edit (future), Share, Export (future)
    - Body : AppRenderer avec les données synchées
    - Mode fullscreen disponible
    - Responsive
□ Créer le routing : /apps/:id → AppView
□ Loading state pendant le fetch des données
□ Error state si l'app n'existe pas ou pas de données
```

---

### TÂCHE 7.6 — Quality Gates Pipeline (S07 = checkpoint qualité)
**Assigné à**: @NEURON
**Complexité**: M
**Dépendance**: S04

```
CHECKLIST :
□ Créer un test suite "quality gates" :
    - 20 prompts réalistes × 5 jeux de données = 100 combinaisons
    - Pour chaque combinaison :
      * Pipeline retourne sans erreur ?
      * JSON valide ?
      * AppRenderer peut rendre sans crash ?
      * Latence totale < 5s ?
    - Objectif : > 85% de succès sur les 100 combinaisons
    - Logger les échecs pour amélioration itérative des prompts
□ Affiner les prompts de Stage 1 et Stage 3 basé sur les résultats
□ Documenter les cas limites qui ne fonctionnent pas encore
```

---

## LIVRABLES S07

| Livrable | Chemin | Owner |
|----------|--------|-------|
| Données démo (5 jeux) | `tests/fixtures/demo-data/` | @FORGE + @SPECTRUM |
| Sandbox Mode | `packages/api/src/services/sandbox.service.ts` | @FORGE |
| Wizard Création | `packages/web/src/pages/CreateApp/` | @PRISM + @SPECTRUM |
| Dashboard | `packages/web/src/pages/Dashboard/` | @PRISM |
| App Viewer | `packages/web/src/pages/AppView/` | @PRISM |
| Quality Gates | `packages/ai-pipeline/tests/quality-gates.test.ts` | @NEURON |

---

## DEFINITION OF DONE S07

- [ ] Sandbox : un utilisateur crée une app en <90s SANS compte Microsoft
- [ ] 5 jeux de données réalistes (FR, cohérents, tendances visibles)
- [ ] Wizard 4 étapes fluide avec animations
- [ ] Dashboard avec liste des apps + empty state
- [ ] App Viewer rend correctement les apps générées
- [ ] Quality gates : > 85% succès sur 100 combinaisons prompt×data
- [ ] Pipeline latence totale < 5s P95
- [ ] CI passe en vert

---

## HANDOFF → S08

```
## HANDOFF: @FORGE + @SPECTRUM → @BLUEPRINT + @WATCHDOG
**Sprint**: S08
**Statut**: READY
**Livrables prêts**:
  - Sandbox fonctionnel end-to-end
  - Pipeline avec quality gates > 85%
  - Frontend complet (Dashboard, Wizard, AppView)
**Prochaine étape**: @BLUEPRINT orchestre l'intégration E2E de tous les modules
**Prochaine étape**: @WATCHDOG met en place le monitoring (PostHog + Sentry)
```

# S11 — APP STORE INTERNE — Browse, Clone, Share

> **Sprint**: 11 | **Semaines**: W21-W22
> **Leads**: @PRISM (Frontend) + @PULSE (PLG Architecture)
> **Support**: @FORGE (API) + @SPECTRUM (UX) + @WILDFIRE (Viral mechanics)
> **Phase**: B — "Convertir et Gouverner"

---

## OBJECTIF

Créer l'App Store interne : un catalogue où les utilisateurs parcourent, découvrent, clonent et partagent des apps au sein de leur entreprise. C'est le moteur viral d'instack — chaque app partagée est un vecteur d'acquisition de nouveaux creators.

---

## DÉPENDANCES

| Direction | Tâche | Agent |
|-----------|-------|-------|
| **Bloqué par** | S05+S10 (12 composants) | @PRISM |
| **Bloqué par** | S07 (Création d'apps fonctionnelle) | @FORGE |
| **Bloque** | S12 (Cockpit DSI — gouvernance des apps publiées) | @DIPLOMAT |
| **Bloque** | S14 (Onboarding — recommandations d'apps) | @WILDFIRE |

---

## TÂCHES DÉTAILLÉES

### TÂCHE 11.1 — API App Store
**Assigné à**: @FORGE
**Complexité**: L

```
CHECKLIST :
□ GET /api/store/apps — Catalogue d'apps publiques du tenant
    - Filtres : ?category=xxx, ?archetype=xxx, ?search=xxx
    - Tri : ?sort=popular|recent|trending
    - Pagination : ?page=1&limit=20
    - Retourne : apps avec metadata (creator, nb_users, nb_clones, rating)
□ GET /api/store/apps/:id — Détail d'une app du store
    - Description, screenshots (auto-générées), creator info
    - Stats : nb utilisateurs, nb clones, date création
    - Composants utilisés, archétype
□ POST /api/store/apps/:id/clone — Cloner une app
    - Crée une copie de l'app dans le workspace de l'utilisateur
    - Le clone est indépendant (modifications n'affectent pas l'original)
    - L'utilisateur doit connecter ses propres données
    - Audit log : 'app.cloned'
□ POST /api/store/apps/:id/rate — Noter une app (1-5)
    - Un seul vote par utilisateur par app
□ GET /api/store/categories — Liste des catégories
    - 12 catégories : Opérations, RH, Finance, Commercial, Projet, Qualité,
      Logistique, Maintenance, Sécurité, Communication, IT, Autre
□ GET /api/store/trending — Apps tendance (les plus clonées cette semaine)
□ GET /api/store/recommended — Recommandations basées sur le contexte
    - Basé sur l'archétype des apps existantes de l'utilisateur
    - Basé sur le département/rôle
□ Tests : catalogue, clone, rating, filtres, trending
```

### TÂCHE 11.2 — Frontend App Store
**Assigné à**: @PRISM + @SPECTRUM
**Complexité**: XL

```
CHECKLIST :
□ Créer packages/web/src/pages/Store/Store.tsx :
    - Layout inspiré App Store / Linear :
      * Header : "App Store" + barre de recherche
      * Section "Mis en avant" : 3 apps hero cards (carrousel)
      * Section "Tendances" : scroll horizontal de cards
      * Section "Nouveautés" : grille de cards
      * Section "Pour vous" : recommandations personnalisées
      * Sidebar : catégories (12) + filtres archétype
    - Responsive : stack complet sur mobile
□ Créer packages/web/src/components/StoreAppCard/StoreAppCard.tsx :
    - Preview miniature de l'app (screenshot auto-générée)
    - Nom, description (tronquée), archétype (badge)
    - Creator (avatar + nom)
    - Stats : nb users, rating (étoiles)
    - Bouton "Cloner" prominent
    - Hover : effet d'élévation + preview expand
□ Créer packages/web/src/pages/Store/StoreAppDetail.tsx :
    - Page détaillée d'une app du store
    - Screenshots (3 tailles : mobile, tablet, desktop)
    - Description complète
    - Stats détaillées
    - Section "Apps similaires"
    - Bouton "Cloner cette app" (CTA principal)
    - Bouton "Voir la démo" (preview read-only)
□ Créer le Clone Wizard :
    - Étape 1 : "Cloner {nom de l'app}"
    - Étape 2 : "Connectez vos données" (File Picker)
    - Étape 3 : "Votre app est prête" (mapping automatique des colonnes)
    - Si les colonnes du clone ne matchent pas → mapping assistant
□ Screenshot auto-generation :
    - Prendre un screenshot de l'AppRenderer côté serveur (Puppeteer ou html2canvas)
    - 3 tailles : mobile (375px), tablet (768px), desktop (1280px)
    - Cacher au moment de la publication de l'app
□ Tests : store browse, search, clone, rating, responsive
```

### TÂCHE 11.3 — Sharing & Visibility System
**Assigné à**: @FORGE + @PULSE
**Complexité**: L

```
CHECKLIST :
□ 3 niveaux de visibilité :
    - Private : visible uniquement par le creator
    - Team : visible par les membres du même tenant
    - Public : visible dans l'App Store du tenant
□ Implémenter le partage par lien :
    - POST /api/apps/:id/share-link → génère un lien unique
    - Le lien fonctionne pour les utilisateurs du même tenant
    - Expiration configurable (24h, 7j, 30j, permanent)
    - Analytics : qui a ouvert le lien
□ Implémenter les notifications de partage :
    - Quand une app est partagée avec "team" → notification in-app
    - Badge sur l'App Store "X nouvelles apps"
□ Viral mechanics (@PULSE) :
    - "Créé avec instack" badge discret sur les apps partagées
    - "X personnes utilisent cette app" social proof
    - "Vos collègues ont aussi créé..." suggestions
□ Events PostHog :
    - app.shared, app.cloned, store.visited, store.searched
    - share_link.created, share_link.opened
□ Tests : visibilité, share link, notifications
```

---

## DEFINITION OF DONE S11

- [ ] App Store navigable avec catégories et recherche
- [ ] Clone fonctionnel (app copiée + mapping données)
- [ ] Rating (1-5 étoiles)
- [ ] 3 niveaux de visibilité (private/team/public)
- [ ] Share link avec expiration
- [ ] Screenshots auto-générées
- [ ] Recommandations basées sur le contexte utilisateur
- [ ] Viral mechanics en place (badges, social proof)
- [ ] CI passe en vert

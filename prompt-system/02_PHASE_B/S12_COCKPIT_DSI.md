# S12 — COCKPIT DSI — Governance Dashboard

> **Sprint**: 12 | **Semaines**: W23-W24
> **Leads**: @PRISM (Frontend) + @DIPLOMAT (Enterprise Sales Specs)
> **Support**: @LENS (BI Data Layer) + @PHANTOM (Security dashboard) + @CORTEX (Context Graph)
> **Phase**: B — "Convertir et Gouverner"

---

## OBJECTIF

Créer le Cockpit DSI : un tableau de bord de gouvernance permettant au DSI (Philippe Garnier) de contrôler toutes les apps de son entreprise sans bloquer les créateurs. Apps créées, données accédées, utilisateurs actifs, policies d'expiration, quotas. C'est le feature qui convertit le bottom-up (Sandrine crée des apps) en top-down (Philippe achète le plan Enterprise).

---

## DÉPENDANCES

| Direction | Tâche | Agent |
|-----------|-------|-------|
| **Bloqué par** | S08 (Audit log, analytics) | @CATALYST |
| **Bloqué par** | S11 (App Store — apps à gouverner) | @PRISM |
| **Bloque** | S13 (Billing — upgrade trigger depuis le Cockpit) | @IRONCLAD |
| **Bloque** | S16 (Launch — DSI Early Access Program) | @DIPLOMAT |

---

## TÂCHES DÉTAILLÉES

### TÂCHE 12.1 — API Cockpit DSI (Admin endpoints)
**Assigné à**: @FORGE + @LENS
**Complexité**: XL

```
CHECKLIST :
□ Tous les endpoints Cockpit nécessitent role = 'admin'
□ GET /api/admin/dashboard — KPIs agrégés :
    - Total apps (par statut, par archétype)
    - Total users (par rôle, par activité)
    - Total data sources (par type, par statut sync)
    - Apps créées cette semaine / ce mois
    - Storage utilisé (estimation via Graph API)
    - Pipeline usage (nb générations, coût total)
□ GET /api/admin/apps — Toutes les apps du tenant (admin voit tout)
    - Inclure : creator, nb_users, last_accessed, data_sources
    - Filtres : status, archetype, creator, date_range
    - Tri : last_accessed, created_at, nb_users
□ PATCH /api/admin/apps/:id — Actions admin sur une app :
    - Forcer l'archivage
    - Changer la visibilité
    - Définir une date d'expiration
□ GET /api/admin/users — Tous les utilisateurs du tenant
    - Inclure : nb_apps_created, nb_apps_used, last_active, role
    - Filtres : role, activity_status (active, inactive_30d, never)
□ PATCH /api/admin/users/:id — Actions admin sur un user :
    - Changer le rôle (creator → viewer, viewer → creator)
    - Désactiver le compte
□ GET /api/admin/data-sources — Toutes les sources de données
    - Inclure : type, sync_status, nb_apps_using, last_synced
□ GET /api/admin/audit — Audit log filtrable
    - Filtres : action, user_id, resource_type, date_range
    - Pagination
    - Export CSV (optionnel)
□ GET /api/admin/policies — Policies de gouvernance
□ PUT /api/admin/policies — Mettre à jour les policies :
    - max_apps_per_creator: number
    - default_expiration_days: number | null
    - auto_archive_inactive_days: number | null
    - require_approval_for_public: boolean
    - allowed_data_sources: ('excel'|'sharepoint')[]
□ Tests : chaque endpoint, vérifier que non-admin reçoit 403
```

### TÂCHE 12.2 — Frontend Cockpit DSI
**Assigné à**: @PRISM + @SPECTRUM
**Complexité**: XL

```
CHECKLIST :
□ Créer packages/web/src/pages/Admin/AdminDashboard.tsx :
    - Layout : sidebar admin + contenu principal
    - Navigation sidebar :
      * Vue d'ensemble (KPIs)
      * Apps
      * Utilisateurs
      * Sources de données
      * Audit Log
      * Politiques
    - Accès : uniquement pour role = 'admin'
    - Route : /admin/*
□ Vue d'ensemble — KPIs :
    - 6 KPICards en grille (3×2) :
      * Total apps actives
      * Apps créées cette semaine (trend)
      * Utilisateurs actifs (30j)
      * Sources de données connectées
      * Taux de succès pipeline
      * Coût IA du mois
    - Graphiques :
      * BarChart : apps créées par semaine (12 dernières semaines)
      * PieChart : répartition par archétype
      * LineChart : utilisateurs actifs par jour (30 derniers jours)
□ Vue Apps :
    - DataTable avec toutes les apps
    - Colonnes : Nom, Archétype, Créateur, Utilisateurs, Dernière activité, Statut
    - Actions : Archiver, Changer visibilité, Définir expiration
    - Filtres : statut, archétype, créateur
    - Clic → DetailView de l'app
□ Vue Utilisateurs :
    - DataTable avec tous les users
    - Colonnes : Nom, Email, Rôle, Apps créées, Dernière activité
    - Actions : Changer rôle, Désactiver
    - Badge activité (Actif, Inactif, Jamais connecté)
□ Vue Sources de données :
    - DataTable des data sources
    - Colonnes : Nom fichier, Type, Apps liées, Dernière sync, Statut
    - Indicateur visuel sync status (vert/jaune/rouge)
□ Vue Audit Log :
    - Timeline des événements
    - Filtres : action, user, date
    - Export CSV
□ Vue Politiques :
    - Formulaire de configuration des policies
    - Toggle pour chaque policy
    - Sauvegarde instantanée
    - Preview de l'impact ("X apps seront archivées automatiquement")
□ Tests : navigation admin, KPIs, CRUD actions, policies
```

### TÂCHE 12.3 — SSO Enterprise (Admin Consent + SAML/OIDC) (Dashboard BE-008 + SEC-003)
**Assigné à**: @PHANTOM + @FORGE
**Complexité**: L

```
CHECKLIST :
□ Azure AD Admin Consent Flow :
    - Créer /api/auth/admin-consent — endpoint pour le flux admin consent
    - Permissions demandées : User.Read.All, Group.Read.All (lecture org)
    - Après consent → provisionner automatiquement les users du tenant Azure AD
    - Stocker l'état du consent dans tenants (admin_consent_granted: boolean)
□ SSO SAML 2.0 (optionnel Enterprise) :
    - Endpoint /api/auth/saml/metadata — Expose les métadonnées SP
    - Endpoint /api/auth/saml/callback — Réception assertion SAML
    - Mapping attributs : email, displayName, department → user fields
    - Librairie : saml2-js ou passport-saml (adapter pour Workers)
□ SSO OIDC (alternative/complément) :
    - Support OpenID Connect via Microsoft Entra ID
    - Configuration par tenant : issuer, client_id, redirect_uri
    - Stocké dans tenants.settings JSONB
□ User Provisioning automatique :
    - Quand SSO activé → sync users depuis Azure AD
    - Mapping rôles : Azure AD groups → instack roles (admin, creator, viewer)
    - Désactivation auto quand user supprimé de l'AD
□ Config dans le Cockpit DSI (vue Politiques) :
    - Toggle "Activer SSO" → ouvre le wizard de configuration
    - Afficher le statut SSO (actif, en erreur, non configuré)
    - Test de connexion SSO depuis le Cockpit
□ Tests : admin consent flow, SAML assertion, OIDC flow, provisioning, sandbox E2E
```

### TÂCHE 12.4 — Context Graph JSONB (Recommandations DSI)
**Assigné à**: @CORTEX
**Complexité**: L

```
CHECKLIST :
□ Implémenter la mise à jour du context_graph :
    - Quand une app est créée → nœuds User→App, App→DataSource, App→Columns
    - Quand une app est partagée → nœud User→App (viewer)
    - Quand une app est clonée → nœud App→App (clone_of)
    - Quand des données sont synchées → nœud DataSource→File→Columns
    - Weight decay : les edges vieux de >30j perdent du poids
□ Requêtes context graph pour le Cockpit :
    - "Quels fichiers Excel sont les plus utilisés ?" (agrégation edges)
    - "Quels utilisateurs sont les plus actifs creators ?" (count edges)
    - "Quelles colonnes sont les plus référencées ?" (count bindings)
□ Utiliser ces données pour les sections "Insights" du Cockpit DSI
□ Tests : nœuds/edges CRUD, weight decay, requêtes agrégées
```

---

## DEFINITION OF DONE S12

- [ ] Cockpit DSI avec 6 vues (Overview, Apps, Users, Data, Audit, Policies)
- [ ] KPIs temps réel sur la vue d'ensemble
- [ ] Actions admin : archiver, changer rôle, policies
- [ ] Audit log filtrable et paginé
- [ ] Policies de gouvernance (expiration, quotas, approbation)
- [ ] Accès restreint aux admins (403 pour non-admins)
- [ ] SSO : Admin Consent flow Azure AD fonctionnel
- [ ] SSO : SAML 2.0 et/ou OIDC configurables par tenant
- [ ] User provisioning automatique depuis Azure AD
- [ ] Context graph mis à jour automatiquement
- [ ] CI passe en vert

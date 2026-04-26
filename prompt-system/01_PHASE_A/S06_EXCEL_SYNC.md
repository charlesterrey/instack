# S06 — EXCEL SYNC READ-ONLY — Microsoft Graph API

> **Sprint**: 06 | **Semaines**: W11-W12
> **Leads**: @CONDUIT (Integration M365) + @CORTEX (Data Architecture)
> **Support**: @FORGE (API endpoints) + @PHANTOM (Token security)
> **Phase**: A — "Prouver la Magie"

---

## OBJECTIF

Implémenter la synchronisation read-only des données Excel et SharePoint Lists via Microsoft Graph API. Les données restent dans M365 (data-in-situ), instack les lit et les affiche dans les apps générées. Le polling remplace les webhooks pour le MVP.

---

## DÉPENDANCES

| Direction | Tâche | Agent |
|-----------|-------|-------|
| **Bloqué par** | S02 (Token Proxy, Graph API service) | @PHANTOM + @CONDUIT |
| **Bloqué par** | S03 (Schema inference, Excel parsing) | @CONDUIT |
| **Bloqué par** | S05 (Composants affichent les données) | @PRISM |
| **Bloque** | S07 (Sandbox avec vraies données) | @FORGE |
| **Bloque** | S09 (Write-back — ajoute l'écriture) | @CONDUIT |

---

## TÂCHES DÉTAILLÉES

### TÂCHE 6.1 — Data Source CRUD + File Picker
**Assigné à**: @CONDUIT + @FORGE
**Complexité**: L
**Dépendance**: S02 (CRUD pattern), S03 (Graph API service)

```
CHECKLIST :
□ Compléter les endpoints data sources :
    - POST /api/data-sources — Connecter une source de données
      * Body : { type: 'excel_file'|'sharepoint_list', m365ResourceId: string, appId?: string }
      * Vérifie l'accès au fichier via Graph API
      * Déclenche un premier sync
      * Audit log : 'data_source.connected'
    - GET /api/data-sources — Lister mes sources de données
      * Filtres : ?appId=xxx, ?type=excel_file, ?syncStatus=error
    - GET /api/data-sources/:id — Détail d'une source
      * Inclure last_synced_at, sync_status, schema inféré
    - POST /api/data-sources/:id/sync — Forcer un re-sync
      * Déclenche un job de synchronisation immédiat
    - DELETE /api/data-sources/:id — Déconnecter une source
      * Soft delete : marquer comme disconnected
      * Audit log : 'data_source.disconnected'
□ Créer le File Picker frontend :
    - GET /api/data-sources/browse/drives — Lister les drives OneDrive/SharePoint
    - GET /api/data-sources/browse/files?driveId=xxx&path=/ — Naviguer dans les fichiers
    - UI component : arbre de fichiers avec sélection
    - Filtrer : uniquement .xlsx, .xls, .csv, SharePoint Lists
    - Preview : montrer les premières 5 lignes du fichier sélectionné
□ Tests : connexion, sync, browse, permissions insuffisantes
```

---

### TÂCHE 6.2 — Sync Engine (Polling)
**Assigné à**: @CONDUIT
**Complexité**: XL
**Dépendance**: 6.1

```
CHECKLIST :
□ Créer packages/api/src/services/sync-engine.service.ts :
    - syncDataSource(dataSourceId: string): Promise<Result<SyncResult, SyncError>>
    - Étapes :
      1. Récupérer la config de la data source en DB
      2. Déchiffrer le token OAuth via token proxy
      3. Appeler Graph API pour lire le contenu :
         - Excel : GET /me/drive/items/{id}/workbook/worksheets/{sheet}/usedRange
         - SharePoint List : GET /sites/{id}/lists/{id}/items?$expand=fields
      4. Parser les données brutes en format uniforme
      5. Détecter les changements depuis le dernier sync (delta)
      6. Mettre à jour le cache en mémoire (pas de stockage business data)
      7. Mettre à jour sync_status + last_synced_at en DB
□ Implémenter le delta detection :
    - Pour Excel : comparer le hash MD5 du contenu
    - Pour SharePoint : utiliser le champ Modified
    - Si pas de changement → skip (économie d'API calls)
□ Implémenter le cache en mémoire :
    - Cloudflare Workers KV pour cacher les données lues
    - TTL : 5 minutes (configurable)
    - Clé : tenant_id:data_source_id:version
    - IMPORTANT : les données dans KV sont éphémères, pas le source of truth
    - Le source of truth reste TOUJOURS dans M365
□ Implémenter le polling scheduler :
    - Cron trigger Cloudflare Workers : toutes les 5 minutes
    - Sélectionner les data sources actives (sync_status != 'error')
    - Sync en batch avec concurrency limit (5 simultanés)
    - Si erreur 429 (Graph API throttle) → backoff + retry dans 1 minute
    - Si erreur 401 → marquer token expiré, tenter refresh
    - Si erreur 404 → marquer data source comme 'error' (fichier supprimé)
□ Gérer les rate limits Graph API :
    - Respecter Retry-After header
    - Maximum 10,000 requêtes par 10 minutes par app
    - Throttle intelligent : prioriser les data sources les plus consultées
□ Tests :
    - Sync d'un fichier Excel simple (10 colonnes, 100 lignes)
    - Sync d'un fichier Excel lourd (50 colonnes, 10,000 lignes)
    - Delta detection : pas de re-sync si fichier inchangé
    - Gestion erreur : token expiré, fichier supprimé, rate limit
    - Performance : sync < 2 secondes pour 1000 lignes
```

---

### TÂCHE 6.3 — API Données pour le Frontend
**Assigné à**: @FORGE
**Complexité**: M
**Dépendance**: 6.2

```
CHECKLIST :
□ Créer GET /api/apps/:appId/data :
    - Retourne les données synchées pour l'app
    - Lit depuis le cache KV (ou sync si expiré)
    - Pagination : ?page=1&limit=100
    - Tri : ?sort=colonne&order=asc
    - Filtres : ?filter[colonne]=valeur
    - Format : { columns: TypedColumn[], rows: Record<string, unknown>[], total: number }
□ Créer GET /api/apps/:appId/data/aggregations :
    - Calcule les agrégations côté serveur
    - Body : [{ column: string, operation: 'count'|'sum'|'avg'|'min'|'max' }]
    - Retourne : [{ column, operation, result }]
    - Utilisé par les KPICards et Charts
□ Créer un hook frontend useAppData(appId: string) :
    - Fetch les données au mount
    - Re-fetch au changement de filtres/tri/pagination
    - Loading state, error state
    - Polling optionnel (toutes les 30s si l'app est ouverte)
□ Tests : pagination, tri, filtres, agrégations
```

---

### TÂCHE 6.4 — Frontend Data Source Picker
**Assigné à**: @PRISM
**Complexité**: L
**Dépendance**: 6.1, S05 (design system)

```
CHECKLIST :
□ Créer packages/web/src/components/DataSourcePicker/DataSourcePicker.tsx :
    - Modal de sélection de fichier Excel / SharePoint List
    - Navigation arborescente dans OneDrive / SharePoint
    - Preview des premières lignes du fichier sélectionné
    - Bouton "Connecter" qui crée la data source
    - État : browsing → previewing → connecting → connected
□ Créer packages/web/src/components/SyncStatus/SyncStatus.tsx :
    - Badge indiquant le statut de sync : synced (vert), syncing (spinner), error (rouge)
    - Bouton "Re-sync" pour forcer
    - "Dernière sync il y a X minutes"
□ Intégrer dans le flow de génération d'app :
    - Après le prompt, l'utilisateur choisit sa source de données
    - Le schema est inféré automatiquement
    - Preview de l'app avant confirmation
```

---

## LIVRABLES S06

| Livrable | Chemin | Owner |
|----------|--------|-------|
| Sync Engine | `packages/api/src/services/sync-engine.service.ts` | @CONDUIT |
| Data Source CRUD | `packages/api/src/routes/data-sources.routes.ts` | @FORGE |
| Data API | `packages/api/src/routes/app-data.routes.ts` | @FORGE |
| File Picker | `packages/web/src/components/DataSourcePicker/` | @PRISM |
| Sync Status | `packages/web/src/components/SyncStatus/` | @PRISM |
| Cron Trigger | `packages/api/src/cron/sync-scheduler.ts` | @CONDUIT |

---

## DEFINITION OF DONE S06

- [ ] File picker navigue dans OneDrive/SharePoint
- [ ] Sync engine lit les données Excel via Graph API
- [ ] Delta detection évite les syncs inutiles
- [ ] Cache KV avec TTL 5 minutes
- [ ] Polling toutes les 5 minutes (cron Cloudflare Workers)
- [ ] Rate limiting Graph API respecté
- [ ] Token JAMAIS exposé (token proxy vérifié)
- [ ] API données avec pagination, tri, filtres, agrégations
- [ ] Frontend affiche les données synchées dans les composants
- [ ] CI passe en vert

---

## HANDOFF → S07

```
## HANDOFF: @CONDUIT + @CORTEX → @FORGE + @SPECTRUM
**Sprint**: S07
**Statut**: READY
**Livrables prêts**:
  - Sync Excel read-only fonctionnel
  - Données accessibles via API avec pagination/filtres
  - File picker pour connecter des sources
**Prochaine étape**: @FORGE crée le Sandbox avec données fictives
**Prochaine étape**: @SPECTRUM définit l'UX du wizard de création d'app
```

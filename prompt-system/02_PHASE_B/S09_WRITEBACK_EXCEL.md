# S09 — WRITE-BACK EXCEL — Sync Bidirectionnel

> **Sprint**: 09 | **Semaines**: W17-W18
> **Leads**: @CONDUIT (Integration M365) + @FORGE (Backend)
> **Support**: @PHANTOM (Security audit write) + @PRISM (UI formulaires)
> **Phase**: B — "Convertir et Gouverner"

---

## OBJECTIF

Ajouter l'écriture dans les fichiers Excel et SharePoint Lists via Microsoft Graph API. Les utilisateurs peuvent modifier les données depuis les apps instack, et les changements sont écrits dans le fichier source. Cela transforme instack d'un simple dashboard read-only en un vrai outil de travail.

---

## DÉPENDANCES

| Direction | Tâche | Agent |
|-----------|-------|-------|
| **Bloqué par** | S06 (Sync read-only) | @CONDUIT |
| **Bloqué par** | S08 (Gate review Phase A passed) | @BLUEPRINT |
| **Bloque** | S10 (Composants avancés utilisent le write-back) | @PRISM |
| **Bloque** | S11 (App Store — apps avec write-back plus utiles) | @PULSE |

---

## TÂCHES DÉTAILLÉES

### TÂCHE 9.1 — Write-back Engine
**Assigné à**: @CONDUIT
**Complexité**: XL
**Dépendance**: S06 (sync engine)

```
CHECKLIST :
□ Étendre sync-engine.service.ts avec les opérations d'écriture :
    - writeCell(dataSourceId, row, column, value): écrire une cellule Excel
      * Graph API : PATCH /me/drive/items/{id}/workbook/worksheets/{sheet}/range(address='{cell}')
      * Body : { values: [[value]] }
    - writeRow(dataSourceId, rowData): ajouter une ligne
      * Graph API : POST .../tables/{table}/rows/add
    - updateRow(dataSourceId, rowIndex, updates): modifier une ligne existante
    - deleteRow(dataSourceId, rowIndex): supprimer une ligne
□ Implémenter la queue d'écriture (BullMQ) :
    - Les écritures ne sont PAS synchrones (latence Graph API 200-500ms)
    - Chaque write est mis en queue
    - Traitement FIFO avec retry (3 tentatives, backoff exponentiel)
    - Optimistic update côté frontend (UX rapide, sync en background)
    - Si l'écriture échoue après 3 retries → notifier l'utilisateur + rollback
□ Conflict resolution :
    - Si le fichier a été modifié entre le read et le write → détecter via ETag
    - Stratégie : Last Write Wins (MVP) — documenter les limitations
    - Logger les conflits dans l'audit log
□ Permissions d'écriture :
    - Vérifier que le scope OAuth inclut Files.ReadWrite.All
    - Si permission manquante → demander le consentement additionnel
    - Admin consent pour SharePoint Sites.ReadWrite.All
□ Sécurité (@PHANTOM review obligatoire) :
    - Valider les données avant écriture (Zod)
    - Sanitizer les valeurs (pas d'injection de formules Excel =CMD())
    - Audit log pour CHAQUE écriture : 'data.written'
    - Rate limit écriture : max 100 writes/min par user
□ Tests :
    - Write cell, row, update, delete avec mocks Graph API
    - Queue processing avec retry
    - Conflict detection via ETag
    - Formula injection prevention (=CMD(), =HYPERLINK())
    - Rate limiting écriture
```

---

### TÂCHE 9.2 — API Write Endpoints
**Assigné à**: @FORGE
**Complexité**: L
**Dépendance**: 9.1

```
CHECKLIST :
□ POST /api/apps/:appId/data/rows — Ajouter une ligne
    - Body : Record<string, unknown> (validé contre le schema)
    - Queue le write, retourne immédiatement avec optimistic data
□ PATCH /api/apps/:appId/data/rows/:rowIndex — Modifier une ligne
    - Body : Partial<Record<string, unknown>>
    - Validation des types (nombre, date, enum valide)
□ DELETE /api/apps/:appId/data/rows/:rowIndex — Supprimer une ligne
    - Soft delete dans l'UI, hard delete dans Excel
□ GET /api/apps/:appId/data/write-queue — Statut des écritures en attente
    - Retourne : pending count, last error, last success
□ Tests pour chaque endpoint + validation
```

---

### TÂCHE 9.3 — Frontend Inline Editing
**Assigné à**: @PRISM
**Complexité**: L
**Dépendance**: 9.2, S05 (DataTable, FormField)

```
CHECKLIST :
□ Ajouter le mode édition au DataTable :
    - Double-clic sur une cellule → passe en mode édition inline
    - Le type de l'éditeur dépend du type de colonne (text input, date picker, select)
    - Escape → annuler
    - Enter/Tab → valider + écrire
    - Indicateur visuel : cellule modifiée = bordure bleue
    - Indicateur sync : spinner pendant l'écriture, check quand synché
□ Ajouter un bouton "Ajouter une ligne" au DataTable
    - Nouvelle ligne vide en bas du tableau
    - Champs obligatoires highlightés
□ Ajouter un bouton "Supprimer" dans les actions de ligne
    - Confirmation dialog avant suppression
□ Créer le hook useOptimisticUpdate :
    - Mettre à jour l'UI immédiatement
    - Si le write échoue → rollback + notification erreur
    - Si le write réussit → pas d'action (déjà affiché)
□ Notification toast pour les erreurs de write-back
□ Tests : edit inline, add row, delete row, optimistic update, rollback
```

---

## LIVRABLES S09

| Livrable | Chemin | Owner |
|----------|--------|-------|
| Write-back Engine | `packages/api/src/services/write-engine.service.ts` | @CONDUIT |
| Write Queue (BullMQ) | `packages/api/src/queues/write-queue.ts` | @CONDUIT |
| Write API Endpoints | `packages/api/src/routes/app-data.routes.ts` | @FORGE |
| Inline Editing UI | `packages/ui/src/components/DataTable/` (extended) | @PRISM |
| ADR #004 Write-back | `docs/adr/004-write-back-strategy.md` | @CONDUIT |

---

## DEFINITION OF DONE S09

- [ ] Write cell/row/update/delete fonctionnel via Graph API
- [ ] Queue d'écriture avec retry et error handling
- [ ] Conflict detection via ETag
- [ ] Formula injection prevention vérifié par @PHANTOM
- [ ] Inline editing dans DataTable (double-clic)
- [ ] Optimistic updates avec rollback
- [ ] Audit log pour chaque écriture
- [ ] CI passe en vert

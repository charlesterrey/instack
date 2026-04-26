# S08 — INTÉGRATION E2E + BETA INTERNE

> **Sprint**: 08 | **Semaines**: W15-W16
> **Leads**: @BLUEPRINT (TPM) + @WATCHDOG (DevOps)
> **Support**: @CATALYST (Analytics) + @FLUX (Event pipeline) + Toute l'équipe engineering
> **Phase**: A — "Prouver la Magie" — SPRINT FINAL PHASE A

---

## OBJECTIF

Intégrer tous les modules développés en S01-S07, tester end-to-end, instrumenter l'observabilité (PostHog + Sentry), corriger les bugs d'intégration, et lancer une beta interne avec 5-10 utilisateurs. À la fin de S08, le produit Phase A est stable et mesurable.

**C'est la gate review de la Phase A. Si les quality gates ne passent pas, on ne démarre pas la Phase B.**

---

## DÉPENDANCES

| Direction | Tâche | Agent |
|-----------|-------|-------|
| **Bloqué par** | S01-S07 (tous les modules Phase A) | Toute l'équipe |
| **Bloque** | Phase B (S09-S16) — ne démarre pas si S08 échoue | Tout le monde |

---

## TÂCHES DÉTAILLÉES

### TÂCHE 8.1 — Tests d'intégration E2E
**Assigné à**: @BLUEPRINT + @WATCHDOG
**Complexité**: XL
**Dépendance**: S07 (tous les modules stables)

```
CHECKLIST :
□ Installer Playwright dans tests/e2e/
□ Configurer pour tester en environnement preview (Cloudflare)
□ Écrire les scénarios E2E critiques :

    SCÉNARIO 1 : "Sandbox → Première app" (le plus important)
    □ Naviguer vers la page d'accueil
    □ Cliquer "Essayer sans compte"
    □ Vérifier : arrivée sur le Dashboard sandbox
    □ Cliquer "Créer une app"
    □ Taper un prompt : "Je veux suivre les interventions de mes techniciens"
    □ Sélectionner le jeu de données démo "Interventions terrain"
    □ Attendre la génération (<10s timeout)
    □ Vérifier : l'app preview s'affiche avec des composants
    □ Publier l'app
    □ Vérifier : retour au Dashboard avec la nouvelle app listée
    □ Ouvrir l'app
    □ Vérifier : les données s'affichent dans les composants
    □ TEMPS TOTAL ATTENDU : < 90 secondes

    SCÉNARIO 2 : "Auth Microsoft → App avec vraies données"
    □ Naviguer vers la page d'accueil
    □ Cliquer "Se connecter avec Microsoft"
    □ (Mock Microsoft OAuth en test)
    □ Arrivée sur le Dashboard
    □ Créer une app avec un fichier Excel uploadé
    □ Vérifier la sync des données
    □ Vérifier l'affichage correct des composants

    SCÉNARIO 3 : "Gestion des apps"
    □ Créer 3 apps
    □ Vérifier la liste sur le Dashboard
    □ Modifier le nom d'une app
    □ Archiver une app
    □ Vérifier qu'elle disparaît de la liste active

    SCÉNARIO 4 : "Limites du plan Free"
    □ Créer 3 apps (limite Free)
    □ Tenter de créer une 4ème
    □ Vérifier : message d'upgrade affiché

    SCÉNARIO 5 : "Erreur pipeline gracieuse"
    □ Soumettre un prompt vide → erreur claire
    □ Soumettre un prompt sans données → gère correctement
    □ Simuler timeout API Claude → retry + message d'erreur
    
    SCÉNARIO 6 : "Mobile responsive"
    □ Viewport 375px (iPhone)
    □ Naviguer : Home → Sandbox → Wizard → App
    □ Vérifier : tout est utilisable sans scroll horizontal

□ Configurer Playwright pour screenshots on failure
□ Configurer CI pour exécuter les E2E sur chaque merge vers main
□ Target : 100% des scénarios passent
```

---

### TÂCHE 8.2 — Observabilité : PostHog + Sentry
**Assigné à**: @CATALYST + @FLUX + @WATCHDOG
**Complexité**: L
**Dépendance**: S07 (frontend stable)

```
CHECKLIST :
□ Installer PostHog (analytics) :
    - SDK frontend : posthog-js dans packages/web
    - SDK backend : posthog-node dans packages/api
    - Configurer EU cloud (eu.posthog.com) pour RGPD
    - Feature flags prêt pour la Phase B
□ Implémenter la taxonomie d'events (40+ events) :
    
    AUTHENTICATION :
    □ auth.login_started
    □ auth.login_completed { method: 'microsoft'|'sandbox' }
    □ auth.login_failed { error: string }
    □ auth.logout
    
    APP GENERATION :
    □ generation.started { prompt_length: number, has_data: boolean }
    □ generation.stage_completed { stage: 1|2|3|4, latency_ms, cost_eur }
    □ generation.completed { archetype, total_latency_ms, total_cost_eur, component_count }
    □ generation.failed { stage, error_code }
    □ generation.retried { stage }
    
    APP LIFECYCLE :
    □ app.created { archetype, visibility }
    □ app.viewed { app_id, viewer_role }
    □ app.shared { visibility_change }
    □ app.archived
    □ app.deleted
    
    DATA SOURCE :
    □ datasource.connected { type: 'excel'|'sharepoint'|'demo' }
    □ datasource.synced { rows, latency_ms }
    □ datasource.error { error_type }
    
    NAVIGATION :
    □ page.viewed { page_name, referrer }
    □ wizard.step_completed { step: 1|2|3|4 }
    □ wizard.abandoned { step, time_spent_ms }
    
    ENGAGEMENT :
    □ app.interacted { component_type, action_type }
    □ filter.applied { filter_type }
    □ table.sorted { column }
    □ table.paginated { page }
    
    SANDBOX :
    □ sandbox.started
    □ sandbox.converted { to: 'microsoft_auth' }
    □ sandbox.expired

□ Installer Sentry (error tracking) :
    - SDK frontend : @sentry/react dans packages/web
    - SDK backend : @sentry/cloudflare dans packages/api
    - Configurer source maps
    - Configurer les alertes :
      * P1 : error rate > 5% → notification immédiate
      * P2 : error rate > 1% → notification 15min
      * Nouvelle erreur non-vue → notification
□ Créer les premiers dashboards PostHog :
    - Funnel : Page d'accueil → Sandbox → Wizard → App créée → App vue par 2+ users
    - Retention : cohort semaine par semaine
    - North Star : Weekly Active Apps with 2+ users
    - Pipeline success rate par stage
    - Latence P50/P95/P99
□ Tests : vérifier que les events sont envoyés (mock PostHog en test)
```

---

### TÂCHE 8.3 — Bug Bash + Polish
**Assigné à**: Toute l'équipe engineering
**Complexité**: L
**Dépendance**: 8.1

```
CHECKLIST :
□ Bug bash session (2-4 heures) :
    - Chaque ingénieur teste les flows principaux
    - Logger tous les bugs dans une liste priorisée
    - Catégoriser : P0 (bloquant), P1 (important), P2 (nice-to-have)
□ Corriger TOUS les P0 dans ce sprint
□ Corriger les P1 critiques pour l'UX
□ Logger les P2 pour la Phase B
□ Vérifier :
    - Pas de console.error dans la console browser
    - Pas d'erreur non-catchée dans Sentry
    - Tous les loading states fonctionnent
    - Tous les error states ont un message clair
    - Pas de flash of unstyled content (FOUC)
    - Pas de layout shift (CLS < 0.1)
```

---

### TÂCHE 8.4 — Performance Audit
**Assigné à**: @WATCHDOG + @PRISM
**Complexité**: M
**Dépendance**: 8.1

```
CHECKLIST :
□ Lighthouse audit :
    - Performance score > 90
    - LCP < 1.5s
    - FID < 100ms
    - CLS < 0.1
    - Bundle size < 200KB gzipped
□ API latency audit :
    - /health < 50ms
    - /api/apps (list) < 200ms
    - /api/generate (pipeline) < 5s
    - /api/apps/:id/data < 500ms
□ Si les budgets ne sont pas respectés :
    - Identifier les bottlenecks
    - Optimiser (lazy loading, code splitting, query optimization)
    - Re-mesurer
□ Documenter les résultats dans un rapport de performance
```

---

### TÂCHE 8.5 — Beta Interne (5-10 utilisateurs)
**Assigné à**: @BLUEPRINT + @ECHO (User Research)
**Complexité**: M
**Dépendance**: 8.1-8.4

```
CHECKLIST :
□ Recruter 5-10 utilisateurs beta :
    - 2-3 Ops Managers (profil Sandrine)
    - 1-2 Chefs de projet (profil Mehdi)
    - 1-2 DSI (profil Philippe) — uniquement en observation
    - 2-3 internes (équipe instack)
□ Préparer le guide beta :
    - Objectif : créer une app à partir de votre Excel
    - Scénarios suggérés
    - Comment donner du feedback (formulaire)
□ Métriques à observer pendant la beta :
    - Time-to-first-app (target < 90s)
    - Taux de succès du pipeline (target > 85%)
    - Satisfaction (formulaire 1-5)
    - Bugs reportés
    - Suggestions de fonctionnalités
□ Débrief : synthétiser les retours, prioriser pour la Phase B
```

---

## LIVRABLES S08

| Livrable | Chemin | Owner |
|----------|--------|-------|
| Tests E2E (6 scénarios) | `tests/e2e/` | @BLUEPRINT |
| PostHog Events (40+) | `packages/web/src/lib/analytics.ts` | @CATALYST + @FLUX |
| Sentry Setup | `packages/*/src/lib/sentry.ts` | @WATCHDOG |
| Performance Report | `docs/reports/phase-a-performance.md` | @WATCHDOG |
| Beta Feedback | `docs/reports/phase-a-beta-feedback.md` | @ECHO |

---

## GATE REVIEW PHASE A — Critères GO/NO-GO

| Critère | Target | GO si |
|---------|--------|-------|
| Pipeline success rate | > 85% | Mesuré sur 100 combinaisons |
| Time-to-first-app | < 90s | Mesuré en sandbox |
| Pipeline latency P95 | < 5s | Mesuré sur 50 générations |
| E2E tests pass rate | 100% | 6/6 scénarios |
| Lighthouse Performance | > 90 | Desktop + Mobile |
| Zero P0 bugs | 0 | Après bug bash |
| Beta user satisfaction | > 3.5/5 | Sur 5-10 testeurs |
| PostHog events firing | 40+ events | Vérifiés dans dashboard |

**Si TOUS les critères sont verts → GO Phase B.**
**Si 1+ critère rouge → Sprint de stabilisation avant Phase B.**

---

## HANDOFF → PHASE B (S09)

```
## HANDOFF: Phase A → Phase B
**Statut**: GATE REVIEW PASSED
**Livrables Phase A**:
  - Monorepo 5 packages compilable
  - Auth OAuth + Token Proxy
  - Pipeline IA 4 stages (>85% success)
  - 6 composants atomiques production-ready
  - Excel sync read-only
  - Sandbox avec 5 jeux de données
  - Wizard de création d'app
  - E2E tests + Observabilité
**Phase B commence avec**: S09 Write-back Excel
```

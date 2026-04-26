# S13 — BILLING STRIPE — Plans, Paiements, Upgrade Flows

> **Sprint**: 13 | **Semaines**: W25-W26
> **Leads**: @FORGE (Backend) + @IRONCLAD (Financial specs)
> **Support**: @PRISM (Upgrade UI) + @PULSE (Conversion walls)
> **Phase**: B — "Convertir et Gouverner"

---

## OBJECTIF

Intégrer Stripe pour la gestion des abonnements : Free, Pro (299 EUR/mois), Enterprise (custom). Implémenter les conversion walls (limites du plan Free qui poussent à l'upgrade), le checkout Stripe, et la gestion des abonnements.

---

## DÉPENDANCES

| Direction | Tâche | Agent |
|-----------|-------|-------|
| **Bloqué par** | S02 (Auth, tenant model) | @FORGE |
| **Bloqué par** | S12 (Cockpit — upgrade depuis admin) | @DIPLOMAT |
| **Bloque** | S14 (Onboarding — trial Pro dans le flow) | @WILDFIRE |
| **Bloque** | S16 (Launch — monetization ready) | @IRONCLAD |

---

## TÂCHES DÉTAILLÉES

### TÂCHE 13.1 — Stripe Integration Backend
**Assigné à**: @FORGE
**Complexité**: XL

```
CHECKLIST :
□ Installer stripe dans packages/api
□ Créer packages/api/src/services/billing.service.ts :
    - createCustomer(tenant): créer un Stripe Customer pour le tenant
    - createCheckoutSession(tenant, plan): créer une session de paiement
    - createPortalSession(tenant): accès au portal Stripe (gérer abonnement)
    - handleWebhook(event): traiter les événements Stripe
□ Définir les produits Stripe :
    - Product : "instack Pro"
      * Price : 299 EUR/mois (récurrent)
      * Price : 5 EUR/mois par creator additionnel (metered)
    - Product : "instack Enterprise" (prix custom, géré manuellement)
□ Endpoints :
    - POST /api/billing/checkout — Créer un checkout Stripe
      * Body : { plan: 'pro' }
      * Retourne : { checkoutUrl: string }
      * Redirect vers Stripe Checkout
    - POST /api/billing/portal — Accéder au portal Stripe
      * Retourne : { portalUrl: string }
    - GET /api/billing/subscription — État de l'abonnement courant
      * { plan, status, nextBillingDate, creators: { current, limit } }
    - POST /api/billing/webhook — Webhook Stripe (signature vérifiée)
      * Events gérés :
        - checkout.session.completed → upgrade plan en DB
        - customer.subscription.updated → sync plan
        - customer.subscription.deleted → downgrade vers Free
        - invoice.payment_failed → notifier + grace period 7 jours
□ Mettre à jour la table tenants :
    - stripe_customer_id TEXT
    - stripe_subscription_id TEXT
    - plan_expires_at TIMESTAMPTZ (pour grace period)
□ Tests : checkout flow (Stripe test mode), webhook handling, plan sync
```

### TÂCHE 13.2 — Plan Limits Enforcement
**Assigné à**: @FORGE + @PULSE
**Complexité**: L

```
CHECKLIST :
□ Définir les limites par plan dans @instack/shared :
    const PLAN_LIMITS = {
      free: {
        maxApps: 3,
        maxCreators: 1,
        maxGenerationsPerDay: 10,
        maxDataSources: 3,
        features: ['sandbox', 'basic_components'],
      },
      pro: {
        maxApps: 50,
        maxCreators: 20,
        maxGenerationsPerDay: 100,
        maxDataSources: 50,
        features: ['sandbox', 'all_components', 'app_store', 'write_back', 'priority_support'],
      },
      enterprise: {
        maxApps: Infinity,
        maxCreators: Infinity,
        maxGenerationsPerDay: Infinity,
        maxDataSources: Infinity,
        features: ['all', 'cockpit_dsi', 'sso_custom', 'audit_export', 'dedicated_support'],
      },
    };
□ Créer middleware plan-check.middleware.ts :
    - Vérifier les limites avant chaque action
    - Si limite atteinte → retourner 403 avec { upgradeRequired: true, limit, current, plan }
□ Points de vérification :
    - POST /api/apps → check maxApps
    - POST /api/generate → check maxGenerationsPerDay
    - POST /api/data-sources → check maxDataSources
    - Accès Cockpit DSI → check plan === 'enterprise'
    - Accès write-back → check plan !== 'free'
□ Tests : chaque limite pour chaque plan
```

### TÂCHE 13.3 — Conversion Walls Frontend
**Assigné à**: @PRISM + @PULSE
**Complexité**: L

```
CHECKLIST :
□ Créer packages/web/src/components/UpgradeWall/UpgradeWall.tsx :
    - Modal qui s'affiche quand une limite est atteinte
    - Message personnalisé selon la limite :
      * "Vous avez atteint la limite de 3 apps" (app wall)
      * "Le partage d'apps nécessite le plan Pro" (share wall)
      * "Le Cockpit DSI est disponible sur le plan Enterprise" (governance wall)
    - Comparaison Free vs Pro (features, limites)
    - CTA "Passer au Pro — 299 EUR/mois" → redirect vers Stripe Checkout
    - CTA secondaire "Essayer 14 jours gratuitement"
□ Créer packages/web/src/pages/Pricing/Pricing.tsx :
    - Page de pricing publique
    - 3 cards : Free, Pro (highlighted), Enterprise
    - Toggle mensuel/annuel (20% réduction)
    - Détail des features par plan
    - FAQ pricing
    - CTA par plan
□ Créer packages/web/src/components/PlanBadge/PlanBadge.tsx :
    - Badge dans le header : "Free" (gris), "Pro" (bleu), "Enterprise" (gold)
    - Clic → page de pricing ou portal
□ Events PostHog :
    - upgrade_wall.shown { wall_type, plan_current }
    - upgrade_wall.clicked { wall_type, action: 'upgrade'|'dismiss' }
    - pricing.viewed
    - checkout.started { plan }
    - checkout.completed { plan }
□ Tests : wall display, redirect checkout, pricing page
```

### TÂCHE 13.4 — Trial Pro 14 jours
**Assigné à**: @FORGE
**Complexité**: M

```
CHECKLIST :
□ Implémenter le trial :
    - POST /api/billing/start-trial — Démarrer un trial Pro 14 jours
    - Pas de carte bancaire requise
    - Le tenant passe en plan 'pro' avec trial_ends_at = now + 14 days
    - À expiration : downgrade automatique vers Free (cron job)
    - Notification : J-3, J-1, J0 (expiration)
□ Un seul trial par tenant (vérifier trial_used_at en DB)
□ Events : trial.started, trial.ending_soon, trial.expired, trial.converted
□ Tests : start trial, expiration, conversion, tentative double trial
```

---

## DEFINITION OF DONE S13

- [ ] Stripe Checkout fonctionnel (test mode)
- [ ] Webhooks Stripe gérés (upgrade, downgrade, payment failed)
- [ ] Plan limits enforced sur toutes les actions
- [ ] Conversion walls affichés aux bons moments
- [ ] Page pricing avec 3 plans
- [ ] Trial Pro 14 jours sans CB
- [ ] Stripe Portal pour gérer l'abonnement
- [ ] Events PostHog billing tracked
- [ ] CI passe en vert

# S16 — LAUNCH BETA PUBLIQUE — Go Live

> **Sprint**: 16 | **Semaines**: W31-W32
> **Leads**: @WATCHDOG (Infra/Production) + @CONQUEST (Launch Campaign)
> **Support**: TOUTE L'ÉQUIPE — C'est le sprint de lancement
> **Phase**: B — "Convertir et Gouverner" — SPRINT FINAL

---

## OBJECTIF

Lancer la beta publique d'instack. Déployer en production, activer le monitoring, lancer la campagne de lancement, onboarder les premiers 50 utilisateurs beta, et mesurer les premières métriques North Star. C'est le moment de vérité.

---

## DÉPENDANCES

| Direction | Tâche | Agent |
|-----------|-------|-------|
| **Bloqué par** | S15 (Polish — le produit doit être excellent) | @PRISM |
| **Bloqué par** | S13 (Billing — monetization ready) | @FORGE |
| **Bloqué par** | S14 (Onboarding — activation optimisée) | @WILDFIRE |
| **Bloque** | Post-MVP (V2 — scaling) | Tous |

---

## TÂCHES DÉTAILLÉES

### TÂCHE 16.1 — Production Readiness Checklist
**Assigné à**: @WATCHDOG + @PHANTOM
**Complexité**: XL

```
CHECKLIST :
□ Infrastructure :
    □ Cloudflare Workers déployé en production (wrangler deploy --env production)
    □ DNS configuré : instack.io, *.apps.instack.io (wildcard SSL)
    □ Neon PostgreSQL production (region EU — Frankfurt ou Paris)
    □ Cloudflare KV namespace production
    □ Dragonfly/Redis production (si BullMQ queues)
    □ Backup DB automatique configuré (daily, 30 jours rétention)
□ Security :
    □ Toutes les variables d'environnement en Cloudflare Secrets
    □ CSP headers vérifiés en production
    □ HSTS header activé
    □ Rate limiting vérifié
    □ RLS vérifié (test cross-tenant en production)
    □ Penetration test léger (OWASP Top 10 checklist)
    □ DPA Anthropic vérifiée (clause transfert données EU)
□ Monitoring :
    □ Sentry production configuré (DSN séparé du dev)
    □ PostHog production (EU cloud)
    □ Alertes configurées :
      - Error rate > 5% → Slack notification immédiat
      - Pipeline failure rate > 20% → Slack notification
      - API P99 > 500ms → Slack notification
      - DB connection errors → Slack notification
      - Stripe webhook failures → Email notification
    □ Dashboard monitoring : uptime, latency, error rate, pipeline success
    □ StatusPage configuré (status.instack.io)
□ Performance :
    □ Load test : 100 utilisateurs simultanés, 50 générations parallèles
    □ Vérifier : pas de dégradation sous charge
    □ Vérifier : auto-scaling Cloudflare Workers fonctionne
□ Legal :
    □ CGV/CGU publiées (mentions légales FR)
    □ Politique de confidentialité (RGPD)
    □ Cookie consent banner
    □ DPO contact : admin@terragrow.fr
□ Rollback plan :
    □ Documenter le rollback process
    □ Tester le rollback (déployer version N-1)
    □ DB migration réversible vérifiée
```

### TÂCHE 16.2 — Landing Page & Marketing Website
**Assigné à**: @CONQUEST + @SIGNAL + @PRISM
**Complexité**: L

```
CHECKLIST :
□ Créer la landing page instack.io :
    - Hero : "Créez l'app dont votre équipe a besoin. En 90 secondes."
    - Démo vidéo embed (60 secondes, sandbox flow)
    - 3 blocks : Comment ça marche (3 étapes)
    - Social proof : "X apps créées", "X entreprises"
    - Pain points : "Power Apps trop complexe ?", "Marre d'Excel ?", "Shadow IT ?"
    - Comparaison (sans nommer) : "50× plus rapide que les alternatives"
    - Pricing (3 plans)
    - CTA : "Essayer gratuitement" → Sandbox
    - CTA secondaire : "Réserver une démo" → Calendly
    - Footer : legal, social links, contact
□ SEO basics :
    - Meta title : "instack — L'App Store Interne Gouverné"
    - Meta description optimisée
    - Open Graph tags pour partage social
    - Sitemap.xml
    - Robots.txt
□ Analytics :
    - Google Analytics 4 (GA4) configuré
    - PostHog pageview tracking
    - UTM parameter tracking
□ Responsive et rapide (Lighthouse > 95)
```

### TÂCHE 16.3 — DSI Early Access Program
**Assigné à**: @DIPLOMAT + @CLOSER
**Complexité**: M

```
CHECKLIST :
□ Préparer le programme DSI Early Access :
    - Page dédiée : instack.io/dsi
    - Formulaire d'inscription (nom, entreprise, email, nb employés)
    - Proposition de valeur DSI :
      * "Contrôlez le Shadow IT sans bloquer l'innovation"
      * "Cockpit de gouvernance en temps réel"
      * "Zéro stockage de vos données — tout reste dans votre M365"
    - 30 minutes de setup accompagné
    - 30 jours gratuits plan Enterprise
□ Email d'invitation aux 50 DSI ciblés (LOIs)
□ Script de démo Cockpit DSI (5 minutes)
□ FAQ sécurité/compliance pré-rédigée
□ Track : dsi_early_access.signup, dsi_early_access.activated
```

### TÂCHE 16.4 — Campaign de Lancement
**Assigné à**: @CONQUEST + @SIGNAL + @THUNDER
**Complexité**: L

```
CHECKLIST :
□ Campagne LinkedIn (Charles Terrey @SOVEREIGN) :
    - Post J-7 : Teaser "On a passé 4 mois à construire quelque chose..."
    - Post J-3 : "3 jours. Le compte à rebours commence."
    - Post J0 (Launch Day) : "instack est live. Créez votre première app en 90 secondes."
    - Post J+1 : Screenshot d'une app créée + témoignage beta
    - Post J+3 : Thread technique "Comment fonctionne notre pipeline IA"
    - Post J+7 : Stats première semaine (apps créées, time-to-value)
□ Email launch sequence :
    - Liste beta-testers (50+ contacts)
    - Email 1 (J0) : "instack est live — accédez en premier"
    - Email 2 (J+3) : "X apps ont déjà été créées cette semaine"
    - Email 3 (J+7) : "Ce que nos premiers utilisateurs en pensent"
□ Product Hunt (optionnel, si timing bon) :
    - Préparer le listing
    - Screenshots, description, tagline
    - Vidéo demo
□ Préparer les battle cards à jour :
    - vs Power Apps (NPS -24.1, 40-60% orphaned)
    - vs Retool (pas le même ICP)
    - vs Shadow IT (97% apps inconnues de l'IT)
□ Track : campaign.impression, campaign.click, campaign.signup
```

### TÂCHE 16.5 — Monitoring & War Room Semaine 1
**Assigné à**: @WATCHDOG + @CATALYST
**Complexité**: M

```
CHECKLIST :
□ War room pendant 7 jours post-launch :
    - Dashboard temps réel sur écran partagé
    - Rotation on-call : 2 personnes minimum
    - Slack channel #launch-war-room
    - Checklist quotidienne :
      * Error rate < 5% ?
      * Pipeline success > 85% ?
      * Signup conversions normales ?
      * Stripe payments OK ?
      * No security incident ?
□ Métriques à tracker en temps réel :
    - Signups par heure
    - Apps créées par heure
    - Pipeline success rate
    - Error rate par endpoint
    - Latence P50/P95/P99
    - Stripe revenue (si applicable)
□ Playbook incidents :
    - P1 (site down) : rollback immédiat, post-mortem dans 24h
    - P2 (feature broken) : hotfix en <2h
    - P3 (bug non-bloquant) : fix dans le prochain sprint
□ Rapport quotidien J+1 à J+7 :
    - Métriques du jour
    - Incidents
    - Feedback utilisateurs
    - Actions prises
```

---

## GATE REVIEW FINALE — MVP Complet

| Critère | Target | Résultat |
|---------|--------|----------|
| Pipeline success rate | > 90% | __ |
| Time-to-first-app | < 90s | __ |
| Activation rate (30 jours) | > 25% | __ |
| E2E tests pass | 100% | __ |
| Lighthouse Performance | > 90 | __ |
| WCAG 2.1 AA | 0 violations | __ |
| Uptime semaine 1 | > 99.5% | __ |
| Signups semaine 1 | > 50 | __ |
| Apps créées semaine 1 | > 100 | __ |
| NPS beta users | > 30 | __ |
| Zero security incident | ✓ | __ |

---

## POST-MVP — Ce qui vient après

```
V2 (M5-M6) :
  - Templates marketplace (295 templates par M12)
  - Knowledge Graph Neo4j (remplacement JSONB)
  - Google Workspace support
  
V3 (M7-M12) :
  - Agentic apps (Temporal.io)
  - Real-time collaboration
  - Offline mode
  - Microsoft AppSource listing
  - Expansion Benelux
```

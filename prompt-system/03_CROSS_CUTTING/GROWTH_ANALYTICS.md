# CROSS-CUTTING — GROWTH & ANALYTICS

> **Owners**: @WILDFIRE (Growth) + @CATALYST (Analytics) + @RADAR (Marketing Analytics)
> **Stack**: PostHog + GA4 + BigQuery + Metabase (<90 EUR/mois)

---

## NORTH STAR METRIC

**Weekly Active Apps with 2+ users**

Définition : nombre d'apps qui ont été utilisées par au moins 2 personnes différentes dans les 7 derniers jours.

Requête :
```sql
SELECT COUNT(DISTINCT a.id) AS weekly_active_apps_2plus
FROM apps a
JOIN audit_log al ON al.resource_id = a.id
  AND al.action = 'app.viewed'
  AND al.created_at > NOW() - INTERVAL '7 days'
GROUP BY a.id
HAVING COUNT(DISTINCT al.user_id) >= 2;
```

---

## AARRR FUNNEL — Targets M6

| Stage | Metric | Target M6 | Measurement |
|-------|--------|-----------|-------------|
| **Acquisition** | Monthly visitors | 50K | GA4 + PostHog |
| **Activation** | Signup → First app (7j) | 30% | PostHog funnel |
| **Retention** | M1 retention | 45% | PostHog cohort |
| **Revenue** | MRR | 150K EUR | Stripe |
| **Referral** | K-factor | 0.4 | PostHog custom |

---

## PQL SCORING (Product Qualified Lead)

10 signaux, score 0-100, calculé quotidiennement :

| Signal | Points | Max | Poids |
|--------|--------|-----|-------|
| Apps créées | ×5/app | 25 | 25% |
| Apps avec 2+ users | ×10/app | 30 | 30% |
| Data sources connectées | ×8/source | 16 | 16% |
| Jours actifs /14j | ×2/jour | 28 | — |
| Invitations envoyées | ×3/invite | 9 | — |
| App Store visits | ×1/visit | 5 | — |
| Pipeline retries | ×2/retry | 6 | — |
| Features explorées | ×2/feature | 10 | — |
| Profile fit (Ops Manager) | +10 | 10 | — |
| Company size 200+ | +5-10 | 10 | — |

Tiers : 0-30 Nurture, 31-60 Engage, 61-80 Expand, 81-100 Close.

---

## 5 VIRAL LOOPS

| Loop | K-factor cible | Trigger | Measurement |
|------|---------------|---------|-------------|
| App Sharing | 0.4 | User partage une app | share.sent → share.signup |
| Template Clone | 0.2 | User clone depuis le Store | template.cloned → new user |
| Team Invitation | 0.15 | User invite un collègue | invitation.sent → invitation.accepted |
| App Store Discovery | 0.1 | User découvre une app | store.visited → app.cloned |
| Marketplace | 0.05 | Template marketplace (V2+) | — |

**K-factor total réaliste : 0.15-0.30** (pas le 0.9 théorique cumulé)

---

## EXPERIMENTATION FRAMEWORK

- **Fréquence** : 2-8 experiments/semaine, 200+/an
- **Scoring** : ICE-PLG (Impact × Confidence × Ease × PLG multiplier)
- **Outil** : PostHog Feature Flags + custom experiment tracker
- **Sample size** : calculé avant chaque test (significativité 95%)
- **Durée minimum** : 7 jours ou sample size atteint

### Expériences prioritaires par sprint :

**S07-S08** : Onboarding & Activation
- Prompt suggestions (3 vs 5 vs 7 suggestions)
- Wizard steps (3 steps vs 4 steps)
- Empty state copy (A vs B)

**S11-S12** : Sharing & Discovery
- Share CTA position (inline vs modal)
- App Store layout (grid vs list)
- Trending algorithm (recency vs popularity)

**S13-S14** : Monetization
- Pricing page layout
- Trial length (7j vs 14j vs 30j)
- Upgrade wall messaging

---

## DASHBOARDS (@LENS + @RADAR)

7 dashboards à créer dans Metabase/PostHog :

1. **North Star** — Weekly Active Apps, trend, cohorts
2. **Acquisition** — Visitors, signups, source attribution
3. **Activation** — Funnel, time-to-first-app, drop-off points
4. **Revenue** — MRR waterfall, LTV, CAC, churn
5. **Pipeline** — Success rate, latency, cost, errors by stage
6. **Product Health** — DAU/MAU, features used, component popularity
7. **Infrastructure** — Uptime, latency, error rate, DB health

# S14 — ONBOARDING PLG — Activation & Viral Loops

> **Sprint**: 14 | **Semaines**: W27-W28
> **Leads**: @SPECTRUM (UX) + @WILDFIRE (Growth)
> **Support**: @PRISM (Implementation) + @CATALYST (Analytics) + @PULSE (PLG)
> **Phase**: B — "Convertir et Gouverner"
> **Ref Design System**: `prompt-system/02_DESIGN_SYSTEM.md` — Untitled UI React (copy-paste, composants locaux)

---

## OBJECTIF

Optimiser l'onboarding pour que chaque nouvel utilisateur atteigne le "Aha moment" (créer une app utilisée par 2+ collègues dans les 48h). Implémenter les viral loops, le scoring PQL, et les flows d'activation. Target : 30% activation rate.

---

## DÉPENDANCES

| Direction | Tâche | Agent |
|-----------|-------|-------|
| **Bloqué par** | S07 (Sandbox + Wizard) | @FORGE |
| **Bloqué par** | S11 (App Store — sharing) | @PULSE |
| **Bloqué par** | S13 (Billing — trial flow) | @IRONCLAD |
| **Bloque** | S16 (Launch — onboarding doit être parfait) | @WILDFIRE |

---

## TÂCHES DÉTAILLÉES

### TÂCHE 14.1 — Onboarding Flow (Première connexion)
**Assigné à**: @SPECTRUM + @PRISM
**Complexité**: XL

```
CHECKLIST :
□ Créer packages/web/src/pages/Onboarding/Onboarding.tsx — Flow en 3 étapes :

    ÉTAPE 1 : "Bienvenue sur instack" (10 secondes)
    □ Animation d'accueil (logo + tagline)
    □ Question rapide : "Quel est votre rôle ?"
      - Ops Manager / Chef de projet / Direction / IT / Autre
    □ Question : "Quel type d'app vous intéresse ?"
      - Suivi terrain / Dashboard / Gestion projet / Formulaire / Autre
    □ Ces réponses personnalisent la suite (prompt pré-rempli, données démo)

    ÉTAPE 2 : "Créez votre première app" (60 secondes)
    □ Le Wizard de S07 avec des pré-remplissages personnalisés
    □ Prompt suggéré basé sur le rôle sélectionné
    □ Données démo sélectionnées automatiquement
    □ Guide visuel : flèches/tooltips pour chaque étape

    ÉTAPE 3 : "Partagez avec un collègue" (15 secondes)
    □ L'app est créée → écran de succès
    □ CTA principal : "Inviter un collègue à utiliser cette app"
    □ Input email (pré-rempli si carnet d'adresses M365 accessible)
    □ Bouton copier le lien de partage
    □ Skip possible ("Je ferai ça plus tard")

□ Utiliser les composants Untitled UI copiés localement : Button, Input, Badge, ProgressBar
    - import { Button } from '@/components/buttons'
    - import { Input } from '@/components/input'
    - import { Badge } from '@/components/badge'
    - import { ProgressBar } from '@/components/progress-bar'
□ Wrapper les étapes dans @instack/ui Container (layout: 'centered')
□ Progress bar en haut (3 dots) — Untitled UI ProgressBar/ProgressDots
□ Le flow ne se re-montre pas si déjà complété
□ Events : onboarding.started, onboarding.step_completed{1,2,3}, onboarding.completed, onboarding.skipped{step}
□ Responsive mobile
```

### TÂCHE 14.2 — Activation Checklist (Post-onboarding)
**Assigné à**: @PRISM + @WILDFIRE
**Complexité**: L

```
CHECKLIST :
□ Créer packages/web/src/components/ActivationChecklist/ActivationChecklist.tsx :
    - Widget sidebar ou banner sur le Dashboard
    - 5 étapes à compléter :
      1. ✅ Créer votre première app (fait pendant l'onboarding)
      2. □ Connecter vos données Excel
      3. □ Partager une app avec un collègue
      4. □ Personnaliser une app (modifier nom/description)
      5. □ Explorer l'App Store
    - Chaque étape complétée = check vert + confetti discret
    - Progress bar : "3/5 étapes complétées"
    - Quand 5/5 → célébration + dismiss automatique
    - Le widget disparaît après 7 jours ou 5/5
□ Backend : tracker les étapes dans user settings (JSONB)
□ Events : activation.step_completed{1-5}, activation.completed
```

### TÂCHE 14.3 — Viral Loops Implementation
**Assigné à**: @PULSE + @FORGE
**Complexité**: L

```
CHECKLIST :
□ Loop 1 — App Sharing (K-factor cible: 0.4) :
    - Quand user A partage une app → user B reçoit un email
    - Template email : "{Prénom} vous a partagé une app sur instack"
    - CTA dans l'email → ouvre l'app directement
    - Si user B n'a pas de compte → landing page avec preview + "Créer un compte"
    - Track : share.sent, share.opened, share.signup
□ Loop 2 — Template Cloning (K-factor cible: 0.2) :
    - Les apps publiques dans l'App Store sont clonables
    - "Utilisé par X personnes" social proof
    - Notification au creator original quand son app est clonée
    - Track : template.viewed, template.cloned
□ Loop 3 — Team Invitation (K-factor cible: 0.15) :
    - POST /api/invitations — Inviter par email
    - Template email d'invitation
    - L'invité rejoint le même tenant
    - Limit : 5 invitations pour le plan Free
    - Track : invitation.sent, invitation.accepted
□ Loop 4 — App Store Discovery (K-factor cible: 0.1) :
    - Déjà implémenté en S11
    - Ajouter "Créé par {nom}" clickable → profil du creator
□ Créer POST /api/invitations/bulk — Invite multiple
□ Créer POST /api/notifications — Système de notifications in-app
    - Types : app_shared, app_cloned, invitation, system
    - Bell icon dans le header avec badge count
    - Dropdown liste des notifications
    - Mark as read
```

### TÂCHE 14.4 — PQL Scoring
**Assigné à**: @CATALYST + @WILDFIRE
**Complexité**: L

```
CHECKLIST :
□ Implémenter le scoring PQL (Product Qualified Lead) :
    - Score 0-100 calculé pour chaque user/tenant
    - 10 signaux pondérés :
      1. Apps créées (×5 par app, max 25)
      2. Apps utilisées par d'autres (×10, max 30)
      3. Données connectées (×8, max 16)
      4. Jours actifs sur 14 (×2 par jour, max 28)
      5. Invitations envoyées (×3, max 9)
      6. App Store visits (×1, max 5)
      7. Pipeline retries (indique engagement) (×2, max 6)
      8. Features explorées (cockpit, export) (×2, max 10)
      9. Profile fit : Ops Manager (+10), M365 entreprise (+5)
      10. Company size : 200-1000 (+5), >1000 (+10)
    - Score calculé quotidiennement (cron)
    - Stocké dans user metadata JSONB
□ Tiers d'action :
    - 0-30 : Nurture (emails éducatifs)
    - 31-60 : Engage (proposer trial, features avancées)
    - 61-80 : Expand (contacter pour upgrade)
    - 81-100 : Close (passer à l'AE)
□ API : GET /api/admin/pql-scores — Liste des scores (admin)
□ Events : pql.score_updated, pql.tier_changed
□ Tests : calcul de score, tier assignment
```

### TÂCHE 14.5 — Email Transactional (Notifications)
**Assigné à**: @FORGE
**Complexité**: M

```
CHECKLIST :
□ Intégrer un service d'email transactionnel (Resend ou Postmark) :
    - Templates HTML/text :
      * welcome — Bienvenue sur instack
      * app_shared — {Nom} vous a partagé une app
      * invitation — Vous êtes invité à rejoindre {tenant}
      * trial_ending — Votre trial Pro expire dans X jours
      * weekly_digest — Résumé hebdomadaire d'activité
    - Tous les emails en français
    - Design sobre, logo instack, call-to-action clair
    - Unsubscribe link (RGPD obligatoire)
□ Queue d'envoi (BullMQ) — pas d'envoi synchrone
□ Tests : template rendering, queue processing
```

---

## DEFINITION OF DONE S14

- [ ] Onboarding 3 étapes fluide avec personnalisation
- [ ] Activation checklist 5 étapes avec tracking
- [ ] 4 viral loops implémentés avec tracking K-factor
- [ ] Invitation par email fonctionnel
- [ ] PQL scoring calculé quotidiennement
- [ ] Notifications in-app (bell icon + dropdown)
- [ ] Emails transactionnels (5 templates)
- [ ] Activation rate mesurable dans PostHog
- [ ] CI passe en vert

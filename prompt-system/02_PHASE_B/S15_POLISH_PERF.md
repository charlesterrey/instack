# S15 — POLISH, PERFORMANCE, ACCESSIBILITY

> **Sprint**: 15 | **Semaines**: W29-W30
> **Leads**: @PRISM (Frontend) + @MOSAIC (Design System)
> **Support**: @WATCHDOG (Performance) + @SPECTRUM (UX audit) + @NEURON (Pipeline optimization)
> **Phase**: B — "Convertir et Gouverner"

---

## OBJECTIF

Sprint de qualité pure. Pas de nouvelles features. Optimiser la performance (budgets respectés), l'accessibilité (WCAG 2.1 AA), le polish UX (animations, micro-interactions, empty states, error states), et la robustesse (edge cases, error handling). Le produit doit passer de "ça marche" à "c'est excellent".

---

## DÉPENDANCES

| Direction | Tâche | Agent |
|-----------|-------|-------|
| **Bloqué par** | S09-S14 (toutes les features Phase B) | Tous |
| **Bloque** | S16 (Launch — le produit doit être impeccable) | Tous |

---

## TÂCHES DÉTAILLÉES

### TÂCHE 15.1 — Performance Optimization
**Assigné à**: @PRISM + @WATCHDOG
**Complexité**: XL

```
CHECKLIST :
□ Frontend Performance :
    - Lighthouse score > 95 (desktop), > 85 (mobile)
    - LCP < 1.5s → optimiser :
      * Code splitting par route (React.lazy)
      * Preload des fonts Inter
      * Optimiser les images (WebP, lazy loading)
      * Critical CSS inline
    - Bundle size < 200KB gzipped → analyser avec bundle-analyzer :
      * Tree-shake recharts (n'importer que les composants utilisés)
      * Tree-shake Untitled UI
      * Dynamic import pour les composants avancés (Phase B)
    - CLS < 0.1 → fixer les layout shifts :
      * Skeleton loaders avec dimensions exactes
      * Image dimensions connues à l'avance
      * Font-display: swap
    - FID < 100ms → optimiser le JS :
      * Pas de long tasks (>50ms)
      * Defer les scripts non-critiques
      * Web Workers pour les calculs lourds (agrégations)
□ API Performance :
    - /health < 50ms ✓
    - /api/apps (list) < 200ms :
      * Index optimisés
      * Pagination efficace (cursor-based si >1000 apps)
      * Sélection de colonnes (pas de SELECT *)
    - /api/apps/:id/data < 500ms :
      * Cache KV avec TTL approprié
      * Compression gzip des réponses JSON
    - /api/generate < 5s P95 :
      * Timeout par stage
      * Streaming SSE pour le feedback en temps réel
      * Paralléliser Stage 2 (inference) pendant Stage 1 (classification)
□ Database Performance :
    - Analyser les slow queries (EXPLAIN ANALYZE)
    - Ajouter des indexes manquants
    - Optimiser les JOINs (pas de N+1)
    - Connection pooling Neon
□ Documenter : rapport de performance avant/après
```

### TÂCHE 15.2 — Accessibility Audit (WCAG 2.1 AA)
**Assigné à**: @MOSAIC + @PRISM
**Complexité**: L

```
CHECKLIST :
□ Audit automatisé :
    - Installer axe-core dans les tests
    - Chaque composant : expect(await axe(container)).toHaveNoViolations()
    - Configurer eslint-plugin-jsx-a11y
□ Audit manuel des 12 composants :
    Pour chaque composant vérifier :
    □ Contraste texte : ratio ≥ 4.5:1 (normal), ≥ 3:1 (large)
    □ Focus indicator : visible, cohérent (outline 2px primary)
    □ Keyboard navigation : Tab, Enter, Escape, Arrow keys
    □ Screen reader : tous les éléments interactifs ont un label
    □ ARIA : roles, states, properties corrects
    □ Touch targets : ≥ 44×44px sur mobile
    □ Motion : prefers-reduced-motion respecté
□ Audit des pages complètes :
    □ Login : keyboard navigable, screen reader friendly
    □ Dashboard : skip link, heading hierarchy, landmark regions
    □ Wizard : step announcements, error announcements
    □ App Store : search accessible, card navigation
    □ Cockpit DSI : tableau accessible, filtres utilisables au clavier
□ Fixer TOUTES les violations Level A et AA
□ Documenter les exceptions (Level AAA non visé)
```

### TÂCHE 15.3 — UX Polish
**Assigné à**: @SPECTRUM + @PRISM
**Complexité**: L

```
CHECKLIST :
□ Micro-interactions :
    - Boutons : feedback tactile (scale 0.98 au clic)
    - Liens : underline au hover
    - Cards : élévation shadow au hover
    - Toggles : animation slide smooth
    - Checkboxes : animation check (SVG path animation)
    - Loading buttons : spinner inline (pas de plein écran)
□ Transitions entre pages :
    - Fade-in 200ms au changement de route
    - Pas de flash blanc entre les pages
□ Empty States (pour chaque page) :
    - Dashboard vide → illustration + "Créez votre première app"
    - App Store vide → "Aucune app publiée. Soyez le premier !"
    - Data table vide → "Aucune donnée. Connectez un fichier Excel."
    - Recherche sans résultat → "Aucun résultat pour '{query}'"
□ Error States :
    - 404 → page personnalisée avec illustration
    - 500 → "Oups, quelque chose s'est mal passé" + bouton réessayer
    - Offline → banner "Vous êtes hors connexion"
    - API timeout → message explicite + retry automatique
□ Loading States :
    - Skeleton screens pour chaque section (pas de spinner générique)
    - Progressive loading : contenu apparaît section par section
    - Optimistic UI pour les actions rapides (archiver, modifier nom)
□ Notifications & Toasts :
    - Success : vert, auto-dismiss 3s
    - Error : rouge, persistant jusqu'au dismiss
    - Info : bleu, auto-dismiss 5s
    - Position : bottom-right
    - Stack : max 3 visibles simultanément
□ Dark mode preparation :
    - Vérifier que TOUTES les couleurs utilisent les CSS variables
    - Aucune couleur hardcodée (chercher avec grep)
    - Documenter les variables à overrider pour le dark mode
```

### TÂCHE 15.4 — Pipeline IA Optimization
**Assigné à**: @NEURON
**Complexité**: M

```
CHECKLIST :
□ Optimiser la latence du pipeline :
    - Paralléliser Stage 1 (classification) et le parsing Excel
    - Cacher les résultats de classification fréquents (même prompt = même résultat)
    - Réduire la taille du system prompt Stage 3 (tokens = coût + latence)
□ Améliorer le taux de succès :
    - Analyser les 10-15% d'échecs des quality gates
    - Affiner les prompts pour les cas limites
    - Ajouter des exemples few-shot dans le prompt Stage 3
    - Target : > 92% succès (vs 85% en S08)
□ Optimiser les coûts :
    - Prompt caching (si disponible sur l'API Claude)
    - Réduire les tokens inutiles dans le system prompt
    - Target : < 0.025 EUR par génération
□ Streaming SSE :
    - Implémenter le streaming du progress pipeline
    - Le frontend affiche chaque stage en temps réel
    - EventSource : /api/generate/stream
□ Re-exécuter les quality gates → documenter l'amélioration
```

### TÂCHE 15.5 — AI Feedback Loop (Dashboard AI-005)
**Assigné à**: @NEURON + @CATALYST
**Complexité**: L

```
CHECKLIST :
□ UI Feedback — Thumbs up/down sur chaque app générée :
    - Bouton 👍/👎 discret en bas de chaque app rendue
    - Optionnel : champ texte "Qu'est-ce qui ne va pas ?" (max 200 chars)
    - POST /api/feedback — { appId, rating: 'up'|'down', comment?, pipelineSnapshot }
    - Stocker le snapshot complet du pipeline (input, classification, schema, output)
□ Feedback Pipeline :
    - Table feedback (id, app_id, user_id, rating, comment, pipeline_snapshot JSONB, created_at)
    - RLS : les admins voient les feedbacks de leur tenant
    - API admin : GET /api/admin/feedback — Filtrable par rating, archetype, date
□ Analyse mensuelle des échecs :
    - Script d'analyse : grouper les feedbacks négatifs par archétype
    - Identifier les patterns : quels prompts échouent ? quels types de données ?
    - Générer un rapport : top 10 raisons d'échec
□ Auto-amélioration few-shot :
    - Les apps avec 👍 et 2+ users → candidats pour le pool few-shot
    - Workflow : review humain → ajout au few-shot library
    - Target : +5 exemples few-shot par mois, organiquement
□ Events : feedback.submitted, feedback.analyzed
□ Tests : soumission feedback, snapshot pipeline, requêtes admin
```

### TÂCHE 15.6 — Contexte Excel Enrichi & Suggestions Proactives (Dashboard AI-006)
**Assigné à**: @NEURON + @CONDUIT
**Complexité**: M

```
CHECKLIST :
□ Enrichissement du contexte Excel injecté au Stage 3 :
    - Analyser les headers Excel : détecter automatiquement les types sémantiques
      * "Date", "Montant", "Statut", "Email" → typed suggestions
      * Colonnes numériques → proposer KPICard, BarChart, LineChart
      * Colonnes catégorielles → proposer PieChart, FilterBar
      * Colonnes date → proposer LineChart avec axe temporel
    - Injecter ces suggestions dans le context du prompt Stage 3
□ Suggestions proactives dans le Wizard (S07 extension) :
    - Après upload Excel, avant la génération :
      * "Vos données contiennent des dates et montants → Dashboard recommandé"
      * "5 colonnes catégorielles détectées → Formulaire avec filtres ?"
      * "Colonne 'Statut' détectée → Kanban board possible"
    - UI : chips cliquables sous le prompt (SuggestionChip component)
    - Cliquer sur une suggestion = pré-remplir le prompt
□ Auto-détection du type d'app par les colonnes :
    - Si (date + montant + catégorie) → dashboard
    - Si (statut + assigné + date) → tracker/kanban
    - Si (nom + adresse + image) → gallery
    - Compléter les 8 règles de mapping archétype
□ Tests : détection types sémantiques, suggestions accuracy (>80%), mapping archétype
```

### TÂCHE 15.7 — Error Handling Audit
**Assigné à**: @FORGE + @PHANTOM
**Complexité**: M

```
CHECKLIST :
□ Auditer CHAQUE endpoint API :
    - Tous les erreurs ont un code, message, et type
    - Les stack traces ne sont JAMAIS exposées en production
    - Les erreurs 500 sont loggées dans Sentry avec contexte
    - Les erreurs 4xx retournent un message actionnable pour l'utilisateur
□ Auditer le frontend :
    - Error boundaries sur chaque route
    - Error boundaries sur chaque composant dans AppRenderer
    - Uncaught promise rejections → captées et loggées
    - Window.onerror → Sentry
□ Tester les scénarios de panne :
    - DB indisponible → 503 + message clair
    - Graph API indisponible → message "Microsoft ne répond pas, réessayez"
    - Claude API indisponible → message + fallback suggestions
    - Neon rate limit → 429 + retry header
```

---

## DEFINITION OF DONE S15

- [ ] Lighthouse : > 95 desktop, > 85 mobile
- [ ] Bundle : < 200KB gzipped
- [ ] LCP < 1.5s, CLS < 0.1, FID < 100ms
- [ ] API : tous les endpoints sous leurs budgets latence
- [ ] WCAG 2.1 AA : zero violation axe-core
- [ ] 12 composants keyboard-navigable
- [ ] Empty states, error states, loading states sur toutes les pages
- [ ] Pipeline : > 92% succès, < 0.025 EUR/génération
- [ ] Streaming SSE fonctionnel
- [ ] Zero couleur hardcodée (dark mode ready)
- [ ] Feedback loop : thumbs up/down + pipeline snapshot + admin dashboard
- [ ] Suggestions proactives : détection sémantique colonnes Excel → recommandations
- [ ] CI passe en vert

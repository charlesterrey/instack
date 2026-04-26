# CROSS-CUTTING — SECURITY & COMPLIANCE

> **Owner permanent**: @PHANTOM (Security) + @DIPLOMAT (Enterprise compliance)
> **Scope**: S'applique à CHAQUE sprint, CHAQUE merge, CHAQUE déploiement

---

## DIRECTIVE

La sécurité n'est pas un sprint, c'est un mode de vie. @PHANTOM review chaque PR touchant à : auth, tokens, données utilisateur, Graph API, pipeline IA, CSP headers. Aucune exception.

---

## SECURITY RED LINES (rappel — violer = blocage immédiat)

1. Le LLM ne génère JAMAIS de code exécutable arbitraire
2. Les tokens OAuth ne sont JAMAIS exposés (token proxy obligatoire)
3. RLS activé sur TOUTES les tables (zero cross-tenant leak)
4. CSP headers sur TOUTES les réponses HTTP
5. AES-256-GCM pour tout chiffrement at-rest
6. Zero données business stockées par instack (data-in-situ)

---

## CHECKLIST SECURITY PAR SPRINT

À vérifier par @PHANTOM AVANT chaque merge vers main :

```
□ AUTH & TOKENS
  □ JWT dans HttpOnly cookie (pas localStorage)
  □ Token refresh automatique transparent
  □ Token proxy pour TOUTES les interactions Graph API
  □ Aucun token dans les logs (grep -r "access_token" → 0 résultats)
  □ Aucun token dans les réponses HTTP

□ DATA ISOLATION
  □ RLS policies actives (tester avec 2 tenants)
  □ Tenant ID injecté via session variable (pas via paramètre)
  □ Zero cross-tenant data dans les réponses
  □ Audit log pour chaque action sensible

□ INPUT VALIDATION
  □ Tous les inputs validés par Zod AVANT traitement
  □ File upload : type vérifié, taille limitée (10MB)
  □ SQL injection : requêtes paramétrées (Drizzle ORM)
  □ XSS : échappement HTML dans toutes les valeurs affichées
  □ Formula injection Excel : sanitize =CMD(), =HYPERLINK()

□ HTTP SECURITY
  □ CSP header strict
  □ HSTS (Strict-Transport-Security)
  □ X-Content-Type-Options: nosniff
  □ X-Frame-Options: DENY
  □ Referrer-Policy: strict-origin-when-cross-origin
  □ CORS : origin whitelist (pas *)

□ AI PIPELINE SECURITY
  □ Stage 4 AST scan : pas de <script>, javascript:, on* handlers
  □ JSON output validé contre le schema strict
  □ Composants limités aux 12 types autorisés
  □ Pas de template literals ${} dans les strings générées
  □ Cost tracking : alerte si coût anormalement élevé (attaque par prompt)

□ INFRASTRUCTURE
  □ Secrets dans Cloudflare Workers Secrets (pas en clair)
  □ Pas de .env commité (vérifié par .gitignore)
  □ Dépendances auditées (npm audit, pas de vulnérabilités high/critical)
  □ Logs ne contiennent pas de PII (masquer emails, noms dans les logs)
```

---

## RGPD / COMPLIANCE

### Données stockées par instack :
- Nom, email, rôle (nécessaire pour le service)
- M365 tenant ID, user ID (nécessaire pour OAuth)
- App schemas JSON (pas de données business)
- Audit logs (base légale : intérêt légitime)

### Données NON stockées :
- Contenu des fichiers Excel (data-in-situ)
- Tokens OAuth en clair (chiffrés AES-256-GCM)
- Données business des clients

### Droits RGPD implémentés :
- Droit d'accès : GET /api/users/me/data-export
- Droit de suppression : DELETE /api/users/me (supprime user + apps + audit)
- Droit de portabilité : GET /api/users/me/data-export?format=json
- DPO : admin@terragrow.fr

### DPA Anthropic (condition non-négociable) :
- Vérifier que le DPA couvre le transfert EU→US
- SCCs (Standard Contractual Clauses) en place
- Pas de training sur nos données (vérifier les terms)
- Documenter dans un ADR

---

## THREAT MODEL (STRIDE)

| Menace | Risque | Mitigation | Sprint |
|--------|--------|------------|--------|
| Token leak | 9/10 | Token proxy + AES-256-GCM | S02 |
| Cross-tenant access | 9/10 | RLS + test isolation | S01+S02 |
| XSS via app générée | 8/10 | CSP strict + AST scan | S04 |
| Prompt injection | 7/10 | Constrained generation (tool_use) | S04 |
| Admin consent social eng. | 7/10 | Scope minimal + docs | S02 |
| DDoS sur pipeline IA | 6/10 | Rate limiting + cost cap | S02 |
| Formula injection Excel | 6/10 | Sanitize write-back | S09 |
| Data exfiltration via clone | 5/10 | Clone sans données (schema only) | S11 |

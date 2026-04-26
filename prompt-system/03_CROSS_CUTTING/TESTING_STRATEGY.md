# CROSS-CUTTING — TESTING STRATEGY

> **Owner**: @BLUEPRINT (TPM) + chaque ingénieur pour son domaine
> **Framework**: Vitest (unit/integration) + Playwright (E2E)
> **Target**: >80% coverage, 100% E2E pass

---

## PYRAMIDE DE TESTS

```
          ╱ E2E (Playwright) — 6 scénarios critiques
         ╱   Integration — endpoints API, pipeline complet
        ╱     Unit — fonctions pures, validators, utils
       ╱       Types — TypeScript compile = premier test
```

---

## PAR PACKAGE

### @instack/shared
- **Unit tests** : chaque Zod schema (valid + invalid inputs)
- **Coverage target** : >95%
- **Responsable** : @NEXUS

### @instack/api
- **Unit tests** : services, repositories (avec DB mock)
- **Integration tests** : chaque endpoint (Hono test client)
  - Happy path, validation errors (400), auth errors (401), not found (404), plan limits (403)
- **Coverage target** : >80%
- **Responsable** : @FORGE

### @instack/ai-pipeline
- **Unit tests** : chaque stage individuellement
- **Integration tests** : pipeline complet (4 stages)
- **Quality gates** : 100 combinaisons prompt × data → >90% success
- **Mock** : Claude API mocké en CI (pas d'appels réels)
- **Coverage target** : >85%
- **Responsable** : @NEURON

### @instack/ui
- **Unit tests** : chaque composant (render, props, events)
- **Accessibility tests** : axe-core sur chaque composant
- **Snapshot tests** : pour détecter les régressions visuelles
- **Storybook** : chaque composant, chaque variante
- **Coverage target** : >80%
- **Responsable** : @PRISM

### @instack/web
- **Unit tests** : hooks, utils, store
- **Integration tests** : pages (render + API mocks)
- **E2E tests** : 6 scénarios Playwright (définis en S08)
- **Coverage target** : >70%
- **Responsable** : @PRISM

---

## CONVENTIONS DE TEST

```typescript
// Nommage des fichiers
module.test.ts          // Tests unitaires
module.integration.ts   // Tests d'intégration
module.e2e.ts          // Tests E2E

// Structure d'un test
describe('AppService', () => {
  describe('createApp', () => {
    it('should create an app with valid input', async () => { ... });
    it('should reject if plan limit reached', async () => { ... });
    it('should audit log the creation', async () => { ... });
  });
});

// Pattern AAA (Arrange, Act, Assert)
it('should create an app', async () => {
  // Arrange
  const input = { name: 'Mon App', archetype: 'dashboard' };
  
  // Act
  const result = await appService.create(input, context);
  
  // Assert
  expect(result.isOk()).toBe(true);
  expect(result.value.name).toBe('Mon App');
});
```

---

## CI INTEGRATION

```yaml
# Chaque PR déclenche :
1. turbo typecheck    # Types compilent
2. turbo lint         # Zero warnings
3. turbo test         # Vitest (unit + integration)
4. turbo build        # Build réussit

# Merge vers main déclenche en plus :
5. E2E tests (Playwright)
6. Quality gates pipeline
7. Deploy preview
```

---

## FIXTURES & MOCKS

- `tests/fixtures/demo-data/` — 5 jeux de données JSON réalistes
- `tests/fixtures/demo-excel/` — 5 fichiers Excel correspondants
- `tests/fixtures/schemas/` — AppSchemas valides pour chaque archétype
- `tests/mocks/graph-api.ts` — Mock Microsoft Graph API
- `tests/mocks/claude-api.ts` — Mock Claude API (réponses déterministes)
- `tests/mocks/stripe.ts` — Mock Stripe API

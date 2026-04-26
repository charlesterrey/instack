/**
 * Integration tests using 10 varied Excel fixtures.
 * @CONDUIT + @NEURON — validates >90% inference accuracy across realistic datasets.
 */

import { describe, it, expect } from 'vitest';
import { inferSchema } from '../src/stages/02-infer-schema';
import {
  ALL_FIXTURES,
  FIXTURE_FR_CONTACTS,
  FIXTURE_FR_CONTACTS_EXPECTED,
  FIXTURE_SALES,
  FIXTURE_SALES_EXPECTED,
  FIXTURE_INVENTORY,
  FIXTURE_INVENTORY_EXPECTED,
  FIXTURE_PROJECTS,
  FIXTURE_PROJECTS_EXPECTED,
  FIXTURE_EMPLOYEES,
  FIXTURE_EMPLOYEES_EXPECTED,
  FIXTURE_EMPTY,
  FIXTURE_SINGLE_COL,
  FIXTURE_WIDE,
} from '../../../tests/fixtures/excel/index';

function findColumn(result: { columns: readonly { name: string; type: string }[] }, name: string) {
  return result.columns.find((c) => c.name === name);
}

describe('Fixture integration: all 10 datasets parse without error', () => {
  for (const fixture of ALL_FIXTURES) {
    it(`parses "${fixture.name}" without error`, () => {
      const result = inferSchema(fixture.data, 'multi_view');
      expect(result.ok).toBe(true);
    });
  }
});

describe('Fixture: FR Contacts', () => {
  it('detects email column', () => {
    const result = inferSchema(FIXTURE_FR_CONTACTS, 'crud_form');
    expect(result.ok).toBe(true);
    if (result.ok) {
      const col = findColumn(result.value, 'email');
      expect(col?.type).toBe('email');
    }
  });

  it('detects phone column', () => {
    const result = inferSchema(FIXTURE_FR_CONTACTS, 'crud_form');
    expect(result.ok).toBe(true);
    if (result.ok) {
      const col = findColumn(result.value, 'telephone');
      expect(col?.type).toBe('phone');
    }
  });

  it('detects date column', () => {
    const result = inferSchema(FIXTURE_FR_CONTACTS, 'crud_form');
    expect(result.ok).toBe(true);
    if (result.ok) {
      const col = findColumn(result.value, 'date_naissance');
      expect(col?.type).toBe('date');
    }
  });

  it('detects text columns for names', () => {
    const result = inferSchema(FIXTURE_FR_CONTACTS, 'crud_form');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(findColumn(result.value, 'nom')?.type).toBe('text');
      expect(findColumn(result.value, 'prenom')?.type).toBe('text');
    }
  });
});

describe('Fixture: Sales', () => {
  it('detects date column', () => {
    const result = inferSchema(FIXTURE_SALES, 'report');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(findColumn(result.value, 'date')?.type).toBe('date');
    }
  });

  it('detects monetary columns as currency or number', () => {
    const result = inferSchema(FIXTURE_SALES, 'dashboard');
    expect(result.ok).toBe(true);
    if (result.ok) {
      const montant = findColumn(result.value, 'montant_ht');
      expect(['currency', 'number']).toContain(montant?.type);
    }
  });

  it('detects enum columns (Statut, Region)', () => {
    const result = inferSchema(FIXTURE_SALES, 'report');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(findColumn(result.value, 'statut')?.type).toBe('enum');
      expect(findColumn(result.value, 'region')?.type).toBe('enum');
    }
  });
});

describe('Fixture: Inventory', () => {
  it('detects boolean column (Disponible)', () => {
    const result = inferSchema(FIXTURE_INVENTORY, 'crud_form');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(findColumn(result.value, 'disponible')?.type).toBe('boolean');
    }
  });

  it('detects percentage column', () => {
    const result = inferSchema(FIXTURE_INVENTORY, 'crud_form');
    expect(result.ok).toBe(true);
    if (result.ok) {
      const col = findColumn(result.value, 'taux_remise');
      expect(col?.type).toBe('percentage');
    }
  });

  it('detects URL column', () => {
    const result = inferSchema(FIXTURE_INVENTORY, 'crud_form');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(findColumn(result.value, 'url_fiche')?.type).toBe('url');
    }
  });
});

describe('Fixture: Projects', () => {
  it('detects date columns', () => {
    const result = inferSchema(FIXTURE_PROJECTS, 'tracker');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(findColumn(result.value, 'date_debut')?.type).toBe('date');
      expect(findColumn(result.value, 'date_fin')?.type).toBe('date');
    }
  });

  it('detects enum columns (Priorite, Statut)', () => {
    const result = inferSchema(FIXTURE_PROJECTS, 'tracker');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(findColumn(result.value, 'priorite')?.type).toBe('enum');
      expect(findColumn(result.value, 'statut')?.type).toBe('enum');
    }
  });

  it('detects percentage column (Avancement)', () => {
    const result = inferSchema(FIXTURE_PROJECTS, 'tracker');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(findColumn(result.value, 'avancement')?.type).toBe('percentage');
    }
  });
});

describe('Fixture: Employees (nullable columns)', () => {
  it('detects nullable telephone (some empty values)', () => {
    const result = inferSchema(FIXTURE_EMPLOYEES, 'crud_form');
    expect(result.ok).toBe(true);
    if (result.ok) {
      const col = findColumn(result.value, 'telephone');
      expect(col?.nullable).toBe(true);
    }
  });

  it('detects email column', () => {
    const result = inferSchema(FIXTURE_EMPLOYEES, 'crud_form');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(findColumn(result.value, 'email')?.type).toBe('email');
    }
  });
});

describe('Fixture: Edge cases', () => {
  it('handles empty dataset', () => {
    const result = inferSchema(FIXTURE_EMPTY, 'multi_view');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.columns).toHaveLength(2);
      expect(result.value.rowCount).toBe(0);
    }
  });

  it('handles single column with 100 rows', () => {
    const result = inferSchema(FIXTURE_SINGLE_COL, 'multi_view');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.columns).toHaveLength(1);
      expect(result.value.columns[0]?.type).toBe('text');
    }
  });

  it('handles 50-column wide table', () => {
    const result = inferSchema(FIXTURE_WIDE, 'multi_view');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.columns.length).toBe(50);
    }
  });
});

describe('Accuracy gate: >90% correct inference across all fixtures', () => {
  it('achieves >90% accuracy on typed columns', () => {
    const expectations: { fixture: typeof FIXTURE_FR_CONTACTS; archetype: string; expected: Record<string, string[]> }[] = [
      { fixture: FIXTURE_FR_CONTACTS, archetype: 'crud_form', expected: FIXTURE_FR_CONTACTS_EXPECTED },
      { fixture: FIXTURE_SALES, archetype: 'report', expected: FIXTURE_SALES_EXPECTED },
      { fixture: FIXTURE_INVENTORY, archetype: 'crud_form', expected: FIXTURE_INVENTORY_EXPECTED },
      { fixture: FIXTURE_PROJECTS, archetype: 'tracker', expected: FIXTURE_PROJECTS_EXPECTED },
      { fixture: FIXTURE_EMPLOYEES, archetype: 'crud_form', expected: FIXTURE_EMPLOYEES_EXPECTED },
    ];

    let totalChecks = 0;
    let correctChecks = 0;

    for (const { fixture, archetype, expected } of expectations) {
      const result = inferSchema(fixture, archetype as 'crud_form');
      expect(result.ok).toBe(true);
      if (!result.ok) continue;

      for (const [colName, acceptableTypes] of Object.entries(expected)) {
        totalChecks++;
        const col = findColumn(result.value, colName);
        if (col && acceptableTypes.includes(col.type)) {
          correctChecks++;
        }
      }
    }

    const accuracy = totalChecks > 0 ? correctChecks / totalChecks : 0;
    // Quality gate: >90%
    expect(accuracy).toBeGreaterThan(0.9);
  });
});

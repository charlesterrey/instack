/**
 * Stage 2: Schema Inference — Exhaustive Tests
 * @CONDUIT + @NEURON
 *
 * DETERMINISTIC: every test asserts exact output for exact input.
 */

import { describe, it, expect } from 'vitest';
import { inferSchema, normalizeColumnName } from '../src/stages/02-infer-schema';
import type { ExcelSheet, InferredSchema, TypedColumn, ColumnDataType } from '../src/types/pipeline.types';
import type { AppArchetype, ComponentType } from '@instack/shared';

// ═══════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════

/** Create an ExcelSheet from headers and row arrays */
function makeSheet(
  headers: string[],
  rowData: unknown[][],
  sheetName = 'Sheet1',
): ExcelSheet {
  const rows: Record<string, unknown>[] = rowData.map((values) => {
    const record: Record<string, unknown> = {};
    headers.forEach((h, i) => {
      record[h] = values[i] ?? null;
    });
    return record;
  });
  return { sheetName, headers, rows, totalRows: rowData.length };
}

/** Generate N rows with a specific value for a single column */
function makeColumnSheet(
  header: string,
  values: unknown[],
): ExcelSheet {
  return makeSheet([header], values.map((v) => [v]));
}

/** Find a column by originalName in the inferred schema */
function findColumn(schema: InferredSchema, originalName: string): TypedColumn {
  const col = schema.columns.find((c) => c.originalName === originalName);
  if (!col) throw new Error(`Column "${originalName}" not found in schema`);
  return col;
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. Typical FR Excel columns
// ═══════════════════════════════════════════════════════════════════════════

describe('inferSchema — typical FR columns', () => {
  it('infers correct types for Nom, Prenom, Email, Telephone, Date, Montant', () => {
    const sheet = makeSheet(
      ['Nom', 'Prénom', 'Email', 'Téléphone', 'Date d\'embauche', 'Montant'],
      [
        ['Dupont', 'Jean', 'jean@example.com', '06 12 34 56 78', '15/03/2024', '1500'],
        ['Martin', 'Marie', 'marie@test.fr', '06 98 76 54 32', '22/01/2023', '2300'],
        ['Bernard', 'Pierre', 'pierre@mail.com', '+33 6 11 22 33 44', '01/06/2022', '1800'],
        ['Durand', 'Sophie', 'sophie@corp.fr', '07 55 44 33 22', '10/12/2021', '3200'],
        ['Leroy', 'Paul', 'paul@email.com', '06 77 88 99 00', '05/09/2020', '2750'],
        ['Moreau', 'Claire', 'claire@web.fr', '06 22 33 44 55', '18/07/2019', '1950'],
        ['Laurent', 'Marc', 'marc@site.com', '06 44 55 66 77', '30/11/2018', '4100'],
        ['Simon', 'Anne', 'anne@mail.fr', '06 88 99 00 11', '14/02/2017', '2600'],
        ['Michel', 'Luc', 'luc@example.com', '07 11 22 33 44', '25/08/2016', '3500'],
        ['Garcia', 'Eva', 'eva@test.com', '06 33 44 55 66', '07/04/2015', '2100'],
      ],
    );

    const result = inferSchema(sheet, 'crud_form');
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const schema = result.value;
    expect(findColumn(schema, 'Nom').type).toBe('text');
    expect(findColumn(schema, 'Prénom').type).toBe('text');
    expect(findColumn(schema, 'Email').type).toBe('email');
    expect(findColumn(schema, 'Téléphone').type).toBe('phone');
    expect(findColumn(schema, 'Date d\'embauche').type).toBe('date');
    expect(findColumn(schema, 'Montant').type).toBe('currency');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. Email detection
// ═══════════════════════════════════════════════════════════════════════════

describe('inferSchema — email detection', () => {
  it('detects email column when >80% are valid emails', () => {
    const values = [
      'alice@example.com', 'bob@test.fr', 'carol@mail.com',
      'dave@corp.io', 'eve@web.org', 'frank@site.net',
      'grace@email.com', 'henry@test.com', 'iris@mail.fr', 'jack@web.com',
    ];
    const sheet = makeColumnSheet('Contact', values);
    const result = inferSchema(sheet, 'crud_form');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(findColumn(result.value, 'Contact').type).toBe('email');
  });

  it('does NOT detect email when <80% match', () => {
    const values = [
      'alice@example.com', 'bob@test.fr', 'not-an-email',
      'also not', 'nope', 'still no', 'wrong', 'bad', 'no@', 'x',
    ];
    const sheet = makeColumnSheet('Contact', values);
    const result = inferSchema(sheet, 'crud_form');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(findColumn(result.value, 'Contact').type).not.toBe('email');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. Phone detection (FR formats)
// ═══════════════════════════════════════════════════════════════════════════

describe('inferSchema — phone detection', () => {
  it('detects French phone numbers', () => {
    const values = [
      '06 12 34 56 78', '06 98 76 54 32', '+33 6 12 34 56 78',
      '07 11 22 33 44', '06 55 44 33 22', '+33 7 99 88 77 66',
      '01 23 45 67 89', '06 44 33 22 11', '06 77 66 55 44', '06 88 77 66 55',
    ];
    const sheet = makeColumnSheet('Telephone', values);
    const result = inferSchema(sheet, 'crud_form');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(findColumn(result.value, 'Telephone').type).toBe('phone');
  });

  it('detects international phone with + prefix', () => {
    const values = [
      '+33 6 12 34 56 78', '+44 20 7946 0958', '+1 555 123 4567',
      '+49 30 12345678', '+34 612 345 678', '+39 06 1234 5678',
      '+81 3 1234 5678', '+33 7 12 34 56 78', '+44 7911 123456', '+1 212 555 1234',
    ];
    const sheet = makeColumnSheet('Phone', values);
    const result = inferSchema(sheet, 'crud_form');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(findColumn(result.value, 'Phone').type).toBe('phone');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. URL detection
// ═══════════════════════════════════════════════════════════════════════════

describe('inferSchema — URL detection', () => {
  it('detects URLs starting with http/https', () => {
    const values = [
      'https://example.com', 'http://test.fr', 'https://www.google.com',
      'https://github.com/user/repo', 'http://localhost:3000',
      'https://api.example.com/v1/data', 'https://docs.google.com/spreadsheet',
      'http://intranet.corp.fr/page', 'https://app.instack.io', 'https://admin.site.com',
    ];
    const sheet = makeColumnSheet('Lien', values);
    const result = inferSchema(sheet, 'crud_form');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(findColumn(result.value, 'Lien').type).toBe('url');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. Date detection (5 formats)
// ═══════════════════════════════════════════════════════════════════════════

describe('inferSchema — date detection', () => {
  it('detects ISO 8601 dates (YYYY-MM-DD)', () => {
    const values = [
      '2024-01-15', '2023-06-22', '2022-12-01', '2021-03-10',
      '2020-08-25', '2019-11-30', '2018-04-07', '2017-09-14',
      '2016-02-18', '2015-07-05',
    ];
    const sheet = makeColumnSheet('Date', values);
    const result = inferSchema(sheet, 'crud_form');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(findColumn(result.value, 'Date').type).toBe('date');
  });

  it('detects FR dates (DD/MM/YYYY)', () => {
    const values = [
      '15/01/2024', '22/06/2023', '01/12/2022', '10/03/2021',
      '25/08/2020', '30/11/2019', '07/04/2018', '14/09/2017',
      '18/02/2016', '05/07/2015',
    ];
    const sheet = makeColumnSheet('Date', values);
    const result = inferSchema(sheet, 'crud_form');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(findColumn(result.value, 'Date').type).toBe('date');
  });

  it('detects US dates (MM/DD/YYYY)', () => {
    const values = [
      '01/15/2024', '06/22/2023', '12/01/2022', '03/10/2021',
      '08/25/2020', '11/30/2019', '04/07/2018', '09/14/2017',
      '02/18/2016', '07/05/2015',
    ];
    const sheet = makeColumnSheet('Date', values);
    const result = inferSchema(sheet, 'crud_form');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // Both FR and US regex match MM/DD/YYYY — still detects as date
    expect(findColumn(result.value, 'Date').type).toBe('date');
  });

  it('detects DD-MM-YYYY dates', () => {
    const values = [
      '15-01-2024', '22-06-2023', '01-12-2022', '10-03-2021',
      '25-08-2020', '30-11-2019', '07-04-2018', '14-09-2017',
      '18-02-2016', '05-07-2015',
    ];
    const sheet = makeColumnSheet('Date', values);
    const result = inferSchema(sheet, 'crud_form');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(findColumn(result.value, 'Date').type).toBe('date');
  });

  it('detects month name dates ("January 15, 2024")', () => {
    const values = [
      'January 15, 2024', 'February 22, 2023', 'March 1, 2022',
      'April 10, 2021', 'May 25, 2020', 'June 30, 2019',
      'July 7, 2018', 'August 14, 2017', 'September 18, 2016', 'October 5, 2015',
    ];
    const sheet = makeColumnSheet('Date', values);
    const result = inferSchema(sheet, 'crud_form');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(findColumn(result.value, 'Date').type).toBe('date');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. Boolean detection
// ═══════════════════════════════════════════════════════════════════════════

describe('inferSchema — boolean detection', () => {
  it('detects oui/non', () => {
    const values = ['oui', 'non', 'oui', 'oui', 'non', 'oui', 'non', 'non', 'oui', 'non'];
    const sheet = makeColumnSheet('Actif', values);
    const result = inferSchema(sheet, 'crud_form');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(findColumn(result.value, 'Actif').type).toBe('boolean');
  });

  it('detects true/false', () => {
    const values = ['true', 'false', 'true', 'true', 'false', 'true', 'false', 'false', 'true', 'false'];
    const sheet = makeColumnSheet('Active', values);
    const result = inferSchema(sheet, 'crud_form');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(findColumn(result.value, 'Active').type).toBe('boolean');
  });

  it('detects vrai/faux', () => {
    const values = ['vrai', 'faux', 'vrai', 'vrai', 'faux', 'vrai', 'faux', 'faux', 'vrai', 'faux'];
    const sheet = makeColumnSheet('Valide', values);
    const result = inferSchema(sheet, 'crud_form');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(findColumn(result.value, 'Valide').type).toBe('boolean');
  });

  it('detects 0/1', () => {
    const values = ['0', '1', '1', '0', '1', '0', '0', '1', '1', '0'];
    const sheet = makeColumnSheet('Flag', values);
    const result = inferSchema(sheet, 'crud_form');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(findColumn(result.value, 'Flag').type).toBe('boolean');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 7. Percentage detection
// ═══════════════════════════════════════════════════════════════════════════

describe('inferSchema — percentage detection', () => {
  it('detects values with % suffix', () => {
    const values = ['15%', '22%', '8%', '45%', '33%', '67%', '12%', '89%', '3%', '56%'];
    const sheet = makeColumnSheet('Taux', values);
    const result = inferSchema(sheet, 'crud_form');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(findColumn(result.value, 'Taux').type).toBe('percentage');
  });

  it('detects 0-1 values when header contains %', () => {
    const values = ['0.15', '0.22', '0.08', '0.45', '0.33', '0.67', '0.12', '0.89', '0.03', '0.56'];
    const sheet = makeColumnSheet('Completion %', values);
    const result = inferSchema(sheet, 'crud_form');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(findColumn(result.value, 'Completion %').type).toBe('percentage');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 8. Currency detection
// ═══════════════════════════════════════════════════════════════════════════

describe('inferSchema — currency detection', () => {
  it('detects values with EUR symbol suffix', () => {
    const values = ['15.99€', '22.50€', '8.00€', '45.99€', '33.25€', '67.80€', '12.00€', '89.99€', '3.50€', '56.75€'];
    const sheet = makeColumnSheet('Prix', values);
    const result = inferSchema(sheet, 'crud_form');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(findColumn(result.value, 'Prix').type).toBe('currency');
  });

  it('detects numeric values when header contains currency keyword', () => {
    const values = ['1500', '2300', '1800', '3200', '2750', '1950', '4100', '2600', '3500', '2100'];
    const sheet = makeColumnSheet('Montant total', values);
    const result = inferSchema(sheet, 'crud_form');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(findColumn(result.value, 'Montant total').type).toBe('currency');
  });

  it('detects $ prefix currency', () => {
    const values = ['$15.99', '$22.50', '$8.00', '$45.99', '$33.25', '$67.80', '$12.00', '$89.99', '$3.50', '$56.75'];
    const sheet = makeColumnSheet('Amount', values);
    const result = inferSchema(sheet, 'crud_form');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(findColumn(result.value, 'Amount').type).toBe('currency');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 9. Number detection
// ═══════════════════════════════════════════════════════════════════════════

describe('inferSchema — number detection', () => {
  it('detects numeric column', () => {
    const values = ['42', '3.14', '100', '-5', '0', '999.99', '7', '256', '1.5', '88'];
    const sheet = makeColumnSheet('Quantite', values);
    const result = inferSchema(sheet, 'crud_form');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(findColumn(result.value, 'Quantite').type).toBe('number');
  });

  it('handles French decimal format with commas', () => {
    const values = ['42,5', '3,14', '100,0', '5,25', '0,5', '999,99', '7,1', '256,8', '1,5', '88,3'];
    const sheet = makeColumnSheet('Valeur', values);
    const result = inferSchema(sheet, 'crud_form');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(findColumn(result.value, 'Valeur').type).toBe('number');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 10. Enum detection
// ═══════════════════════════════════════════════════════════════════════════

describe('inferSchema — enum detection', () => {
  it('detects enum column with 5 unique values and low ratio', () => {
    const statuses = ['En cours', 'Terminé', 'En attente', 'Annulé', 'Nouveau'];
    // Create 50 rows to ensure ratio < 0.3 (5/50 = 0.1)
    const values: string[] = [];
    for (let i = 0; i < 50; i++) {
      values.push(statuses[i % statuses.length]!);
    }
    const sheet = makeColumnSheet('Statut', values);
    const result = inferSchema(sheet, 'tracker');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const col = findColumn(result.value, 'Statut');
    expect(col.type).toBe('enum');
    expect(col.enumValues).toBeDefined();
    expect(col.enumValues?.length).toBe(5);
  });

  it('does NOT detect enum when unique ratio >= 0.3', () => {
    // 10 values, 5 unique → ratio 0.5 >= 0.3
    const values = ['A', 'B', 'C', 'D', 'E', 'A', 'B', 'C', 'D', 'E'];
    const sheet = makeColumnSheet('Code', values);
    const result = inferSchema(sheet, 'crud_form');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(findColumn(result.value, 'Code').type).not.toBe('enum');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 11. Text fallback
// ═══════════════════════════════════════════════════════════════════════════

describe('inferSchema — text fallback', () => {
  it('defaults to text for mixed content', () => {
    const values = [
      'Hello world', '42', 'true', 'alice@email.com', 'https://example.com',
      'Some random text', '2024-01-01', '+33 6 12 34 56 78', 'oui', '50%',
    ];
    const sheet = makeColumnSheet('Notes', values);
    const result = inferSchema(sheet, 'crud_form');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(findColumn(result.value, 'Notes').type).toBe('text');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 12. Nullable columns
// ═══════════════════════════════════════════════════════════════════════════

describe('inferSchema — nullable columns', () => {
  it('marks column as nullable when >5% values are null/empty', () => {
    // 10 values, 2 null → 20% > 5%
    const values = ['Alice', 'Bob', null, 'Dave', '', 'Frank', 'Grace', 'Henry', 'Iris', 'Jack'];
    const sheet = makeColumnSheet('Nom', values);
    const result = inferSchema(sheet, 'crud_form');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(findColumn(result.value, 'Nom').nullable).toBe(true);
  });

  it('marks column as NOT nullable when <=5% values are null', () => {
    // 20 values, 1 null → 5% = not > 5%
    const values = [
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
      'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', null,
    ];
    const sheet = makeColumnSheet('Nom', values);
    const result = inferSchema(sheet, 'crud_form');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(findColumn(result.value, 'Nom').nullable).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 13. Column name normalization
// ═══════════════════════════════════════════════════════════════════════════

describe('normalizeColumnName', () => {
  it('removes accents', () => {
    expect(normalizeColumnName('Prénom')).toBe('prenom');
    expect(normalizeColumnName('Téléphone')).toBe('telephone');
    expect(normalizeColumnName('Résumé')).toBe('resume');
    expect(normalizeColumnName('Numéro')).toBe('numero');
  });

  it('converts to snake_case', () => {
    expect(normalizeColumnName('Date de naissance')).toBe('date_de_naissance');
    expect(normalizeColumnName('First Name')).toBe('first_name');
  });

  it('replaces special chars with underscore', () => {
    expect(normalizeColumnName('Prix (€)')).toBe('prix');
    expect(normalizeColumnName('Taux (%)')).toBe('taux');
    expect(normalizeColumnName('Score/Note')).toBe('score_note');
  });

  it('collapses multiple underscores', () => {
    expect(normalizeColumnName('a   b')).toBe('a_b');
    expect(normalizeColumnName('a___b')).toBe('a_b');
  });

  it('removes leading/trailing underscores', () => {
    expect(normalizeColumnName(' Nom ')).toBe('nom');
    expect(normalizeColumnName('_test_')).toBe('test');
  });

  it('truncates to 64 characters', () => {
    const longName = 'a'.repeat(100);
    expect(normalizeColumnName(longName).length).toBeLessThanOrEqual(64);
  });

  it('handles empty string', () => {
    expect(normalizeColumnName('')).toBe('column');
  });

  it('preserves originalName in schema', () => {
    const sheet = makeColumnSheet('Prénom du Client', ['Jean']);
    const result = inferSchema(sheet, 'crud_form');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const col = findColumn(result.value, 'Prénom du Client');
    expect(col.name).toBe('prenom_du_client');
    expect(col.originalName).toBe('Prénom du Client');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 14. Empty data
// ═══════════════════════════════════════════════════════════════════════════

describe('inferSchema — empty data', () => {
  it('returns error for empty headers', () => {
    const sheet: ExcelSheet = { sheetName: 'Sheet1', headers: [], rows: [], totalRows: 0 };
    const result = inferSchema(sheet, 'crud_form');
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('EMPTY_HEADERS');
  });

  it('returns text columns for headers with no data rows', () => {
    const sheet: ExcelSheet = {
      sheetName: 'Sheet1',
      headers: ['Nom', 'Email'],
      rows: [],
      totalRows: 0,
    };
    const result = inferSchema(sheet, 'crud_form');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.columns.length).toBe(2);
    expect(result.value.columns[0]!.type).toBe('text');
    expect(result.value.columns[1]!.type).toBe('text');
    expect(result.value.columns[0]!.nullable).toBe(true);
    expect(result.value.rowCount).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 15. Single row
// ═══════════════════════════════════════════════════════════════════════════

describe('inferSchema — single row', () => {
  it('infers types from a single data row', () => {
    const sheet = makeSheet(
      ['Email', 'Age'],
      [['test@example.com', '25']],
    );
    const result = inferSchema(sheet, 'crud_form');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(findColumn(result.value, 'Email').type).toBe('email');
    expect(findColumn(result.value, 'Age').type).toBe('number');
    expect(result.value.rowCount).toBe(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 16. >100 columns
// ═══════════════════════════════════════════════════════════════════════════

describe('inferSchema — many columns', () => {
  it('handles >100 columns without error', () => {
    const headers = Array.from({ length: 120 }, (_, i) => `Col_${i}`);
    const rowData = Array.from({ length: 5 }, () =>
      Array.from({ length: 120 }, (_, i) => `value_${i}`),
    );
    const sheet = makeSheet(headers, rowData);
    const result = inferSchema(sheet, 'crud_form');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.columns.length).toBe(120);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 17. Component suggestion per archetype
// ═══════════════════════════════════════════════════════════════════════════

describe('inferSchema — component suggestions', () => {
  const simpleSheet = makeColumnSheet('Nom', ['Alice', 'Bob', 'Carol', 'Dave', 'Eve']);

  const archetypeExpectedComponents: Record<AppArchetype, readonly ComponentType[]> = {
    crud_form: ['form_field', 'data_table', 'filter_bar', 'container'],
    dashboard: ['kpi_card', 'bar_chart', 'filter_bar', 'container'],
    tracker: ['data_table', 'filter_bar', 'container'],
    report: ['data_table', 'bar_chart', 'filter_bar', 'container'],
    approval: ['form_field', 'data_table', 'container'],
    checklist: ['form_field', 'data_table', 'container'],
    gallery: ['data_table', 'filter_bar', 'container'],
    multi_view: ['data_table', 'form_field', 'kpi_card', 'container'],
  };

  for (const [archetype, expected] of Object.entries(archetypeExpectedComponents)) {
    it(`suggests correct components for ${archetype}`, () => {
      const result = inferSchema(simpleSheet, archetype as AppArchetype);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.suggestedComponents).toEqual(expected);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// 18. Sample values
// ═══════════════════════════════════════════════════════════════════════════

describe('inferSchema — sample values', () => {
  it('stores up to 5 representative sample values', () => {
    const values = Array.from({ length: 20 }, (_, i) => `item_${i}`);
    const sheet = makeColumnSheet('Items', values);
    const result = inferSchema(sheet, 'crud_form');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const col = findColumn(result.value, 'Items');
    expect(col.sampleValues.length).toBe(5);
  });

  it('stores all values when fewer than 5', () => {
    const values = ['A', 'B', 'C'];
    const sheet = makeColumnSheet('Items', values);
    const result = inferSchema(sheet, 'crud_form');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const col = findColumn(result.value, 'Items');
    expect(col.sampleValues.length).toBe(3);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 19. Determinism — same input = same output
// ═══════════════════════════════════════════════════════════════════════════

describe('inferSchema — determinism', () => {
  it('produces identical output for identical input', () => {
    const sheet = makeSheet(
      ['Email', 'Statut', 'Montant'],
      [
        ['alice@test.com', 'Actif', '100'],
        ['bob@test.com', 'Inactif', '200'],
        ['carol@test.com', 'Actif', '300'],
        ['dave@test.com', 'Inactif', '100'],
        ['eve@test.com', 'Actif', '200'],
        ['frank@test.com', 'Inactif', '300'],
        ['grace@test.com', 'Actif', '100'],
        ['henry@test.com', 'Inactif', '200'],
        ['iris@test.com', 'Actif', '300'],
        ['jack@test.com', 'Inactif', '100'],
      ],
    );

    const result1 = inferSchema(sheet, 'dashboard');
    const result2 = inferSchema(sheet, 'dashboard');

    expect(result1).toEqual(result2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 20. Row count reflects totalRows
// ═══════════════════════════════════════════════════════════════════════════

describe('inferSchema — rowCount', () => {
  it('uses totalRows from ExcelSheet, not sample size', () => {
    const sheet: ExcelSheet = {
      sheetName: 'Sheet1',
      headers: ['Nom'],
      rows: [{ Nom: 'Alice' }, { Nom: 'Bob' }],
      totalRows: 5000,
    };
    const result = inferSchema(sheet, 'crud_form');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.rowCount).toBe(5000);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 21. Enum values are sorted
// ═══════════════════════════════════════════════════════════════════════════

describe('inferSchema — enum values sorted', () => {
  it('returns enum values in alphabetical order', () => {
    const statuses = ['Zebra', 'Alpha', 'Mango', 'Beta', 'Omega'];
    const values: string[] = [];
    for (let i = 0; i < 50; i++) {
      values.push(statuses[i % statuses.length]!);
    }
    const sheet = makeColumnSheet('Category', values);
    const result = inferSchema(sheet, 'tracker');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const col = findColumn(result.value, 'Category');
    expect(col.type).toBe('enum');
    expect(col.enumValues).toEqual(['Alpha', 'Beta', 'Mango', 'Omega', 'Zebra']);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 22. Currency keyword detection with accented headers
// ═══════════════════════════════════════════════════════════════════════════

describe('inferSchema — currency with accented header', () => {
  it('detects currency when header contains "coût" (accented)', () => {
    const values = ['150', '230', '180', '320', '275', '195', '410', '260', '350', '210'];
    const sheet = makeColumnSheet('Coût unitaire', values);
    const result = inferSchema(sheet, 'crud_form');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(findColumn(result.value, 'Coût unitaire').type).toBe('currency');
  });
});

/**
 * Tests for Sync Engine Service — pure function unit tests.
 *
 * Tests cover: computeContentHash, parseExcelUsedRange, inferColumnsFromRows.
 * syncDataSource is NOT tested here (requires DB + Graph API mocking).
 *
 * @agent @CONDUIT — Integration Engineer
 * @sprint S06 — Excel Sync
 */

import { describe, it, expect } from 'vitest';
import {
  computeContentHash,
  parseExcelUsedRange,
  inferColumnsFromRows,
} from '../src/services/sync-engine.service';
import type { CachedColumn } from '../src/services/sync-engine.service';

// ---------------------------------------------------------------------------
// computeContentHash
// ---------------------------------------------------------------------------

describe('computeContentHash', () => {
  it('produces a 64-character hex string (SHA-256)', async () => {
    const hash = await computeContentHash('hello world');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('returns the same hash for the same input', async () => {
    const input = 'deterministic input for hashing test';
    const hash1 = await computeContentHash(input);
    const hash2 = await computeContentHash(input);
    expect(hash1).toBe(hash2);
  });

  it('returns different hashes for different inputs', async () => {
    const hashA = await computeContentHash('input A');
    const hashB = await computeContentHash('input B');
    expect(hashA).not.toBe(hashB);
  });
});

// ---------------------------------------------------------------------------
// parseExcelUsedRange
// ---------------------------------------------------------------------------

describe('parseExcelUsedRange', () => {
  it('extracts headers from the first row of values', () => {
    const rangeData = {
      values: [
        ['Name', 'Age', 'City'],
        ['Alice', 30, 'Paris'],
      ],
    };
    const result = parseExcelUsedRange(rangeData);
    expect(result.headers).toEqual(['Name', 'Age', 'City']);
  });

  it('converts data rows to Record<string, unknown>[] keyed by headers', () => {
    const rangeData = {
      values: [
        ['Name', 'Age'],
        ['Alice', 30],
        ['Bob', 25],
      ],
    };
    const result = parseExcelUsedRange(rangeData);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toEqual({ Name: 'Alice', Age: 30 });
    expect(result.rows[1]).toEqual({ Name: 'Bob', Age: 25 });
  });

  it('returns empty headers and rows for an empty values array', () => {
    const result = parseExcelUsedRange({ values: [] });
    expect(result.headers).toEqual([]);
    expect(result.rows).toEqual([]);
  });

  it('returns empty headers and rows when values is missing', () => {
    const result = parseExcelUsedRange({});
    expect(result.headers).toEqual([]);
    expect(result.rows).toEqual([]);
  });

  it('returns empty headers and rows for non-object input', () => {
    const result = parseExcelUsedRange(null);
    expect(result.headers).toEqual([]);
    expect(result.rows).toEqual([]);
  });

  it('handles a single row (headers only, no data rows)', () => {
    const rangeData = {
      values: [['Col1', 'Col2', 'Col3']],
    };
    const result = parseExcelUsedRange(rangeData);
    expect(result.headers).toEqual(['Col1', 'Col2', 'Col3']);
    expect(result.rows).toEqual([]);
  });

  it('trims whitespace from header names', () => {
    const rangeData = {
      values: [
        ['  Name  ', ' Age'],
        ['Alice', 30],
      ],
    };
    const result = parseExcelUsedRange(rangeData);
    expect(result.headers).toEqual(['Name', 'Age']);
    expect(result.rows[0]).toEqual({ Name: 'Alice', Age: 30 });
  });

  it('sets null for missing cell values in data rows', () => {
    const rangeData = {
      values: [
        ['A', 'B', 'C'],
        ['x'],
      ],
    };
    const result = parseExcelUsedRange(rangeData);
    expect(result.rows[0]).toEqual({ A: 'x', B: null, C: null });
  });
});

// ---------------------------------------------------------------------------
// inferColumnsFromRows
// ---------------------------------------------------------------------------

describe('inferColumnsFromRows', () => {
  it('detects number columns when all values are numeric', () => {
    const headers = ['Amount'];
    const rows = [{ Amount: 100 }, { Amount: 200.5 }, { Amount: 0 }];
    const columns = inferColumnsFromRows(headers, rows);
    expect(columns).toHaveLength(1);
    expect(columns[0]?.type).toBe('number');
  });

  it('detects number columns from numeric string values', () => {
    const headers = ['Price'];
    const rows = [{ Price: '9.99' }, { Price: '42' }, { Price: '0.01' }];
    const columns = inferColumnsFromRows(headers, rows);
    expect(columns[0]?.type).toBe('number');
  });

  it('detects date columns for ISO 8601 formatted strings', () => {
    const headers = ['Created'];
    const rows = [
      { Created: '2024-01-15' },
      { Created: '2024-06-30T14:30:00Z' },
      { Created: '2024-12-25T08:00:00+02:00' },
    ];
    const columns = inferColumnsFromRows(headers, rows);
    expect(columns[0]?.type).toBe('date');
  });

  it('detects date columns for common date patterns (dd/mm/yyyy)', () => {
    const headers = ['Birthday'];
    const rows = [
      { Birthday: '15/01/2024' },
      { Birthday: '30-06-2024' },
    ];
    const columns = inferColumnsFromRows(headers, rows);
    expect(columns[0]?.type).toBe('date');
  });

  it('defaults to text for mixed data types', () => {
    const headers = ['Notes'];
    const rows = [
      { Notes: 'hello' },
      { Notes: 42 },
      { Notes: '2024-01-01' },
    ];
    const columns = inferColumnsFromRows(headers, rows);
    expect(columns[0]?.type).toBe('text');
  });

  it('defaults to text when no non-null samples exist (empty rows)', () => {
    const headers = ['Empty'];
    const rows: Record<string, unknown>[] = [];
    const columns = inferColumnsFromRows(headers, rows);
    expect(columns[0]?.type).toBe('text');
  });

  it('defaults to text when all values are null', () => {
    const headers = ['Blank'];
    const rows = [{ Blank: null }, { Blank: null }];
    const columns = inferColumnsFromRows(headers, rows);
    expect(columns[0]?.type).toBe('text');
  });

  it('sets nullable to true when at least one null/empty value exists', () => {
    const headers = ['Score'];
    const rows = [{ Score: 100 }, { Score: null }, { Score: 50 }];
    const columns = inferColumnsFromRows(headers, rows);
    expect(columns[0]?.nullable).toBe(true);
  });

  it('sets nullable to false when all values are present', () => {
    const headers = ['Score'];
    const rows = [{ Score: 10 }, { Score: 20 }, { Score: 30 }];
    const columns = inferColumnsFromRows(headers, rows);
    expect(columns[0]?.nullable).toBe(false);
  });

  it('sanitizes column names to lowercase with underscores', () => {
    const headers = ['First Name', 'Total $$$', 'Date (ISO)'];
    const rows = [{ 'First Name': 'Alice', 'Total $$$': 100, 'Date (ISO)': '2024-01-01' }];
    const columns = inferColumnsFromRows(headers, rows);

    // Check sanitized names
    expect(columns[0]?.name).toBe('first_name');
    expect(columns[0]?.originalName).toBe('First Name');
    expect(columns[1]?.name).toBe('total');
    expect(columns[2]?.name).toBe('date_iso');
  });

  it('filters out empty headers', () => {
    const headers = ['Name', '', 'Age'];
    const rows = [{ Name: 'Alice', '': 'hidden', Age: 30 }];
    const columns = inferColumnsFromRows(headers, rows);
    expect(columns).toHaveLength(2);
    expect(columns.map((c: CachedColumn) => c.originalName)).toEqual(['Name', 'Age']);
  });

  it('handles multiple columns with mixed types correctly', () => {
    const headers = ['ID', 'Name', 'Score', 'Joined'];
    const rows = [
      { ID: 1, Name: 'Alice', Score: 95.5, Joined: '2024-01-10' },
      { ID: 2, Name: 'Bob', Score: null, Joined: '2024-03-22' },
      { ID: 3, Name: 'Charlie', Score: 88, Joined: '2024-07-01' },
    ];
    const columns = inferColumnsFromRows(headers, rows);
    expect(columns).toHaveLength(4);
    expect(columns[0]?.type).toBe('number');   // ID
    expect(columns[1]?.type).toBe('text');     // Name
    expect(columns[2]?.type).toBe('number');   // Score
    expect(columns[2]?.nullable).toBe(true);   // Score has null
    expect(columns[3]?.type).toBe('date');     // Joined
  });
});

/**
 * Excel/CSV parser — wraps SheetJS (xlsx) for instack pipeline.
 * @CONDUIT owns this file.
 *
 * Supports: .xlsx, .xls, .csv
 * Limits: 1000 rows max, first sheet used for multi-sheet workbooks.
 */

import type { Result } from '@instack/shared';
import { ok, err } from '@instack/shared';
import * as XLSX from 'xlsx';
import type { ExcelSheet } from '../types/pipeline.types';
import type { SchemaInferenceError } from '../errors';
import { schemaInferenceError } from '../errors';

/** Maximum rows to extract from a sheet */
const MAX_ROWS = 1000;

/**
 * Parse an Excel buffer (.xlsx, .xls) into an ExcelSheet.
 * Uses first sheet. Detects headers (skips empty first row if present).
 * Skips merged cells by treating them as normal cells (SheetJS unmerges).
 */
export function parseExcelBuffer(
  buffer: ArrayBuffer,
): Result<ExcelSheet, SchemaInferenceError> {
  try {
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });

    const firstSheetName = workbook.SheetNames[0];
    if (firstSheetName === undefined) {
      return err(schemaInferenceError(
        'NO_SHEETS',
        'Workbook contains no sheets.',
        false,
      ));
    }

    const sheet = workbook.Sheets[firstSheetName];
    if (sheet === undefined) {
      return err(schemaInferenceError(
        'SHEET_NOT_FOUND',
        `Sheet "${firstSheetName}" not found in workbook.`,
        false,
      ));
    }

    return parseSheet(sheet, firstSheetName);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return err(schemaInferenceError(
      'PARSE_ERROR',
      `Failed to parse Excel buffer: ${message}`,
      false,
    ));
  }
}

/**
 * Parse a CSV string into an ExcelSheet.
 */
export function parseCSVString(
  csv: string,
): Result<ExcelSheet, SchemaInferenceError> {
  if (csv.trim() === '') {
    return err(schemaInferenceError(
      'EMPTY_CSV',
      'CSV string is empty.',
      true,
    ));
  }

  try {
    const workbook = XLSX.read(csv, { type: 'string', cellDates: true });

    const firstSheetName = workbook.SheetNames[0];
    if (firstSheetName === undefined) {
      return err(schemaInferenceError(
        'NO_SHEETS',
        'Parsed CSV contains no sheets.',
        false,
      ));
    }

    const sheet = workbook.Sheets[firstSheetName];
    if (sheet === undefined) {
      return err(schemaInferenceError(
        'SHEET_NOT_FOUND',
        `Sheet "${firstSheetName}" not found.`,
        false,
      ));
    }

    return parseSheet(sheet, firstSheetName);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return err(schemaInferenceError(
      'PARSE_ERROR',
      `Failed to parse CSV: ${message}`,
      false,
    ));
  }
}

/**
 * Internal: parse a single XLSX.WorkSheet into ExcelSheet.
 * Handles headers on line 2+ by detecting empty first row.
 */
function parseSheet(
  sheet: XLSX.WorkSheet,
  sheetName: string,
): Result<ExcelSheet, SchemaInferenceError> {
  // Convert to array of arrays to detect empty first row
  const rawData: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: null,
    blankrows: false,
  }) as unknown[][];

  if (rawData.length === 0) {
    return err(schemaInferenceError(
      'EMPTY_SHEET',
      `Sheet "${sheetName}" is empty.`,
      true,
    ));
  }

  // Detect header row: skip empty first rows
  let headerRowIndex = 0;
  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (row !== undefined && row.some((cell) => cell !== null && cell !== undefined && String(cell).trim() !== '')) {
      headerRowIndex = i;
      break;
    }
  }

  const headerRow = rawData[headerRowIndex];
  if (headerRow === undefined || headerRow.length === 0) {
    return err(schemaInferenceError(
      'NO_HEADERS',
      `Sheet "${sheetName}" has no valid header row.`,
      true,
    ));
  }

  // Build headers, replacing empty headers with "column_N"
  const headers: string[] = headerRow.map((cell, idx) => {
    if (cell === null || cell === undefined || String(cell).trim() === '') {
      return `column_${idx + 1}`;
    }
    return String(cell).trim();
  });

  // Build rows as Record<string, unknown>
  const dataRows = rawData.slice(headerRowIndex + 1);
  const limitedRows = dataRows.slice(0, MAX_ROWS);

  const rows: Record<string, unknown>[] = limitedRows.map((rawRow) => {
    const record: Record<string, unknown> = {};
    headers.forEach((header, idx) => {
      const value = rawRow[idx];
      // Convert Date objects to ISO strings for consistency
      if (value instanceof Date) {
        record[header] = value.toISOString().split('T')[0] ?? value.toISOString();
      } else {
        record[header] = value ?? null;
      }
    });
    return record;
  });

  // Total rows = all data rows (not limited)
  const totalRows = dataRows.length;

  return ok({
    sheetName,
    headers,
    rows,
    totalRows,
  });
}

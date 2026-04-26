/**
 * useDataAggregation — Hook for computing aggregate values from row data.
 * @PRISM + @NEURON own this file.
 *
 * Used by AppRenderer to resolve data bindings with transforms.
 * Pure computation — no side effects.
 */

import { useMemo } from 'react';

export type AggregateTransform =
  | 'count'
  | 'sum'
  | 'avg'
  | 'min'
  | 'max'
  | 'distinct'
  | 'latest'
  | 'first'
  | 'group_by';

export interface AggregationResult {
  count: (column?: string) => number;
  sum: (column: string) => number;
  avg: (column: string) => number;
  min: (column: string) => number;
  max: (column: string) => number;
  distinct: (column: string) => number;
  latest: (column: string) => unknown;
  first: (column: string) => unknown;
  group_by: (column: string) => Record<string, number>;
  resolve: (column: string, transform: string) => unknown;
}

function extractNumericValues(
  data: readonly Record<string, unknown>[],
  column: string,
): number[] {
  return data
    .map((row) => row[column])
    .filter((v) => v != null)
    .map(Number)
    .filter((n) => !isNaN(n));
}

function extractValues(
  data: readonly Record<string, unknown>[],
  column: string,
): unknown[] {
  return data.map((row) => row[column]).filter((v) => v != null);
}

export function useDataAggregation(
  data: readonly Record<string, unknown>[],
): AggregationResult {
  return useMemo(() => {
    const count = (column?: string): number => {
      if (!column) return data.length;
      return data.filter((row) => row[column] != null).length;
    };

    const sum = (column: string): number => {
      return extractNumericValues(data, column).reduce((a, b) => a + b, 0);
    };

    const avg = (column: string): number => {
      const nums = extractNumericValues(data, column);
      return nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
    };

    const min = (column: string): number => {
      const nums = extractNumericValues(data, column);
      return nums.length > 0 ? Math.min(...nums) : 0;
    };

    const max = (column: string): number => {
      const nums = extractNumericValues(data, column);
      return nums.length > 0 ? Math.max(...nums) : 0;
    };

    const distinct = (column: string): number => {
      return new Set(extractValues(data, column).map(String)).size;
    };

    const latest = (column: string): unknown => {
      const vals = extractValues(data, column);
      return vals.length > 0 ? vals[vals.length - 1] : null;
    };

    const first = (column: string): unknown => {
      const vals = extractValues(data, column);
      return vals.length > 0 ? vals[0] : null;
    };

    const group_by = (column: string): Record<string, number> => {
      const result: Record<string, number> = {};
      for (const row of data) {
        const key = String(row[column] ?? 'null');
        result[key] = (result[key] ?? 0) + 1;
      }
      return result;
    };

    const resolve = (column: string, transform: string): unknown => {
      switch (transform) {
        case 'count': return count(column);
        case 'sum': return sum(column);
        case 'avg': return avg(column);
        case 'min': return min(column);
        case 'max': return max(column);
        case 'distinct': return distinct(column);
        case 'latest': return latest(column);
        case 'first': return first(column);
        case 'group_by': return group_by(column);
        default: return extractValues(data, column);
      }
    };

    return { count, sum, avg, min, max, distinct, latest, first, group_by, resolve };
  }, [data]);
}

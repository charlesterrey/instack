/**
 * DataTable — Production-ready data table with sort, pagination, search, selection.
 * @PRISM owns this file. @MOSAIC reviews design system compliance.
 *
 * Supports 6 column types with specialized rendering.
 * Client-side sort, pagination, and global search.
 * Accessible table markup with proper ARIA.
 */

import { useState, useMemo, useCallback } from 'react';
import type { ReactNode, ChangeEvent } from 'react';

export interface ColumnDef {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'badge' | 'avatar' | 'actions';
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, row: Record<string, unknown>) => ReactNode;
}

export interface DataTableProps {
  id: string;
  columns: ColumnDef[];
  data: Record<string, unknown>[];
  sortable?: boolean;
  filterable?: boolean;
  pagination?: { pageSize: number; totalItems: number };
  selectable?: boolean;
  onRowClick?: (row: Record<string, unknown>) => void;
  emptyState?: ReactNode;
  loading?: boolean;
}

type SortDir = 'asc' | 'desc' | null;

interface SortState {
  key: string | null;
  direction: SortDir;
}

/** Format numbers with FR locale (1 234,56) */
function formatNumber(value: unknown): string {
  const num = Number(value);
  if (isNaN(num)) return String(value ?? '');
  return new Intl.NumberFormat('fr-FR').format(num);
}

/** Format date as DD/MM/YYYY */
function formatDate(value: unknown): string {
  if (!value) return '';
  const date = new Date(String(value));
  if (isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

/** Badge color mapping for common status values */
const BADGE_COLORS: Record<string, string> = {
  actif: 'bg-green-50 text-green-700 ring-green-200',
  active: 'bg-green-50 text-green-700 ring-green-200',
  inactif: 'bg-red-50 text-red-700 ring-red-200',
  inactive: 'bg-red-50 text-red-700 ring-red-200',
  en_cours: 'bg-yellow-50 text-yellow-700 ring-yellow-200',
  pending: 'bg-yellow-50 text-yellow-700 ring-yellow-200',
  termine: 'bg-green-50 text-green-700 ring-green-200',
  completed: 'bg-green-50 text-green-700 ring-green-200',
  annule: 'bg-red-50 text-red-700 ring-red-200',
  cancelled: 'bg-red-50 text-red-700 ring-red-200',
};

function getBadgeClasses(value: string): string {
  const key = value.toLowerCase().replace(/[\s-]/g, '_');
  return BADGE_COLORS[key] ?? 'bg-gray-50 text-gray-700 ring-gray-200';
}

/** Get initials from a name for avatar fallback */
function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');
}

/** Render a cell value based on column type */
function renderCellValue(value: unknown, column: ColumnDef, row: Record<string, unknown>): ReactNode {
  if (column.render) {
    return column.render(value, row);
  }

  const strValue = value == null ? '' : String(value);

  switch (column.type) {
    case 'number':
      return <span className="tabular-nums">{formatNumber(value)}</span>;

    case 'date':
      return <span>{formatDate(value)}</span>;

    case 'badge':
      return (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${getBadgeClasses(strValue)}`}
        >
          {strValue}
        </span>
      );

    case 'avatar':
      return (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-medium text-brand-700">
            {getInitials(strValue)}
          </div>
          <span className="text-sm">{strValue}</span>
        </div>
      );

    case 'actions':
      return null;

    case 'text':
    default:
      if (strValue.length > 50) {
        return (
          <span title={strValue} className="cursor-default">
            {strValue.slice(0, 50)}...
          </span>
        );
      }
      return <span>{strValue}</span>;
  }
}

/** Compare two values for sorting */
function compareValues(a: unknown, b: unknown, type: string): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;

  if (type === 'number') {
    return Number(a) - Number(b);
  }
  if (type === 'date') {
    return new Date(String(a)).getTime() - new Date(String(b)).getTime();
  }
  return String(a).localeCompare(String(b), 'fr');
}

/** Skeleton row for loading state */
function SkeletonRow({ colCount }: { colCount: number }): ReactNode {
  return (
    <tr>
      {Array.from({ length: colCount }, (_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 animate-pulse rounded bg-gray-200" />
        </td>
      ))}
    </tr>
  );
}

export function DataTable(props: DataTableProps): ReactNode {
  const {
    id,
    columns,
    data,
    sortable = false,
    filterable = false,
    pagination,
    selectable = false,
    onRowClick,
    emptyState,
    loading = false,
  } = props;

  const [sort, setSort] = useState<SortState>({ key: null, direction: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  const pageSize = pagination?.pageSize ?? data.length;

  // Filter data by search query
  const filteredData = useMemo(() => {
    if (!filterable || !searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val = row[col.key];
        return val != null && String(val).toLowerCase().includes(query);
      }),
    );
  }, [data, columns, filterable, searchQuery]);

  // Sort filtered data
  const sortedData = useMemo(() => {
    if (!sort.key || !sort.direction) return filteredData;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return filteredData;

    const sortKey = sort.key;
    const sorted = [...filteredData].sort((a, b) =>
      compareValues(a[sortKey as string], b[sortKey as string], col.type),
    );

    return sort.direction === 'desc' ? sorted.reverse() : sorted;
  }, [filteredData, sort, columns]);

  // Paginate
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const start = currentPage * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = pagination ? Math.ceil(sortedData.length / pageSize) : 1;

  const handleSort = useCallback(
    (key: string) => {
      if (!sortable) return;
      const col = columns.find((c) => c.key === key);
      if (!col?.sortable && !sortable) return;

      setSort((prev) => {
        if (prev.key !== key) return { key, direction: 'asc' };
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        return { key: null, direction: null };
      });
    },
    [sortable, columns],
  );

  const handleSelectAll = useCallback(() => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedData.map((_, i) => currentPage * pageSize + i)));
    }
  }, [selectedRows, paginatedData, currentPage, pageSize]);

  const handleSelectRow = useCallback(
    (index: number) => {
      const globalIndex = currentPage * pageSize + index;
      setSelectedRows((prev) => {
        const next = new Set(prev);
        if (next.has(globalIndex)) {
          next.delete(globalIndex);
        } else {
          next.add(globalIndex);
        }
        return next;
      });
    },
    [currentPage, pageSize],
  );

  // Loading skeleton
  if (loading) {
    return (
      <div data-component="DataTable" data-id={id} className="overflow-hidden rounded-xl border border-border-secondary">
        <table className="w-full" role="table">
          <thead className="bg-bg-secondary">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left text-xs font-medium uppercase text-text-tertiary">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }, (_, i) => (
              <SkeletonRow key={i} colCount={columns.length} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Empty state
  if (data.length === 0 && !loading) {
    return (
      <div
        data-component="DataTable"
        data-id={id}
        className="flex flex-col items-center justify-center rounded-xl border border-border-secondary py-12"
      >
        {emptyState ?? (
          <>
            <div className="mb-2 text-4xl">📋</div>
            <p className="text-sm text-text-tertiary">Aucune donnee</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div data-component="DataTable" data-id={id} className="flex flex-col gap-3">
      {/* Search bar */}
      {filterable && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full max-w-xs rounded-lg border border-border-primary bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setSearchQuery(e.target.value);
              setCurrentPage(0);
            }}
            aria-label="Rechercher dans le tableau"
          />
          {searchQuery && (
            <span className="text-xs text-text-tertiary">
              {sortedData.length} resultat{sortedData.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border-secondary">
        <table className="w-full" role="table" aria-label="Tableau de donnees">
          <thead className="bg-bg-secondary">
            <tr>
              {selectable && (
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border-primary text-brand-500"
                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                    onChange={handleSelectAll}
                    aria-label="Tout selectionner"
                  />
                </th>
              )}
              {columns.map((col) => {
                const isSortable = sortable || col.sortable;
                const isSorted = sort.key === col.key;
                return (
                  <th
                    key={col.key}
                    className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary ${
                      isSortable ? 'cursor-pointer select-none hover:text-text-primary' : ''
                    }`}
                    style={col.width ? { width: col.width } : undefined}
                    onClick={isSortable ? () => handleSort(col.key) : undefined}
                    aria-sort={isSorted ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {isSorted && (
                        <span className="text-text-primary">
                          {sort.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-secondary bg-bg-primary">
            {paginatedData.map((row, rowIndex) => {
              const globalIndex = currentPage * pageSize + rowIndex;
              const isSelected = selectedRows.has(globalIndex);
              return (
                <tr
                  key={rowIndex}
                  className={`transition-colors ${
                    onRowClick ? 'cursor-pointer hover:bg-bg-secondary' : ''
                  } ${isSelected ? 'bg-brand-50' : ''}`}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-border-primary text-brand-500"
                        checked={isSelected}
                        onChange={() => handleSelectRow(rowIndex)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Selectionner ligne ${rowIndex + 1}`}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className="whitespace-nowrap px-4 py-3 text-sm text-text-primary">
                      {renderCellValue(row[col.key], col, row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-sm text-text-tertiary">
            Page {currentPage + 1} sur {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg border border-border-primary px-3 py-1.5 text-sm text-text-secondary hover:bg-bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Precedent
            </button>
            <button
              type="button"
              className="rounded-lg border border-border-primary px-3 py-1.5 text-sm text-text-secondary hover:bg-bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Selection count */}
      {selectable && selectedRows.size > 0 && (
        <div className="text-sm text-text-tertiary">
          {selectedRows.size} ligne{selectedRows.size > 1 ? 's' : ''} selectionnee{selectedRows.size > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

/**
 * DataTable — Production-ready data table with sort, pagination, search, selection.
 * @PRISM owns this file. @MOSAIC reviews design system compliance.
 *
 * Uses Untitled UI Table design patterns:
 * - Card wrapper with rounded-xl, shadow-xs, ring-1 ring-secondary
 * - Semantic token classes (text-primary, bg-secondary, etc.)
 * - Badge: bg-utility-{color}-50 text-utility-{color}-700 ring-utility-{color}-200
 * - Avatar: bg-tertiary circle with initials in text-quaternary
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

/** Badge color mapping using Untitled UI utility token pattern */
const BADGE_COLORS: Record<string, string> = {
  actif: 'bg-utility-green-50 text-utility-green-700 ring-utility-green-200',
  active: 'bg-utility-green-50 text-utility-green-700 ring-utility-green-200',
  inactif: 'bg-utility-red-50 text-utility-red-700 ring-utility-red-200',
  inactive: 'bg-utility-red-50 text-utility-red-700 ring-utility-red-200',
  en_cours: 'bg-utility-yellow-50 text-utility-yellow-700 ring-utility-yellow-200',
  pending: 'bg-utility-yellow-50 text-utility-yellow-700 ring-utility-yellow-200',
  termine: 'bg-utility-green-50 text-utility-green-700 ring-utility-green-200',
  completed: 'bg-utility-green-50 text-utility-green-700 ring-utility-green-200',
  annule: 'bg-utility-red-50 text-utility-red-700 ring-utility-red-200',
  cancelled: 'bg-utility-red-50 text-utility-red-700 ring-utility-red-200',
};

function getBadgeClasses(value: string): string {
  const key = value.toLowerCase().replace(/[\s-]/g, '_');
  return BADGE_COLORS[key] ?? 'bg-utility-gray-50 text-utility-gray-700 ring-utility-gray-200';
}

/** Get initials from a name for avatar fallback */
function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');
}

/** Checkbox SVG following Untitled UI pattern */
function UiCheckbox({
  checked,
  onChange,
  ariaLabel,
  onClick,
}: {
  checked: boolean;
  onChange: () => void;
  ariaLabel: string;
  onClick?: (e: React.MouseEvent) => void;
}): ReactNode {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={(e) => {
        onClick?.(e);
        onChange();
      }}
      className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
        checked
          ? 'border-transparent bg-brand-solid ring-1 ring-brand-solid'
          : 'border-secondary bg-primary ring-1 ring-secondary hover:border-quaternary'
      }`}
    >
      {checked && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
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
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-tertiary text-xs font-semibold text-quaternary">
            {getInitials(strValue)}
          </div>
          <span className="text-sm font-medium text-primary">{strValue}</span>
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

/** Skeleton row for loading state — Untitled UI spacing */
function SkeletonRow({ colCount }: { colCount: number }): ReactNode {
  return (
    <tr className="relative">
      {Array.from({ length: colCount }, (_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 animate-pulse rounded bg-tertiary/30" />
        </td>
      ))}
    </tr>
  );
}

/** Sort direction indicator following Untitled UI ArrowDown pattern */
function SortIndicator({ direction }: { direction: SortDir }): ReactNode {
  if (!direction) return null;
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-quaternary ${direction === 'asc' ? 'rotate-180' : ''}`}
      aria-hidden="true"
    >
      <path d="M6 2.5V9.5M6 9.5L2.5 6M6 9.5L9.5 6" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Unsorted indicator (chevron selector) */
function UnsortedIndicator(): ReactNode {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-quaternary"
      aria-hidden="true"
    >
      <path d="M3.5 7.5L6 10L8.5 7.5M3.5 4.5L6 2L8.5 4.5" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
      <div
        data-component="DataTable"
        data-id={id}
        className="overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-secondary"
      >
        <table className="w-full" role="table">
          <thead className="bg-secondary h-11">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-2 text-left text-xs font-semibold whitespace-nowrap text-quaternary"
                >
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
        className="flex flex-col items-center justify-center overflow-hidden rounded-xl bg-primary py-16 shadow-xs ring-1 ring-secondary"
      >
        {emptyState ?? (
          <>
            <div className="mb-3">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-quaternary" aria-hidden="true">
                <rect x="4" y="6" width="40" height="36" rx="4" stroke="currentColor" strokeWidth="2" />
                <line x1="4" y1="16" x2="44" y2="16" stroke="currentColor" strokeWidth="2" />
                <line x1="18" y1="6" x2="18" y2="42" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <p className="text-sm text-tertiary">Aucune donnee</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div data-component="DataTable" data-id={id} className="flex flex-col gap-4">
      {/* Search bar */}
      {filterable && (
        <div className="flex items-center gap-3">
          <div className="relative w-full max-w-xs">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-quaternary"
              aria-hidden="true"
            >
              <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full rounded-lg border border-secondary bg-primary py-2.5 pl-10 pr-3.5 text-sm text-primary shadow-xs placeholder:text-quaternary focus:outline-none focus:ring-2 focus:ring-brand-solid focus:border-transparent"
              value={searchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setSearchQuery(e.target.value);
                setCurrentPage(0);
              }}
              aria-label="Rechercher dans le tableau"
            />
          </div>
          {searchQuery && (
            <span className="text-sm text-tertiary">
              {sortedData.length} resultat{sortedData.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* Table card */}
      <div className="overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
        <div className="overflow-x-auto">
          <table className="w-full" role="table" aria-label="Tableau de donnees">
            {/* Header */}
            <thead className="bg-secondary">
              <tr className="h-11">
                {selectable && (
                  <th className="relative w-11 py-2 pr-0 pl-6">
                    <UiCheckbox
                      checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                      onChange={handleSelectAll}
                      ariaLabel="Tout selectionner"
                    />
                  </th>
                )}
                {columns.map((col) => {
                  const isSortable = sortable || col.sortable;
                  const isSorted = sort.key === col.key;
                  return (
                    <th
                      key={col.key}
                      className={`relative px-6 py-2 text-left ${
                        isSortable ? 'cursor-pointer select-none' : ''
                      }`}
                      style={col.width ? { width: col.width } : undefined}
                      onClick={isSortable ? () => handleSort(col.key) : undefined}
                      aria-sort={isSorted ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                    >
                      <span className="flex items-center gap-1">
                        <span className="text-xs font-semibold whitespace-nowrap text-quaternary">
                          {col.label}
                        </span>
                        {isSortable && (
                          isSorted ? (
                            <SortIndicator direction={sort.direction} />
                          ) : (
                            <UnsortedIndicator />
                          )
                        )}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {paginatedData.map((row, rowIndex) => {
                const globalIndex = currentPage * pageSize + rowIndex;
                const isSelected = selectedRows.has(globalIndex);
                const isLastRow = rowIndex === paginatedData.length - 1;
                return (
                  <tr
                    key={rowIndex}
                    className={`relative transition-colors hover:bg-secondary ${
                      onRowClick ? 'cursor-pointer' : ''
                    } ${isSelected ? 'bg-secondary' : ''}`}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {selectable && (
                      <td className="relative py-4 pr-0 pl-6">
                        <UiCheckbox
                          checked={isSelected}
                          onChange={() => handleSelectRow(rowIndex)}
                          ariaLabel={`Selectionner ligne ${rowIndex + 1}`}
                          onClick={(e) => e.stopPropagation()}
                        />
                        {/* Row border via pseudo-element pattern */}
                        {!isLastRow && (
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-secondary" aria-hidden="true" />
                        )}
                      </td>
                    )}
                    {columns.map((col, colIndex) => (
                      <td
                        key={col.key}
                        className="relative px-6 py-4 text-sm text-tertiary"
                      >
                        {renderCellValue(row[col.key], col, row)}
                        {/* Row border via pseudo-element pattern — only on first cell if no checkbox */}
                        {!selectable && colIndex === 0 && !isLastRow && (
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-secondary" aria-hidden="true" />
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination — inside the card, as a footer */}
        {pagination && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-secondary px-6 py-3.5">
            <span className="text-sm text-tertiary">
              Page {currentPage + 1} sur {totalPages}
            </span>
            <div className="flex gap-3">
              <button
                type="button"
                className="rounded-lg border border-secondary bg-primary px-3.5 py-2 text-sm font-semibold text-secondary shadow-xs transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Precedent
              </button>
              <button
                type="button"
                className="rounded-lg border border-secondary bg-primary px-3.5 py-2 text-sm font-semibold text-secondary shadow-xs transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selection count */}
      {selectable && selectedRows.size > 0 && (
        <div className="text-sm text-tertiary">
          {selectedRows.size} ligne{selectedRows.size > 1 ? 's' : ''} selectionnee{selectedRows.size > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

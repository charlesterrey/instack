import { type ReactNode, useState, useCallback } from 'react';

// ─── Public Types ────────────────────────────────────────────────────────────

export interface FilterSelectOption {
  value: string;
  label: string;
}

export interface FilterDef {
  key: string;
  label: string;
  type: 'select' | 'search' | 'date_range' | 'toggle' | 'multi_select';
  options?: FilterSelectOption[];
  placeholder?: string;
}

export interface FilterBarProps {
  id: string;
  filters: FilterDef[];
  values: Record<string, unknown>;
  onChange: (filterKey: string, value: unknown) => void;
  onReset?: () => void;
  layout?: 'horizontal' | 'vertical';
}

// ─── Date Range Value ────────────────────────────────────────────────────────

interface DateRangeValue {
  from?: string;
  to?: string;
}

// ─── Internal Helpers ────────────────────────────────────────────────────────

function isDateRangeValue(value: unknown): value is DateRangeValue {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    (obj['from'] === undefined || typeof obj['from'] === 'string') &&
    (obj['to'] === undefined || typeof obj['to'] === 'string')
  );
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string');
}

/** Count how many filters have a non-empty/non-default value. */
function countActiveFilters(values: Record<string, unknown>): number {
  let count = 0;
  for (const key of Object.keys(values)) {
    const val = values[key];
    if (val === undefined || val === null || val === '' || val === false) continue;
    if (Array.isArray(val) && val.length === 0) continue;
    if (isDateRangeValue(val) && !val.from && !val.to) continue;
    count++;
  }
  return count;
}

// ─── Search Icon SVG ─────────────────────────────────────────────────────────

function SearchIcon(): ReactNode {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 text-fg-quaternary"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <circle cx={11} cy={11} r={8} />
      <path d="m21 21-4.35-4.35" strokeLinecap="round" />
    </svg>
  );
}

// ─── Chevron Icon SVG ────────────────────────────────────────────────────────

function ChevronIcon({ open }: { open: boolean }): ReactNode {
  return (
    <svg
      aria-hidden="true"
      className={`h-4 w-4 text-fg-quaternary transition-transform ${open ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Individual Filter Renderers ─────────────────────────────────────────────

function SelectFilter({
  filter,
  value,
  onChange,
}: {
  filter: FilterDef;
  value: unknown;
  onChange: (key: string, value: unknown) => void;
}): ReactNode {
  const currentValue = typeof value === 'string' ? value : '';
  return (
    <div className="flex flex-col gap-1.5" data-filter-type="select">
      <label
        htmlFor={`filter-${filter.key}`}
        className="text-sm font-medium text-secondary"
      >
        {filter.label}
      </label>
      <select
        id={`filter-${filter.key}`}
        data-filter-key={filter.key}
        value={currentValue}
        onChange={(e) => onChange(filter.key, e.target.value)}
        className="rounded-lg bg-primary px-3 py-2 text-sm text-primary shadow-xs ring-1 ring-primary ring-inset focus:outline-none focus:ring-2 focus:ring-brand"
      >
        <option value="">{filter.placeholder ?? `Sélectionner ${filter.label}`}</option>
        {filter.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SearchFilter({
  filter,
  value,
  onChange,
}: {
  filter: FilterDef;
  value: unknown;
  onChange: (key: string, value: unknown) => void;
}): ReactNode {
  const currentValue = typeof value === 'string' ? value : '';
  return (
    <div className="flex flex-col gap-1.5" data-filter-type="search">
      <label
        htmlFor={`filter-${filter.key}`}
        className="text-sm font-medium text-secondary"
      >
        {filter.label}
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <SearchIcon />
        </div>
        <input
          id={`filter-${filter.key}`}
          data-filter-key={filter.key}
          type="text"
          value={currentValue}
          placeholder={filter.placeholder ?? `Rechercher...`}
          onChange={(e) => onChange(filter.key, e.target.value)}
          className="w-full rounded-lg bg-primary py-2 pl-9 pr-3 text-sm text-primary shadow-xs ring-1 ring-primary ring-inset placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </div>
    </div>
  );
}

function DateRangeFilter({
  filter,
  value,
  onChange,
}: {
  filter: FilterDef;
  value: unknown;
  onChange: (key: string, value: unknown) => void;
}): ReactNode {
  const rangeValue: DateRangeValue = isDateRangeValue(value) ? value : {};

  const handleDateChange = (field: 'from' | 'to', dateValue: string) => {
    const updated: DateRangeValue = { ...rangeValue, [field]: dateValue || undefined };
    onChange(filter.key, updated);
  };

  return (
    <div className="flex flex-col gap-1.5" data-filter-type="date_range">
      <span className="text-sm font-medium text-secondary">{filter.label}</span>
      <div className="flex items-center gap-2">
        <input
          id={`filter-${filter.key}-from`}
          data-filter-key={`${filter.key}-from`}
          type="date"
          value={rangeValue.from ?? ''}
          aria-label={`${filter.label} - du`}
          onChange={(e) => handleDateChange('from', e.target.value)}
          className="rounded-lg bg-primary px-3 py-2 text-sm text-primary shadow-xs ring-1 ring-primary ring-inset focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <span className="text-xs text-placeholder">—</span>
        <input
          id={`filter-${filter.key}-to`}
          data-filter-key={`${filter.key}-to`}
          type="date"
          value={rangeValue.to ?? ''}
          aria-label={`${filter.label} - au`}
          onChange={(e) => handleDateChange('to', e.target.value)}
          className="rounded-lg bg-primary px-3 py-2 text-sm text-primary shadow-xs ring-1 ring-primary ring-inset focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </div>
    </div>
  );
}

function ToggleFilter({
  filter,
  value,
  onChange,
}: {
  filter: FilterDef;
  value: unknown;
  onChange: (key: string, value: unknown) => void;
}): ReactNode {
  const checked = value === true;
  return (
    <div className="flex flex-col gap-1.5" data-filter-type="toggle">
      <span className="text-sm font-medium text-secondary">{filter.label}</span>
      <button
        id={`filter-${filter.key}`}
        data-filter-key={filter.key}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(filter.key, !checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 ${
          checked ? 'bg-brand-solid' : 'bg-tertiary'
        }`}
      >
        <span
          aria-hidden="true"
          className={`inline-block h-4 w-4 rounded-full bg-fg-white shadow-sm transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </button>
      <span className="text-sm text-primary">
        {checked ? 'Activé' : 'Désactivé'}
      </span>
    </div>
  );
}

function MultiSelectFilter({
  filter,
  value,
  onChange,
}: {
  filter: FilterDef;
  value: unknown;
  onChange: (key: string, value: unknown) => void;
}): ReactNode {
  const selectedValues: string[] = isStringArray(value) ? value : [];
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleOption = useCallback(
    (optionValue: string) => {
      const next = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      onChange(filter.key, next);
    },
    [selectedValues, onChange, filter.key],
  );

  return (
    <div className="relative flex flex-col gap-1.5" data-filter-type="multi_select">
      <span className="text-sm font-medium text-secondary">{filter.label}</span>
      <button
        type="button"
        data-filter-key={filter.key}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-left text-sm text-primary shadow-xs ring-1 ring-primary ring-inset transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-brand"
      >
        <span className="flex-1 truncate">
          {selectedValues.length > 0
            ? `${String(selectedValues.length)} sélectionné${selectedValues.length > 1 ? 's' : ''}`
            : (filter.placeholder ?? `Sélectionner ${filter.label}`)}
        </span>
        <ChevronIcon open={isOpen} />
      </button>
      {isOpen && (
        <div
          role="listbox"
          aria-multiselectable="true"
          className="absolute top-full z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg bg-primary shadow-lg ring-1 ring-primary ring-inset"
        >
          {filter.options?.map((opt) => {
            const isSelected = selectedValues.includes(opt.value);
            return (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-secondary"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggleOption(opt.value)}
                  className="h-4 w-4 rounded accent-brand-solid focus:ring-2 focus:ring-brand"
                />
                {opt.label}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Filter Dispatcher ───────────────────────────────────────────────────────

function renderFilter(
  filter: FilterDef,
  value: unknown,
  onChange: (key: string, value: unknown) => void,
): ReactNode {
  switch (filter.type) {
    case 'select':
      return <SelectFilter filter={filter} value={value} onChange={onChange} />;
    case 'search':
      return <SearchFilter filter={filter} value={value} onChange={onChange} />;
    case 'date_range':
      return <DateRangeFilter filter={filter} value={value} onChange={onChange} />;
    case 'toggle':
      return <ToggleFilter filter={filter} value={value} onChange={onChange} />;
    case 'multi_select':
      return <MultiSelectFilter filter={filter} value={value} onChange={onChange} />;
    default:
      return null;
  }
}

// ─── FilterBar Component ─────────────────────────────────────────────────────

/**
 * FilterBar — Horizontal or vertical bar of combined filters with reset and active count badge.
 *
 * Uses Untitled UI design token classes throughout:
 * - Inputs: rounded-lg bg-primary shadow-xs ring-1 ring-primary ring-inset, focus: ring-2 ring-brand
 * - Text: text-sm text-primary, placeholder: text-placeholder
 * - Labels: text-sm font-medium text-secondary
 * - Toggle: bg-tertiary off, bg-brand-solid on, knob bg-fg-white shadow-sm
 * - Badge: bg-utility-brand-50 text-utility-brand-700 ring-utility-brand-200
 * - Reset button: text-brand-secondary hover:text-brand-secondary_hover
 *
 * @example
 * ```tsx
 * <FilterBar
 *   id="dashboard-filters"
 *   filters={[
 *     { key: 'status', label: 'Statut', type: 'select', options: [...] },
 *     { key: 'search', label: 'Recherche', type: 'search' },
 *   ]}
 *   values={filterValues}
 *   onChange={(key, value) => setFilterValues(prev => ({ ...prev, [key]: value }))}
 *   onReset={() => setFilterValues({})}
 * />
 * ```
 */
export function FilterBar(props: FilterBarProps): ReactNode {
  const { id, filters, values, onChange, onReset, layout = 'horizontal' } = props;
  const activeCount = countActiveFilters(values);

  const isVertical = layout === 'vertical';
  const containerClasses = isVertical
    ? 'flex flex-col gap-3'
    : 'flex items-center gap-3 flex-wrap';

  return (
    <div
      data-component="FilterBar"
      data-id={id}
      data-layout={layout}
      className="rounded-xl bg-primary p-4 shadow-xs ring-1 ring-primary ring-inset"
      role="search"
      aria-label="Filtres"
    >
      <div className={containerClasses}>
        {filters.map((filter) => (
          <div key={filter.key} className="min-w-0">
            {renderFilter(filter, values[filter.key], onChange)}
          </div>
        ))}

        {/* Reset button + active badge */}
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <span
              data-testid="active-filter-badge"
              className="inline-flex items-center justify-center rounded-full bg-utility-brand-50 px-2 py-0.5 text-xs font-medium text-utility-brand-700 ring-1 ring-utility-brand-200 ring-inset"
              aria-label={`${String(activeCount)} filtre${activeCount > 1 ? 's' : ''} actif${activeCount > 1 ? 's' : ''}`}
            >
              {activeCount}
            </span>
          )}
          {onReset !== undefined && (
            <button
              type="button"
              data-testid="filter-reset-button"
              onClick={onReset}
              className="text-sm font-semibold text-brand-secondary hover:text-brand-secondary_hover focus:outline-none"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

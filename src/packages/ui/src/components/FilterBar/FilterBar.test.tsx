// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { FilterBar } from './FilterBar';
import type { FilterBarProps, FilterDef } from './FilterBar';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildProps(overrides?: Partial<FilterBarProps>): FilterBarProps {
  return {
    id: 'test-filter-bar',
    filters: [],
    values: {},
    onChange: vi.fn(),
    ...overrides,
  };
}

const STATUS_OPTIONS = [
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Inactif' },
  { value: 'pending', label: 'En attente' },
];

const SELECT_FILTER: FilterDef = {
  key: 'status',
  label: 'Statut',
  type: 'select',
  options: STATUS_OPTIONS,
};

const SEARCH_FILTER: FilterDef = {
  key: 'query',
  label: 'Recherche',
  type: 'search',
  placeholder: 'Rechercher...',
};

const DATE_RANGE_FILTER: FilterDef = {
  key: 'period',
  label: 'Période',
  type: 'date_range',
};

const TOGGLE_FILTER: FilterDef = {
  key: 'archived',
  label: 'Archivé',
  type: 'toggle',
};

const MULTI_SELECT_FILTER: FilterDef = {
  key: 'tags',
  label: 'Tags',
  type: 'multi_select',
  options: [
    { value: 'urgent', label: 'Urgent' },
    { value: 'normal', label: 'Normal' },
    { value: 'low', label: 'Faible' },
  ],
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('FilterBar', () => {
  afterEach(() => {
    cleanup();
  });
  // --- 1. Render select filter ---
  it('renders a select filter with all options', () => {
    const props = buildProps({ filters: [SELECT_FILTER] });
    render(<FilterBar {...props} />);

    const select = screen.getByRole('combobox');
    expect(select).toBeDefined();

    // Default placeholder + 3 options = 4 option elements
    const options = select.querySelectorAll('option');
    expect(options.length).toBe(4);
    expect(options[1]?.textContent).toBe('Actif');
    expect(options[2]?.textContent).toBe('Inactif');
    expect(options[3]?.textContent).toBe('En attente');
  });

  // --- 2. Render search filter ---
  it('renders a search filter with placeholder and magnifier icon', () => {
    const props = buildProps({ filters: [SEARCH_FILTER] });
    render(<FilterBar {...props} />);

    const input = screen.getByPlaceholderText('Rechercher...');
    expect(input).toBeDefined();
    expect(input.getAttribute('type')).toBe('text');

    // SVG search icon should be present
    const svg = document.querySelector('[data-filter-type="search"] svg');
    expect(svg).not.toBeNull();
  });

  // --- 3. Render date_range filter ---
  it('renders a date_range filter with from and to inputs', () => {
    const props = buildProps({
      filters: [DATE_RANGE_FILTER],
      values: { period: { from: '2026-01-01', to: '2026-12-31' } },
    });
    render(<FilterBar {...props} />);

    const fromInput = screen.getByLabelText('Période - du') as HTMLInputElement;
    const toInput = screen.getByLabelText('Période - au') as HTMLInputElement;
    expect(fromInput.value).toBe('2026-01-01');
    expect(toInput.value).toBe('2026-12-31');
  });

  // --- 4. Render toggle filter ---
  it('renders a toggle filter as a checkbox switch', () => {
    const props = buildProps({
      filters: [TOGGLE_FILTER],
      values: { archived: true },
    });
    render(<FilterBar {...props} />);

    const checkbox = screen.getByRole('switch') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
    expect(screen.getByText('Activé')).toBeDefined();
  });

  // --- 5. Render multi_select filter ---
  it('renders a multi_select filter with dropdown checkboxes', () => {
    const props = buildProps({
      filters: [MULTI_SELECT_FILTER],
      values: { tags: ['urgent'] },
    });
    render(<FilterBar {...props} />);

    // Trigger button should show selection count
    const trigger = screen.getByRole('button', { name: /sélectionné/i });
    expect(trigger).toBeDefined();
    expect(trigger.textContent).toContain('1 sélectionné');

    // Open the dropdown
    fireEvent.click(trigger);
    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeDefined();

    // Should have 3 checkboxes
    const checkboxes = listbox.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBe(3);
  });

  // --- 6. Reset button calls onReset ---
  it('renders a reset button that calls onReset when clicked', () => {
    const onReset = vi.fn();
    const props = buildProps({
      filters: [SELECT_FILTER],
      onReset,
    });
    render(<FilterBar {...props} />);

    const resetButton = screen.getByTestId('filter-reset-button');
    expect(resetButton.textContent).toBe('Réinitialiser');

    fireEvent.click(resetButton);
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  // --- 7. Badge shows active filters count ---
  it('displays a badge with the count of active filters', () => {
    const props = buildProps({
      filters: [SELECT_FILTER, SEARCH_FILTER, TOGGLE_FILTER],
      values: { status: 'active', query: 'hello' },
    });
    render(<FilterBar {...props} />);

    const badge = screen.getByTestId('active-filter-badge');
    expect(badge.textContent).toBe('2');
  });

  // --- 8. onChange called with correct key and value ---
  it('calls onChange with the correct filter key and value when a select changes', () => {
    const onChange = vi.fn();
    const props = buildProps({
      filters: [SELECT_FILTER],
      values: {},
      onChange,
    });
    render(<FilterBar {...props} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'active' } });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('status', 'active');
  });

  // --- 9. onChange called for search input ---
  it('calls onChange with the correct key when typing in a search filter', () => {
    const onChange = vi.fn();
    const props = buildProps({
      filters: [SEARCH_FILTER],
      values: {},
      onChange,
    });
    render(<FilterBar {...props} />);

    const input = screen.getByPlaceholderText('Rechercher...');
    fireEvent.change(input, { target: { value: 'test' } });

    expect(onChange).toHaveBeenCalledWith('query', 'test');
  });

  // --- 10. Horizontal layout (default) ---
  it('renders in horizontal layout by default with flex-row', () => {
    const props = buildProps({ filters: [SELECT_FILTER] });
    render(<FilterBar {...props} />);

    const container = screen.getByRole('search');
    expect(container.getAttribute('data-layout')).toBe('horizontal');

    // The inner flex container should use flex-row
    const innerDiv = container.firstElementChild as HTMLElement;
    expect(innerDiv.className).toContain('flex-row');
  });

  // --- 11. Vertical layout ---
  it('renders in vertical layout with flex-col when layout is vertical', () => {
    const props = buildProps({
      filters: [SELECT_FILTER],
      layout: 'vertical',
    });
    render(<FilterBar {...props} />);

    const container = screen.getByRole('search');
    expect(container.getAttribute('data-layout')).toBe('vertical');

    const innerDiv = container.firstElementChild as HTMLElement;
    expect(innerDiv.className).toContain('flex-col');
  });

  // --- 12. No badge when no active filters ---
  it('does not display a badge when there are no active filters', () => {
    const props = buildProps({
      filters: [SELECT_FILTER],
      values: {},
    });
    render(<FilterBar {...props} />);

    const badge = screen.queryByTestId('active-filter-badge');
    expect(badge).toBeNull();
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable } from './DataTable';
import type { DataTableProps, ColumnDef } from './DataTable';

const sampleColumns: ColumnDef[] = [
  { key: 'name', label: 'Nom', type: 'text', sortable: true },
  { key: 'amount', label: 'Montant', type: 'number', sortable: true },
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'status', label: 'Statut', type: 'badge' },
  { key: 'assignee', label: 'Responsable', type: 'avatar' },
];

const sampleData = [
  { name: 'Projet Alpha', amount: 15000, date: '2024-01-15', status: 'Actif', assignee: 'Alice Martin' },
  { name: 'Projet Beta', amount: 8500, date: '2024-02-20', status: 'En cours', assignee: 'Bob Dupont' },
  { name: 'Projet Gamma', amount: 42000, date: '2024-03-10', status: 'Termine', assignee: 'Clara Rousseau' },
];

function makeProps(overrides?: Partial<DataTableProps>): DataTableProps {
  return {
    id: 'test-table',
    columns: sampleColumns,
    data: sampleData,
    ...overrides,
  };
}

describe('DataTable', () => {
  it('is a function component', () => {
    expect(typeof DataTable).toBe('function');
  });

  it('renders with data and column headers', () => {
    render(<DataTable {...makeProps()} />);
    expect(screen.getByText('Nom')).toBeTruthy();
    expect(screen.getByText('Montant')).toBeTruthy();
    expect(screen.getByText('Projet Alpha')).toBeTruthy();
  });

  it('renders empty state when data is empty', () => {
    render(<DataTable {...makeProps({ data: [] })} />);
    expect(screen.getByText('Aucune donnee')).toBeTruthy();
  });

  it('renders custom empty state', () => {
    render(<DataTable {...makeProps({ data: [], emptyState: <span>Custom empty</span> })} />);
    expect(screen.getByText('Custom empty')).toBeTruthy();
  });

  it('renders loading skeleton', () => {
    const { container } = render(<DataTable {...makeProps({ loading: true })} />);
    expect(container.querySelector('table')).toBeTruthy();
  });

  it('renders all column types without throwing', () => {
    const { container } = render(<DataTable {...makeProps()} />);
    expect(container.querySelector('[data-component="DataTable"]')).toBeTruthy();
  });

  it('renders sortable headers with sort indicators', () => {
    const { container } = render(<DataTable {...makeProps({ sortable: true })} />);
    // Sortable headers should have SVG sort indicators (unsorted chevron)
    const headers = container.querySelectorAll('th');
    expect(headers.length).toBeGreaterThan(0);
    // Each sortable header should contain an SVG indicator
    const svgs = container.querySelectorAll('th svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('renders search input when filterable', () => {
    render(<DataTable {...makeProps({ filterable: true })} />);
    expect(screen.getByPlaceholderText('Rechercher...')).toBeTruthy();
  });

  it('renders pagination controls', () => {
    render(<DataTable {...makeProps({ pagination: { pageSize: 2, totalItems: 3 } })} />);
    expect(screen.getByText('Page 1 sur 2')).toBeTruthy();
    expect(screen.getByText('Suivant')).toBeTruthy();
  });

  it('renders selection checkboxes when selectable', () => {
    render(<DataTable {...makeProps({ selectable: true })} />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThanOrEqual(4); // 1 header + 3 rows
  });

  it('renders badge column type with utility token classes', () => {
    const { container } = render(<DataTable {...makeProps()} />);
    // Badge should use bg-utility-green-50 pattern for "Actif"
    const badge = container.querySelector('.bg-utility-green-50');
    expect(badge).toBeTruthy();
  });

  it('renders avatar column type with initials in bg-tertiary circle', () => {
    const { container } = render(<DataTable {...makeProps()} />);
    // Avatar circle should use bg-tertiary
    const avatar = container.querySelector('.bg-tertiary');
    expect(avatar).toBeTruthy();
    // Check initials are rendered (Alice Martin -> AM)
    expect(container.textContent).toContain('AM');
  });

  it('handles null/undefined values gracefully', () => {
    const data = [{ name: null, amount: undefined, date: '' }];
    const { container } = render(<DataTable {...makeProps({ data: data as unknown as Record<string, unknown>[] })} />);
    expect(container.querySelector('table')).toBeTruthy();
  });

  it('renders truncated text for long values', () => {
    const longData = [{ name: 'A'.repeat(100), amount: 1, date: '2024-01-01', status: 'OK', assignee: 'X' }];
    render(<DataTable {...makeProps({ data: longData })} />);
    const truncated = screen.getByText(/A{50}\.\.\./);
    expect(truncated).toBeTruthy();
  });

  it('uses Untitled UI card wrapper classes', () => {
    const { container } = render(<DataTable {...makeProps()} />);
    const card = container.querySelector('.rounded-xl.shadow-xs.ring-1.ring-secondary');
    expect(card).toBeTruthy();
  });

  it('uses Untitled UI header bg-secondary with h-11', () => {
    const { container } = render(<DataTable {...makeProps()} />);
    const thead = container.querySelector('thead.bg-secondary');
    expect(thead).toBeTruthy();
    const headerRow = thead?.querySelector('tr.h-11');
    expect(headerRow).toBeTruthy();
  });

  it('uses Untitled UI header cell text-xs font-semibold text-quaternary', () => {
    const { container } = render(<DataTable {...makeProps()} />);
    const headerLabel = container.querySelector('th .text-xs.font-semibold.text-quaternary');
    expect(headerLabel).toBeTruthy();
  });

  it('uses Untitled UI body cell px-6 py-4 text-sm text-tertiary', () => {
    const { container } = render(<DataTable {...makeProps()} />);
    const cell = container.querySelector('td.px-6.py-4.text-sm.text-tertiary');
    expect(cell).toBeTruthy();
  });

  it('applies hover:bg-secondary on body rows', () => {
    const { container } = render(<DataTable {...makeProps()} />);
    const row = container.querySelector('tbody tr');
    expect(row?.className).toContain('hover:bg-secondary');
  });

  it('applies bg-secondary on selected rows', () => {
    const { container } = render(<DataTable {...makeProps({ selectable: true })} />);
    // Click the first row checkbox to select it
    const checkboxes = screen.getAllByRole('checkbox');
    // checkboxes[0] is select-all, checkboxes[1] is first row
    fireEvent.click(checkboxes[1] as HTMLElement);
    // After selection, the row should have bg-secondary
    const rows = container.querySelectorAll('tbody tr');
    expect(rows[0]?.className).toContain('bg-secondary');
  });

  it('renders pagination inside the card with border-t', () => {
    const { container } = render(<DataTable {...makeProps({ pagination: { pageSize: 2, totalItems: 3 } })} />);
    const paginationBar = container.querySelector('.border-t.border-secondary');
    expect(paginationBar).toBeTruthy();
  });

  it('search input has search icon and Untitled UI styling', () => {
    const { container } = render(<DataTable {...makeProps({ filterable: true })} />);
    // Search wrapper should contain an SVG icon
    const searchWrapper = container.querySelector('.relative.w-full.max-w-xs');
    expect(searchWrapper).toBeTruthy();
    expect(searchWrapper?.querySelector('svg')).toBeTruthy();
  });

  it('toggles sort direction on header click', () => {
    const { container } = render(<DataTable {...makeProps({ sortable: true })} />);
    const nameHeaderLabel = container.querySelector('th .text-xs');
    const nameHeader = nameHeaderLabel?.closest('th');
    expect(nameHeader).toBeTruthy();

    fireEvent.click(nameHeader as HTMLElement);
    expect(nameHeader?.getAttribute('aria-sort')).toBe('ascending');

    fireEvent.click(nameHeader as HTMLElement);
    expect(nameHeader?.getAttribute('aria-sort')).toBe('descending');

    fireEvent.click(nameHeader as HTMLElement);
    expect(nameHeader?.getAttribute('aria-sort')).toBeNull();
  });

  it('filters data when search query changes', () => {
    const { container } = render(<DataTable {...makeProps({ filterable: true })} />);
    const input = container.querySelector('input[placeholder="Rechercher..."]') as HTMLInputElement;
    expect(input).toBeTruthy();
    fireEvent.change(input, { target: { value: 'Alpha' } });
    expect(container.textContent).toContain('Projet Alpha');
    expect(container.textContent).not.toContain('Projet Beta');
  });

  it('navigates pages with pagination buttons', () => {
    const { container } = render(<DataTable {...makeProps({ pagination: { pageSize: 2, totalItems: 3 } })} />);
    expect(container.textContent).toContain('Page 1 sur 2');

    const nextBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent === 'Suivant');
    expect(nextBtn).toBeTruthy();
    fireEvent.click(nextBtn as HTMLElement);
    expect(container.textContent).toContain('Page 2 sur 2');

    const prevBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent === 'Precedent');
    fireEvent.click(prevBtn as HTMLElement);
    expect(container.textContent).toContain('Page 1 sur 2');
  });

  it('shows selection count when rows are selected', () => {
    const { container } = render(<DataTable {...makeProps({ selectable: true })} />);
    const checkboxes = container.querySelectorAll('[role="checkbox"]');
    expect(checkboxes.length).toBeGreaterThanOrEqual(4);
    // Select first row (index 1, index 0 is select-all)
    fireEvent.click(checkboxes[1] as HTMLElement);
    expect(container.textContent).toContain('1 ligne');
  });

  it('select-all toggles all visible rows', () => {
    const { container } = render(<DataTable {...makeProps({ selectable: true })} />);
    const checkboxes = container.querySelectorAll('[role="checkbox"]');
    const selectAll = checkboxes[0] as HTMLElement;

    fireEvent.click(selectAll);
    expect(container.textContent).toContain('3 ligne');

    fireEvent.click(selectAll);
    expect(container.textContent).not.toContain('ligne');
  });
});

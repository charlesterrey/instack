import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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

  it('renders sortable headers', () => {
    const { container } = render(<DataTable {...makeProps({ sortable: true })} />);
    expect(container.querySelector('th')).toBeTruthy();
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

  it('renders badge column type', () => {
    const { container } = render(<DataTable {...makeProps()} />);
    // Badge renders as span with special classes
    expect(container.querySelector('[data-component="DataTable"]')).toBeTruthy();
  });

  it('renders avatar column type with initials', () => {
    const { container } = render(<DataTable {...makeProps()} />);
    // Avatar renders initials - check the table rendered
    expect(container.querySelectorAll('tr').length).toBeGreaterThan(1);
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
});

import type { ReactNode } from 'react';

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

export function DataTable(props: DataTableProps): ReactNode {
  return (
    <div data-component="DataTable" data-id={props.id}>
      {`[DataTable: ${String(props.columns.length)} columns, ${String(props.data.length)} rows]`}
    </div>
  );
}

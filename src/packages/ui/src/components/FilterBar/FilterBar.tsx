import type { ReactNode } from 'react';

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

export function FilterBar(props: FilterBarProps): ReactNode {
  return (
    <div data-component="FilterBar" data-id={props.id}>
      {`[FilterBar: ${String(props.filters.length)} filters]`}
    </div>
  );
}

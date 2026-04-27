/**
 * AppRenderer — Pure component that transforms a validated JSON AppSchema into React.
 * @PRISM owns this file.
 *
 * Invariants:
 * - Pure: no state, no effects, deterministic render
 * - Data bindings resolved at render time (schema is data-agnostic)
 * - Same schema + same data = same output ALWAYS
 * - CSS Grid layout engine
 * - Per-component error boundary
 */

import type { ReactNode } from 'react';
import {
  FormField,
  DataTable,
  KPICard,
  BarChart,
  FilterBar,
  Container,
} from '@instack/ui';
import type {
  DataTableProps,
  BarChartProps,
  FilterBarProps,
} from '@instack/ui';
import type {
  AppSchema,
  ComponentInstance,
  DataBinding,
} from '@instack/shared';
import { ComponentErrorBoundary } from './ComponentErrorBoundary';

// ═══════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════

export interface AppRendererProps {
  /** The validated app schema to render */
  schema: AppSchema;
  /** Row data from the data source (optional) */
  data?: readonly Record<string, unknown>[];
  /** Custom class name for the root container */
  className?: string;
}

/** Aggregate transform functions */
type AggregateTransform = 'count' | 'sum' | 'avg' | 'min' | 'max' | 'distinct' | 'latest' | 'first';

const AGGREGATE_FUNCTIONS: Record<AggregateTransform, (values: unknown[]) => unknown> = {
  count: (values) => values.length,
  sum: (values) => values.reduce((acc: number, v) => acc + (Number(v) || 0), 0),
  avg: (values) => {
    const nums = values.map(Number).filter((n) => !isNaN(n));
    return nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
  },
  min: (values) => {
    const nums = values.map(Number).filter((n) => !isNaN(n));
    return nums.length > 0 ? Math.min(...nums) : 0;
  },
  max: (values) => {
    const nums = values.map(Number).filter((n) => !isNaN(n));
    return nums.length > 0 ? Math.max(...nums) : 0;
  },
  distinct: (values) => [...new Set(values.map(String))].length,
  latest: (values) => values.length > 0 ? values[values.length - 1] : null,
  first: (values) => values.length > 0 ? values[0] : null,
};

// ═══════════════════════════════════════════════════════════════════
// Component Map
// ═══════════════════════════════════════════════════════════════════

type ComponentRenderer = (props: Record<string, unknown>, id: string) => ReactNode;

const NOOP = () => {};


const COMPONENT_MAP: Record<string, ComponentRenderer> = {
  form_field: (props, id) => (
    <FormField
      id={id}
      label={String(props['label'] ?? '')}
      type={(props['fieldType'] as 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea' | 'email' | 'phone') ?? 'text'}
      placeholder={props['placeholder'] as string | undefined}
      required={props['required'] as boolean | undefined}
      onChange={NOOP}
    />
  ),
  data_table: (props, id) => (
    <DataTable
      id={id}
      columns={(props['columns'] as DataTableProps['columns']) ?? []}
      data={(props['data'] as DataTableProps['data']) ?? []}
    />
  ),
  kpi_card: (props, id) => (
    <KPICard
      id={id}
      title={String(props['title'] ?? '')}
      value={props['value'] != null ? String(props['value']) : '0'}
      description={props['description'] as string | undefined}
      size={(props['size'] as 'sm' | 'md' | 'lg') ?? 'md'}
    />
  ),
  bar_chart: (props, id) => (
    <BarChart
      id={id}
      title={String(props['title'] ?? '')}
      data={(props['data'] as BarChartProps['data']) ?? []}
      xKey={String(props['xKey'] ?? 'x')}
      yKeys={(props['yKeys'] as string[]) ?? ['y']}
    />
  ),
  filter_bar: (props, id) => (
    <FilterBar
      id={id}
      filters={(props['filters'] as FilterBarProps['filters']) ?? []}
      values={{}}
      onChange={NOOP}
    />
  ),
  container: (props, id) => (
    <Container
      id={id}
      layout={(props['layout'] as 'stack' | 'grid' | 'columns' | 'sidebar' | 'centered') ?? 'stack'}
      padding={(props['padding'] as '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12') ?? '4'}
    >
      {props['children'] as ReactNode}
    </Container>
  ),
};

// ═══════════════════════════════════════════════════════════════════
// Data Binding Resolution
// ═══════════════════════════════════════════════════════════════════

/** Resolve a data binding to a computed value */
function resolveBinding(
  binding: DataBinding,
  data: readonly Record<string, unknown>[],
): unknown {
  const values = data.map((row) => row[binding.field]).filter((v) => v !== null && v !== undefined);

  if (binding.transform && binding.transform in AGGREGATE_FUNCTIONS) {
    const fn = AGGREGATE_FUNCTIONS[binding.transform as AggregateTransform];
    return fn(values);
  }

  return values;
}

/** Build a lookup map of binding ID → resolved value */
function resolveAllBindings(
  bindings: readonly DataBinding[],
  data: readonly Record<string, unknown>[],
): Map<string, unknown> {
  const resolved = new Map<string, unknown>();
  for (const binding of bindings) {
    resolved.set(binding.id, resolveBinding(binding, data));
  }
  return resolved;
}

// ═══════════════════════════════════════════════════════════════════
// Layout Engine
// ═══════════════════════════════════════════════════════════════════

/** Compute CSS Grid styles from layout config */
function computeGridStyle(
  columns: number,
  gap: string,
): Record<string, string> {
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap,
  };
}

/** Compute component grid placement */
function computeComponentStyle(
  position: ComponentInstance['position'],
): Record<string, string> {
  const style: Record<string, string> = {
    gridRow: String(position.row + 1),
    gridColumn: String(position.col + 1),
  };

  if (position.span && position.span > 1) {
    style['gridColumn'] = `${position.col + 1} / span ${position.span}`;
  }

  return style;
}

// ═══════════════════════════════════════════════════════════════════
// Main Renderer
// ═══════════════════════════════════════════════════════════════════

/** Enrich component props with resolved data binding values */
function enrichProps(
  component: ComponentInstance,
  resolvedBindings: Map<string, unknown>,
  data: readonly Record<string, unknown>[],
): Record<string, unknown> {
  const props = { ...component.props };

  if (component.dataBinding && resolvedBindings.has(component.dataBinding)) {
    const resolved = resolvedBindings.get(component.dataBinding);

    switch (component.type) {
      case 'kpi_card':
        props['value'] = resolved;
        break;
      case 'data_table':
        if (Array.isArray(resolved)) {
          props['data'] = data;
        }
        break;
      case 'bar_chart':
        if (Array.isArray(resolved)) {
          props['data'] = resolved;
        }
        break;
      default:
        break;
    }
  }

  return props;
}

export function AppRenderer({ schema, data = [], className }: AppRendererProps): ReactNode {
  const columns = schema.layout.columns ?? 1;
  const gap = schema.layout.gap ?? '1rem';
  const gridStyle = computeGridStyle(columns, gap);
  const resolvedBindings = resolveAllBindings(schema.dataBindings, data);

  // Sort components by row then col for consistent rendering
  const sortedComponents = [...schema.components].sort((a, b) => {
    if (a.position.row !== b.position.row) return a.position.row - b.position.row;
    return a.position.col - b.position.col;
  });

  return (
    <div
      data-app-renderer={schema.id}
      data-archetype={schema.archetype}
      className={className}
      style={gridStyle}
    >
      {sortedComponents.map((component) => {
        const renderer = COMPONENT_MAP[component.type];
        if (!renderer) {
          return (
            <div
              key={component.id}
              data-unknown-component={component.type}
              style={computeComponentStyle(component.position)}
              className="rounded-lg bg-utility-yellow-50 p-4 text-sm text-utility-yellow-700 ring-1 ring-utility-yellow-200 ring-inset"
            >
              Composant non supporte: {component.type}
            </div>
          );
        }

        const enrichedProps = enrichProps(component, resolvedBindings, data);
        const componentStyle = computeComponentStyle(component.position);

        return (
          <div key={component.id} style={componentStyle}>
            <ComponentErrorBoundary
              componentId={component.id}
              componentType={component.type}
            >
              {renderer(enrichedProps, component.id)}
            </ComponentErrorBoundary>
          </div>
        );
      })}
    </div>
  );
}

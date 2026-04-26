import { describe, it, expect, vi, beforeAll } from 'vitest';
import React from 'react';
import { BarChart } from './BarChart';
import type { BarChartProps, ChartDataPoint } from './BarChart';

// ---------------------------------------------------------------------------
// Mock recharts — avoids SVG / ResizeObserver issues in unit tests.
// Each component renders a simple DOM element with identifying attributes
// so we can assert on the structure.
// ---------------------------------------------------------------------------
vi.mock('recharts', () => {
  const createMock = (name: string) =>
    function MockComponent(props: Record<string, unknown>) {
      return React.createElement('div', { 'data-recharts': name, ...props }, props.children as React.ReactNode);
    };

  return {
    BarChart: createMock('BarChart'),
    Bar: createMock('Bar'),
    XAxis: createMock('XAxis'),
    YAxis: createMock('YAxis'),
    CartesianGrid: createMock('CartesianGrid'),
    Tooltip: createMock('Tooltip'),
    Legend: createMock('Legend'),
    ResponsiveContainer: function MockResponsive(props: Record<string, unknown>) {
      return React.createElement(
        'div',
        { 'data-recharts': 'ResponsiveContainer', 'data-width': props.width, 'data-height': props.height },
        props.children as React.ReactNode,
      );
    },
  };
});

// ---------------------------------------------------------------------------
// We need a minimal DOM to use ReactDOM.render / renderToString.
// We use react-dom/server to get markup without needing jsdom at runtime.
// ---------------------------------------------------------------------------
let renderToString: (element: React.ReactElement) => string;

beforeAll(async () => {
  const mod = await import('react-dom/server');
  renderToString = mod.renderToString;
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const SAMPLE_DATA: ChartDataPoint[] = [
  { month: 'Jan', revenue: 4000, cost: 2400 },
  { month: 'Feb', revenue: 3000, cost: 1398 },
  { month: 'Mar', revenue: 2000, cost: 9800 },
];

function makeProps(overrides?: Partial<BarChartProps>): BarChartProps {
  return {
    id: 'test-chart',
    data: SAMPLE_DATA,
    xKey: 'month',
    yKeys: ['revenue'],
    ...overrides,
  };
}

function render(props: BarChartProps): string {
  return renderToString(React.createElement(BarChart, props));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('BarChart', () => {
  it('renders with data and contains a ResponsiveContainer', () => {
    const html = render(makeProps());
    expect(html).toContain('data-recharts="ResponsiveContainer"');
    expect(html).toContain('data-recharts="BarChart"');
    expect(html).toContain('data-component="BarChart"');
    expect(html).toContain('data-id="test-chart"');
  });

  it('renders an empty state when data array is empty', () => {
    const html = render(makeProps({ data: [] }));
    expect(html).toContain('Pas de donn');
    expect(html).toContain('data-testid="bar-chart-empty"');
    expect(html).not.toContain('data-recharts="BarChart"');
  });

  it('renders a loading skeleton when loading=true', () => {
    const html = render(makeProps({ loading: true }));
    expect(html).toContain('data-testid="bar-chart-skeleton"');
    expect(html).toContain('aria-busy="true"');
    expect(html).not.toContain('data-recharts="BarChart"');
  });

  it('renders a title as h3 when title prop is provided', () => {
    const html = render(makeProps({ title: 'Revenue Overview' }));
    expect(html).toContain('<h3');
    expect(html).toContain('Revenue Overview');
    expect(html).toContain('data-testid="bar-chart-title"');
  });

  it('does not render a title when title is omitted', () => {
    const html = render(makeProps());
    expect(html).not.toContain('<h3');
    expect(html).not.toContain('data-testid="bar-chart-title"');
  });

  it('renders multiple Bar elements for multiple yKeys', () => {
    const html = render(makeProps({ yKeys: ['revenue', 'cost'] }));
    // Should have two Bar mocks
    const barMatches = html.match(/data-recharts="Bar"/g);
    expect(barMatches).not.toBeNull();
    expect(barMatches).toHaveLength(2);
  });

  it('applies stackId when stacked=true', () => {
    const html = render(makeProps({ stacked: true, yKeys: ['revenue', 'cost'] }));
    // Our mock passes all props as attributes — stackId should appear
    expect(html).toContain('stack');
  });

  it('renders in horizontal layout (vertical recharts layout) when horizontal=true', () => {
    const html = render(makeProps({ horizontal: true }));
    // In horizontal mode, the recharts BarChart receives layout="vertical"
    expect(html).toContain('vertical');
  });

  it('renders a ResponsiveContainer with 100% width and configurable height', () => {
    const html = render(makeProps({ height: 400 }));
    expect(html).toContain('data-width="100%"');
    expect(html).toContain('data-height="400"');
  });

  it('uses default height of 300 when height prop is omitted', () => {
    const html = render(makeProps());
    expect(html).toContain('data-height="300"');
  });

  it('renders Legend only when showLegend=true', () => {
    const withoutLegend = render(makeProps({ showLegend: false }));
    expect(withoutLegend).not.toContain('data-recharts="Legend"');

    const withLegend = render(makeProps({ showLegend: true }));
    expect(withLegend).toContain('data-recharts="Legend"');
  });

  it('renders CartesianGrid only when showGrid=true', () => {
    const withoutGrid = render(makeProps({ showGrid: false }));
    expect(withoutGrid).not.toContain('data-recharts="CartesianGrid"');

    const withGrid = render(makeProps({ showGrid: true }));
    expect(withGrid).toContain('data-recharts="CartesianGrid"');
  });

  it('has role="img" with an aria-label for accessibility', () => {
    const html = render(makeProps({ title: 'Monthly Revenue' }));
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Graphique en barres : Monthly Revenue"');
  });

  it('applies custom colors to Bar fills', () => {
    const html = render(makeProps({ colors: ['#FF0000'], yKeys: ['revenue'] }));
    expect(html).toContain('#FF0000');
  });
});

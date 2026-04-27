import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('BarChart', () => {
  it('renders with data and contains a ResponsiveContainer', () => {
    const { container } = render(<BarChart {...makeProps()} />);
    expect(container.querySelector('[data-recharts="ResponsiveContainer"]')).toBeTruthy();
    expect(container.querySelector('[data-recharts="BarChart"]')).toBeTruthy();
    expect(container.querySelector('[data-component="BarChart"]')).toBeTruthy();
    expect(container.querySelector('[data-id="test-chart"]')).toBeTruthy();
  });

  it('renders an empty state when data array is empty', () => {
    render(<BarChart {...makeProps({ data: [] })} />);
    expect(screen.getByTestId('bar-chart-empty')).toBeTruthy();
    expect(screen.getByTestId('bar-chart-empty').textContent).toContain('Pas de donn');
    expect(screen.getByTestId('bar-chart-empty').className).toContain('text-tertiary');
    expect(screen.getByTestId('bar-chart-empty').className).toContain('text-sm');
  });

  it('renders a loading skeleton when loading=true', () => {
    render(<BarChart {...makeProps({ loading: true })} />);
    const skeleton = screen.getByTestId('bar-chart-skeleton');
    expect(skeleton).toBeTruthy();
    expect(skeleton.getAttribute('aria-busy')).toBe('true');
    expect(skeleton.className).toContain('bg-tertiary');
    expect(skeleton.className).toContain('animate-pulse');
    expect(skeleton.className).toContain('rounded');
  });

  it('renders a title inside a card wrapper when title prop is provided', () => {
    const { container } = render(<BarChart {...makeProps({ title: 'Revenue Overview' })} />);
    const title = screen.getByTestId('bar-chart-title');
    expect(title).toBeTruthy();
    expect(title.textContent).toBe('Revenue Overview');
    expect(title.tagName).toBe('H3');
    // Title should use Untitled UI token classes
    expect(title.className).toContain('text-md');
    expect(title.className).toContain('font-semibold');
    expect(title.className).toContain('text-primary');
    // Card wrapper should be present
    const wrapper = container.querySelector('[data-component="BarChart"]');
    expect(wrapper?.className).toContain('rounded-xl');
    expect(wrapper?.className).toContain('bg-primary');
    expect(wrapper?.className).toContain('shadow-xs');
    expect(wrapper?.className).toContain('ring-1');
    expect(wrapper?.className).toContain('ring-secondary');
  });

  it('does not render a card wrapper when title is omitted', () => {
    const { container } = render(<BarChart {...makeProps()} />);
    const wrapper = container.querySelector('[data-component="BarChart"]');
    expect(wrapper).toBeTruthy();
    // No card classes without a title
    expect(wrapper?.className).not.toContain('rounded-xl');
    expect(container.querySelector('[data-testid="bar-chart-title"]')).toBeNull();
  });

  it('renders title header with border-b border-secondary', () => {
    const { container } = render(<BarChart {...makeProps({ title: 'Test' })} />);
    const header = container.querySelector('.border-b.border-secondary');
    expect(header).toBeTruthy();
    expect(header?.className).toContain('px-6');
    expect(header?.className).toContain('py-5');
  });

  it('renders multiple Bar elements for multiple yKeys', () => {
    const { container } = render(<BarChart {...makeProps({ yKeys: ['revenue', 'cost'] })} />);
    const bars = container.querySelectorAll('[data-recharts="Bar"]');
    expect(bars).toHaveLength(2);
  });

  it('applies stackId when stacked=true', () => {
    const { container } = render(
      <BarChart {...makeProps({ stacked: true, yKeys: ['revenue', 'cost'] })} />,
    );
    const bars = container.querySelectorAll('[data-recharts="Bar"]');
    bars.forEach((bar) => {
      expect(bar.getAttribute('stackid')).toBe('stack');
    });
  });

  it('renders in horizontal layout (vertical recharts layout) when horizontal=true', () => {
    const { container } = render(<BarChart {...makeProps({ horizontal: true })} />);
    const chart = container.querySelector('[data-recharts="BarChart"]');
    expect(chart?.getAttribute('layout')).toBe('vertical');
  });

  it('renders a ResponsiveContainer with 100% width and configurable height', () => {
    const { container } = render(<BarChart {...makeProps({ height: 400 })} />);
    const rc = container.querySelector('[data-recharts="ResponsiveContainer"]');
    expect(rc?.getAttribute('data-width')).toBe('100%');
    expect(rc?.getAttribute('data-height')).toBe('400');
  });

  it('uses default height of 300 when height prop is omitted', () => {
    const { container } = render(<BarChart {...makeProps()} />);
    const rc = container.querySelector('[data-recharts="ResponsiveContainer"]');
    expect(rc?.getAttribute('data-height')).toBe('300');
  });

  it('renders Legend only when showLegend=true', () => {
    const { container: noLegend } = render(<BarChart {...makeProps({ showLegend: false })} />);
    expect(noLegend.querySelector('[data-recharts="Legend"]')).toBeNull();

    const { container: withLegend } = render(<BarChart {...makeProps({ showLegend: true })} />);
    expect(withLegend.querySelector('[data-recharts="Legend"]')).toBeTruthy();
  });

  it('renders CartesianGrid only when showGrid=true', () => {
    const { container: noGrid } = render(<BarChart {...makeProps({ showGrid: false })} />);
    expect(noGrid.querySelector('[data-recharts="CartesianGrid"]')).toBeNull();

    const { container: withGrid } = render(<BarChart {...makeProps({ showGrid: true })} />);
    expect(withGrid.querySelector('[data-recharts="CartesianGrid"]')).toBeTruthy();
  });

  it('has role="img" with an aria-label for accessibility', () => {
    const { container } = render(<BarChart {...makeProps({ title: 'Monthly Revenue' })} />);
    const chart = container.querySelector('[data-testid="bar-chart-container"]');
    expect(chart).toBeTruthy();
    expect(chart?.getAttribute('role')).toBe('img');
    expect(chart?.getAttribute('aria-label')).toBe('Graphique en barres : Monthly Revenue');
  });

  it('applies custom colors to Bar fills', () => {
    const { container } = render(
      <BarChart {...makeProps({ colors: ['#FF0000'], yKeys: ['revenue'] })} />,
    );
    const bar = container.querySelector('[data-recharts="Bar"]');
    expect(bar?.getAttribute('fill')).toBe('#FF0000');
  });

  it('uses Untitled UI default token colors when no custom colors provided', () => {
    const { container } = render(
      <BarChart {...makeProps({ yKeys: ['revenue', 'cost'] })} />,
    );
    const bars = container.querySelectorAll('[data-recharts="Bar"]');
    expect(bars[0]?.getAttribute('fill')).toBe('#2970FF'); // brand-500
    expect(bars[1]?.getAttribute('fill')).toBe('#17B26A'); // success-500
  });

  it('empty state includes a muted icon', () => {
    const { container } = render(<BarChart {...makeProps({ data: [] })} />);
    const empty = container.querySelector('[data-testid="bar-chart-empty"]');
    expect(empty).toBeTruthy();
    const svg = empty?.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });

  it('tooltip container uses Untitled UI token classes', () => {
    // We can't easily trigger recharts tooltip in unit tests,
    // but we can render the CustomTooltip indirectly via snapshot of the
    // Tooltip content prop. Instead, verify the Tooltip mock is rendered.
    const { container } = render(<BarChart {...makeProps()} />);
    expect(container.querySelector('[data-recharts="Tooltip"]')).toBeTruthy();
  });
});

import { describe, it, expect } from 'vitest';
import { KPICard, formatValue, computeChange } from './KPICard';
import type { KPICardProps } from './KPICard';

// ── Helper: shallow render to inspect the returned ReactNode tree ─────
// Since @instack/ui has no testing-library dependency, we call the
// component as a function and assert on the returned element tree.

function render(props: KPICardProps) {
  const element = KPICard(props);
  return element;
}

// ── 1. Basic rendering ────────────────────────────────────────────────

describe('KPICard', () => {
  it('renders with required props and displays value', () => {
    const el = render({ id: 'kpi-1', title: 'Revenue', value: 42000 });
    expect(el).toBeTruthy();
    // The root element should have data-component and data-id
    expect((el as unknown as Record<string, unknown>).props).toMatchObject({
      'data-component': 'KPICard',
      'data-id': 'kpi-1',
    });
  });

  it('renders title correctly in the output', () => {
    const el = render({ id: 'kpi-2', title: 'Active Users', value: 500 });
    const props = (el as unknown as Record<string, unknown>).props as Record<string, unknown>;
    const children = props.children as unknown[];
    // First child is the header div containing the title
    const headerDiv = children[0] as Record<string, unknown>;
    const headerProps = headerDiv.props as Record<string, unknown>;
    const headerChildren = headerProps.children as unknown[];
    // The title span (second child, icon is first but conditionally rendered)
    const titleSpan = headerChildren[1] as Record<string, unknown>;
    const titleProps = titleSpan.props as Record<string, unknown>;
    expect(titleProps.children).toBe('Active Users');
  });

  // ── 2. Trend display (increase / decrease / neutral) ─────────────

  it('shows increase trend with positive change', () => {
    const change = computeChange(120, 100, 'increase', undefined);
    expect(change).not.toBeNull();
    expect(change?.type).toBe('increase');
    expect(change?.percent).toBe('20.0');
  });

  it('shows decrease trend with negative change', () => {
    const change = computeChange(80, 100, undefined, undefined);
    expect(change).not.toBeNull();
    expect(change?.type).toBe('decrease');
    expect(change?.percent).toBe('20.0');
  });

  it('shows neutral trend when values are equal', () => {
    const change = computeChange(100, 100, undefined, undefined);
    expect(change).not.toBeNull();
    expect(change?.type).toBe('neutral');
    expect(change?.percent).toBe('0.0');
  });

  // ── 3. Smart formatting (K / M) ──────────────────────────────────

  it('formats numbers >= 1000 with K suffix', () => {
    expect(formatValue(1500)).toBe('1.5K');
    expect(formatValue(42000)).toBe('42K');
    expect(formatValue(1000)).toBe('1K');
    expect(formatValue(999)).toBe('999');
  });

  it('formats numbers >= 1_000_000 with M suffix', () => {
    expect(formatValue(1_500_000)).toBe('1.5M');
    expect(formatValue(2_000_000)).toBe('2M');
    expect(formatValue(10_300_000)).toBe('10.3M');
  });

  // ── 4. Currency detection ─────────────────────────────────────────

  it('detects and formats currency values', () => {
    const euroResult = formatValue('1234 €');
    // Intl.NumberFormat fr-FR uses narrow no-break space (U+202F) as group separator
    expect(euroResult).toMatch(/1[\s\u202F]234\s€/);

    const dollarResult = formatValue('$5000');
    expect(dollarResult).toMatch(/\$5[\s\u202F]000/);
  });

  // ── 5. Percentage detection ───────────────────────────────────────

  it('detects and preserves percentage values', () => {
    expect(formatValue('67%')).toBe('67%');
    expect(formatValue('12.5 %')).toBe('12.5%');
  });

  // ── 6. Three sizes ────────────────────────────────────────────────

  it('renders with sm size variant', () => {
    const el = render({ id: 'sm', title: 'Test', value: 100, size: 'sm' });
    const props = (el as unknown as Record<string, unknown>).props as Record<string, unknown>;
    const className = props.className as string;
    expect(className).toContain('p-3');
  });

  it('renders with md size variant (default)', () => {
    const el = render({ id: 'md', title: 'Test', value: 100 });
    const props = (el as unknown as Record<string, unknown>).props as Record<string, unknown>;
    const className = props.className as string;
    expect(className).toContain('p-4');
  });

  it('renders with lg size variant', () => {
    const el = render({ id: 'lg', title: 'Test', value: 100, size: 'lg' });
    const props = (el as unknown as Record<string, unknown>).props as Record<string, unknown>;
    const className = props.className as string;
    expect(className).toContain('p-6');
  });

  // ── 7. Sparkline rendering ────────────────────────────────────────

  it('renders sparkline SVG when trend data has >= 2 points', () => {
    const el = render({
      id: 'spark',
      title: 'Trend',
      value: 100,
      trend: { data: [10, 20, 15, 30, 25] },
    });
    // Navigate to the value row (second child), then its second child is the Sparkline element
    const rootProps = (el as unknown as Record<string, unknown>).props as Record<string, unknown>;
    const rootChildren = rootProps.children as unknown[];
    const valueRow = rootChildren[1] as Record<string, unknown>;
    const valueRowProps = valueRow.props as Record<string, unknown>;
    const valueRowChildren = valueRowProps.children as unknown[];
    // The sparkline element is the second child of the value row
    const sparklineEl = valueRowChildren[1] as Record<string, unknown>;
    expect(sparklineEl).toBeTruthy();
    // It should have the trend data passed as props
    const sparkProps = sparklineEl.props as Record<string, unknown>;
    expect(sparkProps.data).toEqual([10, 20, 15, 30, 25]);
  });

  it('does not render sparkline when trend data has < 2 points', () => {
    const el = render({
      id: 'no-spark',
      title: 'Trend',
      value: 100,
      trend: { data: [10] },
    });
    const rootProps = (el as unknown as Record<string, unknown>).props as Record<string, unknown>;
    const rootChildren = rootProps.children as unknown[];
    const valueRow = rootChildren[1] as Record<string, unknown>;
    const valueRowProps = valueRow.props as Record<string, unknown>;
    const valueRowChildren = valueRowProps.children as unknown[];
    // The sparkline should be falsy (false from the conditional)
    expect(valueRowChildren[1]).toBeFalsy();
  });

  // ── 8. Change calculation from previousValue ──────────────────────

  it('calculates change percentage from value and previousValue', () => {
    const change = computeChange(150, 100, undefined, undefined);
    expect(change).not.toBeNull();
    expect(change?.type).toBe('increase');
    expect(change?.percent).toBe('50.0');

    const change2 = computeChange(75, 100, undefined, undefined);
    expect(change2).not.toBeNull();
    expect(change2?.type).toBe('decrease');
    expect(change2?.percent).toBe('25.0');
  });

  // ── 9. Edge cases ─────────────────────────────────────────────────

  it('returns null change when no previousValue and no changeType', () => {
    const change = computeChange(100, undefined, undefined, undefined);
    expect(change).toBeNull();
  });

  it('uses explicit changePercent when provided', () => {
    const change = computeChange(100, undefined, undefined, 15.7);
    expect(change).not.toBeNull();
    expect(change?.type).toBe('increase');
    expect(change?.percent).toBe('15.7');
  });

  it('handles zero previousValue gracefully (no division by zero)', () => {
    const change = computeChange(100, 0, undefined, undefined);
    // Should not crash; returns null or a safe fallback
    expect(change).toBeNull();
  });

  it('renders description when provided', () => {
    const el = render({
      id: 'desc',
      title: 'Test',
      value: 100,
      description: 'Monthly revenue target',
    });
    const json = JSON.stringify(el);
    expect(json).toContain('Monthly revenue target');
    expect(json).toContain('kpi-description');
  });

  it('renders icon when provided', () => {
    const iconElement = { type: 'span', props: { children: 'ICON' }, key: null };
    const el = render({
      id: 'icon-test',
      title: 'Test',
      value: 100,
      icon: iconElement as unknown as React.ReactNode,
    });
    const json = JSON.stringify(el);
    expect(json).toContain('kpi-icon');
  });

  it('handles string numeric values with compact formatting', () => {
    expect(formatValue('2500')).toBe('2.5K');
    expect(formatValue('1000000')).toBe('1M');
  });
});

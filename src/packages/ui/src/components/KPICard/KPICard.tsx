import type { ReactNode } from 'react';

export interface KPICardProps {
  id: string;
  title: string;
  value: string | number;
  previousValue?: string | number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  changePercent?: number;
  icon?: ReactNode;
  description?: string;
  trend?: { data: number[]; color?: string };
  size?: 'sm' | 'md' | 'lg';
}

// ── Value Formatting ──────────────────────────────────────────────────

const CURRENCY_RE = /^[\s]*([€$£])\s*([\d\s.,]+)$|^([\d\s.,]+)\s*([€$£])[\s]*$/;
const PERCENT_RE = /^[\s]*([\d.,]+)\s*%[\s]*$/;

/**
 * Parse a raw numeric string (with spaces, commas, or dots as thousands/decimal separators)
 * into a plain number. Handles both "1 234,56" (FR) and "1,234.56" (EN) formats.
 */
function parseNumericString(raw: string): number {
  // Remove all whitespace
  const cleaned = raw.replace(/\s/g, '');

  // If both comma and dot exist, the last one is the decimal separator
  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');

  if (lastComma > lastDot) {
    // FR style: 1.234,56 or 1234,56
    return parseFloat(cleaned.replace(/\./g, '').replace(',', '.'));
  }
  // EN style or no decimal: 1,234.56 or 1234
  return parseFloat(cleaned.replace(/,/g, ''));
}

/**
 * Format a large number with K/M suffixes.
 */
function formatCompactNumber(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) {
    const val = n / 1_000_000;
    return `${Number.isInteger(val) ? String(val) : val.toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    const val = n / 1_000;
    return `${Number.isInteger(val) ? String(val) : val.toFixed(1)}K`;
  }
  return String(n);
}

/**
 * Format a number in the French locale style for currency: "1 234 €"
 */
function formatCurrency(n: number, symbol: string): string {
  const formatted = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(n);

  // Symbol position: € and £ go after, $ goes before
  if (symbol === '$') {
    return `$${formatted}`;
  }
  return `${formatted} ${symbol}`;
}

/**
 * Smart value formatting: detects currency, percentage, or plain number
 * and applies the appropriate formatting.
 */
export function formatValue(value: string | number): string {
  if (typeof value === 'number') {
    return formatCompactNumber(value);
  }

  // Check for percentage
  const percentMatch = PERCENT_RE.exec(value);
  if (percentMatch) {
    return `${percentMatch[1]}%`;
  }

  // Check for currency
  const currencyMatch = CURRENCY_RE.exec(value);
  if (currencyMatch) {
    const symbol = currencyMatch[1] ?? currencyMatch[4] ?? '';
    const rawNumber = currencyMatch[2] ?? currencyMatch[3] ?? '';
    const n = parseNumericString(rawNumber);
    if (!Number.isNaN(n)) {
      return formatCurrency(n, symbol);
    }
  }

  // Fallback: try to parse as plain number for compact formatting
  const n = parseNumericString(value);
  if (!Number.isNaN(n)) {
    return formatCompactNumber(n);
  }

  return value;
}

// ── Change Calculation ────────────────────────────────────────────────

interface ChangeInfo {
  type: 'increase' | 'decrease' | 'neutral';
  percent: string;
}

function extractNumericValue(val: string | number): number {
  if (typeof val === 'number') return val;
  const cleaned = val.replace(/[€$£%\s]/g, '');
  return parseNumericString(cleaned);
}

export function computeChange(
  value: string | number,
  previousValue: string | number | undefined,
  changeType?: 'increase' | 'decrease' | 'neutral',
  changePercent?: number,
): ChangeInfo | null {
  // If explicit changePercent is provided, use it directly
  if (changePercent !== undefined && changeType !== undefined) {
    return {
      type: changeType,
      percent: changePercent.toFixed(1),
    };
  }

  if (changePercent !== undefined) {
    const type = changePercent > 0 ? 'increase' : changePercent < 0 ? 'decrease' : 'neutral';
    return {
      type,
      percent: Math.abs(changePercent).toFixed(1),
    };
  }

  // Calculate from current / previous values
  if (previousValue === undefined) {
    if (changeType !== undefined) {
      return { type: changeType, percent: '0.0' };
    }
    return null;
  }

  const current = extractNumericValue(value);
  const previous = extractNumericValue(previousValue);

  if (Number.isNaN(current) || Number.isNaN(previous) || previous === 0) {
    return changeType ? { type: changeType, percent: '0.0' } : null;
  }

  const pct = ((current - previous) / previous) * 100;
  const resolvedType = changeType ?? (pct > 0 ? 'increase' : pct < 0 ? 'decrease' : 'neutral');

  return {
    type: resolvedType,
    percent: Math.abs(pct).toFixed(1),
  };
}

// ── Sparkline SVG ─────────────────────────────────────────────────────

const SPARKLINE_DEFAULTS = { width: 80, height: 32, strokeWidth: 1.5 } as const;

interface SparklineProps {
  data: number[];
  color?: string | undefined;
  width?: number | undefined;
  height?: number | undefined;
}

function Sparkline({ data, color, width = SPARKLINE_DEFAULTS.width, height = SPARKLINE_DEFAULTS.height }: SparklineProps): ReactNode {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const padding = 2;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * innerWidth;
    const y = padding + innerHeight - ((val - min) / range) * innerHeight;
    return `${String(x)},${String(y)}`;
  });

  // Use explicit color if provided, otherwise default to Untitled UI brand token class
  const useClassColor = color === undefined;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${String(width)} ${String(height)}`}
      fill="none"
      aria-hidden="true"
      data-testid="sparkline"
      className="shrink-0"
    >
      <polyline
        points={points.join(' ')}
        stroke={useClassColor ? undefined : color}
        className={useClassColor ? 'stroke-utility-brand-500' : undefined}
        strokeWidth={SPARKLINE_DEFAULTS.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

// ── Trend Arrow Icon ──────────────────────────────────────────────────

function TrendArrow({ type }: { type: 'increase' | 'decrease' | 'neutral' }): ReactNode {
  if (type === 'neutral') {
    return (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" data-testid="trend-arrow-neutral">
        <path d="M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  const isUp = type === 'increase';
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      data-testid={`trend-arrow-${type}`}
    >
      <path
        d={isUp ? 'M6 10V2m0 0L2.5 5.5M6 2l3.5 3.5' : 'M6 2v8m0 0l3.5-3.5M6 10L2.5 6.5'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Size Config ───────────────────────────────────────────────────────

interface SizeConfig {
  container: string;
  title: string;
  value: string;
  badge: string;
  iconWrapper: string;
  sparklineWidth: number;
  sparklineHeight: number;
}

const SIZE_MAP: Record<NonNullable<KPICardProps['size']>, SizeConfig> = {
  sm: {
    container: 'p-4 gap-2',
    title: 'text-sm font-medium',
    value: 'text-lg font-semibold',
    badge: 'text-xs gap-0.5 px-1.5 py-0.5',
    iconWrapper: 'size-8 rounded-lg',
    sparklineWidth: 60,
    sparklineHeight: 24,
  },
  md: {
    container: 'p-5 gap-3',
    title: 'text-sm font-medium',
    value: 'text-display-xs font-semibold',
    badge: 'text-sm gap-1 px-2 py-0.5',
    iconWrapper: 'size-10 rounded-lg',
    sparklineWidth: 80,
    sparklineHeight: 32,
  },
  lg: {
    container: 'p-6 gap-4',
    title: 'text-sm font-medium',
    value: 'text-display-sm font-semibold',
    badge: 'text-sm gap-1 px-2.5 py-1',
    iconWrapper: 'size-12 rounded-xl',
    sparklineWidth: 100,
    sparklineHeight: 40,
  },
};

/** Untitled UI utility color classes for trend badges */
const CHANGE_TYPE_STYLES: Record<NonNullable<KPICardProps['changeType']>, string> = {
  increase: 'text-utility-green-700 bg-utility-green-50',
  decrease: 'text-utility-red-700 bg-utility-red-50',
  neutral: 'text-utility-neutral-700 bg-utility-neutral-50',
};

// ── Component ─────────────────────────────────────────────────────────

/**
 * KPICard displays a key performance indicator with optional trend visualization.
 *
 * Features:
 * - Smart value formatting (K/M suffixes, currency detection, percentage)
 * - Trend indicator with colored arrow and percentage change
 * - Optional mini sparkline chart (pure SVG, no dependencies)
 * - Three size variants: sm, md, lg
 * - Untitled UI semantic design token classes throughout
 */
export function KPICard({
  id,
  title,
  value,
  previousValue,
  changeType,
  changePercent,
  icon,
  description,
  trend,
  size = 'md',
}: KPICardProps): ReactNode {
  const sizeConfig = SIZE_MAP[size];
  const change = computeChange(value, previousValue, changeType, changePercent);
  const formattedValue = formatValue(value);

  return (
    <div
      data-component="KPICard"
      data-id={id}
      className={[
        'flex flex-col w-full',
        'rounded-xl bg-primary shadow-xs ring-1 ring-secondary',
        sizeConfig.container,
      ].join(' ')}
    >
      {/* Header: icon + title */}
      <div className="flex items-center gap-2">
        {icon != null && (
          <span
            className={[
              'inline-flex items-center justify-center shrink-0',
              'bg-utility-brand-50 text-utility-brand-700',
              sizeConfig.iconWrapper,
            ].join(' ')}
            data-testid="kpi-icon"
          >
            {icon}
          </span>
        )}
        <span className={['text-secondary truncate', sizeConfig.title].join(' ')}>
          {title}
        </span>
      </div>

      {/* Value row: large value + sparkline */}
      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <span
            className={['text-primary tracking-tight', sizeConfig.value].join(' ')}
            data-testid="kpi-value"
          >
            {formattedValue}
          </span>

          {/* Change badge */}
          {change != null && (
            <div className="flex items-center gap-2">
              <span
                className={[
                  'inline-flex items-center rounded-full font-medium',
                  sizeConfig.badge,
                  CHANGE_TYPE_STYLES[change.type],
                ].join(' ')}
                data-testid="kpi-change"
              >
                <TrendArrow type={change.type} />
                {change.percent}%
              </span>
              {previousValue !== undefined && (
                <span className="text-xs text-tertiary">
                  vs prev.
                </span>
              )}
            </div>
          )}
        </div>

        {/* Sparkline */}
        {trend != null && trend.data.length >= 2 && (
          <Sparkline
            data={trend.data}
            color={trend.color}
            width={sizeConfig.sparklineWidth}
            height={sizeConfig.sparklineHeight}
          />
        )}
      </div>

      {/* Description */}
      {description != null && description.length > 0 && (
        <p
          className="text-sm text-tertiary mt-1 truncate"
          data-testid="kpi-description"
        >
          {description}
        </p>
      )}
    </div>
  );
}

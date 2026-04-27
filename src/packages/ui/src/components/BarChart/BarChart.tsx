import type { ReactNode } from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

/**
 * A single data point in the chart. Keys map to axis identifiers;
 * values are either category labels (string) or numeric measures.
 */
export interface ChartDataPoint {
  [key: string]: string | number;
}

/** Props for the BarChart component. */
export interface BarChartProps {
  id: string;
  data: ChartDataPoint[];
  xKey: string;
  yKeys: string[];
  colors?: string[];
  stacked?: boolean;
  horizontal?: boolean;
  showLegend?: boolean;
  showGrid?: boolean;
  height?: number;
  title?: string;
  loading?: boolean;
}

/**
 * Untitled UI design-token hex values used for chart fills.
 * These map to the @theme tokens defined in theme.css:
 *   brand-500, success-500, warning-500, error-500, gray-400
 */
const DEFAULT_COLORS: readonly string[] = [
  '#2970FF', // brand-500
  '#17B26A', // utility-green-500 (success-500)
  '#F79009', // utility-yellow-500 (warning-500)
  '#F04438', // utility-red-500 (error-500)
  '#98A2B3', // neutral-400 (gray-400)
] as const;

/** Untitled UI semantic hex values for axis / grid / tooltip text. */
const TOKENS = {
  textPrimary: '#101828',   // gray-900 — text-primary
  textSecondary: '#344054', // gray-700 — text-secondary
  textTertiary: '#475467',  // gray-600 — text-tertiary
  textQuaternary: '#667085', // gray-500 — text-quaternary
  borderSecondary: '#EAECF0', // gray-200 — border-secondary
  bgPrimary: '#FFFFFF',
  bgTertiary: '#F2F4F7',    // gray-100
} as const;

/**
 * Skeleton placeholder rendered while chart data is loading.
 * Uses Untitled UI token classes: bg-tertiary, animate-pulse, rounded.
 */
function BarChartSkeleton({ height }: { height: number }): ReactNode {
  return (
    <div
      data-testid="bar-chart-skeleton"
      className="bg-tertiary animate-pulse rounded"
      style={{ width: '100%', height }}
      aria-busy="true"
      aria-label="Chargement du graphique"
    />
  );
}

/**
 * Empty-state placeholder when no data is available.
 * Uses Untitled UI token classes: text-sm text-tertiary, centered.
 */
function BarChartEmpty(): ReactNode {
  return (
    <div
      data-testid="bar-chart-empty"
      className="flex items-center justify-center w-full text-sm text-tertiary"
      style={{ minHeight: 120 }}
    >
      <svg
        className="mr-2 text-quaternary"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <rect x="1" y="8" width="3" height="6" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="6" y="5" width="3" height="9" rx="0.5" fill="currentColor" opacity="0.35" />
        <rect x="11" y="2" width="3" height="12" rx="0.5" fill="currentColor" opacity="0.2" />
      </svg>
      Pas de donn&#233;es
    </div>
  );
}

/**
 * Custom tooltip rendered on bar hover.
 * Styled with Untitled UI card-like tokens:
 *   bg-primary shadow-lg ring-1 ring-secondary rounded-lg p-3
 */
interface CustomTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps): ReactNode {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div
      data-testid="bar-chart-tooltip"
      className="bg-primary shadow-lg ring-1 ring-secondary rounded-lg p-3"
    >
      <p className="m-0 text-sm font-semibold text-secondary">{label}</p>
      {payload.map((entry) => (
        <p
          key={entry.name}
          className="mt-1 mb-0 flex items-center gap-1.5 text-sm"
          style={{ color: entry.color }}
        >
          <span
            className="inline-block size-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          {entry.name}:&nbsp;
          <strong>{typeof entry.value === 'number' ? entry.value.toLocaleString('fr-FR') : entry.value}</strong>
        </p>
      ))}
    </div>
  );
}

/**
 * BarChart — production-ready bar chart component.
 *
 * Supports vertical/horizontal layout, stacked/grouped modes,
 * multiple Y series, optional legend/grid, loading and empty states.
 *
 * Styled with Untitled UI design tokens via Tailwind CSS v4 classes.
 * When a title is provided the chart is wrapped in a card container.
 */
export function BarChart({
  id,
  data,
  xKey,
  yKeys,
  colors,
  stacked = false,
  horizontal = false,
  showLegend = false,
  showGrid = false,
  height = 300,
  title,
  loading = false,
}: BarChartProps): ReactNode {
  const palette = colors ?? DEFAULT_COLORS;
  const hasTitle = title != null && title.length > 0;

  const ariaLabel = title
    ? `Graphique en barres : ${title}`
    : `Graphique en barres avec ${String(yKeys.length)} s${yKeys.length > 1 ? 'eries' : 'erie'}`;

  const chartContent = (
    <>
      {loading ? (
        <BarChartSkeleton height={height} />
      ) : data.length === 0 ? (
        <BarChartEmpty />
      ) : (
        <div
          role="img"
          aria-label={ariaLabel}
          data-testid="bar-chart-container"
        >
          <ResponsiveContainer width="100%" height={height}>
            <RechartsBarChart
              data={data as Record<string, unknown>[]}
              layout={horizontal ? 'vertical' : 'horizontal'}
              margin={{ top: 8, right: 16, bottom: 8, left: 16 }}
            >
              {showGrid && (
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={TOKENS.borderSecondary}
                  vertical={!horizontal}
                  horizontal={!horizontal}
                />
              )}

              {horizontal ? (
                <>
                  <YAxis
                    dataKey={xKey}
                    type="category"
                    tick={{ fontSize: 12, fill: TOKENS.textQuaternary }}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: TOKENS.textQuaternary }}
                    axisLine={false}
                    tickLine={false}
                  />
                </>
              ) : (
                <>
                  <XAxis
                    dataKey={xKey}
                    tick={{ fontSize: 12, fill: TOKENS.textQuaternary }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: TOKENS.textQuaternary }}
                    axisLine={false}
                    tickLine={false}
                    width={60}
                  />
                </>
              )}

              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />

              {showLegend && (
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, color: TOKENS.textQuaternary }}
                />
              )}

              {yKeys.map((key, index) =>
                stacked ? (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={palette[index % palette.length] ?? DEFAULT_COLORS[0]}
                    stackId="stack"
                    maxBarSize={48}
                  />
                ) : (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={palette[index % palette.length] ?? DEFAULT_COLORS[0]}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={48}
                  />
                ),
              )}
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );

  if (hasTitle) {
    return (
      <div
        data-component="BarChart"
        data-id={id}
        className="rounded-xl bg-primary shadow-xs ring-1 ring-secondary"
      >
        <div className="px-6 py-5 border-b border-secondary">
          <h3
            data-testid="bar-chart-title"
            className="m-0 text-md font-semibold text-primary"
          >
            {title}
          </h3>
        </div>
        <div className="p-6">
          {chartContent}
        </div>
      </div>
    );
  }

  return (
    <div data-component="BarChart" data-id={id}>
      {chartContent}
    </div>
  );
}

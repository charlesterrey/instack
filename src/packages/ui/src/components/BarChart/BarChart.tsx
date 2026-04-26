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

/** Brand-aligned default colour palette. */
const DEFAULT_COLORS: readonly string[] = [
  '#2970FF', // brand
  '#17B26A', // success
  '#F79009', // warning
  '#F04438', // error
  '#667085', // gray
] as const;

/**
 * Skeleton placeholder rendered while chart data is loading.
 * Uses CSS animation for a pulsing effect.
 */
function BarChartSkeleton({ height }: { height: number }): ReactNode {
  return (
    <div
      data-testid="bar-chart-skeleton"
      style={{
        width: '100%',
        height,
        borderRadius: 8,
        background: 'linear-gradient(90deg, #F2F4F7 25%, #E4E7EC 50%, #F2F4F7 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
      }}
      aria-busy="true"
      aria-label="Chargement du graphique"
    />
  );
}

/**
 * Empty-state placeholder when no data is available.
 */
function BarChartEmpty(): ReactNode {
  return (
    <div
      data-testid="bar-chart-empty"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        minHeight: 120,
        color: '#667085',
        fontSize: 14,
      }}
    >
      Pas de donn&#233;es
    </div>
  );
}

/**
 * Custom tooltip rendered on bar hover.
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
      style={{
        background: '#FFFFFF',
        border: '1px solid #E4E7EC',
        borderRadius: 8,
        padding: '8px 12px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        fontSize: 13,
      }}
    >
      <p style={{ margin: 0, fontWeight: 600, color: '#344054' }}>{label}</p>
      {payload.map((entry) => (
        <p
          key={entry.name}
          style={{
            margin: '4px 0 0',
            color: entry.color,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: entry.color,
            }}
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

  const ariaLabel = title
    ? `Graphique en barres : ${title}`
    : `Graphique en barres avec ${String(yKeys.length)} s${yKeys.length > 1 ? 'eries' : 'erie'}`;

  return (
    <div data-component="BarChart" data-id={id}>
      {title != null && title.length > 0 && (
        <h3
          data-testid="bar-chart-title"
          style={{
            margin: '0 0 12px',
            fontSize: 16,
            fontWeight: 600,
            color: '#101828',
          }}
        >
          {title}
        </h3>
      )}

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
                  stroke="#E4E7EC"
                  vertical={!horizontal}
                  horizontal={!horizontal ? true : false}
                />
              )}

              {horizontal ? (
                <>
                  <YAxis
                    dataKey={xKey}
                    type="category"
                    tick={{ fontSize: 12, fill: '#667085' }}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: '#667085' }}
                    axisLine={false}
                    tickLine={false}
                  />
                </>
              ) : (
                <>
                  <XAxis
                    dataKey={xKey}
                    tick={{ fontSize: 12, fill: '#667085' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#667085' }}
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
                  wrapperStyle={{ fontSize: 12, color: '#667085' }}
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
    </div>
  );
}

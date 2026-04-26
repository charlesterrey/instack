import type { ReactNode } from 'react';

export interface ChartDataPoint {
  [key: string]: string | number;
}

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

export function BarChart(props: BarChartProps): ReactNode {
  return (
    <div data-component="BarChart" data-id={props.id}>
      {`[BarChart: ${String(props.data.length)} points]`}
    </div>
  );
}

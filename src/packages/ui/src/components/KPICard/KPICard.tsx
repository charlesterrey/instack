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

export function KPICard(props: KPICardProps): ReactNode {
  return (
    <div data-component="KPICard" data-id={props.id}>
      <span>{props.title}</span>
      <strong>{String(props.value)}</strong>
    </div>
  );
}

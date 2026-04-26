import type { ReactNode } from 'react';

export interface ContainerProps {
  id: string;
  layout: 'stack' | 'grid' | 'columns' | 'sidebar' | 'centered';
  gap?: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12';
  columns?: number;
  padding?: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12';
  background?: 'primary' | 'secondary' | 'tertiary' | 'transparent';
  border?: boolean;
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  children: ReactNode;
}

export function Container(props: ContainerProps): ReactNode {
  return (
    <div data-component="Container" data-id={props.id} data-layout={props.layout}>
      {props.children}
    </div>
  );
}

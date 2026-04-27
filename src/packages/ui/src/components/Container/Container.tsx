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

const GAP_CLASS_MAP: Record<NonNullable<ContainerProps['gap']>, string> = {
  '0': 'gap-0',
  '1': 'gap-1',
  '2': 'gap-2',
  '3': 'gap-3',
  '4': 'gap-4',
  '5': 'gap-5',
  '6': 'gap-6',
  '8': 'gap-8',
  '10': 'gap-10',
  '12': 'gap-12',
};

const PADDING_CLASS_MAP: Record<NonNullable<ContainerProps['padding']>, string> = {
  '0': 'p-0',
  '1': 'p-1',
  '2': 'p-2',
  '3': 'p-3',
  '4': 'p-4',
  '5': 'p-5',
  '6': 'p-6',
  '8': 'p-8',
  '10': 'p-10',
  '12': 'p-12',
};

const BACKGROUND_CLASS_MAP: Record<NonNullable<ContainerProps['background']>, string> = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  tertiary: 'bg-tertiary',
  transparent: 'bg-transparent',
};

const BORDER_RADIUS_CLASS_MAP: Record<NonNullable<ContainerProps['borderRadius']>, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
};

/**
 * Grid columns mapping for responsive behavior.
 * On mobile (default): 1 column. On sm+ breakpoint: N columns.
 */
function getGridColsClass(columns: number): string {
  const gridColsMap: Record<number, string> = {
    1: 'grid-cols-1 sm:grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-6',
    7: 'grid-cols-1 sm:grid-cols-7',
    8: 'grid-cols-1 sm:grid-cols-8',
    9: 'grid-cols-1 sm:grid-cols-9',
    10: 'grid-cols-1 sm:grid-cols-10',
    11: 'grid-cols-1 sm:grid-cols-11',
    12: 'grid-cols-1 sm:grid-cols-12',
  };
  return gridColsMap[columns] ?? `grid-cols-1 sm:grid-cols-${String(columns)}`;
}

/** Layout-specific CSS classes */
function getLayoutClasses(layout: ContainerProps['layout'], columns: number): string {
  switch (layout) {
    case 'stack':
      return 'flex flex-col';
    case 'grid':
      return `grid ${getGridColsClass(columns)}`;
    case 'columns':
      return 'flex flex-col sm:flex-row sm:flex-wrap';
    case 'sidebar':
      return 'flex flex-col sm:flex-row';
    case 'centered':
      return 'flex items-center justify-center';
    default: {
      const _exhaustive: never = layout;
      return _exhaustive;
    }
  }
}

/**
 * Container — Layout primitive for instack generated apps.
 *
 * Supports 5 layout modes (stack, grid, columns, sidebar, centered),
 * configurable gap, padding, background, border, and border-radius.
 * Fully responsive and nestable.
 */
export function Container(props: ContainerProps): ReactNode {
  const {
    id,
    layout,
    gap,
    columns = 2,
    padding,
    background,
    border,
    borderRadius,
    children,
  } = props;

  const classes: string[] = [];

  // Layout classes
  classes.push(getLayoutClasses(layout, columns));

  // Gap
  if (gap !== undefined) {
    classes.push(GAP_CLASS_MAP[gap]);
  }

  // Padding
  if (padding !== undefined) {
    classes.push(PADDING_CLASS_MAP[padding]);
  }

  // Background
  if (background !== undefined) {
    classes.push(BACKGROUND_CLASS_MAP[background]);
  }

  // Border
  if (border === true) {
    classes.push('ring-1 ring-secondary shadow-xs');
  }

  // Border radius
  if (borderRadius !== undefined) {
    classes.push(BORDER_RADIUS_CLASS_MAP[borderRadius]);
  }

  // Sidebar-specific: first child gets fixed width, rest are flexible.
  // Handled via CSS on the container; children use CSS selectors.
  if (layout === 'sidebar') {
    classes.push('[&>*:first-child]:sm:w-64 [&>*:first-child]:sm:shrink-0 [&>*:not(:first-child)]:sm:flex-1 [&>*:not(:first-child)]:sm:min-w-0');
  }

  return (
    <div
      data-component="Container"
      data-id={id}
      data-layout={layout}
      className={classes.join(' ')}
    >
      {children}
    </div>
  );
}

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Container } from './Container';
import type { ContainerProps } from './Container';
import React from 'react';

/**
 * The data-id attribute serves as our query selector.
 */
function getContainerEl(container: HTMLElement, id = 'test-container'): HTMLElement {
  const el = container.querySelector(`[data-id="${id}"]`);
  if (!el) {
    throw new Error(`Container with data-id="${id}" not found`);
  }
  return el as HTMLElement;
}

function renderAndGet(props: ContainerProps): HTMLElement {
  const { container } = render(React.createElement(Container, props));
  return getContainerEl(container, props.id);
}

/** Helper to build props with sensible defaults */
function makeProps(overrides: Partial<ContainerProps> & { id?: string } = {}): ContainerProps {
  return {
    id: 'test-container',
    layout: 'stack',
    children: React.createElement('span', null, 'child'),
    ...overrides,
  };
}

describe('Container', () => {
  it('renders stack layout with flexbox vertical classes', () => {
    const el = renderAndGet(makeProps({ layout: 'stack' }));
    expect(el.className).toContain('flex');
    expect(el.className).toContain('flex-col');
    expect(el.getAttribute('data-layout')).toBe('stack');
  });

  it('renders grid layout with CSS grid and responsive columns', () => {
    const el = renderAndGet(makeProps({ layout: 'grid', columns: 3 }));
    expect(el.className).toContain('grid');
    expect(el.className).toContain('grid-cols-1');
    expect(el.className).toContain('sm:grid-cols-3');
    expect(el.getAttribute('data-layout')).toBe('grid');
  });

  it('renders grid layout with default 2 columns when columns prop is omitted', () => {
    const el = renderAndGet(makeProps({ layout: 'grid' }));
    expect(el.className).toContain('sm:grid-cols-2');
  });

  it('renders columns layout with responsive horizontal flex', () => {
    const el = renderAndGet(makeProps({ layout: 'columns' }));
    expect(el.className).toContain('flex');
    expect(el.className).toContain('flex-col');
    expect(el.className).toContain('sm:flex-row');
    expect(el.className).toContain('sm:flex-wrap');
  });

  it('renders sidebar layout with flex and child-width selectors', () => {
    const el = renderAndGet(makeProps({ layout: 'sidebar' }));
    expect(el.className).toContain('flex');
    expect(el.className).toContain('flex-col');
    expect(el.className).toContain('sm:flex-row');
    expect(el.className).toContain('[&>*:first-child]:sm:w-64');
    expect(el.className).toContain('[&>*:first-child]:sm:shrink-0');
  });

  it('renders centered layout with centered flex', () => {
    const el = renderAndGet(makeProps({ layout: 'centered' }));
    expect(el.className).toContain('flex');
    expect(el.className).toContain('items-center');
    expect(el.className).toContain('justify-center');
  });

  it('applies gap classes correctly', () => {
    const el = renderAndGet(makeProps({ gap: '4' }));
    expect(el.className).toContain('gap-4');
  });

  it('applies padding classes correctly', () => {
    const el = renderAndGet(makeProps({ padding: '6' }));
    expect(el.className).toContain('p-6');
  });

  it('applies background classes for all variants', () => {
    const backgrounds: Array<{ bg: 'primary' | 'secondary' | 'tertiary' | 'transparent'; cls: string }> = [
      { bg: 'primary', cls: 'bg-primary' },
      { bg: 'secondary', cls: 'bg-secondary' },
      { bg: 'tertiary', cls: 'bg-tertiary' },
      { bg: 'transparent', cls: 'bg-transparent' },
    ];
    for (const { bg, cls } of backgrounds) {
      const el = renderAndGet(makeProps({ background: bg, id: `bg-${bg}` }));
      expect(el.className).toContain(cls);
    }
  });

  it('applies ring and shadow classes when border is true', () => {
    const el = renderAndGet(makeProps({ border: true }));
    expect(el.className).toContain('ring-1');
    expect(el.className).toContain('ring-secondary');
    expect(el.className).toContain('shadow-xs');
  });

  it('does not apply ring or shadow classes when border is false or omitted', () => {
    const el = renderAndGet(makeProps({ border: false }));
    expect(el.className).not.toContain('ring-secondary');
    expect(el.className).not.toContain('shadow-xs');

    const el2 = renderAndGet(makeProps({ id: 'no-border' }));
    expect(el2.className).not.toContain('ring-secondary');
    expect(el2.className).not.toContain('shadow-xs');
  });

  it('applies borderRadius classes correctly', () => {
    const radii: Array<{ r: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'; cls: string }> = [
      { r: 'none', cls: 'rounded-none' },
      { r: 'sm', cls: 'rounded-sm' },
      { r: 'md', cls: 'rounded-md' },
      { r: 'lg', cls: 'rounded-lg' },
      { r: 'xl', cls: 'rounded-xl' },
      { r: '2xl', cls: 'rounded-2xl' },
    ];
    for (const { r, cls } of radii) {
      const el = renderAndGet(makeProps({ borderRadius: r, id: `br-${r}` }));
      expect(el.className).toContain(cls);
    }
  });

  it('renders children correctly', () => {
    const props: ContainerProps = {
      id: 'parent',
      layout: 'stack',
      children: React.createElement('p', null, 'Hello World'),
    };
    const { container } = render(React.createElement(Container, props));
    const el = getContainerEl(container, 'parent');
    expect(el.textContent).toBe('Hello World');
  });

  it('supports nesting Containers', () => {
    const innerProps: ContainerProps = {
      id: 'inner',
      layout: 'centered',
      children: React.createElement('span', null, 'Nested'),
    };
    const middleProps: ContainerProps = {
      id: 'middle',
      layout: 'grid',
      columns: 3,
      children: React.createElement(Container, innerProps),
    };
    const outerProps: ContainerProps = {
      id: 'outer',
      layout: 'stack',
      padding: '4',
      children: React.createElement(Container, middleProps),
    };
    const { container } = render(React.createElement(Container, outerProps));

    const outer = getContainerEl(container, 'outer');
    expect(outer.className).toContain('flex-col');
    expect(outer.className).toContain('p-4');

    const middle = getContainerEl(container, 'middle');
    expect(middle.className).toContain('grid');
    expect(middle.className).toContain('sm:grid-cols-3');

    const inner = getContainerEl(container, 'inner');
    expect(inner.className).toContain('items-center');
    expect(inner.className).toContain('justify-center');
    expect(inner.textContent).toBe('Nested');
  });

  it('sets data-component and data-id attributes', () => {
    const el = renderAndGet(makeProps({ id: 'attr-test' }));
    expect(el.getAttribute('data-component')).toBe('Container');
    expect(el.getAttribute('data-id')).toBe('attr-test');
  });

  it('combines multiple props into a single className', () => {
    const el = renderAndGet(makeProps({
      layout: 'grid',
      columns: 4,
      gap: '8',
      padding: '6',
      background: 'secondary',
      border: true,
      borderRadius: 'lg',
      id: 'combo',
    }));

    expect(el.className).toContain('grid');
    expect(el.className).toContain('sm:grid-cols-4');
    expect(el.className).toContain('gap-8');
    expect(el.className).toContain('p-6');
    expect(el.className).toContain('bg-secondary');
    expect(el.className).toContain('ring-1');
    expect(el.className).toContain('ring-secondary');
    expect(el.className).toContain('shadow-xs');
    expect(el.className).toContain('rounded-lg');
  });
});

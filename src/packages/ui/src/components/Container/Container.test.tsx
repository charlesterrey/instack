import { describe, it, expect } from 'vitest';
import { Container } from './Container';

describe('Container', () => {
  it('is a function component', () => {
    expect(typeof Container).toBe('function');
  });

  it('accepts required props', () => {
    const props = { id: 'container-1', layout: 'stack' as const, children: null };
    expect(() => Container(props)).not.toThrow();
  });
});

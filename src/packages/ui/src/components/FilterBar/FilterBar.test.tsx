import { describe, it, expect } from 'vitest';
import { FilterBar } from './FilterBar';

describe('FilterBar', () => {
  it('is a function component', () => {
    expect(typeof FilterBar).toBe('function');
  });

  it('accepts required props', () => {
    const props = {
      id: 'filter-1',
      filters: [{ key: 'status', label: 'Status', type: 'select' as const }],
      values: {},
      onChange: () => undefined,
    };
    expect(() => FilterBar(props)).not.toThrow();
  });
});

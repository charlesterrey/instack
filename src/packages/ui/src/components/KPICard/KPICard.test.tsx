import { describe, it, expect } from 'vitest';
import { KPICard } from './KPICard';

describe('KPICard', () => {
  it('is a function component', () => {
    expect(typeof KPICard).toBe('function');
  });

  it('accepts required props', () => {
    const props = { id: 'kpi-1', title: 'Revenue', value: 42000 };
    expect(() => KPICard(props)).not.toThrow();
  });
});

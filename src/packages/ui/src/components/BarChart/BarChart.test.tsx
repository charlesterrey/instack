import { describe, it, expect } from 'vitest';
import { BarChart } from './BarChart';

describe('BarChart', () => {
  it('is a function component', () => {
    expect(typeof BarChart).toBe('function');
  });

  it('accepts required props', () => {
    const props = {
      id: 'chart-1',
      data: [{ month: 'Jan', revenue: 100 }],
      xKey: 'month',
      yKeys: ['revenue'],
    };
    expect(() => BarChart(props)).not.toThrow();
  });
});

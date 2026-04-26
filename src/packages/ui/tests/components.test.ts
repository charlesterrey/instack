import { describe, it, expect } from 'vitest';
import {
  FormField,
  DataTable,
  KPICard,
  BarChart,
  FilterBar,
  Container,
} from '../src/index';

describe('@instack/ui exports', () => {
  it('exports FormField', () => {
    expect(FormField).toBeDefined();
  });

  it('exports DataTable', () => {
    expect(DataTable).toBeDefined();
  });

  it('exports KPICard', () => {
    expect(KPICard).toBeDefined();
  });

  it('exports BarChart', () => {
    expect(BarChart).toBeDefined();
  });

  it('exports FilterBar', () => {
    expect(FilterBar).toBeDefined();
  });

  it('exports Container', () => {
    expect(Container).toBeDefined();
  });
});

import { describe, it, expect } from 'vitest';
import { DataTable } from './DataTable';

describe('DataTable', () => {
  it('is a function component', () => {
    expect(typeof DataTable).toBe('function');
  });

  it('accepts required props', () => {
    const props = {
      id: 'table-1',
      columns: [{ key: 'name', label: 'Name', type: 'text' as const }],
      data: [{ name: 'Test' }],
    };
    expect(() => DataTable(props)).not.toThrow();
  });
});

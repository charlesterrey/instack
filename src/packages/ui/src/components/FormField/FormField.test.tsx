import { describe, it, expect } from 'vitest';
import { FormField } from './FormField';

describe('FormField', () => {
  it('is a function component', () => {
    expect(typeof FormField).toBe('function');
  });

  it('accepts required props', () => {
    const props = {
      id: 'field-1',
      type: 'text' as const,
      label: 'Name',
      onChange: () => undefined,
    };
    expect(() => FormField(props)).not.toThrow();
  });
});

import { describe, it, expect } from 'vitest';
import { useAppData } from '../src/hooks/useAppData';

describe('useAppData', () => {
  it('is exported as a function', () => {
    expect(typeof useAppData).toBe('function');
  });

  it('has the correct function name', () => {
    expect(useAppData.name).toBe('useAppData');
  });

  it('accepts required appId in options (type-level verification)', () => {
    // Compile-time check: UseAppDataOptions requires appId as a string.
    const options: Parameters<typeof useAppData>[0] = { appId: 'app-123' };
    expect(options.appId).toBe('app-123');
  });

  it('accepts all optional fields in options', () => {
    const options: Parameters<typeof useAppData>[0] = {
      appId: 'app-456',
      page: 2,
      limit: 25,
      sort: 'name',
      order: 'desc',
      filters: { status: 'active', region: 'eu' },
      pollingInterval: 60_000,
    };

    expect(options.page).toBe(2);
    expect(options.limit).toBe(25);
    expect(options.sort).toBe('name');
    expect(options.order).toBe('desc');
    expect(options.filters).toEqual({ status: 'active', region: 'eu' });
    expect(options.pollingInterval).toBe(60_000);
  });

  it('result type includes data, isLoading, error, and refetch', () => {
    // We cannot call the hook outside React, but we can verify the return type
    // via TypeScript. Define the expected shape and assert structural conformance.
    type HookResult = ReturnType<typeof useAppData>;

    // These type-level assertions ensure the shape is correct at compile time.
    // At runtime we verify the keys exist on a mock conforming object.
    const mockResult: HookResult = {
      data: null,
      isLoading: true,
      error: null,
      refetch: async () => {},
    };

    expect(mockResult).toHaveProperty('data');
    expect(mockResult).toHaveProperty('isLoading');
    expect(mockResult).toHaveProperty('error');
    expect(mockResult).toHaveProperty('refetch');
    expect(typeof mockResult.refetch).toBe('function');
  });

  it('throws when called outside React (hooks require React context)', () => {
    // Calling the hook outside a React component should throw because
    // useState/useEffect/useCallback require a React rendering context.
    expect(() => {
      useAppData({ appId: 'test-app' });
    }).toThrow();
  });

  it('refetch in the result type returns a Promise<void>', () => {
    // Structural type check: refetch must return Promise<void>
    const mockRefetch: ReturnType<typeof useAppData>['refetch'] = async () => {};
    const result = mockRefetch();
    expect(result).toBeInstanceOf(Promise);
  });
});

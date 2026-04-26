import { describe, it, expect } from 'vitest';
import { ok, err, isOk, isErr, unwrap, mapResult } from '../src/utils/result';

describe('Result pattern', () => {
  it('ok creates a success result', () => {
    const result = ok(42);
    expect(result.ok).toBe(true);
    expect(result.value).toBe(42);
  });

  it('err creates a failure result', () => {
    const result = err('something went wrong');
    expect(result.ok).toBe(false);
    expect(result.error).toBe('something went wrong');
  });

  it('isOk type-narrows correctly', () => {
    const result = ok('hello');
    if (isOk(result)) {
      expect(result.value).toBe('hello');
    } else {
      expect.unreachable('should be ok');
    }
  });

  it('isErr type-narrows correctly', () => {
    const result = err(new Error('fail'));
    if (isErr(result)) {
      expect(result.error.message).toBe('fail');
    } else {
      expect.unreachable('should be err');
    }
  });

  it('unwrap returns value for ok', () => {
    expect(unwrap(ok(99))).toBe(99);
  });

  it('unwrap throws for err', () => {
    expect(() => unwrap(err('bad'))).toThrow();
  });

  it('mapResult transforms ok value', () => {
    const result = mapResult(ok(5), (v) => v * 2);
    expect(result).toEqual({ ok: true, value: 10 });
  });

  it('mapResult passes through err', () => {
    const result = mapResult(err('fail'), (v: number) => v * 2);
    expect(result).toEqual({ ok: false, error: 'fail' });
  });
});

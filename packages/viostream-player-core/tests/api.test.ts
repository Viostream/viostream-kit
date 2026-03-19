import { describe, it, expect, beforeEach } from 'vitest';
import { getViostreamApi, resetApiCache } from '../src/api.js';

/**
 * Tests for the bundled embed API access layer.
 */
describe('getViostreamApi', () => {
  beforeEach(() => {
    resetApiCache();
  });

  it('returns a ViostreamGlobal with an embed() method', () => {
    const api = getViostreamApi();
    expect(api).toBeDefined();
    expect(typeof api.embed).toBe('function');
  });

  it('returns the same cached instance on repeated calls', () => {
    const api1 = getViostreamApi();
    const api2 = getViostreamApi();
    expect(api1).toBe(api2);
  });

  it('returns a fresh instance after resetApiCache()', () => {
    const api1 = getViostreamApi();
    resetApiCache();
    const api2 = getViostreamApi();
    // Both have embed() but are different object instances
    expect(api1).not.toBe(api2);
    expect(typeof api2.embed).toBe('function');
  });
});

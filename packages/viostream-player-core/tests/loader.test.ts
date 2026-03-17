import { describe, it, expect } from 'vitest';

/**
 * Tests for the backward-compatible loadViostream() wrapper.
 *
 * The embed API is now bundled in the package, so loadViostream() simply
 * returns a resolved promise with the bundled API. These tests verify
 * that the backward-compatible interface still works correctly.
 */
describe('loadViostream (backward-compatible wrapper)', () => {
  it('returns a promise that resolves to a ViostreamGlobal', async () => {
    const { loadViostream } = await import('../src/loader.js');
    const api = await loadViostream('vc-test');
    expect(api).toBeDefined();
    expect(typeof api.embed).toBe('function');
  });

  it('resolves immediately (no network request)', async () => {
    const { loadViostream } = await import('../src/loader.js');
    const start = performance.now();
    await loadViostream('vc-test');
    const elapsed = performance.now() - start;
    // Should resolve in well under 100ms (no network, no polling)
    expect(elapsed).toBeLessThan(100);
  });

  it('returns the same API instance on multiple calls', async () => {
    const { loadViostream } = await import('../src/loader.js');
    const api1 = await loadViostream('vc-a');
    const api2 = await loadViostream('vc-b');
    // Both should be the same cached instance since accountKey is no longer relevant
    expect(api1).toBe(api2);
  });

  it('does not inject any script tags', async () => {
    const { loadViostream } = await import('../src/loader.js');
    const scriptsBefore = document.querySelectorAll('script[src*="viostream"]').length;
    await loadViostream('vc-test');
    const scriptsAfter = document.querySelectorAll('script[src*="viostream"]').length;
    expect(scriptsAfter).toBe(scriptsBefore);
  });

  it('does not set window.$viostream', async () => {
    const original = window.$viostream;
    window.$viostream = undefined;

    const { loadViostream } = await import('../src/loader.js');
    await loadViostream('vc-test');

    expect(window.$viostream).toBeUndefined();

    window.$viostream = original;
  });
});

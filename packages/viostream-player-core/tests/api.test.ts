import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

describe('getViostreamApi — env var host override', () => {
  let originalPublicHost: string | undefined;
  let originalViteHost: string | undefined;

  beforeEach(() => {
    resetApiCache();
    originalPublicHost = import.meta.env.PUBLIC_VIOSTREAM_HOST;
    originalViteHost = import.meta.env.VITE_VIOSTREAM_HOST;
    delete (import.meta.env as Record<string, string | undefined>).PUBLIC_VIOSTREAM_HOST;
    delete (import.meta.env as Record<string, string | undefined>).VITE_VIOSTREAM_HOST;
  });

  afterEach(() => {
    if (originalPublicHost !== undefined) {
      (import.meta.env as Record<string, string>).PUBLIC_VIOSTREAM_HOST = originalPublicHost;
    } else {
      delete (import.meta.env as Record<string, string | undefined>).PUBLIC_VIOSTREAM_HOST;
    }
    if (originalViteHost !== undefined) {
      (import.meta.env as Record<string, string>).VITE_VIOSTREAM_HOST = originalViteHost;
    } else {
      delete (import.meta.env as Record<string, string | undefined>).VITE_VIOSTREAM_HOST;
    }
    resetApiCache();
  });

  it('creates API with default host when no env vars are set', () => {
    const api = getViostreamApi();
    // The API should be created — we can't easily inspect the host it was
    // created with, but we can verify it returns a valid object.
    expect(typeof api.embed).toBe('function');
  });

  it('creates API with VITE_VIOSTREAM_HOST when set', () => {
    (import.meta.env as Record<string, string>).VITE_VIOSTREAM_HOST = 'dev.viostream.com';
    const api = getViostreamApi();
    expect(typeof api.embed).toBe('function');
  });

  it('creates API with PUBLIC_VIOSTREAM_HOST when set', () => {
    (import.meta.env as Record<string, string>).PUBLIC_VIOSTREAM_HOST = 'dev.viostream.com';
    const api = getViostreamApi();
    expect(typeof api.embed).toBe('function');
  });
});

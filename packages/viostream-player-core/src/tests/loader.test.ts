import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMockViostreamGlobal } from './mocks.js';

describe('loadViostream', () => {
  let originalViostream: typeof window.$viostream;

  beforeEach(() => {
    originalViostream = window.$viostream;
    window.$viostream = undefined;

    // Clear any scripts added by previous tests
    document.querySelectorAll('script[src*="play.viostream.com"]').forEach((el) => el.remove());
    document.querySelectorAll('script[src*="dev.viostream.com"]').forEach((el) => el.remove());
  });

  afterEach(() => {
    window.$viostream = originalViostream;
  });

  it('returns immediately when window.$viostream already exists', async () => {
    const { loadViostream } = await import('../loader.js');
    const mockGlobal = createMockViostreamGlobal();
    window.$viostream = mockGlobal;

    const result = await loadViostream('vc-test');
    expect(result).toBe(mockGlobal);
  });

  it('creates a script element with the correct src', async () => {
    const { loadViostream } = await import('../loader.js');

    // Start loading (will not resolve because script won't actually load)
    const promise = loadViostream('vc-123456');

    const script = document.querySelector(
      'script[src="https://play.viostream.com/api/vc-123456"]',
    );
    expect(script).not.toBeNull();
    expect(script).toBeInstanceOf(HTMLScriptElement);
    expect((script as HTMLScriptElement).async).toBe(true);

    // Clean up: prevent unhandled rejection from timeout
    promise.catch(() => {});
  });

  it('encodes the account key in the URL', async () => {
    const { loadViostream } = await import('../loader.js');
    const promise = loadViostream('vc key/special');

    const script = document.querySelector(
      'script[src="https://play.viostream.com/api/vc%20key%2Fspecial"]',
    );
    expect(script).not.toBeNull();

    promise.catch(() => {});
  });

  it('appends the script to document.head', async () => {
    const { loadViostream } = await import('../loader.js');
    const headAppendSpy = vi.spyOn(document.head, 'appendChild');

    const promise = loadViostream('vc-head-test');

    expect(headAppendSpy).toHaveBeenCalledOnce();
    const appendedEl = headAppendSpy.mock.calls[0][0] as HTMLScriptElement;
    expect(appendedEl.tagName).toBe('SCRIPT');

    headAppendSpy.mockRestore();
    promise.catch(() => {});
  });

  it('deduplicates calls with the same account key', async () => {
    const { loadViostream } = await import('../loader.js');
    const promise1 = loadViostream('vc-dedup');
    const promise2 = loadViostream('vc-dedup');

    expect(promise1).toBe(promise2);

    // Only one script tag should be created
    const scripts = document.querySelectorAll(
      'script[src="https://play.viostream.com/api/vc-dedup"]',
    );
    expect(scripts.length).toBe(1);

    promise1.catch(() => {});
  });

  it('creates separate promises for different account keys', async () => {
    const { loadViostream } = await import('../loader.js');
    const promise1 = loadViostream('vc-a');
    const promise2 = loadViostream('vc-b');

    expect(promise1).not.toBe(promise2);

    promise1.catch(() => {});
    promise2.catch(() => {});
  });

  it('resolves when script loads and $viostream becomes available', async () => {
    const { loadViostream } = await import('../loader.js');
    const mockGlobal = createMockViostreamGlobal();

    const promise = loadViostream('vc-resolve');

    // Simulate the script loading: set the global, then fire onload
    const script = document.querySelector(
      'script[src="https://play.viostream.com/api/vc-resolve"]',
    ) as HTMLScriptElement;

    window.$viostream = mockGlobal;
    script.onload!(new Event('load'));

    const result = await promise;
    expect(result).toBe(mockGlobal);
  });

  it('rejects when script fails to load (onerror)', async () => {
    const { loadViostream } = await import('../loader.js');
    const promise = loadViostream('vc-error');

    const script = document.querySelector(
      'script[src="https://play.viostream.com/api/vc-error"]',
    ) as HTMLScriptElement;

    script.onerror!(new Event('error'));

    await expect(promise).rejects.toThrow('Failed to load Viostream script from');
  });

  it('reuses existing script tag if already in the DOM', async () => {
    const { loadViostream } = await import('../loader.js');

    // Pre-add a script tag
    const existingScript = document.createElement('script');
    existingScript.src = 'https://play.viostream.com/api/vc-existing';
    document.head.appendChild(existingScript);

    const promise = loadViostream('vc-existing');

    // Should NOT have added a second script
    const scripts = document.querySelectorAll(
      'script[src="https://play.viostream.com/api/vc-existing"]',
    );
    expect(scripts.length).toBe(1);

    // Resolve by setting the global
    const mockGlobal = createMockViostreamGlobal();
    window.$viostream = mockGlobal;

    // The promise should resolve via the polling mechanism
    return expect(promise).resolves.toBe(mockGlobal);
  });
});

describe('loadViostream — env var host override', () => {
  let originalViostream: typeof window.$viostream;
  let originalPublicHost: string | undefined;
  let originalViteHost: string | undefined;

  beforeEach(() => {
    originalViostream = window.$viostream;
    window.$viostream = undefined;

    // Save original env values
    originalPublicHost = import.meta.env.PUBLIC_VIOSTREAM_HOST;
    originalViteHost = import.meta.env.VITE_VIOSTREAM_HOST;

    // Clear env overrides
    delete (import.meta.env as Record<string, string | undefined>).PUBLIC_VIOSTREAM_HOST;
    delete (import.meta.env as Record<string, string | undefined>).VITE_VIOSTREAM_HOST;

    document.querySelectorAll('script[src*="play.viostream.com"]').forEach((el) => el.remove());
    document.querySelectorAll('script[src*="dev.viostream.com"]').forEach((el) => el.remove());
    document.querySelectorAll('script[src*="staging.viostream.com"]').forEach((el) => el.remove());
  });

  afterEach(() => {
    window.$viostream = originalViostream;

    // Restore original env values
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

    // Reset module cache so loader re-reads env on next import
    vi.resetModules();
  });

  it('uses VITE_VIOSTREAM_HOST when set', async () => {
    (import.meta.env as Record<string, string>).VITE_VIOSTREAM_HOST = 'dev.viostream.com';

    const { loadViostream } = await import('../loader.js');
    const promise = loadViostream('vc-env-vite');

    const script = document.querySelector(
      'script[src="https://dev.viostream.com/api/vc-env-vite"]',
    );
    expect(script).not.toBeNull();

    // Should NOT use the default host
    const defaultScript = document.querySelector(
      'script[src="https://play.viostream.com/api/vc-env-vite"]',
    );
    expect(defaultScript).toBeNull();

    promise.catch(() => {});
  });

  it('uses PUBLIC_VIOSTREAM_HOST when set', async () => {
    (import.meta.env as Record<string, string>).PUBLIC_VIOSTREAM_HOST = 'dev.viostream.com';

    const { loadViostream } = await import('../loader.js');
    const promise = loadViostream('vc-env-public');

    const script = document.querySelector(
      'script[src="https://dev.viostream.com/api/vc-env-public"]',
    );
    expect(script).not.toBeNull();

    promise.catch(() => {});
  });

  it('prefers PUBLIC_VIOSTREAM_HOST over VITE_VIOSTREAM_HOST', async () => {
    (import.meta.env as Record<string, string>).PUBLIC_VIOSTREAM_HOST = 'dev.viostream.com';
    (import.meta.env as Record<string, string>).VITE_VIOSTREAM_HOST = 'staging.viostream.com';

    const { loadViostream } = await import('../loader.js');
    const promise = loadViostream('vc-env-priority');

    const script = document.querySelector(
      'script[src="https://dev.viostream.com/api/vc-env-priority"]',
    );
    expect(script).not.toBeNull();

    // Should NOT use the VITE_ value
    const stagingScript = document.querySelector(
      'script[src="https://staging.viostream.com/api/vc-env-priority"]',
    );
    expect(stagingScript).toBeNull();

    promise.catch(() => {});
  });

  it('falls back to default host when no env vars are set', async () => {
    const { loadViostream } = await import('../loader.js');
    const promise = loadViostream('vc-env-default');

    const script = document.querySelector(
      'script[src="https://play.viostream.com/api/vc-env-default"]',
    );
    expect(script).not.toBeNull();

    promise.catch(() => {});
  });

  it('resolves when env-overridden script loads', async () => {
    (import.meta.env as Record<string, string>).VITE_VIOSTREAM_HOST = 'dev.viostream.com';
    const mockGlobal = createMockViostreamGlobal();

    const { loadViostream } = await import('../loader.js');
    const promise = loadViostream('vc-env-resolve');

    const script = document.querySelector(
      'script[src="https://dev.viostream.com/api/vc-env-resolve"]',
    ) as HTMLScriptElement;

    window.$viostream = mockGlobal;
    script.onload!(new Event('load'));

    const result = await promise;
    expect(result).toBe(mockGlobal);
  });

  it('includes correct host in error message when env-overridden script fails', async () => {
    (import.meta.env as Record<string, string>).VITE_VIOSTREAM_HOST = 'dev.viostream.com';

    const { loadViostream } = await import('../loader.js');
    const promise = loadViostream('vc-env-error');

    const script = document.querySelector(
      'script[src="https://dev.viostream.com/api/vc-env-error"]',
    ) as HTMLScriptElement;

    script.onerror!(new Event('error'));

    await expect(promise).rejects.toThrow(
      'Failed to load Viostream script from https://dev.viostream.com/api/vc-env-error',
    );
  });
});

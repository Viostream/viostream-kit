/**
 * Viostream script auto-loader.
 *
 * Dynamically injects the `<script src="https://{host}/api/{accountKey}">`
 * tag and returns a promise that resolves when `window.$viostream` is available.
 *
 * The loader deduplicates requests: multiple calls with the same account key
 * return the same promise.
 *
 * ## Host override
 *
 * The API hostname defaults to `play.viostream.com`. To point at a development
 * environment, set one of the following environment variables in your `.env` file:
 *
 * - **SvelteKit apps:** `PUBLIC_VIOSTREAM_HOST=dev.viostream.com`
 * - **Plain Vite apps:** `VITE_VIOSTREAM_HOST=dev.viostream.com`
 *
 * The loader checks `PUBLIC_VIOSTREAM_HOST` first (SvelteKit convention), then
 * falls back to `VITE_VIOSTREAM_HOST` (plain Vite convention), and finally
 * uses the production default.
 */

import type { ViostreamGlobal } from './types.js';

const LOAD_TIMEOUT_MS = 15_000;

/** Default hostname for the Viostream API script. */
const DEFAULT_HOST = 'play.viostream.com';

/** Cache of in-flight / resolved promises keyed by `host|accountKey`. */
const cache = new Map<string, Promise<ViostreamGlobal>>();

/**
 * Resolve the Viostream API hostname.
 *
 * Reads `PUBLIC_VIOSTREAM_HOST` (SvelteKit) or `VITE_VIOSTREAM_HOST` (plain
 * Vite) from `import.meta.env`. Falls back to `play.viostream.com`.
 */
function getHost(): string {
  try {
    const env = import.meta.env;
    return env?.PUBLIC_VIOSTREAM_HOST
      || env?.VITE_VIOSTREAM_HOST
      || DEFAULT_HOST;
  } catch {
    return DEFAULT_HOST;
  }
}

/**
 * Load the Viostream embed API script for a given account key.
 *
 * @param accountKey - Your Viostream account key (e.g. `'vc-100100100'`).
 * @returns A promise that resolves to the `$viostream` global object.
 */
export function loadViostream(accountKey: string): Promise<ViostreamGlobal> {
  // Fast path: already loaded
  if (window.$viostream) {
    return Promise.resolve(window.$viostream);
  }

  const host = getHost();
  const cacheKey = `${host}|${accountKey}`;
  const existing = cache.get(cacheKey);
  if (existing) return existing;

  const promise = new Promise<ViostreamGlobal>((resolve, reject) => {
    // Guard against SSR — script loading is browser-only
    if (typeof document === 'undefined') {
      reject(new Error('loadViostream() can only be called in a browser environment'));
      return;
    }

    const src = `https://${host}/api/${encodeURIComponent(accountKey)}`;

    // Check if a script with this src already exists (e.g. added by the user)
    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existingScript) {
      // Script tag exists; wait for $viostream to appear
      waitForGlobal(resolve, reject);
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;

    const timeout = setTimeout(() => {
      reject(new Error(`Viostream script failed to load within ${LOAD_TIMEOUT_MS}ms`));
      cache.delete(cacheKey);
    }, LOAD_TIMEOUT_MS);

    script.onload = () => {
      clearTimeout(timeout);
      waitForGlobal(resolve, reject);
    };

    script.onerror = () => {
      clearTimeout(timeout);
      cache.delete(cacheKey);
      reject(new Error(`Failed to load Viostream script from ${src}`));
    };

    document.head.appendChild(script);
  });

  cache.set(cacheKey, promise);
  return promise;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Poll for `window.$viostream` to become available.
 * The script sets it synchronously on load, but a tiny delay is possible.
 */
function waitForGlobal(
  resolve: (v: ViostreamGlobal) => void,
  reject: (e: Error) => void,
): void {
  let elapsed = 0;
  const interval = 20;

  const check = () => {
    if (window.$viostream) {
      resolve(window.$viostream);
      return;
    }
    elapsed += interval;
    if (elapsed >= LOAD_TIMEOUT_MS) {
      reject(new Error('$viostream global was not set after script loaded'));
      return;
    }
    setTimeout(check, interval);
  };

  check();
}

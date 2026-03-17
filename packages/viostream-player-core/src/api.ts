/**
 * Bundled Viostream embed API access.
 *
 * Replaces the previous script-loading pattern (`loader.ts`) with a direct
 * import of the vendored embed API. No network requests required.
 *
 * ## Host override
 *
 * The API hostname defaults to `play.viostream.com`. To point at a development
 * environment, set one of the following environment variables in your `.env` file:
 *
 * - **SvelteKit apps:** `PUBLIC_VIOSTREAM_HOST=dev.viostream.com`
 * - **Plain Vite apps:** `VITE_VIOSTREAM_HOST=dev.viostream.com`
 */

import { createEmbedApi } from './vendor/viostream-embed.js';
import type { ViostreamGlobal } from './types.js';

/** Default hostname for the Viostream API. */
const DEFAULT_HOST = 'play.viostream.com';

/** Cached API instance (created on first access). */
let cachedApi: ViostreamGlobal | undefined;

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
 * Get the Viostream embed API instance.
 *
 * The API is created on first call and cached thereafter. No network
 * requests are made — the embed API is bundled in the package.
 *
 * @returns A `ViostreamGlobal`-compatible object with an `embed()` method.
 */
export function getViostreamApi(): ViostreamGlobal {
  if (!cachedApi) {
    cachedApi = createEmbedApi(getHost());
  }
  return cachedApi;
}

/**
 * Reset the cached API instance.
 *
 * Primarily useful for testing (e.g. to re-evaluate environment variables).
 * Not exported from the public barrel.
 */
export function resetApiCache(): void {
  cachedApi = undefined;
}

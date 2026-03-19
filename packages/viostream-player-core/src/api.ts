/**
 * Bundled Viostream embed API access.
 *
 * Provides a singleton accessor for the vendored embed API. No network
 * requests required — the embed API is bundled directly in the package.
 *
 * Host resolution is handled internally by the vendored embed API's
 * `config()` function, which reads `window.playerDomain` at embed time
 * and defaults to `play.viostream.com`.
 */

import { createEmbedApi } from './vendor/viostream-embed.js';
import type { ViostreamGlobal } from './types.js';

/** Cached API instance (created on first access). */
let cachedApi: ViostreamGlobal | undefined;

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
    cachedApi = createEmbedApi();
  }
  return cachedApi;
}

/**
 * Reset the cached API instance.
 *
 * Primarily useful for testing. Not exported from the public barrel.
 */
export function resetApiCache(): void {
  cachedApi = undefined;
}

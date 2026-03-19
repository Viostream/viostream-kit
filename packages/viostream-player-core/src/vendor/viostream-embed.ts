/**
 * Vendored Viostream embed API.
 *
 * Wraps the ESM embed API source (`embed-api.ts`) as a typed export.
 * The ESM is an unmodified development build of the Viostream embed script.
 * Host resolution is handled internally by the embed API's `config()`
 * function, which reads `window.playerDomain` (defaulting to
 * `play.viostream.com`).
 *
 * The rest of the codebase depends only on the
 * `createEmbedApi(): ViostreamGlobal` signature.
 */

import type { ViostreamGlobal } from '../types.js';

// The vendored ESM uses @ts-nocheck — the default export is untyped.
import embed from './embed-api.js';

/**
 * Create a Viostream embed API instance.
 *
 * Host resolution is handled internally by the vendored embed API — it
 * reads `window.playerDomain` at embed time and defaults to
 * `play.viostream.com`.
 *
 * @returns A `ViostreamGlobal`-compatible object with an `embed()` method.
 */
export function createEmbedApi(): ViostreamGlobal {
  return { embed } as ViostreamGlobal;
}

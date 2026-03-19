/**
 * Vendored Viostream embed API.
 *
 * Wraps the ESM embed API source (`embed-api.ts`) as a typed export.
 * The ESM is a development build of the Viostream embed script that will
 * eventually be served from a production URL.
 *
 * The rest of the codebase depends only on the
 * `createEmbedApi(host: string): ViostreamGlobal` signature.
 */

import type { ViostreamGlobal } from '../types.js';

// The vendored ESM uses @ts-nocheck — the default export is untyped.
import createEmbed from './embed-api.js';

/**
 * Create a Viostream embed API instance bound to the given host.
 *
 * @param host - The Viostream API hostname (e.g. `'play.viostream.com'`).
 * @returns A `ViostreamGlobal`-compatible object with an `embed()` method.
 */
export function createEmbedApi(host: string): ViostreamGlobal {
  const embed = createEmbed(host);
  return { embed } as ViostreamGlobal;
}

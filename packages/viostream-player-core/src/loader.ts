/**
 * Backward-compatible Viostream script loader.
 *
 * @deprecated The embed API is now bundled in the package. No remote script
 * is loaded. This function is kept for backward compatibility and returns
 * a resolved promise with the bundled API.
 *
 * Use `getViostreamApi()` from `./api.js` for synchronous access instead.
 */

import Debug from 'debug';
import { getViostreamApi } from './api.js';
import type { ViostreamGlobal } from './types.js';

const debug = Debug('viostream:core:loader');

/**
 * Load the Viostream embed API.
 *
 * @deprecated The embed API is now bundled in the package. This function
 * returns immediately with a resolved promise. The `accountKey` parameter
 * is no longer used (the bundled API does not require it at load time).
 *
 * @param _accountKey - Ignored. Kept for API compatibility.
 * @returns A promise that resolves to the `ViostreamGlobal` API object.
 */
export function loadViostream(_accountKey: string): Promise<ViostreamGlobal> {
  debug('loadViostream called (deprecated) accountKey=%s', _accountKey);
  return Promise.resolve(getViostreamApi());
}

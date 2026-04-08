/**
 * @viostream/viostream-player-core
 *
 * Framework-agnostic core for the Viostream player SDK.
 *
 * @example Headless / programmatic usage
 * ```ts
 * import { createViostreamPlayer } from '@viostream/viostream-player-core';
 *
 * const player = await createViostreamPlayer({
 *   accountKey: 'vc-100100100',
 *   publicKey: 'nhedxonrxsyfee',
 *   target: 'my-video-div'
 * });
 *
 * player.play();
 * const time = await player.getCurrentTime();
 * player.on('ended', () => console.log('done'));
 * ```
 */

// Headless API
export { createViostreamPlayer } from './player.js';
export type { CreateViostreamPlayerOptions } from './player.js';

// Internal — used by framework wrapper packages (not part of the consumer-facing API)
export { wrapRawPlayer, normalizeForceAspectRatio } from './player.js';

// Bundled embed API
export { getViostreamApi } from './api.js';

// Script loader (deprecated — kept for backward compatibility)
export { loadViostream } from './loader.js';

// Types — re-export everything so consumers can import types
export type {
  ViostreamEmbedOptions,
  ViostreamTimeUpdateData,
  ViostreamVolumeChangeData,
  ViostreamErrorData,
  ViostreamProgressData,
  ViostreamPlayerEventMap,
  ViostreamEventHandler,
  ViostreamPlayer,
} from './types.js';

// Internal types — used by framework wrapper packages and tests
export type {
  RawViostreamPlayerInstance,
  ViostreamGlobal,
} from './types.js';

/**
 * viostream-player-core
 *
 * Framework-agnostic core for the Viostream player SDK.
 *
 * @example Headless / programmatic usage
 * ```ts
 * import { createViostreamPlayer } from 'viostream-player-core';
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
export { createViostreamPlayer, wrapRawPlayer } from './player.js';
export type { CreateViostreamPlayerOptions } from './player.js';

// Script loader
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
  ViostreamCue,
  ViostreamCueFieldUpdate,
  ViostreamTrack,
  ViostreamPlayer,
  RawViostreamPlayerInstance,
  ViostreamGlobal,
} from './types.js';

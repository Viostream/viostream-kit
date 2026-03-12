/**
 * viostream-player-svelte
 *
 * Svelte 5 SDK for the Viostream video player.
 *
 * @example Component usage
 * ```svelte
 * <script lang="ts">
 *   import { ViostreamPlayer } from 'viostream-player-svelte';
 * </script>
 *
 * <ViostreamPlayer
 *   accountKey="vc-100100100"
 *   publicKey="nhedxonrxsyfee"
 *   displayTitle={true}
 *   onplay={() => console.log('playing')}
 * />
 * ```
 *
 * @example Headless / programmatic usage
 * ```ts
 * import { createViostreamPlayer } from 'viostream-player-svelte';
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

// Component
export { default as ViostreamPlayer } from './ViostreamPlayer.svelte';

// Re-export everything from core so consumers can import from this package
export {
  createViostreamPlayer,
  wrapRawPlayer,
  loadViostream,
} from 'viostream-player-core';

export type {
  CreateViostreamPlayerOptions,
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
  ViostreamPlayer as ViostreamPlayerInstance,
  RawViostreamPlayerInstance,
  ViostreamGlobal,
} from 'viostream-player-core';

// Svelte-specific types
export type {
  ViostreamPlayerProps,
  ViostreamPlayerEventProps,
} from './types.js';

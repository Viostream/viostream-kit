/**
 * @viostream/viostream-player-vue
 *
 * Vue 3 SDK for the Viostream video player.
 *
 * @example Component usage
 * ```vue
 * <script setup lang="ts">
 *   import { ViostreamPlayer } from '@viostream/viostream-player-vue';
 * </script>
 *
 * <template>
 *   <ViostreamPlayer
 *     account-key="vc-100100100"
 *     public-key="nhedxonrxsyfee"
 *     :display-title="true"
 *     @play="console.log('playing')"
 *   />
 * </template>
 * ```
 *
 * @example Headless / programmatic usage
 * ```ts
 * import { createViostreamPlayer } from '@viostream/viostream-player-vue';
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
export { default as ViostreamPlayer } from './ViostreamPlayer.vue';

// Re-export everything from core so consumers can import from this package
export {
  createViostreamPlayer,
  wrapRawPlayer,
  loadViostream,
} from '@viostream/viostream-player-core';

export type {
  CreateViostreamPlayerOptions,
  ViostreamEmbedOptions,
  ViostreamTimeUpdateData,
  ViostreamVolumeChangeData,
  ViostreamErrorData,
  ViostreamProgressData,
  ViostreamPlayerEventMap,
  ViostreamEventHandler,
  ViostreamPlayer as ViostreamPlayerInstance,
  RawViostreamPlayerInstance,
  ViostreamGlobal,
} from '@viostream/viostream-player-core';

// Vue-specific types
export type {
  ViostreamPlayerProps,
  ViostreamPlayerEventProps,
} from './types.js';

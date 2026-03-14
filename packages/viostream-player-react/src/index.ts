/**
 * @viostream/viostream-player-react
 *
 * React 18+ SDK for the Viostream video player.
 *
 * @example Component usage
 * ```tsx
 * import { ViostreamPlayer } from '@viostream/viostream-player-react';
 *
 * function App() {
 *   return (
 *     <ViostreamPlayer
 *       accountKey="vc-100100100"
 *       publicKey="nhedxonrxsyfee"
 *       displayTitle={true}
 *       onPlay={() => console.log('playing')}
 *     />
 *   );
 * }
 * ```
 *
 * @example Headless / programmatic usage
 * ```ts
 * import { createViostreamPlayer } from '@viostream/viostream-player-react';
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
export { ViostreamPlayer } from './ViostreamPlayer.js';

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

// React-specific types
export type {
  ViostreamPlayerProps,
  ViostreamPlayerEventProps,
} from './types.js';

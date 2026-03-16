/**
 * @viostream/viostream-player-angular
 *
 * Angular 17+ SDK for the Viostream video player.
 *
 * @example Component usage
 * ```ts
 * import { ViostreamPlayerComponent } from '@viostream/viostream-player-angular';
 *
 * @Component({
 *   selector: 'app-root',
 *   standalone: true,
 *   imports: [ViostreamPlayerComponent],
 *   template: `
 *     <viostream-player
 *       [accountKey]="'vc-100100100'"
 *       [publicKey]="'nhedxonrxsyfee'"
 *       [displayTitle]="true"
 *       (play)="onPlay()"
 *     />
 *   `,
 * })
 * export class AppComponent {
 *   onPlay() {
 *     console.log('playing');
 *   }
 * }
 * ```
 *
 * @example Headless / programmatic usage
 * ```ts
 * import { createViostreamPlayer } from '@viostream/viostream-player-angular';
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
export { ViostreamPlayerComponent } from './viostream-player.component';

// Re-export everything from core so consumers can import from this package
export {
  createViostreamPlayer,
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
} from '@viostream/viostream-player-core';

// Angular-specific types
export type {
  ViostreamPlayerInputs,
  ViostreamPlayerEventProps,
} from './types';

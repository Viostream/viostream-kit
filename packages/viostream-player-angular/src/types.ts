/**
 * Viostream Player SDK — Angular-specific type definitions
 *
 * Core types (ViostreamPlayer, ViostreamEmbedOptions, etc.) are re-exported from
 * `@viostream/viostream-player-core`. This file defines only the Angular component types.
 */

import type {
  ViostreamEmbedOptions,
  ViostreamPlayer,
  ViostreamTimeUpdateData,
  ViostreamVolumeChangeData,
  ViostreamErrorData,
  ViostreamProgressData,
} from '@viostream/viostream-player-core';

// ---------------------------------------------------------------------------
// Component event signatures (for <viostream-player />)
// ---------------------------------------------------------------------------

/** Event signatures emitted by the `<viostream-player>` component. */
export interface ViostreamPlayerEventProps {
  play: void;
  pause: void;
  ended: void;
  timeUpdate: ViostreamTimeUpdateData;
  volumeChange: ViostreamVolumeChangeData;
  playerError: ViostreamErrorData;
  progress: ViostreamProgressData;
  ready: void;
  seeked: void;
  loaded: void;
}

/** Input props accepted by the `<viostream-player>` component. */
export interface ViostreamPlayerInputs extends ViostreamEmbedOptions {
  /** Your Viostream account key (e.g. `'vc-100100100'`). */
  accountKey: string;
  /** The public key of the media asset to embed. */
  publicKey: string;
  /**
   * Optional CSS class applied to the outer wrapper `<div>`.
   * Use `cssClass` instead of `class` to avoid Angular template conflicts.
   */
  cssClass?: string;
}

/**
 * Viostream Player SDK — Svelte-specific type definitions
 *
 * Core types (ViostreamPlayer, ViostreamEmbedOptions, etc.) are re-exported from
 * `@viostream/viostream-player-core`. This file defines only the Svelte component props.
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
// Component props (for <ViostreamPlayer />)
// ---------------------------------------------------------------------------

/** Callback props for player events on the `<ViostreamPlayer>` component. */
export interface ViostreamPlayerEventProps {
  onplay?: () => void;
  onpause?: () => void;
  onended?: () => void;
  ontimeupdate?: (data: ViostreamTimeUpdateData) => void;
  onvolumechange?: (data: ViostreamVolumeChangeData) => void;
  onerror?: (data: ViostreamErrorData) => void;
  onprogress?: (data: ViostreamProgressData) => void;
  onready?: () => void;
  onseeked?: () => void;
  onloaded?: () => void;
}

/** Props accepted by the `<ViostreamPlayer>` component. */
export interface ViostreamPlayerProps extends ViostreamEmbedOptions, ViostreamPlayerEventProps {
  /** Your Viostream account key (e.g. `'vc-100100100'`). */
  accountKey: string;
  /** The public key of the media asset to embed. */
  publicKey: string;
  /**
   * Optional CSS class applied to the outer wrapper `<div>`.
   */
  class?: string;
  /**
   * Callback fired once the player is ready, providing the `ViostreamPlayer` instance.
   */
  onplayerready?: (player: ViostreamPlayer) => void;
}

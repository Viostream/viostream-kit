/**
 * Viostream Player SDK — React-specific type definitions
 *
 * Core types (ViostreamPlayer, ViostreamEmbedOptions, etc.) are re-exported from
 * `@viostream/viostream-player-core`. This file defines only the React component props.
 */

import type { ReactNode } from 'react';
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
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (data: ViostreamTimeUpdateData) => void;
  onVolumeChange?: (data: ViostreamVolumeChangeData) => void;
  onError?: (data: ViostreamErrorData) => void;
  onProgress?: (data: ViostreamProgressData) => void;
  onReady?: () => void;
  onSeeked?: () => void;
  onLoaded?: () => void;
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
  className?: string;
  /**
   * Callback fired once the player is ready, providing the `ViostreamPlayer` instance.
   */
  onPlayerReady?: (player: ViostreamPlayer) => void;
  /**
   * Render prop for a custom loading indicator. Shown while the player is loading.
   */
  renderLoading?: () => ReactNode;
  /**
   * Render prop for a custom error display. Receives the error message string.
   */
  renderError?: (message: string) => ReactNode;
}

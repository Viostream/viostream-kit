/**
 * ViostreamPlayer — React component that embeds a Viostream video player.
 *
 * @example
 * ```tsx
 * import { ViostreamPlayer } from '@viostream/viostream-player-react';
 * import type { ViostreamPlayerInstance } from '@viostream/viostream-player-react';
 *
 * function App() {
 *   const [player, setPlayer] = useState<ViostreamPlayerInstance>();
 *
 *   return (
 *     <ViostreamPlayer
 *       accountKey="vc-100100100"
 *       publicKey="nhedxonrxsyfee"
 *       displayTitle={true}
 *       sharing={true}
 *       onPlay={() => console.log('playing!')}
 *       onTimeUpdate={(d) => console.log('time:', d.seconds)}
 *       onPlayerReady={(p) => setPlayer(p)}
 *     />
 *   );
 * }
 * ```
 */

import { useEffect, useId, useRef, useState } from 'react';
import { loadViostream, wrapRawPlayer } from '@viostream/viostream-player-core';
import type {
  ViostreamEmbedOptions,
  ViostreamPlayer as ViostreamPlayerType,
  RawViostreamPlayerInstance,
  ViostreamEventHandler,
} from '@viostream/viostream-player-core';
import type { ViostreamPlayerProps } from './types.js';

// Maps React camelCase prop names → raw player event names
const EVENT_MAP: Array<[string, keyof ViostreamPlayerProps]> = [
  ['play', 'onPlay'],
  ['pause', 'onPause'],
  ['ended', 'onEnded'],
  ['timeupdate', 'onTimeUpdate'],
  ['volumechange', 'onVolumeChange'],
  ['error', 'onError'],
  ['progress', 'onProgress'],
  ['ready', 'onReady'],
  ['seeked', 'onSeeked'],
  ['loaded', 'onLoaded'],
];

export function ViostreamPlayer({
  // Required props
  accountKey,
  publicKey,

  // Embed options
  chapters,
  chapterDisplayType,
  chapterSlug,
  displayTitle,
  hlsQualitySelector,
  playerKey,
  sharing,
  speedSelector,
  startEndTimespan,
  startTime,
  transcriptDownload,

  // Event callbacks
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  onVolumeChange,
  onError,
  onProgress,
  onReady,
  onSeeked,
  onLoaded,

  // Component callbacks
  onPlayerReady,

  // Render props
  renderLoading,
  renderError,

  // Styling
  className,
}: ViostreamPlayerProps): React.JSX.Element {
  const reactId = useId();
  const containerId = useRef(
    `viostream-player-${reactId.replace(/:/g, '').slice(0, 8)}${Math.random().toString(36).slice(2, 6)}`,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | undefined>();
  const playerRef = useRef<ViostreamPlayerType | undefined>(undefined);

  // Keep latest callback refs to avoid re-running the init effect when callbacks change
  const callbackRefs = useRef<Record<string, ViostreamEventHandler | undefined>>({});
  callbackRefs.current = {
    onPlay: onPlay as ViostreamEventHandler | undefined,
    onPause: onPause as ViostreamEventHandler | undefined,
    onEnded: onEnded as ViostreamEventHandler | undefined,
    onTimeUpdate: onTimeUpdate as ViostreamEventHandler | undefined,
    onVolumeChange: onVolumeChange as ViostreamEventHandler | undefined,
    onError: onError as ViostreamEventHandler | undefined,
    onProgress: onProgress as ViostreamEventHandler | undefined,
    onReady: onReady as ViostreamEventHandler | undefined,
    onSeeked: onSeeked as ViostreamEventHandler | undefined,
    onLoaded: onLoaded as ViostreamEventHandler | undefined,
  };
  const onPlayerReadyRef = useRef(onPlayerReady);
  onPlayerReadyRef.current = onPlayerReady;

  // Build the embed options object from props
  const embedOptsRef = useRef<ViostreamEmbedOptions>({});
  const embedOpts: ViostreamEmbedOptions = {};
  if (chapters !== undefined) embedOpts.chapters = chapters;
  if (chapterDisplayType !== undefined) embedOpts.chapterDisplayType = chapterDisplayType;
  if (chapterSlug !== undefined) embedOpts.chapterSlug = chapterSlug;
  if (displayTitle !== undefined) embedOpts.displayTitle = displayTitle;
  if (hlsQualitySelector !== undefined) embedOpts.hlsQualitySelector = hlsQualitySelector;
  if (playerKey !== undefined) embedOpts.playerKey = playerKey;
  if (sharing !== undefined) embedOpts.sharing = sharing;
  if (speedSelector !== undefined) embedOpts.speedSelector = speedSelector;
  if (startEndTimespan !== undefined) embedOpts.startEndTimespan = startEndTimespan;
  if (startTime !== undefined) embedOpts.startTime = startTime;
  if (transcriptDownload !== undefined) embedOpts.transcriptDownload = transcriptDownload;
  embedOptsRef.current = embedOpts;

  // -----------------------------------------------------------------------
  // Mount / unmount: load script, embed player, wire initial events
  // -----------------------------------------------------------------------
  useEffect(() => {
    let destroyed = false;

    async function init() {
      try {
        const api = await loadViostream(accountKey);

        if (destroyed) return;

        const raw: RawViostreamPlayerInstance = api.embed(
          publicKey,
          containerId.current,
          embedOptsRef.current,
        );
        const wrappedPlayer = wrapRawPlayer(raw, containerId.current);

        if (destroyed) {
          wrappedPlayer.destroy();
          return;
        }

        playerRef.current = wrappedPlayer;
        setIsLoading(false);

        // Notify consumer that the player is ready
        onPlayerReadyRef.current?.(wrappedPlayer);
      } catch (err) {
        if (!destroyed) {
          setErrorMsg(err instanceof Error ? err.message : String(err));
          setIsLoading(false);
        }
      }
    }

    init();

    return () => {
      destroyed = true;
      playerRef.current?.destroy();
      playerRef.current = undefined;
    };
    // Only re-init when accountKey or publicKey change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountKey, publicKey]);

  // -----------------------------------------------------------------------
  // Reactively re-wire event handlers when callback props change
  // -----------------------------------------------------------------------
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const unsubscribers: Array<() => void> = [];

    for (const [eventName, propName] of EVENT_MAP) {
      const handler = callbackRefs.current[propName];
      if (handler) {
        const unsub = player.on(eventName, handler);
        unsubscribers.push(unsub);
      }
    }

    return () => {
      for (const unsub of unsubscribers) {
        unsub();
      }
    };
  }, [
    isLoading,
    onPlay,
    onPause,
    onEnded,
    onTimeUpdate,
    onVolumeChange,
    onError,
    onProgress,
    onReady,
    onSeeked,
    onLoaded,
  ]);

  return (
    <div
      id={containerId.current}
      className={className}
      data-viostream-player
      data-viostream-public-key={publicKey}
    >
      {isLoading && renderLoading ? renderLoading() : null}

      {errorMsg ? (
        renderError ? (
          renderError(errorMsg)
        ) : (
          <div data-viostream-error style={{ color: 'red', padding: '1em' }}>
            Failed to load Viostream player: {errorMsg}
          </div>
        )
      ) : null}
    </div>
  );
}

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

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import Debug from 'debug';
import { getViostreamApi, wrapRawPlayer, normalizeForceAspectRatio } from '@viostream/viostream-player-core';
import type {
  ViostreamEmbedOptions,
  ViostreamPlayer as ViostreamPlayerType,
  RawViostreamPlayerInstance,
  ViostreamEventHandler,
} from '@viostream/viostream-player-core';
import type { ViostreamPlayerProps } from './types.js';
import { SDK_NAME, SDK_VERSION } from './version.js';

const debug = Debug('viostream:react');

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
  chapterSlug,
  displayTitle,
  hlsQualitySelector,
  playerKey,
  playerStyle,
  sharing,
  skinActive,
  skinBackground,
  skinCustom,
  skinInactive,
  speedSelector,
  startEndTimespan,
  startTime,
  transcriptDownload,
  useSettingsMenu,
  forceAspectRatio,

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
  // Separate ID for the nested div that the embed API operates on.
  // This isolates embed DOM mutations (innerHTML = '') from React-managed
  // children (loading/error indicators), preventing reconciliation issues
  // on hard refresh and StrictMode double-mount.
  const embedTargetId = useRef(
    `viostream-embed-${reactId.replace(/:/g, '').slice(0, 8)}${Math.random().toString(36).slice(2, 6)}`,
  );

  debug('render publicKey=%s containerId=%s embedTargetId=%s', publicKey, containerId.current, embedTargetId.current);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | undefined>();
  const playerRef = useRef<ViostreamPlayerType | undefined>(undefined);

  // Track whether the container <div> has been attached to the DOM.
  // The ref callback fires during commit — setting this state defers
  // the init effect until React has flushed the DOM, guaranteeing the
  // container is available for the Viostream embed API.
  const [containerReady, setContainerReady] = useState(false);
  const containerRefCallback = useCallback((el: HTMLDivElement | null) => {
    const isAttached = el !== null;
    debug('ref callback el=%s containerReady -> %s containerId=%s', isAttached ? 'HTMLDivElement' : 'null', isAttached, containerId.current);
    setContainerReady(isAttached);
  }, []);

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
  if (chapterSlug !== undefined) embedOpts.chapterSlug = chapterSlug;
  if (displayTitle !== undefined) embedOpts.displayTitle = displayTitle;
  if (hlsQualitySelector !== undefined) embedOpts.hlsQualitySelector = hlsQualitySelector;
  if (playerKey !== undefined) embedOpts.playerKey = playerKey;
  if (playerStyle !== undefined) embedOpts.playerStyle = playerStyle;
  if (sharing !== undefined) embedOpts.sharing = sharing;
  if (skinActive !== undefined) embedOpts.skinActive = skinActive;
  if (skinBackground !== undefined) embedOpts.skinBackground = skinBackground;
  if (skinCustom !== undefined) embedOpts.skinCustom = skinCustom;
  if (skinInactive !== undefined) embedOpts.skinInactive = skinInactive;
  if (speedSelector !== undefined) embedOpts.speedSelector = speedSelector;
  if (startEndTimespan !== undefined) embedOpts.startEndTimespan = startEndTimespan;
  if (startTime !== undefined) embedOpts.startTime = startTime;
  if (transcriptDownload !== undefined) embedOpts.transcriptDownload = transcriptDownload;
  if (useSettingsMenu !== undefined) embedOpts.useSettingsMenu = useSettingsMenu;
  embedOptsRef.current = embedOpts;

  // Keep the normalized forceAspectRatio in a ref so the init effect can read
  // the latest value without re-running (mirrors the embedOptsRef pattern).
  const forceAspectRatioRef = useRef<number | undefined>();
  forceAspectRatioRef.current = normalizeForceAspectRatio(forceAspectRatio);

  // -----------------------------------------------------------------------
  // Mount / unmount: load script, embed player, wire initial events
  // -----------------------------------------------------------------------
  useEffect(() => {
    // Wait until the container <div> is confirmed in the DOM via the ref callback.
    if (!containerReady) {
      debug('init effect skipped — containerReady=false publicKey=%s', publicKey);
      return;
    }

    debug('init effect running publicKey=%s accountKey=%s containerReady=%s embedTargetId=%s', publicKey, accountKey, containerReady, embedTargetId.current);

    let destroyed = false;

    async function init() {
      try {
        debug('init: getting embed API');
        const api = getViostreamApi();

        if (destroyed) {
          debug('init: stale closure detected after getViostreamApi — aborting publicKey=%s', publicKey);
          return;
        }

        debug('init: calling api.embed publicKey=%s embedTargetId=%s options=%o', publicKey, embedTargetId.current, embedOptsRef.current);
        const raw: RawViostreamPlayerInstance = api.embed(
          publicKey,
          embedTargetId.current,
          embedOptsRef.current,
          forceAspectRatioRef.current,
        );
        debug('init: api.embed returned raw player');

        const wrappedPlayer = wrapRawPlayer(raw, embedTargetId.current);
        debug('init: wrapRawPlayer completed embedTargetId=%s', embedTargetId.current);

        if (destroyed) {
          debug('init: stale closure detected after wrapRawPlayer — destroying and aborting publicKey=%s', publicKey);
          wrappedPlayer.destroy();
          return;
        }

        playerRef.current = wrappedPlayer;
        debug('init: playerRef set, isLoading -> false publicKey=%s', publicKey);
        setIsLoading(false);

        // Notify consumer that the player is ready
        debug('init: firing onPlayerReady publicKey=%s', publicKey);
        onPlayerReadyRef.current?.(wrappedPlayer);
      } catch (err) {
        if (!destroyed) {
          const msg = err instanceof Error ? err.message : String(err);
          debug('init: error caught publicKey=%s error=%s', publicKey, msg);
          setErrorMsg(msg);
          setIsLoading(false);
        } else {
          debug('init: error caught but destroyed — ignoring publicKey=%s', publicKey);
        }
      }
    }

    init();

    return () => {
      debug('init effect cleanup publicKey=%s hasPlayer=%s', publicKey, !!playerRef.current);
      destroyed = true;
      playerRef.current?.destroy();
      playerRef.current = undefined;
    };
    // Re-init when accountKey, publicKey, or container readiness change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountKey, publicKey, containerReady]);

  // -----------------------------------------------------------------------
  // Reactively re-wire event handlers when callback props change
  // -----------------------------------------------------------------------
  useEffect(() => {
    const player = playerRef.current;
    if (!player) {
      debug('event wiring effect skipped — no player isLoading=%s', isLoading);
      return;
    }

    const unsubscribers: Array<() => void> = [];
    const wiredEvents: string[] = [];

    for (const [eventName, propName] of EVENT_MAP) {
      const handler = callbackRefs.current[propName];
      if (handler) {
        const unsub = player.on(eventName, handler);
        unsubscribers.push(unsub);
        wiredEvents.push(eventName);
      }
    }

    debug('event wiring: subscribed to [%s] isLoading=%s', wiredEvents.join(', '), isLoading);

    return () => {
      debug('event wiring cleanup: unsubscribing %d events', unsubscribers.length);
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
      ref={containerRefCallback}
      id={containerId.current}
      className={className}
      data-viostream-player
      data-viostream-public-key={publicKey}
      data-viostream-sdk={`${SDK_NAME}@${SDK_VERSION}`}
    >
      <div id={embedTargetId.current} data-viostream-embed-target />

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

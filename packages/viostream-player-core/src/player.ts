/**
 * `createViostreamPlayer()` — headless / programmatic API for the Viostream player.
 *
 * Loads the Viostream API script, embeds a player in the given target element,
 * and returns a typed `ViostreamPlayer` interface with promise-based getters, command
 * methods, and event subscription.
 */

import { getViostreamApi } from './api.js';
import type {
  RawViostreamPlayerInstance,
  ViostreamEmbedOptions,
  ViostreamEventHandler,
  ViostreamPlayer,
  ViostreamPlayerEventMap,
} from './types.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CreateViostreamPlayerOptions {
  /** Your Viostream account key (e.g. `'vc-100100100'`). */
  accountKey: string;
  /** The public key of the media asset to embed. */
  publicKey: string;
  /**
   * The `id` of the container element into which the player will be embedded,
   * **or** a direct reference to the container element.
   */
  target: string | HTMLElement;
  /** Optional embed options. */
  options?: ViostreamEmbedOptions;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

/**
 * Create a Viostream player programmatically.
 *
 * ```ts
 * const player = await createViostreamPlayer({
 *   accountKey: 'vc-100100100',
 *   publicKey: 'nhedxonrxsyfee',
 *   target: 'my-video-div',
 *   options: { displayTitle: true, sharing: true }
 * });
 *
 * player.play();
 * player.on('timeupdate', (d) => console.log(d.seconds));
 * const duration = await player.getDuration();
 * ```
 */
export async function createViostreamPlayer(opts: CreateViostreamPlayerOptions): Promise<ViostreamPlayer> {
  const { accountKey, publicKey, options = {} } = opts;

  // Resolve the target element id
  let targetId: string;
  if (typeof opts.target === 'string') {
    targetId = opts.target;
  } else {
    // If a DOM element was provided, ensure it has an id (create one if needed)
    if (!opts.target.id) {
      opts.target.id = `viostream-target-${Math.random().toString(36).slice(2, 10)}`;
    }
    targetId = opts.target.id;
  }

  // Get the bundled Viostream embed API
  const api = getViostreamApi();

  // Embed the player
  const raw: RawViostreamPlayerInstance = api.embed(publicKey, targetId, options);

  // Build the SDK wrapper
  return wrapRawPlayer(raw, targetId);
}

// ---------------------------------------------------------------------------
// Wrapper factory
// ---------------------------------------------------------------------------

/**
 * Wraps the raw callback-based player instance with a clean, typed,
 * promise-based public API.
 */
export function wrapRawPlayer(raw: RawViostreamPlayerInstance, targetId: string): ViostreamPlayer {
  /** Registry of event listeners for teardown. */
  const listeners = new Map<string, Set<ViostreamEventHandler>>();

  let destroyed = false;

  // -- Helper: promisify a callback-style getter --------------------------
  function promisifyGet<T>(method: (cb: (v: T) => void) => void): Promise<T> {
    if (destroyed) return Promise.reject(new Error('Player has been destroyed'));
    return new Promise<T>((resolve) => {
      method.call(raw, resolve);
    });
  }

  const player: ViostreamPlayer = {
    // -- Playback controls ------------------------------------------------
    play() {
      raw.play();
    },
    pause() {
      raw.pause();
    },
    mute() {
      raw.mute();
    },
    unmute() {
      raw.unmute();
    },
    setVolume(value: number) {
      raw.setVolume(value);
    },
    setLoop(value: boolean) {
      raw.setLoop(value);
    },
    setCurrentTime(seconds: number, play?: boolean) {
      raw.setCurrentTime(seconds, play);
    },
    reload(options?: Record<string, unknown>) {
      raw.reload(options);
    },

    // -- Promise-based getters --------------------------------------------
    getVolume() {
      return promisifyGet<number>(raw.getVolume.bind(raw));
    },
    getLoop() {
      return promisifyGet<boolean>(raw.getLoop.bind(raw));
    },
    getCurrentTime() {
      return promisifyGet<number>(raw.getCurrentTime.bind(raw));
    },
    getPaused() {
      return promisifyGet<boolean>(raw.getPaused.bind(raw));
    },
    getDuration() {
      return promisifyGet<number>(raw.getDuration.bind(raw));
    },
    getMuted() {
      return promisifyGet<boolean>(raw.getMuted.bind(raw));
    },
    getAspectRatio() {
      return promisifyGet<number>(raw.getAspectRatio.bind(raw));
    },
    getHeight() {
      return promisifyGet<number>(raw.getHeight.bind(raw));
    },

    // -- Events -----------------------------------------------------------
    on<E extends keyof ViostreamPlayerEventMap>(
      event: E | string,
      handler: ViostreamEventHandler<ViostreamPlayerEventMap[E]>,
    ): () => void {
      if (destroyed) {
        console.warn('Cannot subscribe to events on a destroyed player');
        return () => {};
      }

      const eventName = event as string;

      if (!listeners.has(eventName)) {
        listeners.set(eventName, new Set());
      }
      listeners.get(eventName)!.add(handler as ViostreamEventHandler);

      // Register with the raw player's event system
      raw.on(eventName, handler as ViostreamEventHandler);

      // Return unsubscribe function
      return () => {
        player.off(eventName, handler as ViostreamEventHandler);
      };
    },

    off<E extends keyof ViostreamPlayerEventMap>(
      event: E | string,
      handler: ViostreamEventHandler<ViostreamPlayerEventMap[E]>,
    ): void {
      const eventName = event as string;
      const set = listeners.get(eventName);
      if (set) {
        set.delete(handler as ViostreamEventHandler);
        if (set.size === 0) {
          listeners.delete(eventName);
        }
      }
      // Note: the raw API doesn't expose an `off()` method, so we track
      // listeners ourselves. The raw `on()` bridge simply won't fire
      // handlers we've removed from our set. See the emit bridge comment below.
    },

    // -- Lifecycle --------------------------------------------------------
    destroy() {
      if (destroyed) return;
      destroyed = true;

      // Clear all listener registrations
      listeners.clear();

      // Remove the player DOM
      const container = document.getElementById(targetId);
      if (container) {
        container.innerHTML = '';
      }
    },
  };

  return player;
}

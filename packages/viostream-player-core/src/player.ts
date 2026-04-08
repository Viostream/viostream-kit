/**
 * `createViostreamPlayer()` — headless / programmatic API for the Viostream player.
 *
 * Loads the Viostream API script, embeds a player in the given target element,
 * and returns a typed `ViostreamPlayer` interface with promise-based getters, command
 * methods, and event subscription.
 */

import Debug from 'debug';
import { getViostreamApi } from './api.js';
import type {
  RawViostreamPlayerInstance,
  ViostreamEmbedOptions,
  ViostreamEventHandler,
  ViostreamPlayer,
  ViostreamPlayerEventMap,
} from './types.js';
import { SDK_NAME, SDK_VERSION } from './version.js';

const debug = Debug('viostream:core:player');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Normalize a `forceAspectRatio` value to `undefined` unless it is a finite
 * positive number.  Non-finite values (NaN, ±Infinity) and values ≤ 0 would
 * disable `dynamicSizing` inside the embed API while still falling back to the
 * default 16:9 ratio — a silent and surprising failure mode.
 *
 * A `debug`-level warning is emitted when a value is discarded so that
 * consumers can diagnose misconfiguration during development.
 */
export function normalizeForceAspectRatio(value: number | undefined): number | undefined {
  if (value === undefined) return undefined;
  if (Number.isFinite(value) && value > 0) return value;

  debug('invalid forceAspectRatio=%o — must be a finite positive number; falling back to undefined', value);
  return undefined;
}

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
  /**
   * Force a specific aspect ratio for the player container.
   * Value is the ratio as a decimal (e.g., `1.7778` for 16:9).
   * When set, dynamicSizing is disabled automatically.
   */
  forceAspectRatio?: number;
}

/** Maximum time (ms) to wait for a callback-based getter before rejecting. */
const GETTER_TIMEOUT_MS = 10_000;

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
  const { accountKey, publicKey, options = {}, forceAspectRatio } = opts;
  debug('createViostreamPlayer publicKey=%s accountKey=%s', publicKey, accountKey);

  // Derive the effective forceAspectRatio from the top-level option or the
  // nested embed-options object (top-level takes precedence).  Strip it from
  // the options bag so it is not passed through as a stray playerSetting — the
  // vendored embed API only consumes it as a separate 4th argument.
  // Normalize to undefined for non-finite / non-positive values.
  const effectiveForceAspectRatio = normalizeForceAspectRatio(forceAspectRatio ?? options.forceAspectRatio);
  delete options.forceAspectRatio;

  // Resolve the target element id
  let targetId: string;
  if (typeof opts.target === 'string') {
    targetId = opts.target;
    debug('target resolved from string id=%s', targetId);
  } else {
    // If a DOM element was provided, ensure it has an id (create one if needed)
    if (!opts.target.id) {
      opts.target.id = `viostream-target-${Math.random().toString(36).slice(2, 10)}`;
      debug('target element had no id, generated id=%s', opts.target.id);
    }
    targetId = opts.target.id;
    debug('target resolved from HTMLElement id=%s', targetId);
  }

  // Stamp the SDK identifier on the target element
  const targetEl = typeof opts.target === 'string'
    ? document.getElementById(opts.target)
    : opts.target;
  targetEl?.setAttribute('data-viostream-sdk', `${SDK_NAME}@${SDK_VERSION}`);

  // Get the bundled Viostream embed API
  const api = getViostreamApi();

  // Embed the player
  debug('calling api.embed publicKey=%s targetId=%s options=%o', publicKey, targetId, options);
  const raw: RawViostreamPlayerInstance = api.embed(publicKey, targetId, options, effectiveForceAspectRatio);
  debug('api.embed returned raw player for targetId=%s', targetId);

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
  debug('wrapRawPlayer targetId=%s', targetId);

  /** Registry of event listeners for teardown. */
  const listeners = new Map<string, Set<ViostreamEventHandler>>();

  let destroyed = false;

  // -- Helper: promisify a callback-style getter --------------------------
  function promisifyGet<T>(method: (cb: (v: T) => void) => void): Promise<T> {
    if (destroyed) {
      debug('getter rejected — player is destroyed targetId=%s', targetId);
      return Promise.reject(new Error('Player has been destroyed'));
    }
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Player getter timed out'));
      }, GETTER_TIMEOUT_MS);

      method.call(raw, (value: T) => {
        clearTimeout(timer);
        resolve(value);
      });
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
        debug('on() rejected — player is destroyed targetId=%s event=%s', targetId, event);
        return () => {};
      }

      const eventName = event as string;
      debug('on event=%s targetId=%s', eventName, targetId);

      if (!listeners.has(eventName)) {
        listeners.set(eventName, new Set());
      }
      listeners.get(eventName)!.add(handler as ViostreamEventHandler);

      // Wrap the handler in a proxy so that when off() removes it from
      // the internal set, the raw player's event system stops forwarding
      // to it. The raw API does not expose an `off()` method, so this
      // proxy-based approach is the only way to truly unsubscribe.
      const proxy: ViostreamEventHandler = (data: unknown) => {
        const set = listeners.get(eventName);
        if (set?.has(handler as ViostreamEventHandler)) {
          (handler as ViostreamEventHandler)(data);
        }
      };
      raw.on(eventName, proxy);

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
      debug('off event=%s targetId=%s', eventName, targetId);
      const set = listeners.get(eventName);
      if (set) {
        set.delete(handler as ViostreamEventHandler);
        if (set.size === 0) {
          listeners.delete(eventName);
        }
      }
    },

    // -- Lifecycle --------------------------------------------------------
    destroy() {
      if (destroyed) {
        debug('destroy() called but already destroyed targetId=%s', targetId);
        return;
      }
      debug('destroy targetId=%s listeners=%d', targetId, listeners.size);
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

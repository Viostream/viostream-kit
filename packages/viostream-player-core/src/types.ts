/**
 * Viostream Player SDK — Core TypeScript type definitions
 *
 * Derived from the Viostream Player API source at
 * https://play.viostream.com/api/{accountKey}
 */

// ---------------------------------------------------------------------------
// Embed options
// ---------------------------------------------------------------------------

/** Options passed to `$viostream.embed()` and framework wrapper components. */
export interface ViostreamEmbedOptions {
  /** Display chapter markers. */
  chapters?: boolean;
  /** Chapter display style: `'dropdown'`, `'progressbar'`, or `'horizontal'`. */
  chapterDisplayType?: 'dropdown' | 'progressbar' | 'horizontal';
  /** Seek to a named chapter before playback begins. */
  chapterSlug?: string;
  /** Show the video title overlay. */
  displayTitle?: boolean;
  /** Show the HLS quality selector control. */
  hlsQualitySelector?: boolean;
  /** Override the player theme/key to use. */
  playerKey?: string;
  /** Show the sharing control. */
  sharing?: boolean;
  /** Show the playback speed selector. */
  speedSelector?: boolean;
  /** Play only a specific section of the video (e.g. `'10,30'`). */
  startEndTimespan?: string;
  /** Seek to a specific time (in seconds) before playback begins. */
  startTime?: string;
  /** Allow transcript download. */
  transcriptDownload?: boolean;
}

// ---------------------------------------------------------------------------
// Player events
// ---------------------------------------------------------------------------

/** Data passed with a `timeupdate` event. */
export interface ViostreamTimeUpdateData {
  seconds: number;
  duration: number;
}

/** Data passed with a `volumechange` event. */
export interface ViostreamVolumeChangeData {
  volume: number;
}

/** Data passed with an `error` event. */
export interface ViostreamErrorData {
  code?: number;
  message?: string;
}

/** Data passed with a `progress` (buffering) event. */
export interface ViostreamProgressData {
  percent: number;
}

/**
 * Map of all known player event names to their callback signatures.
 *
 * The Viostream player emits standard PlayerJS events plus custom ones.
 * Unknown event names are still accepted via the string index signature.
 */
export interface ViostreamPlayerEventMap {
  /** Playback has started or resumed. */
  play: void;
  /** Playback has been paused. */
  pause: void;
  /** The media has finished playing. */
  ended: void;
  /** Current playback time has changed. */
  timeupdate: ViostreamTimeUpdateData;
  /** Volume or muted state has changed. */
  volumechange: ViostreamVolumeChangeData;
  /** An error occurred. */
  error: ViostreamErrorData;
  /** Buffering progress update. */
  progress: ViostreamProgressData;
  /** The player has loaded and is ready. */
  ready: void;
  /** Playback is seeking. */
  seeked: void;
  /** The player has been loaded (metadata available). */
  loaded: void;
  /** Catch-all for any other custom events. */
  [event: string]: unknown;
}

/** A single event listener function. */
export type ViostreamEventHandler<T = unknown> = (data: T) => void;

// ---------------------------------------------------------------------------
// Cue / Track helpers
// ---------------------------------------------------------------------------

/** A cue point that can be added to the player timeline. */
export interface ViostreamCue {
  id?: string;
  startTime: number;
  endTime?: number;
  text?: string;
  [key: string]: unknown;
}

/** A field-level update to apply to an existing cue. */
export interface ViostreamCueFieldUpdate {
  [field: string]: unknown;
}

/** A track object returned by `getTracks()`. */
export interface ViostreamTrack {
  id: string;
  label?: string;
  kind?: string;
  language?: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Raw $viostream global (internal)
// ---------------------------------------------------------------------------

/**
 * The raw player instance returned by `$viostream.embed()`.
 * Methods that "get" a value use a callback pattern in the raw API;
 * the SDK wraps these with promise-based alternatives.
 */
export interface RawViostreamPlayerInstance {
  play(): void;
  pause(): void;
  mute(): void;
  unmute(): void;
  setVolume(value: number): void;
  getVolume(cb: (volume: number) => void): void;
  setLoop(value: boolean): void;
  getLoop(cb: (loop: boolean) => void): void;
  setCurrentTime(seconds: number, play?: boolean): void;
  getCurrentTime(cb: (seconds: number) => void): void;
  getPaused(cb: (paused: boolean) => void): void;
  getDuration(cb: (duration: number) => void): void;
  getMuted(cb: (muted: boolean) => void): void;
  getAspectRatio(cb: (ratio: number) => void): void;
  getLiveCurrentTime(cb: (seconds: number) => void): void;
  getHeight(cb: (height: number) => void): void;
  reload(options?: Record<string, unknown>): void;
  getTracks(cb: (tracks: ViostreamTrack[]) => void): void;
  setTrack(track: ViostreamTrack | string): void;
  cueAdd(cue: ViostreamCue): void;
  cueUpdate(cue: ViostreamCue, field: ViostreamCueFieldUpdate): void;
  cueDelete(cue: ViostreamCue | string): void;
  asrAdd(cues: unknown[], id: string): void;
  on(event: string, handler: ViostreamEventHandler): void;
}

/** Shape of the `window.$viostream` global injected by the API script. */
export interface ViostreamGlobal {
  embed(
    publicKey: string,
    target: string,
    options?: ViostreamEmbedOptions,
  ): RawViostreamPlayerInstance;
}

// ---------------------------------------------------------------------------
// SDK public player interface (promise-based)
// ---------------------------------------------------------------------------

/**
 * The public Viostream player interface exposed by the SDK.
 *
 * All "getter" methods return promises rather than requiring callbacks.
 */
export interface ViostreamPlayer {
  // -- Playback controls --------------------------------------------------
  /** Start or resume playback. */
  play(): void;
  /** Pause playback. */
  pause(): void;
  /** Mute audio. */
  mute(): void;
  /** Unmute audio. */
  unmute(): void;
  /** Set the volume (0–1). */
  setVolume(value: number): void;
  /** Enable or disable looping. */
  setLoop(value: boolean): void;
  /**
   * Seek to a specific time.
   * @param seconds  The target time in seconds.
   * @param play     Whether to auto-play after seeking.
   */
  setCurrentTime(seconds: number, play?: boolean): void;
  /** Reload the player, optionally with new settings. */
  reload(options?: Record<string, unknown>): void;

  // -- Track management ---------------------------------------------------
  /** Set the active track (audio/subtitle). */
  setTrack(track: ViostreamTrack | string): void;
  /** Get the list of available tracks. */
  getTracks(): Promise<ViostreamTrack[]>;

  // -- Cue management -----------------------------------------------------
  /** Add a cue point. */
  cueAdd(cue: ViostreamCue): void;
  /** Update a cue point field. */
  cueUpdate(cue: ViostreamCue, field: ViostreamCueFieldUpdate): void;
  /** Delete a cue point. */
  cueDelete(cue: ViostreamCue | string): void;

  // -- ASR ----------------------------------------------------------------
  /** Add automatic speech recognition data. */
  asrAdd(cues: unknown[], id: string): void;

  // -- Getters (promise-based) --------------------------------------------
  /** Get the current volume (0–1). */
  getVolume(): Promise<number>;
  /** Get whether looping is enabled. */
  getLoop(): Promise<boolean>;
  /** Get the current playback time in seconds. */
  getCurrentTime(): Promise<number>;
  /** Whether the player is currently paused. */
  getPaused(): Promise<boolean>;
  /** Get the total duration in seconds. */
  getDuration(): Promise<number>;
  /** Whether the player is currently muted. */
  getMuted(): Promise<boolean>;
  /** Get the video aspect ratio. */
  getAspectRatio(): Promise<number>;
  /** Get the live-stream current time. */
  getLiveCurrentTime(): Promise<number>;
  /** Get the computed player height. */
  getHeight(): Promise<number>;

  // -- Events -------------------------------------------------------------
  /**
   * Subscribe to a player event.
   * @returns An unsubscribe function.
   */
  on<E extends keyof ViostreamPlayerEventMap>(
    event: E,
    handler: ViostreamEventHandler<ViostreamPlayerEventMap[E]>,
  ): () => void;
  on(event: string, handler: ViostreamEventHandler): () => void;

  /**
   * Remove a previously registered event handler.
   */
  off<E extends keyof ViostreamPlayerEventMap>(
    event: E,
    handler: ViostreamEventHandler<ViostreamPlayerEventMap[E]>,
  ): void;
  off(event: string, handler: ViostreamEventHandler): void;

  // -- Lifecycle ----------------------------------------------------------
  /** Remove the player from the DOM and clean up all listeners. */
  destroy(): void;

  /** The underlying raw player instance (escape hatch). */
  readonly raw: RawViostreamPlayerInstance | undefined;
}

// ---------------------------------------------------------------------------
// Global augmentation
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    $viostream?: ViostreamGlobal;
    trackerParams?: Record<string, unknown>;
  }
}

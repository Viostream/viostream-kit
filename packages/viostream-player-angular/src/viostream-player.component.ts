/**
 * ViostreamPlayerComponent — Angular standalone component that embeds a Viostream video player.
 *
 * @example
 * ```html
 * <viostream-player
 *   [accountKey]="'vc-100100100'"
 *   [publicKey]="'nhedxonrxsyfee'"
 *   [displayTitle]="true"
 *   [sharing]="true"
 *   (play)="onPlay()"
 *   (timeUpdate)="onTimeUpdate($event)"
 *   (playerReady)="onPlayerReady($event)"
 * />
 * ```
 */

import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ElementRef,
  NgZone,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import Debug from 'debug';
import { getViostreamApi, wrapRawPlayer } from '@viostream/viostream-player-core';
import type {
  ViostreamEmbedOptions,
  ViostreamPlayer,
  RawViostreamPlayerInstance,
  ViostreamEventHandler,
  ViostreamTimeUpdateData,
  ViostreamVolumeChangeData,
  ViostreamErrorData,
  ViostreamProgressData,
} from '@viostream/viostream-player-core';
import { SDK_NAME, SDK_VERSION } from './version';

const debug = Debug('viostream:angular');

@Component({
  selector: 'viostream-player',
  standalone: true,
  template: `
    <div
      #container
      [id]="containerId"
      [class]="cssClass"
      data-viostream-player
      [attr.data-viostream-public-key]="publicKey"
      [attr.data-viostream-sdk]="sdkTag"
    >
      @if (isLoading()) {
        <ng-content select="[loading]" />
      }

      @if (errorMsg(); as msg) {
        <div data-viostream-error style="color: red; padding: 1em;">
          Failed to load Viostream player: {{ msg }}
        </div>
      }
    </div>
  `,
})
export class ViostreamPlayerComponent implements OnInit, OnDestroy {
  // ---------------------------------------------------------------------------
  // Inputs (required)
  // ---------------------------------------------------------------------------

  /** Your Viostream account key (e.g. `'vc-100100100'`). */
  @Input({ required: true }) accountKey!: string;
  /** The public key of the media asset to embed. */
  @Input({ required: true }) publicKey!: string;

  // ---------------------------------------------------------------------------
  // Inputs (embed options)
  // ---------------------------------------------------------------------------

  /** Display chapter markers. */
  @Input() chapters?: boolean;
  /** Seek to a named chapter before playback begins. */
  @Input() chapterSlug?: string;
  /** Show the video title overlay. */
  @Input() displayTitle?: boolean;
  /** Show the HLS quality selector control. */
  @Input() hlsQualitySelector?: boolean;
  /** Override the player theme/key to use. */
  @Input() playerKey?: string;
  /** The player rendering style. */
  @Input() playerStyle?: 'video' | 'audio' | 'audio-poster';
  /** Show the sharing control. */
  @Input() sharing?: boolean;
  /** Custom skin active colour (e.g. `'#000'`). Requires `skinCustom: true`. */
  @Input() skinActive?: string;
  /** Custom skin background colour (e.g. `'#000'`). Requires `skinCustom: true`. */
  @Input() skinBackground?: string;
  /** Enable a custom skin via the API. */
  @Input() skinCustom?: boolean;
  /** Custom skin inactive colour (e.g. `'#000'`). Requires `skinCustom: true`. */
  @Input() skinInactive?: string;
  /** Show the playback speed selector. */
  @Input() speedSelector?: boolean;
  /** Play only a specific section of the video (e.g. `'10,30'`). */
  @Input() startEndTimespan?: string;
  /** Seek to a specific time (in seconds) before playback begins. */
  @Input() startTime?: string;
  /** Allow transcript download. */
  @Input() transcriptDownload?: boolean;
  /** Enable the settings menu on the control bar. */
  @Input() useSettingsMenu?: boolean;

  // ---------------------------------------------------------------------------
  // Inputs (styling)
  // ---------------------------------------------------------------------------

  /** Optional CSS class applied to the outer wrapper `<div>`. */
  @Input() cssClass?: string;

  // ---------------------------------------------------------------------------
  // Outputs (player events)
  // ---------------------------------------------------------------------------

  /** Emitted when playback starts or resumes. */
  readonly play = output<void>();
  /** Emitted when playback is paused. */
  readonly pause = output<void>();
  /** Emitted when the media finishes playing. */
  readonly ended = output<void>();
  /** Emitted when the current playback time changes. */
  readonly timeUpdate = output<ViostreamTimeUpdateData>();
  /** Emitted when the volume changes. */
  readonly volumeChange = output<ViostreamVolumeChangeData>();
  /** Emitted when a player error occurs. Named `playerError` to avoid conflict with the native DOM `error` event. */
  readonly playerError = output<ViostreamErrorData>();
  /** Emitted on buffering progress. */
  readonly progress = output<ViostreamProgressData>();
  /** Emitted when the player is ready. */
  readonly ready = output<void>();
  /** Emitted when a seek operation completes. */
  readonly seeked = output<void>();
  /** Emitted when metadata has loaded. */
  readonly loaded = output<void>();
  /** Emitted once the player is ready, providing the `ViostreamPlayer` instance for programmatic control. */
  readonly playerReady = output<ViostreamPlayer>();

  // ---------------------------------------------------------------------------
  // Internal state
  // ---------------------------------------------------------------------------

  /** Unique ID for the player container element. */
  readonly containerId = `viostream-player-${Math.random().toString(36).slice(2, 10)}`;

  /** SDK identifier stamped as a data attribute on the container. */
  readonly sdkTag = `${SDK_NAME}@${SDK_VERSION}`;

  /** Whether the player is still loading. */
  readonly isLoading = signal(true);

  /** Error message if loading failed. */
  readonly errorMsg = signal<string | undefined>(undefined);

  /** Reference to the container div. */
  private readonly containerRef = viewChild<ElementRef<HTMLDivElement>>('container');

  /** The wrapped player instance. */
  private player: ViostreamPlayer | undefined;

  /** Whether the component has been destroyed. */
  private destroyed = false;

  /** Unsubscribe functions for event listeners. */
  private readonly unsubscribers: Array<() => void> = [];

  /** Angular zone for triggering change detection. */
  private readonly ngZone = inject(NgZone);

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  ngOnInit(): void {
    debug('ngOnInit publicKey=%s accountKey=%s containerId=%s', this.publicKey, this.accountKey, this.containerId);
    this.init();
  }

  ngOnDestroy(): void {
    debug('ngOnDestroy publicKey=%s hasPlayer=%s', this.publicKey, !!this.player);
    this.destroyed = true;
    this.unwireEvents();
    this.player?.destroy();
    this.player = undefined;
  }

  // ---------------------------------------------------------------------------
  // Private methods
  // ---------------------------------------------------------------------------

  private async init(): Promise<void> {
    try {
      debug('init: getting embed API');
      const api = getViostreamApi();

      if (this.destroyed) {
        debug('init: destroyed detected after getViostreamApi — aborting publicKey=%s', this.publicKey);
        return;
      }

      const embedOpts = this.buildEmbedOptions();
      debug('init: calling api.embed publicKey=%s containerId=%s options=%o', this.publicKey, this.containerId, embedOpts);
      const raw: RawViostreamPlayerInstance = api.embed(
        this.publicKey,
        this.containerId,
        embedOpts,
      );
      debug('init: api.embed returned raw player');

      const wrappedPlayer = wrapRawPlayer(raw, this.containerId);
      debug('init: wrapRawPlayer completed containerId=%s', this.containerId);

      if (this.destroyed) {
        debug('init: destroyed detected after wrapRawPlayer — destroying and aborting publicKey=%s', this.publicKey);
        wrappedPlayer.destroy();
        return;
      }

      this.player = wrappedPlayer;

      // Run state updates inside NgZone to trigger change detection
      this.ngZone.run(() => {
        this.isLoading.set(false);
      });
      debug('init: player set, isLoading -> false publicKey=%s', this.publicKey);

      // Wire up event callbacks
      this.wireEvents(wrappedPlayer);

      // Notify consumer that the player is ready
      debug('init: emitting playerReady publicKey=%s', this.publicKey);
      this.playerReady.emit(wrappedPlayer);
    } catch (err) {
      if (!this.destroyed) {
        const msg = err instanceof Error ? err.message : String(err);
        debug('init: error caught publicKey=%s error=%s', this.publicKey, msg);
        this.ngZone.run(() => {
          this.errorMsg.set(msg);
          this.isLoading.set(false);
        });
      } else {
        debug('init: error caught but destroyed — ignoring publicKey=%s', this.publicKey);
      }
    }
  }

  private buildEmbedOptions(): ViostreamEmbedOptions {
    const opts: ViostreamEmbedOptions = {};
    if (this.chapters !== undefined) opts.chapters = this.chapters;
    if (this.chapterSlug !== undefined) opts.chapterSlug = this.chapterSlug;
    if (this.displayTitle !== undefined) opts.displayTitle = this.displayTitle;
    if (this.hlsQualitySelector !== undefined) opts.hlsQualitySelector = this.hlsQualitySelector;
    if (this.playerKey !== undefined) opts.playerKey = this.playerKey;
    if (this.playerStyle !== undefined) opts.playerStyle = this.playerStyle;
    if (this.sharing !== undefined) opts.sharing = this.sharing;
    if (this.skinActive !== undefined) opts.skinActive = this.skinActive;
    if (this.skinBackground !== undefined) opts.skinBackground = this.skinBackground;
    if (this.skinCustom !== undefined) opts.skinCustom = this.skinCustom;
    if (this.skinInactive !== undefined) opts.skinInactive = this.skinInactive;
    if (this.speedSelector !== undefined) opts.speedSelector = this.speedSelector;
    if (this.startEndTimespan !== undefined) opts.startEndTimespan = this.startEndTimespan;
    if (this.startTime !== undefined) opts.startTime = this.startTime;
    if (this.transcriptDownload !== undefined) opts.transcriptDownload = this.transcriptDownload;
    if (this.useSettingsMenu !== undefined) opts.useSettingsMenu = this.useSettingsMenu;
    return opts;
  }

  /** Maps raw player event names to component output emitters. */
  private readonly EVENT_MAP: Array<[string, ViostreamEventHandler]> = [
    ['play', () => this.ngZone.run(() => this.play.emit())],
    ['pause', () => this.ngZone.run(() => this.pause.emit())],
    ['ended', () => this.ngZone.run(() => this.ended.emit())],
    ['timeupdate', (data: unknown) => this.ngZone.run(() => this.timeUpdate.emit(data as ViostreamTimeUpdateData))],
    ['volumechange', (data: unknown) => this.ngZone.run(() => this.volumeChange.emit(data as ViostreamVolumeChangeData))],
    ['error', (data: unknown) => this.ngZone.run(() => this.playerError.emit(data as ViostreamErrorData))],
    ['progress', (data: unknown) => this.ngZone.run(() => this.progress.emit(data as ViostreamProgressData))],
    ['ready', () => this.ngZone.run(() => this.ready.emit())],
    ['seeked', () => this.ngZone.run(() => this.seeked.emit())],
    ['loaded', () => this.ngZone.run(() => this.loaded.emit())],
  ];

  private wireEvents(wrappedPlayer: ViostreamPlayer): void {
    const wiredEvents: string[] = [];
    for (const [eventName, handler] of this.EVENT_MAP) {
      const unsub = wrappedPlayer.on(eventName, handler);
      this.unsubscribers.push(unsub);
      wiredEvents.push(eventName);
    }
    debug('wireEvents: subscribed to [%s]', wiredEvents.join(', '));
  }

  private unwireEvents(): void {
    debug('unwireEvents: unsubscribing %d events', this.unsubscribers.length);
    for (const unsub of this.unsubscribers) {
      unsub();
    }
    this.unsubscribers.length = 0;
  }
}

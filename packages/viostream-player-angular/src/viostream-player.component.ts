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
import { loadViostream, wrapRawPlayer } from '@viostream/viostream-player-core';
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
  /** Chapter display style. */
  @Input() chapterDisplayType?: 'progressbar';
  /** Seek to a named chapter before playback begins. */
  @Input() chapterSlug?: string;
  /** Show the video title overlay. */
  @Input() displayTitle?: boolean;
  /** Show the HLS quality selector control. */
  @Input() hlsQualitySelector?: boolean;
  /** Override the player theme/key to use. */
  @Input() playerKey?: string;
  /** Show the sharing control. */
  @Input() sharing?: boolean;
  /** Show the playback speed selector. */
  @Input() speedSelector?: boolean;
  /** Play only a specific section of the video (e.g. `'10,30'`). */
  @Input() startEndTimespan?: string;
  /** Seek to a specific time (in seconds) before playback begins. */
  @Input() startTime?: string;
  /** Allow transcript download. */
  @Input() transcriptDownload?: boolean;

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
    this.init();
  }

  ngOnDestroy(): void {
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
      const api = await loadViostream(this.accountKey);

      if (this.destroyed) return;

      const embedOpts = this.buildEmbedOptions();
      const raw: RawViostreamPlayerInstance = api.embed(
        this.publicKey,
        this.containerId,
        embedOpts,
      );
      const wrappedPlayer = wrapRawPlayer(raw, this.containerId);

      if (this.destroyed) {
        wrappedPlayer.destroy();
        return;
      }

      this.player = wrappedPlayer;

      // Run state updates inside NgZone to trigger change detection
      this.ngZone.run(() => {
        this.isLoading.set(false);
      });

      // Wire up event callbacks
      this.wireEvents(wrappedPlayer);

      // Notify consumer that the player is ready
      this.playerReady.emit(wrappedPlayer);
    } catch (err) {
      if (!this.destroyed) {
        this.ngZone.run(() => {
          this.errorMsg.set(err instanceof Error ? err.message : String(err));
          this.isLoading.set(false);
        });
      }
    }
  }

  private buildEmbedOptions(): ViostreamEmbedOptions {
    const opts: ViostreamEmbedOptions = {};
    if (this.chapters !== undefined) opts.chapters = this.chapters;
    if (this.chapterDisplayType !== undefined) opts.chapterDisplayType = this.chapterDisplayType;
    if (this.chapterSlug !== undefined) opts.chapterSlug = this.chapterSlug;
    if (this.displayTitle !== undefined) opts.displayTitle = this.displayTitle;
    if (this.hlsQualitySelector !== undefined) opts.hlsQualitySelector = this.hlsQualitySelector;
    if (this.playerKey !== undefined) opts.playerKey = this.playerKey;
    if (this.sharing !== undefined) opts.sharing = this.sharing;
    if (this.speedSelector !== undefined) opts.speedSelector = this.speedSelector;
    if (this.startEndTimespan !== undefined) opts.startEndTimespan = this.startEndTimespan;
    if (this.startTime !== undefined) opts.startTime = this.startTime;
    if (this.transcriptDownload !== undefined) opts.transcriptDownload = this.transcriptDownload;
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
    for (const [eventName, handler] of this.EVENT_MAP) {
      const unsub = wrappedPlayer.on(eventName, handler);
      this.unsubscribers.push(unsub);
    }
  }

  private unwireEvents(): void {
    for (const unsub of this.unsubscribers) {
      unsub();
    }
    this.unsubscribers.length = 0;
  }
}

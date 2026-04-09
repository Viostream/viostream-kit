import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ViostreamPlayerComponent } from '@viostream/viostream-player-angular';
import type {
  ViostreamPlayerInstance,
  ViostreamTimeUpdateData,
  ViostreamVolumeChangeData,
} from '@viostream/viostream-player-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, ViostreamPlayerComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  // ---------------------------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------------------------
  readonly accountKey = 'vc-100100100';
  videoSelect = 'r3qyz91r5k7q6b';
  customPublicKey = '';
  embedRevision = 0;

  get publicKey(): string {
    return this.videoSelect || this.customPublicKey;
  }

  // ---------------------------------------------------------------------------
  // Embed options
  // ---------------------------------------------------------------------------
  chapters = true;
  chapterSlug = '';
  displayTitle = false;
  hlsQualitySelector = true;
  optPlayerKey = '';
  playerStyle: 'video' | 'audio' | 'audio-poster' = 'video';
  sharing = false;
  skinCustom = false;
  skinActive = '';
  skinActiveColour = '#ff0000';
  skinBackground = '';
  skinBackgroundColour = '#000000';
  skinInactive = '';
  skinInactiveColour = '#cccccc';
  speedSelector = true;
  startEndTimespan = '';
  startTime = '';
  transcriptDownload = false;
  useSettingsMenu = false;
  forceAspectRatioEnabled = false;
  forceAspectRatioValue = 1.7778;

  get forceAspectRatio(): number | undefined {
    return this.forceAspectRatioEnabled ? this.forceAspectRatioValue : undefined;
  }

  // ---------------------------------------------------------------------------
  // Player state
  // ---------------------------------------------------------------------------
  player: ViostreamPlayerInstance | undefined;
  currentTime = 0;
  duration = 0;
  isPaused = true;
  isMuted = false;
  volume = 1;
  log: string[] = [];

  get percent(): number {
    return this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0;
  }

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  embed(): void {
    this.player = undefined;
    this.currentTime = 0;
    this.duration = 0;
    this.isPaused = true;
    this.isMuted = false;
    this.volume = 1;
    this.embedRevision++;
    this.addLog('Embed triggered');
  }

  // ---------------------------------------------------------------------------
  // Player event handlers
  // ---------------------------------------------------------------------------

  onPlayerReady(p: ViostreamPlayerInstance): void {
    this.player = p;
    this.addLog('Player ready');
    p.getDuration().then((d: number) => (this.duration = d));
    p.getPaused().then((v: boolean) => (this.isPaused = v));
    p.getMuted().then((v: boolean) => (this.isMuted = v));
    p.getVolume().then((v: number) => (this.volume = v));
  }

  onPlay(): void {
    this.isPaused = false;
    this.addLog('Event: play');
  }

  onPause(): void {
    this.isPaused = true;
    this.addLog('Event: pause');
  }

  onEnded(): void {
    this.addLog('Event: ended');
  }

  onTimeUpdate(data: ViostreamTimeUpdateData): void {
    this.currentTime = data.seconds;
    if (data.duration && data.duration !== this.duration) {
      this.duration = data.duration;
    }
  }

  onVolumeChange(data: ViostreamVolumeChangeData): void {
    this.volume = data.volume;
    this.addLog(`Event: volumechange → ${data.volume}`);
  }

  onSeeked(): void {
    this.addLog('Event: seeked');
  }

  // ---------------------------------------------------------------------------
  // Custom controls
  // ---------------------------------------------------------------------------

  togglePlay(): void {
    if (!this.player) return;
    if (this.isPaused) this.player.play(); else this.player.pause();
  }

  toggleMute(): void {
    if (!this.player) return;
    if (this.isMuted) this.player.unmute(); else this.player.mute();
  }

  seek(seconds: number): void {
    this.player?.setCurrentTime(seconds);
  }

  seekBack(): void {
    this.seek(Math.max(0, this.currentTime - 10));
  }

  seekForward(): void {
    this.seek(this.currentTime + 10);
  }

  // ---------------------------------------------------------------------------
  // Promise-based getters
  // ---------------------------------------------------------------------------

  async getCurrentTime(): Promise<void> {
    if (!this.player) return;
    const t = await this.player.getCurrentTime();
    this.addLog(`getCurrentTime() → ${t.toFixed(2)}s`);
  }

  async getDuration(): Promise<void> {
    if (!this.player) return;
    const d = await this.player.getDuration();
    this.addLog(`getDuration() → ${d.toFixed(2)}s`);
  }

  async getVolume(): Promise<void> {
    if (!this.player) return;
    const v = await this.player.getVolume();
    this.addLog(`getVolume() → ${v}`);
  }

  async getAspectRatio(): Promise<void> {
    if (!this.player) return;
    const r = await this.player.getAspectRatio();
    this.addLog(`getAspectRatio() → ${r}`);
  }

  // ---------------------------------------------------------------------------
  // Colour picker sync
  // ---------------------------------------------------------------------------

  syncColourToText(colour: string, field: 'skinActive' | 'skinBackground' | 'skinInactive'): void {
    this[field] = colour;
  }

  syncTextToColour(text: string, field: 'skinActiveColour' | 'skinBackgroundColour' | 'skinInactiveColour'): void {
    if (/^#[0-9a-fA-F]{6}$/.test(text)) this[field] = text;
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  formatTime(s: number): string {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  private addLog(msg: string): void {
    const ts = new Date().toLocaleTimeString();
    this.log = [`[${ts}] ${msg}`, ...this.log.slice(0, 49)];
  }
}

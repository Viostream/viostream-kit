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
  accountKey = 'vc-100100100';
  publicKey = 'nhedxonrxsyfee';

  /** Key used to force player remount when config changes. */
  get playerKey(): string {
    return `${this.accountKey}:${this.publicKey}`;
  }

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
  // Player event handlers
  // ---------------------------------------------------------------------------

  onPlayerReady(p: ViostreamPlayerInstance): void {
    this.player = p;
    this.addLog('Player ready');

    // Fetch initial state
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
    if (this.isPaused) {
      this.player.play();
    } else {
      this.player.pause();
    }
  }

  toggleMute(): void {
    if (!this.player) return;
    if (this.isMuted) {
      this.player.unmute();
    } else {
      this.player.mute();
    }
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

  async getTracks(): Promise<void> {
    if (!this.player) return;
    const tracks = await this.player.getTracks();
    this.addLog(`getTracks() → ${JSON.stringify(tracks)}`);
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

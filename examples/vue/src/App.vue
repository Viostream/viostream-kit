<script setup lang="ts">
import { ref, computed } from 'vue';
import { ViostreamPlayer } from '@viostream/viostream-player-vue';
import type { ViostreamPlayerInstance, ViostreamTimeUpdateData } from '@viostream/viostream-player-vue';
import './App.css';

// ---------------------------------------------------------------------------
// Configuration state
// ---------------------------------------------------------------------------
const ACCOUNT_KEY = 'vc-100100100';
const videoSelect = ref('r3qyz91r5k7q6b');
const customPublicKey = ref('');
const publicKey = computed(() => videoSelect.value || customPublicKey.value);

const embedRevision = ref(0);

// ---------------------------------------------------------------------------
// Embed options state
// ---------------------------------------------------------------------------
const chapters = ref(true);
const chapterSlug = ref('');
const displayTitle = ref(false);
const hlsQualitySelector = ref(true);
const optPlayerKey = ref('');
const playerStyle = ref<'video' | 'audio' | 'audio-poster'>('video');
const sharing = ref(false);
const skinCustom = ref(false);
const skinActive = ref('');
const skinActiveColour = ref('#ff0000');
const skinBackground = ref('');
const skinBackgroundColour = ref('#000000');
const skinInactive = ref('');
const skinInactiveColour = ref('#cccccc');
const speedSelector = ref(true);
const startEndTimespan = ref('');
const startTime = ref('');
const transcriptDownload = ref(false);
const useSettingsMenu = ref(false);
const forceAspectRatioEnabled = ref(false);
const forceAspectRatioValue = ref(1.7778);
const forceAspectRatio = computed(() => forceAspectRatioEnabled.value ? forceAspectRatioValue.value : undefined);

// ---------------------------------------------------------------------------
// Player state
// ---------------------------------------------------------------------------
const player = ref<ViostreamPlayerInstance>();
const currentTime = ref(0);
const duration = ref(0);
const isPaused = ref(true);
const isMuted = ref(false);
const volume = ref(1);
const log = ref<string[]>([]);

const percent = computed(() =>
  duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0,
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function addLog(msg: string): void {
  const ts = new Date().toLocaleTimeString();
  log.value = [`[${ts}] ${msg}`, ...log.value.slice(0, 49)];
}

function embed(): void {
  player.value = undefined;
  currentTime.value = 0;
  duration.value = 0;
  isPaused.value = true;
  isMuted.value = false;
  volume.value = 1;
  embedRevision.value++;
  addLog('Embed triggered');
}

function handlePlayerReady(p: ViostreamPlayerInstance): void {
  player.value = p;
  addLog('Player ready');
  p.getDuration().then((d) => (duration.value = d));
  p.getPaused().then((v) => (isPaused.value = v));
  p.getMuted().then((v) => (isMuted.value = v));
  p.getVolume().then((v) => (volume.value = v));
}

function handleTimeUpdate(data: ViostreamTimeUpdateData): void {
  currentTime.value = data.seconds;
  if (data.duration && data.duration !== duration.value) {
    duration.value = data.duration;
  }
}

function togglePlay(): void {
  if (!player.value) return;
  if (isPaused.value) player.value.play(); else player.value.pause();
}

function toggleMute(): void {
  if (!player.value) return;
  if (isMuted.value) player.value.unmute(); else player.value.mute();
}

function seek(seconds: number): void {
  player.value?.setCurrentTime(seconds);
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function syncTextToColour(text: string, setter: (v: string) => void): void {
  if (/^#[0-9a-fA-F]{6}$/.test(text)) setter(text);
}
</script>

<template>
  <main class="container-fluid py-4" style="max-width: 1200px;">
    <h1 class="mb-2">Viostream Vue SDK Demo</h1>
    <p class="lead text-body-secondary mb-4">
      This page demonstrates the <code>&lt;ViostreamPlayer&gt;</code> component and event handling.
    </p>

    <div class="row g-4">
      <!-- ================================================================ -->
      <!-- LEFT COLUMN — Configuration & Embed Options                      -->
      <!-- ================================================================ -->
      <div class="col-lg-4">
        <div class="card config-panel">
          <div class="card-header"><h6 class="mb-0">Configuration</h6></div>
          <div class="card-body d-flex flex-column overflow-hidden p-0">

            <!-- Fixed top: Video dropdown -->
            <div class="px-3 pt-3">
              <div class="mb-2">
                <label class="form-label fw-semibold small mb-1" for="video-select">Video</label>
                <select id="video-select" class="form-select form-select-sm" v-model="videoSelect">
                  <option value="r3qyz91r5k7q6b">16:9 Landscape</option>
                  <option value="r3qyz91r3qy3gr">9:16 Portrait</option>
                  <option value="r3qyz91r5k7897">1:1 Square</option>
                  <option value="">Custom...</option>
                </select>
              </div>
              <div v-if="videoSelect === ''" class="mb-2">
                <input
                  type="text"
                  class="form-control form-control-sm font-monospace"
                  v-model="customPublicKey"
                  placeholder="Enter public key"
                />
              </div>
            </div>

            <hr class="mx-3 my-2" />

            <!-- Scrollable middle: Embed Options -->
            <div class="flex-grow-1 overflow-y-auto px-3 pb-2">
              <small class="text-uppercase text-body-secondary fw-semibold d-block mb-2" style="letter-spacing: 0.05em;">Embed Options</small>

              <!-- Boolean toggles -->
              <div class="mb-3">
                <div class="form-check form-switch mb-1">
                  <input id="opt-chapters" class="form-check-input" type="checkbox" v-model="chapters" />
                  <label class="form-check-label small" for="opt-chapters">chapters</label>
                </div>
                <div class="form-check form-switch mb-1">
                  <input id="opt-display-title" class="form-check-input" type="checkbox" v-model="displayTitle" />
                  <label class="form-check-label small" for="opt-display-title">displayTitle</label>
                </div>
                <div class="form-check form-switch mb-1">
                  <input id="opt-hls-quality" class="form-check-input" type="checkbox" v-model="hlsQualitySelector" />
                  <label class="form-check-label small" for="opt-hls-quality">hlsQualitySelector</label>
                </div>
                <div class="form-check form-switch mb-1">
                  <input id="opt-sharing" class="form-check-input" type="checkbox" v-model="sharing" />
                  <label class="form-check-label small" for="opt-sharing">sharing</label>
                </div>
                <div class="form-check form-switch mb-1">
                  <input id="opt-speed-selector" class="form-check-input" type="checkbox" v-model="speedSelector" />
                  <label class="form-check-label small" for="opt-speed-selector">speedSelector</label>
                </div>
                <div class="form-check form-switch mb-1">
                  <input id="opt-transcript-download" class="form-check-input" type="checkbox" v-model="transcriptDownload" />
                  <label class="form-check-label small" for="opt-transcript-download">transcriptDownload</label>
                </div>
                <div class="form-check form-switch mb-1">
                  <input id="opt-use-settings-menu" class="form-check-input" type="checkbox" v-model="useSettingsMenu" />
                  <label class="form-check-label small" for="opt-use-settings-menu">useSettingsMenu</label>
                </div>
                <div class="form-check form-switch mb-1">
                  <input id="opt-skin-custom" class="form-check-input" type="checkbox" v-model="skinCustom" />
                  <label class="form-check-label small" for="opt-skin-custom">skinCustom</label>
                </div>
                <div v-if="skinCustom" class="ms-4 mb-1">
                  <div class="mb-2 d-flex align-items-center gap-2">
                    <input type="color" class="form-control form-control-color form-control-sm skin-colour-picker" v-model="skinActiveColour" @input="skinActive = skinActiveColour" />
                    <input id="opt-skin-active" type="text" class="form-control form-control-sm font-monospace" style="width: 7em;" v-model="skinActive" @input="syncTextToColour(skinActive, (v) => skinActiveColour = v)" placeholder="#ff0000" />
                    <label class="small text-body-secondary text-nowrap" for="opt-skin-active">skinActive</label>
                  </div>
                  <div class="mb-2 d-flex align-items-center gap-2">
                    <input type="color" class="form-control form-control-color form-control-sm skin-colour-picker" v-model="skinBackgroundColour" @input="skinBackground = skinBackgroundColour" />
                    <input id="opt-skin-background" type="text" class="form-control form-control-sm font-monospace" style="width: 7em;" v-model="skinBackground" @input="syncTextToColour(skinBackground, (v) => skinBackgroundColour = v)" placeholder="#000000" />
                    <label class="small text-body-secondary text-nowrap" for="opt-skin-background">skinBackground</label>
                  </div>
                  <div class="mb-1 d-flex align-items-center gap-2">
                    <input type="color" class="form-control form-control-color form-control-sm skin-colour-picker" v-model="skinInactiveColour" @input="skinInactive = skinInactiveColour" />
                    <input id="opt-skin-inactive" type="text" class="form-control form-control-sm font-monospace" style="width: 7em;" v-model="skinInactive" @input="syncTextToColour(skinInactive, (v) => skinInactiveColour = v)" placeholder="#cccccc" />
                    <label class="small text-body-secondary text-nowrap" for="opt-skin-inactive">skinInactive</label>
                  </div>
                </div>
              </div>

              <!-- Player style -->
              <div class="mb-3">
                <label class="form-label fw-semibold small mb-1" for="opt-player-style">playerStyle</label>
                <select id="opt-player-style" class="form-select form-select-sm font-monospace" v-model="playerStyle">
                  <option value="video">video</option>
                  <option value="audio">audio</option>
                  <option value="audio-poster">audio-poster</option>
                </select>
              </div>

              <!-- String inputs -->
              <div class="mb-2">
                <label class="form-label fw-semibold small mb-1" for="opt-player-key">playerKey</label>
                <input id="opt-player-key" type="text" class="form-control form-control-sm font-monospace" v-model="optPlayerKey" placeholder="optional" />
              </div>
              <div class="mb-2">
                <label class="form-label fw-semibold small mb-1" for="opt-chapter-slug">chapterSlug</label>
                <input id="opt-chapter-slug" type="text" class="form-control form-control-sm font-monospace" v-model="chapterSlug" placeholder="optional" />
              </div>
              <div class="mb-2">
                <label class="form-label fw-semibold small mb-1" for="opt-start-time">startTime</label>
                <input id="opt-start-time" type="text" class="form-control form-control-sm font-monospace" v-model="startTime" placeholder="e.g. 30" />
              </div>
              <div class="mb-2">
                <label class="form-label fw-semibold small mb-1" for="opt-start-end-timespan">startEndTimespan</label>
                <input id="opt-start-end-timespan" type="text" class="form-control form-control-sm font-monospace" v-model="startEndTimespan" placeholder="e.g. 10,30" />
              </div>

              <!-- Force Aspect Ratio -->
              <div class="mt-3 mb-2">
                <div class="form-check form-switch mb-1">
                  <input id="force-aspect-ratio-toggle" class="form-check-input" type="checkbox" v-model="forceAspectRatioEnabled" />
                  <label class="form-check-label fw-semibold small" for="force-aspect-ratio-toggle">forceAspectRatio</label>
                </div>
                <input
                  id="force-aspect-ratio"
                  type="number"
                  class="form-control form-control-sm font-monospace"
                  v-model.number="forceAspectRatioValue"
                  :disabled="!forceAspectRatioEnabled"
                  step="0.0001"
                  min="0.0001"
                  placeholder="1.7778"
                />
                <div class="form-text small">1.7778 (16:9), 1.3333 (4:3), 0.5625 (9:16)</div>
              </div>
            </div>

            <!-- Fixed bottom: Embed button -->
            <div class="px-3 py-2 border-top">
              <button class="btn btn-primary w-100" @click="embed">
                <i class="bi bi-play-circle-fill"></i> Embed Player
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ================================================================ -->
      <!-- RIGHT COLUMN — Player, Controls, Log                            -->
      <!-- ================================================================ -->
      <div class="col-lg-8">
        <!-- Player -->
        <div class="mb-3" :key="embedRevision">
          <ViostreamPlayer
            :account-key="ACCOUNT_KEY"
            :public-key="publicKey"
            :chapters="chapters"
            :chapter-slug="chapterSlug || undefined"
            :display-title="displayTitle"
            :hls-quality-selector="hlsQualitySelector"
            :player-key="optPlayerKey || undefined"
            :player-style="playerStyle"
            :sharing="sharing"
            :skin-custom="skinCustom"
            :skin-active="skinActive || undefined"
            :skin-background="skinBackground || undefined"
            :skin-inactive="skinInactive || undefined"
            :speed-selector="speedSelector"
            :start-end-timespan="startEndTimespan || undefined"
            :start-time="startTime || undefined"
            :transcript-download="transcriptDownload"
            :use-settings-menu="useSettingsMenu"
            :force-aspect-ratio="forceAspectRatio"
            @play="() => { isPaused = false; addLog('Event: play'); }"
            @pause="() => { isPaused = true; addLog('Event: pause'); }"
            @ended="() => addLog('Event: ended')"
            @time-update="handleTimeUpdate"
            @volume-change="(d) => { volume = d.volume; addLog(`Event: volumechange → ${d.volume}`); }"
            @seeked="() => addLog('Event: seeked')"
            @player-ready="handlePlayerReady"
          />
        </div>

        <!-- Controls -->
        <div class="card mb-3">
          <div class="card-header"><h6 class="mb-0">Controls</h6></div>
          <div class="card-body">
            <div class="d-flex flex-wrap gap-2 align-items-center">
              <div class="btn-group" role="group">
                <button class="btn btn-outline-light btn-sm" @click="togglePlay" :disabled="!player">
                  <i :class="isPaused ? 'bi bi-play-fill' : 'bi bi-pause-fill'"></i>
                  {{ isPaused ? 'Play' : 'Pause' }}
                </button>
                <button class="btn btn-outline-light btn-sm" @click="toggleMute" :disabled="!player">
                  <i :class="isMuted ? 'bi bi-volume-mute-fill' : 'bi bi-volume-up-fill'"></i>
                  {{ isMuted ? 'Unmute' : 'Mute' }}
                </button>
              </div>
              <div class="btn-group" role="group">
                <button class="btn btn-outline-light btn-sm" @click="seek(0)" :disabled="!player">
                  <i class="bi bi-skip-start-fill"></i> Restart
                </button>
                <button class="btn btn-outline-light btn-sm" @click="seek(Math.max(0, currentTime - 10))" :disabled="!player">
                  <i class="bi bi-skip-backward-fill"></i> -10s
                </button>
                <button class="btn btn-outline-light btn-sm" @click="seek(currentTime + 10)" :disabled="!player">
                  <i class="bi bi-skip-forward-fill"></i> +10s
                </button>
              </div>
            </div>

            <div class="d-flex align-items-center gap-3 mt-3">
              <div class="progress flex-grow-1" style="height: 6px;">
                <div
                  class="progress-bar"
                  role="progressbar"
                  :style="{ width: `${percent}%` }"
                  :aria-valuenow="currentTime"
                  :aria-valuemin="0"
                  :aria-valuemax="duration"
                ></div>
              </div>
              <span class="badge text-bg-light font-monospace small">
                {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
              </span>
            </div>

            <hr class="my-3" />

            <div class="d-flex flex-wrap gap-1">
              <button class="btn btn-outline-info btn-sm" :disabled="!player" @click="async () => { if (!player) return; const t = await player.getCurrentTime(); addLog(`getCurrentTime() → ${t.toFixed(2)}s`); }">
                Get Current Time
              </button>
              <button class="btn btn-outline-info btn-sm" :disabled="!player" @click="async () => { if (!player) return; const d = await player.getDuration(); addLog(`getDuration() → ${d.toFixed(2)}s`); }">
                Get Duration
              </button>
              <button class="btn btn-outline-info btn-sm" :disabled="!player" @click="async () => { if (!player) return; const v = await player.getVolume(); addLog(`getVolume() → ${v}`); }">
                Get Volume
              </button>
              <button class="btn btn-outline-info btn-sm" :disabled="!player" @click="async () => { if (!player) return; const r = await player.getAspectRatio(); addLog(`getAspectRatio() → ${r}`); }">
                Get Aspect Ratio
              </button>
            </div>
          </div>
        </div>

        <!-- Event Log -->
        <div class="card mb-3">
          <div class="card-header"><h6 class="mb-0">Event Log</h6></div>
          <div class="card-body p-2">
            <div class="font-monospace small" style="max-height: 200px; overflow-y: auto; line-height: 1.5;">
              <div v-for="(entry, i) in log" :key="i">{{ entry }}</div>
              <div v-if="log.length === 0" class="text-body-secondary">Waiting for events...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

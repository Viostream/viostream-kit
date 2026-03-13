<script setup lang="ts">
import { ref, computed } from 'vue';
import { ViostreamPlayer } from '@viostream/viostream-player-vue';
import type { ViostreamPlayerInstance, ViostreamTimeUpdateData } from '@viostream/viostream-player-vue';
import './App.css';

const accountKey = ref('vc-100100100');
const publicKey = ref('nhedxonrxsyfee');

const player = ref<ViostreamPlayerInstance>();
const currentTime = ref(0);
const duration = ref(0);
const isPaused = ref(true);
const isMuted = ref(false);
const volume = ref(1);
const log = ref<string[]>([]);

// Key that forces player remount when config changes
const playerKey = computed(() => `${accountKey.value}:${publicKey.value}`);

const percent = computed(() =>
  duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0,
);

function addLog(msg: string): void {
  const ts = new Date().toLocaleTimeString();
  log.value = [`[${ts}] ${msg}`, ...log.value.slice(0, 49)];
}

function handlePlayerReady(p: ViostreamPlayerInstance): void {
  player.value = p;
  addLog('Player ready');

  // Fetch initial state
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
  if (isPaused.value) {
    player.value.play();
  } else {
    player.value.pause();
  }
}

function toggleMute(): void {
  if (!player.value) return;
  if (isMuted.value) {
    player.value.unmute();
  } else {
    player.value.mute();
  }
}

function seek(seconds: number): void {
  player.value?.setCurrentTime(seconds);
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}
</script>

<template>
  <main class="container py-4" style="max-width: 900px;">
    <h1 class="mb-2">Viostream Vue SDK Demo</h1>
    <p class="lead text-body-secondary mb-4">
      This page demonstrates the <code>&lt;ViostreamPlayer&gt;</code> component and event
      handling.
    </p>

    <!-- Configuration -->
    <div class="card mb-4">
      <div class="card-header">
        <h5 class="mb-0">Configuration</h5>
      </div>
      <div class="card-body">
        <div class="row g-3">
          <div class="col-sm-6">
            <label class="form-label fw-semibold" for="account-key">Account Key</label>
            <input
              id="account-key"
              type="text"
              class="form-control font-monospace"
              v-model="accountKey"
              placeholder="vc-100100100"
            />
          </div>
          <div class="col-sm-6">
            <label class="form-label fw-semibold" for="public-key">Public Key</label>
            <input
              id="public-key"
              type="text"
              class="form-control font-monospace"
              v-model="publicKey"
              placeholder="nhedxonrxsyfee"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Player -->
    <div class="mb-4" :key="playerKey">
      <ViostreamPlayer
        :account-key="accountKey"
        :public-key="publicKey"
        :display-title="true"
        :sharing="true"
        :speed-selector="true"
        :hls-quality-selector="true"
        @play="() => { isPaused = false; addLog('Event: play'); }"
        @pause="() => { isPaused = true; addLog('Event: pause'); }"
        @ended="() => addLog('Event: ended')"
        @time-update="handleTimeUpdate"
        @volume-change="(d) => { volume = d.volume; addLog(`Event: volumechange → ${d.volume}`); }"
        @seeked="() => addLog('Event: seeked')"
        @player-ready="handlePlayerReady"
      />
    </div>

    <!-- Custom Controls -->
    <div class="card mb-4">
      <div class="card-header">
        <h5 class="mb-0">Custom Controls</h5>
      </div>
      <div class="card-body">
        <div class="d-flex flex-wrap gap-2 align-items-center">
          <div class="btn-group" role="group" aria-label="Playback controls">
            <button class="btn btn-outline-light" @click="togglePlay">
              <i :class="isPaused ? 'bi bi-play-fill' : 'bi bi-pause-fill'"></i>
              {{ isPaused ? 'Play' : 'Pause' }}
            </button>
            <button class="btn btn-outline-light" @click="toggleMute">
              <i :class="isMuted ? 'bi bi-volume-mute-fill' : 'bi bi-volume-up-fill'"></i>
              {{ isMuted ? 'Unmute' : 'Mute' }}
            </button>
          </div>

          <div class="btn-group" role="group" aria-label="Seek controls">
            <button class="btn btn-outline-light" @click="seek(0)">
              <i class="bi bi-skip-start-fill"></i> Restart
            </button>
            <button class="btn btn-outline-light" @click="seek(Math.max(0, currentTime - 10))">
              <i class="bi bi-skip-backward-fill"></i> -10s
            </button>
            <button class="btn btn-outline-light" @click="seek(currentTime + 10)">
              <i class="bi bi-skip-forward-fill"></i> +10s
            </button>
          </div>
        </div>

        <div class="d-flex align-items-center gap-3 mt-3">
          <div class="progress flex-grow-1" style="height: 8px;">
            <div
              class="progress-bar"
              role="progressbar"
              :style="{ width: `${percent}%` }"
              :aria-valuenow="currentTime"
              :aria-valuemin="0"
              :aria-valuemax="duration"
            ></div>
          </div>
          <span class="badge text-bg-light font-monospace">
            {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Event Log -->
    <div class="card mb-4">
      <div class="card-header">
        <h5 class="mb-0">Event Log</h5>
      </div>
      <div class="card-body">
        <div class="font-monospace small log-scroll">
          <div v-for="(entry, i) in log" :key="i">{{ entry }}</div>
          <div v-if="log.length === 0" class="text-body-secondary">Waiting for events...</div>
        </div>
      </div>
    </div>

    <!-- Promise-based Getters -->
    <div class="card mb-4">
      <div class="card-header">
        <h5 class="mb-0">Promise-based Getters</h5>
      </div>
      <div class="card-body">
        <div class="d-flex flex-wrap gap-2">
          <button
            class="btn btn-outline-info btn-sm"
            @click="async () => {
              if (!player) return;
              const t = await player.getCurrentTime();
              addLog(`getCurrentTime() → ${t.toFixed(2)}s`);
            }"
          >
            Get Current Time
          </button>
          <button
            class="btn btn-outline-info btn-sm"
            @click="async () => {
              if (!player) return;
              const d = await player.getDuration();
              addLog(`getDuration() → ${d.toFixed(2)}s`);
            }"
          >
            Get Duration
          </button>
          <button
            class="btn btn-outline-info btn-sm"
            @click="async () => {
              if (!player) return;
              const v = await player.getVolume();
              addLog(`getVolume() → ${v}`);
            }"
          >
            Get Volume
          </button>
          <button
            class="btn btn-outline-info btn-sm"
            @click="async () => {
              if (!player) return;
              const r = await player.getAspectRatio();
              addLog(`getAspectRatio() → ${r}`);
            }"
          >
            Get Aspect Ratio
          </button>
          <button
            class="btn btn-outline-info btn-sm"
            @click="async () => {
              if (!player) return;
              const tracks = await player.getTracks();
              addLog(`getTracks() → ${JSON.stringify(tracks)}`);
            }"
          >
            Get Tracks
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

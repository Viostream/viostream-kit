import { createViostreamPlayer } from '@viostream/viostream-player-core';
import type { ViostreamPlayer } from '@viostream/viostream-player-core';

// ---------------------------------------------------------------------------
// DOM references
// ---------------------------------------------------------------------------
const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;

const accountKeyInput = $<HTMLInputElement>('account-key');
const publicKeyInput = $<HTMLInputElement>('public-key');
const farToggle = $<HTMLInputElement>('force-aspect-ratio-toggle');
const farInput = $<HTMLInputElement>('force-aspect-ratio');
const embedBtn = $<HTMLButtonElement>('embed-btn');
const playerTarget = $<HTMLDivElement>('player');

const btnPlayPause = $<HTMLButtonElement>('btn-play-pause');
const btnMute = $<HTMLButtonElement>('btn-mute');
const btnRestart = $<HTMLButtonElement>('btn-restart');
const btnBack = $<HTMLButtonElement>('btn-back');
const btnFwd = $<HTMLButtonElement>('btn-fwd');
const progressBar = $<HTMLDivElement>('progress-bar');
const timeDisplay = $<HTMLSpanElement>('time-display');

const getTimeBtn = $<HTMLButtonElement>('get-time');
const getDurationBtn = $<HTMLButtonElement>('get-duration');
const getVolumeBtn = $<HTMLButtonElement>('get-volume');
const getAspectRatioBtn = $<HTMLButtonElement>('get-aspect-ratio');

const eventLogEl = $<HTMLDivElement>('event-log');

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let player: ViostreamPlayer | undefined;
let currentTime = 0;
let duration = 0;
let isPaused = true;
let isMuted = false;
let logEntries: string[] = [];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function addLog(msg: string): void {
  const ts = new Date().toLocaleTimeString();
  logEntries = [`[${ts}] ${msg}`, ...logEntries.slice(0, 49)];
  eventLogEl.innerHTML = logEntries.map((e) => `<div>${e}</div>`).join('');
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function updateTimeDisplay(): void {
  const percent = duration > 0 ? (currentTime / duration) * 100 : 0;
  progressBar.style.width = `${percent}%`;
  timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
}

function setControlsEnabled(enabled: boolean): void {
  const btns = [btnPlayPause, btnMute, btnRestart, btnBack, btnFwd,
    getTimeBtn, getDurationBtn, getVolumeBtn, getAspectRatioBtn];
  for (const btn of btns) {
    btn.disabled = !enabled;
  }
}

function updatePlayPauseBtn(): void {
  btnPlayPause.innerHTML = isPaused
    ? '<i class="bi bi-play-fill"></i> Play'
    : '<i class="bi bi-pause-fill"></i> Pause';
}

function updateMuteBtn(): void {
  btnMute.innerHTML = isMuted
    ? '<i class="bi bi-volume-mute-fill"></i> Unmute'
    : '<i class="bi bi-volume-up-fill"></i> Mute';
}

// ---------------------------------------------------------------------------
// Embed
// ---------------------------------------------------------------------------
async function embed(): Promise<void> {
  // Destroy previous player if any
  if (player) {
    player.destroy();
    player = undefined;
  }

  // Reset state
  currentTime = 0;
  duration = 0;
  isPaused = true;
  isMuted = false;
  setControlsEnabled(false);
  updatePlayPauseBtn();
  updateMuteBtn();
  updateTimeDisplay();

  const accountKey = accountKeyInput.value.trim();
  const publicKey = publicKeyInput.value.trim();
  if (!accountKey || !publicKey) {
    addLog('Error: account key and public key are required');
    return;
  }

  const forceAspectRatio = farToggle.checked
    ? parseFloat(farInput.value)
    : undefined;

  addLog(`Embedding player (publicKey=${publicKey}, forceAspectRatio=${forceAspectRatio ?? 'none'})`);

  try {
    const p = await createViostreamPlayer({
      accountKey,
      publicKey,
      target: playerTarget,
      forceAspectRatio,
      options: {
        displayTitle: true,
        sharing: true,
        speedSelector: true,
        hlsQualitySelector: true,
      },
    });

    if (!p) {
      addLog('Error: createViostreamPlayer returned undefined');
      return;
    }

    player = p;
    addLog('Player ready');
    setControlsEnabled(true);

    // Wire events
    player.on('play', () => {
      isPaused = false;
      updatePlayPauseBtn();
      addLog('Event: play');
    });

    player.on('pause', () => {
      isPaused = true;
      updatePlayPauseBtn();
      addLog('Event: pause');
    });

    player.on('ended', () => {
      addLog('Event: ended');
    });

    player.on('timeupdate', (data) => {
      currentTime = data.seconds;
      if (data.duration && data.duration !== duration) {
        duration = data.duration;
      }
      updateTimeDisplay();
    });

    player.on('volumechange', (data) => {
      addLog(`Event: volumechange → ${data.volume}`);
    });

    player.on('seeked', () => {
      addLog('Event: seeked');
    });

    // Fetch initial state once the iframe player connection is established.
    // The 'ready' event fires when penpal handshake completes.
    player.on('ready', async () => {
      if (!player) return;
      try {
        duration = await player.getDuration();
        isPaused = await player.getPaused();
        isMuted = await player.getMuted();
        updatePlayPauseBtn();
        updateMuteBtn();
        updateTimeDisplay();
      } catch {
        // Player may not be fully ready; state will update via events.
      }
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    addLog(`Error: ${msg}`);
  }
}

// ---------------------------------------------------------------------------
// Control handlers
// ---------------------------------------------------------------------------
btnPlayPause.addEventListener('click', () => {
  if (!player) return;
  if (isPaused) {
    player.play();
  } else {
    player.pause();
  }
});

btnMute.addEventListener('click', () => {
  if (!player) return;
  if (isMuted) {
    player.unmute();
    isMuted = false;
  } else {
    player.mute();
    isMuted = true;
  }
  updateMuteBtn();
});

btnRestart.addEventListener('click', () => player?.setCurrentTime(0));
btnBack.addEventListener('click', () => player?.setCurrentTime(Math.max(0, currentTime - 10)));
btnFwd.addEventListener('click', () => player?.setCurrentTime(currentTime + 10));

// ---------------------------------------------------------------------------
// Getter handlers
// ---------------------------------------------------------------------------
getTimeBtn.addEventListener('click', async () => {
  if (!player) return;
  const t = await player.getCurrentTime();
  addLog(`getCurrentTime() → ${t.toFixed(2)}s`);
});

getDurationBtn.addEventListener('click', async () => {
  if (!player) return;
  const d = await player.getDuration();
  addLog(`getDuration() → ${d.toFixed(2)}s`);
});

getVolumeBtn.addEventListener('click', async () => {
  if (!player) return;
  const v = await player.getVolume();
  addLog(`getVolume() → ${v}`);
});

getAspectRatioBtn.addEventListener('click', async () => {
  if (!player) return;
  const r = await player.getAspectRatio();
  addLog(`getAspectRatio() → ${r}`);
});

// ---------------------------------------------------------------------------
// Force Aspect Ratio toggle
// ---------------------------------------------------------------------------
farToggle.addEventListener('change', () => {
  farInput.disabled = !farToggle.checked;
});

// ---------------------------------------------------------------------------
// Embed button + initial embed
// ---------------------------------------------------------------------------
embedBtn.addEventListener('click', embed);

// Auto-embed on page load
embed();

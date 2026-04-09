import { createViostreamPlayer } from '@viostream/viostream-player-core';
import type { ViostreamPlayer, ViostreamEmbedOptions } from '@viostream/viostream-player-core';

// ---------------------------------------------------------------------------
// DOM references
// ---------------------------------------------------------------------------
const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;

const ACCOUNT_KEY = 'vc-100100100';

const videoSelect = $<HTMLSelectElement>('video-select');
const customKeyInput = $<HTMLInputElement>('public-key-custom');
const customKeyGroup = $<HTMLDivElement>('custom-key-group');
const farToggle = $<HTMLInputElement>('force-aspect-ratio-toggle');
const farInput = $<HTMLInputElement>('force-aspect-ratio');
const skinCustomToggle = $<HTMLInputElement>('opt-skin-custom');
const playerStyleSelect = $<HTMLSelectElement>('opt-player-style');
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
// Build embed options from the UI controls
// ---------------------------------------------------------------------------
function buildOptions(): ViostreamEmbedOptions {
  const opts: ViostreamEmbedOptions = {};

  // Boolean toggles — driven by data-option-bool attribute on checkboxes
  document.querySelectorAll<HTMLInputElement>('[data-option-bool]').forEach((el) => {
    const key = el.dataset.optionBool!;
    (opts as Record<string, unknown>)[key] = el.checked;
  });

  // String inputs — driven by data-option-str attribute on text inputs
  document.querySelectorAll<HTMLInputElement>('[data-option-str]').forEach((el) => {
    const key = el.dataset.optionStr!;
    const val = el.value.trim();
    if (val) {
      (opts as Record<string, unknown>)[key] = val;
    }
  });

  // Player style (select)
  const style = playerStyleSelect.value;
  if (style) {
    opts.playerStyle = style as ViostreamEmbedOptions['playerStyle'];
  }

  return opts;
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

  const accountKey = ACCOUNT_KEY;
  const publicKey = videoSelect.value || customKeyInput.value.trim();
  if (!publicKey) {
    addLog('Error: public key is required');
    return;
  }

  const forceAspectRatio = farToggle.checked
    ? parseFloat(farInput.value)
    : undefined;

  const options = buildOptions();

  addLog(`Embedding (forceAspectRatio=${forceAspectRatio ?? 'none'})`);

  try {
    const p = await createViostreamPlayer({
      accountKey,
      publicKey,
      target: playerTarget,
      forceAspectRatio,
      options,
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

    // Fetch initial state after a short delay to allow the penpal
    // connection to establish and the player to be ready.
    player.on('timeupdate', function initialSync() {
      if (!player) return;
      // Only run once — remove ourselves after the first timeupdate
      player.off('timeupdate', initialSync);
      player.getDuration().then((d) => { duration = d; updateTimeDisplay(); }).catch(() => {});
      player.getPaused().then((v) => { isPaused = v; updatePlayPauseBtn(); }).catch(() => {});
      player.getMuted().then((v) => { isMuted = v; updateMuteBtn(); }).catch(() => {});
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
// Toggle handlers for conditional inputs
// ---------------------------------------------------------------------------
farToggle.addEventListener('change', () => {
  farInput.disabled = !farToggle.checked;
});

videoSelect.addEventListener('change', () => {
  const isCustom = videoSelect.value === '';
  customKeyGroup.style.display = isCustom ? '' : 'none';
  if (isCustom) {
    customKeyInput.focus();
  }
});

const skinColourGroup = $<HTMLDivElement>('skin-colour-group');

skinCustomToggle.addEventListener('change', () => {
  const enabled = skinCustomToggle.checked;
  skinColourGroup.style.display = enabled ? '' : 'none';
  document.querySelectorAll<HTMLInputElement>('.skin-colour-input').forEach((el) => {
    el.disabled = !enabled;
  });
  document.querySelectorAll<HTMLInputElement>('.skin-colour-picker').forEach((el) => {
    el.disabled = !enabled;
  });
});

// Sync colour pickers ↔ text inputs
const colourPairs: Array<[string, string]> = [
  ['opt-skin-active-colour', 'opt-skin-active'],
  ['opt-skin-background-colour', 'opt-skin-background'],
  ['opt-skin-inactive-colour', 'opt-skin-inactive'],
];
for (const [pickerId, textId] of colourPairs) {
  const picker = $<HTMLInputElement>(pickerId);
  const text = $<HTMLInputElement>(textId);
  picker.addEventListener('input', () => { text.value = picker.value; });
  text.addEventListener('input', () => {
    if (/^#[0-9a-fA-F]{6}$/.test(text.value)) {
      picker.value = text.value;
    }
  });
}

// ---------------------------------------------------------------------------
// Embed button + initial embed
// ---------------------------------------------------------------------------
embedBtn.addEventListener('click', embed);
embed();

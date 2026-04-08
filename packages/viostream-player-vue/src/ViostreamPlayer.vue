<!--
  ViostreamPlayer — Vue 3 component that embeds a Viostream video player.

  Usage:
    import { ViostreamPlayer } from '@viostream/viostream-player-vue';
-->

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import Debug from 'debug';
import { getViostreamApi, wrapRawPlayer, normalizeForceAspectRatio } from '@viostream/viostream-player-core';
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
import { SDK_NAME, SDK_VERSION } from './version.js';

const debug = Debug('viostream:vue');

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

const props = withDefaults(defineProps<{
  // Required props
  accountKey: string;
  publicKey: string;

  // Embed options
  chapters?: boolean;
  chapterSlug?: string;
  displayTitle?: boolean;
  hlsQualitySelector?: boolean;
  playerKey?: string;
  playerStyle?: 'video' | 'audio' | 'audio-poster';
  sharing?: boolean;
  skinActive?: string;
  skinBackground?: string;
  skinCustom?: boolean;
  skinInactive?: string;
  speedSelector?: boolean;
  startEndTimespan?: string;
  startTime?: string;
  transcriptDownload?: boolean;
  useSettingsMenu?: boolean;
  forceAspectRatio?: number;

  // Styling
  class?: string;
}>(), {
  chapters: undefined,
  chapterSlug: undefined,
  displayTitle: undefined,
  hlsQualitySelector: undefined,
  playerKey: undefined,
  playerStyle: undefined,
  sharing: undefined,
  skinActive: undefined,
  skinBackground: undefined,
  skinCustom: undefined,
  skinInactive: undefined,
  speedSelector: undefined,
  startEndTimespan: undefined,
  startTime: undefined,
  transcriptDownload: undefined,
  useSettingsMenu: undefined,
  forceAspectRatio: undefined,
  class: undefined,
});

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

const emit = defineEmits<{
  play: [];
  pause: [];
  ended: [];
  timeUpdate: [data: ViostreamTimeUpdateData];
  volumeChange: [data: ViostreamVolumeChangeData];
  error: [data: ViostreamErrorData];
  progress: [data: ViostreamProgressData];
  ready: [];
  seeked: [];
  loaded: [];
  playerReady: [player: ViostreamPlayer];
}>();

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

defineSlots<{
  loading?: () => unknown;
  error?: (props: { message: string }) => unknown;
}>();

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

const containerId = `viostream-player-${Math.random().toString(36).slice(2, 10)}`;
const containerRef = ref<HTMLDivElement>();
const player = ref<ViostreamPlayer>();
const errorMsg = ref<string>();
const isLoading = ref(true);

let destroyed = false;
const unsubscribers: Array<() => void> = [];

debug('component setup publicKey=%s containerId=%s', props.publicKey, containerId);

// ---------------------------------------------------------------------------
// Build embed options from props
// ---------------------------------------------------------------------------

function buildEmbedOptions(): ViostreamEmbedOptions {
  const opts: ViostreamEmbedOptions = {};
  if (props.chapters !== undefined) opts.chapters = props.chapters;
  if (props.chapterSlug !== undefined) opts.chapterSlug = props.chapterSlug;
  if (props.displayTitle !== undefined) opts.displayTitle = props.displayTitle;
  if (props.hlsQualitySelector !== undefined) opts.hlsQualitySelector = props.hlsQualitySelector;
  if (props.playerKey !== undefined) opts.playerKey = props.playerKey;
  if (props.playerStyle !== undefined) opts.playerStyle = props.playerStyle;
  if (props.sharing !== undefined) opts.sharing = props.sharing;
  if (props.skinActive !== undefined) opts.skinActive = props.skinActive;
  if (props.skinBackground !== undefined) opts.skinBackground = props.skinBackground;
  if (props.skinCustom !== undefined) opts.skinCustom = props.skinCustom;
  if (props.skinInactive !== undefined) opts.skinInactive = props.skinInactive;
  if (props.speedSelector !== undefined) opts.speedSelector = props.speedSelector;
  if (props.startEndTimespan !== undefined) opts.startEndTimespan = props.startEndTimespan;
  if (props.startTime !== undefined) opts.startTime = props.startTime;
  if (props.transcriptDownload !== undefined) opts.transcriptDownload = props.transcriptDownload;
  if (props.useSettingsMenu !== undefined) opts.useSettingsMenu = props.useSettingsMenu;
  if (props.forceAspectRatio !== undefined) opts.forceAspectRatio = normalizeForceAspectRatio(props.forceAspectRatio);
  return opts;
}

// ---------------------------------------------------------------------------
// Event wiring
// ---------------------------------------------------------------------------

const EVENT_MAP: Array<[string, (...args: never[]) => void]> = [
  ['play', () => emit('play')],
  ['pause', () => emit('pause')],
  ['ended', () => emit('ended')],
  ['timeUpdate', (data: ViostreamTimeUpdateData) => emit('timeUpdate', data)],
  ['volumeChange', (data: ViostreamVolumeChangeData) => emit('volumeChange', data)],
  ['error', (data: ViostreamErrorData) => emit('error', data)],
  ['progress', (data: ViostreamProgressData) => emit('progress', data)],
  ['ready', () => emit('ready')],
  ['seeked', () => emit('seeked')],
  ['loaded', () => emit('loaded')],
];

// Maps emit event names to raw player event names
const RAW_EVENT_MAP: Record<string, string> = {
  play: 'play',
  pause: 'pause',
  ended: 'ended',
  timeUpdate: 'timeupdate',
  volumeChange: 'volumechange',
  error: 'error',
  progress: 'progress',
  ready: 'ready',
  seeked: 'seeked',
  loaded: 'loaded',
};

function wireEvents(wrappedPlayer: ViostreamPlayer): void {
  const wiredEvents: string[] = [];
  for (const [emitName, handler] of EVENT_MAP) {
    const rawName = RAW_EVENT_MAP[emitName];
    if (rawName) {
      const unsub = wrappedPlayer.on(rawName, handler as ViostreamEventHandler);
      unsubscribers.push(unsub);
      wiredEvents.push(rawName);
    }
  }
  debug('wireEvents: subscribed to [%s]', wiredEvents.join(', '));
}

function unwireEvents(): void {
  debug('unwireEvents: unsubscribing %d events', unsubscribers.length);
  for (const unsub of unsubscribers) {
    unsub();
  }
  unsubscribers.length = 0;
}

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

async function init(): Promise<void> {
  try {
    debug('init: getting embed API');
    const api = getViostreamApi();

    if (destroyed) {
      debug('init: stale closure detected after getViostreamApi — aborting publicKey=%s', props.publicKey);
      return;
    }

    const embedOpts = buildEmbedOptions();
    debug('init: calling api.embed publicKey=%s containerId=%s options=%o', props.publicKey, containerId, embedOpts);
    const raw: RawViostreamPlayerInstance = api.embed(props.publicKey, containerId, embedOpts, embedOpts.forceAspectRatio);
    debug('init: api.embed returned raw player');

    const wrappedPlayer = wrapRawPlayer(raw, containerId);
    debug('init: wrapRawPlayer completed containerId=%s', containerId);

    if (destroyed) {
      debug('init: stale closure detected after wrapRawPlayer — destroying and aborting publicKey=%s', props.publicKey);
      wrappedPlayer.destroy();
      return;
    }

    player.value = wrappedPlayer;
    isLoading.value = false;
    debug('init: player set, isLoading -> false publicKey=%s', props.publicKey);

    // Wire up event callbacks
    wireEvents(wrappedPlayer);

    // Notify consumer that the player is ready
    debug('init: emitting playerReady publicKey=%s', props.publicKey);
    emit('playerReady', wrappedPlayer);
  } catch (err) {
    if (!destroyed) {
      const msg = err instanceof Error ? err.message : String(err);
      debug('init: error caught publicKey=%s error=%s', props.publicKey, msg);
      errorMsg.value = msg;
      isLoading.value = false;
    } else {
      debug('init: error caught but destroyed — ignoring publicKey=%s', props.publicKey);
    }
  }
}

onMounted(() => {
  debug('onMounted publicKey=%s accountKey=%s containerId=%s', props.publicKey, props.accountKey, containerId);
  init();
});

onUnmounted(() => {
  debug('onUnmounted publicKey=%s hasPlayer=%s', props.publicKey, !!player.value);
  destroyed = true;
  unwireEvents();
  player.value?.destroy();
  player.value = undefined;
});
</script>

<template>
  <div
    :id="containerId"
    :class="props.class"
    ref="containerRef"
    data-viostream-player
    :data-viostream-public-key="publicKey"
    :data-viostream-sdk="`${SDK_NAME}@${SDK_VERSION}`"
  >
    <slot v-if="isLoading" name="loading" />

    <template v-if="errorMsg">
      <slot name="error" :message="errorMsg">
        <div data-viostream-error style="color: red; padding: 1em;">
          Failed to load Viostream player: {{ errorMsg }}
        </div>
      </slot>
    </template>
  </div>
</template>

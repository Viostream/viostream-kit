# viostream-player-core

<a href="https://www.npmjs.com/package/@viostream/viostream-player-core"><img src="https://img.shields.io/npm/v/@viostream/viostream-player-core.svg?sanitize=true" alt="npm version"></a>
<a href="https://www.npmjs.com/package/@viostream/viostream-player-core"><img src="https://img.shields.io/npm/l/@viostream/viostream-player-core.svg?sanitize=true" alt="License"></a>
<a href="https://npmcharts.com/compare/@viostream/viostream-player-core?interval=30"><img src="https://img.shields.io/npm/dm/@viostream/viostream-player-core.svg?sanitize=true" alt="Downloads"></a>

Framework-agnostic core for the [Viostream](https://www.viostream.com) player SDK. Provides the script loader, player wrapper, and full TypeScript type definitions used by all framework-specific packages (`viostream-player-svelte`, `viostream-player-react`, etc.).

Use this package directly when you want programmatic control without a framework wrapper, or when building your own integration.

## Requirements

- A browser environment (the SDK injects a `<script>` tag)
- A Viostream account key (found on the **Settings > General** page in Viostream)

## Installation

```bash
npm install @viostream/viostream-player-core
```

## Quick Start

```ts
import { createViostreamPlayer } from '@viostream/viostream-player-core';

const player = await createViostreamPlayer({
  accountKey: 'vc-100100100',
  publicKey: 'nhedxonrxsyfee',
  target: 'my-video-div', // element id or HTMLElement
  options: { displayTitle: true }
});

player.play();
const time = await player.getCurrentTime();
player.on('ended', () => console.log('done'));
```

---

## `createViostreamPlayer()`

Loads the Viostream API script, embeds a player in the given target element, and returns a typed `ViostreamPlayer` interface with promise-based getters, command methods, and event subscription.

```ts
import { createViostreamPlayer } from '@viostream/viostream-player-core';
import type { CreateViostreamPlayerOptions } from '@viostream/viostream-player-core';

const player = await createViostreamPlayer({
  accountKey: 'vc-100100100',
  publicKey: 'nhedxonrxsyfee',
  target: 'my-video-div',
  options: {
    displayTitle: true,
    sharing: true,
    speedSelector: true
  }
});
```

### Options

| Property | Type | Description |
|---|---|---|
| `accountKey` | `string` | Your Viostream account key. |
| `publicKey` | `string` | Public key of the media asset. |
| `target` | `string \| HTMLElement` | Container element id or direct DOM reference. |
| `options` | `ViostreamEmbedOptions` | Embed options (see below). |

---

## `wrapRawPlayer()`

Lower-level factory that wraps a raw callback-based player instance (returned by `$viostream.embed()`) with the typed, promise-based SDK interface. Used internally by `createViostreamPlayer()` and by framework wrappers.

```ts
import { loadViostream, wrapRawPlayer } from '@viostream/viostream-player-core';

const api = await loadViostream('vc-100100100');
const raw = api.embed('nhedxonrxsyfee', 'my-video-div', { displayTitle: true });
const player = wrapRawPlayer(raw, 'my-video-div');

player.play();
```

---

## Embed Options

All embed options are optional and passed to the Viostream embed API.

| Option | Type | Description |
|---|---|---|
| `chapters` | `boolean` | Display chapter markers. |
| `chapterSlug` | `string` | Seek to a named chapter before playback. |
| `displayTitle` | `boolean` | Show the video title overlay. Default: `false`. |
| `hlsQualitySelector` | `boolean` | Show the HLS quality selector. Default: `true`. |
| `playerKey` | `string` | Override the player theme to use. |
| `playerStyle` | `'video' \| 'audio' \| 'audio-poster'` | The player rendering style. Default: `'video'`. |
| `sharing` | `boolean` | Show sharing controls. Default: `false`. |
| `skinActive` | `string` | Custom skin active colour (e.g. `'#ff0000'`). Requires `skinCustom: true`. |
| `skinBackground` | `string` | Custom skin background colour (e.g. `'#000000'`). Requires `skinCustom: true`. |
| `skinCustom` | `boolean` | Enable a custom skin via the API. Default: `false`. |
| `skinInactive` | `string` | Custom skin inactive colour (e.g. `'#cccccc'`). Requires `skinCustom: true`. |
| `speedSelector` | `boolean` | Show playback speed selector. Default: `true`. |
| `startEndTimespan` | `string` | Play a specific section (e.g. `'10,30'`). |
| `startTime` | `string` | Seek to a time (seconds) before playback. |
| `transcriptDownload` | `boolean` | Allow transcript download. Default: `false`. |
| `useSettingsMenu` | `boolean` | Enable the settings menu on the control bar. Default: `false`. |

---

## Player Instance API

The `ViostreamPlayer` interface returned by `createViostreamPlayer()` and `wrapRawPlayer()` provides the following methods.

### Playback Controls

```ts
player.play();
player.pause();
player.mute();
player.unmute();
player.setVolume(0.5);          // 0 to 1
player.setLoop(true);
player.setCurrentTime(30);      // seek to 30 seconds
player.setCurrentTime(30, true); // seek and auto-play
player.reload();                // reload the player
player.reload({ key: 'value' }); // reload with new settings
```

### Getters (Promise-based)

All getters return promises. The SDK converts the underlying callback-based API to `async`/`await`.

```ts
const volume    = await player.getVolume();          // number (0-1)
const loop      = await player.getLoop();            // boolean
const time      = await player.getCurrentTime();     // number (seconds)
const paused    = await player.getPaused();          // boolean
const duration  = await player.getDuration();        // number (seconds)
const muted     = await player.getMuted();           // boolean
const ratio     = await player.getAspectRatio();     // number
const height    = await player.getHeight();          // number (pixels)
```

### Events

Subscribe to player events with `on()`. It returns an unsubscribe function.

```ts
// Subscribe
const unsubscribe = player.on('timeupdate', (data) => {
  console.log(`${data.seconds}s / ${data.duration}s`);
});

// Unsubscribe later
unsubscribe();

// Or use off() directly
const handler = () => console.log('paused');
player.on('pause', handler);
player.off('pause', handler);
```

#### Available Events

| Event | Callback Data | Description |
|---|---|---|
| `play` | `void` | Playback started or resumed. |
| `pause` | `void` | Playback paused. |
| `ended` | `void` | Media finished playing. |
| `timeupdate` | `{ seconds: number, duration: number }` | Playback time changed. |
| `volumechange` | `{ volume: number }` | Volume changed. |
| `error` | `{ code?: number, message?: string }` | Error occurred. |
| `progress` | `{ percent: number }` | Buffering progress. |
| `ready` | `void` | Player is ready. |
| `seeked` | `void` | Seek completed. |
| `loaded` | `void` | Metadata loaded. |

Custom event names are also accepted via the string index signature:

```ts
player.on('my-custom-event', (data) => {
  console.log(data);
});
```

### Destroy

You are responsible for cleanup when using the core API directly:

```ts
player.destroy();
```

After calling `destroy()`:
- All event listeners are removed.
- The player iframe is removed from the DOM.
- Getter calls will reject with `"Player has been destroyed"`.
- `player.raw` returns `undefined`.

### Raw Escape Hatch

If you need direct access to the underlying Viostream player instance:

```ts
const raw = player.raw; // RawViostreamPlayerInstance | undefined
if (raw) {
  raw.getVolume((vol) => console.log(vol)); // callback-based original API
}
```

---

## Script Loader

The SDK loads the Viostream API script automatically when you call `createViostreamPlayer()`. If you need manual control over loading (e.g. preloading or building a custom wrapper), you can use `loadViostream` directly:

```ts
import { loadViostream } from '@viostream/viostream-player-core';

const api = await loadViostream('vc-100100100');
const raw = api.embed('nhedxonrxsyfee', 'my-video-div', { displayTitle: true });
```

The loader:
- Injects `<script src="https://play.viostream.com/api/{accountKey}">` into `<head>`.
- Deduplicates requests -- calling it multiple times with the same key returns the same promise.
- Times out after 15 seconds if the script fails to load.
- Detects if the script tag already exists in the DOM (e.g. added manually) and waits for it.

### Host Override

The API hostname defaults to `play.viostream.com`. To point at a development or staging environment, set one of the following environment variables in your `.env` file:

| Variable | Context | Description |
|---|---|---|
| `PUBLIC_VIOSTREAM_HOST` | SvelteKit apps | Override the API hostname (e.g. `dev.viostream.com`) |
| `VITE_VIOSTREAM_HOST` | Plain Vite apps | Override the API hostname (e.g. `dev.viostream.com`) |

`PUBLIC_VIOSTREAM_HOST` takes precedence. When neither is set, the default `play.viostream.com` is used.

---

## TypeScript

Every export is fully typed. Import types alongside runtime exports:

```ts
import {
  createViostreamPlayer,
  wrapRawPlayer,
  loadViostream,
} from '@viostream/viostream-player-core';

import type {
  ViostreamPlayer,
  ViostreamEmbedOptions,
  ViostreamTimeUpdateData,
  ViostreamVolumeChangeData,
  ViostreamErrorData,
  ViostreamProgressData,
  ViostreamPlayerEventMap,
  ViostreamEventHandler,
  CreateViostreamPlayerOptions,
  RawViostreamPlayerInstance,
  ViostreamGlobal,
} from '@viostream/viostream-player-core';
```

---

## Framework Wrappers

This package is the foundation for framework-specific SDKs. If you are using a supported framework, prefer the wrapper package -- it re-exports everything from core so you only need one dependency:

| Framework | Package |
|---|---|
| Svelte 5 | [`@viostream/viostream-player-svelte`](https://www.npmjs.com/package/@viostream/viostream-player-svelte) |
| React 18+ | [`@viostream/viostream-player-react`](https://www.npmjs.com/package/@viostream/viostream-player-react) |

---

## Development

```bash
# Install dependencies
npm install

# Build (compile TypeScript to dist/)
npm run build

# Type-check
npm run check

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch
```

## License

MIT

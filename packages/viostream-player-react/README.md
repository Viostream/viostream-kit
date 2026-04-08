# viostream-player-react

<a href="https://www.npmjs.com/package/@viostream/viostream-player-react"><img src="https://img.shields.io/npm/v/@viostream/viostream-player-react.svg?sanitize=true" alt="npm version"></a>
<a href="https://www.npmjs.com/package/@viostream/viostream-player-react"><img src="https://img.shields.io/npm/l/@viostream/viostream-player-react.svg?sanitize=true" alt="License"></a>
<a href="https://npmcharts.com/compare/@viostream/viostream-player-react?interval=30"><img src="https://img.shields.io/npm/dm/@viostream/viostream-player-react.svg?sanitize=true" alt="Downloads"></a>

React 18+ SDK for the [Viostream](https://www.viostream.com) video player. Embed, control, and listen to player events with full TypeScript support.

## Requirements

- React 18 or 19
- A Viostream account key (found on the **Settings > General** page in Viostream)

## Installation

```bash
npm install @viostream/viostream-player-react
```

## Quick Start

### Component

Drop a `<ViostreamPlayer>` into any React component. The SDK loads the Viostream script automatically.

```tsx
import { ViostreamPlayer } from '@viostream/viostream-player-react';

function App() {
  return (
    <ViostreamPlayer
      accountKey="vc-100100100"
      publicKey="nhedxonrxsyfee"
      displayTitle={true}
      sharing={true}
      onPlay={() => console.log('playing')}
    />
  );
}
```

### Headless / Programmatic

Use `createViostreamPlayer` when you need full control without a component:

```ts
import { createViostreamPlayer } from '@viostream/viostream-player-react';

const player = await createViostreamPlayer({
  accountKey: 'vc-100100100',
  publicKey: 'nhedxonrxsyfee',
  target: 'my-video-div', // element id or HTMLElement
  options: { displayTitle: true }
});

player.play();
```

---

## `<ViostreamPlayer>` Component

### Props

#### Required

| Prop | Type | Description |
|---|---|---|
| `accountKey` | `string` | Your Viostream account key (e.g. `'vc-100100100'`). |
| `publicKey` | `string` | The public key of the media asset to embed. |

#### Embed Options

All embed options are optional and passed directly to the Viostream embed API.

| Prop | Type | Description |
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
| `forceAspectRatio` | `number` | Force a specific aspect ratio (e.g. `1.7778` for 16:9). Disables dynamic sizing. Must be a finite positive number; invalid values are ignored. |

#### Event Callbacks

| Prop | Signature | Fires when |
|---|---|---|
| `onPlay` | `() => void` | Playback starts or resumes. |
| `onPause` | `() => void` | Playback is paused. |
| `onEnded` | `() => void` | Media finishes playing. |
| `onTimeUpdate` | `(data: ViostreamTimeUpdateData) => void` | Current time changes. `data.seconds`, `data.duration`. |
| `onVolumeChange` | `(data: ViostreamVolumeChangeData) => void` | Volume changes. `data.volume`. |
| `onError` | `(data: ViostreamErrorData) => void` | An error occurs. `data.code`, `data.message`. |
| `onProgress` | `(data: ViostreamProgressData) => void` | Buffering progress. `data.percent`. |
| `onReady` | `() => void` | Player is ready. |
| `onSeeked` | `() => void` | Seek operation completes. |
| `onLoaded` | `() => void` | Metadata has loaded. |

#### Other Props

| Prop | Type | Description |
|---|---|---|
| `className` | `string` | CSS class applied to the outer wrapper `<div>`. |
| `onPlayerReady` | `(player: ViostreamPlayerInstance) => void` | Callback providing the player instance for programmatic control. |
| `renderLoading` | `() => ReactNode` | Render prop for a custom loading indicator. |
| `renderError` | `(message: string) => ReactNode` | Render prop for a custom error display. Receives the error message. |

### Getting the Player Instance

Use `onPlayerReady` to get a reference to the player for programmatic control:

```tsx
import { useState } from 'react';
import { ViostreamPlayer } from '@viostream/viostream-player-react';
import type { ViostreamPlayerInstance } from '@viostream/viostream-player-react';

function App() {
  const [player, setPlayer] = useState<ViostreamPlayerInstance>();

  return (
    <>
      <ViostreamPlayer
        accountKey="vc-100100100"
        publicKey="nhedxonrxsyfee"
        onPlayerReady={(p) => setPlayer(p)}
      />

      <button onClick={() => player?.play()}>Play</button>
      <button onClick={() => player?.pause()}>Pause</button>
    </>
  );
}
```

### Custom Loading and Error States

Use render props to replace the default loading/error UI:

```tsx
<ViostreamPlayer
  accountKey="vc-100100100"
  publicKey="nhedxonrxsyfee"
  renderLoading={() => <p>Loading video...</p>}
  renderError={(message) => (
    <div className="my-error">Something went wrong: {message}</div>
  )}
/>
```

### Cleanup

The player is destroyed automatically when the component unmounts. All event listeners are cleaned up and the player iframe is removed from the DOM.

---

## `createViostreamPlayer()`

For use outside of React components or when you need full lifecycle control.

```ts
import { createViostreamPlayer } from '@viostream/viostream-player-react';
import type { CreateViostreamPlayerOptions } from '@viostream/viostream-player-react';

const player = await createViostreamPlayer({
  accountKey: 'vc-100100100',
  publicKey: 'nhedxonrxsyfee',
  target: 'my-video-div',       // element id (string) or HTMLElement
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
| `options` | `ViostreamEmbedOptions` | Embed options (same as component props above). |

---

## Player Instance API

Both the component (via `onPlayerReady`) and `createViostreamPlayer()` provide a `ViostreamPlayerInstance` with the following methods.

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

When using `createViostreamPlayer()`, you are responsible for cleanup:

```ts
player.destroy();
```

After calling `destroy()`:
- All event listeners are removed.
- The player iframe is removed from the DOM.
- Getter calls will reject with `"Player has been destroyed"`.
---

## TypeScript

Every export is fully typed. Import types alongside runtime exports:

```ts
import { ViostreamPlayer, createViostreamPlayer } from '@viostream/viostream-player-react';
import type {
  ViostreamPlayerInstance,
  ViostreamPlayerProps,
  ViostreamPlayerEventProps,
  ViostreamEmbedOptions,
  ViostreamTimeUpdateData,
  ViostreamVolumeChangeData,
  ViostreamErrorData,
  ViostreamProgressData,
  ViostreamPlayerEventMap,
  ViostreamEventHandler,
  CreateViostreamPlayerOptions,
} from '@viostream/viostream-player-react';
```

---

## Full Example

A complete example showing the component with custom controls, event logging, and async getters:

```tsx
import { useState, useCallback } from 'react';
import { ViostreamPlayer } from '@viostream/viostream-player-react';
import type {
  ViostreamPlayerInstance,
  ViostreamTimeUpdateData,
} from '@viostream/viostream-player-react';

function App() {
  const [player, setPlayer] = useState<ViostreamPlayerInstance>();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [paused, setPaused] = useState(true);
  const [log, setLog] = useState<string[]>([]);

  const addLog = useCallback((msg: string) => {
    setLog((prev) => [msg, ...prev.slice(0, 49)]);
  }, []);

  const handleReady = useCallback(
    (p: ViostreamPlayerInstance) => {
      setPlayer(p);
      p.getDuration().then((d) => setDuration(d));
    },
    [],
  );

  const handleTimeUpdate = useCallback((data: ViostreamTimeUpdateData) => {
    setCurrentTime(data.seconds);
    setDuration(data.duration);
  }, []);

  function format(s: number): string {
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  }

  return (
    <>
      <ViostreamPlayer
        accountKey="vc-100100100"
        publicKey="nhedxonrxsyfee"
        displayTitle={true}
        sharing={true}
        speedSelector={true}
        hlsQualitySelector={true}
        onPlay={() => { setPaused(false); addLog('play'); }}
        onPause={() => { setPaused(true); addLog('pause'); }}
        onEnded={() => addLog('ended')}
        onTimeUpdate={handleTimeUpdate}
        onPlayerReady={handleReady}
      />

      <div>
        <button onClick={() => paused ? player?.play() : player?.pause()}>
          {paused ? 'Play' : 'Pause'}
        </button>
        <button onClick={() => player?.setCurrentTime(0)}>Restart</button>
        <span>{format(currentTime)} / {format(duration)}</span>
      </div>

      <div>
        <button onClick={async () => {
          const vol = await player?.getVolume();
          addLog(`volume: ${vol}`);
        }}>Get Volume</button>
      </div>

      <pre>{log.join('\n')}</pre>
    </>
  );
}
```

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

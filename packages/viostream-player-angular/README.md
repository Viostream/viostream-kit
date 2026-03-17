# viostream-player-angular

<a href="https://www.npmjs.com/package/@viostream/viostream-player-angular"><img src="https://img.shields.io/npm/v/@viostream/viostream-player-angular.svg?sanitize=true" alt="npm version"></a>
<a href="https://www.npmjs.com/package/@viostream/viostream-player-angular"><img src="https://img.shields.io/npm/l/@viostream/viostream-player-angular.svg?sanitize=true" alt="License"></a>
<a href="https://npmcharts.com/compare/@viostream/viostream-player-angular?interval=30"><img src="https://img.shields.io/npm/dm/@viostream/viostream-player-angular.svg?sanitize=true" alt="Downloads"></a>

Angular 17+ SDK for the [Viostream](https://www.viostream.com) video player. Embed, control, and listen to player events with full TypeScript support.

## Requirements

- Angular 17, 18, or 19
- A Viostream account key (found on the **Settings > General** page in Viostream)

## Installation

```bash
npm install @viostream/viostream-player-angular
```

## Quick Start

### Component

Import `ViostreamPlayerComponent` into any standalone component. The SDK loads the Viostream player automatically.

```ts
import { Component } from '@angular/core';
import { ViostreamPlayerComponent } from '@viostream/viostream-player-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ViostreamPlayerComponent],
  template: `
    <viostream-player
      [accountKey]="'vc-100100100'"
      [publicKey]="'nhedxonrxsyfee'"
      [displayTitle]="true"
      [sharing]="true"
      (play)="onPlay()"
    />
  `,
})
export class AppComponent {
  onPlay() {
    console.log('playing');
  }
}
```

### Headless / Programmatic

Use `createViostreamPlayer` when you need full control without a component:

```ts
import { createViostreamPlayer } from '@viostream/viostream-player-angular';

const player = await createViostreamPlayer({
  accountKey: 'vc-100100100',
  publicKey: 'nhedxonrxsyfee',
  target: 'my-video-div', // element id or HTMLElement
  options: { displayTitle: true }
});

player.play();
```

---

## `<viostream-player>` Component

The component is a standalone Angular component with the selector `viostream-player`.

### Inputs

#### Required

| Input | Type | Description |
|---|---|---|
| `accountKey` | `string` | Your Viostream account key (e.g. `'vc-100100100'`). |
| `publicKey` | `string` | The public key of the media asset to embed. |

#### Embed Options

All embed option inputs are optional and passed directly to the Viostream embed API.

| Input | Type | Description |
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

#### Other Inputs

| Input | Type | Description |
|---|---|---|
| `cssClass` | `string` | CSS class applied to the outer wrapper `<div>`. Use `cssClass` instead of `class` to avoid Angular template conflicts. |

### Outputs (Events)

Events are emitted using Angular `output()`. Use the standard Angular `(eventName)` binding syntax in templates.

| Output | Emitted Type | Fires when |
|---|---|---|
| `(play)` | `void` | Playback starts or resumes. |
| `(pause)` | `void` | Playback is paused. |
| `(ended)` | `void` | Media finishes playing. |
| `(timeUpdate)` | `ViostreamTimeUpdateData` | Current time changes. `$event.seconds`, `$event.duration`. |
| `(volumeChange)` | `ViostreamVolumeChangeData` | Volume changes. `$event.volume`. |
| `(playerError)` | `ViostreamErrorData` | An error occurs. `$event.code`, `$event.message`. Named `playerError` to avoid conflict with the native DOM `error` event. |
| `(progress)` | `ViostreamProgressData` | Buffering progress. `$event.percent`. |
| `(ready)` | `void` | Player is ready. |
| `(seeked)` | `void` | Seek operation completes. |
| `(loaded)` | `void` | Metadata has loaded. |
| `(playerReady)` | `ViostreamPlayerInstance` | Player instance is available for programmatic control. |

### Getting the Player Instance

Use the `(playerReady)` output to get a reference to the player for programmatic control:

```ts
import { Component } from '@angular/core';
import { ViostreamPlayerComponent } from '@viostream/viostream-player-angular';
import type { ViostreamPlayerInstance } from '@viostream/viostream-player-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ViostreamPlayerComponent],
  template: `
    <viostream-player
      [accountKey]="'vc-100100100'"
      [publicKey]="'nhedxonrxsyfee'"
      (playerReady)="onPlayerReady($event)"
    />

    <button (click)="player?.play()">Play</button>
    <button (click)="player?.pause()">Pause</button>
  `,
})
export class AppComponent {
  player: ViostreamPlayerInstance | undefined;

  onPlayerReady(p: ViostreamPlayerInstance) {
    this.player = p;
  }
}
```

### Custom Loading State

Use content projection with the `[loading]` attribute to replace the default loading indicator:

```html
<viostream-player
  [accountKey]="'vc-100100100'"
  [publicKey]="'nhedxonrxsyfee'"
>
  <p loading>Loading video...</p>
</viostream-player>
```

### Cleanup

The player is destroyed automatically when the component is destroyed (`ngOnDestroy`). All event listeners are cleaned up and the player iframe is removed from the DOM.

---

## `createViostreamPlayer()`

For use outside of Angular templates or when you need full lifecycle control.

```ts
import { createViostreamPlayer } from '@viostream/viostream-player-angular';
import type { CreateViostreamPlayerOptions } from '@viostream/viostream-player-angular';

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
| `options` | `ViostreamEmbedOptions` | Embed options (same as component inputs above). |

---

## Player Instance API

Both the component (via `(playerReady)`) and `createViostreamPlayer()` provide a `ViostreamPlayerInstance` with the following methods.

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
import { ViostreamPlayerComponent, createViostreamPlayer } from '@viostream/viostream-player-angular';
import type {
  ViostreamPlayerInstance,
  ViostreamPlayerInputs,
  ViostreamPlayerEventProps,
  ViostreamEmbedOptions,
  ViostreamTimeUpdateData,
  ViostreamVolumeChangeData,
  ViostreamErrorData,
  ViostreamProgressData,
  ViostreamPlayerEventMap,
  ViostreamEventHandler,
  CreateViostreamPlayerOptions,
} from '@viostream/viostream-player-angular';
```

---

## Full Example

A complete example showing the component with custom controls, event logging, and async getters:

```ts
import { Component } from '@angular/core';
import { ViostreamPlayerComponent } from '@viostream/viostream-player-angular';
import type {
  ViostreamPlayerInstance,
  ViostreamTimeUpdateData,
} from '@viostream/viostream-player-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ViostreamPlayerComponent],
  template: `
    <viostream-player
      [accountKey]="'vc-100100100'"
      [publicKey]="'nhedxonrxsyfee'"
      [displayTitle]="true"
      [sharing]="true"
      [speedSelector]="true"
      [hlsQualitySelector]="true"
      (play)="onPlay()"
      (pause)="onPause()"
      (ended)="onEnded()"
      (timeUpdate)="onTimeUpdate($event)"
      (playerReady)="onPlayerReady($event)"
    />

    <div>
      <button (click)="isPaused ? player?.play() : player?.pause()">
        {{ isPaused ? 'Play' : 'Pause' }}
      </button>
      <button (click)="player?.setCurrentTime(0)">Restart</button>
      <span>{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
    </div>

    <div>
      <button (click)="logVolume()">Get Volume</button>
    </div>

    <pre>{{ log.join('\\n') }}</pre>
  `,
})
export class AppComponent {
  player: ViostreamPlayerInstance | undefined;
  currentTime = 0;
  duration = 0;
  isPaused = true;
  log: string[] = [];

  onPlayerReady(p: ViostreamPlayerInstance) {
    this.player = p;
    p.getDuration().then((d) => (this.duration = d));
  }

  onPlay() {
    this.isPaused = false;
    this.log = ['play', ...this.log];
  }

  onPause() {
    this.isPaused = true;
    this.log = ['pause', ...this.log];
  }

  onEnded() {
    this.log = ['ended', ...this.log];
  }

  onTimeUpdate(data: ViostreamTimeUpdateData) {
    this.currentTime = data.seconds;
    this.duration = data.duration;
  }

  async logVolume() {
    const vol = await this.player?.getVolume();
    this.log = [`volume: ${vol}`, ...this.log];
  }

  formatTime(s: number): string {
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  }
}
```

---

## Development

```bash
# Install dependencies
npm install

# Build (ng-packagr, Ivy partial compilation)
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

# AGENTS.md — viostream-kit

> Instructions for AI coding agents operating in this repository.

## Project Overview

- **Repository:** Viostream/viostream-kit
- **Purpose:** Multi-package SDK for the Viostream SaaS video platform. Provides
  player API wrappers for various front-end technologies.
- **License:** MIT
- **Language:** TypeScript (strict mode)
- **Package manager:** npm with workspaces
- **Monorepo layout:** `packages/` and `examples/` directories with npm workspaces.

### Packages

| Package | Path | Framework | Description |
|---------|------|-----------|-------------|
| `@viostream/viostream-player-core` | `packages/viostream-player-core` | None (vanilla TS) | Framework-agnostic core: types, script loader, player wrapper |
| `@viostream/viostream-player-svelte` | `packages/viostream-player-svelte` | Svelte 5 | `<ViostreamPlayer>` component (depends on `player-core`) |
| `@viostream/viostream-player-react` | `packages/viostream-player-react` | React 18+ | `<ViostreamPlayer>` component (depends on `player-core`) |
| `@viostream/viostream-player-vue` | `packages/viostream-player-vue` | Vue 3 | `<ViostreamPlayer>` component (depends on `player-core`) |
| `@viostream/viostream-player-angular` | `packages/viostream-player-angular` | Angular 17+ | `<viostream-player>` component (depends on `player-core`) |

### Examples

| App | Path | Framework | Description |
|-----|------|-----------|-------------|
| `example-svelte` | `examples/svelte` | Svelte 5 / SvelteKit | Demo app for `player-svelte` |
| `example-react` | `examples/react` | React 18 / Vite | Demo app for `player-react` |
| `example-vue` | `examples/vue` | Vue 3 / Vite | Demo app for `player-vue` |
| `example-angular` | `examples/angular` | Angular 19 | Demo app for `player-angular` |
| `example-core` | `examples/core` | Vanilla TS / Vite | Demo app for `player-core` (deployed to GitHub Pages) |

## Build Commands

```shell
npm install                 # install all workspace dependencies from root

# packages/viostream-player-core
cd packages/viostream-player-core
npm run build               # tsc — compile to dist/
npm run check               # tsc --noEmit (type checking only)

# packages/viostream-player-svelte
cd packages/viostream-player-svelte
npm run build               # svelte-kit sync && svelte-package && publint
npm run package             # same as build (library packaging)
npm run check               # svelte-kit sync && svelte-check (type checking)

# packages/viostream-player-react
cd packages/viostream-player-react
npm run build               # vite build (library mode)
npm run check               # tsc --noEmit (type checking only)

# packages/viostream-player-vue
cd packages/viostream-player-vue
npm run build               # vite build (library mode)
npm run check               # vue-tsc --noEmit (type checking only)

# packages/viostream-player-angular
cd packages/viostream-player-angular
npm run build               # ng-packagr (Ivy partial compilation)
npm run check               # tsc --noEmit (type checking only)

# examples/svelte
cd examples/svelte
npm run dev                 # SvelteKit dev server (demo page)
npm run build               # vite build (production build)

# examples/react
cd examples/react
npm run dev                 # Vite dev server (demo page)
npm run build               # tsc + vite build (production build)

# examples/vue
cd examples/vue
npm run dev                 # Vite dev server (demo page)
npm run build               # vite build (production build)
```

**Build order:** `player-core` must be built before `player-svelte`, `player-react`,
or `player-vue` can package, and wrapper packages must be packaged before their
example apps can run.
npm run build               # vue-tsc + vite build (production build)

# examples/angular
cd examples/angular
npm run dev                 # Angular CLI dev server (demo page)
npm run build               # Angular CLI build (production build)

# examples/core
cd examples/core
npm run dev                 # Vite dev server (demo page)
npm run build               # tsc + vite build (production build)
```

**Build order:** `player-core` must be built before any wrapper package can
build, and wrapper packages must be built before their example apps can run.

## Test Commands

Test runner: **Vitest** (jsdom environment).

```shell
# packages/viostream-player-core
cd packages/viostream-player-core
npm test                                        # run all tests once
npx vitest run src/tests/player.test.ts         # run a single test file
npx vitest run -t "delegates play"              # run tests matching a pattern
npx vitest                                      # watch mode

# packages/viostream-player-svelte (uses @testing-library/svelte)
cd packages/viostream-player-svelte
npm test                                        # run all tests once
npx vitest run src/tests/ViostreamPlayer.test.ts      # run a single test file
npx vitest                                      # watch mode

# packages/viostream-player-react (uses @testing-library/react)
cd packages/viostream-player-react
npm test                                        # run all tests once
npx vitest run src/tests/ViostreamPlayer.test.ts      # run a single test file
npx vitest                                      # watch mode

# packages/viostream-player-vue (uses @testing-library/vue)
cd packages/viostream-player-vue
npm test                                        # run all tests once
npx vitest run src/tests/ViostreamPlayer.test.ts      # run a single test file
npx vitest                                      # watch mode

# packages/viostream-player-angular (uses Angular TestBed + Vitest)
cd packages/viostream-player-angular
npm test                                        # run all tests once
npx vitest run src/tests/viostream-player.component.test.ts  # run a single test file
npx vitest                                      # watch mode
```

**When fixing a bug or adding a feature, always run the relevant single test file
rather than the full suite to get fast feedback.**

## Lint and Format

> No linter or formatter is configured yet. When one is added, update this section.

## Host Override (Development Only)

The vendored embed API defaults to `play.viostream.com`. To point at a
development or staging environment, set `window.playerDomain` before any
player is created:

```js
window.playerDomain = 'dev.viostream.com';
```

This is handled internally by the embed API's `config()` function and is
**not** exposed as a prop, parameter, or environment variable in the SDK.

## Code Style Guidelines

### Imports

- ES modules only (`import`/`export`). No CommonJS.
- Group imports: (1) node built-ins, (2) external packages, (3) internal `$lib`
  aliases, (4) relative imports. Separate groups with a blank line.
- Prefer named exports. The barrel file is `src/index.ts` (core) or
  `src/lib/index.ts` (svelte).
- Use `.js` extensions in import paths (required by ESM).

### Formatting

- 2-space indentation.
- Single quotes for strings.
- Semicolons at end of statements.
- Trailing commas in multi-line structures.

### TypeScript

- `strict: true` in tsconfig. Never weaken it.
- Prefer `interface` for object shapes; `type` for unions and utility types.
- Avoid `any` — use `unknown` with type guards.
- Use explicit return types on exported functions.
- Callback-based vendor APIs are wrapped with promise-based getters
  (see `promisifyGet` pattern in `player-core/src/player.ts`).

### Svelte

- Svelte 5 runes API: use `$props()`, `$state()`, `$effect()`.
- Do not use legacy Svelte 4 syntax (`export let`, `$:`, `on:event`).
- Component files use PascalCase (`ViostreamPlayer.svelte`).
- Use Svelte 5 snippets (`{#snippet}`) for slot-like patterns (loading/error).

### Naming Conventions

- **Files:** kebab-case for TS (`player.ts`, `loader.ts`), PascalCase for
  Svelte components (`ViostreamPlayer.svelte`).
- **Variables/functions:** camelCase (`createViostreamPlayer`, `wrapRawPlayer`).
- **Types/interfaces:** PascalCase with `Viostream` prefix (`ViostreamPlayer`,
  `ViostreamEmbedOptions`, `ViostreamPlayerEventMap`).
- **Constants:** UPPER_SNAKE_CASE (`LOAD_TIMEOUT_MS`, `EVENT_MAP`).
- **Booleans:** prefix with `is`, `has`, `should` (`isLoading`, `isDestroyed`).

### Error Handling

- Never silently swallow errors — log or rethrow.
- Wrap external API failures with descriptive error messages
  (see `loadViostream` timeout/error handling in `loader.ts`).
- Prefer early returns and guard clauses.
- In async code, always handle promise rejections with try/catch.
- After `destroy()`, getters reject with a clear "Player is destroyed" error.

### Tests

- Tests live in `src/tests/` alongside the source.
- Core mocks are in `player-core/src/tests/mocks.ts` — reuse
  `createMockRawPlayer()` and `createMockViostreamGlobal()`.
- Svelte setup file: `player-svelte/src/tests/setup.ts` (jest-dom matchers).
- React setup file: `player-react/src/tests/setup.ts` (jest-dom matchers).
- Vue setup file: `player-vue/src/tests/setup.ts` (jest-dom matchers).
- Angular setup file: `player-angular/src/tests/setup.ts` (zone.js + @angular/compiler + jest-dom).
- Component tests use `@testing-library/svelte` (`render`, `screen`),
  `@testing-library/react`, `@testing-library/vue`, or Angular `TestBed`.
- Test files are named `<module>.test.ts`.

## Project Structure

```
viostream-kit/
  package.json              — npm workspaces root
  AGENTS.md                 — this file
  README.md                 — project overview
  LICENSE                   — MIT
  packages/
    player-core/            — framework-agnostic core
      src/
        index.ts            — barrel exports
        types.ts            — all shared TypeScript types/interfaces
        player.ts           — createViostreamPlayer() + wrapRawPlayer()
        loader.ts           — loadViostream() script loader
        tests/              — vitest tests + mocks
      dist/                 — compiled output (gitignored)
      package.json
      tsconfig.json
      vite.config.ts
    player-svelte/          — Svelte 5 wrapper (library only, depends on player-core)
      src/
        app.html            — minimal SvelteKit shell (required by svelte-kit sync)
        lib/
          index.ts          — barrel: re-exports core + ViostreamPlayer component
          types.ts          — Svelte-specific props (ViostreamPlayerProps)
          ViostreamPlayer.svelte  — component
        tests/              — component tests
      dist/                 — built package output (gitignored)
      package.json
      tsconfig.json
      svelte.config.js
      vite.config.ts
    player-react/           — React 18+ wrapper (library only, depends on player-core)
      src/
        index.ts            — barrel: re-exports core + ViostreamPlayer component
        types.ts            — React-specific props (ViostreamPlayerProps)
        ViostreamPlayer.tsx — component
        tests/              — component tests
      dist/                 — built package output (gitignored)
      package.json
      tsconfig.json
      vite.config.ts
    player-vue/             — Vue 3 wrapper (library only, depends on player-core)
      src/
        index.ts            — barrel: re-exports core + ViostreamPlayer component
        types.ts            — Vue-specific props (ViostreamPlayerProps)
        ViostreamPlayer.vue — component
        tests/              — component tests
      dist/                 — built package output (gitignored)
      package.json
      tsconfig.json
      vite.config.ts
    player-angular/         — Angular 17+ wrapper (library only, depends on player-core)
      src/
        index.ts            — barrel: re-exports core + ViostreamPlayerComponent
        types.ts            — Angular-specific types (ViostreamPlayerInputs, ViostreamPlayerEventProps)
        viostream-player.component.ts — standalone component
        tests/              — TestBed + vitest component tests
      dist/                 — ng-packagr built output (gitignored)
      package.json
      tsconfig.json
      tsconfig.lib.json
      ng-package.json
      vite.config.ts
  examples/
    svelte/                 — SvelteKit demo app for player-svelte
      src/
        routes/
          +page.svelte      — comprehensive demo page
        app.html            — SvelteKit HTML shell
        app.d.ts            — SvelteKit type declarations
      package.json
      svelte.config.js
      vite.config.ts
      tsconfig.json
    react/                  — Vite + React demo app for player-react
      src/
        App.tsx             — comprehensive demo page
        App.css             — log-scroll style
        main.tsx            — React entry point
      package.json
      vite.config.ts
      tsconfig.json
    vue/                    — Vite + Vue demo app for player-vue
      src/
        App.vue             — comprehensive demo page
        App.css             — log-scroll style
        main.ts             — Vue entry point
        env.d.ts            — Vite/Vue type declarations
      package.json
      vite.config.ts
      tsconfig.json
    angular/                — Angular CLI demo app for player-angular
      src/
        app/
          app.component.ts    — comprehensive demo page (component class)
          app.component.html  — comprehensive demo page (template)
        index.html            — Angular HTML shell
        main.ts               — Angular entry point
        styles.css            — log-scroll style
      angular.json
      package.json
      tsconfig.json
      tsconfig.app.json
    core/                   — Vanilla TS demo app for player-core (deployed to GitHub Pages)
      src/
        main.ts             — createViostreamPlayer() demo with all embed options
      index.html            — Bootstrap 5 dark theme shell
      package.json
      tsconfig.json
      vite.config.ts
```

## Commit Convention

All commits **must** follow [Conventional Commits](https://www.conventionalcommits.org/).
Always include the current branch name in the commit footer using a `Branch:` token.

### Format

```
<type>(<optional scope>): <description>

[optional body]

Branch: <branch-name>
```

### Allowed Types

| Type       | Purpose                                        |
|------------|------------------------------------------------|
| `feat`     | A new feature                                  |
| `fix`      | A bug fix                                      |
| `docs`     | Documentation-only changes                     |
| `style`    | Formatting, missing semicolons, etc. (no logic)|
| `refactor` | Code change that neither fixes nor adds        |
| `perf`     | Performance improvement                        |
| `test`     | Adding or updating tests                       |
| `build`    | Build system or dependency changes             |
| `ci`       | CI configuration changes                       |
| `chore`    | Other changes (not src or tests)               |
| `revert`   | Reverts a previous commit                      |

### Rules

- Imperative mood in description ("add feature", not "added feature").
- First line under **72 characters**.
- Body explains *what* and *why*, not *how*.
- Breaking changes: `BREAKING CHANGE:` in footer or `!` after type/scope.
- `Branch:` footer is **required**. Run `git branch --show-current` first.

### Examples

```
feat(player-svelte): add volume slider support

Branch: feature/volume-slider
```

```
fix(player-core): prevent crash when config file is missing

Branch: fix/missing-config
```

## Agent-Specific Notes

- Run tests (`npm test`) before considering any task complete.
- Run type checking (`npm run check`) after modifying TypeScript or Svelte files.
- Build `player-core` before running `player-svelte` tests or dev server.
- Prefer editing existing files over creating new ones.
- Do not commit `.env` files, secrets, `node_modules/`, `dist/`, or `.svelte-kit/`.
- Use the project's package manager (`npm`) — do not switch to yarn or pnpm.
- Follow existing patterns — consistency over personal preference.
- Use the `Viostream` prefix for all public types and interfaces.
- Framework-agnostic code (types, loader, player wrapper) belongs in `player-core`.
- Framework-specific code (components, props) belongs in the relevant wrapper package.
- When adding a new framework wrapper, mirror the structure of `packages/viostream-player-svelte`.
- **Always** use Conventional Commits with a `Branch:` footer.

## Deprecated / Removed APIs

> **Do NOT re-add any of the following.** They were removed because the
> underlying Viostream Player API has deprecated them. They will be removed
> from the API in a future version and must not be exposed in any SDK package.

### Removed Player Methods

| Method | Was In | Reason |
|--------|--------|--------|
| `getLiveCurrentTime()` | `ViostreamPlayer`, `RawViostreamPlayerInstance` | Deprecated API endpoint |
| `getTracks()` | `ViostreamPlayer`, `RawViostreamPlayerInstance` | Deprecated API endpoint |
| `setTrack()` | `ViostreamPlayer`, `RawViostreamPlayerInstance` | Deprecated API endpoint |
| `cueAdd()` | `ViostreamPlayer`, `RawViostreamPlayerInstance` | Deprecated API endpoint |
| `cueUpdate()` | `ViostreamPlayer`, `RawViostreamPlayerInstance` | Deprecated API endpoint |
| `cueDelete()` | `ViostreamPlayer`, `RawViostreamPlayerInstance` | Deprecated API endpoint |
| `asrAdd()` | `ViostreamPlayer`, `RawViostreamPlayerInstance` | Deprecated API endpoint |

### Removed Types

| Type | Was In | Reason |
|------|--------|--------|
| `ViostreamCue` | `player-core/src/types.ts` | Only used by removed cue methods |
| `ViostreamCueFieldUpdate` | `player-core/src/types.ts` | Only used by removed cue methods |
| `ViostreamTrack` | `player-core/src/types.ts` | Only used by removed track methods |

### Removed Embed Options

| Property | Was In | Reason |
|----------|--------|--------|
| `chapterDisplayType` | `ViostreamEmbedOptions` | Not part of the canonical PlayerSettings type |

### Removed Properties

| Property | Was In | Reason |
|----------|--------|--------|
| `.raw` | `ViostreamPlayer` interface | Consumers should not access the raw player instance |

### Internal-Only Exports (Not Re-exported from Wrapper Packages)

The following are exported from `@viostream/viostream-player-core` for internal
use by the wrapper packages, but must **never** be re-exported from the wrapper
package barrel files (`player-svelte`, `player-react`, `player-vue`, `player-angular`):

| Export | Purpose |
|--------|---------|
| `wrapRawPlayer` | Used internally by wrapper components to wrap raw instances |
| `normalizeForceAspectRatio` | Used internally by wrapper components to validate `forceAspectRatio` before passing to `api.embed()` |
| `RawViostreamPlayerInstance` | Type used internally by wrapper components |
| `ViostreamGlobal` | Type used internally by loader code |

Consumers of wrapper packages should only interact with the `ViostreamPlayer`
interface returned via the `onPlayerReady` callback.

## Canonical PlayerSettings / ViostreamEmbedOptions

`ViostreamEmbedOptions` (in `player-core/src/types.ts`) **must** stay aligned with
the canonical `PlayerSettings` type defined by the Viostream Player API. The
following are the **only** user-facing embed option properties:

| Property | Type | Description |
|----------|------|-------------|
| `chapters` | `boolean` | Show chapters. Default: `true`. |
| `chapterSlug` | `string` | Seek to a named chapter before playback begins. |
| `displayTitle` | `boolean` | Show the video title overlay. Default: `false`. |
| `hlsQualitySelector` | `boolean` | Show the HLS quality selector control. Default: `true`. |
| `playerKey` | `string` | Override the player theme/key to use. |
| `playerStyle` | `'video' \| 'audio' \| 'audio-poster'` | The player rendering style. Default: `video`. |
| `sharing` | `boolean` | Show the sharing control. Default: `false`. |
| `skinActive` | `string` | Custom skin active colour (e.g. `#000`). Requires `skinCustom: true`. |
| `skinBackground` | `string` | Custom skin background colour (e.g. `#000`). Requires `skinCustom: true`. |
| `skinCustom` | `boolean` | Enable a custom skin via the API. Default: `false`. |
| `skinInactive` | `string` | Custom skin inactive colour (e.g. `#000`). Requires `skinCustom: true`. |
| `speedSelector` | `boolean` | Show the playback speed selector. Default: `true`. |
| `startEndTimespan` | `string` | Play only a specific section of the video (e.g. `'10,30'`). |
| `startTime` | `string` | Seek to a specific time (in seconds) before playback begins. |
| `transcriptDownload` | `boolean` | Allow transcript download. Default: `false`. |
| `useSettingsMenu` | `boolean` | Enable the settings menu on the control bar. Default: `false`. |

Internal-only API properties (`documentLocation`, `dynamicSizing`, `apiEmbed`)
are set automatically by the API script and must **never** be exposed as
user-facing options in `ViostreamEmbedOptions`.

---

*Last updated: 2026-04-08. Update this file as the project evolves.*

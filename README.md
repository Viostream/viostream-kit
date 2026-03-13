# viostream-kit

SDK packages for the [Viostream](https://www.viostream.com) video platform.
Embed, control, and listen to Viostream player events from your front-end
application using framework-native wrappers.

## Packages

| Package | Version | Framework | Description |
| ------- | ------- | --------- | ----------- |
| [`@viostream/viostream-player-core`](./packages/viostream-player-core) | <a href="https://www.npmjs.com/package/@viostream/viostream-player-core"><img src="https://img.shields.io/npm/v/@viostream/viostream-player-core.svg?sanitize=true" alt="Version"></a> | None (vanilla TS) | Framework-agnostic core: types, script loader, player wrapper |
| [`@viostream/viostream-player-svelte`](./packages/viostream-player-svelte) | <a href="https://www.npmjs.com/package/@viostream/viostream-player-svelte"><img src="https://img.shields.io/npm/v/@viostream/viostream-player-svelte.svg?sanitize=true" alt="Version"></a> | Svelte 5 | `<ViostreamPlayer>` component and `createViostreamPlayer()` headless API |
| [`@viostream/viostream-player-react`](./packages/viostream-player-react) | <a href="https://www.npmjs.com/package/@viostream/viostream-player-react"><img src="https://img.shields.io/npm/v/@viostream/viostream-player-react.svg?sanitize=true" alt="Version"></a> | React 18+ | `<ViostreamPlayer>` component and `createViostreamPlayer()` headless API |
| [`@viostream/viostream-player-vue`](./packages/viostream-player-vue) | <a href="https://www.npmjs.com/package/@viostream/viostream-player-vue"><img src="https://img.shields.io/npm/v/@viostream/viostream-player-vue.svg?sanitize=true" alt="Version"></a> | Vue 3 | `<ViostreamPlayer>` component and `createViostreamPlayer()` headless API |
| [`@viostream/viostream-player-angular`](./packages/viostream-player-angular) | <a href="https://www.npmjs.com/package/@viostream/viostream-player-angular"><img src="https://img.shields.io/npm/v/@viostream/viostream-player-angular.svg?sanitize=true" alt="Version"></a> | Angular 17+ | `<viostream-player>` component and `createViostreamPlayer()` headless API |

All framework wrappers build on `player-core`.

## Examples

| App | Path | Framework | Description |
| --- | ---- | --------- | ----------- |
| `example-svelte` | [`examples/svelte`](./examples/svelte) | Svelte 5 / SvelteKit | Interactive demo for `player-svelte` |
| `example-react` | [`examples/react`](./examples/react) | React 18 / Vite | Interactive demo for `player-react` |
| `example-vue` | [`examples/vue`](./examples/vue) | Vue 3 / Vite | Interactive demo for `player-vue` |
| `example-angular` | [`examples/angular`](./examples/angular) | Angular 19 | Interactive demo for `player-angular` |

Examples are standalone apps that live in `examples/` and depend on the
corresponding SDK package via npm workspaces. When a new framework wrapper is
added, a matching example app should be created here.

## Quick Start

Install all dependencies from the repository root:

```shell
npm install
```

Then build and develop:

```shell
# Build the core (required before other packages)
cd packages/viostream-player-core
npm run build

# Package the Svelte library
cd packages/viostream-player-svelte
npm run build
npm test

# Build the React library
cd packages/viostream-player-react
npm run build
npm test

# Build the Vue library
cd packages/viostream-player-vue
npm run build
npm test

# Build the Angular library
cd packages/viostream-player-angular
npm run build
npm test

# Run the Svelte example app
cd examples/svelte
npm run dev

# Run the React example app
cd examples/react
npm run dev

# Run the Vue example app
cd examples/vue
npm run dev

# Run the Angular example app
cd examples/angular
npm run dev
```

## Repository Structure

```
viostream-kit/
  package.json          — npm workspaces root (packages/* + examples/*)
  packages/
    player-core/        — framework-agnostic core (types, loader, wrapper)
    player-svelte/      — Svelte 5 player SDK (library only, depends on player-core)
    player-react/       — React 18+ player SDK (library only, depends on player-core)
    player-vue/         — Vue 3 player SDK (library only, depends on player-core)
    player-angular/     — Angular 17+ player SDK (library only, depends on player-core)
  examples/
    svelte/             — SvelteKit demo app for player-svelte
    react/              — Vite + React demo app for player-react
    vue/                — Vite + Vue demo app for player-vue
    angular/            — Angular CLI demo app for player-angular
  AGENTS.md             — guidelines for AI coding agents
  LICENSE               — MIT
```

**Build order:** `player-core` must be built before `player-svelte`,
`player-react`, `player-vue`, or `player-angular` can package, and the wrapper
packages must be packaged before their example apps can run.

## Contributing

- **TypeScript** with `strict: true` across all packages.
- **Conventional Commits** are required — see [AGENTS.md](./AGENTS.md) for the
  full commit convention including the `Branch:` footer requirement.
- Run `npm test` and `npm run check` inside the relevant package before
  submitting changes.

## Releases

Releases are managed by [Release Please](https://github.com/googleapis/release-please).
When a PR is merged, a release PR will be created. When the release PR is merged,
new packages will be published to npm with the updated version.

## License

[MIT](./LICENSE) — Copyright (c) 2026 Viostream

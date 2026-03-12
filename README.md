# viostream-kit

SDK packages for the [Viostream](https://www.viostream.com) video platform.
Embed, control, and listen to Viostream player events from your front-end
application using framework-native wrappers.

## Packages

| Package | Version | Framework | Description |
|---------|---------|-----------|-------------|
| [`@viostream/viostream-player-core`](./packages/player-core) | 0.1.0 | None (vanilla TS) | Framework-agnostic core: types, script loader, player wrapper |
| [`@viostream/viostream-player-svelte`](./packages/player-svelte) | 0.1.0 | Svelte 5 | `<ViostreamPlayer>` component and `createViostreamPlayer()` headless API |

> More framework wrappers (React, Vue, etc.) are planned for the `packages/`
> directory. All wrappers build on `player-core`.

## Examples

| App | Path | Framework | Description |
|-----|------|-----------|-------------|
| `example-svelte` | [`examples/svelte`](./examples/svelte) | Svelte 5 / SvelteKit | Interactive demo for `player-svelte` |

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
cd packages/player-core
npm run build

# Package the Svelte library
cd packages/player-svelte
npm run build
npm test

# Run the Svelte example app
cd examples/svelte
npm run dev
```

## Repository Structure

```
viostream-kit/
  package.json          — npm workspaces root (packages/* + examples/*)
  packages/
    player-core/        — framework-agnostic core (types, loader, wrapper)
    player-svelte/      — Svelte 5 player SDK (library only, depends on player-core)
  examples/
    svelte/             — SvelteKit demo app for player-svelte
  AGENTS.md             — guidelines for AI coding agents
  LICENSE               — MIT
```

**Build order:** `player-core` must be built before `player-svelte` can
package, and `player-svelte` must be packaged before example apps can run.

## Contributing

- **TypeScript** with `strict: true` across all packages.
- **Conventional Commits** are required — see [AGENTS.md](./AGENTS.md) for the
  full commit convention including the `Branch:` footer requirement.
- Run `npm test` and `npm run check` inside the relevant package before
  submitting changes.

## License

[MIT](./LICENSE) — Copyright (c) 2026 Viostream

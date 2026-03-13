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

### Examples

| App | Path | Framework | Description |
|-----|------|-----------|-------------|
| `example-svelte` | `examples/svelte` | Svelte 5 / SvelteKit | Demo app for `player-svelte` |
| `example-react` | `examples/react` | React 18 / Vite | Demo app for `player-react` |
| `example-vue` | `examples/vue` | Vue 3 / Vite | Demo app for `player-vue` |

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
npm run build               # tsc — compile to dist/
npm run check               # tsc --noEmit (type checking only)

# packages/viostream-player-vue
cd packages/viostream-player-vue
npm run build               # vue-tsc -b && vite build
npm run check               # vue-tsc --noEmit (type checking only)

# examples/svelte
cd examples/svelte
npm run dev                 # SvelteKit dev server (demo page)
npm run build               # vite build (production build)

# examples/react
cd examples/react
npm run dev                 # Vite dev server (demo page)
npm run build               # vite build (production build)

# examples/vue
cd examples/vue
npm run dev                 # Vite dev server (demo page)
npm run build               # vite build (production build)
```

**Build order:** `player-core` must be built before `player-svelte`, `player-react`,
or `player-vue` can package, and wrapper packages must be packaged before their
example apps can run.

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
npx vitest run src/tests/ViostreamPlayer.test.tsx     # run a single test file
npx vitest                                      # watch mode

# packages/viostream-player-vue (uses @testing-library/vue)
cd packages/viostream-player-vue
npm test                                        # run all tests once
npx vitest run src/tests/ViostreamPlayer.test.ts      # run a single test file
npx vitest                                      # watch mode
```

**When fixing a bug or adding a feature, always run the relevant single test file
rather than the full suite to get fast feedback.**

## Lint and Format

> No linter or formatter is configured yet. When one is added, update this section.

## Environment Variables

The SDK reads environment variables via `import.meta.env` at runtime. Vite
statically replaces these at build time in consuming applications.

| Variable | Context | Description |
|----------|---------|-------------|
| `PUBLIC_VIOSTREAM_HOST` | SvelteKit apps | Override the Viostream API hostname (e.g. `dev.viostream.com`) |
| `VITE_VIOSTREAM_HOST` | Plain Vite apps | Override the Viostream API hostname (e.g. `dev.viostream.com`) |

- `PUBLIC_VIOSTREAM_HOST` takes precedence over `VITE_VIOSTREAM_HOST`.
- When neither is set, the SDK defaults to `play.viostream.com`.
- See `.env.example` at the repo root for a template.
- The host override is resolved internally by the loader — it is **not** exposed
  as a prop or function parameter in the public API.
- Type declarations for these variables live in `packages/viostream-player-core/src/env.d.ts`.

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
- Component tests use `@testing-library/svelte` (`render`, `screen`).
- Test files are named `<module>.test.ts`.

## Project Structure

```
viostream-kit/
  package.json              — npm workspaces root
  AGENTS.md                 — this file
  README.md                 — project overview
  LICENSE                   — MIT
  .env.example              — environment variable template
  packages/
    player-core/            — framework-agnostic core
      src/
        index.ts            — barrel exports
        types.ts            — all shared TypeScript types/interfaces
        player.ts           — createViostreamPlayer() + wrapRawPlayer()
        loader.ts           — loadViostream() script loader
        env.d.ts            — import.meta.env type declarations
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
      dist/                 — compiled output (gitignored)
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
        main.tsx            — app entry point
      index.html            — HTML shell with Bootstrap dark theme
      package.json
      vite.config.ts
      tsconfig.json
    vue/                    — Vite + Vue demo app for player-vue
      src/
        App.vue             — comprehensive demo page
        main.ts             — app entry point
      index.html            — HTML shell with Bootstrap dark theme
      package.json
      vite.config.ts
      tsconfig.json
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

---

*Last updated: 2026-03-12. Update this file as the project evolves.*

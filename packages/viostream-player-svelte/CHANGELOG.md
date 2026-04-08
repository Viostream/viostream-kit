# Changelog

## [0.2.7](https://github.com/Viostream/viostream-kit/compare/player-svelte-v0.2.6...player-svelte-v0.2.7) (2026-04-08)


### Features

* add debug logging across all packages using 'debug' package ([b196883](https://github.com/Viostream/viostream-kit/commit/b1968832b04b52f45d13fc0de8f055e57bbb2fc5))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @viostream/viostream-player-core bumped from ^0.2.6 to ^0.2.7

## [0.2.6](https://github.com/Viostream/viostream-kit/compare/player-svelte-v0.2.5...player-svelte-v0.2.6) (2026-03-20)


### Bug Fixes

* sync all packages for release ([578dae0](https://github.com/Viostream/viostream-kit/commit/578dae0f251c13a273fa58a26bca1b8c41a4725b))
* sync all packages for release ([2fa8079](https://github.com/Viostream/viostream-kit/commit/2fa807934db3c72a780a47242c2fe17d4c6948e6))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @viostream/viostream-player-core bumped from ^0.2.5 to ^0.2.6

## [0.2.5](https://github.com/Viostream/viostream-kit/compare/player-svelte-v0.2.4...player-svelte-v0.2.5) (2026-03-17)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @viostream/viostream-player-core bumped from ^0.2.4 to ^0.2.5

## [0.2.4](https://github.com/Viostream/viostream-kit/compare/player-svelte-v0.2.3...player-svelte-v0.2.4) (2026-03-17)


### Features

* **player-core:** bundle embed API, move tests outside src, add pack smoke tests ([782947e](https://github.com/Viostream/viostream-kit/commit/782947e9373145e5022cea921691d9bbf5fe399a))
* **player-core:** bundle embed API, move tests outside src, add pack… ([e2b7e7e](https://github.com/Viostream/viostream-kit/commit/e2b7e7ed66687aad57159ab88a7c322008d03e1c))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @viostream/viostream-player-core bumped from ^0.2.3 to ^0.2.4

## [0.2.3](https://github.com/Viostream/viostream-kit/compare/player-svelte-v0.2.2...player-svelte-v0.2.3) (2026-03-16)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @viostream/viostream-player-core bumped from ^0.2.2 to ^0.2.3

## [0.2.2](https://github.com/Viostream/viostream-kit/compare/player-svelte-v0.2.1...player-svelte-v0.2.2) (2026-03-16)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @viostream/viostream-player-core bumped from ^0.2.1 to ^0.2.2

## [0.2.1](https://github.com/Viostream/viostream-kit/compare/player-svelte-v0.2.0...player-svelte-v0.2.1) (2026-03-16)


### Bug Fixes

* sync all packages for release ([0713af4](https://github.com/Viostream/viostream-kit/commit/0713af428c27dcf12d0c631bdf68b0eb747d5e10))
* sync all packages for release ([13f26bf](https://github.com/Viostream/viostream-kit/commit/13f26bfcf2549c96be59c77f586ebbe6b039a3bb))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @viostream/viostream-player-core bumped from ^0.2.0 to ^0.2.1

## [0.2.0](https://github.com/Viostream/viostream-kit/compare/player-svelte-v0.1.3...player-svelte-v0.2.0) (2026-03-16)


### ⚠ BREAKING CHANGES

* .raw property removed from ViostreamPlayer; wrapRawPlayer, RawViostreamPlayerInstance, and ViostreamGlobal are no longer exported from wrapper packages.
* **player-core:** getLiveCurrentTime(), getTracks(), setTrack(), cueAdd(), cueUpdate(), cueDelete(), asrAdd() and their associated types have been removed from the public API. The chapterDisplayType embed option has also been removed.

### Features

* **player-core:** add playerStyle embed option and correct default value docs ([e819115](https://github.com/Viostream/viostream-kit/commit/e8191154185fa29828ef2db0c1f40348f8ce9362))


### Code Refactoring

* **player-core:** remove deprecated API endpoints and align embed options with PlayerSettings ([fd8d21f](https://github.com/Viostream/viostream-kit/commit/fd8d21fa4e2f5069bbf823d7dc2c3b30d7f9365d))
* remove .raw property and restrict internal exports from wrapper packages ([7a5f736](https://github.com/Viostream/viostream-kit/commit/7a5f7361516a0d027f5e9df44e117946a7938693))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @viostream/viostream-player-core bumped from ^0.1.2 to ^0.2.0

## [0.1.3](https://github.com/Viostream/viostream-kit/compare/player-svelte-v0.1.2...player-svelte-v0.1.3) (2026-03-12)


### Features

* add React SDK for Viostream video player ([6581cfa](https://github.com/Viostream/viostream-kit/commit/6581cfaacc037ebc603aa590cc3c08f482d85ce8))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @viostream/viostream-player-core bumped from ^0.1.1 to ^0.1.2

## [0.1.2](https://github.com/Viostream/viostream-kit/compare/player-svelte-v0.1.0...player-svelte-v0.1.2) (2026-03-12)

## [0.1.1](https://github.com/Viostream/viostream-kit/compare/player-svelte-v0.1.0...player-svelte-v0.1.1) (2026-03-12)


### Features

* add ViostreamPlayer Svelte component and related files ([6034b60](https://github.com/Viostream/viostream-kit/commit/6034b609fc10269dd7b314801f4507126e679d29))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @viostream/viostream-player-core bumped from ^0.1.0 to ^0.1.1

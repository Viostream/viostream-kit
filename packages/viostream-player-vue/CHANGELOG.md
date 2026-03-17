# Changelog

## [0.2.4](https://github.com/Viostream/viostream-kit/compare/player-vue-v0.2.3...player-vue-v0.2.4) (2026-03-17)


### Features

* **player-core:** bundle embed API, move tests outside src, add pack smoke tests ([782947e](https://github.com/Viostream/viostream-kit/commit/782947e9373145e5022cea921691d9bbf5fe399a))
* **player-core:** bundle embed API, move tests outside src, add pack… ([e2b7e7e](https://github.com/Viostream/viostream-kit/commit/e2b7e7ed66687aad57159ab88a7c322008d03e1c))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @viostream/viostream-player-core bumped from ^0.2.3 to ^0.2.4

## [0.2.3](https://github.com/Viostream/viostream-kit/compare/player-vue-v0.2.2...player-vue-v0.2.3) (2026-03-16)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @viostream/viostream-player-core bumped from ^0.2.2 to ^0.2.3

## [0.2.2](https://github.com/Viostream/viostream-kit/compare/player-vue-v0.2.1...player-vue-v0.2.2) (2026-03-16)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @viostream/viostream-player-core bumped from ^0.2.1 to ^0.2.2

## [0.2.1](https://github.com/Viostream/viostream-kit/compare/player-vue-v0.2.0...player-vue-v0.2.1) (2026-03-16)


### Bug Fixes

* sync all packages for release ([0713af4](https://github.com/Viostream/viostream-kit/commit/0713af428c27dcf12d0c631bdf68b0eb747d5e10))
* sync all packages for release ([13f26bf](https://github.com/Viostream/viostream-kit/commit/13f26bfcf2549c96be59c77f586ebbe6b039a3bb))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @viostream/viostream-player-core bumped from ^0.2.0 to ^0.2.1

## [0.2.0](https://github.com/Viostream/viostream-kit/compare/player-vue-v0.1.1...player-vue-v0.2.0) (2026-03-16)


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

## [0.1.1](https://github.com/Viostream/viostream-kit/compare/player-vue-v0.1.0...player-vue-v0.1.1) (2026-03-13)


### Features

* add viostream-player-vue package with Vue 3 SDK for Viostream video player ([a7cbc24](https://github.com/Viostream/viostream-kit/commit/a7cbc248a2ed96b2618133f6b52639d2f4032833))
* add viostream-player-vue package with Vue 3 SDK for Viostream video player ([fa545a6](https://github.com/Viostream/viostream-kit/commit/fa545a645be974108ecbfb516dbf1e597a83d66b))

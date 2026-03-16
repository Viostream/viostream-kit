# Changelog

## [0.2.1](https://github.com/Viostream/viostream-kit/compare/player-react-v0.2.0...player-react-v0.2.1) (2026-03-16)


### Bug Fixes

* sync all packages for release ([0713af4](https://github.com/Viostream/viostream-kit/commit/0713af428c27dcf12d0c631bdf68b0eb747d5e10))
* sync all packages for release ([13f26bf](https://github.com/Viostream/viostream-kit/commit/13f26bfcf2549c96be59c77f586ebbe6b039a3bb))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @viostream/viostream-player-core bumped from ^0.2.0 to ^0.2.1

## [0.2.0](https://github.com/Viostream/viostream-kit/compare/player-react-v0.1.1...player-react-v0.2.0) (2026-03-16)


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

## [0.1.1](https://github.com/Viostream/viostream-kit/compare/player-react-v0.1.0...player-react-v0.1.1) (2026-03-12)


### Features

* add React SDK for Viostream video player ([6581cfa](https://github.com/Viostream/viostream-kit/commit/6581cfaacc037ebc603aa590cc3c08f482d85ce8))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @viostream/viostream-player-core bumped from ^0.1.1 to ^0.1.2

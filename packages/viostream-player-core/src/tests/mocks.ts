/**
 * Shared mock factory for tests.
 *
 * Provides a mock `RawViostreamPlayerInstance` that tracks all method calls
 * and allows simulating callback-based getters and event emission.
 */

import type { RawViostreamPlayerInstance, ViostreamEventHandler, ViostreamGlobal } from '../types.js';
import { vi } from 'vitest';

/**
 * Creates a mock RawViostreamPlayerInstance where every method is a vi.fn().
 * Callback-based getters will invoke the callback with configurable return values.
 */
export function createMockRawPlayer(overrides: Partial<RawViostreamPlayerInstance> = {}): RawViostreamPlayerInstance & {
  /** Simulate emitting an event to all registered `on()` handlers. */
  _emit: (event: string, data?: unknown) => void;
  /** All handlers registered via `on()`. */
  _handlers: Map<string, ViostreamEventHandler[]>;
  /** Configure what value a getter callback should receive. */
  _getterValues: Record<string, unknown>;
} {
  const handlers = new Map<string, ViostreamEventHandler[]>();
  const getterValues: Record<string, unknown> = {
    getVolume: 0.75,
    getLoop: false,
    getCurrentTime: 42.5,
    getPaused: true,
    getDuration: 120,
    getMuted: false,
    getAspectRatio: 1.7778,
    getLiveCurrentTime: 0,
    getHeight: 360,
    getTracks: [],
  };

  function makeGetter(name: string) {
    return vi.fn((cb: (v: unknown) => void) => {
      cb(getterValues[name]);
    });
  }

  const mock: RawViostreamPlayerInstance = {
    play: vi.fn(),
    pause: vi.fn(),
    mute: vi.fn(),
    unmute: vi.fn(),
    setVolume: vi.fn(),
    getVolume: makeGetter('getVolume'),
    setLoop: vi.fn(),
    getLoop: makeGetter('getLoop'),
    setCurrentTime: vi.fn(),
    getCurrentTime: makeGetter('getCurrentTime'),
    getPaused: makeGetter('getPaused'),
    getDuration: makeGetter('getDuration'),
    getMuted: makeGetter('getMuted'),
    getAspectRatio: makeGetter('getAspectRatio'),
    getLiveCurrentTime: makeGetter('getLiveCurrentTime'),
    getHeight: makeGetter('getHeight'),
    reload: vi.fn(),
    getTracks: makeGetter('getTracks'),
    setTrack: vi.fn(),
    cueAdd: vi.fn(),
    cueUpdate: vi.fn(),
    cueDelete: vi.fn(),
    asrAdd: vi.fn(),
    on: vi.fn((event: string, handler: ViostreamEventHandler) => {
      if (!handlers.has(event)) {
        handlers.set(event, []);
      }
      handlers.get(event)!.push(handler);
    }),
    ...overrides,
  };

  return Object.assign(mock, {
    _emit(event: string, data?: unknown) {
      const eventHandlers = handlers.get(event);
      if (eventHandlers) {
        for (const h of eventHandlers) {
          h(data);
        }
      }
    },
    _handlers: handlers,
    _getterValues: getterValues,
  });
}

/**
 * Creates a mock ViostreamGlobal (`window.$viostream`) that returns
 * a mock raw player from `embed()`.
 */
export function createMockViostreamGlobal(
  rawPlayer?: ReturnType<typeof createMockRawPlayer>,
): ViostreamGlobal & { _rawPlayer: ReturnType<typeof createMockRawPlayer> } {
  const player = rawPlayer ?? createMockRawPlayer();
  const global: ViostreamGlobal = {
    embed: vi.fn(() => player),
  };
  return Object.assign(global, { _rawPlayer: player });
}

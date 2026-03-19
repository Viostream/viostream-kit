/**
 * Shared mock factory for tests.
 *
 * Provides a mock `RawViostreamPlayerInstance` that tracks all method calls
 * and allows simulating callback-based getters.
 */

import type { RawViostreamPlayerInstance } from '../src/types.js';
import { vi } from 'vitest';

/**
 * Creates a mock RawViostreamPlayerInstance where every method is a vi.fn().
 * Callback-based getters will invoke the callback with configurable return values.
 */
export function createMockRawPlayer(overrides: Partial<RawViostreamPlayerInstance> = {}): RawViostreamPlayerInstance & {
  /** Configure what value a getter callback should receive. */
  _getterValues: Record<string, unknown>;
} {
  const getterValues: Record<string, unknown> = {
    getVolume: 0.75,
    getLoop: false,
    getCurrentTime: 42.5,
    getPaused: true,
    getDuration: 120,
    getMuted: false,
    getAspectRatio: 1.7778,
    getHeight: 360,
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
    getHeight: makeGetter('getHeight'),
    reload: vi.fn(),
    on: vi.fn(),
    ...overrides,
  };

  return Object.assign(mock, {
    _getterValues: getterValues,
  });
}

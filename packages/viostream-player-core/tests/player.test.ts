import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { wrapRawPlayer, createViostreamPlayer, normalizeForceAspectRatio } from '../src/player.js';
import type { RawViostreamPlayerInstance } from '../src/types.js';
import { SDK_NAME, SDK_VERSION } from '../src/version.js';
import { createMockRawPlayer } from './mocks.js';

describe('wrapRawPlayer', () => {
  let mockRaw: ReturnType<typeof createMockRawPlayer>;
  let targetDiv: HTMLDivElement;
  const TARGET_ID = 'test-player-container';

  beforeEach(() => {
    mockRaw = createMockRawPlayer();

    // Set up a target container in the DOM
    targetDiv = document.createElement('div');
    targetDiv.id = TARGET_ID;
    targetDiv.innerHTML = '<iframe src="about:blank"></iframe>';
    document.body.appendChild(targetDiv);
  });

  afterEach(() => {
    targetDiv.remove();
  });

  // -----------------------------------------------------------------------
  // Playback commands
  // -----------------------------------------------------------------------
  describe('playback commands', () => {
    it('play() delegates to raw.play()', () => {
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      player.play();
      expect(mockRaw.play).toHaveBeenCalledOnce();
    });

    it('pause() delegates to raw.pause()', () => {
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      player.pause();
      expect(mockRaw.pause).toHaveBeenCalledOnce();
    });

    it('mute() delegates to raw.mute()', () => {
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      player.mute();
      expect(mockRaw.mute).toHaveBeenCalledOnce();
    });

    it('unmute() delegates to raw.unmute()', () => {
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      player.unmute();
      expect(mockRaw.unmute).toHaveBeenCalledOnce();
    });

    it('setVolume() delegates with the correct value', () => {
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      player.setVolume(0.5);
      expect(mockRaw.setVolume).toHaveBeenCalledWith(0.5);
    });

    it('setLoop() delegates with the correct value', () => {
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      player.setLoop(true);
      expect(mockRaw.setLoop).toHaveBeenCalledWith(true);
    });

    it('setCurrentTime() delegates with seconds and play flag', () => {
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      player.setCurrentTime(30, true);
      expect(mockRaw.setCurrentTime).toHaveBeenCalledWith(30, true);
    });

    it('setCurrentTime() works without the play flag', () => {
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      player.setCurrentTime(15);
      expect(mockRaw.setCurrentTime).toHaveBeenCalledWith(15, undefined);
    });

    it('reload() delegates to raw.reload()', () => {
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      player.reload({ key: 'value' });
      expect(mockRaw.reload).toHaveBeenCalledWith({ key: 'value' });
    });

    it('reload() works without options', () => {
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      player.reload();
      expect(mockRaw.reload).toHaveBeenCalledWith(undefined);
    });
  });

  // -----------------------------------------------------------------------
  // Promise-based getters
  // -----------------------------------------------------------------------
  describe('promise-based getters', () => {
    it('getVolume() resolves with the volume value', async () => {
      mockRaw._getterValues.getVolume = 0.8;
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      await expect(player.getVolume()).resolves.toBe(0.8);
    });

    it('getLoop() resolves with the loop value', async () => {
      mockRaw._getterValues.getLoop = true;
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      await expect(player.getLoop()).resolves.toBe(true);
    });

    it('getCurrentTime() resolves with current time', async () => {
      mockRaw._getterValues.getCurrentTime = 55.3;
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      await expect(player.getCurrentTime()).resolves.toBe(55.3);
    });

    it('getPaused() resolves with paused state', async () => {
      mockRaw._getterValues.getPaused = false;
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      await expect(player.getPaused()).resolves.toBe(false);
    });

    it('getDuration() resolves with duration', async () => {
      mockRaw._getterValues.getDuration = 180;
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      await expect(player.getDuration()).resolves.toBe(180);
    });

    it('getMuted() resolves with muted state', async () => {
      mockRaw._getterValues.getMuted = true;
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      await expect(player.getMuted()).resolves.toBe(true);
    });

    it('getAspectRatio() resolves with aspect ratio', async () => {
      mockRaw._getterValues.getAspectRatio = 1.7778;
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      await expect(player.getAspectRatio()).resolves.toBe(1.7778);
    });

    it('getHeight() resolves with height', async () => {
      mockRaw._getterValues.getHeight = 720;
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      await expect(player.getHeight()).resolves.toBe(720);
    });

    it('getters invoke the correct raw method', async () => {
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      await player.getVolume();
      expect(mockRaw.getVolume).toHaveBeenCalledOnce();

      await player.getDuration();
      expect(mockRaw.getDuration).toHaveBeenCalledOnce();
    });

    it('getters reject with timeout when callback is never invoked', async () => {
      // Create a mock raw player where getVolume never calls its callback
      const stuckRaw = createMockRawPlayer({
        getVolume: vi.fn(() => {
          // intentionally never call the callback
        }) as unknown as RawViostreamPlayerInstance['getVolume'],
      });

      const player = wrapRawPlayer(stuckRaw, TARGET_ID);

      // Use fake timers to avoid waiting 10 real seconds
      vi.useFakeTimers();
      const promise = player.getVolume();

      // Advance past the timeout
      vi.advanceTimersByTime(10_001);

      await expect(promise).rejects.toThrow('Player getter timed out');

      vi.useRealTimers();
    });
  });

  // -----------------------------------------------------------------------
  // Event subscription
  // -----------------------------------------------------------------------
  describe('event subscription (on/off)', () => {
    it('on() registers a proxy handler with the raw player', () => {
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      const handler = vi.fn();
      player.on('play', handler);
      // A proxy is registered (not the original handler), so raw.on is still called
      expect(mockRaw.on).toHaveBeenCalledOnce();
      expect(mockRaw.on).toHaveBeenCalledWith('play', expect.any(Function));
    });

    it('on() returns an unsubscribe function', () => {
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      const handler = vi.fn();
      const unsub = player.on('play', handler);
      expect(typeof unsub).toBe('function');
    });

    it('on() registers proxy handler in raw player for the correct event', () => {
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      const handler = vi.fn();
      player.on('timeupdate', handler);

      // Verify the proxy was registered with the correct event name
      expect(mockRaw.on).toHaveBeenCalledWith('timeupdate', expect.any(Function));
    });

    it('off() removes a handler from the internal listener map', () => {
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      const handler = vi.fn();
      player.on('play', handler);
      player.off('play', handler);

      // The handler should have been removed from internal tracking.
      // We can verify by subscribing and unsubscribing another handler
      // to ensure the map is clean.
      const handler2 = vi.fn();
      player.on('play', handler2);
      player.off('play', handler2);
      // No errors means the map was properly managed
    });

    it('off() prevents the proxy from forwarding events to the handler', () => {
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      const handler = vi.fn();
      player.on('play', handler);

      // Grab the proxy function that was registered with raw.on
      const proxy = (mockRaw.on as ReturnType<typeof vi.fn>).mock.calls[0][1];

      // Simulate the raw player firing the event — handler should be called
      proxy();
      expect(handler).toHaveBeenCalledOnce();

      // Now unsubscribe
      player.off('play', handler);

      // Simulate the raw player firing again — handler should NOT be called
      proxy();
      expect(handler).toHaveBeenCalledOnce(); // still 1, not 2
    });

    it('off() via unsubscribe function prevents event forwarding', () => {
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      const handler = vi.fn();
      const unsub = player.on('play', handler);

      // Grab the proxy
      const proxy = (mockRaw.on as ReturnType<typeof vi.fn>).mock.calls[0][1];

      // Fire event — should forward
      proxy({ type: 'play' });
      expect(handler).toHaveBeenCalledOnce();

      // Unsubscribe
      unsub();

      // Fire event — should NOT forward
      proxy({ type: 'play' });
      expect(handler).toHaveBeenCalledOnce(); // still 1
    });

    it('unsubscribe function from on() calls off()', () => {
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      const handler = vi.fn();
      const offSpy = vi.spyOn(player, 'off');

      const unsub = player.on('pause', handler);
      unsub();

      expect(offSpy).toHaveBeenCalledWith('pause', handler);
    });

    it('multiple handlers for the same event work independently', () => {
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      player.on('play', handler1);
      player.on('play', handler2);

      expect(mockRaw.on).toHaveBeenCalledTimes(2);

      // Remove only handler1
      player.off('play', handler1);

      // handler2 should still be tracked (no error on cleanup)
      player.off('play', handler2);
    });

    it('on() returns noop when player is destroyed', () => {
      const player = wrapRawPlayer(mockRaw, TARGET_ID);

      player.destroy();

      const handler = vi.fn();
      const unsub = player.on('play', handler);

      expect(typeof unsub).toBe('function');
      // The noop unsubscribe should not throw
      unsub();
    });

    it('off() is safe to call for a non-existent event', () => {
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      const handler = vi.fn();
      // Should not throw
      player.off('nonexistent', handler);
    });

    it('off() is safe to call for a non-registered handler', () => {
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      player.on('play', handler1);
      // handler2 was never registered — should not throw
      player.off('play', handler2);
    });
  });

  // -----------------------------------------------------------------------
  // Destroy
  // -----------------------------------------------------------------------
  describe('destroy', () => {
    it('clears the container DOM', () => {
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      expect(targetDiv.innerHTML).not.toBe('');

      player.destroy();
      expect(targetDiv.innerHTML).toBe('');
    });

    it('sets raw to undefined after destroy', () => {
      const player = wrapRawPlayer(mockRaw, TARGET_ID);

      player.destroy();
      // Player should be in destroyed state — getters reject
      expect(player.getVolume()).rejects.toThrow('Player has been destroyed');
    });

    it('getters reject after destroy', async () => {
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      player.destroy();

      await expect(player.getVolume()).rejects.toThrow('Player has been destroyed');
      await expect(player.getCurrentTime()).rejects.toThrow('Player has been destroyed');
      await expect(player.getDuration()).rejects.toThrow('Player has been destroyed');
      await expect(player.getPaused()).rejects.toThrow('Player has been destroyed');
      await expect(player.getMuted()).rejects.toThrow('Player has been destroyed');
      await expect(player.getLoop()).rejects.toThrow('Player has been destroyed');
      await expect(player.getAspectRatio()).rejects.toThrow('Player has been destroyed');
      await expect(player.getHeight()).rejects.toThrow('Player has been destroyed');
    });

    it('calling destroy() twice is safe (idempotent)', () => {
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      player.destroy();
      // Should not throw
      player.destroy();
    });

    it('destroy gracefully handles missing container element', () => {
      // Create player with a non-existent target id
      const player = wrapRawPlayer(mockRaw, 'nonexistent-id');
      // Should not throw
      player.destroy();
    });
  });
});

// ---------------------------------------------------------------------------
// normalizeForceAspectRatio
// ---------------------------------------------------------------------------

describe('normalizeForceAspectRatio', () => {
  it('returns undefined for undefined', () => {
    expect(normalizeForceAspectRatio(undefined)).toBeUndefined();
  });

  it('passes through a valid positive finite number', () => {
    expect(normalizeForceAspectRatio(1.7778)).toBe(1.7778);
  });

  it('passes through small positive numbers', () => {
    expect(normalizeForceAspectRatio(0.001)).toBe(0.001);
  });

  it('normalizes NaN to undefined', () => {
    expect(normalizeForceAspectRatio(NaN)).toBeUndefined();
  });

  it('normalizes 0 to undefined', () => {
    expect(normalizeForceAspectRatio(0)).toBeUndefined();
  });

  it('normalizes negative numbers to undefined', () => {
    expect(normalizeForceAspectRatio(-1)).toBeUndefined();
    expect(normalizeForceAspectRatio(-0.5)).toBeUndefined();
  });

  it('normalizes Infinity to undefined', () => {
    expect(normalizeForceAspectRatio(Infinity)).toBeUndefined();
  });

  it('normalizes -Infinity to undefined', () => {
    expect(normalizeForceAspectRatio(-Infinity)).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// createViostreamPlayer — SDK attribute
// ---------------------------------------------------------------------------

vi.mock('../src/api.js', () => ({
  getViostreamApi: vi.fn(),
}));

import { getViostreamApi } from '../src/api.js';
const mockedGetViostreamApi = vi.mocked(getViostreamApi);

describe('createViostreamPlayer', () => {
  let targetDiv: HTMLDivElement;

  beforeEach(() => {
    targetDiv = document.createElement('div');
    targetDiv.id = 'sdk-attr-test';
    document.body.appendChild(targetDiv);

    const mockRaw = createMockRawPlayer();
    mockedGetViostreamApi.mockReturnValue({
      embed: vi.fn(() => mockRaw),
    });
  });

  afterEach(() => {
    targetDiv.remove();
    vi.clearAllMocks();
  });

  it('stamps data-viostream-sdk on the target element (string id)', async () => {
    await createViostreamPlayer({
      accountKey: 'vc-test',
      publicKey: 'pk-test',
      target: 'sdk-attr-test',
    });

    expect(targetDiv.getAttribute('data-viostream-sdk')).toBe(`${SDK_NAME}@${SDK_VERSION}`);
  });

  it('stamps data-viostream-sdk on the target element (HTMLElement)', async () => {
    await createViostreamPlayer({
      accountKey: 'vc-test',
      publicKey: 'pk-test',
      target: targetDiv,
    });

    expect(targetDiv.getAttribute('data-viostream-sdk')).toBe(`${SDK_NAME}@${SDK_VERSION}`);
  });

  // -----------------------------------------------------------------------
  // forceAspectRatio handling
  // -----------------------------------------------------------------------
  describe('forceAspectRatio', () => {
    it('forwards top-level forceAspectRatio as the 4th argument to api.embed()', async () => {
      await createViostreamPlayer({
        accountKey: 'vc-test',
        publicKey: 'pk-test',
        target: 'sdk-attr-test',
        forceAspectRatio: 1.7778,
      });

      const embedFn = mockedGetViostreamApi().embed as ReturnType<typeof vi.fn>;
      expect(embedFn).toHaveBeenCalledWith('pk-test', 'sdk-attr-test', expect.any(Object), 1.7778);
    });

    it('forwards options.forceAspectRatio as the 4th argument when top-level is not set', async () => {
      await createViostreamPlayer({
        accountKey: 'vc-test',
        publicKey: 'pk-test',
        target: 'sdk-attr-test',
        options: { forceAspectRatio: 0.5625 },
      });

      const embedFn = mockedGetViostreamApi().embed as ReturnType<typeof vi.fn>;
      expect(embedFn).toHaveBeenCalledWith('pk-test', 'sdk-attr-test', expect.any(Object), 0.5625);
    });

    it('top-level forceAspectRatio takes precedence over options.forceAspectRatio', async () => {
      await createViostreamPlayer({
        accountKey: 'vc-test',
        publicKey: 'pk-test',
        target: 'sdk-attr-test',
        forceAspectRatio: 1.7778,
        options: { forceAspectRatio: 0.5625 },
      });

      const embedFn = mockedGetViostreamApi().embed as ReturnType<typeof vi.fn>;
      expect(embedFn).toHaveBeenCalledWith('pk-test', 'sdk-attr-test', expect.any(Object), 1.7778);
    });

    it('strips forceAspectRatio from the options object passed to api.embed()', async () => {
      await createViostreamPlayer({
        accountKey: 'vc-test',
        publicKey: 'pk-test',
        target: 'sdk-attr-test',
        options: { forceAspectRatio: 0.5625, displayTitle: true },
      });

      const embedFn = mockedGetViostreamApi().embed as ReturnType<typeof vi.fn>;
      const passedOptions = embedFn.mock.calls[0][2];
      expect(passedOptions).not.toHaveProperty('forceAspectRatio');
      expect(passedOptions).toHaveProperty('displayTitle', true);
    });

    it('passes undefined as the 4th argument when forceAspectRatio is not set anywhere', async () => {
      await createViostreamPlayer({
        accountKey: 'vc-test',
        publicKey: 'pk-test',
        target: 'sdk-attr-test',
        options: { displayTitle: true },
      });

      const embedFn = mockedGetViostreamApi().embed as ReturnType<typeof vi.fn>;
      expect(embedFn).toHaveBeenCalledWith('pk-test', 'sdk-attr-test', expect.any(Object), undefined);
    });

    it('normalizes NaN to undefined before passing to api.embed()', async () => {
      await createViostreamPlayer({
        accountKey: 'vc-test',
        publicKey: 'pk-test',
        target: 'sdk-attr-test',
        forceAspectRatio: NaN,
      });

      const embedFn = mockedGetViostreamApi().embed as ReturnType<typeof vi.fn>;
      expect(embedFn).toHaveBeenCalledWith('pk-test', 'sdk-attr-test', expect.any(Object), undefined);
    });

    it('normalizes 0 to undefined before passing to api.embed()', async () => {
      await createViostreamPlayer({
        accountKey: 'vc-test',
        publicKey: 'pk-test',
        target: 'sdk-attr-test',
        options: { forceAspectRatio: 0 },
      });

      const embedFn = mockedGetViostreamApi().embed as ReturnType<typeof vi.fn>;
      expect(embedFn).toHaveBeenCalledWith('pk-test', 'sdk-attr-test', expect.any(Object), undefined);
    });

    it('normalizes negative values to undefined before passing to api.embed()', async () => {
      await createViostreamPlayer({
        accountKey: 'vc-test',
        publicKey: 'pk-test',
        target: 'sdk-attr-test',
        forceAspectRatio: -1,
      });

      const embedFn = mockedGetViostreamApi().embed as ReturnType<typeof vi.fn>;
      expect(embedFn).toHaveBeenCalledWith('pk-test', 'sdk-attr-test', expect.any(Object), undefined);
    });

    it('normalizes Infinity to undefined before passing to api.embed()', async () => {
      await createViostreamPlayer({
        accountKey: 'vc-test',
        publicKey: 'pk-test',
        target: 'sdk-attr-test',
        forceAspectRatio: Infinity,
      });

      const embedFn = mockedGetViostreamApi().embed as ReturnType<typeof vi.fn>;
      expect(embedFn).toHaveBeenCalledWith('pk-test', 'sdk-attr-test', expect.any(Object), undefined);
    });
  });
});

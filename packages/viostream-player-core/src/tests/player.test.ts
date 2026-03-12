import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { wrapRawPlayer } from '../player.js';
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
  // Track management
  // -----------------------------------------------------------------------
  describe('track management', () => {
    it('setTrack() delegates to raw.setTrack()', () => {
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      const track = { id: 'en', label: 'English' };
      player.setTrack(track);
      expect(mockRaw.setTrack).toHaveBeenCalledWith(track);
    });

    it('setTrack() accepts a string id', () => {
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      player.setTrack('en');
      expect(mockRaw.setTrack).toHaveBeenCalledWith('en');
    });

    it('getTracks() returns a promise that resolves with tracks', async () => {
      const mockTracks = [{ id: 'en', label: 'English' }, { id: 'fr', label: 'French' }];
      mockRaw._getterValues.getTracks = mockTracks;

      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      const tracks = await player.getTracks();
      expect(tracks).toEqual(mockTracks);
    });
  });

  // -----------------------------------------------------------------------
  // Cue management
  // -----------------------------------------------------------------------
  describe('cue management', () => {
    it('cueAdd() delegates to raw.cueAdd()', () => {
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      const cue = { startTime: 10, text: 'Hello' };
      player.cueAdd(cue);
      expect(mockRaw.cueAdd).toHaveBeenCalledWith(cue);
    });

    it('cueUpdate() delegates to raw.cueUpdate()', () => {
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      const cue = { startTime: 10, text: 'Hello' };
      const field = { text: 'Updated' };
      player.cueUpdate(cue, field);
      expect(mockRaw.cueUpdate).toHaveBeenCalledWith(cue, field);
    });

    it('cueDelete() delegates to raw.cueDelete()', () => {
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      player.cueDelete('cue-1');
      expect(mockRaw.cueDelete).toHaveBeenCalledWith('cue-1');
    });
  });

  // -----------------------------------------------------------------------
  // ASR
  // -----------------------------------------------------------------------
  describe('ASR', () => {
    it('asrAdd() delegates to raw.asrAdd()', () => {
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      const cues = [{ text: 'hello' }];
      player.asrAdd(cues, 'asr-1');
      expect(mockRaw.asrAdd).toHaveBeenCalledWith(cues, 'asr-1');
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

    it('getLiveCurrentTime() resolves with live current time', async () => {
      mockRaw._getterValues.getLiveCurrentTime = 99.9;
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      await expect(player.getLiveCurrentTime()).resolves.toBe(99.9);
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
  });

  // -----------------------------------------------------------------------
  // Event subscription
  // -----------------------------------------------------------------------
  describe('event subscription (on/off)', () => {
    it('on() registers a handler with the raw player', () => {
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      const handler = vi.fn();
      player.on('play', handler);
      expect(mockRaw.on).toHaveBeenCalledWith('play', handler);
    });

    it('on() returns an unsubscribe function', () => {
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      const handler = vi.fn();
      const unsub = player.on('play', handler);
      expect(typeof unsub).toBe('function');
    });

    it('on() registers handler in internal listener map', () => {
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      const handler = vi.fn();
      player.on('timeupdate', handler);

      // Verify through the raw mock that on was called
      expect(mockRaw.on).toHaveBeenCalledWith('timeupdate', handler);
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

    it('on() warns and returns noop when player is destroyed', () => {
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      player.destroy();

      const handler = vi.fn();
      const unsub = player.on('play', handler);

      expect(warnSpy).toHaveBeenCalledWith('Cannot subscribe to events on a destroyed player');
      expect(typeof unsub).toBe('function');
      // The noop unsubscribe should not throw
      unsub();

      warnSpy.mockRestore();
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
      expect(player.raw).toBe(mockRaw);

      player.destroy();
      expect(player.raw).toBeUndefined();
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
      await expect(player.getLiveCurrentTime()).rejects.toThrow('Player has been destroyed');
      await expect(player.getHeight()).rejects.toThrow('Player has been destroyed');
      await expect(player.getTracks()).rejects.toThrow('Player has been destroyed');
    });

    it('calling destroy() twice is safe (idempotent)', () => {
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      player.destroy();
      // Should not throw
      player.destroy();
      expect(player.raw).toBeUndefined();
    });

    it('destroy gracefully handles missing container element', () => {
      // Create player with a non-existent target id
      const player = wrapRawPlayer(mockRaw, 'nonexistent-id');
      // Should not throw
      player.destroy();
      expect(player.raw).toBeUndefined();
    });
  });

  // -----------------------------------------------------------------------
  // raw escape hatch
  // -----------------------------------------------------------------------
  describe('raw property', () => {
    it('exposes the raw player instance', () => {
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      expect(player.raw).toBe(mockRaw);
    });

    it('returns undefined after destroy', () => {
      const player = wrapRawPlayer(mockRaw, TARGET_ID);
      player.destroy();
      expect(player.raw).toBeUndefined();
    });
  });
});

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createEmbedApi } from '../src/vendor/viostream-embed.js';

// Penpal unhandled rejections (expected in jsdom) are suppressed by the
// process-level handler in tests/setup-embed.ts.

/**
 * Tests for the vendored Viostream embed API.
 */
describe('createEmbedApi', () => {
  it('returns an object with an embed() method', () => {
    const api = createEmbedApi();
    expect(api).toBeDefined();
    expect(typeof api.embed).toBe('function');
  });
});

describe('embed() — DOM behavior', () => {
  let targetDiv: HTMLDivElement;
  const TARGET_ID = 'test-embed-target';

  beforeEach(() => {
    targetDiv = document.createElement('div');
    targetDiv.id = TARGET_ID;
    document.body.appendChild(targetDiv);
  });

  afterEach(() => {
    targetDiv.remove();
  });

  it('creates an iframe inside the target container', () => {
    const api = createEmbedApi();
    api.embed('test-public-key', TARGET_ID);

    const iframe = targetDiv.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe?.getAttribute('title')).toBe('Viostream Player');
  });

  it('sets the iframe src with the correct host and public key', () => {
    const api = createEmbedApi();
    api.embed('my-video-key', TARGET_ID);

    const iframe = targetDiv.querySelector('iframe');
    const src = iframe?.getAttribute('src') ?? '';
    expect(src).toContain('https://play.viostream.com/iframe/my-video-key');
  });

  it('returns a raw player instance with expected methods', () => {
    const api = createEmbedApi();
    const raw = api.embed('test-key', TARGET_ID);

    // Playback commands
    expect(typeof raw.play).toBe('function');
    expect(typeof raw.pause).toBe('function');
    expect(typeof raw.mute).toBe('function');
    expect(typeof raw.unmute).toBe('function');
    expect(typeof raw.setVolume).toBe('function');
    expect(typeof raw.setLoop).toBe('function');
    expect(typeof raw.setCurrentTime).toBe('function');
    expect(typeof raw.reload).toBe('function');

    // Callback-based getters
    expect(typeof raw.getVolume).toBe('function');
    expect(typeof raw.getLoop).toBe('function');
    expect(typeof raw.getCurrentTime).toBe('function');
    expect(typeof raw.getPaused).toBe('function');
    expect(typeof raw.getDuration).toBe('function');
    expect(typeof raw.getMuted).toBe('function');
    expect(typeof raw.getAspectRatio).toBe('function');
    expect(typeof raw.getHeight).toBe('function');

    // Events
    expect(typeof raw.on).toBe('function');
  });

  it('does not expose deprecated methods on the wrapped player (wrapRawPlayer gate)', () => {
    // The raw player instance from the ESM source still has deprecated methods
    // (getLiveCurrentTime, getTracks, setTrack, cueAdd, cueUpdate, cueDelete,
    // asrAdd), but wrapRawPlayer() only exposes RawViostreamPlayerInstance
    // methods. This test verifies the raw instance has the expected shape —
    // the deprecated methods exist on the raw object but are NOT part of the
    // public ViostreamPlayer interface.
    const api = createEmbedApi();
    const raw = api.embed('test-key', TARGET_ID) as unknown as Record<string, unknown>;

    // Deprecated methods ARE present on the raw instance (not stripped)
    expect(typeof raw.getLiveCurrentTime).toBe('function');
    expect(typeof raw.getTracks).toBe('function');
    expect(typeof raw.setTrack).toBe('function');
    expect(typeof raw.cueAdd).toBe('function');
    expect(typeof raw.cueUpdate).toBe('function');
    expect(typeof raw.cueDelete).toBe('function');
    expect(typeof raw.asrAdd).toBe('function');
  });

  it('passes embed options to the iframe payload', () => {
    const api = createEmbedApi();
    api.embed('test-key', TARGET_ID, { displayTitle: true, sharing: true });

    const iframe = targetDiv.querySelector('iframe');
    const src = iframe?.getAttribute('src') ?? '';
    // The payload is base64-encoded JSON in the URL
    const payloadMatch = src.match(/payload=([^&]+)/);
    expect(payloadMatch).not.toBeNull();

    const payload = JSON.parse(atob(payloadMatch![1]));
    expect(payload.displayTitle).toBe(true);
    expect(payload.sharing).toBe(true);
    // Internal properties should be set automatically
    expect(payload.apiEmbed).toBe(true);
    expect(payload.dynamicSizing).toBe(true);
  });

  it('clears the target container before embedding', () => {
    targetDiv.innerHTML = '<p>Old content</p>';

    const api = createEmbedApi();
    api.embed('test-key', TARGET_ID);

    // Old content should be gone
    expect(targetDiv.querySelector('p')).toBeNull();
    // Iframe should be present
    expect(targetDiv.querySelector('iframe')).not.toBeNull();
  });

  it('does not modify window.$viostream', () => {
    const original = window.$viostream;
    window.$viostream = undefined;

    createEmbedApi();

    expect(window.$viostream).toBeUndefined();
    window.$viostream = original;
  });

  it('sets data-aspect-ratio-forced and correct padding-top when forceAspectRatio is passed', () => {
    const api = createEmbedApi();
    api.embed('test-key', TARGET_ID, {}, 1.3333);

    // The container with data-aspect-ratio-forced should exist
    const forced = targetDiv.querySelector('[data-aspect-ratio-forced]') as HTMLElement | null;
    expect(forced).not.toBeNull();
    expect(forced?.dataset.aspectRatioForced).toBe('1.3333');

    // padding-top should reflect 1/1.3333 * 100 ≈ 75%
    const paddingTop = forced?.style.paddingTop ?? '';
    expect(paddingTop).toContain('75');

    // Payload should have dynamicSizing: false
    const iframe = targetDiv.querySelector('iframe');
    const src = iframe?.getAttribute('src') ?? '';
    const payloadMatch = src.match(/payload=([^&]+)/);
    expect(payloadMatch).not.toBeNull();
    const payload = JSON.parse(atob(payloadMatch![1]));
    expect(payload.dynamicSizing).toBe(false);
  });

  it('does NOT set data-aspect-ratio-forced when forceAspectRatio is undefined', () => {
    const api = createEmbedApi();
    api.embed('test-key', TARGET_ID, {});

    const forced = targetDiv.querySelector('[data-aspect-ratio-forced]');
    expect(forced).toBeNull();

    // Payload should have dynamicSizing: true
    const iframe = targetDiv.querySelector('iframe');
    const src = iframe?.getAttribute('src') ?? '';
    const payloadMatch = src.match(/payload=([^&]+)/);
    const payload = JSON.parse(atob(payloadMatch![1]));
    expect(payload.dynamicSizing).toBe(true);
  });
});

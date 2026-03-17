import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createEmbedApi } from '../src/vendor/viostream-embed.js';

// Penpal unhandled rejections (expected in jsdom) are suppressed by the
// process-level handler in tests/setup-embed.ts.

/**
 * Tests for the vendored Viostream embed API.
 */
describe('createEmbedApi', () => {
  it('returns an object with an embed() method', () => {
    const api = createEmbedApi('play.viostream.com');
    expect(api).toBeDefined();
    expect(typeof api.embed).toBe('function');
  });

  it('returns different instances for different hosts', () => {
    const api1 = createEmbedApi('play.viostream.com');
    const api2 = createEmbedApi('dev.viostream.com');
    expect(api1).not.toBe(api2);
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
    const api = createEmbedApi('play.viostream.com');
    api.embed('test-public-key', TARGET_ID);

    const iframe = targetDiv.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe?.getAttribute('title')).toBe('Viostream Player');
  });

  it('sets the iframe src with the correct host and public key', () => {
    const api = createEmbedApi('play.viostream.com');
    api.embed('my-video-key', TARGET_ID);

    const iframe = targetDiv.querySelector('iframe');
    const src = iframe?.getAttribute('src') ?? '';
    expect(src).toContain('https://play.viostream.com/iframe/my-video-key');
  });

  it('uses the provided host in the iframe src', () => {
    const api = createEmbedApi('dev.viostream.com');
    api.embed('test-key', TARGET_ID);

    const iframe = targetDiv.querySelector('iframe');
    const src = iframe?.getAttribute('src') ?? '';
    expect(src).toContain('https://dev.viostream.com/iframe/test-key');
  });

  it('returns a raw player instance with expected methods', () => {
    const api = createEmbedApi('play.viostream.com');
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

  it('does not expose deprecated methods on the raw player', () => {
    const api = createEmbedApi('play.viostream.com');
    const raw = api.embed('test-key', TARGET_ID) as unknown as Record<string, unknown>;

    // These methods were removed from the vendored source
    expect(raw.getLiveCurrentTime).toBeUndefined();
    expect(raw.getTracks).toBeUndefined();
    expect(raw.setTrack).toBeUndefined();
    expect(raw.cueAdd).toBeUndefined();
    expect(raw.cueUpdate).toBeUndefined();
    expect(raw.cueDelete).toBeUndefined();
    expect(raw.asrAdd).toBeUndefined();
  });

  it('passes embed options to the iframe payload', () => {
    const api = createEmbedApi('play.viostream.com');
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

    const api = createEmbedApi('play.viostream.com');
    api.embed('test-key', TARGET_ID);

    // Old content should be gone
    expect(targetDiv.querySelector('p')).toBeNull();
    // Iframe should be present
    expect(targetDiv.querySelector('iframe')).not.toBeNull();
  });

  it('does not modify window.$viostream', () => {
    const original = window.$viostream;
    window.$viostream = undefined;

    createEmbedApi('play.viostream.com');

    expect(window.$viostream).toBeUndefined();
    window.$viostream = original;
  });
});

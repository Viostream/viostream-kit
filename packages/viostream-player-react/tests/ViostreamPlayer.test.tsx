import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { ViostreamPlayer } from '../src/ViostreamPlayer.js';

// Mock the core module so we control the embed API
vi.mock('@viostream/viostream-player-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@viostream/viostream-player-core')>();
  return {
    ...actual,
    getViostreamApi: vi.fn(),
    wrapRawPlayer: vi.fn(actual.wrapRawPlayer),
  };
});

import { getViostreamApi, wrapRawPlayer } from '@viostream/viostream-player-core';
import type { RawViostreamPlayerInstance, ViostreamEventHandler, ViostreamGlobal } from '@viostream/viostream-player-core';

const mockedGetViostreamApi = vi.mocked(getViostreamApi);
const mockedWrapRawPlayer = vi.mocked(wrapRawPlayer);

// ---------------------------------------------------------------------------
// Inline mock helpers (lightweight — full mocks live in player-core)
// ---------------------------------------------------------------------------

function createMockRawPlayer(): RawViostreamPlayerInstance {
  return {
    play: vi.fn(),
    pause: vi.fn(),
    mute: vi.fn(),
    unmute: vi.fn(),
    setVolume: vi.fn(),
    getVolume: vi.fn((cb: (v: number) => void) => cb(0.75)),
    setLoop: vi.fn(),
    getLoop: vi.fn((cb: (v: boolean) => void) => cb(false)),
    setCurrentTime: vi.fn(),
    getCurrentTime: vi.fn((cb: (v: number) => void) => cb(42.5)),
    getPaused: vi.fn((cb: (v: boolean) => void) => cb(true)),
    getDuration: vi.fn((cb: (v: number) => void) => cb(120)),
    getMuted: vi.fn((cb: (v: boolean) => void) => cb(false)),
    getAspectRatio: vi.fn((cb: (v: number) => void) => cb(1.7778)),
    getHeight: vi.fn((cb: (v: number) => void) => cb(360)),
    reload: vi.fn(),
    on: vi.fn(),
  };
}

function createMockViostreamGlobal() {
  const rawPlayer = createMockRawPlayer();
  const global: ViostreamGlobal = {
    embed: vi.fn(() => rawPlayer),
  };
  return Object.assign(global, { _rawPlayer: rawPlayer });
}

describe('ViostreamPlayer component', () => {
  let mockGlobal: ReturnType<typeof createMockViostreamGlobal>;

  beforeEach(() => {
    mockGlobal = createMockViostreamGlobal();
    // By default, getViostreamApi returns the mock global synchronously
    mockedGetViostreamApi.mockReturnValue(mockGlobal);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // Rendering
  // -----------------------------------------------------------------------
  describe('rendering', () => {
    it('renders a container div with data-viostream-player attribute', () => {
      const { container } = render(
        <ViostreamPlayer accountKey="vc-test" publicKey="pk-test" />
      );
      const el = container.querySelector('[data-viostream-player]');
      expect(el).not.toBeNull();
    });

    it('sets data-viostream-public-key attribute on the container', () => {
      const { container } = render(
        <ViostreamPlayer accountKey="vc-test" publicKey="my-public-key" />
      );
      const el = container.querySelector('[data-viostream-player]');
      expect(el?.getAttribute('data-viostream-public-key')).toBe('my-public-key');
    });

    it('sets data-viostream-sdk attribute with package name and version', () => {
      const { container } = render(
        <ViostreamPlayer accountKey="vc-test" publicKey="pk-test" />
      );
      const el = container.querySelector('[data-viostream-player]');
      const sdkAttr = el?.getAttribute('data-viostream-sdk');
      expect(sdkAttr).toMatch(/^viostream-player-react@\d+\.\d+\.\d+$/);
    });

    it('applies custom CSS class to the container', () => {
      const { container } = render(
        <ViostreamPlayer accountKey="vc-test" publicKey="pk-test" className="my-custom-class" />
      );
      const el = container.querySelector('[data-viostream-player]');
      expect(el?.classList.contains('my-custom-class')).toBe(true);
    });

    it('generates a unique ID for the container', () => {
      const { container } = render(
        <ViostreamPlayer accountKey="vc-test" publicKey="pk-test" />
      );
      const el = container.querySelector('[data-viostream-player]');
      expect(el?.id).toMatch(/^viostream-player-.+$/);
    });

    it('renders a nested embed target div inside the container', () => {
      const { container } = render(
        <ViostreamPlayer accountKey="vc-test" publicKey="pk-test" />
      );
      const outer = container.querySelector('[data-viostream-player]');
      const embedTarget = container.querySelector('[data-viostream-embed-target]');
      expect(embedTarget).not.toBeNull();
      expect(embedTarget?.id).toMatch(/^viostream-embed-.+$/);
      expect(outer?.contains(embedTarget)).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // Script loading
  // -----------------------------------------------------------------------
  describe('API initialization', () => {
    it('calls getViostreamApi to get the embed API', async () => {
      render(
        <ViostreamPlayer accountKey="vc-my-account" publicKey="pk-test" />
      );

      await vi.waitFor(() => {
        expect(mockedGetViostreamApi).toHaveBeenCalled();
      });
    });

    it('calls api.embed with publicKey and embed target id', async () => {
      const { container } = render(
        <ViostreamPlayer accountKey="vc-test" publicKey="my-video-key" />
      );

      await vi.waitFor(() => {
        expect(mockGlobal.embed).toHaveBeenCalledOnce();
      });

      const [publicKey, targetId] = (mockGlobal.embed as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(publicKey).toBe('my-video-key');
      expect(typeof targetId).toBe('string');

      // The target id should match the nested embed target div, not the outer container
      const embedTarget = container.querySelector('[data-viostream-embed-target]');
      expect(embedTarget).not.toBeNull();
      expect(targetId).toBe(embedTarget?.id);

      // The embed target should be a child of the outer container
      const outerContainer = container.querySelector('[data-viostream-player]');
      expect(outerContainer?.contains(embedTarget)).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // Embed options passthrough
  // -----------------------------------------------------------------------
  describe('embed options', () => {
    it('passes embed options to api.embed()', async () => {
      render(
        <ViostreamPlayer
          accountKey="vc-test"
          publicKey="pk-test"
          displayTitle={true}
          sharing={true}
          speedSelector={true}
          hlsQualitySelector={false}
          chapters={true}
          chapterSlug="chapter-2"
          startTime="30"
          transcriptDownload={true}
        />
      );

      await vi.waitFor(() => {
        expect(mockGlobal.embed).toHaveBeenCalledOnce();
      });

      const options = (mockGlobal.embed as ReturnType<typeof vi.fn>).mock.calls[0][2];
      expect(options).toEqual({
        displayTitle: true,
        sharing: true,
        speedSelector: true,
        hlsQualitySelector: false,
        chapters: true,
        chapterSlug: 'chapter-2',
        startTime: '30',
        transcriptDownload: true,
      });
    });

    it('omits undefined options', async () => {
      render(
        <ViostreamPlayer
          accountKey="vc-test"
          publicKey="pk-test"
          displayTitle={true}
        />
      );

      await vi.waitFor(() => {
        expect(mockGlobal.embed).toHaveBeenCalledOnce();
      });

      const options = (mockGlobal.embed as ReturnType<typeof vi.fn>).mock.calls[0][2];
      expect(options).toEqual({ displayTitle: true });
      expect(options).not.toHaveProperty('sharing');
      expect(options).not.toHaveProperty('chapters');
    });
  });

  // -----------------------------------------------------------------------
  // Player ready callback
  // -----------------------------------------------------------------------
  describe('onPlayerReady', () => {
    it('calls onPlayerReady with the wrapped player', async () => {
      const onPlayerReady = vi.fn();

      render(
        <ViostreamPlayer
          accountKey="vc-test"
          publicKey="pk-test"
          onPlayerReady={onPlayerReady}
        />
      );

      await vi.waitFor(() => {
        expect(onPlayerReady).toHaveBeenCalledOnce();
      });

      const player = onPlayerReady.mock.calls[0][0];
      expect(player).toBeDefined();
      expect(typeof player.play).toBe('function');
      expect(typeof player.pause).toBe('function');
      expect(typeof player.on).toBe('function');
      expect(typeof player.destroy).toBe('function');
    });
  });

  // -----------------------------------------------------------------------
  // Error handling
  // -----------------------------------------------------------------------
  describe('error handling', () => {
    it('displays error message when getViostreamApi throws', async () => {
      mockedGetViostreamApi.mockImplementation(() => { throw new Error('Network failure'); });

      const { container } = render(
        <ViostreamPlayer accountKey="vc-test" publicKey="pk-test" />
      );

      await vi.waitFor(() => {
        const errorEl = container.querySelector('[data-viostream-error]');
        expect(errorEl).not.toBeNull();
        expect(errorEl?.textContent).toContain('Network failure');
      });
    });

    it('displays error for non-Error throw values', async () => {
      mockedGetViostreamApi.mockImplementation(() => { throw 'string error'; });

      const { container } = render(
        <ViostreamPlayer accountKey="vc-test" publicKey="pk-test" />
      );

      await vi.waitFor(() => {
        const errorEl = container.querySelector('[data-viostream-error]');
        expect(errorEl).not.toBeNull();
        expect(errorEl?.textContent).toContain('string error');
      });
    });

    it('uses renderError prop when provided', async () => {
      mockedGetViostreamApi.mockImplementation(() => { throw new Error('Custom error'); });

      const { container } = render(
        <ViostreamPlayer
          accountKey="vc-test"
          publicKey="pk-test"
          renderError={(msg) => <div data-custom-error>{msg}</div>}
        />
      );

      await vi.waitFor(() => {
        const errorEl = container.querySelector('[data-custom-error]');
        expect(errorEl).not.toBeNull();
        expect(errorEl?.textContent).toBe('Custom error');
      });
    });
  });

  // -----------------------------------------------------------------------
  // Render props
  // -----------------------------------------------------------------------
  describe('render props', () => {
    it('does not render loading content after player is ready', async () => {
      const { container } = render(
        <ViostreamPlayer
          accountKey="vc-test"
          publicKey="pk-test"
          renderLoading={() => <div data-loading>Loading...</div>}
        />
      );

      await vi.waitFor(() => {
        expect(mockGlobal.embed).toHaveBeenCalledOnce();
      });

      const loadingEl = container.querySelector('[data-loading]');
      expect(loadingEl).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // Cleanup on unmount
  // -----------------------------------------------------------------------
  describe('cleanup', () => {
    it('destroys the player when the component unmounts', async () => {
      const onPlayerReady = vi.fn();

      const { unmount } = render(
        <ViostreamPlayer
          accountKey="vc-test"
          publicKey="pk-test"
          onPlayerReady={onPlayerReady}
        />
      );

      await vi.waitFor(() => {
        expect(onPlayerReady).toHaveBeenCalledOnce();
      });

      const player = onPlayerReady.mock.calls[0][0];

      // Spy on destroy
      const destroySpy = vi.spyOn(player, 'destroy');

      unmount();

      expect(destroySpy).toHaveBeenCalledOnce();
    });
  });

  // -----------------------------------------------------------------------
  // DOM readiness (ref callback gating)
  // -----------------------------------------------------------------------
  describe('DOM readiness', () => {
    it('only calls api.embed after the container ref callback fires', async () => {
      // loadViostream resolves immediately (simulating a cached/fast-path load).
      // The component must still wait for the ref callback before embedding.
      const onPlayerReady = vi.fn();

      render(
        <ViostreamPlayer
          accountKey="vc-test"
          publicKey="pk-test"
          onPlayerReady={onPlayerReady}
        />
      );

      await vi.waitFor(() => {
        expect(onPlayerReady).toHaveBeenCalledOnce();
      });

      // The embed target element must exist in the DOM when embed is called
      const [, targetId] = (mockGlobal.embed as ReturnType<typeof vi.fn>).mock.calls[0];
      const embedTarget = document.getElementById(targetId);
      expect(embedTarget).not.toBeNull();
      expect(embedTarget?.hasAttribute('data-viostream-embed-target')).toBe(true);
    });
  });
});

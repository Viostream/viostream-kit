import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { ViostreamPlayer } from '../ViostreamPlayer.js';

// Mock the core module so we control when/how loadViostream resolves
vi.mock('@viostream/viostream-player-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@viostream/viostream-player-core')>();
  return {
    ...actual,
    loadViostream: vi.fn(),
    wrapRawPlayer: vi.fn(actual.wrapRawPlayer),
  };
});

import { loadViostream, wrapRawPlayer } from '@viostream/viostream-player-core';
import type { RawViostreamPlayerInstance, ViostreamEventHandler, ViostreamGlobal } from '@viostream/viostream-player-core';

const mockedLoadViostream = vi.mocked(loadViostream);
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
    // By default, loadViostream resolves immediately with the mock global
    mockedLoadViostream.mockResolvedValue(mockGlobal);
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
  });

  // -----------------------------------------------------------------------
  // Script loading
  // -----------------------------------------------------------------------
  describe('script loading', () => {
    it('calls loadViostream with the provided account key', async () => {
      render(
        <ViostreamPlayer accountKey="vc-my-account" publicKey="pk-test" />
      );

      await vi.waitFor(() => {
        expect(mockedLoadViostream).toHaveBeenCalledWith('vc-my-account');
      });
    });

    it('calls api.embed with publicKey and container id', async () => {
      const { container } = render(
        <ViostreamPlayer accountKey="vc-test" publicKey="my-video-key" />
      );

      await vi.waitFor(() => {
        expect(mockGlobal.embed).toHaveBeenCalledOnce();
      });

      const [publicKey, targetId] = (mockGlobal.embed as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(publicKey).toBe('my-video-key');
      expect(typeof targetId).toBe('string');

      // The target id should match the container's id
      const el = container.querySelector('[data-viostream-player]');
      expect(targetId).toBe(el?.id);
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
    it('displays error message when loadViostream rejects', async () => {
      mockedLoadViostream.mockRejectedValue(new Error('Network failure'));

      const { container } = render(
        <ViostreamPlayer accountKey="vc-test" publicKey="pk-test" />
      );

      await vi.waitFor(() => {
        const errorEl = container.querySelector('[data-viostream-error]');
        expect(errorEl).not.toBeNull();
        expect(errorEl?.textContent).toContain('Network failure');
      });
    });

    it('displays error for non-Error rejection values', async () => {
      mockedLoadViostream.mockRejectedValue('string error');

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
      mockedLoadViostream.mockRejectedValue(new Error('Custom error'));

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
    it('renders loading content from renderLoading prop', () => {
      // Make loadViostream never resolve so we stay in loading state
      mockedLoadViostream.mockReturnValue(new Promise(() => {}));

      const { container } = render(
        <ViostreamPlayer
          accountKey="vc-test"
          publicKey="pk-test"
          renderLoading={() => <div data-loading>Loading player...</div>}
        />
      );

      const loadingEl = container.querySelector('[data-loading]');
      expect(loadingEl).not.toBeNull();
      expect(loadingEl?.textContent).toBe('Loading player...');
    });

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
  // DOM readiness (hard-refresh race condition)
  // -----------------------------------------------------------------------
  describe('DOM readiness', () => {
    it('waits for container element before calling api.embed when DOM is not yet available', async () => {
      // Simulate the hard-refresh scenario where loadViostream resolves
      // synchronously from cache, but the container element is not yet
      // in the DOM. The component should defer via requestAnimationFrame
      // and successfully embed once the DOM is ready.

      const originalGetElementById = document.getElementById.bind(document);
      let callCount = 0;

      // First call to getElementById for our container returns null (simulating
      // the race condition), subsequent calls return the real element.
      const getByIdSpy = vi.spyOn(document, 'getElementById').mockImplementation((id: string) => {
        const el = originalGetElementById(id);
        if (id.startsWith('viostream-player-') && callCount === 0) {
          callCount++;
          return null;
        }
        return el;
      });

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

      // Verify embed was still called successfully
      expect(mockGlobal.embed).toHaveBeenCalledOnce();

      getByIdSpy.mockRestore();
    });

    it('does not call api.embed if destroyed during rAF wait', async () => {
      const originalGetElementById = document.getElementById.bind(document);

      // Always return null for the container to force the rAF path
      const getByIdSpy = vi.spyOn(document, 'getElementById').mockImplementation((id: string) => {
        if (id.startsWith('viostream-player-')) {
          return null;
        }
        return originalGetElementById(id);
      });

      const { unmount } = render(
        <ViostreamPlayer
          accountKey="vc-test"
          publicKey="pk-test"
        />
      );

      // Unmount immediately — the component should abort during the rAF wait
      unmount();

      // Give time for any pending rAF callbacks to fire
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      await vi.waitFor(() => {});

      // embed should never have been called because we destroyed before it could run
      expect(mockGlobal.embed).not.toHaveBeenCalled();

      getByIdSpy.mockRestore();
    });
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ViostreamPlayerComponent } from '../viostream-player.component';

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
    getLiveCurrentTime: vi.fn((cb: (v: number) => void) => cb(0)),
    getHeight: vi.fn((cb: (v: number) => void) => cb(360)),
    reload: vi.fn(),
    getTracks: vi.fn((cb: (v: never[]) => void) => cb([])),
    setTrack: vi.fn(),
    cueAdd: vi.fn(),
    cueUpdate: vi.fn(),
    cueDelete: vi.fn(),
    asrAdd: vi.fn(),
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

describe('ViostreamPlayerComponent', () => {
  let mockGlobal: ReturnType<typeof createMockViostreamGlobal>;
  let fixture: ComponentFixture<ViostreamPlayerComponent>;

  beforeEach(async () => {
    mockGlobal = createMockViostreamGlobal();
    mockedLoadViostream.mockResolvedValue(mockGlobal);

    await TestBed.configureTestingModule({
      imports: [ViostreamPlayerComponent],
    }).compileComponents();
  });

  afterEach(() => {
    vi.clearAllMocks();
    fixture?.destroy();
  });

  function createComponent(inputs: { accountKey: string; publicKey: string; [key: string]: unknown }): ComponentFixture<ViostreamPlayerComponent> {
    fixture = TestBed.createComponent(ViostreamPlayerComponent);
    const component = fixture.componentInstance;
    // Set inputs directly as properties (works with @Input() decorators in JIT mode)
    Object.assign(component, inputs);
    fixture.detectChanges();
    return fixture;
  }

  // -----------------------------------------------------------------------
  // Rendering
  // -----------------------------------------------------------------------
  describe('rendering', () => {
    it('renders a container div with data-viostream-player attribute', () => {
      const { nativeElement } = createComponent({ accountKey: 'vc-test', publicKey: 'pk-test' });
      const el = nativeElement.querySelector('[data-viostream-player]');
      expect(el).not.toBeNull();
    });

    it('sets data-viostream-public-key attribute on the container', () => {
      const { nativeElement } = createComponent({ accountKey: 'vc-test', publicKey: 'my-public-key' });
      const el = nativeElement.querySelector('[data-viostream-player]');
      expect(el?.getAttribute('data-viostream-public-key')).toBe('my-public-key');
    });

    it('applies custom CSS class to the container', () => {
      const { nativeElement } = createComponent({ accountKey: 'vc-test', publicKey: 'pk-test', cssClass: 'my-custom-class' });
      const el = nativeElement.querySelector('[data-viostream-player]');
      expect(el?.classList.contains('my-custom-class')).toBe(true);
    });

    it('generates a unique ID for the container', () => {
      const { nativeElement } = createComponent({ accountKey: 'vc-test', publicKey: 'pk-test' });
      const el = nativeElement.querySelector('[data-viostream-player]');
      expect(el?.id).toMatch(/^viostream-player-[a-z0-9]+$/);
    });
  });

  // -----------------------------------------------------------------------
  // Script loading
  // -----------------------------------------------------------------------
  describe('script loading', () => {
    it('calls loadViostream with the provided account key', async () => {
      createComponent({ accountKey: 'vc-my-account', publicKey: 'pk-test' });

      await vi.waitFor(() => {
        expect(mockedLoadViostream).toHaveBeenCalledWith('vc-my-account');
      });
    });

    it('calls api.embed with publicKey and container id', async () => {
      const { nativeElement } = createComponent({ accountKey: 'vc-test', publicKey: 'my-video-key' });

      await vi.waitFor(() => {
        expect(mockGlobal.embed).toHaveBeenCalledOnce();
      });

      const [publicKey, targetId] = (mockGlobal.embed as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(publicKey).toBe('my-video-key');
      expect(typeof targetId).toBe('string');

      // The target id should match the container's id
      const el = nativeElement.querySelector('[data-viostream-player]');
      expect(targetId).toBe(el?.id);
    });
  });

  // -----------------------------------------------------------------------
  // Embed options passthrough
  // -----------------------------------------------------------------------
  describe('embed options', () => {
    it('passes embed options to api.embed()', async () => {
      createComponent({
        accountKey: 'vc-test',
        publicKey: 'pk-test',
        displayTitle: true,
        sharing: true,
        speedSelector: true,
        hlsQualitySelector: false,
        chapters: true,
        chapterDisplayType: 'progressbar' as const,
        chapterSlug: 'chapter-2',
        startTime: '30',
        transcriptDownload: true,
      });

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
        chapterDisplayType: 'progressbar',
        chapterSlug: 'chapter-2',
        startTime: '30',
        transcriptDownload: true,
      });
    });

    it('omits undefined options', async () => {
      createComponent({
        accountKey: 'vc-test',
        publicKey: 'pk-test',
        displayTitle: true,
      });

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
  // playerReady output
  // -----------------------------------------------------------------------
  describe('playerReady output', () => {
    it('emits playerReady with the wrapped player', async () => {
      const playerReadySpy = vi.fn();
      const { componentInstance } = createComponent({ accountKey: 'vc-test', publicKey: 'pk-test' });
      componentInstance.playerReady.subscribe(playerReadySpy);

      await vi.waitFor(() => {
        expect(playerReadySpy).toHaveBeenCalledOnce();
      });

      const player = playerReadySpy.mock.calls[0][0];
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

      const { nativeElement } = createComponent({ accountKey: 'vc-test', publicKey: 'pk-test' });

      await vi.waitFor(() => {
        fixture.detectChanges();
        const errorEl = nativeElement.querySelector('[data-viostream-error]');
        expect(errorEl).not.toBeNull();
        expect(errorEl?.textContent).toContain('Network failure');
      });
    });

    it('displays error for non-Error rejection values', async () => {
      mockedLoadViostream.mockRejectedValue('string error');

      const { nativeElement } = createComponent({ accountKey: 'vc-test', publicKey: 'pk-test' });

      await vi.waitFor(() => {
        fixture.detectChanges();
        const errorEl = nativeElement.querySelector('[data-viostream-error]');
        expect(errorEl).not.toBeNull();
        expect(errorEl?.textContent).toContain('string error');
      });
    });
  });

  // -----------------------------------------------------------------------
  // Cleanup on destroy
  // -----------------------------------------------------------------------
  describe('cleanup', () => {
    it('destroys the player when the component is destroyed', async () => {
      const playerReadySpy = vi.fn();
      const { componentInstance } = createComponent({ accountKey: 'vc-test', publicKey: 'pk-test' });
      componentInstance.playerReady.subscribe(playerReadySpy);

      await vi.waitFor(() => {
        expect(playerReadySpy).toHaveBeenCalledOnce();
      });

      const player = playerReadySpy.mock.calls[0][0];

      // Spy on destroy
      const destroySpy = vi.spyOn(player, 'destroy');

      fixture.destroy();

      expect(destroySpy).toHaveBeenCalledOnce();
    });
  });
});

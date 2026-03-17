/**
 * Smoke tests for @viostream/viostream-player-react installed from a tarball.
 *
 * These tests verify that the published package works correctly when consumed
 * as an external dependency — no workspace symlinks, no source access.
 * If these tests fail, consumers installing from npm will experience the same
 * breakage.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import * as fs from 'fs';
import * as path from 'path';

// -----------------------------------------------------------------------
// Helper: find the root of an installed package via node_modules
// -----------------------------------------------------------------------
function findPackageRoot(packageName: string): string {
  // Construct the expected node_modules path relative to this test file
  const segments = packageName.startsWith('@')
    ? packageName.split('/')
    : [packageName];
  return path.resolve(__dirname, 'node_modules', ...segments);
}

// -----------------------------------------------------------------------
// 1. Verify that public exports resolve from the tarball
// -----------------------------------------------------------------------

describe('public exports', () => {
  it('exports ViostreamPlayer component', async () => {
    const mod = await import('@viostream/viostream-player-react');
    expect(mod.ViostreamPlayer).toBeDefined();
    expect(typeof mod.ViostreamPlayer).toBe('function');
  });

  it('re-exports createViostreamPlayer from core', async () => {
    const mod = await import('@viostream/viostream-player-react');
    expect(mod.createViostreamPlayer).toBeDefined();
    expect(typeof mod.createViostreamPlayer).toBe('function');
  });

  it('re-exports loadViostream from core', async () => {
    const mod = await import('@viostream/viostream-player-react');
    expect(mod.loadViostream).toBeDefined();
    expect(typeof mod.loadViostream).toBe('function');
  });

  it('does NOT export internal-only symbols', async () => {
    const mod = await import('@viostream/viostream-player-react') as Record<string, unknown>;
    // wrapRawPlayer and RawViostreamPlayerInstance should NOT be re-exported
    expect(mod.wrapRawPlayer).toBeUndefined();
  });
});

// -----------------------------------------------------------------------
// 2. Verify that the component renders without crashing
// -----------------------------------------------------------------------

// Mock loadViostream so we don't make real network requests.
// The compiled ViostreamPlayer.js imports from '@viostream/viostream-player-core',
// so we mock that module to intercept those calls.
vi.mock('@viostream/viostream-player-core', async (importOriginal) => {
  const original = await importOriginal<typeof import('@viostream/viostream-player-core')>();

  const mockRawPlayer = {
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

  const mockApi = {
    embed: vi.fn(() => mockRawPlayer),
  };

  return {
    ...original,
    loadViostream: vi.fn(() => Promise.resolve(mockApi)),
  };
});

// Import *after* mock setup so the mock is active
const { ViostreamPlayer } = await import('@viostream/viostream-player-react');
const core = await import('@viostream/viostream-player-core');

describe('ViostreamPlayer component (from tarball)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a container div with data-viostream-player attribute', () => {
    render(
      React.createElement(ViostreamPlayer, {
        accountKey: 'vc-test',
        publicKey: 'abc123',
      }),
    );

    const container = document.querySelector('[data-viostream-player]');
    expect(container).toBeInTheDocument();
  });

  it('sets the data-viostream-public-key attribute', () => {
    render(
      React.createElement(ViostreamPlayer, {
        accountKey: 'vc-test',
        publicKey: 'my-public-key',
      }),
    );

    const container = document.querySelector('[data-viostream-public-key="my-public-key"]');
    expect(container).toBeInTheDocument();
  });

  it('applies a custom className', () => {
    render(
      React.createElement(ViostreamPlayer, {
        accountKey: 'vc-test',
        publicKey: 'abc123',
        className: 'custom-class',
      }),
    );

    const container = document.querySelector('[data-viostream-player]');
    expect(container).toHaveClass('custom-class');
  });

  it('renders loading content via renderLoading prop', () => {
    render(
      React.createElement(ViostreamPlayer, {
        accountKey: 'vc-test',
        publicKey: 'abc123',
        renderLoading: () => React.createElement('span', { 'data-testid': 'loading' }, 'Loading...'),
      }),
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('calls onPlayerReady when the player is ready', async () => {
    const onPlayerReady = vi.fn();

    render(
      React.createElement(ViostreamPlayer, {
        accountKey: 'vc-test',
        publicKey: 'abc123',
        onPlayerReady,
      }),
    );

    // The mock loadViostream resolves immediately, but the component's useEffect
    // runs asynchronously. Wait for the callback to fire.
    await waitFor(() => {
      expect(onPlayerReady).toHaveBeenCalledTimes(1);
    });

    const player = onPlayerReady.mock.calls[0][0];
    expect(typeof player.play).toBe('function');
    expect(typeof player.pause).toBe('function');
    expect(typeof player.on).toBe('function');
    expect(typeof player.destroy).toBe('function');
  });

  it('shows error message when loadViostream fails', async () => {
    // Override the mock for this single test
    vi.mocked(core.loadViostream).mockRejectedValueOnce(new Error('Network failure'));

    render(
      React.createElement(ViostreamPlayer, {
        accountKey: 'vc-test',
        publicKey: 'abc123',
      }),
    );

    await waitFor(() => {
      const errorEl = document.querySelector('[data-viostream-error]');
      expect(errorEl).toBeInTheDocument();
      expect(errorEl!.textContent).toContain('Network failure');
    });
  });
});

// -----------------------------------------------------------------------
// 3. Verify no test/dev artifacts leaked into the package
// -----------------------------------------------------------------------

describe('package hygiene', () => {
  it('does not include test artifacts in the react package', () => {
    const pkgRoot = findPackageRoot('@viostream/viostream-player-react');
    const testsDir = path.join(pkgRoot, 'dist', 'tests');
    expect(fs.existsSync(testsDir)).toBe(false);
  });

  it('does not include test artifacts in the core package', () => {
    const pkgRoot = findPackageRoot('@viostream/viostream-player-core');
    const testsDir = path.join(pkgRoot, 'dist', 'tests');
    expect(fs.existsSync(testsDir)).toBe(false);
  });
});

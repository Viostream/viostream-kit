import { describe, it, expect } from 'vitest';

/**
 * Tests that the barrel export file re-exports everything correctly.
 */
describe('index.ts barrel exports', () => {
  it('exports the ViostreamPlayerComponent', async () => {
    const mod = await import('../index');
    expect(mod.ViostreamPlayerComponent).toBeDefined();
  });

  it('exports createViostreamPlayer function from core', async () => {
    const mod = await import('../index');
    expect(mod.createViostreamPlayer).toBeDefined();
    expect(typeof mod.createViostreamPlayer).toBe('function');
  });

  it('exports loadViostream function from core', async () => {
    const mod = await import('../index');
    expect(mod.loadViostream).toBeDefined();
    expect(typeof mod.loadViostream).toBe('function');
  });

  it('does not export internal-only symbols', async () => {
    const mod = await import('../index') as Record<string, unknown>;
    expect(mod.wrapRawPlayer).toBeUndefined();
  });
});

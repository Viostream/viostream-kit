import { describe, it, expect } from 'vitest';

/**
 * Tests that the barrel export file re-exports everything correctly.
 */
describe('index.ts barrel exports', () => {
  it('exports the ViostreamPlayer component', async () => {
    const mod = await import('$lib/index.js');
    expect(mod.ViostreamPlayer).toBeDefined();
  });

  it('exports createViostreamPlayer function from core', async () => {
    const mod = await import('$lib/index.js');
    expect(mod.createViostreamPlayer).toBeDefined();
    expect(typeof mod.createViostreamPlayer).toBe('function');
  });

  it('exports wrapRawPlayer function from core', async () => {
    const mod = await import('$lib/index.js');
    expect(mod.wrapRawPlayer).toBeDefined();
    expect(typeof mod.wrapRawPlayer).toBe('function');
  });

  it('exports loadViostream function from core', async () => {
    const mod = await import('$lib/index.js');
    expect(mod.loadViostream).toBeDefined();
    expect(typeof mod.loadViostream).toBe('function');
  });
});

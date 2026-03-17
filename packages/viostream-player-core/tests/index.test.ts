import { describe, it, expect } from 'vitest';
import { createViostreamPlayer, loadViostream, getViostreamApi } from '../src/index.js';

describe('barrel exports (index)', () => {
  it('exports createViostreamPlayer function', () => {
    expect(typeof createViostreamPlayer).toBe('function');
  });

  it('exports loadViostream function (deprecated)', () => {
    expect(typeof loadViostream).toBe('function');
  });

  it('exports getViostreamApi function', () => {
    expect(typeof getViostreamApi).toBe('function');
  });
});

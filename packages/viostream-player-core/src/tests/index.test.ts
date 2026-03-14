import { describe, it, expect } from 'vitest';
import { createViostreamPlayer, loadViostream } from '../index.js';

describe('barrel exports (index)', () => {
  it('exports createViostreamPlayer function', () => {
    expect(typeof createViostreamPlayer).toBe('function');
  });

  it('exports loadViostream function', () => {
    expect(typeof loadViostream).toBe('function');
  });
});

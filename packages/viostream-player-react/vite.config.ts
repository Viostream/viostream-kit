/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    include: ['tests/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
    globals: true,
  },
});

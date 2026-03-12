/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    environment: 'jsdom',
    setupFiles: ['src/tests/setup.ts'],
    globals: true,
  },
});

import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    include: ['tests/**/*.{test,spec}.{js,ts}'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['tests/setup-embed.ts'],
  },
});

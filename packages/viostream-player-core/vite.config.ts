import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    environment: 'jsdom',
    globals: true,
  },
});

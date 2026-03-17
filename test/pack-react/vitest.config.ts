import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./setup.ts'],
    include: ['*.test.{ts,tsx}'],
    // Ensure Vitest processes @viostream packages so vi.mock() can intercept
    // imports from within the compiled node_modules code.
    server: {
      deps: {
        inline: [
          '@viostream/viostream-player-react',
          '@viostream/viostream-player-core',
        ],
      },
    },
  },
});

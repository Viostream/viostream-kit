/// <reference types="vitest/config" />
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { svelteTesting } from '@testing-library/svelte/vite';

export default defineConfig({
	plugins: [sveltekit(), svelteTesting()],
	test: {
		include: ['tests/**/*.{test,spec}.{js,ts}'],
		environment: 'jsdom',
		setupFiles: ['tests/setup.ts'],
		globals: true
	}
});

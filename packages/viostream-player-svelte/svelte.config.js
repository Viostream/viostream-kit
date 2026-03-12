import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		// Library-only package — no adapter needed.
		// SvelteKit is used only for svelte-kit sync and svelte-check.
	}
};

export default config;

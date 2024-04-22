import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [svelte({ hot: !process.env.VITEST })],
	test: {
		globals: true,
		environment: 'jsdom',
		coverage: {
			provider: 'v8',
			all: true,
			include: ['src/internal/util/*.ts', 'src/core/*.ts'],
		},
		// include: ['src/__test__/internal/util/isFormValid.test.ts']
	},
});

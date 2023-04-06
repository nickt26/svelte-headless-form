import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [svelte({ hot: !process.env.VITEST })],
	test: {
		globals: true,
		environment: 'jsdom',
		coverage: {
			all: true,
			include: ['src/internal/util.ts', 'src/core/*.ts']
		}
	},
	resolve: {
		alias: {
			src: path.resolve('src')
		}
	}
});

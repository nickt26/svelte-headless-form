import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [svelte({ hot: !process.env.VITEST }), svelteTesting()],
	test: {
		globals: true,
		environment: 'jsdom',
		coverage: {
			provider: 'v8',
			all: true,
			include: ['src/internal/util/', 'src/core/'],
			thresholds: {
				branches: 100,
				functions: 100,
				lines: 100,
				statements: 100,
				perFile: true,
			},
		},
		// include: ['src/__test__/internal/util/isFormValid.test.ts']
		setupFiles: ['src/__test__/setupTests.ts'],
		testTimeout: 20000,
	},
});

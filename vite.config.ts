import { resolve } from 'path';
import type { UserConfig } from 'vite';

const config: UserConfig = {
	build: {
		lib: {
			entry: resolve(__dirname, 'dist/index.js'),
			fileName: (format) => (format === 'es' ? 'index.mjs' : 'index.cjs'),
			formats: ['es', 'cjs'],
		},
	},
};

export default config;

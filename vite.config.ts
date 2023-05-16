import { resolve } from 'path';
import type { UserConfig } from 'vite';

const config: UserConfig = {
	build: {
		lib: {
			entry: resolve(__dirname, 'dist/index.js'),
			name: 'svelte-headless-form',
			fileName: 'svelte-headless-form',
		},
	},
};

export default config;

import path from 'path';
import type { UserConfig } from 'vite';

const config: UserConfig = {
	resolve: {
		alias: {
			lib: path.resolve('src')
		}
	}
};

export default config;

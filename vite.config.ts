import path from 'path';
import type { UserConfig } from 'vite';

const config: UserConfig = {
	resolve: {
		alias: {
			src: path.resolve('src')
		}
	}
};

export default config;

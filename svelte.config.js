import adapter from '@sveltejs/adapter-netlify';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		adapter: adapter(),
		csp: {
			mode: 'hash',
			directives: {
				'default-src': ['none'],
				'script-src': ['self'],
				'manifest-src': ['self'],
				'style-src': ['unsafe-inline', 'self'],
				'img-src': ['self', 'data:'],
				'connect-src': [
					'self',
					'https://sejiwo.com',
					'https://asia-southeast1-monarch-public.cloudfunctions.net'
				]
			}
		}
	}
};

export default config;

import adapter from '@sveltejs/adapter-auto';
import sveltePreprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */

const mode = process.env.NODE_ENV;
const dev = mode === 'development';

const config = {
	kit: {
		adapter: adapter()
	},
	preprocess: sveltePreprocess({
		sourceMap: dev,
		pug: true,
		postcss: true,
	})
};

export default config;

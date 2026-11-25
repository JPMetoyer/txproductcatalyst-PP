import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: `@use '$lib/styles/tokens' as *;\n`
			}
		}
	},
	test: { include: ['src/**/*.test.ts'] }
});

// Integration tests that hit the real Supabase project (needs .env + `npm run db:seed`).
// Kept separate from unit tests so `npm test` stays fast and offline.
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => ({
	test: {
		include: ['tests/rls/**/*.test.ts'],
		env: loadEnv(mode, process.cwd(), ''),
		testTimeout: 30_000,
		fileParallelism: false
	}
}));

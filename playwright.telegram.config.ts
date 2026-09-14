import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: 'e2e',
	testMatch: 'telegram.test.ts',
	use: { baseURL: 'http://127.0.0.1:4174' },
	webServer: {
		command: 'npm run dev -- --host 127.0.0.1 --port 4174',
		url: 'http://127.0.0.1:4174',
		env: { PUBLIC_TELEGRAM_ENABLED: 'true' }
	}
});

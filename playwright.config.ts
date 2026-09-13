import { defineConfig } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:4173';
const port = Number(new URL(baseURL).port || 4173);

export default defineConfig({
	use: { baseURL },
	webServer: {
		command: `npm run build && npm run preview -- --port ${port}`,
		url: baseURL
	},
	testDir: 'e2e'
});

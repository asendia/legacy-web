/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173
	},
	// playwright ignore directory included in .gitignore
	testDir: 'tests-out',
	timeout: 5000,
	workers: process.env.CI ? 2 : undefined,
	use: {
		headless: true
	}
};

export default config;

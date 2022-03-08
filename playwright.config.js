/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  webServer: {
    command: 'npm run build && npm run preview',
    port: 3000,
  },
  // playwright ignore directory included in .gitignore
  testDir: 'tests-out',
};

export default config;

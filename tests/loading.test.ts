import test, { expect } from '@playwright/test';
import {
  corsHeadersAllow,
  delay,
  failOnAnyError,
  generateAuthURL,
  mockIdentityUserAPI,
  mockMessageAPI,
} from './core.test.js';

test('slow api', async ({ page }) => {
  failOnAnyError(page);
  const slowWaitTime = 1000;
  const token = 'secretjwt2';
  const email = 'test@warisin.com';
  const fullname = 'Warisin Team';
  await mockIdentityUserAPI(page, token, email, fullname);
  await mockMessageAPI(page, token, 'select-messages', {
    callback: async (route) => {
      await page.waitForTimeout(slowWaitTime);
      route.fulfill({ headers: corsHeadersAllow, body: JSON.stringify({ data: [] }) });
    },
  });
  await page.goto(generateAuthURL(token));
  expect(await page.isEnabled('text=submit')).toBeFalsy();
  await page.waitForSelector('.textWrapper .loading', {
    state: 'attached',
    timeout: slowWaitTime + delay,
  });
  await page.waitForSelector('.textWrapper .loading', {
    state: 'detached',
    timeout: slowWaitTime + delay,
  });
  expect(await page.isEnabled('text=submit')).toBeTruthy();
});

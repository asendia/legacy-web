import test, { expect } from '@playwright/test';
import { generateAuthURL, mockIdentityUserAPI, mockMessageAPI, timeout } from './core.test.js';

test('slow api', async ({ page }) => {
  const slowWaitTime = 1000;
  const token = 'secretjwt2';
  const email = 'test@warisin.com';
  const fullname = 'Warisin Team';
  await mockIdentityUserAPI(page, token, email, fullname);
  await mockMessageAPI(page, token, 'select-messages', {
    callback: async (route) => {
      await page.waitForTimeout(slowWaitTime);
      route.fulfill({ body: JSON.stringify({ data: [] }) });
    },
  });
  await page.goto(generateAuthURL(token));
  expect(await page.isEnabled('text=submit', { timeout })).toBeFalsy();
  await page.waitForSelector('.textWrapper .loading', {
    state: 'attached',
    timeout: slowWaitTime + timeout,
  });
  await page.waitForSelector('.textWrapper .loading', {
    state: 'detached',
    timeout: slowWaitTime + timeout,
  });
  expect(await page.isEnabled('text=submit', { timeout })).toBeTruthy();
});

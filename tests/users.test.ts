import test, { expect } from '@playwright/test';
import { mockIdentityAuthorizeAPI, mockIdentityUserAPI, mockMessageAPI } from './core.test.js';

test('non-login submit prompts user to login', async ({ page }) => {
  const errorTexts = [];
  page.on('console', async (msg) => msg.type() === 'error' && errorTexts.push(msg.text()));
  await page.goto('/');
  let dialogCounter = 0;
  page.on('dialog', (dialog) => {
    dialogCounter++;
    expect(dialog.message()).toBe('You need to login first');
    return dialog.accept();
  });
  await page.click('text=submit');
  expect(dialogCounter).toBe(1);
  await page.click('text=submit');
  expect(await page.locator('text=submit').isEnabled()).toBeTruthy();
  expect(dialogCounter).toBe(2);
  expect(errorTexts[0]).toBe(undefined);
});

test('login/logout', async ({ page }) => {
  const token = 'secretjwt';
  const email = 'test@warisin.com';
  const fullname = 'Warisin Team';
  await mockIdentityAuthorizeAPI(page, token);
  await mockIdentityUserAPI(page, token, email, fullname);
  await mockMessageAPI(page, token, 'select-messages', { responseBody: { data: [] } });
  await page.goto('/');
  await page.click('text=login');
  await page.waitForNavigation();
  expect(await page.innerText('div > span')).toBe('Welcome, ' + fullname);
  let gotrue = await page.evaluate(() => JSON.parse(localStorage.getItem('gotrue.user')));
  expect(gotrue.email).toBe(email);
  await page.click('text=logout');
  expect(await page.innerText('div > span')).toBe('Testament in the cloud');
  gotrue = await page.evaluate(() => localStorage.getItem('gotrue.user'));
  expect(gotrue).toBe(null);
});

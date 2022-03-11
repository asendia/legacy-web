import test, { Dialog, expect } from '@playwright/test';
import {
  delay,
  generateAuthURL,
  mockIdentityAuthorizeAPI,
  mockIdentityUserAPI,
  mockMessageAPI,
  timeout,
  typingDelay,
} from './core.test.js';

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
  expect(await page.locator('text=submit').isEnabled({ timeout })).toBeTruthy();
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
  await page.waitForNavigation({ timeout });
  expect(await page.innerText('div > span')).toBe('Welcome, ' + fullname);
  let gotrue = await page.evaluate(() => JSON.parse(localStorage.getItem('gotrue.user')));
  expect(gotrue.email).toBe(email);
  await page.click('text=logout');
  expect(await page.innerText('div > span')).toBe('Testament in the cloud');
  gotrue = await page.evaluate(() => localStorage.getItem('gotrue.user'));
  expect(gotrue).toBe(null);
});

test('session expired', async ({ page }) => {
  const errorTexts = [];
  page.on('console', async (msg) => msg.type() === 'error' && errorTexts.push(msg.text()));
  const token = 'secretjwt2';
  const email = 'test@warisin.com';
  const fullname = 'Warisin Team';
  await mockIdentityUserAPI(page, token, email, fullname);
  await mockMessageAPI(page, token, 'select-messages', { responseBody: { data: [] } });
  let messageAPICallCtr = 0;
  await mockMessageAPI(page, token, 'insert-message', {
    callback: async () => messageAPICallCtr++,
  });
  await page.goto(generateAuthURL(token));
  await page.waitForNavigation({ timeout });
  await page.type('textarea.text', 'this is a draft', { delay: typingDelay });
  await page.evaluate(() => {
    const gotrue = JSON.parse(localStorage.getItem('gotrue.user'));
    gotrue.token.expires_at = Date.now() - 60000;
    localStorage.setItem('gotrue.user', JSON.stringify(gotrue));
  });
  const dismissDialogg = (dialog: Dialog) => dialog.dismiss();
  page.on('dialog', dismissDialogg);
  await page.click('text=submit', { delay });
  expect(messageAPICallCtr).toBe(0);
  expect(await page.inputValue('textarea.text')).toBe('this is a draft');
  expect(await page.innerText('div > span')).toBe('Welcome, ' + fullname);
  page.off('dialog', dismissDialogg).on('dialog', (dialog) => dialog.accept());
  await page.click('text=submit', { delay });
  expect(messageAPICallCtr).toBe(0);
  expect(await page.inputValue('textarea.text')).toBe('');
  expect(await page.innerText('div > span')).toBe('Testament in the cloud');
  expect(errorTexts[0]).toBe(undefined);
});

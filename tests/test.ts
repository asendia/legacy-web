import { Dialog, expect, test } from '@playwright/test';
import {
  corsHeadersAllow,
  generateAuthURL,
  MessageData,
  mockIdentityAuthorizeAPI,
  mockIdentityUserAPI,
  mockMessageAPI,
} from './mock.js';

const delay = 0;
const closeSymbol = '×';

test('decrypting without login works', async ({ page }) => {
  await page.goto('/');
  const encryptedContent =
    'aes.utf8:U2FsdGVkX1+qokMf7b9lkyHiTvCRI9jjH6BYn4eeUDhzsDa/jqXYNN9sZqUDjraB8QwfTBLjDrPhu8blOAu7Kw==';
  await page.fill('textarea.text', encryptedContent);
  page.on('dialog', (dialog) => {
    const encryptionSecret = 'IFcgkJmiS9LiV5Btu0A19rQ6IFxgduj9';
    return dialog.accept(encryptionSecret);
  });
  await page.click('.toggle.aes');
  expect(await page.inputValue('textarea.text')).toBe(
    'Testing from playwright\n\nBest,\nWarisin Team',
  );
});

test('non-login submit prompts user to login', async ({ page }) => {
  await page.goto('/');
  let dialogCounter = 0;
  page.on('dialog', (dialog) => {
    dialogCounter++;
    expect(dialog.message()).toBe('You need to login first');
    return dialog.accept();
  });
  await page.click('text=submit');
  expect(dialogCounter).toBe(1);
});

test('email input works', async ({ page }) => {
  await page.goto('/');
  await page.click('.toText');
  await expect(page.locator('input.text')).toBeFocused();
  // Enter 2 valid emails
  const validEmails = ['test@warisin.com', 'admin1@warisin.com'];
  for (let i = 0; i < validEmails.length; i++) {
    const email = validEmails[i];
    await page.keyboard.type(email, { delay });
    await page.keyboard.press('Enter');
    expect(await page.textContent(`.wrapper > .email:nth-child(${i + 2})`)).toBe(
      email + ' ' + closeSymbol,
    );
  }
  // Enter 1 invalid email
  await page.keyboard.type('invalidemail', { delay });
  await page.keyboard.press('Enter');
  expect(await page.inputValue('input.text')).toBe('invalidemail');
  // Make it valid
  await page.keyboard.type('@nowvalid.com', { delay });
  await page.keyboard.press('Enter');
  expect(await page.textContent(`.wrapper > .email:nth-child(4)`)).toBe(
    'invalidemail@nowvalid.com' + ' ' + closeSymbol,
  );
  // Enter 1 more which shouldn't register since max emails length is 3
  await page.keyboard.type('ignored@validemail.com', { delay });
  await page.keyboard.press('Enter');
  // Delete second email
  let emailElements = await page.$$('.wrapper > .email');
  expect(emailElements.length).toBe(3);
  await (await page.$$('.deleteEmail'))[1].click();
  emailElements = await page.$$('.wrapper > .email');
  expect(emailElements.length).toBe(2);
  expect((await emailElements[0].innerText()).startsWith(validEmails[0]));
  expect((await emailElements[1].innerText()).startsWith('invalidemail@nowvalid.com'));
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

test('insert/update message keyboard & click', async ({ page }) => {
  const token = 'secretjwt2';
  const email = 'test@warisin.com';
  const fullname = 'Warisin Team';
  const messageID = 'server-generated-id';
  const messageContent =
    'Hello world!\n\nThis message is written in playwright.\n\nBest,\nWarisin Team';
  const messages: Array<MessageData> = [];
  const accessCtr = { select: 0, insert: 0, update:0 };
  await mockIdentityUserAPI(page, token, email, fullname);
  await mockMessageAPI(page, token, 'select-messages', {
    responseBody: { data: messages },
    beforeFulfill: async () => accessCtr.select++,
  });
  await mockMessageAPI(page, token, 'insert-message', {
    callback: async (route) => {
      const m = route.request().postDataJSON() as MessageData;
      messages.push({
        ...m,
        id: messageID,
        isActive: true,
      });
      accessCtr.insert++;
      route.fulfill({
        headers: corsHeadersAllow,
        body: JSON.stringify({ data: messages[0] }),
      });
    },
  });
  await mockMessageAPI(page, token, 'update-message', {
    callback: async (route) => {
      const m = route.request().postDataJSON() as MessageData;
      expect(messages[messages.length - 1].id === m.id);
      messages[messages.length - 1] = {
        ...m,
      };
      accessCtr.update++;
      route.fulfill({
        headers: corsHeadersAllow,
        body: JSON.stringify({ data: messages[0] }),
      });
    },
  });
  await page.goto(generateAuthURL(token));
  expect(await page.innerText('div > span')).toBe('Welcome, ' + fullname);
  expect(await page.locator('.toggle.show').innerText()).toBe('HIDE');
  await page.click('.toText');
  const recipient = 'recipient@warisin.com';
  await page.keyboard.type(recipient, { delay });
  await page.keyboard.press('Tab', { delay });
  await page.keyboard.type(messageContent, { delay });
  await page.keyboard.press('Tab', { delay });
  await expect(page.locator('select:nth-child(1)')).toBeFocused();
  await page.keyboard.press('Tab', { delay });
  await expect(page.locator('select:nth-child(2)')).toBeFocused();
  await page.keyboard.press('Tab', { delay });
  await expect(page.locator('text=submit')).toBeFocused();
  await page.keyboard.press('Enter', { delay });
  await page.waitForResponse(/insert-message$/);
  expect(messages[0].messageContent).toBe(messageContent);
  expect(messages[0].inactivePeriodDays).toBe(60);
  expect(messages[0].reminderIntervalDays).toBe(15);
  expect(messages[0].emailReceivers[0]).toBe(recipient);
  expect(accessCtr).toStrictEqual({ select: 1, insert: 1, update: 0 });

  const additionalMessage = '\n\nnew line';
  await page.locator('textarea.text').type(additionalMessage, { delay });
  await page.selectOption('select:nth-child(1)', { index: 2 });
  await page.selectOption('select:nth-child(2)', { index: 1 });
  await page.click('text=submit', { delay });
  expect(messages[0].inactivePeriodDays).toBe(90);
  expect(messages[0].reminderIntervalDays).toBe(30);
  expect(await page.inputValue('select:nth-child(1)')).toBe('90');
  expect(await page.inputValue('select:nth-child(2)')).toBe('30');
  expect(accessCtr).toStrictEqual({ select: 1, insert: 1, update: 1 });

  await page.click('.toggle.aes', { delay });
  await page.click('text=submit', { delay });
  expect(messages[0].messageContent.startsWith('aes.utf8:')).toBeTruthy();
  expect(accessCtr).toStrictEqual({ select: 1, insert: 1, update: 2 });

  await page.reload();
  expect(await page.inputValue('textarea.text')).toBe(messageContent + additionalMessage);
  expect(messages[0].inactivePeriodDays).toBe(90);
  expect(messages[0].reminderIntervalDays).toBe(30);
  expect(messages.length).toBe(1);
  expect(await page.locator('.toggle.aes').innerText()).toBe('CLIENT-AES:\nON');
  expect(await page.locator('.toggle.show').innerText()).toBe('SHOW');
  expect(await page.textContent(`.wrapper > .email:nth-child(2)`)).toBe(
    recipient + ' ' + closeSymbol,
  );
  expect(await page.inputValue('select:nth-child(1)')).toBe('90');
  expect(await page.inputValue('select:nth-child(2)')).toBe('30');
  expect(accessCtr).toStrictEqual({ select: 2, insert: 1, update: 2 });
});

test('session expired', async ({ page }) => {
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
  await page.waitForNavigation();
  await page.type('textarea.text', 'this is a draft', { delay });
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
  await page.waitForLoadState();
  expect(messageAPICallCtr).toBe(0);
  expect(await page.inputValue('textarea.text')).toBe('');
  expect(await page.innerText('div > span')).toBe('Testament in the cloud');
});

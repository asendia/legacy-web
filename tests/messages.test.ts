import test, { expect } from '@playwright/test';
import {
  closeSymbol,
  corsHeadersAllow,
  delay,
  failOnAnyError,
  generateAuthURL,
  MessageData,
  mockIdentityUserAPI,
  mockMessageAPI,
  typingDelay,
} from './core.test.js';

test('insert/update message keyboard & click', async ({ page }) => {
  failOnAnyError(page);
  const token = 'secretjwt2';
  const email = 'test@warisin.com';
  const fullname = 'Warisin Team';
  const messageID = 'server-generated-id';
  const messageContent =
    'Hello world!\n\nThis message is written in playwright.\n\nBest,\nWarisin Team';
  const messages: Array<MessageData> = [];
  const accessCtr = { select: 0, insert: 0, update: 0 };
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
  await page.waitForNavigation({ waitUntil: 'networkidle' });
  expect(await page.innerText('div > span')).toBe('Welcome, ' + fullname);
  expect(await page.locator('.toggle.show').innerText()).toBe('HIDE');
  await page.click('.toText');
  const recipient = 'recipient@warisin.com';
  await page.keyboard.type(recipient, { delay: typingDelay });
  await page.keyboard.press('Tab', { delay });
  await page.keyboard.type(messageContent, { delay: typingDelay });
  await page.keyboard.press('Tab', { delay });
  await expect(page.locator('select:nth-child(1)')).toBeFocused();
  await page.keyboard.press('Tab', { delay });
  await expect(page.locator('select:nth-child(2)')).toBeFocused();
  await page.keyboard.press('Tab', { delay });
  await expect(page.locator('text=submit')).toBeFocused();
  await page.keyboard.press('Enter', { delay });
  expect(messages[0].messageContent).toBe(messageContent);
  expect(messages[0].inactivePeriodDays).toBe(60);
  expect(messages[0].reminderIntervalDays).toBe(15);
  expect(messages[0].emailReceivers[0]).toBe(recipient);
  expect(accessCtr).toStrictEqual({ select: 1, insert: 1, update: 0 });

  const additionalMessage = '\n\nnew line';
  await page.locator('textarea.text').type(additionalMessage, { delay: typingDelay });
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
  await page.isEnabled('text=submit');
  expect(messages[0].messageContent.startsWith('aes.utf8:')).toBeTruthy();
  expect(accessCtr).toStrictEqual({ select: 1, insert: 1, update: 2 });

  await page.reload({ waitUntil: 'networkidle' });
  expect(await page.isEnabled('text=submit')).toBeTruthy();
  expect(await page.inputValue('textarea.text')).toBe(messageContent + additionalMessage);
  expect(messages[0].inactivePeriodDays).toBe(90);
  expect(messages[0].reminderIntervalDays).toBe(30);
  expect(messages.length).toBe(1);
  expect(await page.innerText('.toggle.aes')).toBe('CLIENT-AES:\nON');
  expect(await page.innerText('.toggle.show')).toBe('SHOW');
  expect(await page.textContent(`.wrapper > .email:nth-child(2)`)).toBe(
    recipient + ' ' + closeSymbol,
  );
  expect(await page.inputValue('select:nth-child(1)')).toBe('90');
  expect(await page.inputValue('select:nth-child(2)')).toBe('30');
  expect(accessCtr).toStrictEqual({ select: 2, insert: 1, update: 2 });
});

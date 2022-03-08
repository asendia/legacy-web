import { expect, test } from '@playwright/test';

test('index page has expected h1', async ({ page }) => {
  await page.goto('/');
  expect(await page.textContent('h1')).toBe('warisin');
});

test('decrypting without login works', async ({ page }) => {
  await page.goto('/');
  const encryptedContent =
    'aes.utf8:U2FsdGVkX1+qokMf7b9lkyHiTvCRI9jjH6BYn4eeUDhzsDa/jqXYNN9sZqUDjraB8QwfTBLjDrPhu8blOAu7Kw==';
  await page.fill('textarea.text', encryptedContent);
  page.on('dialog', async (dialog) => {
    const encryptionSecret = 'IFcgkJmiS9LiV5Btu0A19rQ6IFxgduj9';
    await dialog.accept(encryptionSecret);
    expect(await page.inputValue('textarea.text')).toBe(
      'Testing from playwright\n\nBest,\nWarisin Team',
    );
  });
  await page.click('.toggle.aes');
});

test('email input works', async ({ page }) => {
  await page.goto('/');
  await page.click('.toText');
  await expect(page.locator('input.text')).toBeFocused();
  // Enter 2 valid emails
  const validEmails = ['test@warisin.com', 'admin@warisin.com'];
  const closeSymbol = '×';
  for (let i = 0; i < validEmails.length; i++) {
    const email = validEmails[i];
    await page.keyboard.type(email, { delay: 5 });
    await page.keyboard.press('Enter');
    expect(await page.textContent(`.wrapper > .email:nth-child(${i + 2})`)).toBe(
      email + ' ' + closeSymbol,
    );
  }
  // Enter 1 invalid email
  await page.keyboard.type('invalidemail', { delay: 5 });
  await page.keyboard.press('Enter');
  expect(await page.inputValue('input.text')).toBe('invalidemail');
  // Make it valid
  await page.keyboard.type('@nowvalid.com', { delay: 5 });
  await page.keyboard.press('Enter');
  expect(await page.textContent(`.wrapper > .email:nth-child(4)`)).toBe(
    'invalidemail@nowvalid.com' + ' ' + closeSymbol,
  );
  // Enter 1 more which shouldn't register since max emails length is 3
  await page.keyboard.type('ignored@validemail.com', { delay: 5 });
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

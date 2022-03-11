import test, { expect } from '@playwright/test';

test('decrypting without login works', async ({ page }) => {
  const errorTexts = [];
  page.on('console', async (msg) => msg.type() === 'error' && errorTexts.push(msg.text()));
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
  expect(errorTexts[0]).toBe(undefined);
});

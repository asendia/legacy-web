import test, { expect } from '@playwright/test';
import { failOnAnyError } from './core.test.js';

test('decrypting without login works', async ({ page }) => {
  failOnAnyError(page);
  await page.goto('/');
  const encryptedContent =
    'aes.utf8:U2FsdGVkX1/sk7Ay4bBbEFbaH+qASulM3TRjfE11ka9edj7vKSIblyzGRh38vBukxG7fIr+kY6gOe7kcjbdqOPXTuSdzYDVS2A7861j8GAg=';
  await page.fill('textarea.text', encryptedContent);
  page.on('dialog', (dialog) => {
    const encryptionSecret = 'WVI9YMsV39vx4UWUgrt7TaMxAMd2N968';
    return dialog.accept(encryptionSecret);
  });
  await page.click('.toggle.aes');
  expect(await page.inputValue('textarea.text')).toBe(
    'Testing from sejiwo.com\n\nBrand new hehehe\n\nBest,\nHassan',
  );
});

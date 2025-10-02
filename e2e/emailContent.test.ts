import test, { expect } from '@playwright/test';
import { timeout, failOnAnyError } from './core-test.js';

test('decrypting without login works', async ({ page }) => {
	failOnAnyError(page);
	await page.goto('/');
	const encryptedContent =
		'aes.utf8:U2FsdGVkX1/sk7Ay4bBbEFbaH+qASulM3TRjfE11ka9edj7vKSIblyzGRh38vBukxG7fIr+kY6gOe7kcjbdqOPXTuSdzYDVS2A7861j8GAg=';
	await page.click('textarea');
	await page.fill('textarea', encryptedContent);
	await page.evaluate(() => {
		document.querySelector('textarea')?.dispatchEvent(new Event('change', { bubbles: true }));
	});
	page.on('dialog', (dialog) => {
		const encryptionSecret = 'WVI9YMsV39vx4UWUgrt7TaMxAMd2N968';
		return dialog.accept(encryptionSecret);
	});
	await page.click('data-test-id=toggle-aes');
	const textArea = page.locator('textarea');
	await expect(textArea).toHaveValue(
		'Testing from sejiwo.com\n\nBrand new hehehe\n\nBest,\nHassan',
		{ timeout }
	);
});

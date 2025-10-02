import test, { expect } from '@playwright/test';
import { closeSymbol, failOnAnyError, typingDelay } from './core-test.js';

test('email input works', async ({ page }) => {
	failOnAnyError(page);
	await page.goto('/');
	// Click on the email input wrapper to focus the input
	await page.click('[data-test-id="email-list-wrapper"]');
	await expect(page.locator('data-test-id=email-input')).toBeFocused();
	// Enter 2 valid emails
	const validEmails = ['test@sejiwo.com', 'admin1@sejiwo.com'];
	for (let i = 0; i < validEmails.length; i++) {
		const email = validEmails[i];
		await page.keyboard.type(email, { delay: typingDelay });
		await page.keyboard.press('Enter');
		expect(await page.textContent(`data-test-id=email-${i}`)).toBe(email + ' ' + closeSymbol);
	}
	// Enter 1 invalid email
	await page.keyboard.type('invalidemail', { delay: typingDelay });
	await page.keyboard.press('Enter');
	expect(await page.inputValue('data-test-id=email-input')).toBe('invalidemail');
	// Make it valid
	await page.keyboard.type('@nowvalid.com', { delay: typingDelay });
	await page.keyboard.press('Enter');
	expect(await page.textContent(`data-test-id=email-2`)).toBe(
		'invalidemail@nowvalid.com' + ' ' + closeSymbol
	);
	// Max email list is 3
	expect(await page.locator('data-test-id=email-input').isVisible()).toBeFalsy();
	// Delete second email
	await page.locator('data-test-id=email-delete-1').click();
	expect((await page.textContent('data-test-id=email-0')).startsWith(validEmails[0]));
	expect((await page.textContent('data-test-id=email-1')).startsWith('invalidemail@nowvalid.com'));
});

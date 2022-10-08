import test, { expect } from '@playwright/test';
import { closeSymbol, failOnAnyError, typingDelay } from './core.test.js';

test('email input works', async ({ page }) => {
	failOnAnyError(page);
	await page.goto('/');
	await page.click('.toText');
	await expect(page.locator('input.text')).toBeFocused();
	// Enter 2 valid emails
	const validEmails = ['test@sejiwo.com', 'admin1@sejiwo.com'];
	for (let i = 0; i < validEmails.length; i++) {
		const email = validEmails[i];
		await page.keyboard.type(email, { delay: typingDelay });
		await page.keyboard.press('Enter');
		expect(await page.textContent(`.wrapper > .email:nth-child(${i + 2})`)).toBe(
			email + ' ' + closeSymbol
		);
	}
	// Enter 1 invalid email
	await page.keyboard.type('invalidemail', { delay: typingDelay });
	await page.keyboard.press('Enter');
	expect(await page.inputValue('input.text')).toBe('invalidemail');
	// Make it valid
	await page.keyboard.type('@nowvalid.com', { delay: typingDelay });
	await page.keyboard.press('Enter');
	expect(await page.textContent(`.wrapper > .email:nth-child(4)`)).toBe(
		'invalidemail@nowvalid.com' + ' ' + closeSymbol
	);
	// Max email list is 3
	expect(await page.locator('input.text').isVisible()).toBeFalsy();
	// Delete second email
	let emailElements = await page.$$('.wrapper > .email');
	expect(emailElements.length).toBe(3);
	await (await page.$$('.deleteEmail'))[1].click();
	emailElements = await page.$$('.wrapper > .email');
	expect(emailElements.length).toBe(2);
	expect((await emailElements[0].innerText()).startsWith(validEmails[0]));
	expect((await emailElements[1].innerText()).startsWith('invalidemail@nowvalid.com'));
});

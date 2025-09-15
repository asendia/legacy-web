import test, { expect } from '@playwright/test';
import {
	failOnAnyError,
	mockIdentityAuthorizeAPI,
	mockIdentityUserAPI,
	mockMessageAPI
} from './core-test.js';

test('non-login submit prompts user to login', async ({ page }) => {
	failOnAnyError(page);
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
});

test('login/logout', async ({ page }) => {
	failOnAnyError(page);
	const token = 'secretjwt';
	const email = 'test@sejiwo.com';
	const fullname = 'Sejiwo Team';
	await mockIdentityAuthorizeAPI(page, token);
	await mockIdentityUserAPI(page, token, email, fullname);
	await mockMessageAPI(page, token, 'select-messages', { responseBody: { data: [] } });
	await page.goto('/');
	await page.click('text=login');
	await page.waitForNavigation({ waitUntil: 'networkidle' });
	expect(await page.innerText('div > span')).toBe(fullname.split(' ')[0]);
	let gotrue = await page.evaluate(() => JSON.parse(localStorage.getItem('gotrue.user')));
	expect(gotrue.email).toBe(email);
	await page.click('text=logout');
	expect(await page.innerText('div > span')).toBe('');
	gotrue = await page.evaluate(() => localStorage.getItem('gotrue.user'));
	expect(gotrue).toBe(null);
});

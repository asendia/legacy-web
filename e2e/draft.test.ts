import test, { Dialog, expect } from '@playwright/test';
import {
	corsHeadersAllow,
	delay,
	failOnAnyError,
	generateAuthURL,
	mockIdentityAuthorizeAPI,
	mockIdentityUserAPI,
	mockMessageAPI,
	timeout,
	typingDelay
} from './core-test.js';

test('draft conflicted use client', async ({ page }) => {
	failOnAnyError(page);
	const token = 'secretjwt2';
	await page.goto('/');
	const draftText = 'this is a client draft';
	await page.type('textarea', draftText, { delay: typingDelay });
	const email = 'test@sejiwo.com';
	const fullname = 'Sejiwo Team';
	await mockIdentityAuthorizeAPI(page, token);
	await mockIdentityUserAPI(page, token, email, fullname, delay);
	await mockMessageAPI(page, token, 'select-messages', {
		callback: async (route) => {
			route.fulfill({
				headers: corsHeadersAllow,
				body: JSON.stringify({
					data: [
						{
							emailReceivers: ['remote@email.com'],
							messageContent: 'remote content'
						}
					]
				})
			});
		}
	});
	let dialogCounter = 0;
	const rejectDialog = async (dialog: Dialog) => {
		dialogCounter++;
		await dialog.dismiss();
	};
	page.on('dialog', rejectDialog);
	await page.click('text=login');
	await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
	// Ensure no flash state
	expect(await page.inputValue('textarea')).toBe('');
	await page.waitForLoadState('networkidle');
	expect(dialogCounter).toBe(1);
	const textArea = page.locator('textarea');
	await expect(textArea).toHaveValue('this is a client draft', { timeout });
});

test('draft conflicted use remote', async ({ page }) => {
	failOnAnyError(page);
	const token = 'secretjwt2';
	await page.goto('/');
	const draftText = 'this is a client draft';
	await page.type('textarea', draftText, { delay: typingDelay });
	const email = 'test@sejiwo.com';
	const fullname = 'Sejiwo Team';
	await mockIdentityAuthorizeAPI(page, token);
	await mockIdentityUserAPI(page, token, email, fullname);
	await mockMessageAPI(page, token, 'select-messages', {
		responseBody: {
			data: [
				{
					emailReceivers: ['remote@email.com'],
					messageContent: 'remote content'
				}
			]
		}
	});
	let dialogCounter = 0;
	const acceptDialog = async (dialog: Dialog) => {
		dialogCounter++;
		await dialog.accept();
	};
	page.on('dialog', acceptDialog);
	await page.click('text=login');
	await page.waitForLoadState('networkidle');
	expect(dialogCounter).toBe(1);
	expect(await page.inputValue('textarea')).toBe('remote content');
});

test('session expired reject draft', async ({ page }) => {
	failOnAnyError(page);
	const token = 'secretjwt2';
	const email = 'test@sejiwo.com';
	const fullname = 'Sejiwo Team';
	await mockIdentityUserAPI(page, token, email, fullname);
	await mockMessageAPI(page, token, 'select-messages', { responseBody: { data: [] } });
	let messageAPICallCtr = 0;
	await mockMessageAPI(page, token, 'insert-message', {
		callback: async () => messageAPICallCtr++
	});
	await page.goto(generateAuthURL(token));
	await page.waitForNavigation({ waitUntil: 'networkidle' });
	const draftText = 'this is a draft';
	await page.type('textarea', draftText, { delay: typingDelay });
	await page.evaluate(() => {
		const gotrue = JSON.parse(localStorage.getItem('gotrue.user'));
		gotrue.token.expires_at = Date.now() - 60000;
		localStorage.setItem('gotrue.user', JSON.stringify(gotrue));
	});
	const dialogCtr = { accept: 0, reject: 0 };
	const rejectDialog = async (dialog: Dialog) => {
		dialogCtr.reject++;
		await dialog.dismiss();
	};
	page.on('dialog', rejectDialog);
	await page.click('text=submit', { delay });
	expect(dialogCtr).toStrictEqual({ accept: 0, reject: 1 });
	expect(messageAPICallCtr).toBe(0);
	expect(await page.inputValue('textarea')).toBe('');
	expect(await page.innerText('div > span')).toBe('');
});

test('session expired accept draft', async ({ page }) => {
	failOnAnyError(page);
	const token = 'secretjwt2';
	const email = 'test@sejiwo.com';
	const fullname = 'Sejiwo Team';
	await mockIdentityUserAPI(page, token, email, fullname);
	await mockMessageAPI(page, token, 'select-messages', { responseBody: { data: [] } });
	let messageAPICallCtr = 0;
	await mockMessageAPI(page, token, 'insert-message', {
		callback: async () => messageAPICallCtr++
	});
	await page.goto(generateAuthURL(token));
	await page.waitForNavigation({ waitUntil: 'networkidle' });
	const draftText = 'this is a draft';
	await page.type('textarea', draftText, { delay: typingDelay });
	await page.evaluate(() => {
		const gotrue = JSON.parse(localStorage.getItem('gotrue.user'));
		gotrue.token.expires_at = Date.now() - 60000;
		localStorage.setItem('gotrue.user', JSON.stringify(gotrue));
	});
	const dialogCtr = { accept: 0, reject: 0 };
	const acceptDialog = async (dialog: Dialog) => {
		dialogCtr.accept++;
		await dialog.accept();
	};
	page.on('dialog', acceptDialog);
	await page.click('text=submit', { delay });
	expect(dialogCtr).toStrictEqual({ accept: 1, reject: 0 });
	expect(messageAPICallCtr).toBe(0);

	const textArea = page.locator('textarea');
	await expect(textArea).toHaveValue(draftText, { timeout });
	expect(await page.innerText('div > span')).toBe('');
});

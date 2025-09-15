import test, { expect } from '@playwright/test';
import {
	corsHeadersAllow,
	delay,
	failOnAnyError,
	generateAuthURL,
	mockIdentityUserAPI,
	mockMessageAPI,
	timeout
} from './core-test.js';

test('slow api', async ({ page }) => {
	failOnAnyError(page);
	const token = 'secretjwt2';
	const email = 'test@sejiwo.com';
	const fullname = 'Sejiwo Team';
	await mockIdentityUserAPI(page, token, email, fullname);
	await mockMessageAPI(page, token, 'select-messages', {
		callback: async (route) => {
			await page.waitForTimeout(timeout);
			route.fulfill({ headers: corsHeadersAllow, body: JSON.stringify({ data: [] }) });
		}
	});
	await page.goto(generateAuthURL(token));
	await page.waitForNavigation({ waitUntil: 'networkidle' });
	expect(await page.isEnabled('text=submit')).toBeFalsy();
	await page.waitForSelector('data-test-id=loading', {
		state: 'attached',
		timeout: timeout + delay
	});
	await page.waitForSelector('data-test-id=loading', {
		state: 'detached',
		timeout: timeout + delay
	});
	expect(await page.isEnabled('text=submit')).toBeTruthy();
});

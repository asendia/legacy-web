import { test, expect } from '@playwright/test';

test.skip(process.env.TEST_TELEGRAM !== 'true', 'Use the Telegram test configuration.');

test('Telegram login keeps the linked email account', async ({ page }) => {
	await page.addInitScript(() => {
		sessionStorage.setItem(
			'sejiwo-telegram-login',
			JSON.stringify({ state: 'state', proof: 'proof', expiresAt: Date.now() + 60000 })
		);
	});
	await page.route('**/legacy-api-telegram', async (route) => {
		const input = route.request().postDataJSON();
		if (input.action === 'login-finish') {
			expect(input).toEqual({
				action: 'login-finish',
				code: 'code',
				state: 'state',
				proof: 'proof'
			});
			await route.fulfill({
				json: {
					email: 'writer@example.com',
					accessToken: 'tg_session',
					expiresAt: Date.now() + 3600000
				}
			});
		} else {
			await route.fulfill({ json: { linked: true, remindersEnabled: false, receivers: {} } });
		}
	});
	await page.route('**/legacy-api?action=select-messages', async (route) => {
		expect(route.request().headers().authorization).toBe('Bearer tg_session');
		await route.fulfill({ json: { data: [] } });
	});
	await page.goto('/telegram/callback?state=state&code=code');
	await expect(page).toHaveURL('http://127.0.0.1:4174/');
	await expect(page.getByText('Telegram is linked. You can use it to sign in.')).toBeVisible();
	const auth = await page.evaluate(() => JSON.parse(localStorage.getItem('gotrue.user') ?? '{}'));
	expect(auth.email).toBe('writer@example.com');
	expect(auth.app_metadata.provider).toBe('telegram');
});

test('Telegram callback rejects the wrong state', async ({ page }) => {
	await page.addInitScript(() => {
		sessionStorage.setItem(
			'sejiwo-telegram-login',
			JSON.stringify({ state: 'expected', proof: 'proof', expiresAt: Date.now() + 60000 })
		);
	});
	let requests = 0;
	await page.route('**/legacy-api-telegram', async (route) => {
		requests++;
		await route.abort();
	});
	await page.goto('/telegram/callback?state=wrong&code=code');
	await expect(page.getByRole('alert')).toContainText('Telegram login has expired');
	expect(requests).toBe(0);
	expect(await page.evaluate(() => localStorage.getItem('gotrue.user'))).toBeNull();
	await expect(page).toHaveURL('http://127.0.0.1:4174/telegram/callback');
});

test('writer can enable reminders and share a recipient link', async ({ page }) => {
	await page.addInitScript(() => {
		localStorage.setItem(
			'gotrue.user',
			JSON.stringify({
				email: 'writer@example.com',
				app_metadata: { provider: 'google' },
				user_metadata: { full_name: 'Writer' },
				token: { access_token: 'email-session', expires_at: Date.now() + 3600000 }
			})
		);
	});
	await page.route('**/legacy-api?action=select-messages', async (route) => {
		await route.fulfill({
			json: {
				data: [
					{
						id: 'saved-id',
						emailReceivers: ['recipient@example.com'],
						messageContent: 'Private message',
						inactivePeriodDays: 60,
						reminderIntervalDays: 15,
						isActive: true
					}
				]
			}
		});
	});
	const actions: string[] = [];
	await page.route('**/legacy-api-telegram', async (route) => {
		const input = route.request().postDataJSON();
		actions.push(input.action);
		expect(route.request().headers().authorization).toBe('Bearer email-session');
		if (input.action === 'status') {
			await route.fulfill({ json: { linked: true, remindersEnabled: false, receivers: {} } });
		} else if (input.action === 'reminders') {
			expect(input.enabled).toBe(true);
			await route.fulfill({ json: { ok: true } });
		} else if (input.action === 'receiver-link') {
			expect(input.messageId).toBe('saved-id');
			expect(input.email).toBe('recipient@example.com');
			await route.fulfill({ json: { url: 'https://t.me/sejiwo_test_bot?start=private-link' } });
		} else {
			await route.fulfill({ json: { ok: true } });
		}
	});
	await page.goto('/');
	await page.getByRole('button', { name: 'Enable Telegram reminders' }).click();
	await expect(page.getByRole('button', { name: 'Stop Telegram reminders' })).toBeVisible();
	await page.getByRole('button', { name: 'Create recipient link' }).click();
	await expect(page.getByLabel('Share privately with recipient@example.com')).toHaveValue(
		'https://t.me/sejiwo_test_bot?start=private-link'
	);
	await expect(page.getByText('Waiting for the recipient to press Start')).toBeVisible();
	await page.getByRole('button', { name: 'Remove Telegram delivery' }).click();
	await expect(page.getByText('Email only', { exact: true })).toBeVisible();
	expect(actions.filter((action) => action !== 'status')).toEqual([
		'reminders',
		'receiver-link',
		'receiver-remove'
	]);
});

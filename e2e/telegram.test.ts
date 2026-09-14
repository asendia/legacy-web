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
	await page.getByRole('button', { name: 'Account settings' }).click();
	await expect(page.getByText('An additional way to sign in')).toBeVisible();
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
	await page.getByRole('button', { name: 'Account settings' }).click();
	await page.getByRole('switch', { name: 'Telegram reminders' }).click();
	await expect(page.getByRole('switch', { name: 'Telegram reminders' })).toBeChecked();
	await page.getByRole('button', { name: 'Close', exact: true }).click();
	await page.getByRole('button', { name: 'Delivery settings' }).click();
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

test('logout clears private data while the server and next page are stalled', async ({ page }) => {
	let snapshot: unknown;
	page.on('console', (message) => {
		if (message.text().startsWith('logout-test ')) snapshot = JSON.parse(message.text().slice(12));
	});
	await page.addInitScript(() => {
		window.addEventListener('beforeunload', () =>
			console.log(
				'logout-test ' +
					JSON.stringify({
						auth: localStorage.getItem('gotrue.user'),
						secret: localStorage.getItem('encryption.secret'),
						content: sessionStorage.getItem('message.content'),
						receivers: sessionStorage.getItem('message.receivers'),
						hidden: document.documentElement.hidden
					})
			)
		);
		if (sessionStorage.getItem('logout-test-started')) return;
		sessionStorage.setItem('logout-test-started', 'true');
		localStorage.setItem(
			'gotrue.user',
			JSON.stringify({
				email: 'writer@example.com',
				app_metadata: { provider: 'telegram' },
				user_metadata: { full_name: 'Writer' },
				token: { access_token: 'tg_logout_session', expires_at: Date.now() + 3600000 }
			})
		);
		localStorage.setItem('encryption.secret', 'private-key');
		sessionStorage.setItem('message.content', 'private-draft');
		sessionStorage.setItem('message.receivers', '["recipient@example.com"]');
	});
	let release: () => void = () => {};
	const held = new Promise<void>((resolve) => {
		release = resolve;
	});
	let pageLoads = 0;
	await page.route('http://127.0.0.1:4174/', async (route) => {
		if (route.request().isNavigationRequest() && ++pageLoads > 1) await held;
		await route.continue();
	});
	await page.route('**/legacy-api?action=select-messages', (route) =>
		route.fulfill({ json: { data: [] } })
	);
	let revokedToken = '';
	await page.route('**/legacy-api-telegram', async (route) => {
		if (route.request().postDataJSON().action === 'logout') {
			revokedToken = route.request().headers().authorization;
			await held;
			await route.fulfill({ json: { ok: true } }).catch(() => {});
		} else await route.fulfill({ json: { linked: true, remindersEnabled: false, receivers: {} } });
	});
	try {
		await page.goto('/');
		await expect(page.locator('#user-message')).toBeVisible();
		await page.getByRole('button', { name: 'Account settings' }).click();
		await page.getByRole('button', { name: 'logout', exact: true }).click({ noWaitAfter: true });
		await expect
			.poll(() => snapshot)
			.toEqual({ auth: null, secret: null, content: null, receivers: null, hidden: true });
		await expect.poll(() => revokedToken).toBe('Bearer tg_logout_session');
	} finally {
		release();
	}
	await expect(page.getByRole('button', { name: 'login', exact: true })).toBeVisible();
	await expect(page.locator('#user-message')).toHaveCount(0);
});

test('mobile login choices fit and return focus after close', async ({ page }) => {
	await page.setViewportSize({ width: 320, height: 640 });
	await page.goto('/');
	const login = page.getByRole('button', { name: 'login', exact: true });
	await expect(page.getByRole('button', { name: 'Continue with Telegram' })).toHaveCount(0);
	await expect(page.getByAltText('sejiwo logo')).toBeVisible();
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
	await login.click();
	const dialog = page.getByRole('dialog', { name: 'Your Sejiwo account' });
	await expect(dialog).toBeVisible();
	await expect(dialog.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
	await expect(dialog.getByRole('button', { name: 'Continue with Telegram' })).toBeVisible();
	await expect(dialog.getByText('New to Sejiwo?')).toBeVisible();
	expect(await dialog.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
	await page.screenshot({ path: 'test-results/mobile-login.png' });
	await page.keyboard.press('Escape');
	await expect(dialog).toHaveCount(0);
	await expect(login).toBeFocused();
	await expect(page.getByAltText('sejiwo logo')).toBeVisible();
});

test('login errors show only known safe codes and keep the Google session', async ({ page }) => {
	await page.addInitScript(() => {
		sessionStorage.setItem(
			'sejiwo-telegram-login',
			JSON.stringify({ state: 'state', proof: 'proof', expiresAt: Date.now() + 60000 })
		);
		localStorage.setItem(
			'gotrue.user',
			JSON.stringify({ email: 'writer@example.com', token: { access_token: 'google-session' } })
		);
	});
	await page.route('**/legacy-api-telegram', (route) =>
		route.fulfill({
			status: 400,
			json: { code: 'telegram_phone_required', err: 'private server details' }
		})
	);
	await page.goto('/telegram/callback?code=code&state=state');
	await expect(page.getByRole('alert')).toContainText(
		'allow it to share your verified phone number'
	);
	await expect(page.getByRole('alert')).not.toContainText('private server details');
	expect(
		await page.evaluate(
			() => JSON.parse(localStorage.getItem('gotrue.user') ?? '{}').token.access_token
		)
	).toBe('google-session');
});

test('mobile settings stay out of the form and lock unsaved recipient links', async ({ page }) => {
	await page.setViewportSize({ width: 320, height: 844 });
	await page.addInitScript(() =>
		localStorage.setItem(
			'gotrue.user',
			JSON.stringify({
				email: 'writer@example.com',
				app_metadata: { provider: 'google' },
				user_metadata: { full_name: 'Test Writer' },
				token: { access_token: 'google-session', expires_at: Date.now() + 3600000 }
			})
		)
	);
	await page.route('**/legacy-api?action=select-messages', (route) =>
		route.fulfill({ json: { data: [] } })
	);
	let settingsRequests = 0;
	await page.route('**/legacy-api-telegram', (route) => {
		settingsRequests++;
		return route.fulfill({ json: { linked: false, remindersEnabled: false, receivers: {} } });
	});
	await page.goto('/');
	await expect(page.getByRole('button', { name: 'Delivery settings' })).toBeVisible();
	await expect(page.getByRole('switch')).toHaveCount(0);
	expect(settingsRequests).toBe(0);
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
	const profile = await page.getByRole('button', { name: 'Account settings' }).boundingBox();
	const language = await page.getByRole('button', { name: 'EN', exact: true }).boundingBox();
	expect(profile?.height).toBe(language?.height);
	const toolbar = page.getByTestId('message-toolbar');
	await expect(toolbar.getByRole('button', { name: 'Delivery settings' })).toBeVisible();
	const controls = await toolbar.getByRole('button').all();
	const boxes = await Promise.all(controls.map((control) => control.boundingBox()));
	expect(new Set(boxes.map((box) => box?.y)).size).toBe(1);
	await page.screenshot({ path: 'test-results/mobile-form.png' });
	await page.getByRole('button', { name: 'Account settings' }).click();
	await expect(page.getByRole('button', { name: 'Link Telegram' })).toHaveText('Link');
	await expect(page.getByText('Telegram will ask', { exact: false })).toHaveCount(0);
	await page.screenshot({ path: 'test-results/mobile-account.png' });
	await page.keyboard.press('Escape');
	await page.getByRole('button', { name: 'Delivery settings' }).click();
	await expect(
		page.getByText('Save your message before you create recipient links.')
	).toBeVisible();
	await expect(page.getByText('Add a recipient email to your message first.')).toBeVisible();
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.screenshot({ path: 'test-results/desktop-delivery.png' });
});

for (const provider of ['google', 'telegram']) {
	test(`unlink Telegram from a ${provider} session`, async ({ page }) => {
		await page.addInitScript((provider) => {
			if (sessionStorage.getItem('unlink-test-ready')) return;
			sessionStorage.setItem('unlink-test-ready', 'true');
			localStorage.setItem(
				'gotrue.user',
				JSON.stringify({
					email: 'writer@example.com',
					app_metadata: { provider },
					user_metadata: { full_name: 'Writer' },
					token: {
						access_token: provider === 'telegram' ? 'tg_session' : 'google-session',
						expires_at: Date.now() + 3600000
					}
				})
			);
		}, provider);
		await page.route('**/legacy-api?action=select-messages', (route) =>
			route.fulfill({ json: { data: [] } })
		);
		let requests = 0;
		let reject = true;
		await page.route('**/legacy-api-telegram', (route) => {
			const body = route.request().postDataJSON();
			if (body.action === 'unlink') {
				expect(body).toEqual({ action: 'unlink' });
				expect(route.request().headers().authorization).toBe(
					provider === 'telegram' ? 'Bearer tg_session' : 'Bearer google-session'
				);
				requests++;
				return route.fulfill({
					status: reject ? 400 : 200,
					json: reject ? { err: 'failed' } : { ok: true }
				});
			}
			return route.fulfill({ json: { linked: true, remindersEnabled: true, receivers: {} } });
		});
		await page.goto('/');
		await page.getByRole('button', { name: 'Account settings' }).click();
		await page.getByRole('button', { name: 'Unlink Telegram', exact: true }).click();
		await page.getByRole('button', { name: 'Cancel', exact: true }).click();
		expect(requests).toBe(0);
		await expect(page.getByRole('switch', { name: 'Telegram reminders' })).toBeChecked();
		await page.getByRole('button', { name: 'Unlink Telegram', exact: true }).click();
		await page.getByRole('button', { name: 'Confirm unlink', exact: true }).click();
		await expect(page.getByRole('alert')).toBeVisible();
		await expect(page.getByRole('switch', { name: 'Telegram reminders' })).toBeChecked();
		expect(await page.evaluate(() => localStorage.getItem('gotrue.user'))).not.toBeNull();
		reject = false;
		await page.getByRole('button', { name: 'Confirm unlink', exact: true }).click();
		if (provider === 'google') {
			await expect(page.getByRole('button', { name: 'Link Telegram', exact: true })).toBeVisible();
			await expect(page.getByRole('switch', { name: 'Telegram reminders' })).toHaveCount(0);
			expect(
				await page.evaluate(
					() => JSON.parse(localStorage.getItem('gotrue.user') ?? '{}').token.access_token
				)
			).toBe('google-session');
		} else {
			await expect(page.getByRole('button', { name: 'login', exact: true })).toBeVisible();
			expect(await page.evaluate(() => localStorage.getItem('gotrue.user'))).toBeNull();
		}
		expect(requests).toBe(2);
	});
}

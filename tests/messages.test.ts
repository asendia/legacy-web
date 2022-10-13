import test, { expect } from '@playwright/test';
import {
	closeSymbol,
	corsHeadersAllow,
	delay,
	failOnAnyError,
	generateAuthURL,
	MessageData,
	mockIdentityUserAPI,
	mockMessageAPI,
	typingDelay
} from './core.test.js';

test('insert/update message keyboard & click', async ({ page }) => {
	failOnAnyError(page);
	const token = 'secretjwt2';
	const email = 'test@sejiwo.com';
	const fullname = 'Sejiwo Team';
	const messageID = 'server-generated-id';
	const messageContent =
		'Hello world!\n\nThis message is written in playwright.\n\nBest,\nSejiwo Team';
	const messages: Array<MessageData> = [];
	const accessCtr = { select: 0, insert: 0, update: 0 };
	await mockIdentityUserAPI(page, token, email, fullname);
	await mockMessageAPI(page, token, 'select-messages', {
		responseBody: { data: messages },
		beforeFulfill: async () => accessCtr.select++
	});
	await mockMessageAPI(page, token, 'insert-message', {
		callback: async (route) => {
			const m = route.request().postDataJSON() as MessageData;
			messages.push({
				...m,
				id: messageID,
				isActive: true
			});
			accessCtr.insert++;
			route.fulfill({
				headers: corsHeadersAllow,
				body: JSON.stringify({ data: messages[0] })
			});
		}
	});
	await mockMessageAPI(page, token, 'update-message', {
		callback: async (route) => {
			const m = route.request().postDataJSON() as MessageData;
			expect(messages[messages.length - 1].id === m.id);
			messages[messages.length - 1] = {
				...m
			};
			accessCtr.update++;
			route.fulfill({
				headers: corsHeadersAllow,
				body: JSON.stringify({ data: messages[0] })
			});
		}
	});
	await page.goto(generateAuthURL(token));
	await page.waitForNavigation({ waitUntil: 'networkidle' });
	expect(await page.innerText('div > span')).toBe(fullname.split(' ')[0]);
	expect(await page.locator('data-test-id=toggle-show').innerText()).toBe('HIDE');
	await page.click('data-test-id=email-list-label');
	const recipient = 'recipient@sejiwo.com';
	await page.keyboard.type(recipient, { delay: typingDelay });
	await page.keyboard.press('Tab', { delay });
	await page.keyboard.type(messageContent, { delay: typingDelay });
	await page.keyboard.press('Tab', { delay });
	await expect(page.locator('data-test-id=select-inactive')).toBeFocused();
	await page.keyboard.press('Tab', { delay });
	await expect(page.locator('data-test-id=select-reminder')).toBeFocused();
	await page.keyboard.press('Tab', { delay });
	await expect(page.locator('text=submit')).toBeFocused();
	await page.keyboard.press('Enter', { delay });
	expect(messages[0].messageContent).toBe(messageContent);
	expect(messages[0].inactivePeriodDays).toBe(60);
	expect(messages[0].reminderIntervalDays).toBe(15);
	expect(messages[0].emailReceivers[0]).toBe(recipient);
	expect(accessCtr).toStrictEqual({ select: 1, insert: 1, update: 0 });

	const additionalMessage = '\n\nnew line';
	await page.locator('textarea').type(additionalMessage, { delay: typingDelay });
	await page.selectOption('data-test-id=select-inactive', { index: 2 });
	await page.selectOption('data-test-id=select-reminder', { index: 1 });
	await page.click('text=submit', { delay });
	expect(messages[0].inactivePeriodDays).toBe(90);
	expect(messages[0].reminderIntervalDays).toBe(30);
	expect(await page.inputValue('data-test-id=select-inactive')).toBe('90');
	expect(await page.inputValue('data-test-id=select-reminder')).toBe('30');
	expect(accessCtr).toStrictEqual({ select: 1, insert: 1, update: 1 });

	await page.click('data-test-id=toggle-aes', { delay });
	await page.click('text=submit', { delay });
	await page.isEnabled('text=submit');
	expect(messages[0].messageContent.startsWith('aes.utf8:')).toBeTruthy();
	expect(accessCtr).toStrictEqual({ select: 1, insert: 1, update: 2 });

	await page.reload();
	await page.waitForResponse((res) => res.url().includes('/legacy-api'));
	expect(await page.isEnabled('text=submit')).toBeTruthy();
	expect(await page.inputValue('textarea')).toBe(messageContent + additionalMessage);
	expect(messages[0].inactivePeriodDays).toBe(90);
	expect(messages[0].reminderIntervalDays).toBe(30);
	expect(messages.length).toBe(1);
	expect(await page.innerText('data-test-id=toggle-aes')).toBe('CLIENT-AES:\nON');
	expect(await page.innerText('data-test-id=toggle-show')).toBe('SHOW');
	expect(await page.textContent('data-test-id=email-0')).toBe(recipient + ' ' + closeSymbol);
	expect(await page.inputValue('data-test-id=select-inactive')).toBe('90');
	expect(await page.inputValue('data-test-id=select-reminder')).toBe('30');
	expect(accessCtr).toStrictEqual({ select: 2, insert: 1, update: 2 });
});

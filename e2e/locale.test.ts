import { baseURL } from './core-test';
import test, { expect } from '@playwright/test';

const subheadingEN = 'login';
const subheadingID = 'masuk';

test('accept-language "en" no redirect', async ({ browser }) => {
	const context = await browser.newContext({ locale: 'en-US,en;q=0.8' });
	const page = await context.newPage();
	await page.goto('/?other=query&still=ok');
	expect(page.url()).toBe(`${baseURL}/?other=query&still=ok`);
	expect(await page.locator('header button').last().innerText()).toBe(subheadingEN);
	await page.goto('/?hl=id&other=query&still=ok');
	expect(page.url()).toBe(`${baseURL}/?hl=id&other=query&still=ok`);
	expect(await page.locator('header button').last().innerText()).toBe(subheadingID);
	await page.goto('/?hl=xxx&other=query&still=ok');
	expect(page.url()).toBe(`${baseURL}/?hl=xxx&other=query&still=ok`);
	expect(await page.locator('header button').last().innerText()).toBe(subheadingEN);
});

test('accept-language "id" redirect', async ({ browser }) => {
	const context = await browser.newContext({ locale: 'th-TH,id-ID;q=0.8' });
	const page = await context.newPage();
	await page.goto('/?other=query&still=ok');
	expect(page.url()).toBe(`${baseURL}/?other=query&still=ok&hl=id`);
	expect(await page.locator('header button').last().innerText()).toBe(subheadingID);
	await page.goto('/?hl=en&other=query&still=ok');
	expect(page.url()).toBe(`${baseURL}/?hl=en&other=query&still=ok`);
	expect(await page.locator('header button').last().innerText()).toBe(subheadingEN);
	await page.goto('/?hl=xxx&other=query&still=ok');
	expect(page.url()).toBe(`${baseURL}/?hl=xxx&other=query&still=ok`);
	expect(await page.locator('header button').last().innerText()).toBe(subheadingEN);
});

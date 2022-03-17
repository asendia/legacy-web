import test, { expect } from '@playwright/test';

const subheadingEN = 'LOGIN';
const subheadingID = 'MASUK';

test('accept-language "en" no redirect', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'en-US,en;q=0.8' });
  const page = await context.newPage();
  await page.goto('/?other=query&still=ok');
  expect(page.url()).toBe('http://localhost:3000/?other=query&still=ok');
  expect(await page.locator('button').first().innerText()).toBe(subheadingEN);
  await page.goto('/?hl=id&other=query&still=ok');
  expect(page.url()).toBe('http://localhost:3000/?hl=id&other=query&still=ok');
  expect(await page.locator('button').first().innerText()).toBe(subheadingID);
  await page.goto('/?hl=xxx&other=query&still=ok');
  expect(page.url()).toBe('http://localhost:3000/?hl=xxx&other=query&still=ok');
  expect(await page.locator('button').first().innerText()).toBe(subheadingEN);
});

test('accept-language "id" redirect', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'th-TH,id-ID;q=0.8' });
  const page = await context.newPage();
  await page.goto('/?other=query&still=ok');
  expect(page.url()).toBe('http://localhost:3000/?other=query&still=ok&hl=id');
  expect(await page.locator('button').first().innerText()).toBe(subheadingID);
  await page.goto('/?hl=en&other=query&still=ok');
  expect(page.url()).toBe('http://localhost:3000/?hl=en&other=query&still=ok');
  expect(await page.locator('button').first().innerText()).toBe(subheadingEN);
  await page.goto('/?hl=xxx&other=query&still=ok');
  expect(page.url()).toBe('http://localhost:3000/?hl=xxx&other=query&still=ok');
  expect(await page.locator('button').first().innerText()).toBe(subheadingEN);
});

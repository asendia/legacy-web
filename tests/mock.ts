import { expect, Page, Route } from '@playwright/test';

export const sleep = (milis: number) => new Promise((resolve) => setTimeout(resolve, milis));

export function generateAuthURL(token: string) {
  // Need to specify complete url since the driver derives protocol & host based on current url
  // in this case "https://" and "warisin.com"
  return `http://localhost:3000/?test#access_token=${token}&expires_in=3600&refresh_token=refresh&token_type=bearer`;
}

export async function mockIdentityAuthorizeAPI(page: Page, token: string) {
  return page.route('**/.netlify/identity/authorize?provider=google', async (route) => {
    route.fulfill({
      status: 302,
      headers: {
        location: generateAuthURL(token),
      },
    });
  });
}

export const corsHeadersAllow = {
  'access-control-allow-credentials': 'true',
  'access-control-allow-headers': 'Authorization',
  'access-control-allow-methods': 'OPTIONS, GET, POST',
  'access-control-allow-origin': '*',
};

export async function mockIdentityUserAPI(
  page: Page,
  token: string,
  email: string,
  fullname: string,
) {
  return page.route('**/.netlify/identity/user', async (route) => {
    const request = route.request();
    const headerValue = await request.headerValue('authorization');
    expect(headerValue).toBe('Bearer ' + token);
    route.fulfill({
      contentType: 'application/json',
      headers: corsHeadersAllow,
      body: JSON.stringify({
        id: 'Some-ID',
        aud: '',
        role: '',
        email,
        confirmed_at: '2020-09-07T13:48:13Z',
        confirmation_sent_at: '2020-09-07T13:48:07Z',
        app_metadata: { provider: 'email' },
        user_metadata: { full_name: fullname },
        created_at: '2020-09-07T13:48:07Z',
        updated_at: '2020-09-07T13:48:07Z',
      }),
    });
  });
}

interface MockMessageCallback<T> {
  (route: Route): Promise<T>;
}

interface MockMessageOptions<T> {
  responseBody?: object;
  beforeFulfill?: MockMessageCallback<T>;
  callback?: MockMessageCallback<T>;
}

export interface MessageData {
  emailReceivers: Array<string>;
  id: string;
  inactivePeriodDays: number;
  isActive: boolean;
  messageContent: string;
  reminderIntervalDays: number;
}

export async function mockMessageAPI<T>(
  page: Page,
  token: string,
  action: 'select-messages' | 'insert-message' | 'update-message',
  options: MockMessageOptions<T> = {},
) {
  return await page.route(`**/legacy-api?action=${action}`, async (route) => {
    const request = route.request();
    const headerValue = await request.headerValue('authorization');
    expect(headerValue).toBe('Bearer ' + token);
    if (options.callback) {
      return options.callback(route);
    }
    if (options.beforeFulfill) {
      await options.beforeFulfill(route);
    }
    route.fulfill({
      contentType: 'application/json',
      headers: corsHeadersAllow,
      body: JSON.stringify(options.responseBody),
    });
  });
}

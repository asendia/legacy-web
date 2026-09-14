import { API_URL } from '$lib/core/urls';
import { STORAGE_GOTRUE } from '$lib/core/storageKeys';
import * as env from '$env/static/public';

const publicSettings: Record<string, string | undefined> = env;
export const telegramEnabled = publicSettings.PUBLIC_TELEGRAM_ENABLED === 'true';
const flowKey = 'sejiwo-telegram-login';

export async function telegramRequest<T>(
	action: string,
	token?: string,
	data: Record<string, unknown> = {},
	options: Pick<RequestInit, 'signal' | 'keepalive'> = {}
): Promise<T> {
	const res = await fetch(`${API_URL}/legacy-api-telegram`, {
		...options,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {})
		},
		body: JSON.stringify({ ...data, action })
	});
	if (!res.ok)
		throw new Error('Telegram request failed. Check your account settings or try again.');
	return res.json();
}

export async function startTelegramLogin(token?: string) {
	const result = await telegramRequest<{ url: string; state: string; proof: string }>(
		token ? 'link-start' : 'login-start',
		token
	);
	sessionStorage.setItem(
		flowKey,
		JSON.stringify({ state: result.state, proof: result.proof, expiresAt: Date.now() + 300_000 })
	);
	location.assign(result.url);
}

export async function finishTelegramLogin(search: string) {
	const query = new URLSearchParams(search);
	const saved = sessionStorage.getItem(flowKey);
	sessionStorage.removeItem(flowKey);
	if (!saved) throw new Error('Start Telegram login again in this tab.');
	const flow = JSON.parse(saved);
	if (query.get('error')) throw new Error('Telegram login was cancelled.');
	if (query.get('state') !== flow.state || flow.expiresAt < Date.now() || !query.get('code')) {
		throw new Error('Telegram login has expired. Start again.');
	}
	const result = await telegramRequest<{ email: string; accessToken: string; expiresAt: number }>(
		'login-finish',
		undefined,
		{ code: query.get('code'), state: flow.state, proof: flow.proof }
	);
	localStorage.setItem(
		STORAGE_GOTRUE,
		JSON.stringify({
			email: result.email,
			app_metadata: { provider: 'telegram' },
			user_metadata: { full_name: result.email },
			token: {
				access_token: result.accessToken,
				token_type: 'bearer',
				expires_at: result.expiresAt,
				expires_in: '3600',
				refresh_token: null
			}
		})
	);
}

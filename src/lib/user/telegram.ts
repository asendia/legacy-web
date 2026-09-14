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
	if (!res.ok) {
		const fallback = 'Telegram request failed. Check your account settings or try again.';
		const messages: Record<string, string> = {
			telegram_client_settings:
				'Telegram login is not configured correctly. Please use Google for now.',
			telegram_code_rejected:
				'Telegram could not accept this login code. Start again in the same browser tab.',
			telegram_phone_required: 'To link Telegram, allow it to share your verified phone number.',
			telegram_link_required: 'Sign in with Google first, then link Telegram in Account settings.',
			telegram_link_conflict: 'This Telegram account cannot be linked to this Sejiwo account.',
			login_expired: 'Telegram login has expired. Start again in the same browser tab.'
		};
		let code = '';
		try {
			const data: unknown = await res.json();
			if (data && typeof data === 'object' && 'code' in data && typeof data.code === 'string')
				code = data.code;
		} catch {
			/* Older servers can return an empty or plain text error. */
		}
		const knownCodes = new Set([
			...Object.keys(messages),
			'login_request',
			'telegram_connection',
			'telegram_token_response',
			'telegram_token_verification',
			'telegram_nonce',
			'telegram_token_time',
			'telegram_identity',
			'telegram_exchange',
			'login_storage',
			'login_server_settings'
		]);
		throw new Error(
			knownCodes.has(code)
				? `${messages[code] || 'Telegram login could not finish. Please use Google for now.'} (${code})`
				: fallback
		);
	}
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

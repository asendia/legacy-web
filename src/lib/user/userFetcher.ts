const AUTH_URL = 'https://sejiwo.com/.netlify/identity';

export interface TokenObject {
	access_token: string;
	expires_in: string | null;
	refresh_token: string | null;
	token_type: 'bearer';
	expires_at: number | null;
}

let apiReqPromise: Promise<Response> | undefined;

export async function fetchUserToken(token: TokenObject) {
	if (apiReqPromise) {
		return apiReqPromise;
	}
	return fetch(`${AUTH_URL}/user`, {
		headers: {
			authorization: `${token.token_type[0].toUpperCase() + token.token_type.substring(1)} ${
				token.access_token
			}`
		}
	});
}

export function destroyFetchUserTokenPromise() {
	apiReqPromise = undefined;
}

export function fetchAuthorizeUser(provider: 'google' | 'github') {
	location.href = `${AUTH_URL}/authorize?provider=${provider}`;
}

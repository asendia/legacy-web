import { throwIfNonSuccessResponse } from '$lib/core/fetchHandler';
import { STORAGE_SECRET_NAME } from '$lib/messages/encryption';

const AUTH_URL = 'https://warisin.com/.netlify/identity';
const STORAGE_NAME_GOTRUE = 'gotrue.user';

export function authorizeUser(provider: 'google' | 'github') {
  window.location.href = `${AUTH_URL}/authorize?provider=${provider}`;
}

export interface AuthObject {
  url: string;
  token: {
    access_token: string;
    expires_in?: string;
    refresh_token?: string;
    token_type: 'bearer';
    expires_at?: number;
  };
  id: string;
  aud: string;
  role: string;
  email: string;
  confirmed_at: string;
  confirmation_sent_at: string;
  app_metadata: {
    provider: string;
  };
  user_metadata: {
    full_name: string;
  };
  created_at: string;
  updated_at: string;
}

let promise: Promise<AuthObject | undefined>;

export async function getAuthObject(): Promise<AuthObject | undefined> {
  if (!promise) {
    promise = _getAuthObject();
  }
  return promise;
}

async function _getAuthObject(): Promise<AuthObject | undefined> {
  const token = getTokenFromHash();
  if (token) {
    try {
      const res = await fetch(`${AUTH_URL}/user`, {
        headers: {
          authorization: `${token.token_type[0].toUpperCase() + token.token_type.substring(1)} ${
            token.access_token
          }`,
        },
      });
      throwIfNonSuccessResponse(res);
      const authObject = await res.json();
      authObject.token = token;
      localStorage.setItem(STORAGE_NAME_GOTRUE, JSON.stringify(authObject));
      location.hash = '';
      return authObject;
    } catch (err) {
      localStorage.removeItem(STORAGE_NAME_GOTRUE);
      localStorage.removeItem(STORAGE_SECRET_NAME);
      return;
    } finally {
      promise = undefined;
    }
  }

  // From localStorage
  try {
    const authObject = JSON.parse(localStorage.getItem(STORAGE_NAME_GOTRUE));
    if (
      authObject?.token.access_token.length > 0 &&
      authObject?.email.includes('@') &&
      Date.now() < authObject?.token.expires_at
    ) {
      return authObject;
    }
  } catch (err) {
    console.error(err);
  }
  localStorage.removeItem(STORAGE_NAME_GOTRUE);
  localStorage.removeItem(STORAGE_SECRET_NAME);
}

export function logout() {
  localStorage.removeItem(STORAGE_NAME_GOTRUE);
  localStorage.removeItem(STORAGE_SECRET_NAME);
  location.reload();
}

function getTokenFromHash() {
  const h = new URLSearchParams(location.hash.substring(1));
  const access_token = h.get('access_token');
  if (!access_token) {
    return null;
  }
  const expires_in = h.get('expires_in');
  const token = {
    access_token,
    expires_in,
    refresh_token: h.get('refresh_token'),
    token_type: h.get('token_type'),
    expires_at: Date.now() + parseInt(expires_in, 10) * 1000,
  };
  return token;
}

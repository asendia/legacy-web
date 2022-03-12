import { throwIfNonSuccessResponse } from '$lib/core/fetchHandler';
import { STORAGE_GOTRUE, STORAGE_ENCRYPTION_SECRET } from '$lib/core/storageKeys';
import { clearMessageCache } from '$lib/messages/messageCache';
import { destroyFetchUserTokenPromise, fetchUserToken, type TokenObject } from './userFetcher';

export interface AuthObject {
  url: string;
  token: TokenObject;
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

export async function getAuthObject(): Promise<AuthObject> {
  const token = getTokenFromHash();
  if (token) {
    try {
      const res = await fetchUserToken(token);
      throwIfNonSuccessResponse(res);
      const authObject: AuthObject = await res.json();
      authObject.token = token;
      localStorage.setItem(STORAGE_GOTRUE, JSON.stringify(authObject));
      location.hash = '';
      return authObject;
    } catch (err) {
      clearUserData();
      return;
    } finally {
      destroyFetchUserTokenPromise();
    }
  }

  // From localStorage
  const authObject = JSON.parse(localStorage.getItem(STORAGE_GOTRUE));
  if (!authObject) {
    throw new Error('auth is undefined');
  }
  if (Date.now() > authObject.token.expires_at) {
    throw new Error('auth is expired');
  }
  return authObject;
}

export function clearUserData() {
  localStorage.removeItem(STORAGE_GOTRUE);
  localStorage.removeItem(STORAGE_ENCRYPTION_SECRET);
}

export function logout() {
  clearUserData();
  clearMessageCache();
  location.reload();
}

function getTokenFromHash() {
  const h = new URLSearchParams(location.hash.substring(1));
  const access_token = h.get('access_token');
  if (!access_token) {
    return null;
  }
  const expires_in = h.get('expires_in');
  const token_type = h.get('token_type');
  if (token_type != 'bearer') {
    throw new Error('Invalid token type');
  }
  const token: TokenObject = {
    access_token,
    expires_in,
    refresh_token: h.get('refresh_token'),
    token_type,
    expires_at: Date.now() + parseInt(expires_in, 10) * 1000,
  };
  return token;
}

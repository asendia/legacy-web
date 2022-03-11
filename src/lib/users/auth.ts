import { throwIfNonSuccessResponse } from '$lib/core/fetchHandler';
import { STORAGE_SECRET_NAME } from '$lib/messages/encryption';
import { destroyFetchUserTokenPromise, fetchUserToken, type TokenObject } from './fetchUsers';

const STORAGE_NAME_GOTRUE = 'gotrue.user';

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
      localStorage.setItem(STORAGE_NAME_GOTRUE, JSON.stringify(authObject));
      location.hash = '';
      return authObject;
    } catch (err) {
      clearStorage();
      return;
    } finally {
      destroyFetchUserTokenPromise();
    }
  }

  // From localStorage
  const authObject = JSON.parse(localStorage.getItem(STORAGE_NAME_GOTRUE));
  if (!authObject) {
    throw new Error('auth is undefined');
  }
  if (Date.now() > authObject.token.expires_at) {
    throw new Error('auth is expired');
  }
  return authObject;
}

export function clearStorage() {
  localStorage.removeItem(STORAGE_NAME_GOTRUE);
  localStorage.removeItem(STORAGE_SECRET_NAME);
}
export function logout() {
  clearStorage();
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
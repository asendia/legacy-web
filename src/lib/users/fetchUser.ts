import { throwIfNonSuccessResponse } from '$lib/core/fetchHandler';
import { localStorageNameEncryption } from '$lib/messages/encryption';

const authDomain = 'warisin.com';
const localStorageNameGotrue = 'gotrue.user';

export function authorizeUser(provider: 'google' | 'github') {
  window.location.href = `https://${authDomain}/.netlify/identity/authorize?provider=${provider}`;
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

export async function getAuthObject(): Promise<AuthObject | undefined> {
  const token = getTokenFromHash();
  if (token) {
    try {
      const res = await fetch(`https://${authDomain}/.netlify/identity/user`, {
        headers: {
          authorization: `${token.token_type[0].toUpperCase() + token.token_type.substring(1)} ${
            token.access_token
          }`,
        },
      });
      throwIfNonSuccessResponse(res);
      const authObject = await res.json();
      authObject.token = token;
      localStorage.setItem(localStorageNameGotrue, JSON.stringify(authObject));
      location.hash = '';
      return authObject;
    } catch (err) {
      localStorage.removeItem(localStorageNameGotrue);
      localStorage.removeItem(localStorageNameEncryption)
      return;
    }
  }

  // From localStorage
  try {
    const authObject = JSON.parse(localStorage.getItem(localStorageNameGotrue));
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
  localStorage.removeItem(localStorageNameGotrue);
  localStorage.removeItem(localStorageNameEncryption);
}

export function logout() {
  localStorage.removeItem(localStorageNameGotrue);
  localStorage.removeItem(localStorageNameEncryption);
  location.reload();
}

function getTokenFromHash() {
  // #access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NDYzMDMxMjgsInN1YiI6ImRiZDU2NGZkLWEyZGUtNDlkYi1hOTY5LTAxYjcxNDUwOTQ5MCIsImVtYWlsIjoic3dpZnR5b3NoaW9rYUBnbWFpbC5jb20iLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCJ9LCJ1c2VyX21ldGFkYXRhIjp7ImZ1bGxfbmFtZSI6IkFzZW5kaWEgTWF5Y28ifX0.zXx4GY3kXdTV-b7n99OegGSipbad2PZnXtZeJbNY7aI&expires_in=3600&refresh_token=oh566Nb-5GvmSSl_-Hb7MA&token_type=bearer
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

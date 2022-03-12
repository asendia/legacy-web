import { throwIfNonSuccessResponse } from '$lib/core/fetchHandler';
import { API_URL } from '$lib/core/urls';

export async function extendMessage(id: string, secret: string) {
  const res = await fetch(
    `${API_URL}/legacy-api-secret` + `?action=extend-message&id=${id}&secret=${secret}`,
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );
  throwIfNonSuccessResponse(res);
  return res.json();
}

export async function unsubscribeMessage(id: string, secret: string) {
  const res = await fetch(
    `${API_URL}/legacy-api-secret` + `?action=unsubscribe-message&id=${id}&secret=${secret}`,
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );
  throwIfNonSuccessResponse(res);
  return res.json();
}

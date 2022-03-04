import { throwIfNonSuccessResponse } from '$lib/core/fetchHandler';

export const extendMessage = async function extendMessage(id: string, secret: string) {
  const res = await fetch(
    `https://asia-southeast1-monarch-public.cloudfunctions.net/legacy-api-secret` +
      `?action=extend-message&id=${id}&secret=${secret}`,
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );
  throwIfNonSuccessResponse(res);
  return res.json();
};

export const unsubscribeMessage = async function unsubscribeMessage(id: string, secret: string) {
  const res = await fetch(
    `https://asia-southeast1-monarch-public.cloudfunctions.net/legacy-api-secret` +
      `?action=unsubscribe-message&id=${id}&secret=${secret}`,
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );
  throwIfNonSuccessResponse(res);
  return res.json();
};

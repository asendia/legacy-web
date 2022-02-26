export const extendMessage = async function extendMessage(id, secret) {
  const res = await fetch(
    `https://asia-southeast1-monarch-public.cloudfunctions.net/legacy-api-secret` +
      `?action=extend-message&id=${id}&secret=${secret}`,
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
  return res.json();
};

export const unsubscribeMessage = async function unsubscribeMessage(
  id,
  secret
) {
  const res = await fetch(
    `https://asia-southeast1-monarch-public.cloudfunctions.net/legacy-api-secret` +
      `?action=unsubscribe-message&id=${id}&secret=${secret}`,
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
  return res.json();
};

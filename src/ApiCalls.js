export const protractTestamentOld = async function protractTestamentOld(
  id,
  token
) {
  const res = await fetch(
    `https://x46g8u90qd.execute-api.ap-southeast-1.amazonaws.com/default/protract`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, token }),
    }
  );
  return res.json();
};

export const unsubscribeTestamentOld = async function unsubscribeTestament(
  id,
  token,
  email
) {
  const res = await fetch(
    `https://x46g8u90qd.execute-api.ap-southeast-1.amazonaws.com/default/unsubscribe`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, token, email }),
    }
  );
  return res.json();
};

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

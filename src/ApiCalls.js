import axios from 'axios';

export const generateHeaders = async function generateHeaders(netlifyIdentity) {
  const headers = { 'Content-Type': 'application/json' };
  if (netlifyIdentity && netlifyIdentity.currentUser()) {
    const token = await netlifyIdentity.currentUser().jwt();
    return { ...headers, Authorization: `Bearer ${token}` };
  }
  return headers;
}

export const protractTestamentOld = async function protractTestamentOld(id, token) {
  const res = await axios.post(
    `https://x46g8u90qd.execute-api.ap-southeast-1.amazonaws.com/default/protract`,
    { id, token },
    { 'Content-Type': 'application/json' }
  );
  return res;
}

export const unsubscribeTestamentOld = async function unsubscribeTestament(id, token, email) {
  const res = await axios.post(
    `https://x46g8u90qd.execute-api.ap-southeast-1.amazonaws.com/default/unsubscribe`,
    { id, token, email },
    { 'Content-Type': 'application/json' }
  );
  return res;
}

export const extendMessage = async function extendMessage(id, secret) {
  const res = await axios.get(
    `https://asia-southeast1-monarch-public.cloudfunctions.net/legacy-api-secret` +
    `?action=extend-message&id=${id}&secret=${secret}`,
    { 'Content-Type': 'application/json' }
  );
  return res;
}

export const unsubscribeMessage = async function unsubscribeMessage(id, secret) {
  const res = await axios.post(
    `https://asia-southeast1-monarch-public.cloudfunctions.net/legacy-api-secret` +
    `?action=unsubscribe-message&id=${id}&secret=${secret}`,
    { 'Content-Type': 'application/json' }
  );
  return res;
}

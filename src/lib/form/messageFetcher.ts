import { throwIfNonSuccessResponse } from '$lib/core/fetchHandler';
import { API_URL } from '$lib/core/urls';
import type { MessageData } from './messageData';

export async function upsertMessage(jwt: string, data: MessageData): Promise<MessageData> {
  const headers = generateHeaders(jwt);
  const action = data.id === '' ? 'insert-message' : 'update-message';
  const res = await fetch(`${API_URL}/legacy-api?action=${action}`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers,
  });
  throwIfNonSuccessResponse(res);
  const json = await res.json();
  const newMessage = json.data;
  return newMessage;
}

export async function selectMessages(jwt: string): Promise<Array<MessageData>> {
  const headers = generateHeaders(jwt);
  const res = await fetch(`${API_URL}/legacy-api?action=select-messages`, { headers });
  throwIfNonSuccessResponse(res);
  const json = await res.json();
  const dataList = json.data;
  if (!Array.isArray(dataList)) {
    throw new Error('dataList is invalid: ' + JSON.stringify(dataList));
  }
  return dataList;
}

function generateHeaders(jwt: string) {
  const headers = { 'Content-Type': 'application/json' };
  return { ...headers, Authorization: `Bearer ${jwt}` };
}

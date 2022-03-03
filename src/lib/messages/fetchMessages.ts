// action = 'insert-message' | 'update-message'
export async function upsertMessage(
  jwt: string,
  messageID: string,
  emails: Array<string>,
  message: string,
  inactivePeriod: number,
  reminderInterval: number,
  isActive: boolean,
) {
  const headers = generateHeaders(jwt);
  const action = messageID === '' ? 'insert-message' : 'update-message';
  const res = await fetch(
    `https://asia-southeast1-monarch-public.cloudfunctions.net/legacy-api?action=${action}`,
    {
      method: 'POST',
      body: JSON.stringify({
        id: messageID,
        emailReceivers: emails,
        messageContent: message,
        inactivePeriodDays: inactivePeriod,
        reminderIntervalDays: reminderInterval,
        isActive,
      }),
      headers,
    },
  );
  const newMessage = (await res.json()).data;
  return newMessage;
}

export async function selectMessages(jwt: string) {
  const headers = generateHeaders(jwt);
  const res = await fetch(
    'https://asia-southeast1-monarch-public.cloudfunctions.net/legacy-api?action=select-messages',
    { headers },
  );
  const dataList = (await res.json()).data;
  if (!Array.isArray(dataList) || dataList.length === 0) {
    throw new Error('dataList is invalid: ' + JSON.stringify(dataList));
  }
  return dataList;
}

function generateHeaders(jwt: string) {
  const headers = { 'Content-Type': 'application/json' };
  return { ...headers, Authorization: `Bearer ${jwt}` };
}

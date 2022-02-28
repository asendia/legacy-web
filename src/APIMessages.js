// action = 'insert-message' | 'update-message'
export async function upsertMessage(
  netlifyIdentity,
  messageID,
  emails,
  message,
  inactivePeriod,
  reminderInterval,
  isActive
) {
  const headers = await generateHeaders(netlifyIdentity);
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
    }
  );
  const newMessage = (await res.json()).data;
  return newMessage;
}

export async function selectMessages(netlifyIdentity) {
  const headers = await generateHeaders(netlifyIdentity);
  const res = await fetch(
    'https://asia-southeast1-monarch-public.cloudfunctions.net/legacy-api?action=select-messages',
    { headers }
  );
  const dataList = (await res.json()).data;
  if (!Array.isArray(dataList) || dataList.length === 0) {
    throw new Error('dataList is invalid', dataList);
  }
  return dataList;
}

async function generateHeaders(netlifyIdentity) {
  const headers = { 'Content-Type': 'application/json' };
  if (netlifyIdentity && netlifyIdentity.currentUser()) {
    const token = await netlifyIdentity.currentUser().jwt();
    return { ...headers, Authorization: `Bearer ${token}` };
  }
  return headers;
}

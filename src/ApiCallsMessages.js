import axios from 'axios';
import { generateHeaders } from './ApiCalls';

// action = 'insert-message' | 'update-message'
export async function upsertMessage(netlifyIdentity, messageID, emails, message, inactivePeriod, reminderInterval, isActive) {
  const headers = await generateHeaders(netlifyIdentity);
  const action = messageID === '' ? 'insert-message' : 'update-message'
  const res = await axios.post(
    `https://asia-southeast1-monarch-public.cloudfunctions.net/legacy-api?action=${action}`,
    {
      id: messageID,
      emailReceivers: emails.map((email) => email.value),
      messageContent: message,
      inactivePeriodDays: inactivePeriod,
      reminderIntervalDays: reminderInterval,
      isActive,
    },
    { headers }
  );
  const newMessage = res.data.data
  return newMessage;
}

export async function selectMessages(netlifyIdentity) {
  const headers = await generateHeaders(netlifyIdentity);
  const res = await axios.get(
    'https://asia-southeast1-monarch-public.cloudfunctions.net/legacy-api?action=select-messages',
    { headers },
  );
  const dataList = res.data.data;
  if (!Array.isArray(dataList) || dataList.length === 0) {
    throw new Error('dataList is invalid', dataList);
  }
  return dataList;
}

import { STORAGE_ENCRYPTION_SECRET } from '$lib/core/storageKeys';
import type { AuthObject } from '$lib/users/auth';
import { decryptMessage, encryptMessage, isProbablyEncrypted } from './encryption';
import type { MessageData } from './messageData';
import { selectMessages, upsertMessage } from './messageFetcher';

export async function submitMessage(
  authObject: AuthObject,
  messageData: MessageData,
  enableClientAES: boolean,
) {
  let msg = messageData.messageContent;
  if (enableClientAES) {
    msg = encryptMessage(msg) || msg;
  } else {
    localStorage.removeItem(STORAGE_ENCRYPTION_SECRET);
  }
  const message = await upsertMessage(authObject.token.access_token, {
    ...messageData,
    messageContent: msg,
  });
  return { ...messageData, id: message.id };
}

export async function getMessageData(authObject: AuthObject, enableClientAES: boolean) {
  const dataList = await selectMessages(authObject.token.access_token);
  if (dataList.length === 0) {
    throw new Error('message length is 0');
  }
  const d = dataList[0];
  let msg = d.messageContent;
  if (isProbablyEncrypted(msg)) {
    msg = decryptMessage(msg) || msg;
    enableClientAES = true;
  }
  return { messageData: { ...d, messageContent: msg }, enableClientAES };
}

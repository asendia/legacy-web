import { STORAGE_ENCRYPTION_SECRET } from '$lib/core/storageKeys';
import type { AuthObject } from '$lib/user/auth';
import {
	decryptMessageWithPrompt,
	encryptMessageWithPrompt,
	isProbablyEncrypted
} from '$lib/content/encryption';
import { selectMessages, upsertMessage } from './messageFetcher';
import type { TranslationFunction } from '$lib/i18n/translation';

export interface MessageData {
	id: string;
	emailReceivers: Array<string>;
	isActive: boolean;
	messageContent: string;
	inactivePeriodDays: number;
	reminderIntervalDays: number;
}

export const defaultMessageData = {
	emailReceivers: [] as Array<string>,
	id: '',
	inactivePeriodDays: 60,
	isActive: true,
	messageContent: '',
	reminderIntervalDays: 15
};

export async function submitMessageData(
	authObject: AuthObject,
	messageData: MessageData,
	enableClientAES: boolean,
	tr: TranslationFunction
) {
	let msg = messageData.messageContent;
	if (enableClientAES) {
		msg = encryptMessageWithPrompt(msg, tr) || msg;
	} else {
		localStorage.removeItem(STORAGE_ENCRYPTION_SECRET);
	}
	const message = await upsertMessage(authObject.token.access_token, {
		...messageData,
		messageContent: msg
	});
	return { ...messageData, id: message.id };
}

export async function getMessageData(
	authObject: AuthObject,
	enableClientAES: boolean,
	tr: TranslationFunction
) {
	if (!authObject) {
		throw new Error('auth is undefined');
	}
	const dataList = await selectMessages(authObject.token.access_token);
	if (dataList.length === 0) {
		throw new Error('message length is 0');
	}
	const d = dataList[0];
	let msg = d.messageContent;
	if (isProbablyEncrypted(msg)) {
		msg = decryptMessageWithPrompt(msg, tr) || msg;
		enableClientAES = true;
	}
	return { messageData: { ...d, messageContent: msg }, enableClientAES };
}

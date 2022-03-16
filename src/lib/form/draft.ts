import { STORAGE_MESSAGE_CONTENT, STORAGE_EMAIL_RECEIVERS } from '$lib/core/storageKeys';

export function setDraftEmailReceivers(emailReceivers: Array<string>) {
  sessionStorage.setItem(STORAGE_EMAIL_RECEIVERS, JSON.stringify(emailReceivers));
}

export function setDraftMessageContent(messageContent: string) {
  sessionStorage.setItem(STORAGE_MESSAGE_CONTENT, messageContent);
}

export function getDraftEmailReceivers(): Array<string> {
  return JSON.parse(sessionStorage.getItem(STORAGE_EMAIL_RECEIVERS)) || [];
}

export function getDraftMessageContent(): string {
  return sessionStorage.getItem(STORAGE_MESSAGE_CONTENT) || '';
}

export function clearDraft() {
  sessionStorage.removeItem(STORAGE_EMAIL_RECEIVERS);
  sessionStorage.removeItem(STORAGE_MESSAGE_CONTENT);
}

export function consolidateDraft(
  emailReceivers: Array<string>,
  messageContent: string,
  confirmCallback: () => boolean,
) {
  // Consolidate API response with user cache
  const cReceivers = getDraftEmailReceivers();
  const cContent = getDraftMessageContent();
  const isConflicted =
    (() => {
      if (emailReceivers.length === 0 || cReceivers.length === 0) {
        return false;
      }
      if (emailReceivers.length === cReceivers.length) {
        for (let i = 0; i < cReceivers.length; i++) {
          if (emailReceivers[i] !== cReceivers[i]) {
            return true;
          }
        }
      }
      return false;
    })() || !(messageContent === '' || cContent === '' || messageContent === cContent);
  if (isConflicted) {
    if (!confirmCallback()) {
      emailReceivers = cReceivers;
      messageContent = cContent;
    }
  } else {
    emailReceivers = emailReceivers.length ? emailReceivers : cReceivers;
    messageContent = messageContent || cContent;
  }
  setDraftEmailReceivers(emailReceivers);
  setDraftMessageContent(messageContent);
  return { emailReceivers, messageContent };
}

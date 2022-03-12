import { STORAGE_MESSAGE_CONTENT, STORAGE_EMAIL_RECEIVERS } from '$lib/core/storageKeys';

export function setEmailReceiversCache(emailReceivers: Array<string>) {
  sessionStorage.setItem(STORAGE_EMAIL_RECEIVERS, JSON.stringify(emailReceivers));
}

export function setMessageContentCache(messageContent: string) {
  sessionStorage.setItem(STORAGE_MESSAGE_CONTENT, messageContent);
}

export function getEmailReceiversCache(): Array<string> {
  return JSON.parse(sessionStorage.getItem(STORAGE_EMAIL_RECEIVERS)) || [];
}

export function getMessageContentCache(): string {
  return sessionStorage.getItem(STORAGE_MESSAGE_CONTENT) || '';
}

export function clearMessageCache() {
  sessionStorage.removeItem(STORAGE_EMAIL_RECEIVERS);
  sessionStorage.removeItem(STORAGE_MESSAGE_CONTENT);
}

export function consolidateCache(emailReceivers: Array<string>, messageContent: string) {
  // Consolidate API response with user cache
  const cReceivers = getEmailReceiversCache();
  const cContent = getMessageContentCache();
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
    if (
      !confirm(
        'Data conflict, do you want to use data from the server instead?\nRecipients: ' +
          emailReceivers.join(', ') +
          '\nContent: ' +
          messageContent,
      )
    ) {
      emailReceivers = cReceivers;
      messageContent = cContent;
    }
  } else {
    emailReceivers = emailReceivers.length ? emailReceivers : cReceivers;
    messageContent = messageContent || cContent;
  }
  setEmailReceiversCache(emailReceivers);
  setMessageContentCache(messageContent);
  return { emailReceivers, messageContent };
}

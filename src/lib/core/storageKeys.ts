// Key for local or sessionStorage
// e.g. localStorage|sessionStorage.getItem(STORAGE_GOTRUE)

// [LocalStorage] User session data: https://github.com/netlify/gotrue
export const STORAGE_GOTRUE = 'gotrue.user';
// [LocalStorage] AES encryption key (crypto.js) to encrypt & decrypt message content on browser-side
export const STORAGE_ENCRYPTION_SECRET = 'encryption.secret';
// [SessionStorage] List of will/testament receivers / recipients
export const STORAGE_EMAIL_RECEIVERS = 'message.receivers';
// [SessionStorage] Message content (decrypted)
export const STORAGE_MESSAGE_CONTENT = 'message.content';

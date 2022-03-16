import { STORAGE_ENCRYPTION_SECRET } from '$lib/core/storageKeys';
import type { TranslationFunction } from '$lib/i18n/translation';
import AES from 'crypto-js/aes.js';
import cryptoJS_UTF8 from 'crypto-js/enc-utf8.js';

interface EncryptionConfig {
  cipher: 'aes';
  secret: string;
  encoding: 'utf8';
}

const defaultConfig: EncryptionConfig = {
  cipher: 'aes',
  secret: '',
  encoding: 'utf8',
};
const secretLength = 32;
const encryptPrefixText = `${defaultConfig.cipher}.${defaultConfig.encoding}:`;

export function encryptMessageWithPrompt(text: string, tr: TranslationFunction) {
  // Prevent double encryption
  if (isProbablyEncrypted(text) || text === '') {
    return text;
  }
  try {
    let secret = localStorage.getItem(STORAGE_ENCRYPTION_SECRET);
    if (!secret) {
      console.log('Generating encryption config');
      secret = randomString(secretLength);
      localStorage.setItem(STORAGE_ENCRYPTION_SECRET, secret);
    }
    prompt(tr('backupSecret'), secret);
    const encryptedText = encryptPrefixText + AES.encrypt(text, secret).toString();
    return encryptedText;
  } catch (err) {
    console.error('Probably your browser does not support crypto:', err);
    return null;
  }
}

export function decryptMessageWithPrompt(text: string, tr: TranslationFunction) {
  // Prevent decrypting non encrypted text
  if (!isProbablyEncrypted(text)) {
    return text;
  }
  try {
    text = text.replace(encryptPrefixText, '');
    let secret = localStorage.getItem(STORAGE_ENCRYPTION_SECRET);
    if (!secret) {
      secret = prompt(tr('provideSecret'));
      if (!secret) {
        return null;
      }
      localStorage.setItem(STORAGE_ENCRYPTION_SECRET, secret);
    }
    const decryptedText = AES.decrypt(text, secret).toString(cryptoJS_UTF8);
    if (decryptedText === '') {
      localStorage.removeItem(STORAGE_ENCRYPTION_SECRET);
    }
    return decryptedText;
  } catch (err) {
    console.error('Probably your browser does not support crypto:', err);
    return null;
  }
}

export function isProbablyEncrypted(text: string) {
  const isEncrypted = text.startsWith(encryptPrefixText);
  return isEncrypted;
}

export function getEncryptionSecret() {
  try {
    const secret = localStorage.getItem(STORAGE_ENCRYPTION_SECRET);
    return secret;
  } catch (err) {
    console.error('Cannot get encryption secret:', err);
    return null;
  }
}

function randomString(length: number) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  for (let i = 0; i < length; i++) {
    result += charset[values[i] % charset.length];
  }
  return result;
}

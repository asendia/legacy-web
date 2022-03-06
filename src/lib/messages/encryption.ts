import AES from 'crypto-js/aes';
import cryptoJS_UTF8 from 'crypto-js/enc-utf8';
const localStorageKey = 'encryption.config';

interface EncryptionConfig {
  cipher: 'aes';
  secret: string;
  encoding: 'utf8';
}

export function encrypt(text: string) {
  try {
    let config: EncryptionConfig = JSON.parse(localStorage.getItem(localStorageKey));
    if (!isValidConfig(config)) {
      console.log('Generating encryption config');
      config = {
        cipher: 'aes',
        secret: randomString(20),
        encoding: 'utf8',
      };
      localStorage.setItem(localStorageKey, JSON.stringify(config));
    }
    const encryptedText = AES.encrypt(text, config.secret).toString();
    return encryptedText;
  } catch (err) {
    console.error('Probably your browser does not support crypto:', err);
    return null;
  }
}

export function decrypt(text: string) {
  try {
    const config: EncryptionConfig = JSON.parse(localStorage.getItem(localStorageKey));
    if (!isValidConfig(config)) {
      return null;
    }
    const decryptedText = AES.decrypt(text, config.secret).toString(cryptoJS_UTF8);
    return decryptedText;
  } catch (err) {
    console.error('Probably your browser does not support crypto:', err);
    return null;
  }
}

function isValidConfig(config: EncryptionConfig) {
  const isValid = !(config?.cipher !== 'aes' || config?.secret?.length !== 20 || 
    config?.encoding !== 'utf8');
  return isValid;
}

function randomString(length: number) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const values = new Uint32Array(length);
  window.crypto.getRandomValues(values);
  for (let i = 0; i < length; i++) {
    result += charset[values[i] % charset.length];
  }
  return result;
}

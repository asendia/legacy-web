import AES from 'crypto-js/aes.js';
import cryptoJS_UTF8 from 'crypto-js/enc-utf8.js';

export const localStorageNameEncryption = 'encryption.config';

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
const encryptPrefixText = `${defaultConfig.cipher}.${defaultConfig.encoding}:`;

export function encryptMessage(text: string) {
  // Prevent double encryption
  if (isProbablyEncrypted(text)) {
    return text;
  }
  try {
    let config: EncryptionConfig = JSON.parse(localStorage.getItem(localStorageNameEncryption));
    if (!isValidConfig(config)) {
      console.log('Generating encryption config');
      config = {
        cipher: defaultConfig.cipher,
        secret: randomString(20),
        encoding: defaultConfig.encoding,
      };
      localStorage.setItem(localStorageNameEncryption, JSON.stringify(config));
    }
    prompt(
      'Please make a copy of this secret and send it to the recipients. ' +
        'This secret will be gone after some time and no one, including us, ' +
        'will not be able to decrypt the message if you lost it.',
      JSON.stringify(getEncryptionConfig()),
    );
    const encryptedText = encryptPrefixText + AES.encrypt(text, config.secret).toString();
    return encryptedText;
  } catch (err) {
    console.error('Probably your browser does not support crypto:', err);
    return null;
  }
}

export function decryptMessage(text: string) {
  // Prevent decrypting non encrypted text
  if (!isProbablyEncrypted(text)) {
    return null;
  }
  try {
    text = text.replace(encryptPrefixText, '');
    let config: EncryptionConfig = JSON.parse(localStorage.getItem(localStorageNameEncryption));
    if (!isValidConfig(config)) {
      const configParam = prompt(
        'It seems like your message is encrypted and the secret is gone. ' +
          'Please enter your secret if you wish to decrypt it.',
      );
      config = JSON.parse(configParam);
      if (!isValidConfig(config)) {
        return null;
      }
      localStorage.setItem(localStorageNameEncryption, configParam);
    }
    const decryptedText = AES.decrypt(text, config.secret).toString(cryptoJS_UTF8);
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

export function getEncryptionConfig() {
  try {
    const config: EncryptionConfig = JSON.parse(localStorage.getItem(localStorageNameEncryption));
    if (!isValidConfig(config)) {
      return null;
    }
    return config;
  } catch (err) {
    console.error('Cannot get encryption config:', err);
    return null;
  }
}

function isValidConfig(config: EncryptionConfig) {
  const isValid = !(
    config?.cipher !== defaultConfig.cipher ||
    config?.secret?.length !== 20 ||
    config?.encoding !== defaultConfig.encoding
  );
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

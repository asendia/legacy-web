import { initTranslation, type TranslationData } from './translation';

export const locales = ['en', 'id'];

export async function i18n(locale: string) {
  let translationData: TranslationData;
  switch (locale) {
    case 'id': {
      translationData = (await import('$lib/i18n/translationData_id')).translationData;
      break;
    }
    case 'en':
    default: {
      locale = 'en';
      translationData = (await import('$lib/i18n/translationData_en')).translationData;
    }
  }
  const tr = initTranslation(translationData);
  return { tr, locale };
}

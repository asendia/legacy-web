import { initTranslation, type TranslationData, type TranslationFunction } from './translation';

export const locales = ['en', 'id'];

export interface I18nContext {
	tr: TranslationFunction;
	locale: string;
	url: URL;
}

export async function i18n(locale: string | null) {
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

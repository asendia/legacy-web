export interface TranslationData {
  [key: string]: string;
}
export interface TranslationFunction {
  (key: string): string;
}

export function initTranslation(data: TranslationData) {
  return function tr(key: string): string {
    const str = data[key];
    if (typeof str === 'string') {
      return str;
    }
    return key;
  } as TranslationFunction;
}

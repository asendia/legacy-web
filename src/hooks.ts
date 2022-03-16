import { getHostLanguageFromSearch, locales } from '$lib/i18n/i18n';
import type { Handle } from '@sveltejs/kit';
export const handle: Handle = async function handle({ event, resolve }) {
  // Search locale based on hl query string
  const hl = getHostLanguageFromSearch(event.url.search);
  const hlLocale = getHostLanguageLocale(hl);
  // Search locale based on accept-language header
  const accLang = event.request.headers.get('accept-language') ?? '';
  const prefLocale = getUserPreferredLocale(accLang);
  if (!hlLocale && prefLocale !== locales[0]) {
    const r = new Response('', {
      status: 302,
      headers: {
        location: '/?hl=' + prefLocale,
      },
    });
    return r;
  }
  const response = await resolve(event, {
    ssr: true,
    transformPage: ({ html }) => html.replace('%svelte.lang%', hlLocale || 'en'),
  });
  return response;
};

function getHostLanguageLocale(hl: string) {
  let locale: string;
  for (const l of locales) {
    if (l === hl) {
      locale = l;
      return locale;
    }
  }
  return locale;
}

function getUserPreferredLocale(accLang: string) {
  let userPreferredLocale = 'en';
  const accLangList = accLang.split(',');
  for (const accL of accLangList) {
    for (const l of locales) {
      if (accL.startsWith(l)) {
        userPreferredLocale = l;
        return userPreferredLocale;
      }
    }
  }
  return userPreferredLocale;
}

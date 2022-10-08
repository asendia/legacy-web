import { locales } from '$lib/i18n/i18n';
import type { Handle } from '@sveltejs/kit';
export const handle: Handle = async function handle({ event, resolve }) {
	if (event.url.pathname !== '/') {
		const response = resolve(event);
		return response;
	}
	// Search locale based on hl query string
	const hl = event.url.searchParams.get('hl');
	const hlLocale = getHostLanguageLocale(hl);
	// Search locale based on accept-language header
	const accLang = event.request.headers.get('accept-language') ?? '';
	const prefLocale = getUserPreferredLocale(accLang);
	if (!hl && prefLocale !== locales[0]) {
		const p = event.url.searchParams;
		p.set('hl', prefLocale);
		const location = event.url.pathname + '?' + p.toString();
		const r = new Response('', {
			status: 302,
			headers: {
				location
			}
		});
		return r;
	}
	const response = await resolve(event, {
		transformPageChunk: ({ html, done }) => {
			if (done) {
				const htmlWithLang = html.replace('%sveltekit.lang%', hlLocale);
				return htmlWithLang;
			}
		}
	});
	response.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
	response.headers.set('feature-policy', 'fullscreen=()');
	response.headers.set('x-xss-protection', '1; mode=block');
	response.headers.set('x-content-type-options', 'nosniff');
	response.headers.set('x-frame-options', 'deny');
	response.headers.set('cache-control', 's-maxage=60, stale-while-revalidate');
	return response;
};

function getHostLanguageLocale(hl: string | null) {
	let locale: string;
	for (const l of locales) {
		if (l === hl) {
			locale = l;
			return locale;
		}
	}
	return 'en';
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

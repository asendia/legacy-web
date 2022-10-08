import type { Load } from '@sveltejs/kit';
import { i18n } from '$lib/i18n/i18n';
export const load: Load = async function load({ url }) {
	const hl = url.searchParams.get('hl');
	const { tr, locale } = await i18n(hl);
	return {
		tr,
		locale,
		url
	};
};

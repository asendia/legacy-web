<script lang="ts">
	import Footer from '$lib/core/Footer.svelte';
	import Header from '$lib/core/Header.svelte';
	import Form from '$lib/form/form.svelte';
	import type { I18nContext } from '$lib/i18n/i18n';
	import SEO from '$lib/i18n/SEO.svelte';
	import type { TranslationFunction } from '$lib/i18n/translation';
	import { handleHashVisit } from '$lib/user/auth';
	import { onMount, setContext } from 'svelte';
	export let data: { tr: TranslationFunction; locale: string; url: URL };
	const { tr, locale, url } = data;
	setContext<I18nContext>('i18n', { tr, locale, url });

	onMount(async () => {
		try {
			await handleHashVisit();
		} catch (err) {
			console.error(err);
		}
	});
</script>

<svelte:head>
	<title>{tr('title')}</title>
	<meta name="description" content={tr('description')} />
	<SEO {locale} pathname={url.pathname} />
</svelte:head>
<div class="m-auto tracking-wider box-border px-6 py-2 md:px-24">
	<div class="min-h-[90vh]">
		<Header />
		<div class="h-7" />
		<Form />
	</div>
	<Footer />
</div>

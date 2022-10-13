<script lang="ts">
	import { blue, darkGrey, grey, lightGrey } from '$lib/core/colors';
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
	const colorPalette =
		`--color-grey:${grey};--color-blue:${blue};` +
		`--color-darkgrey:${darkGrey};--color-lightgrey:${lightGrey};`;

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
<div class="wrapper" style={colorPalette}>
	<div>
		<Header />
		<div class="separator" />
		<Form />
	</div>
	<Footer />
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: 'Roboto', sans-serif;
	}
	.wrapper {
		margin: auto;
		letter-spacing: 1px;
		box-sizing: border-box;
		padding: 10px 24px 0 24px;
	}
	.wrapper > div {
		min-height: 90vh;
	}
	.separator {
		height: 30px;
	}
	@media screen and (min-width: 800px) {
		.wrapper {
			padding: 10px 100px;
		}
	}
</style>

<script lang="ts" context="module">
  import type { Load } from '@sveltejs/kit';
  import { i18n, type I18nContext } from '$lib/i18n/i18n';
  export const load: Load = async function load({ url }) {
    const hl = url.searchParams.get('hl');
    const { tr, locale } = await i18n(hl);
    return {
      status: 200,
      props: {
        tr,
        locale,
        url,
      },
    };
  };
</script>

<script lang="ts">
  import Header from '$lib/core/Header.svelte';
  import Footer from '$lib/core/Footer.svelte';
  import { blue, darkGrey, grey, lightGrey } from '$lib/core/colors';
  import Form from '$lib/form/form.svelte';
  import { onMount, setContext } from 'svelte';
  import { handleHashVisit } from '$lib/user/auth';
  import { handleQueryVisit } from '$lib/query-string/queryStringHandler';
  import type { TranslationFunction } from '$lib/i18n/translation';
  import SEO from '$lib/i18n/SEO.svelte';
  export let tr: TranslationFunction;
  export let locale: string;
  export let url: URL;
  setContext<I18nContext>('i18n', { tr, locale, url });
  onMount(async () => {
    try {
      await handleQueryVisit(
        tr('messageExtended'),
        tr('messageUnsubscribed'),
        tr('queryActionError'),
      );
      await handleHashVisit();
    } catch (err) {
      switch (err.message) {
        default:
          console.error(err);
      }
    }
  });
  const colorPalette =
    `--color-grey:${grey};--color-blue:${blue};` +
    `--color-darkgrey:${darkGrey};--color-lightgrey:${lightGrey};`;
</script>

<svelte:head>
  <title>{tr('title')}</title>
  <meta name="description" content={tr('description')} />
  <SEO {locale} pathname={url.pathname} />
</svelte:head>
<div class="wrapper" style={colorPalette}>
  <Header />
  <div class="separator" />
  <Form />
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
  .separator {
    height: 30px;
  }
  @media screen and (min-width: 800px) {
    .wrapper {
      padding: 10px 100px;
    }
  }
</style>

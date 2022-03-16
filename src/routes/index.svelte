<script lang="ts" context="module">
  import { initTranslation, type TranslationData } from '$lib/i18n/translation';
  export async function load({ url }) {
    const p = new URLSearchParams(url.search);
    const locale = p.get('hl') || 'en';
    let translationData: TranslationData;
    switch (locale) {
      case 'id': {
        translationData = (await import('$lib/i18n/translationData_id')).translationData;
        break;
      }
      case 'en':
      default: {
        translationData = (await import('$lib/i18n/translationData_en')).translationData;
      }
    }
    const tr = initTranslation(translationData);
    return {
      status: 200,
      props: {
        tr,
        locale,
      },
    };
  }
</script>

<script lang="ts">
  import Header from '$lib/core/Header.svelte';
  import Login from '$lib/user/Login.svelte';
  import Footer from '$lib/core/Footer.svelte';
  import { blue, darkGrey, grey, lightGrey } from '$lib/core/colors';
  import Form from '$lib/form/form.svelte';
  import { onMount, setContext } from 'svelte';
  import { handleHashVisit } from '$lib/user/auth';
  import { handleQueryVisit } from '$lib/query-string/queryStringHandler';
  import type { TranslationFunction } from '$lib/i18n/translation';
  export let tr: TranslationFunction;
  setContext('tr', tr);
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
    `--color-darkgrey:${darkGrey};--color-lightgrey:${lightGrey}`;
</script>

<svelte:head>
  <title>{tr('title')}</title>
  <meta name="description" content={tr('description')} />
</svelte:head>
<div class="wrapper" style={colorPalette}>
  <Header />
  <Login />
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
    max-width: 450px;
    margin: auto;
    letter-spacing: 1px;
    padding: 0 24px;
  }
  .separator {
    height: 30px;
  }
</style>

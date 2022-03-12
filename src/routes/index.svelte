<script lang="ts">
  import Header from '$lib/core/Header.svelte';
  import Login from '$lib/user/Login.svelte';
  import Footer from '$lib/core/Footer.svelte';
  import { blue, darkGrey, grey, lightGrey } from '$lib/core/colors';
  import Form from '$lib/form/form.svelte';
  import { onMount } from 'svelte';
  import { handleHashVisit } from '$lib/user/auth';
  import { handleQueryVisit } from '$lib/query-string/queryStringHandler';
  onMount(async () => {
    try {
      await handleQueryVisit();
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
  <title>Warisin - Your testament in the cloud</title>
  <meta name="description" content="Warisin is a secure testament storage and delivery service" />
</svelte:head>
<div class="wrapper" style={colorPalette}>
  <Header />
  <Login />
  <div class="separator" />
  <Form />
  <Footer />
</div>

<style>
  :global(html) {
    background-color: #e2e2e2;
  }
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

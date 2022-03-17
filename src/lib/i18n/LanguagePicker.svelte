<script lang="ts">
  import type { HTMLElementEvent } from '$lib/core/types';
  import { type I18nContext, locales } from '$lib/i18n/i18n';
  import { getContext } from 'svelte';
  const { locale, url } = getContext<I18nContext>('i18n');
  function handleChange(e: HTMLElementEvent<HTMLSelectElement>) {
    url.searchParams.set('hl', e.target.value);
    location.href = url.pathname + '?' + url.searchParams.toString();
  }
</script>

<select on:change={handleChange}>
  {#each locales as loc}
    <option selected={loc === locale} value={loc}>{loc.toUpperCase()}</option>
  {/each}
</select>

<style>
  select {
    border: none;
    border: 1px solid transparent;
    color: var(--color-blue);
    cursor: pointer;
    background: none;
    font-weight: 300;
    margin-right: 10px;
  }
  select:focus {
    outline-width: 0;
    border: 1px solid var(--color-blue);
    border-radius: 3px;
  }
</style>

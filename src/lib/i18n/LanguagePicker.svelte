<script lang="ts">
	import { type I18nContext, locales } from '$lib/i18n/i18n';
	import { getContext } from 'svelte';
	const { locale, url } = getContext<I18nContext>('i18n');
</script>

<select
	class="border border-[transparent] text-blue cursor-pointer bg-none font-light mr-2 focus:outline-0 focus:border focus:border-blue focus:rounded-sm"
	on:change={(e) => {
		url.searchParams.set('hl', e.currentTarget.value);
		location.href = url.pathname + '?' + url.searchParams.toString();
	}}
>
	{#each locales as loc}
		<option selected={loc === locale} value={loc}>{loc.toUpperCase()}</option>
	{/each}
</select>

<script lang="ts">
	import { type I18nContext, locales } from '$lib/i18n/i18n';
	import { getContext } from 'svelte';
	const { locale, url } = getContext<I18nContext>('i18n');
</script>

<select
	class="text-blue focus:border-blue mr-2 cursor-pointer border border-[transparent] bg-none font-light focus:rounded-sm focus:border focus:outline-0"
	on:change={(e) => {
		url.searchParams.set('hl', e.currentTarget.value);
		location.href = url.pathname + '?' + url.searchParams.toString();
	}}
>
	{#each locales as loc (loc)}
		<option selected={loc === locale} value={loc}>{loc.toUpperCase()}</option>
	{/each}
</select>

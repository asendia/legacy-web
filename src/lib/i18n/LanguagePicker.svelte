<script lang="ts">
	import { type I18nContext, locales } from '$lib/i18n/i18n';
	import { getContext } from 'svelte';
	const { locale, url } = getContext<I18nContext>('i18n');
</script>

<select
	class="mr-3 cursor-pointer rounded-md border border-transparent bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:border-gray-500 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:outline-none"
	on:change={(e) => {
		url.searchParams.set('hl', e.currentTarget.value);
		location.href = url.pathname + '?' + url.searchParams.toString();
	}}
>
	{#each locales as loc (loc)}
		<option selected={loc === locale} value={loc}>{loc.toUpperCase()}</option>
	{/each}
</select>

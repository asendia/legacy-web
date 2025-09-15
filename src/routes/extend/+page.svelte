<script lang="ts">
	import type { TranslationFunction } from '$lib/i18n/translation';
	import { extendMessage } from '$lib/query-string/queryStringFetcher';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';

	export let data: { tr: TranslationFunction; locale: string; url: URL };
	const { tr } = data;

	let state: 'loading' | 'success' | 'error' | 'invalid-request' = 'loading';
	onMount(async () => {
		const qs = new URLSearchParams(location.search);
		const secret = qs.get('secret');
		const id = qs.get('id');
		if (id && secret) {
			try {
				await extendMessage(id, secret);
				state = 'success';
				return;
			} catch {
				state = 'error';
				return;
			}
		}
		state = 'invalid-request';
	});
</script>

<svelte:head>
	<title>{tr('extendTitle')}</title>
</svelte:head>
<div class="text-center">
	{#if state === 'success'}
		{tr('extendSuccess')}
	{:else if state === 'error'}
		<p>Error: {tr('secretAPIError')}</p>
		<a href={resolve('/')}>Home</a>
	{:else if state === 'invalid-request'}
		<p>Error: {tr('secretAPIInvalidRequest')}</p>
		<a href={resolve('/')}>Home</a>
	{:else if state === 'loading'}
		{tr('loading')}
	{/if}
</div>

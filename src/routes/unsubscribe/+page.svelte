<script lang="ts">
	import type { TranslationFunction } from '$lib/i18n/translation';
	import { unsubscribeMessage } from '$lib/query-string/queryStringFetcher';
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
				await unsubscribeMessage(id, secret);
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
	<title>{tr('unsubscribeTitle')}</title>
</svelte:head>
<div class="mx-auto max-w-2xl px-6 py-16 text-center">
	<div class="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
		{#if state === 'success'}
			<div class="mb-6">
				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100"
				>
					<svg class="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 13l4 4L19 7"
						/>
					</svg>
				</div>
				<h1 class="mb-3 text-2xl font-light text-gray-900">Unsubscribed Successfully</h1>
				<p class="leading-relaxed text-gray-600">{tr('messageExtended')}</p>
			</div>
		{:else if state === 'error'}
			<div class="mb-6">
				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100"
				>
					<svg class="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</div>
				<h1 class="mb-3 text-2xl font-light text-gray-900">Error</h1>
				<p class="mb-6 leading-relaxed text-gray-600">{tr('secretAPIError')}</p>
				<a
					href={resolve('/')}
					class="inline-flex items-center rounded-md bg-gray-800 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-900 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
				>
					Return Home
				</a>
			</div>
		{:else if state === 'invalid-request'}
			<div class="mb-6">
				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100"
				>
					<svg class="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
						/>
					</svg>
				</div>
				<h1 class="mb-3 text-2xl font-light text-gray-900">Invalid Request</h1>
				<p class="mb-6 leading-relaxed text-gray-600">{tr('secretAPIInvalidRequest')}</p>
				<a
					href={resolve('/')}
					class="inline-flex items-center rounded-md bg-gray-800 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-900 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
				>
					Return Home
				</a>
			</div>
		{:else if state === 'loading'}
			<div class="mb-6">
				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100"
				>
					<div
						class="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"
					></div>
				</div>
				<h1 class="mb-3 text-2xl font-light text-gray-900">Processing</h1>
				<p class="leading-relaxed text-gray-600">{tr('loading')}</p>
			</div>
		{/if}
	</div>
</div>

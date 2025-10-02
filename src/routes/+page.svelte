<script lang="ts">
	import Footer from '$lib/core/Footer.svelte';
	import Header from '$lib/core/Header.svelte';
	import Form from '$lib/form/form.svelte';
	import type { I18nContext } from '$lib/i18n/i18n';
	import SEO from '$lib/i18n/SEO.svelte';
	import type { TranslationFunction } from '$lib/i18n/translation';
	import { handleHashVisit, getTokenFromHash } from '$lib/user/auth';
	import { onMount, setContext } from 'svelte';
	export let data: { tr: TranslationFunction; locale: string; url: URL };
	const { tr, locale, url } = data;
	setContext<I18nContext>('i18n', { tr, locale, url });

	let isAuthenticating = false;
	let authError = '';

	onMount(async () => {
		// Check if we're processing a login callback
		if (getTokenFromHash()) {
			isAuthenticating = true;
			try {
				await handleHashVisit();
				// Page will reload after successful authentication
			} catch (err) {
				isAuthenticating = false;
				authError = err instanceof Error ? err.message : tr('authenticationFailed');
				console.error('Authentication error:', err);
			}
		}
	});
</script>

<svelte:head>
	<title>{tr('title')}</title>
	<meta name="description" content={tr('description')} />
	<SEO {locale} pathname={url.pathname} />
</svelte:head>
<div class="mx-auto max-w-4xl px-4 py-3 md:px-6">
	<div class="min-h-[85vh]">
		<Header />
		<main class="space-y-6">
			{#if isAuthenticating}
				<div class="flex flex-col items-center justify-center space-y-4 py-12">
					<!-- Modern animated loader -->
					<div class="relative">
						<!-- Outer ring -->
						<div class="h-16 w-16 rounded-full border-4 border-gray-100"></div>
						<!-- Animated spinner -->
						<div
							class="absolute inset-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-gray-800 border-r-gray-600"
						></div>
						<!-- Inner glow effect -->
						<div
							class="absolute inset-2 h-12 w-12 rounded-full bg-gradient-to-tr from-gray-100 to-transparent opacity-60"
						></div>
					</div>
					<!-- Elegant text with subtle animation -->
					<div class="space-y-1.5 text-center">
						<p class="text-base font-medium text-gray-800">{tr('authenticating')}</p>
						<div class="flex items-center justify-center space-x-1">
							<div
								class="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-700 [animation-delay:-0.3s]"
							></div>
							<div
								class="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-700 [animation-delay:-0.15s]"
							></div>
							<div class="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-700"></div>
						</div>
					</div>
				</div>
			{:else if authError}
				<div
					class="rounded-lg border border-gray-300 bg-gradient-to-br from-gray-50 to-white p-4 shadow-sm"
				>
					<div class="flex">
						<div class="flex-shrink-0">
							<div class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
								<svg class="h-4 w-4 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
									<path
										fill-rule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
										clip-rule="evenodd"
									/>
								</svg>
							</div>
						</div>
						<div class="ml-3 flex-1">
							<h3 class="text-sm font-semibold text-gray-900">{tr('authenticationError')}</h3>
							<div class="mt-1.5 text-sm text-gray-700">
								<p>{authError}</p>
							</div>
							<div class="mt-3">
								<button
									type="button"
									on:click={() => {
										authError = '';
										location.hash = '';
									}}
									class="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
								>
									<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
									{tr('dismiss')}
								</button>
							</div>
						</div>
					</div>
				</div>
			{/if}
			<Form />
		</main>
	</div>
	<Footer />
</div>

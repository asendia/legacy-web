<script lang="ts">
	import { type I18nContext, locales } from '$lib/i18n/i18n';
	import { getContext } from 'svelte';
	const { locale, url } = getContext<I18nContext>('i18n');

	let isOpen = false;

	function toggleDropdown() {
		isOpen = !isOpen;
	}

	function selectLanguage(loc: string) {
		if (loc !== locale) {
			url.searchParams.set('hl', loc);
			location.href = url.pathname + '?' + url.searchParams.toString();
		}
		isOpen = false;
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.language-picker')) {
			isOpen = false;
		}
	}
</script>

<svelte:window on:click={handleClickOutside} />

<div class="language-picker relative">
	<button
		type="button"
		on:click|stopPropagation={toggleDropdown}
		class="group flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:shadow focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
		aria-haspopup="true"
		aria-expanded={isOpen}
	>
		<!-- Globe icon -->
		<svg
			class="h-3.5 w-3.5 text-gray-500 transition-colors group-hover:text-gray-700"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
			/>
		</svg>
		<span class="font-semibold">{locale.toUpperCase()}</span>
		<!-- Chevron icon -->
		<svg
			class="h-3.5 w-3.5 text-gray-400 transition-transform duration-200 {isOpen
				? 'rotate-180'
				: ''}"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	{#if isOpen}
		<div
			class="animate-in fade-in slide-in-from-top-2 absolute right-0 z-10 mt-1.5 w-32 origin-top-right duration-200"
		>
			<div
				class="ring-opacity-5 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg ring-1 ring-black"
			>
				<div class="py-0.5">
					{#each locales as loc (loc)}
						<button
							type="button"
							on:click={() => selectLanguage(loc)}
							class="group flex w-full cursor-pointer items-center justify-between px-3 py-2 text-sm transition-colors {loc ===
							locale
								? 'bg-gray-100 font-semibold text-gray-900'
								: 'text-gray-700 hover:bg-gray-50'}"
						>
							<span class="flex items-center gap-1.5">
								<span class="font-medium">{loc.toUpperCase()}</span>
								<span class="text-xs text-gray-500">
									{loc === 'en' ? 'English' : 'Bahasa'}
								</span>
							</span>
							{#if loc === locale}
								<svg class="h-3.5 w-3.5 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
									<path
										fill-rule="evenodd"
										d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
										clip-rule="evenodd"
									/>
								</svg>
							{/if}
						</button>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slide-in-from-top-2 {
		from {
			transform: translateY(-0.5rem);
		}
		to {
			transform: translateY(0);
		}
	}

	.animate-in {
		animation:
			fade-in 0.2s ease-out,
			slide-in-from-top-2 0.2s ease-out;
	}
</style>

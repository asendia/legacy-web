<script lang="ts">
	import type { I18nContext } from '$lib/i18n/i18n';
	import { getAuthFromLocalStorage, logout, type AuthObject } from '$lib/user/auth';
	import { getContext, onMount } from 'svelte';
	import { fetchAuthorizeUser } from './userFetcher';
	const { tr } = getContext<I18nContext>('i18n');
	let auth: AuthObject | undefined;
	let disabled = true;
	const enableButton = () => (disabled = false);

	onMount(() => {
		addEventListener('popstate', enableButton);
		addEventListener('pageshow', enableButton);
		try {
			auth = getAuthFromLocalStorage();
		} catch (err) {
			switch ((err as Error).message) {
				case 'auth is undefined':
				case 'auth is expired':
					break;
			}
		}
		// Enable the button after mount
		disabled = false;
		return () => {
			removeEventListener('popstate', enableButton);
			removeEventListener('pageshow', enableButton);
		};
	});

	function handleLogin() {
		disabled = true;
		fetchAuthorizeUser('google');
	}

	function handleLogout() {
		disabled = true;
		logout();
	}

	$: userName = auth?.user_metadata?.full_name?.split(' ')[0] ?? auth?.email?.split('@')[0] ?? '';
</script>

{#if auth}
	<!-- Logged in state -->
	<div class="flex items-center gap-1.5">
		<!-- User info - hidden on mobile, shown on sm+ -->
		<div class="hidden items-center gap-1.5 sm:flex">
			<div class="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100">
				<svg
					class="h-3.5 w-3.5 text-gray-600"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
					/>
				</svg>
			</div>
			<span
				id="user-message"
				class="max-w-[100px] truncate text-sm font-medium text-gray-700"
				title={auth.user_metadata?.full_name ?? auth.email}
			>
				{userName}
			</span>
		</div>
		<!-- Logout button -->
		<button
			type="button"
			on:click={handleLogout}
			{disabled}
			class="group flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 hover:shadow focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
			title={tr('logout')}
		>
			<svg
				class="h-3.5 w-3.5 text-gray-600 transition-colors group-hover:text-gray-800"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
				/>
			</svg>
			<span class="hidden sm:inline">{tr('logout')}</span>
		</button>
	</div>
{:else}
	<!-- Logged out state -->
	<button
		type="button"
		on:click={handleLogin}
		{disabled}
		class="group flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 hover:shadow focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
	>
		<svg
			class="h-3.5 w-3.5 text-gray-600 transition-colors group-hover:text-gray-800"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
			/>
		</svg>
		<span>{tr('login')}</span>
	</button>
{/if}

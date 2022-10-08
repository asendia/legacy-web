<script lang="ts">
	import Button from '$lib/core/Button.svelte';
	import type { I18nContext } from '$lib/i18n/i18n';
	import { getAuthFromLocalStorage, logout, type AuthObject } from '$lib/user/auth';
	import { getContext, onMount } from 'svelte';
	import { fetchAuthorizeUser } from './userFetcher';
	const { tr } = getContext<I18nContext>('i18n');
	let auth: AuthObject;
	let message = '';
	let disabled = true;
	let color: 'primary' | 'secondary' = 'primary';
	let text = tr('login');
	const enableButton = () => (disabled = false);
	onMount(() => {
		addEventListener('popstate', enableButton);
		addEventListener('pageshow', enableButton);
		try {
			auth = getAuthFromLocalStorage();
		} catch (err) {
			switch ((err as Error).message) {
				case 'auth is undefined':
					break;
				case 'auth is expired':
					break;
			}
		}
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
	$: {
		if (auth) {
			message = auth.user_metadata?.full_name?.split(' ')[0] ?? auth.email + ',';
			color = 'secondary';
			text = tr('logout');
		} else {
			color = 'primary';
			text = tr('login');
		}
		disabled = false;
	}
</script>

<div>
	<span>{message}</span>
	<Button
		onClick={auth ? handleLogout : handleLogin}
		{disabled}
		{color}
		{text}
		style="border: none; padding: 0;"
	/>
</div>

<style>
	div {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	span {
		font-size: 14px;
		font-weight: 300;
		margin-right: 10px;
		padding-bottom: 1px;
	}
</style>

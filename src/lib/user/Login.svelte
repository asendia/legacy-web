<script lang="ts">
	import type { I18nContext } from '$lib/i18n/i18n';
	import { getAuthFromLocalStorage, logout, type AuthObject } from '$lib/user/auth';
	import { getContext, onMount } from 'svelte';
	import { fetchAuthorizeUser } from './userFetcher';
	import { telegramEnabled, startTelegramLogin } from './telegram';
	import SettingsDialog from '$lib/core/SettingsDialog.svelte';
	import TelegramSettings from './TelegramSettings.svelte';
	const { tr } = getContext<I18nContext>('i18n');
	let auth: AuthObject | undefined;
	let disabled = true;
	let open = false;
	let error = '';
	const enableButton = () => (disabled = false);
	onMount(() => {
		addEventListener('pageshow', enableButton);
		try {
			auth = getAuthFromLocalStorage();
		} catch {
			/* A missing or expired session shows the login choices. */
		}
		disabled = false;
		return () => removeEventListener('pageshow', enableButton);
	});
	async function signIn(provider: 'google' | 'telegram') {
		disabled = true;
		error = '';
		try {
			if (provider === 'telegram') await startTelegramLogin();
			else fetchAuthorizeUser('google');
		} catch (reason) {
			error = (reason as Error).message;
			disabled = false;
		}
	}
	$: userName = auth?.user_metadata?.full_name?.split(' ')[0] ?? auth?.email?.split('@')[0] ?? '';
</script>

<button
	type="button"
	class="account-button"
	{disabled}
	on:click={() => (open = true)}
	aria-haspopup="dialog"
	aria-label={auth ? tr('accountSettings') : tr('login')}
>
	{#if auth}
		<svg
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.6"
			aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M5 21v-2a7 7 0 0114 0v2" /></svg
		>
		<span id="user-message" class="hidden max-w-24 truncate sm:inline">{userName}</span>
	{:else}{tr('login')}{/if}
</button>

{#if open}
	<SettingsDialog
		title={auth ? tr('accountSettings') : tr('welcomeBack')}
		closeLabel={tr('close')}
		onClose={() => (open = false)}
	>
		{#if auth}
			<div class="identity">
				<div class="avatar">{userName.slice(0, 1).toUpperCase()}</div>
				<div class="min-w-0">
					<p class="font-semibold">{auth.user_metadata?.full_name || userName}</p>
					<p class="text-sm break-all text-gray-500">{auth.email}</p>
				</div>
			</div>
			<h3 class="section-title">{tr('signInMethods')}</h3>
			<div class="method">
				<span class="provider-mark">G</span>
				<div>
					<p class="font-medium">Google</p>
					<p class="text-xs text-gray-500">{tr('originalAccount')}</p>
				</div>
				<span class="status">{tr('connected')}</span>
			</div>
			{#if telegramEnabled}<TelegramSettings token={auth.token.access_token} mode="account" />{/if}
			<div class="sign-out"><button type="button" on:click={logout}>{tr('logout')}</button></div>
		{:else}
			<p class="mb-6 text-sm text-gray-500">{tr('accountIntro')}</p>
			<button type="button" class="provider primary" {disabled} on:click={() => signIn('google')}
				><span class="provider-mark">G</span><span>{tr('continueGoogle')}</span><span
					aria-hidden="true">→</span
				></button
			>
			{#if telegramEnabled}
				<button type="button" class="provider" {disabled} on:click={() => signIn('telegram')}
					><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
						><path d="m21 3-4 18-6-5-3 3 1-6 9-7-11 6-5-2z" /></svg
					><span>{tr('continueTelegram')}</span><span aria-hidden="true">→</span></button
				>
				<p class="mt-3 text-xs leading-5 text-gray-500">{tr('telegramLoginHint')}</p>
			{/if}
			{#if error}<p role="alert" class="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
					{error}
				</p>{/if}
			<div class="new-account">
				<h3 class="font-medium">{tr('newAccount')}</h3>
				<p class="mt-1 text-sm text-gray-500">{tr('newAccountHint')}</p>
			</div>
		{/if}
	</SettingsDialog>
{/if}

<style>
	.account-button {
		min-width: 44px;
		min-height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
		font-size: 0.875rem;
		font-weight: 500;
	}
	button:hover {
		background: #f3f4f6;
	}
	button:focus-visible {
		outline: 2px solid #374151;
		outline-offset: 3px;
	}
	button:disabled {
		opacity: 0.5;
		cursor: wait;
	}
	.identity {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1.75rem;
	}
	.avatar {
		display: grid;
		place-items: center;
		flex-shrink: 0;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		background: #f3f4f6;
		font-weight: 600;
	}
	.section-title {
		margin-bottom: 0.75rem;
		font-size: 0.75rem;
		font-weight: 600;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}
	.method {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
	}
	.provider-mark {
		font-size: 1.125rem;
		font-weight: 600;
	}
	.status {
		margin-left: auto;
		border-radius: 1rem;
		padding: 0.125rem 0.5rem;
		font-size: 0.7rem;
		background: #f0fdf4;
		color: #166534;
	}
	.provider {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		padding: 1rem;
		margin-bottom: 0.75rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
		font-size: 0.875rem;
		font-weight: 500;
		text-align: left;
	}
	.provider span:last-child {
		margin-left: auto;
	}
	.primary {
		background: #1f2937;
		border-color: #1f2937;
		color: white;
	}
	.primary:hover {
		background: #374151;
	}
	.new-account {
		margin-top: 1.75rem;
		padding-top: 1.25rem;
		border-top: 1px solid #e5e7eb;
	}
	.sign-out {
		margin-top: 1.5rem;
		padding-top: 1rem;
		border-top: 1px solid #e5e7eb;
	}
	.sign-out button {
		min-height: 44px;
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
	}
</style>

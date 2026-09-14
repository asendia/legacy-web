<script lang="ts">
	import type { I18nContext } from '$lib/i18n/i18n';
	import { getContext, onMount } from 'svelte';
	import { logout } from './auth';
	import { startTelegramLogin, telegramRequest } from './telegram';
	export let token: string;
	export let messageId = '';
	export let mode: 'account' | 'delivery' = 'delivery';
	const { tr } = getContext<I18nContext>('i18n');
	let ready = false;
	export let emails: string[] = [];
	let linked = false;
	let confirmUnlink = false;
	let remindersEnabled = false;
	let busy = true;
	let error = '';
	let links: Record<string, string> = {};
	let receivers: Record<string, boolean> = {};
	async function refreshStatus() {
		const status = await telegramRequest<{
			linked: boolean;
			remindersEnabled: boolean;
			receivers: Record<string, boolean>;
		}>('status', token, { messageId });
		linked = status.linked;
		remindersEnabled = status.remindersEnabled;
		receivers = status.receivers;
		ready = true;
	}
	onMount(() => {
		void run(refreshStatus);
	});

	async function run(work: () => Promise<unknown>) {
		busy = true;
		error = '';
		try {
			await work();
		} catch (reason) {
			error = (reason as Error).message;
		}
		busy = false;
	}
	async function unlinkAccount() {
		await telegramRequest('unlink', token);
		linked = false;
		remindersEnabled = false;
		confirmUnlink = false;
		if (token.startsWith('tg_')) logout();
	}
	async function changeReminders() {
		await telegramRequest('reminders', token, { enabled: !remindersEnabled });
		remindersEnabled = !remindersEnabled;
	}
	async function createLink(email: string) {
		const result = await telegramRequest<{ url: string }>('receiver-link', token, {
			messageId,
			email
		});
		links = { ...links, [email]: result.url };
		receivers = { ...receivers, [email]: false };
	}
	async function removeLink(email: string) {
		await telegramRequest('receiver-remove', token, { messageId, email });
		const next = { ...links };
		delete next[email];
		links = next;
		const remaining = { ...receivers };
		delete remaining[email];
		receivers = remaining;
	}
</script>

<section class="telegram-settings" aria-busy={busy}>
	{#if error}<p role="alert" class="error">{error}</p>{/if}
	{#if !ready}
		<p class="muted" role="status">{busy ? tr('loading') : tr('telegramLoadFailed')}</p>
		{#if !busy}<button type="button" on:click={() => run(refreshStatus)}>{tr('retry')}</button>{/if}
	{:else if mode === 'account'}
		<div class="method">
			<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
				><path d="m21 3-4 18-6-5-3 3 1-6 9-7-11 6-5-2z" /></svg
			>
			<div class="grow">
				<h3>Telegram</h3>
				<p class="muted">{linked ? tr('extraLogin') : tr('addLogin')}</p>
			</div>
			{#if linked}<button
					type="button"
					class="shrink-0"
					aria-label={tr('unlinkTelegram')}
					disabled={busy}
					on:click={() => (confirmUnlink = true)}>{tr('unlink')}</button
				>{:else}<button
					type="button"
					class="shrink-0"
					aria-label={tr('linkTelegram')}
					disabled={busy}
					on:click={() => run(() => startTelegramLogin(token))}>{tr('link')}</button
				>{/if}
		</div>
		{#if linked && confirmUnlink}
			<div class="notice mt-3" role="group" aria-label={tr('unlinkTelegram')}>
				<p>{tr('unlinkHint')}</p>
				{#if token.startsWith('tg_')}<p class="mt-2">{tr('unlinkSessionHint')}</p>{/if}
				<div class="mt-3 flex flex-wrap gap-2">
					<button type="button" disabled={busy} on:click={() => run(unlinkAccount)}
						>{tr('confirmUnlink')}</button
					><button type="button" disabled={busy} on:click={() => (confirmUnlink = false)}
						>{tr('cancel')}</button
					>
				</div>
			</div>
		{/if}
		{#if linked}
			<div class="reminder-row">
				<div>
					<h3>{tr('telegramReminders')}</h3>
					<p class="muted">{tr('reminderHint')}</p>
				</div>
				<button
					type="button"
					class="switch"
					role="switch"
					aria-checked={remindersEnabled}
					aria-label={tr('telegramReminders')}
					disabled={busy}
					on:click={() => run(changeReminders)}><span></span></button
				>
			</div>
		{/if}
	{:else}
		<p class="muted mb-5">{tr('deliveryIntro')}</p>
		{#if !messageId}<p class="notice">{tr('saveBeforeLink')}</p>{/if}
		{#if emails.length === 0}<p class="notice">{tr('addRecipientFirst')}</p>{/if}
		{#each emails as email (email)}
			<div class="recipient">
				<h3 class="break-all">{email}</h3>
				<p class="muted mt-1">
					{receivers[email] === true
						? tr('telegramConnected')
						: receivers[email] === false
							? tr('telegramWaiting')
							: tr('emailOnly')}
				</p>
				<div class="mt-3 flex flex-wrap gap-2">
					<button
						type="button"
						disabled={busy || !messageId}
						on:click={() => run(() => createLink(email))}
						>{receivers[email] === undefined
							? tr('createRecipientLink')
							: tr('replaceRecipientLink')}</button
					>
					{#if receivers[email] !== undefined}<button
							type="button"
							class="quiet"
							disabled={busy || !messageId}
							on:click={() => run(() => removeLink(email))}>{tr('removeTelegram')}</button
						>{/if}
				</div>
				{#if links[email]}<label class="mt-3 block text-xs text-gray-600"
						>{tr('sharePrivately')}
						{email}<input
							class="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm"
							readonly
							value={links[email]}
							on:click={(event) => event.currentTarget.select()}
						/></label
					>{/if}
			</div>
		{/each}
		<button type="button" class="quiet mt-3" disabled={busy} on:click={() => run(refreshStatus)}
			>{tr('refreshRecipients')}</button
		>
		<details class="mt-5 border-t border-gray-100 pt-4">
			<summary class="cursor-pointer text-sm font-medium">{tr('deliveryPrivacy')}</summary>
			<p class="muted mt-3">{tr('deliveryPrivacyHint')}</p>
			<p class="muted mt-2">{tr('replaceLinkHint')}</p>
		</details>
	{/if}
</section>

<style>
	.telegram-settings {
		margin-top: 0.75rem;
	}
	h3 {
		font-size: 0.875rem;
		font-weight: 500;
	}
	.muted {
		color: #6b7280;
		font-size: 0.8125rem;
		line-height: 1.6;
	}
	.method {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
	}
	.method svg {
		flex-shrink: 0;
	}
	button {
		min-height: 44px;
		padding: 0.5rem 0.875rem;
		border: 1px solid #d1d5db;
		border-radius: 0.625rem;
		font-size: 0.8125rem;
		font-weight: 500;
	}
	button:hover {
		background: #f3f4f6;
	}
	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	button:focus-visible,
	input:focus-visible,
	summary:focus-visible {
		outline: 2px solid #374151;
		outline-offset: 3px;
	}
	.quiet {
		border-color: transparent;
		color: #4b5563;
	}
	.reminder-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid #e5e7eb;
	}
	.switch {
		flex-shrink: 0;
		position: relative;
		width: 48px;
		height: 44px;
		padding: 0;
		border: 0;
		background: transparent;
	}
	.switch::before {
		content: '';
		position: absolute;
		inset: 9px 0;
		border-radius: 20px;
		background: #d1d5db;
	}
	.switch span {
		position: absolute;
		top: 12px;
		left: 3px;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: white;
		box-shadow: 0 1px 3px #0002;
	}
	.switch[aria-checked='true']::before {
		background: #1f2937;
	}
	.switch[aria-checked='true'] span {
		left: 25px;
	}
	.recipient {
		padding: 1rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
		margin-bottom: 0.75rem;
	}
	.notice {
		padding: 0.875rem;
		margin-bottom: 1rem;
		background: #f9fafb;
		border-radius: 0.75rem;
		font-size: 0.8125rem;
	}
	.error {
		padding: 0.875rem;
		margin-bottom: 0.75rem;
		border-radius: 0.75rem;
		background: #fef2f2;
		color: #b91c1c;
		font-size: 0.8125rem;
	}
</style>

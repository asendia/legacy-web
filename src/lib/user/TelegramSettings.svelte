<script lang="ts">
	import { onMount } from 'svelte';
	import { startTelegramLogin, telegramRequest } from './telegram';
	export let token: string;
	export let messageId: string;
	export let emails: string[];
	let linked = false;
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

<section class="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
	<h2 class="font-semibold">Telegram (optional)</h2>
	<p class="text-sm text-gray-600">
		Email delivery stays active. Telegram bot chats do not have end-to-end encryption.
	</p>
	{#if error}<p role="alert" class="text-sm text-red-700">{error}</p>{/if}
	{#if linked}
		<p class="text-sm">Telegram is linked. You can use it to sign in.</p>
		<button
			type="button"
			disabled={busy}
			class="rounded border px-3 py-2 text-sm disabled:opacity-50"
			on:click={() => run(changeReminders)}
		>
			{remindersEnabled ? 'Stop Telegram reminders' : 'Enable Telegram reminders'}
		</button>
	{:else}
		<p class="text-sm">
			Link your account to use Telegram login and reminders. Telegram will ask to share your
			verified phone number and allow messages from the bot.
		</p>
		<button
			type="button"
			disabled={busy}
			class="rounded border px-3 py-2 text-sm disabled:opacity-50"
			on:click={() => run(() => startTelegramLogin(token))}>Link Telegram</button
		>
	{/if}
	<h3 class="pt-2 text-sm font-semibold">Final messages</h3>
	<button
		type="button"
		disabled={busy}
		class="rounded border px-3 py-2 text-sm disabled:opacity-50"
		on:click={() => run(refreshStatus)}>Refresh recipient status</button
	>
	<p class="text-sm">
		Save your message first. Create a private link for each recipient who wants Telegram delivery.
		They must open the link and press Start. They do not need to approve the deed. Each new link
		replaces the previous link for that recipient.
	</p>
	<p class="text-sm">
		Use CLIENT-AES if the final text must stay encrypted. Give the recipient the password through a
		separate channel. A recipient can send /stop to the bot to stop Telegram delivery.
	</p>
	{#each emails as email (email)}
		<div class="space-y-2 border-t border-gray-100 pt-3">
			<p class="text-sm font-medium break-all">{email}</p>
			<p class="text-sm">
				{receivers[email] === true
					? 'Telegram connected'
					: receivers[email] === false
						? 'Waiting for the recipient to press Start'
						: 'Email only'}
			</p>
			<div class="flex flex-wrap gap-2">
				<button
					type="button"
					disabled={busy || !messageId}
					class="rounded border px-3 py-2 text-sm disabled:opacity-50"
					on:click={() => run(() => createLink(email))}>Create recipient link</button
				>
				<button
					type="button"
					disabled={busy || !messageId}
					class="rounded border px-3 py-2 text-sm disabled:opacity-50"
					on:click={() => run(() => removeLink(email))}>Remove Telegram delivery</button
				>
			</div>
			{#if links[email]}
				<label class="block text-sm"
					>Share privately with {email}
					<input
						class="mt-1 w-full rounded border p-2"
						readonly
						value={links[email]}
						on:click={(event) => event.currentTarget.select()}
					/>
				</label>
			{/if}
		</div>
	{/each}
</section>

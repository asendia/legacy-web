<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { finishTelegramLogin } from '$lib/user/telegram';
	let error = '';
	onMount(async () => {
		const search = location.search;
		history.replaceState(null, '', location.pathname);
		try {
			await finishTelegramLogin(search);
			location.replace('/');
		} catch (reason) {
			error = (reason as Error).message;
		}
	});
</script>

<svelte:head
	><title>Telegram login | Sejiwo</title><meta name="robots" content="noindex" /></svelte:head
>
<main class="mx-auto max-w-lg space-y-4 p-8">
	<h1 class="text-xl font-semibold">Telegram login</h1>
	{#if error}
		<p role="alert">{error}</p>
		<p>For first use, sign in with Google and link Telegram in the Telegram settings.</p>
		<a class="underline" href={resolve('/')}>Return to Sejiwo</a>
	{:else}
		<p role="status">Checking your Telegram account…</p>
	{/if}
</main>

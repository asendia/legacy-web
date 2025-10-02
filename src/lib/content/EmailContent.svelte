<script lang="ts">
	import { decryptMessageWithPrompt, getEncryptionSecret, isProbablyEncrypted } from './encryption';
	import { getContext } from 'svelte';
	import type { I18nContext } from '$lib/i18n/i18n';
	export let onChange: (content: string, aes: boolean) => void;
	export let isLoading = false;
	export let messageContent = '';
	export let enableClientAES = false;
	const { tr } = getContext<I18nContext>('i18n');
	let autoToggleClientAES = false;
	const maxRows = 20;
	const minRows = 12;
	let toggleShow = true;
	let autoToggleShow = true;
	let rows = 1;
	const handleChange = (content: string, aes: boolean) => {
		autoToggleClientAES = false;
		if (aes) {
			content = decryptMessageWithPrompt(content, tr) || content;
		}
		onChange(content, aes);
	};
	const handleKeydown = (e: KeyboardEvent) => e.key === 'Enter' && rows++;
	const handleAESToggle = () => handleChange(messageContent, !enableClientAES);
	function handleShowToggle() {
		autoToggleShow = false;
		toggleShow = !toggleShow;
	}
	const handleFocus = () => (autoToggleShow = false);
	const placeholder = tr('contentPlaceholder');
	$: {
		if (autoToggleShow) {
			toggleShow = messageContent.length === 0;
			rows = messageContent.split('\n').length;
		}
	}
	$: {
		if (autoToggleClientAES && typeof window !== 'undefined') {
			// Enable AES if the content is encrypted or if the user has encryption config
			enableClientAES = isProbablyEncrypted(messageContent) || !!getEncryptionSecret();
		}
	}
</script>

<div
	class="relative mb-10 rounded-md border border-gray-300 bg-white p-3 transition-colors focus-within:border-gray-500"
>
	<label for="message-content" class="mb-1.5 block text-sm font-medium text-gray-700"
		>Message Content</label
	>
	<textarea
		id="message-content"
		class="block w-full resize-none border-none bg-transparent p-0 text-gray-700 placeholder-gray-400 focus:outline-none"
		on:change={(e) => handleChange(e.currentTarget.value, enableClientAES)}
		on:keydown={handleKeydown}
		on:focus={handleFocus}
		readonly={enableClientAES && isProbablyEncrypted(messageContent)}
		rows={Math.max(minRows, Math.min(rows, maxRows))}
		maxlength="2000"
		autocomplete="off"
		autocapitalize="off"
		spellcheck="false"
		{placeholder}
		style="filter: {toggleShow ? 'none' : 'blur(5px)'}; opacity: {isLoading
			? '0'
			: '1'}; -webkit-text-stroke: 0;">{messageContent}</textarea
	>
	<div class="absolute right-0 -bottom-10 flex gap-1.5">
		<button
			data-test-id="toggle-aes"
			class="flex min-w-[110px] items-center justify-between rounded-md bg-gray-700 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-800"
			on:click={handleAESToggle}
		>
			<span>client aes:</span>
			<span class="font-semibold">{enableClientAES ? tr('on') : tr('off')}</span>
		</button>
		<button
			data-test-id="toggle-show"
			class="flex min-w-[55px] items-center justify-center rounded-md bg-gray-700 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-800"
			on:click={handleShowToggle}
		>
			{toggleShow ? tr('hide') : tr('show')}
		</button>
	</div>
	{#if isLoading}
		<div
			data-test-id="loading"
			class="absolute inset-0 flex items-center justify-center rounded-lg bg-white/90 text-gray-500"
		>
			<div class="flex items-center gap-2">
				<div
					class="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"
				></div>
				{tr('loading')}
			</div>
		</div>
	{/if}
</div>

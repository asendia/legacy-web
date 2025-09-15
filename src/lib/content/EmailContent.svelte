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

<div class="border-b-grey-light relative mb-10 border-b">
	<textarea
		class="placeholder:text-grey-light tap-transparent box-border block w-full resize-none border-none bg-none p-0 leading-4 tracking-wider focus:outline-0"
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
	<div class="absolute right-[2px] -bottom-7 flex">
		<button
			data-test-id="toggle-aes"
			class="bg-grey-dark mr-1 box-border flex min-w-[108px] cursor-pointer justify-between rounded-sm px-2 py-1 text-center text-xs font-light text-white uppercase"
			on:click={handleAESToggle}
		>
			<div>client-aes:</div>
			<div class="flex-grow text-right">{enableClientAES ? tr('on') : tr('off')}</div>
		</button>
		<button
			data-test-id="toggle-show"
			class="bg-grey-dark box-border flex min-w-[48px] cursor-pointer justify-center rounded-sm px-2 py-1 text-center text-xs font-light text-white uppercase"
			on:click={handleShowToggle}
		>
			{toggleShow ? tr('hide') : tr('show')}
		</button>
	</div>
	{#if isLoading}
		<div
			data-test-id="loading"
			class="text-grey absolute top-0 right-0 bottom-0 left-0 box-border pt-5 text-center"
		>
			{tr('loading')}
		</div>
	{/if}
</div>

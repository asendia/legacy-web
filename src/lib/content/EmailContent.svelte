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

<div class="relative mb-7 border-b border-b-grey-light">
	<textarea
		class="block w-full border-none leading-4 resize-none box-border tracking-wider bg-none p-0 placeholder:text-grey-light focus:outline focus:outline-0"
		on:change={(e) => handleChange(e.currentTarget.value, enableClientAES)}
		on:keydown={handleKeydown}
		on:focus={handleFocus}
		readonly={enableClientAES && isProbablyEncrypted(messageContent)}
		rows={Math.max(minRows, Math.min(rows, maxRows))}
		maxlength="2000"
		autocomplete="off"
		autocorrect="off"
		autocapitalize="off"
		spellcheck="false"
		{placeholder}
		style="filter: {toggleShow ? 'none' : 'blur(5px)'}; opacity: {isLoading ? '0' : '1'}"
		>{messageContent}</textarea
	>
	<div class="absolute right-[2px] -bottom-7 flex">
		<div
			data-test-id="toggle-aes"
			class="py-1 px-2 text-center cursor-pointer bg-grey-dark uppercase text-xs text-white font-light rounded-sm box-border flex justify-between min-w-[108px] mr-1"
			on:click={handleAESToggle}
		>
			<div>client-aes:</div>
			<div class="flex-grow text-right">{enableClientAES ? tr('on') : tr('off')}</div>
		</div>
		<div
			data-test-id="toggle-show"
			class="py-1 px-2 text-center cursor-pointer bg-grey-dark uppercase text-xs text-white font-light rounded-sm box-border flex min-w-[48px] justify-center"
			on:click={handleShowToggle}
		>
			{toggleShow ? tr('hide') : tr('show')}
		</div>
	</div>
	{#if isLoading}
		<div
			data-test-id="loading"
			class="absolute top-0 right-0 bottom-0 left-0 text-center pt-5 box-border text-grey"
		>
			{tr('loading')}
		</div>
	{/if}
</div>

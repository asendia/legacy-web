<script lang="ts">
	import type { I18nContext } from '$lib/i18n/i18n';
	import { getContext } from 'svelte';
	import { isValidEmail } from './emailValidator';
	export let onChange: (emailList: Array<string>) => void;
	export let isLoading = false;
	export let emailList: Array<string> = [];
	export const focus = () => inputText.focus();
	const { tr } = getContext<I18nContext>('i18n');
	const txtPlaceholder = tr('emailListPlaceholder');
	const txtTo = tr('emailListTo');
	let showInput = false;
	let labelText = txtTo;
	let text = '';
	let inputText: HTMLInputElement;
	let isInvalidInput = false;
	let timeoutID: number;

	function addEmail(email: string) {
		clearTimeout(timeoutID);
		const validEmail = isValidEmail(email);
		isInvalidInput = !validEmail && emailList.length === 0;
		timeoutID = window.setTimeout(() => (isInvalidInput = false), 5000);
		if (!validEmail || emailList.length >= 3) {
			return;
		}
		emailList.push(email);
		text = '';
		onChange(emailList);
	}
	function deleteEmail(id: number) {
		if (id < 0 || id >= emailList.length) {
			return;
		}
		emailList.splice(id, 1);
		onChange(emailList);
	}
	const handleWrapperClick = () => inputText.focus();
	const handleEmailClick = (e: Event) => e.stopPropagation();
	function handleInputFocus() {
		labelText = txtTo;
		showInput = true;
	}
	function handleInputBlur() {
		addEmail(text);
		if (emailList.length === 0 && text === '') {
			showInput = false;
			labelText = txtPlaceholder;
		}
	}
	const createHandleDeleteEmail = (id: number) => () => deleteEmail(id);
</script>

<div
	role="button"
	tabindex="0"
	class="relative mb-8 rounded-md border border-gray-300 bg-white p-4 transition-colors focus-within:border-gray-500 hover:border-gray-400"
	on:click={handleWrapperClick}
	on:keypress={handleWrapperClick}
>
	<div
		data-test-id="email-list-label"
		class={`mb-2 block text-sm font-medium text-gray-700 transition-opacity ${labelText === txtTo ? 'opacity-100' : 'opacity-0'}`}
	>
		{txtTo}
	</div>
	<div
		class={`absolute top-4 left-4 text-sm text-gray-400 transition-opacity ${
			labelText === txtTo ? 'opacity-0' : 'opacity-100'
		}`}
	>
		{txtPlaceholder}
	</div>
	{#each emailList as email, id (id)}
		<div
			role="button"
			tabindex="0"
			data-test-id="email-{id}"
			class="relative mr-2 mb-2 inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
			on:click={handleEmailClick}
			on:keypress={() => {}}
		>
			{email}
			<button
				data-test-id="email-delete-{id}"
				class="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-gray-600 transition-colors hover:bg-gray-300 hover:text-gray-800"
				on:click={createHandleDeleteEmail(id)}
			>
				×
			</button>
		</div>
	{/each}
	{#if emailList.length < 3}
		<input
			data-test-id="email-input"
			type="email"
			aria-label="Receiver Email"
			class="flex-1 border-none bg-transparent p-0 text-gray-700 placeholder-gray-400 focus:outline-none"
			style="width: {showInput ? '200px' : '1px'}"
			value={text}
			on:blur={handleInputBlur}
			on:focus={handleInputFocus}
			on:keyup={(e) => {
				switch (e.key) {
					case 'Backspace':
						if (text !== '') {
							text = e.currentTarget.value;
							return;
						}
						deleteEmail(emailList.length - 1);
						break;
					case 'Enter':
						addEmail(e.currentTarget.value);
						break;
					default:
						text = e.currentTarget.value;
						break;
				}
			}}
			bind:this={inputText}
			disabled={isLoading}
		/>
	{/if}
</div>
<div class="relative">
	<div
		class="absolute -top-8 left-0 z-10 rounded-md bg-red-50 px-3 py-1 text-xs font-medium text-red-600 transition-opacity duration-300"
		style="opacity: {isInvalidInput ? '100%' : '0%'};"
	>
		{tr('emailListValidity')}
	</div>
</div>

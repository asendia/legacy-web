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
	class="flex w-full flex-wrap border-b border-grey-light m-0 mb-6 cursor-text relative box-border focus:outline-1"
	on:click={handleWrapperClick}
>
	<div
		data-test-id="email-list-label"
		class="text-sm leading-4 mt-[1px] mr-[5px] mb-[4px]"
		style={labelText === txtTo ? '' : 'color: var(--color-lightgrey);'}
	>
		{labelText}
	</div>
	{#each emailList as email, id}
		<div
			data-test-id="email-{id}"
			class="relative rounded-sm bg-grey-light pr-[18px] pl-[5px] mr-[4px] mb-[4px] text-sm leading-4 text-grey-dark"
			on:click={handleEmailClick}
		>
			{email}
			<div
				data-test-id="email-delete-{id}"
				class="absolute top-0 right-0 pt-[2px] pr-[2px] pb-1 pl-1 cursor-pointer leading-3"
				on:click={createHandleDeleteEmail(id)}
			>
				×
			</div>
		</div>
	{/each}
	{#if emailList.length < 3}
		<input
			data-test-id="email-input"
			type="email"
			aria-label="Receiver Email"
			class="border-none m-0 mb-1 flex-grow bg-none leading-[18px] p-0 focus:outline focus:outline-0"
			style="width: {showInput ? '100px' : '1px'}"
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
		class="absolute text-xs leading-4 top-[-22px] left-0 text-red bg-white z-10 font-light rounded-sm transition-opacity duration-1000"
		style="opacity: {isInvalidInput ? '100%' : '0%'};"
	>
		{tr('emailListValidity')}
	</div>
</div>

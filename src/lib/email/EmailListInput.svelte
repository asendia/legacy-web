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
	class="border-grey-light relative m-0 mb-6 box-border flex w-full cursor-text flex-wrap border-b focus:outline-1"
	on:click={handleWrapperClick}
	on:keypress={handleWrapperClick}
>
	<div
		data-test-id="email-list-label"
		class={`mt-[1px] mr-[5px] text-sm leading-4 mb-[4px]${labelText === txtTo ? '' : ' opacity-0'}`}
	>
		{txtTo}
	</div>
	<div
		class={`absolute mt-[1px] mr-[5px] text-sm leading-4 mb-[4px]${
			labelText === txtTo ? ' hidden' : ''
		}`}
	>
		{txtPlaceholder}
	</div>
	{#each emailList as email, id}
		<div
			role="button"
			tabindex="0"
			data-test-id="email-{id}"
			class="bg-grey-light text-grey-dark relative mr-1 mb-1 h-5 rounded-sm pr-[18px] pl-[5px] text-sm"
			on:click={handleEmailClick}
			on:keypress={() => {}}
		>
			{email}
			<button
				data-test-id="email-delete-{id}"
				class="absolute top-0 right-0 cursor-pointer pt-[2px] pr-[2px] pb-1 pl-1 leading-3"
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
			class="tap-transparent m-0 mb-1 h-5 flex-grow border-none bg-none p-0 leading-[18px] focus:outline-0"
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
		class="text-red absolute top-[-22px] left-0 z-10 rounded-sm bg-white text-xs leading-4 font-light transition-opacity duration-1000"
		style="opacity: {isInvalidInput ? '100%' : '0%'};"
	>
		{tr('emailListValidity')}
	</div>
</div>

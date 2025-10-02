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
		// If all emails are removed, hide the input and return to placeholder
		if (emailList.length === 0) {
			showInput = false;
		}
	}
	const handleWrapperClick = () => {
		showInput = true;
		// Use setTimeout to ensure the input is rendered before focusing
		setTimeout(() => inputText?.focus(), 0);
	};
	const handleEmailClick = (e: Event) => e.stopPropagation();
	function handleInputFocus() {
		showInput = true;
	}
	function handleInputBlur() {
		addEmail(text);
		// Always hide input on blur when there's no text, regardless of email count
		if (text === '') {
			showInput = false;
		}
	}
	const createHandleDeleteEmail = (id: number) => () => deleteEmail(id);
</script>

<div
	role="button"
	tabindex="0"
	data-test-id="email-list-wrapper"
	class="relative mb-6 rounded-md border border-gray-300 bg-white p-3 transition-colors focus-within:border-gray-500 hover:border-gray-400"
	on:click={handleWrapperClick}
	on:keypress={handleWrapperClick}
>
	<!-- Label "To" - always shown but may be visually hidden -->
	<div
		data-test-id="email-list-label"
		class="mb-1.5 block text-sm font-medium text-gray-700"
		class:invisible={emailList.length === 0 && !showInput}
		class:h-0={emailList.length === 0 && !showInput}
		class:overflow-hidden={emailList.length === 0 && !showInput}
		role="button"
		tabindex="-1"
		on:click={handleWrapperClick}
		on:keypress={handleWrapperClick}
	>
		{txtTo}
	</div>

	<!-- Empty state placeholder - only shown when completely empty and not focused -->
	{#if emailList.length === 0 && !showInput}
		<div class="flex items-center gap-2.5 py-0.5">
			<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
				<svg
					class="h-3.5 w-3.5 text-gray-400"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
					/>
				</svg>
			</div>
			<div class="flex-1">
				<p class="text-sm font-medium text-gray-500">{txtPlaceholder}</p>
				<p class="text-xs text-gray-400">{tr('emailListHint')}</p>
			</div>
		</div>
	{/if}

	{#each emailList as email, id (id)}
		<div
			role="button"
			tabindex="0"
			data-test-id="email-{id}"
			class="relative mr-1.5 mb-1.5 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-sm text-gray-700"
			on:click={handleEmailClick}
			on:keypress={() => {}}
		>
			{email}
			<button
				data-test-id="email-delete-{id}"
				class="ml-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 text-gray-600 transition-colors hover:bg-gray-300 hover:text-gray-800"
				on:click={createHandleDeleteEmail(id)}
			>
				×
			</button>
		</div>
	{/each}

	<!-- Input field - only shown when showInput is true -->
	{#if emailList.length < 3 && showInput}
		<input
			data-test-id="email-input"
			type="email"
			aria-label="Receiver Email"
			class="flex-1 border-none bg-transparent p-0 text-gray-700 placeholder-gray-400 focus:outline-none"
			style="width: 200px;"
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
		class="absolute -top-8 left-0 z-10 rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 transition-opacity duration-300"
		style="opacity: {isInvalidInput ? '100%' : '0%'};"
	>
		{tr('emailListValidity')}
	</div>
</div>

<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import EmailListInput from '$lib/email/EmailListInput.svelte';
	import EmailContent from '$lib/content/EmailContent.svelte';
	import Scheduler from '$lib/schedule/Scheduler.svelte';
	import Button from '$lib/core/Button.svelte';
	import {
		clearUserData,
		getAuthFromLocalStorage,
		getTokenFromHash,
		type AuthObject
	} from '$lib/user/auth';
	import {
		clearDraft,
		consolidateDraft,
		setDraftEmailReceivers,
		setDraftMessageContent
	} from '$lib/form/draft';
	import { defaultMessageData, getMessageData, submitMessageData } from '$lib/form/messageData';
	import type { I18nContext } from '$lib/i18n/i18n';
	const { tr } = getContext<I18nContext>('i18n');
	let auth: AuthObject;
	let messageData = defaultMessageData;
	let isLoading = false;
	let disableSubmit = true;
	let enableClientAES = false;
	let fetchError = '';
	onMount(async () => {
		if (getTokenFromHash()) {
			return; // Don't init form if there is netlify token
		}
		const slowWaitingTime = 1000;
		const timeoutID = window.setTimeout(() => (isLoading = true), slowWaitingTime);
		const mountTime = Date.now();
		try {
			auth = getAuthFromLocalStorage();
			const d = await getMessageData(auth, enableClientAES, tr);
			messageData = d.messageData;
			enableClientAES = d.enableClientAES;
			fetchError = ''; // Clear any previous errors
		} catch (err) {
			const errorMessage = (err as Error).message;
			switch (errorMessage) {
				case 'message length is 0':
					fetchError = ''; // No error - user just doesn't have messages yet
					break;
				case 'auth is undefined':
				case 'auth is expired':
					clearUserData();
					fetchError = ''; // Clear error, user just needs to login
					break;
				default:
					console.error(err);
					fetchError = `${tr('errorLoadingData')}: ${errorMessage}`;
			}
		}
		try {
			const c = consolidateDraft(messageData.emailReceivers, messageData.messageContent, () =>
				confirm(
					`${tr('draftConflict')}\n\n${tr('draftRecipients')}: ${messageData.emailReceivers.join(
						', '
					)}\n` + `${tr('draftContent')}: ${messageData.messageContent}`
				)
			);
			messageData = {
				...messageData,
				emailReceivers: c.emailReceivers,
				messageContent: c.messageContent
			};
		} catch (err) {
			console.error('Failed to consolidate local data with sessionStorage:', err);
		}
		clearTimeout(timeoutID);
		const waitingTime = Date.now() - mountTime;
		// If already shown, continue the Loading text at least for 1s to avoid blipping
		const additionalWaitingTime =
			slowWaitingTime < waitingTime && waitingTime < 2 * slowWaitingTime
				? 2 * slowWaitingTime - waitingTime
				: 0;
		setTimeout(() => {
			disableSubmit = false;
			isLoading = false;
		}, additionalWaitingTime);
	});
	function handleEmailReceiversChange(list: Array<string>) {
		messageData = { ...messageData, emailReceivers: list };
		setDraftEmailReceivers(list);
	}
	function handleMessageChange(content: string, aes: boolean) {
		messageData = { ...messageData, messageContent: content };
		enableClientAES = aes;
		setDraftMessageContent(content);
	}
	function handleSchedulerChange(value: number, type: 'reminder' | 'inactive') {
		if (type === 'reminder') {
			messageData = { ...messageData, reminderIntervalDays: value };
		} else if (type === 'inactive') {
			messageData = { ...messageData, inactivePeriodDays: value };
		}
	}
	async function handleClickSubmit(e: MouseEvent) {
		e.preventDefault();
		disableSubmit = true;
		try {
			auth = getAuthFromLocalStorage();
			messageData = await submitMessageData(auth, messageData, enableClientAES, tr);
		} catch (err) {
			switch ((err as Error).message) {
				case 'auth is undefined':
					alert(tr('authUndefined'));
					break;
				case 'auth is expired':
					if (!confirm(tr('authExpired'))) {
						clearDraft();
					}
					clearUserData();
					location.reload();
					break;
				default:
					console.error(err);
			}
		}
		disableSubmit = false;
	}
</script>

<div class="space-y-5">
	{#if fetchError}
		<div
			class="rounded-lg border border-gray-300 bg-gradient-to-br from-gray-50 to-white p-4 shadow-sm"
		>
			<div class="flex">
				<div class="flex-shrink-0">
					<div class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
						<svg class="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
								clip-rule="evenodd"
							/>
						</svg>
					</div>
				</div>
				<div class="ml-4 flex-1">
					<h3 class="text-base font-semibold text-gray-900">{tr('errorLoadingData')}</h3>
					<div class="mt-2 text-sm text-gray-700">
						<p>{fetchError}</p>
					</div>
					<div class="mt-4">
						<button
							type="button"
							on:click={() => location.reload()}
							class="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
						>
							<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
								/>
							</svg>
							{tr('retry')}
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
	<EmailListInput
		onChange={handleEmailReceiversChange}
		{isLoading}
		emailList={messageData.emailReceivers}
	/>
	<EmailContent
		onChange={handleMessageChange}
		{isLoading}
		messageContent={messageData.messageContent}
		{enableClientAES}
	/>
	<Scheduler
		onChange={handleSchedulerChange}
		inactivePeriodDays={messageData.inactivePeriodDays}
		reminderIntervalDays={messageData.reminderIntervalDays}
		emailCreator={auth?.email}
	/>
	<div class="flex justify-center pt-3">
		<Button
			onClick={handleClickSubmit}
			disabled={disableSubmit}
			text={tr('formSubmit')}
			variant={auth ? 'filled' : 'outlined'}
		/>
	</div>
</div>

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
		} catch (err) {
			switch ((err as Error).message) {
				case 'message length is 0':
					break;
				case 'auth is undefined':
				case 'auth is expired':
					clearUserData();
					break;
				default:
					console.error(err);
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
<Button
	onClick={handleClickSubmit}
	disabled={disableSubmit}
	text={tr('formSubmit')}
	variant={auth ? 'filled' : 'outlined'}
	style="display: block; margin: 0 auto; min-width: 100px"
/>

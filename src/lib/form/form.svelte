<script lang="ts">
  import { onMount } from 'svelte';
  import EmailListInput from '$lib/email/EmailListInput.svelte';
  import EmailContent from '$lib/content/EmailContent.svelte';
  import Scheduler from '$lib/schedule/Scheduler.svelte';
  import Button from '$lib/core/Button.svelte';
  import { clearUserData, getAuthObject, type AuthObject } from '$lib/user/auth';
  import { handleQueryVisit } from '$lib/query-string/queryStringHandler';
  import {
    clearDraft,
    consolidateDraft,
    setDraftEmailReceivers,
    setDraftMessageContent,
  } from '$lib/content/contentDraft';
  import { defaultMessageData, getMessageData, submitMessageData } from '$lib/form/messageData';

  export let auth: AuthObject;
  let messageData = defaultMessageData;
  let isLoading = false,
    disableSubmit = true,
    enableClientAES = false;
  onMount(async () => {
    const slowWaitingTime = 1000;
    const timeoutID = setTimeout(() => {
      isLoading = true;
    }, slowWaitingTime);
    const mountTime = Date.now();
    try {
      await handleQueryVisit();
      // Fetch data from API
      auth = await getAuthObject();
      const d = await getMessageData(auth, enableClientAES);
      messageData = d.messageData;
      enableClientAES = d.enableClientAES;
    } catch (err) {
      switch (err.message) {
        case 'auth is undefined':
        case 'message length is 0':
          break;
        case 'auth is expired':
          clearUserData();
          break;
        default:
          console.error('Fetch API error', err);
      }
    }
    try {
      const c = consolidateDraft(messageData.emailReceivers, messageData.messageContent);
      messageData = {
        ...messageData,
        emailReceivers: c.emailReceivers,
        messageContent: c.messageContent,
      };
    } catch (err) {
      console.error('Failed to consolidate local data with sessionStorage:', err);
    }
    clearTimeout(timeoutID);
    const waitingTime = Date.now() - mountTime;
    setTimeout(
      () => {
        disableSubmit = false;
        isLoading = false;
      },
      // If already shown, continue the Loading text at least for 1s to avoid blipping
      slowWaitingTime < waitingTime && waitingTime < 2 * slowWaitingTime
        ? 2 * slowWaitingTime - waitingTime
        : 0,
    );
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
      auth = await getAuthObject();
      messageData = await submitMessageData(auth, messageData, enableClientAES);
    } catch (err) {
      switch (err.message) {
        case 'auth is undefined':
          alert('You need to login first');
          break;
        case 'auth is expired':
          if (!confirm('Session expired, want to backup the content first?')) {
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
  text="submit"
  variant={auth ? 'filled' : 'outlined'}
  style="display: block; width: 100%;"
/>

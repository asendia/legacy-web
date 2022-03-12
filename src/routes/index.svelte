<script lang="ts">
  import { onMount } from 'svelte';
  import Header from '$lib/core/Header.svelte';
  import Login from '$lib/users/Login.svelte';
  import EmailListInput from '$lib/messages/EmailListInput.svelte';
  import EmailContent from '$lib/messages/EmailContent.svelte';
  import Scheduler from '$lib/messages/Scheduler.svelte';
  import Button from '$lib/core/Button.svelte';
  import Footer from '$lib/core/Footer.svelte';
  import { clearUserData, getAuthObject, type AuthObject } from '$lib/users/auth';
  import { blue, darkGrey, grey, lightGrey } from '$lib/core/colors';
  import { handleQueryVisit } from '$lib/query-string/queryStringHandler';
  import {
    clearMessageCache,
    consolidateCache,
    setEmailReceiversCache,
    setMessageContentCache,
  } from '$lib/messages/messageCache';
  import type { MessageData } from '$lib/messages/messageData';
  import { getMessageData, submitMessage } from '$lib/messages/formHandler';

  let messageData: MessageData = {
    emailReceivers: [] as Array<string>,
    id: '',
    inactivePeriodDays: 60,
    isActive: true,
    messageContent: '',
    reminderIntervalDays: 15,
  };
  let isLoading = false,
    authObject: AuthObject,
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
      authObject = await getAuthObject();
      const d = await getMessageData(authObject, enableClientAES);
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
      const c = consolidateCache(messageData.emailReceivers, messageData.messageContent);
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
    setEmailReceiversCache(list);
  }
  function handleMessageChange(content: string, aes: boolean) {
    messageData = { ...messageData, messageContent: content };
    enableClientAES = aes;
    setMessageContentCache(content);
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
      authObject = await getAuthObject();
      messageData = await submitMessage(authObject, messageData, enableClientAES);
    } catch (err) {
      switch (err.message) {
        case 'auth is undefined':
          alert('You need to login first');
          break;
        case 'auth is expired':
          if (!confirm('Session expired, want to backup the content first?')) {
            clearMessageCache();
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
  const colorPalette =
    `--color-grey:${grey};--color-blue:${blue};` +
    `--color-darkgrey:${darkGrey};--color-lightgrey:${lightGrey}`;
</script>

<svelte:head>
  <title>Warisin - Your testament in the cloud</title>
  <meta name="description" content="Warisin is a secure testament storage and delivery service" />
</svelte:head>
<div class="wrapper" style={colorPalette}>
  <Header />
  <Login auth={authObject} />
  <div class="separator" />
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
    emailCreator={authObject?.email}
  />
  <Button
    onClick={handleClickSubmit}
    disabled={disableSubmit}
    text="submit"
    variant={authObject ? 'filled' : 'outlined'}
    style="display: block; width: 100%;"
  />
  <Footer />
</div>

<style>
  :global(html) {
    background-color: #e2e2e2;
  }
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Roboto', sans-serif;
  }
  .wrapper {
    max-width: 450px;
    margin: auto;
    letter-spacing: 1px;
    padding: 0 24px;
  }
  .separator {
    height: 30px;
  }
</style>

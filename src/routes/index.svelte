<script lang="ts">
  import { onMount } from 'svelte';
  import Header from '$lib/core/Header.svelte';
  import Login from '$lib/users/Login.svelte';
  import EmailListInput from '$lib/messages/EmailListInput.svelte';
  import EmailContent from '$lib/messages/EmailContent.svelte';
  import Scheduler from '$lib/messages/Scheduler.svelte';
  import Button from '$lib/core/Button.svelte';
  import Footer from '$lib/core/Footer.svelte';
  import { selectMessages, upsertMessage } from '$lib/messages/fetchMessages';
  import { clearStorage, getAuthObject, logout, type AuthObject } from '$lib/users/auth';
  import { blue, darkGrey, grey, lightGrey } from '$lib/core/colors';
  import { handleQueryVisit } from '$lib/email-visit/queryHandler';
  import {
    decryptMessage,
    encryptMessage,
    isProbablyEncrypted,
    STORAGE_SECRET_NAME,
  } from '$lib/messages/encryption';

  let emailReceivers: Array<string> = [],
    messageID = '',
    inactivePeriodDays = 60,
    isActive = true,
    messageContent = '',
    reminderIntervalDays = 15,
    authObject: AuthObject | undefined,
    enableClientAES = false,
    isLoading = false,
    disableSubmit = true;
  onMount(async () => {
    const slowWaitingTime = 1000;
    const timeoutID = setTimeout(() => {
      isLoading = true;
    }, slowWaitingTime);
    const mountTime = Date.now();
    try {
      await handleQueryVisit();
      authObject = await getAuthObject();
      const dataList = await selectMessages(authObject.token.access_token);
      if (dataList.length === 0) {
        throw new Error('message length is 0');
      }
      const d = dataList[0];
      let msg = d.messageContent;
      if (isProbablyEncrypted(msg)) {
        msg = decryptMessage(msg) || msg;
        enableClientAES = true;
      }
      emailReceivers = d.emailReceivers;
      messageID = d.id;
      inactivePeriodDays = d.inactivePeriodDays;
      isActive = d.isActive;
      messageContent = msg;
      reminderIntervalDays = d.reminderIntervalDays;
    } catch (err) {
      switch (err.message) {
        case 'auth is undefined':
        case 'message length is 0':
          break;
        case 'auth is expired':
          clearStorage();
          break;
        default:
          console.error(err);
      }
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
    emailReceivers = list;
  }
  function handleMessageChange(content: string, aes: boolean) {
    messageContent = content;
    enableClientAES = aes;
  }
  function handleSchedulerChange(value: number, type: 'reminder' | 'inactive') {
    if (type === 'reminder') {
      reminderIntervalDays = value;
    } else if (type === 'inactive') {
      inactivePeriodDays = value;
    }
  }
  async function handleClickSubmit(e: MouseEvent) {
    e.preventDefault();
    disableSubmit = true;
    submit();
  }
  async function submit() {
    try {
      authObject = await getAuthObject();
      let msg = messageContent;
      if (enableClientAES) {
        msg = encryptMessage(msg) || msg;
      } else {
        localStorage.removeItem(STORAGE_SECRET_NAME);
      }
      const message = await upsertMessage(
        authObject.token.access_token,
        messageID,
        emailReceivers,
        msg,
        inactivePeriodDays,
        reminderIntervalDays,
        isActive,
      );
      messageID = message.id;
    } catch (err) {
      switch (err.message) {
        case 'auth is undefined':
          alert('You need to login first');
          break;
        case 'auth is expired':
          if (
            confirm(
              'Your session has expired, do you want to refresh the page? ' +
                'Press cancel if you want to copy your message first',
            )
          ) {
            logout();
          }
          break;
        default:
          console.error(err);
      }
    } finally {
      disableSubmit = false;
    }
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
  <EmailListInput onChange={handleEmailReceiversChange} {isLoading} emailList={emailReceivers} />
  <EmailContent onChange={handleMessageChange} {isLoading} {messageContent} {enableClientAES} />
  <Scheduler
    onChange={handleSchedulerChange}
    {inactivePeriodDays}
    {reminderIntervalDays}
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

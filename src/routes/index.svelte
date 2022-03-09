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
  import { getAuthObject, type AuthObject } from '$lib/users/auth';
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
    disableSubmit = true;
  onMount(async () => {
    try {
      await handleQueryVisit();
      authObject = await getAuthObject();
      if (!authObject) {
        return;
      }
      const dataList = await selectMessages(authObject.token.access_token);
      if (dataList.length === 0) {
        return;
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
      console.error(err);
    } finally {
      disableSubmit = false;
    }
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
      if (!authObject) {
        return;
      }
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
      console.error(err);
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
  <Login />
  <div class="separator" />
  <EmailListInput emailList={emailReceivers} onChange={handleEmailReceiversChange} />
  <EmailContent onChange={handleMessageChange} {messageContent} {enableClientAES} />
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

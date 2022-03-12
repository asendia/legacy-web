<script lang="ts">
  import { decryptMessage, getEncryptionSecret, isProbablyEncrypted } from './encryption';
  import type { HTMLElementEvent } from '../core/types';
  export let onChange: (content: string, aes: boolean) => void;
  export let isLoading = false;
  export let messageContent = '';
  export let enableClientAES = false;
  let autoToggleClientAES = false;
  const maxRows = 20;
  const minRows = 12;
  let toggleShow = true;
  let autoToggleShow = true;
  let rows = 1;
  const handleChange = (content: string, aes: boolean) => {
    autoToggleClientAES = false;
    if (aes) {
      content = decryptMessage(content) || content;
    }
    onChange(content, aes);
  };
  const handleTextareaChange = (e: HTMLElementEvent<HTMLTextAreaElement>) =>
    handleChange(e.target.value.trim(), enableClientAES);
  const handleKeydown = (e: KeyboardEvent) => e.key === 'Enter' && rows++;
  const handleAESToggle = () => handleChange(messageContent, !enableClientAES);
  function handleShowToggle() {
    autoToggleShow = false;
    toggleShow = !toggleShow;
  }
  const handleFocus = () => (autoToggleShow = false);
  const placeholder = 'Message is encrypted by default';
  $: {
    if (autoToggleShow) {
      toggleShow = messageContent.length === 0;
      rows = messageContent.split('\n').length;
    }
  }
  $: {
    if (autoToggleClientAES && typeof window !== 'undefined') {
      // Enable AES if the content is encrypted or if the user has encryption config
      enableClientAES = isProbablyEncrypted(messageContent) || !!getEncryptionSecret();
    }
  }
</script>

<div class="textWrapper">
  <textarea
    class="text"
    on:change={handleTextareaChange}
    on:keydown={handleKeydown}
    on:focus={handleFocus}
    readonly={enableClientAES && isProbablyEncrypted(messageContent)}
    rows={Math.max(minRows, Math.min(rows, maxRows))}
    maxlength="2000"
    autocomplete="off"
    autocorrect="off"
    autocapitalize="off"
    spellcheck="false"
    {placeholder}
    style="filter: {toggleShow ? 'none' : 'blur(5px)'}; opacity: {isLoading ? '0' : '1'}"
    >{messageContent}</textarea
  >
  <div class="toggle aes" on:click={handleAESToggle}>
    <div>client-aes:</div>
    <div>{enableClientAES ? 'on' : 'off'}</div>
  </div>
  <div class="toggle show" on:click={handleShowToggle}>
    {toggleShow ? 'hide' : 'show'}
  </div>
  {#if isLoading}
    <div class="loading">Loading...</div>
  {/if}
</div>

<style>
  .textWrapper {
    position: relative;
    border: 1px solid var(--color-grey);
    border-radius: 4px;
    padding-bottom: 30px;
  }
  .toggle {
    position: absolute;
    padding: 4px 6px;
    text-align: center;
    bottom: 2px;
    right: 2px;
    cursor: pointer;
    background-color: var(--color-darkgrey);
    text-transform: uppercase;
    font-size: 10px;
    color: white;
    font-weight: 300;
    border-radius: 2px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
  }
  .toggle.aes {
    width: 108px;
    bottom: 2px;
    right: 52px;
  }
  .toggle.show {
    width: 48px;
    bottom: 2px;
    right: 2px;
    justify-content: center;
  }
  .toggle div:nth-child(2) {
    flex-grow: 1;
    text-align: right;
  }
  .text {
    display: block;
    width: 100%;
    border: none;
    line-height: 16px;
    padding: 10px;
    resize: none;
    box-sizing: border-box;
    font-size: 14px;
    font-family: 'Roboto', sans-serif;
    letter-spacing: 1px;
    background: none;
  }
  .text:focus {
    outline-style: solid;
    outline-width: 0;
  }
  .loading {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    text-align: center;
    padding-top: 20px;
    box-sizing: border-box;
    color: var(--color-grey);
  }
</style>

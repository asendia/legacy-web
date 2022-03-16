<script lang="ts">
  import { decryptMessageWithPrompt, getEncryptionSecret, isProbablyEncrypted } from './encryption';
  import type { HTMLElementEvent } from '../core/types';
  import { getContext } from 'svelte';
  import type { TranslationFunction } from '$lib/i18n/translation';
  export let onChange: (content: string, aes: boolean) => void;
  export let isLoading = false;
  export let messageContent = '';
  export let enableClientAES = false;
  const tr = getContext<TranslationFunction>('tr');
  let autoToggleClientAES = false;
  const maxRows = 20;
  const minRows = 12;
  let toggleShow = true;
  let autoToggleShow = true;
  let rows = 1;
  const handleChange = (content: string, aes: boolean) => {
    autoToggleClientAES = false;
    if (aes) {
      content = decryptMessageWithPrompt(content, tr) || content;
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
  const placeholder = tr('contentPlaceholder');
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
  <div class="toggleWrapper">
    <div class="toggle aes" on:click={handleAESToggle}>
      <div>client-aes:</div>
      <div>{enableClientAES ? tr('on') : tr('off')}</div>
    </div>
    <div class="toggle show" on:click={handleShowToggle}>
      {toggleShow ? tr('hide') : tr('show')}
    </div>
  </div>
  {#if isLoading}
    <div class="loading">{tr('loading')}</div>
  {/if}
</div>

<style>
  .textWrapper {
    position: relative;
    margin-bottom: 30px;
    border-bottom: 1px solid var(--color-lightgrey);
  }
  .toggleWrapper {
    position: absolute;
    right: 2px;
    bottom: -24px;
    display: flex;
  }
  .toggle {
    padding: 4px 6px;
    text-align: center;
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
    min-width: 108px;
    margin-right: 4px;
  }
  .toggle.show {
    min-width: 48px;
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
    resize: none;
    box-sizing: border-box;
    font-size: 14px;
    font-family: 'Roboto', sans-serif;
    letter-spacing: 1px;
    background: none;
    padding: 0;
  }
  .text::placeholder {
    color: var(--color-lightgrey);
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

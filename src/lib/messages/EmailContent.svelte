<script lang="ts">
  import { decryptMessage, getEncryptionConfig, isProbablyEncrypted } from './encryption';
  export let messageContent = '';
  export let onChange: (messageContent: string, aes: boolean) => void;
  export let enableClientAES = false;
  let autoToggleClientAES = true;
  const maxRows = 20;
  const minRows = 12;
  let toggleShow = true;
  let autoToggleShow = true;
  let rows = 1;
  function handleChange(content: string, aes: boolean) {
    if (aes) {
      content = decryptMessage(content) || content;
    }
    onChange(content, aes);
  }
  const handleTextareaChange = (e: HTMLElementEvent<HTMLTextAreaElement>) =>
    handleChange(e.target.value.trim(), enableClientAES);
  const handleKeydown = (e: KeyboardEvent) => e.key === 'Enter' && rows++;
  function handleAESToggle() {
    autoToggleClientAES = false;
    handleChange(messageContent, !enableClientAES);
  }
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
      console.log('rows calculated:', rows)
    }
  }
  $: {
    if (autoToggleClientAES && typeof window !== 'undefined') {
      // Enable AES if the content is encrypted or if the user has encryption config
      enableClientAES = isProbablyEncrypted(messageContent) || !!getEncryptionConfig();
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
    style="filter: {toggleShow ? 'none' : 'blur(5px)'}">{messageContent}</textarea
  >
  <div class="toggle aes" on:click={handleAESToggle}>
    <div>client-aes:</div>
    <div>{enableClientAES ? 'on' : 'off'}</div>
  </div>
  <div class="toggle show" on:click={handleShowToggle}>
    {toggleShow ? 'hide' : 'show'}
  </div>
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
    width: 105px;
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
</style>

<script lang="ts">
  import { getEncryptionConfig, isProbablyEncrypted } from './encryption';
  export let messageContent = '';
  export let onChange: (content: string, enableClientAES: boolean) => void;
  export let enableClientAES = false;
  let autoToggleClientAES = true;
  const maxRows = 20;
  const minRows = 12;
  let toggleShow = true;
  let autoToggleShow = true;
  let rows = 1;
  function handleChange(e: HTMLElementEvent<HTMLTextAreaElement>) {
    messageContent = e.target.value.trim();
    onChange(messageContent, enableClientAES);
  }
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      rows++;
    }
  }
  function handleAESToggle() {
    autoToggleClientAES = false;
    enableClientAES = !enableClientAES;
    onChange(messageContent, enableClientAES);
  }
  function handleShowToggle() {
    autoToggleShow = false;
    toggleShow = !toggleShow;
  }
  function handleFocus() {
    autoToggleShow = false;
  }
  const placeholder = 'Message is encrypted by default';
  // '\n\nYou can also encrypt the message yourself before storing it in warisin.com' +
  // '\n\nIf you encrypt it by yourself, ' +
  // 'be sure to give the decryption key to the recipients using other methods.';
  $: {
    if (autoToggleShow) {
      toggleShow = messageContent.length === 0;
    }
  }
  $: {
    if (autoToggleClientAES) {
      enableClientAES = isProbablyEncrypted(messageContent) || !!getEncryptionConfig();
    }
  }
</script>

<div class="textWrapper">
  <textarea
    class="text"
    on:change={handleChange}
    on:keydown={handleKeydown}
    on:focus={handleFocus}
    readonly={enableClientAES && isProbablyEncrypted(messageContent)}
    rows={Math.max(minRows, Math.min(rows, maxRows))}
    maxlength="800"
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
    font-size: 0.7rem;
    color: white;
    font-weight: 300;
    border-radius: 2px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
  }
  .toggle.aes {
    width: 107px;
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
    line-height: 1.1rem;
    padding: 10px;
    resize: none;
    box-sizing: border-box;
    font-size: 1rem;
    font-family: 'Roboto', sans-serif;
    letter-spacing: 0.03rem;
    background: none;
  }
  .text:focus {
    outline-style: solid;
    outline-width: 0;
  }
</style>

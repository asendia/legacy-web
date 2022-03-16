<script lang="ts">
  import type { HTMLElementEvent } from '$lib/core/types';
  import { isValidEmail } from './emailValidator';
  export let onChange: (emailList: Array<string>) => void;
  export let isLoading = false;
  export let emailList: Array<string> = [];
  export const focus = () => inputText.focus();
  const txtRecipients = 'Recipient emails';
  const txtTo = 'To';
  let showInput = false;
  let labelText = txtTo;
  let text = '';
  let inputText: HTMLInputElement;
  let isInvalidInput = false;
  let timeoutID: number;

  function addEmail(email: string) {
    clearTimeout(timeoutID);
    const validEmail = isValidEmail(email);
    isInvalidInput = !validEmail && emailList.length === 0;
    timeoutID = window.setTimeout(() => (isInvalidInput = false), 3000);
    if (!validEmail || emailList.length >= 3) {
      return;
    }
    emailList.push(email);
    text = '';
    onChange(emailList);
  }
  function deleteEmail(id: number) {
    if (id < 0 || id >= emailList.length) {
      return;
    }
    emailList.splice(id, 1);
    onChange(emailList);
  }
  const handleWrapperClick = () => inputText.focus();
  const handleEmailClick = (e: Event) => e.stopPropagation();
  function handleInputFocus() {
    labelText = txtTo;
    showInput = true;
  }
  function handleInputBlur() {
    addEmail(text);
    if (emailList.length === 0 && text === '') {
      showInput = false;
      labelText = txtRecipients;
    }
  }
  const createHandleDeleteEmail = (id: number) => () => deleteEmail(id);
  function handleInputKeypup(e: KeyboardEvent & HTMLElementEvent<HTMLInputElement>) {
    switch (e.key) {
      case 'Backspace':
        if (text !== '') {
          text = e.target.value;
          return;
        }
        deleteEmail(emailList.length - 1);
        break;
      case 'Enter':
        addEmail(e.target.value);
        break;
      default:
        text = e.target.value;
        break;
    }
  }
</script>

<div class="wrapper" on:click={handleWrapperClick}>
  <div class="toText" style={labelText === 'To' ? '' : 'color: var(--color-lightgrey);'}>
    {labelText}
  </div>
  {#each emailList as email, id}
    <div class="email" on:click={handleEmailClick}>
      {email}
      <div class="deleteEmail" on:click={createHandleDeleteEmail(id)}>×</div>
    </div>
  {/each}
  {#if emailList.length < 3}
    <input
      type="email"
      class="text"
      style="width: {showInput ? '100px' : '1px'}"
      value={text}
      on:blur={handleInputBlur}
      on:focus={handleInputFocus}
      on:keyup={handleInputKeypup}
      bind:this={inputText}
      disabled={isLoading}
    />
  {/if}
  <div class="customValidity" style="opacity: {isInvalidInput ? '100%' : '0%'};">
    Email format should be like name@host.com
  </div>
</div>

<style>
  .wrapper {
    display: flex;
    width: 100%;
    flex-wrap: wrap;
    border-bottom: 1px solid var(--color-lightgrey);
    margin: 0 0 25px 0;
    cursor: text;
    position: relative;
    box-sizing: border-box;
    padding-left: 20px;
  }
  .wrapper:focus {
    outline-width: 1px;
  }
  .toText {
    font-size: 14px;
    line-height: 16px;
    margin: 1px 5px 4px 0;
    position: absolute;
    left: 0;
    top: 0;
  }
  .email {
    position: relative;
    border-radius: 2px;
    background-color: var(--color-lightgrey);
    padding: 0 18px 0 5px;
    margin: 0 4px 4px 0;
    font-size: 14px;
    line-height: 18px;
    color: var(--color-darkgrey);
  }
  .deleteEmail {
    position: absolute;
    top: 0;
    right: 0;
    padding: 2px 2px 4px 4px;
    cursor: pointer;
    font-size: 16px;
    line-height: 12px;
  }
  .text {
    border: none;
    margin: 0 0 4px 0;
    flex-grow: 1;
    background: none;
    font-size: 14px;
    line-height: 18px;
    font-family: 'Roboto', sans-serif;
    padding: 0;
  }
  .text:focus {
    outline-style: solid;
    outline-width: 0;
  }
  .customValidity {
    position: absolute;
    font-size: 12px;
    line-height: 16px;
    left: 0;
    bottom: -18px;
    color: #f44336;
    font-weight: 300;
    border-radius: 2px;
    transition: opacity 1s;
  }
</style>

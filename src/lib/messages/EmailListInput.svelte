<script lang="ts">
  export let emailList: Array<string> = [];
  export let onChange: (emailList: Array<string>) => void;
  let showInput = false;
  let toText = 'Recipients';
  let text = '';
  let inputText: HTMLInputElement;
  function addEmail(email: string) {
    if (!isValidEmail(email)) {
      return;
    }
    if (emailList.length >= 3) {
      return;
    }
    emailList.push(email);
    onChange(emailList);
    text = '';
  }
  function deleteEmail(id: number) {
    if (id < 0 || id >= emailList.length) {
      return;
    }
    emailList.splice(id, 1);
    emailList = emailList;
    onChange(emailList);
  }
  function handleWrapperClick() {
    inputText.focus();
  }
  function handleEmailClick(e: Event) {
    e.stopPropagation();
  }
  function handleInputFocus() {
    toText = 'To';
    showInput = true;
  }
  function handleInputBlur() {
    addEmail(text);
    if (emailList.length === 0 && text === '') {
      showInput = false;
      toText = 'Recipients';
    }
  }
  function createHandleDeleteEmail(id: number) {
    return function handleDeleteEmail() {
      deleteEmail(id);
    };
  }
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
  function isValidEmail(email: string) {
    return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      email,
    );
  }
  $: toText =
    emailList.length > 0 ||
    (typeof document !== 'undefined' && document?.activeElement) === inputText
      ? 'To'
      : 'Recipients';
</script>

<div class="wrapper" on:click={handleWrapperClick}>
  <div class="toText">{toText}</div>
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
    />
  {/if}
</div>

<style>
  .wrapper {
    display: flex;
    width: 100%;
    flex-wrap: wrap;
    border-bottom: 1px solid var(--color-grey);
    margin: 0 0 20px 0;
    cursor: text;
    position: relative;
    box-sizing: border-box;
    padding-left: 20px;
  }
  .wrapper:focus {
    outline-width: 1px;
  }
  .toText {
    font-size: 1rem;
    color: var(--color-darkgrey);
    line-height: 16px;
    margin: 1px 5px 4px 0;
    position: absolute;
    left: 0;
    top: 0;
  }
  .email {
    position: relative;
    border-radius: 2px;
    background-color: var(--color-grey);
    padding: 0 18px 0 5px;
    margin: 0 4px 4px 0;
    font-size: 0.9rem;
    color: var(--color-darkgrey);
    line-height: 1.2rem;
  }
  .deleteEmail {
    position: absolute;
    top: 0;
    right: 0;
    padding: 0 2px 4px 4px;
    cursor: pointer;
    font-size: 1.1rem;
    line-height: 1rem;
  }
  .text {
    border: none;
    margin: 0 0 4px 0;
    flex-grow: 1;
    background: none;
    line-height: 1.1rem;
    font-family: 'Roboto', sans-serif;
  }
  .text:focus {
    outline-style: solid;
    outline-width: 0;
  }
</style>

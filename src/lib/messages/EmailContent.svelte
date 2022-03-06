<script lang="ts">
  export let messageContent = '';
  export let onChange: (content: string) => void;
  const maxHeight = 400;
  let toggleShow = true;
  let autoToggle = true;
  let height = 200;
  function handleChange(e: HTMLElementEvent<HTMLTextAreaElement>) {
    messageContent = e.target.value.trim();
    onChange(messageContent);
  }
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      height += 14;
    }
  }
  function handleRevealToggle() {
    autoToggle = false;
    toggleShow = !toggleShow;
  }
  function calculateHeight(content: string) {
    const newLines = content.split('\n').length;
    const lineHeight = 14;
    const padding = 10;
    const newHeight = newLines * lineHeight + 2 * padding;
    height = Math.max(newHeight, height);
    return height;
  }
  const placeholder = 'Message is encrypted by default';
  // '\n\nYou can also encrypt the message yourself before storing it in warisin.com' +
  // '\n\nIf you encrypt it by yourself, ' +
  // 'be sure to give the decryption key to the recipients using other methods.';
  $: {
    if (autoToggle) {
      toggleShow = messageContent.length === 0;
    }
    calculateHeight(messageContent);
  }
</script>

<div class="textWrapper">
  <textarea
    class="text"
    on:change={handleChange}
    on:keydown={handleKeydown}
    maxlength="800"
    {placeholder}
    style="height: {Math.min(height, maxHeight)}px; filter: {toggleShow ? 'none' : 'blur(5px)'}"
    >{messageContent}</textarea
  >
  <div
    class="revealToggle"
    on:click={handleRevealToggle}
  >{toggleShow ? 'hide' : 'show'}</div>
</div>

<style>
  .textWrapper {
    position: relative;
    border: 1px solid var(--color-grey);
    border-radius: 4px;
  }
  .revealToggle {
    position: absolute;
    padding: 4px 5px;
    min-width: 40px;
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

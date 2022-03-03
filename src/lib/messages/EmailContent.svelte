<script lang="ts">
  export let messageContent = '';
  export let onChange: (content: string) => void;
  const maxHeight = 400;
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
  $: calculateHeight(messageContent);
</script>

<textarea
  class="text"
  on:change={handleChange}
  on:keydown={handleKeydown}
  maxlength="800"
  {placeholder}
  style="height: {Math.min(height, maxHeight)}px">{messageContent}</textarea
>

<style>
  .text {
    display: block;
    width: 100%;
    border-radius: 4px;
    line-height: 1.1rem;
    padding: 10px;
    border-color: var(--color-grey);
    resize: none;
    box-sizing: border-box;
    font-size: 1rem;
    font-family: 'Roboto', sans-serif;
    letter-spacing: 0.03rem;
  }
</style>

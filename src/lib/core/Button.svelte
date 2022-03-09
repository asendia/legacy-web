<script lang="ts">
  import { colors } from './colors';
  export let onClick: (e: MouseEvent) => void;
  export let text: string;
  export let variant: 'filled' | 'outlined' = 'outlined';
  export let color: 'primary' | 'secondary' = 'primary';
  export let style = undefined;
  export let disabled = false;
  let _style = style;

  $: {
    const backgroundColor = colors[disabled ? 'disabled' : variant + color].background || 'none';
    const borderColor = colors[disabled ? 'disabled' : variant + color].border || 'none';
    const textColor = colors[disabled ? 'disabled' : variant + color].color || 'none';
    _style =
      `--background-color: ${backgroundColor}; --border-color: ${borderColor};` +
      `--text-color: ${textColor};${disabled ? '-webkit-tap-highlight-color: transparent;' : ''}` +
      `${style ?? ''}`;
  }
</script>

<button type="button" class="button" {disabled} style={_style} on:click={onClick} tabindex="0"
  >{text}</button
>

<style>
  .button {
    text-transform: uppercase;
    text-decoration: none;
    padding: 0 12px;
    border: 1px solid var(--border-color);
    background-color: var(--background-color);
    border-radius: 4px;
    font-size: 14px;
    line-height: 28px;
    color: var(--text-color);
    cursor: pointer;
  }
  .button:focus {
    outline-color: var(--border-color);
    outline-style: solid;
  }
</style>

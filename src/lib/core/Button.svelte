<script lang="ts">
	import type { colors } from './colors';
	export let onClick: (e: MouseEvent) => void;
	export let text: string;
	export let variant: 'filled' | 'outlined' = 'outlined';
	export let color: 'primary' | 'secondary' = 'primary';
	export let style: string | undefined;
	export let disabled = false;
	let key: keyof typeof colors;

	$: {
		key = disabled ? 'disabled' : ((variant + color) as keyof typeof colors);
	}
</script>

<button
	type="button"
	class={`uppercase no-underline py-0 px-3 border focus:outline rounded-sm text-sm leading-7 ${
		key === 'filledprimary'
			? 'bg-blue border-none text-white outline-none'
			: key === 'filledsecondary'
			? 'bg-black border-none text-white outline-none'
			: key === 'outlinedprimary'
			? 'bg-none border border-blue outline-blue text-blue'
			: key === 'outlinedsecondary'
			? 'bg-none border border-black outline-black'
			: key === 'disabled'
			? 'bg-none border border-grey text-grey tap-transparent outline-grey'
			: ''
	}`}
	{style}
	{disabled}
	on:click={onClick}
	tabindex="0">{text}</button
>

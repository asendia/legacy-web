<script lang="ts">
	export let onClick: (e: MouseEvent) => void;
	export let text: string;
	export let variant: 'filled' | 'outlined' = 'outlined';
	export let color: 'primary' | 'secondary' = 'primary';
	export let style: string | undefined;
	export let disabled = false;
	let key:
		| 'filledprimary'
		| 'filledsecondary'
		| 'outlinedprimary'
		| 'outlinedsecondary'
		| 'disabled';

	$: {
		key = disabled ? 'disabled' : ((variant + color) as typeof key);
	}
</script>

<button
	type="button"
	class={`rounded-sm border px-3 py-0 text-sm leading-7 uppercase no-underline focus:outline ${
		key === 'filledprimary'
			? 'bg-blue border-none text-white outline-none'
			: key === 'filledsecondary'
				? 'border-none bg-black text-white outline-none'
				: key === 'outlinedprimary'
					? 'border-blue outline-blue text-blue border bg-none'
					: key === 'outlinedsecondary'
						? 'border border-black bg-none outline-black'
						: key === 'disabled'
							? 'border-grey text-grey tap-transparent outline-grey border bg-none'
							: ''
	}`}
	{style}
	{disabled}
	on:click={onClick}
	tabindex="0">{text}</button
>

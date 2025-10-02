<script lang="ts">
	export let onClick: (e: MouseEvent) => void;
	export let text: string;
	export let variant: 'filled' | 'outlined' = 'outlined';
	export let color: 'primary' | 'secondary' = 'primary';
	export let style: string | undefined = undefined;
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
	class={`rounded-lg px-5 py-2.5 text-sm font-medium shadow-sm transition-all duration-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none ${
		key === 'filledprimary'
			? 'bg-gray-800 text-white hover:bg-gray-900 hover:shadow active:bg-gray-700'
			: key === 'filledsecondary'
				? 'bg-gray-600 text-white hover:bg-gray-700 hover:shadow active:bg-gray-800'
				: key === 'outlinedprimary'
					? 'border border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 hover:shadow active:bg-gray-100'
					: key === 'outlinedsecondary'
						? 'border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:shadow active:bg-gray-100'
						: key === 'disabled'
							? 'cursor-not-allowed border border-gray-200 bg-gray-50 text-gray-400'
							: ''
	}`}
	{style}
	{disabled}
	on:click={onClick}
	tabindex="0">{text}</button
>

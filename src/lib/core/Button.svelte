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
	class={`rounded-md px-6 py-3 text-sm font-medium transition-all duration-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none ${
		key === 'filledprimary'
			? 'bg-gray-800 text-white shadow-sm hover:bg-gray-900 active:bg-gray-700'
			: key === 'filledsecondary'
				? 'bg-gray-600 text-white shadow-sm hover:bg-gray-700 active:bg-gray-800'
				: key === 'outlinedprimary'
					? 'border border-gray-400 text-gray-700 hover:bg-gray-50 active:bg-gray-100'
					: key === 'outlinedsecondary'
						? 'border border-gray-300 text-gray-600 hover:bg-gray-50 active:bg-gray-100'
						: key === 'disabled'
							? 'cursor-not-allowed border border-gray-200 bg-gray-50 text-gray-400'
							: ''
	}`}
	{style}
	{disabled}
	on:click={onClick}
	tabindex="0">{text}</button
>

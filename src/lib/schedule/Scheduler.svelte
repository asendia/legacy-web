<script lang="ts">
	import type { I18nContext } from '$lib/i18n/i18n';
	import { getContext } from 'svelte';
	const { tr } = getContext<I18nContext>('i18n');
	export let reminderIntervalDays: number;
	export let inactivePeriodDays: number;
	export let onChange: (value: number, type: 'reminder' | 'inactive') => void;
	export let emailCreator = tr('yourEmailPlaceholder');
	const inactivePeriodDaysOptions = [30, 60, 90];
	const reminderIntervalDaysOptions = [15, 30];
</script>

<div class="mb-6 rounded-lg bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
	<p class="mb-2">
		{tr('scheduler_pt1')}
		<select
			data-test-id="select-inactive"
			class="mx-1 cursor-pointer rounded-md border border-gray-300 bg-white px-2 py-1 text-gray-600 transition-colors focus:border-gray-500 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:outline-none"
			on:change={(e) => {
				const days = parseInt(e.currentTarget.value, 10);
				onChange(days, 'inactive');
			}}
		>
			{#each inactivePeriodDaysOptions as i (i)}
				{#if i === inactivePeriodDays}
					<option value={i} selected>{i} {tr('schedulerDays')}</option>
				{:else}
					<option value={i}>{i} {tr('schedulerDays')}</option>
				{/if}
			{/each}
		</select>
		{tr('scheduler_pt2')}
		<select
			data-test-id="select-reminder"
			class="mx-1 cursor-pointer rounded-md border border-gray-300 bg-white px-2 py-1 text-gray-600 transition-colors focus:border-gray-500 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:outline-none"
			on:change={(e) => {
				const days = parseInt(e.currentTarget.value, 10);
				onChange(days, 'reminder');
			}}
		>
			{#each reminderIntervalDaysOptions as i (i)}
				{#if i === reminderIntervalDays}
					<option value={i} selected>{i} {tr('schedulerDays')}</option>
				{:else}
					<option value={i}>{i} {tr('schedulerDays')}</option>
				{/if}
			{/each}
		</select>
		{tr('scheduler_pt3')}
		<span class="font-medium text-gray-900">{emailCreator}</span>.
	</p>
</div>

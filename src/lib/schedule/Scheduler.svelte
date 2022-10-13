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

<div class="text-sm pb-4 leading-5 font-light">
	{tr('scheduler_pt1')}
	<select
		data-test-id="select-inactive"
		class="border border-[transparent] text-lg border-b-blue text-blue cursor-pointer bg-none font-light rounded-sm focus:outline-0 focus:border-blue"
		on:change={(e) => {
			const days = parseInt(e.currentTarget.value, 10);
			onChange(days, 'inactive');
		}}
	>
		{#each inactivePeriodDaysOptions as i}
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
		class="border border-[transparent] text-lg border-b-blue text-blue cursor-pointer bg-none font-light rounded-sm focus:outline-0 focus:border-blue"
		on:change={(e) => {
			const days = parseInt(e.currentTarget.value, 10);
			onChange(days, 'reminder');
		}}
	>
		{#each reminderIntervalDaysOptions as i}
			{#if i === reminderIntervalDays}
				<option value={i} selected>{i} {tr('schedulerDays')}</option>
			{:else}
				<option value={i}>{i} {tr('schedulerDays')}</option>
			{/if}
		{/each}
	</select>
	{tr('scheduler_pt3')}
	{emailCreator}.
</div>

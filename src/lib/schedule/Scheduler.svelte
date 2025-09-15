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

<div class="pb-4 text-sm leading-5 font-light">
	{tr('scheduler_pt1')}
	<select
		data-test-id="select-inactive"
		class="border-b-blue text-blue focus:border-blue cursor-pointer rounded-sm border border-[transparent] bg-none font-light focus:outline-0"
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
		class="border-b-blue text-blue focus:border-blue cursor-pointer rounded-sm border border-[transparent] bg-none font-light focus:outline-0"
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
	{emailCreator}.
</div>

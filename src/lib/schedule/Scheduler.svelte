<script lang="ts">
  import type { I18nContext } from '$lib/i18n/i18n';
  import { getContext } from 'svelte';
  const { tr } = getContext<I18nContext>('i18n');
  import type { HTMLElementEvent } from '$lib/core/types';
  export let reminderIntervalDays: number;
  export let inactivePeriodDays: number;
  export let onChange: (value: number, type: 'reminder' | 'inactive') => void;
  export let emailCreator = tr('yourEmailPlaceholder');
  const inactivePeriodDaysOptions = [30, 60, 90];
  const reminderIntervalDaysOptions = [15, 30];

  function handleReminderIntervalChange(e: HTMLElementEvent<HTMLSelectElement>) {
    const days = parseInt(e.target.value, 10);
    onChange(days, 'reminder');
  }
  function handleInactivePeriodChange(e: HTMLElementEvent<HTMLSelectElement>) {
    const days = parseInt(e.target.value, 10);
    onChange(days, 'inactive');
  }
</script>

<div class="scheduler">
  {tr('scheduler_pt1')}
  <select on:change={handleInactivePeriodChange}>
    {#each inactivePeriodDaysOptions as i}
      {#if i === inactivePeriodDays}
        <option value={i} selected>{i} {tr('schedulerDays')}</option>
      {:else}
        <option value={i}>{i} {tr('schedulerDays')}</option>
      {/if}
    {/each}
  </select>
  {tr('scheduler_pt2')}
  <select on:change={handleReminderIntervalChange}>
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

<style>
  .scheduler {
    font-size: 14px;
    padding: 0 0 16px 0;
    line-height: 22px;
    font-weight: 300;
  }
  select {
    border: none;
    border: 1px solid transparent;
    border-bottom: 1px solid var(--color-blue);
    color: var(--color-blue);
    cursor: pointer;
    font-size: 18px;
    background: none;
    font-weight: 300;
  }
  select:focus {
    outline-width: 0;
    border: 1px solid var(--color-blue);
    border-radius: 3px;
  }
</style>

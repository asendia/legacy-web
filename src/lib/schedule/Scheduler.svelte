<script lang="ts">
  import type { HTMLElementEvent } from '$lib/core/types';
  export let emailCreator = 'me';
  export let reminderIntervalDays: number;
  export let inactivePeriodDays: number;
  export let onChange: (value: number, type: 'reminder' | 'inactive') => void;

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

<div class="wrapper">
  Send this message to recipients after
  <select on:change={handleInactivePeriodChange}>
    {#each inactivePeriodDaysOptions as i}
      {#if i === inactivePeriodDays}
        <option value={i} selected>{i} days</option>
      {:else}
        <option value={i}>{i} days</option>
      {/if}
    {/each}
  </select>
  of inactivity. Every
  <select on:change={handleReminderIntervalChange}>
    {#each reminderIntervalDaysOptions as i}
      {#if i === reminderIntervalDays}
        <option value={i} selected>{i} days</option>
      {:else}
        <option value={i}>{i} days</option>
      {/if}
    {/each}
  </select>
  a reminder will be sent to {emailCreator}.
</div>

<style>
  .wrapper {
    font-size: 14px;
    padding: 16px 0;
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

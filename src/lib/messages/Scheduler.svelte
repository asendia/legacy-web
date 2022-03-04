<script lang="ts">
  export let emailCreator = 'me';
  export let reminderIntervalDays: number;
  export let inactivePeriodDays: number;
  export let onChange: (value: number, type: 'reminder' | 'inactive') => void;

  function handleReminderIntervalChange(e: HTMLElementEvent<HTMLSelectElement>) {
    reminderIntervalDays = parseInt(e.target.value, 10);
    onChange(reminderIntervalDays, 'reminder');
  }
  function handleInactivePeriodChange(e: HTMLElementEvent<HTMLSelectElement>) {
    inactivePeriodDays = parseInt(e.target.value, 10);
    onChange(inactivePeriodDays, 'inactive');
  }
</script>

<div class="wrapper">
  Send this message to recipients after
  <select on:change={handleInactivePeriodChange}>
    {#each [30, 60, 90] as i}
      {#if i === inactivePeriodDays}
        <option value={i} selected>{i / 30} months</option>
      {:else}
        <option value={i}>{i / 30} months</option>
      {/if}
    {/each}
  </select>
  of inactivity. Every
  <select on:change={handleReminderIntervalChange}>
    {#each [15, 30] as i}
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
    font-size: 0.9rem;
    padding: 16px 0;
    line-height: 1.3rem;
    font-weight: 300;
  }
  select {
    border: none;
    border-bottom: 1px solid var(--color-grey);
    cursor: pointer;
    font-size: 1.1rem;
    background: none;
  }
  select:focus {
    outline-width: 0;
  }
</style>

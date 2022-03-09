<script lang="ts">
  import Button from '$lib/core/Button.svelte';
  import { logout, getAuthObject, type AuthObject } from '$lib/users/auth';
  import { onMount } from 'svelte';
  import { fetchAuthorizeUser } from './fetchUsers';

  let message = 'Testament in the cloud';
  let auth: AuthObject;
  let disabled = true;

  function handleLogin() {
    disabled = true;
    fetchAuthorizeUser('google');
  }
  function handleLogout() {
    disabled = true;
    logout();
  }
  onMount(async () => {
    auth = await getAuthObject();
    if (auth) {
      message = 'Welcome, ' + (auth.user_metadata?.full_name ?? auth.email);
    }
    disabled = false;
  });
</script>

<div>
  <span>{message}</span>
  {#if auth}
    <Button {disabled} onClick={handleLogout} color="secondary" text="logout" />
  {:else}
    <Button {disabled} onClick={handleLogin} text="login" />
  {/if}
</div>

<style>
  div {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  span {
    font-size: 14px;
    font-weight: 300;
    margin-right: 10px;
  }
</style>

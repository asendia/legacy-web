<script lang="ts">
  import Button from '$lib/core/Button.svelte';
  import { authorizeUser, logout, getAuthObject, type AuthObject } from '$lib/users/fetchUser';
  import { onMount } from 'svelte';

  let message = 'Testament in the cloud';
  let auth: AuthObject;
  let disabled = false;

  function handleLogin() {
    disabled = true;
    authorizeUser('google');
  }
  function handleLogout() {
    disabled = true;
    logout();
  }
  onMount(async () => {
    disabled = true;
    auth = await getAuthObject();
    if (auth) {
      message = 'Welcome, ' + auth.email;
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

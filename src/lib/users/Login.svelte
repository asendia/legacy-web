<script lang="ts">
  import Button from '$lib/core/Button.svelte';
  import { logout, type AuthObject } from '$lib/users/auth';
  import { fetchAuthorizeUser } from './userFetcher';
  export let auth: AuthObject;
  let message = 'Testament in the cloud';
  let disabled = true;
  let color: 'primary' | 'secondary' = 'primary';
  let text = 'login';

  function handleLogin() {
    disabled = true;
    fetchAuthorizeUser('google');
  }
  function handleLogout() {
    disabled = true;
    logout();
  }
  $: {
    if (auth) {
      message = 'Welcome, ' + (auth.user_metadata?.full_name ?? auth.email);
      color = 'secondary';
      text = 'logout';
    } else {
      color = 'primary';
      text = 'login';
    }
    disabled = false;
  }
</script>

<div>
  <span>{message}</span>
  <Button onClick={auth ? handleLogout : handleLogin} {disabled} {color} {text} />
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

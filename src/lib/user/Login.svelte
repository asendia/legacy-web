<script lang="ts">
  import Button from '$lib/core/Button.svelte';
  import type { TranslationFunction } from '$lib/i18n/translation';
  import { getAuthFromLocalStorage, logout, type AuthObject } from '$lib/user/auth';
  import { getContext, onMount } from 'svelte';
  import { fetchAuthorizeUser } from './userFetcher';
  const tr = getContext<TranslationFunction>('tr');
  let auth: AuthObject;
  let message = tr('subheading');
  let disabled = true;
  let color: 'primary' | 'secondary' = 'primary';
  let text = tr('login');
  const enableButton = () => (disabled = false);
  onMount(() => {
    addEventListener('popstate', enableButton);
    addEventListener('pageshow', enableButton);
    try {
      auth = getAuthFromLocalStorage();
    } catch (err) {
      switch (err.message) {
        case 'auth is undefined':
          break;
        case 'auth is expired':
          break;
      }
    }
    return () => {
      removeEventListener('popstate', enableButton);
      removeEventListener('pageshow', enableButton);
    };
  });
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
      message = tr('welcome') + ', ' + (auth.user_metadata?.full_name ?? auth.email);
      color = 'secondary';
      text = tr('logout');
    } else {
      color = 'primary';
      text = tr('login');
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

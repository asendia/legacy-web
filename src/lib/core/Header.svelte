<script lang="ts">
	import LanguagePicker from '$lib/i18n/LanguagePicker.svelte';
	import Login from '$lib/user/Login.svelte';
	import Logo from './sejiwo-logo.png';
</script>

<header class="m-0 mb-2 flex items-end justify-between">
	<div class="relative mr-6 flex items-center">
		<img src={Logo} width="30px" height="30px" alt="sejiwo logo" />
		<h1 class="m-0 ml-2 text-2xl font-extralight tracking-wider">sejiwo</h1>
	</div>
	<div class="flex">
		<LanguagePicker />
		<Login />
	</div>
</header>

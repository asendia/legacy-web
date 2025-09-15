<script lang="ts">
	import LanguagePicker from '$lib/i18n/LanguagePicker.svelte';
	import Login from '$lib/user/Login.svelte';
	import Logo from './sejiwo-logo.png';
</script>

<header class="mb-8 flex items-center justify-between py-4">
	<div class="flex min-w-0 items-center gap-3">
		<div class="flex-shrink-0 rounded-md bg-gray-800 p-2 shadow-sm">
			<img src={Logo} width="24" height="24" alt="sejiwo logo" class="brightness-0 invert" />
		</div>
		<h1 class="flex-shrink-0 text-2xl font-light tracking-wide text-gray-800">sejiwo</h1>
	</div>
	<div class="ml-4 flex min-w-0 flex-shrink-0 items-center gap-2">
		<LanguagePicker />
		<Login />
	</div>
</header>

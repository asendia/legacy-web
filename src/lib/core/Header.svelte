<script lang="ts">
	import LanguagePicker from '$lib/i18n/LanguagePicker.svelte';
	import Login from '$lib/user/Login.svelte';
	import Logo from './sejiwo-logo.png';
</script>

<header class="flex justify-between items-end m-0 mb-2">
	<div class="relative flex items-center mr-6">
		<img src={Logo} width={'30px'} height={'30px'} alt={'sejiwo logo'} />
		<h1 class="text-2xl m-0 ml-2 font-extralight tracking-wider">sejiwo</h1>
	</div>
	<div class="flex">
		<LanguagePicker />
		<Login />
	</div>
</header>

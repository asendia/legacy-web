<script lang="ts">
	import LanguagePicker from '$lib/i18n/LanguagePicker.svelte';
	import Login from '$lib/user/Login.svelte';
	import Logo from './sejiwo-logo.png';
</script>

<header class="header">
	<div class="iconWrapper">
		<img src={Logo} width={'30px'} height={'30px'} alt={'sejiwo logo'} />
		<h1 class="heading">sejiwo</h1>
	</div>
	<div class="menuWrapper">
		<LanguagePicker />
		<Login />
	</div>
</header>

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		margin: 0 0 10px 0;
	}
	.iconWrapper {
		position: relative;
		display: flex;
		align-items: center;
		margin-right: 25px;
	}
	.heading {
		font-size: 22px;
		margin: 0 0 0 10px;
		font-weight: lighter;
		letter-spacing: 2px;
	}
	.menuWrapper {
		display: flex;
	}
</style>

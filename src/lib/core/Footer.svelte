<script lang="ts">
	import type { I18nContext } from '$lib/i18n/i18n';
	import { getContext } from 'svelte';
	const { tr } = getContext<I18nContext>('i18n');
</script>

<footer>
	2018 - 2022
	<br />
	<div>
		sejiwo - {tr('sourceCode')}:
		<a target="_blank" rel="noopener noreferrer" href="https://github.com/asendia/legacy-web">
			web
		</a>
		<a target="_blank" rel="noopener noreferrer" href="https://github.com/asendia/legacy-api">
			api
		</a>
	</div>
</footer>

<style>
	footer {
		font-size: 12px;
		font-weight: 300;
		text-align: center;
		height: 10vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
	footer > div {
		color: var(--color-darkgrey);
	}
	footer a {
		color: var(--color-blue);
	}
</style>

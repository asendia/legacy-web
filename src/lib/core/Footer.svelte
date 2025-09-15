<script lang="ts">
	import type { I18nContext } from '$lib/i18n/i18n';
	import { getContext } from 'svelte';
	const { tr } = getContext<I18nContext>('i18n');
</script>

<footer class="flex h-[8vh] flex-col justify-center text-center text-xs font-light">
	2018 - 2022
	<br />
	<div class="text-grey-dark">
		sejiwo - {tr('sourceCode')}:
		<a
			class="text-blue"
			target="_blank"
			rel="noopener noreferrer"
			href="https://github.com/asendia/legacy-web"
		>
			web
		</a>
		<a
			class="text-blue"
			target="_blank"
			rel="noopener noreferrer"
			href="https://github.com/asendia/legacy-api"
		>
			api
		</a>
	</div>
</footer>

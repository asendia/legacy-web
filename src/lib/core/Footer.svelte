<script lang="ts">
	import type { I18nContext } from '$lib/i18n/i18n';
	import { getContext } from 'svelte';
	const { tr } = getContext<I18nContext>('i18n');
</script>

<footer class="mt-12 flex flex-col items-center justify-center space-y-1.5 py-6 text-center">
	<div class="text-sm text-gray-500">2018 - 2025</div>
	<div class="text-sm text-gray-600">
		sejiwo - {tr('sourceCode')}:
		<a
			class="ml-1.5 inline-flex items-center gap-1 text-gray-600 transition-colors hover:text-gray-800 hover:underline"
			target="_blank"
			rel="noopener noreferrer"
			href="https://github.com/asendia/legacy-web"
		>
			web
		</a>
		<a
			class="ml-1.5 inline-flex items-center gap-1 text-gray-600 transition-colors hover:text-gray-800 hover:underline"
			target="_blank"
			rel="noopener noreferrer"
			href="https://github.com/asendia/legacy-api"
		>
			api
		</a>
	</div>
</footer>

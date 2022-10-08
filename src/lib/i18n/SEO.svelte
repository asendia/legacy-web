<script lang="ts">
	import { WEB_URL } from '$lib/core/urls';
	import { locales } from '$lib/i18n/i18n';
	export let pathname: string;
	export let locale: string;
	let canonicalURL: string;
	const alternateURLs = locales.map((loc, id) => {
		const url = WEB_URL + pathname + (id === 0 ? '' : '?hl=' + loc);
		if (loc === locale) {
			canonicalURL = url;
		}
		return url;
	});
</script>

{#each alternateURLs as url, id}
	<link rel="alternate" hreflang={locales[id]} href={url} />
{/each}
<link rel="canonical" href={canonicalURL} />

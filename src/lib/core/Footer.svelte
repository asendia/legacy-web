<script lang="ts">
  import type { TranslationFunction } from '$lib/i18n/translation';
  import { getContext } from 'svelte';
  const tr = getContext<TranslationFunction>('tr');
</script>

<footer>
  2018 - 2022
  <br />
  sejiwo - {tr('sourceCode')}:
  <a target="_blank" rel="noopener noreferrer" href="https://github.com/asendia/legacy-web">
    web
  </a>
  <a target="_blank" rel="noopener noreferrer" href="https://github.com/asendia/legacy-api">
    api
  </a>
</footer>

<style>
  footer {
    margin-top: 20px;
    padding-bottom: 20px;
    font-size: 12px;
    font-weight: 300;
    text-align: center;
  }
  a {
    color: var(--color-blue);
  }
</style>

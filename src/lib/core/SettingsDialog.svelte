<script lang="ts">
	import { onMount } from 'svelte';
	export let title: string;
	export let closeLabel = 'Close';
	export let onClose: () => void;
	let dialog: HTMLDialogElement;
	onMount(() => {
		const previous = document.activeElement as HTMLElement | null;
		const overflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		dialog.showModal();
		return () => {
			document.body.style.overflow = overflow;
			previous?.focus();
		};
	});
</script>

<dialog bind:this={dialog} aria-labelledby="settings-title" on:close={onClose}>
	<div class="panel-heading">
		<h2 id="settings-title">{title}</h2>
		<button type="button" aria-label={closeLabel} on:click={() => dialog.close()}>✕</button>
	</div>
	<div class="panel-content"><slot /></div>
</dialog>

<style>
	dialog {
		margin: auto;
		width: min(32rem, calc(100% - 2rem));
		max-height: calc(100dvh - 2rem);
		padding: 0;
		border: 1px solid #e5e7eb;
		border-radius: 1.25rem;
		color: #1f2937;
		background: white;
		box-shadow: 0 24px 80px #11182730;
	}
	dialog::backdrop {
		background: #11182780;
		backdrop-filter: blur(3px);
	}
	.panel-heading {
		position: sticky;
		top: 0;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid #f0f1f3;
		background: white;
	}
	h2 {
		font-size: 1.125rem;
		font-weight: 600;
	}
	button {
		width: 44px;
		height: 44px;
		border-radius: 50%;
		background: #f3f4f6;
	}
	button:hover {
		background: #e5e7eb;
	}
	button:focus-visible {
		outline: 2px solid #374151;
		outline-offset: 3px;
	}
	.panel-content {
		padding: 1.5rem;
	}
	@media (max-width: 480px) {
		dialog {
			width: calc(100% - 1rem);
			max-height: calc(100dvh - 1rem);
		}
		.panel-content {
			padding: 1.25rem;
		}
		.panel-heading {
			padding: 0.75rem 1.25rem;
		}
	}
</style>

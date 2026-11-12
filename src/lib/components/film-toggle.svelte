<script lang="ts">
	import { copyFor, type Lang } from '#lib/i18n/index.ts';
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		lang: Lang;
		/** Whether the film is running now. The button then offers to stop it. */
		running: boolean;
		onclick: () => void;
		/** Takes the keyboard focus as it arrives, when it replaces a button the visitor pressed. */
		takesFocus?: boolean;
		class?: string;
	}

	let { lang, running, onclick, takesFocus = false, class: className }: Props = $props();

	const copy = $derived(copyFor(lang).films);

	const focusOnArrival = (button: HTMLButtonElement): void => {
		if (takesFocus) button.focus();
	};
</script>

<!--
	The one small button on a film that runs by itself, in its lower right corner: it stops the
	film and starts it again. Whatever holds it has to be `relative`.
-->
<button
	{@attach focusOnArrival}
	type="button"
	{onclick}
	class={cn(
		'absolute right-2 bottom-2 inline-flex size-11 cursor-pointer items-center justify-center rounded-full bg-wall/80 text-ink transition-colors hover:bg-wall',
		className
	)}
>
	<svg viewBox="0 0 16 16" aria-hidden="true" class="size-4 fill-current">
		{#if running}
			<path d="M4 3h3v10H4zM9 3h3v10H9z" />
		{:else}
			<path d="M5 3l8 5-8 5z" />
		{/if}
	</svg>
	<span class="sr-only">{running ? copy.pause : copy.play}</span>
</button>

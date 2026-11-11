<script lang="ts">
	import type { Work } from '#lib/content/works.ts';
	import { workHref } from '#lib/i18n/href.ts';
	import { copyFor, type Lang } from '#lib/i18n/index.ts';
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		lang: Lang;
		/** The works before and after the one being shown. Each is missing at its end of the order. */
		previous?: Work;
		next?: Work;
		class?: string;
	}

	let { lang, previous, next, class: className }: Props = $props();

	const copy = $derived(copyFor(lang).works.detail);
	const linkClass =
		'inline-flex min-h-11 items-center gap-3 text-label text-ink uppercase decoration-line underline-offset-8 hover:underline';
</script>

<!-- The way to the works before and after. One with no title yet is just "the previous work". -->
<nav aria-label={copy.navLabel} class={cn(className)}>
	<div class="flex flex-col gap-2 border-t border-line pt-6 sm:flex-row sm:justify-between">
		{#if previous}
			<a href={workHref(lang, previous.slug)} rel="prev" class={linkClass}>
				<span aria-hidden="true">←</span>
				{#if previous.title !== undefined}
					<span lang="es">{previous.title}</span>
				{:else}
					{copy.previous}
				{/if}
			</a>
		{/if}
		{#if next}
			<a href={workHref(lang, next.slug)} rel="next" class={cn(linkClass, 'sm:ml-auto')}>
				{#if next.title !== undefined}
					<span lang="es">{next.title}</span>
				{:else}
					{copy.next}
				{/if}
				<span aria-hidden="true">→</span>
			</a>
		{/if}
	</div>
</nav>

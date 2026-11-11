<script lang="ts">
	import { catalogNumber, type Work } from '#lib/content/works.ts';
	import type { Lang } from '#lib/i18n/index.ts';
	import { cn } from '#lib/utils/cn.ts';
	import WorkStatus from './work-status.svelte';

	interface Props {
		work: Work;
		lang: Lang;
		/**
		 * Makes the title a link to the work's page. The link covers its nearest `relative`
		 * ancestor, so the whole card is one target.
		 */
		href?: string;
		class?: string;
	}

	let { work, lang, href, class: className }: Props = $props();
</script>

<!-- A wall label: catalog number, title, technique, size, status. Titles are always Spanish. -->
<div class={cn('flex flex-col gap-1.5', className)}>
	<h3 class="flex gap-3 text-label text-ink uppercase">
		<span class="text-ink-soft tabular-nums">{catalogNumber(work.n)}</span>
		{#if href}
			<a
				{href}
				lang="es"
				class="decoration-line underline-offset-4 after:absolute after:inset-0 hover:underline"
			>
				{work.title}
			</a>
		{:else}
			<span lang="es">{work.title}</span>
		{/if}
	</h3>
	<p class="text-sm leading-relaxed text-ink-soft">{work.medium[lang]}</p>
	<p class="text-sm text-ink-soft tabular-nums">{work.dimensions[lang]}</p>
	{#if work.status}
		<WorkStatus status={work.status} {lang} class="pt-1" />
	{/if}
</div>

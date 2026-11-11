<script lang="ts">
	import { thumbOf } from '#lib/content/images.ts';
	import { catalogNumber, type Work } from '#lib/content/works.ts';
	import { workHref } from '#lib/i18n/href.ts';
	import type { Lang } from '#lib/i18n/index.ts';
	import { cn } from '#lib/utils/cn.ts';
	import WorkStatus from './work-status.svelte';

	interface Props {
		works: readonly Work[];
		lang: Lang;
		class?: string;
	}

	let { works, lang, class: className }: Props = $props();
</script>

<!-- The full list of works: thumbnail, number and title, technique, size. Each row opens the work. -->
<ol class={cn('border-t border-line', className)}>
	{#each works as work (work.n)}
		{@const thumb = thumbOf(work)}
		<li
			id={work.slug}
			class="relative grid grid-cols-works-row-compact items-start gap-x-5 gap-y-1 border-b border-line py-5 md:grid-cols-works-row md:items-center md:gap-x-8"
		>
			<div class="row-span-3 aspect-thumb w-thumb bg-plate md:row-span-1">
				{#if thumb}
					<enhanced:img src={thumb} alt="" loading="lazy" class="size-full object-contain" />
				{/if}
			</div>
			<div class="flex flex-col gap-2">
				<h3 class="flex gap-3 text-label text-ink uppercase">
					<span class="text-ink-soft tabular-nums">{catalogNumber(work.n)}</span>
					<a
						href={workHref(lang, work.slug)}
						lang="es"
						class="decoration-line underline-offset-4 after:absolute after:inset-0 hover:underline"
					>
						{work.title}
					</a>
				</h3>
				{#if work.status}
					<WorkStatus status={work.status} {lang} />
				{/if}
			</div>
			<p class="text-sm leading-relaxed text-ink-soft">{work.medium[lang]}</p>
			<p class="text-sm text-ink-soft tabular-nums md:text-right">{work.dimensions[lang]}</p>
		</li>
	{/each}
</ol>

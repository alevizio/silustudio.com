<script lang="ts">
	import { CATALOG_THUMBS } from '#lib/content/images.ts';
	import { catalogNumber, type Work } from '#lib/content/works.ts';
	import type { Lang } from '#lib/i18n/index.ts';
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		works: readonly Work[];
		lang: Lang;
		class?: string;
	}

	let { works, lang, class: className }: Props = $props();
</script>

<!-- The full list of works: thumbnail, number and title, technique, size. -->
<ol class={cn('border-t border-line', className)}>
	{#each works as work (work.n)}
		{@const number = catalogNumber(work.n)}
		{@const thumb = CATALOG_THUMBS[number]}
		<li
			id={work.slug}
			class="grid grid-cols-works-row-compact items-start gap-x-5 gap-y-1 border-b border-line py-5 md:grid-cols-works-row md:items-center md:gap-x-8"
		>
			<div class="row-span-3 aspect-thumb w-thumb bg-plate md:row-span-1">
				{#if thumb}
					<enhanced:img src={thumb} alt="" loading="lazy" class="size-full object-contain" />
				{/if}
			</div>
			<h3 class="flex gap-3 text-label text-ink uppercase">
				<span class="text-ink-soft tabular-nums">{number}</span>
				<span lang="es">{work.title}</span>
			</h3>
			<p class="text-sm leading-relaxed text-ink-soft">{work.medium[lang]}</p>
			<p class="text-sm text-ink-soft tabular-nums md:text-right">{work.dimensions[lang]}</p>
		</li>
	{/each}
</ol>

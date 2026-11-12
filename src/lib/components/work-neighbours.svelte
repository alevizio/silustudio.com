<script lang="ts">
	import { photosOf } from '#lib/content/images.ts';
	import type { Work } from '#lib/content/works.ts';
	import { workHref } from '#lib/i18n/href.ts';
	import { copyFor, type Lang } from '#lib/i18n/index.ts';
	import { cn } from '#lib/utils/cn.ts';
	import ArrowIcon from './arrow-icon.svelte';

	interface Props {
		lang: Lang;
		/** The works before and after the one being shown. Each is missing at its end of the order. */
		previous?: Work;
		next?: Work;
		class?: string;
	}

	let { lang, previous, next, class: className }: Props = $props();

	const copy = $derived(copyFor(lang).works.detail);

	const SIDES = {
		left: { rel: 'prev', place: 'items-start', nudge: 'group-hover:-translate-x-1' },
		right: {
			rel: 'next',
			place: 'col-start-2 items-end text-right',
			nudge: 'group-hover:translate-x-1'
		}
	};
</script>

{#snippet neighbour(work: Work, direction: 'left' | 'right', short: string, long: string)}
	{@const side = SIDES[direction]}
	{@const photo = photosOf(work)[0]}
	<a
		href={workHref(lang, work.slug)}
		rel={side.rel}
		class={cn('group flex flex-col gap-4', side.place)}
	>
		{#if photo}
			<!-- The link already names the work, so its photo adds nothing for a screen reader. -->
			<enhanced:img
				src={photo}
				alt=""
				sizes="(min-width: 768px) 15rem, 40vw"
				loading="lazy"
				class="h-28 w-auto max-w-full object-contain transition-transform duration-700 ease-settle motion-safe:group-hover:scale-102 md:h-40"
			/>
		{/if}
		<span class="flex flex-col gap-1">
			<span
				class={cn(
					'inline-flex min-h-6 items-center gap-3 text-label text-ink-soft uppercase',
					direction === 'right' && 'flex-row-reverse'
				)}
			>
				<ArrowIcon {direction} class={cn('transition-transform duration-300', side.nudge)} />
				<!-- One with no title yet is just "the previous work". -->
				{work.title === undefined ? long : short}
			</span>
			{#if work.title !== undefined}
				<span
					lang="es"
					class="font-serif text-lead decoration-line underline-offset-4 group-hover:underline"
				>
					{work.title}
				</span>
			{/if}
		</span>
	</a>
{/snippet}

<!-- The way to the works before and after, each with its photo, at the end of a work's page. -->
<nav aria-label={copy.navLabel} class={cn(className)}>
	<div class="grid grid-cols-2 gap-x-6 border-t border-line pt-8">
		{#if previous}
			{@render neighbour(previous, 'left', copy.before, copy.previous)}
		{/if}
		{#if next}
			{@render neighbour(next, 'right', copy.after, copy.next)}
		{/if}
	</div>
</nav>

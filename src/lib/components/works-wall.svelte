<script lang="ts">
	import { fullSizePhotosOf } from '#lib/content/images.ts';
	import type { Work } from '#lib/content/works.ts';
	import { workHref } from '#lib/i18n/href.ts';
	import { copyFor, nameOf, type Lang } from '#lib/i18n/index.ts';
	import { cn } from '#lib/utils/cn.ts';
	import WorkStatus from './work-status.svelte';

	interface Props {
		/** Works that have a full size photo. A work without one is left out. */
		works: readonly Work[];
		lang: Lang;
		/** Name of the list, for screen readers. */
		label: string;
		class?: string;
	}

	let { works, lang, label, class: className }: Props = $props();

	/** The first row is on screen when the page opens, so its photos load at once. */
	const FIRST_ROW = 2;
	const SIZES = '(min-width: 1280px) 35rem, (min-width: 768px) 45vw, 92vw';

	const hung = $derived(
		works.flatMap((work) => {
			const photo = fullSizePhotosOf(work)[0];
			return photo ? [{ work, photo, name: nameOf(work, lang) }] : [];
		})
	);
	const photoAlt = $derived(copyFor(lang).works.photoAlt);
</script>

<!--
	The wall of works, two to a row. Each photo keeps its own shape and is never cropped.
	A tile spans two rows of the list's grid, photo then label, so the photos of a row share
	one baseline and their labels start on one line. The whole tile opens the work's page.
-->
<ul aria-label={label} class={cn('grid gap-x-gutter md:grid-cols-2', className)}>
	{#each hung as { work, photo, name }, index (work.slug)}
		<li class="relative row-span-2 grid grid-rows-subgrid gap-y-5 pb-16 md:pb-24">
			<enhanced:img
				src={photo}
				alt={photoAlt(name, work.medium?.[lang])}
				sizes={SIZES}
				loading={index < FIRST_ROW ? 'eager' : 'lazy'}
				class="max-h-hang max-w-full self-end justify-self-center object-contain"
			/>
			<div class="flex flex-col items-center gap-1.5 text-center">
				<p class="text-label text-ink uppercase">
					<a
						href={workHref(lang, work.slug)}
						class="decoration-line underline-offset-4 after:absolute after:inset-0 hover:underline focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-sand-deep"
					>
						{#if work.title}
							<span lang="es">{work.title}</span>
						{:else}
							<span class="sr-only">{name}</span>
						{/if}
					</a>
				</p>
				{#if work.dimensions}
					<p class="text-sm text-ink-soft tabular-nums">{work.dimensions[lang]}</p>
				{/if}
				{#if work.status}
					<WorkStatus status={work.status} {lang} />
				{/if}
			</div>
		</li>
	{/each}
</ul>

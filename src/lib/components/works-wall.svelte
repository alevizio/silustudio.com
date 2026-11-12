<script lang="ts">
	import { photosOf } from '#lib/content/images.ts';
	import type { Work } from '#lib/content/works.ts';
	import { workHref } from '#lib/i18n/href.ts';
	import { copyFor, nameOf, type Lang } from '#lib/i18n/index.ts';
	import { cn } from '#lib/utils/cn.ts';
	import WorkStatus from './work-status.svelte';

	interface Props {
		/** Each work hangs with its first photo. A work with no photo at all is left out. */
		works: readonly Work[];
		lang: Lang;
		/** Name of the list, for screen readers. */
		label: string;
		/**
		 * Works to a row on a wide screen. Two for full size photos. Three for the small photos
		 * from the catalog, which is as large as they go without being stretched.
		 */
		columns?: 2 | 3;
		/** Set when the wall opens the page: its first row is then on screen and loads at once. */
		opensPage?: boolean;
		class?: string;
	}

	let { works, lang, label, columns = 2, opensPage = false, class: className }: Props = $props();

	const LAYOUTS = {
		2: {
			grid: 'md:grid-cols-2',
			sizes: '(min-width: 1280px) 35rem, (min-width: 768px) 45vw, 92vw',
			// The works of a row arrive one after another, left to right.
			stagger: 'md:even:reveal-after-1'
		},
		3: {
			grid: 'sm:grid-cols-2 lg:grid-cols-3',
			sizes: '(min-width: 1280px) 22rem, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw',
			stagger:
				'sm:max-lg:even:reveal-after-1 lg:[&:nth-child(3n+2)]:reveal-after-1 lg:[&:nth-child(3n)]:reveal-after-2'
		}
	};

	const layout = $derived(LAYOUTS[columns]);
	const hung = $derived(
		works.flatMap((work) => {
			const photo = photosOf(work)[0];
			return photo ? [{ work, photo, name: nameOf(work, lang) }] : [];
		})
	);
	const photoAlt = $derived(copyFor(lang).works.photoAlt);
</script>

<!--
	A wall of works. Each photo keeps its own shape, is never cropped and never shown larger
	than its own pixels. A tile spans two rows of the list's grid, photo then label, so the
	photos of a row share one baseline and their labels start on one line. The whole tile
	opens the work's page, and its id lets a link point at it (/obras/#simbiosis). A tile
	arrives softly as the visitor reaches it, and its photo comes a hair closer under the pointer.
-->
<ul aria-label={label} class={cn('grid gap-x-gutter', layout.grid, className)}>
	{#each hung as { work, photo, name }, index (work.slug)}
		<li
			id={work.slug}
			class={cn(
				'group relative row-span-2 grid reveal grid-rows-subgrid gap-y-5 pb-16 md:pb-24',
				layout.stagger
			)}
		>
			<enhanced:img
				src={photo}
				alt={photoAlt(name, work.medium?.[lang])}
				sizes={layout.sizes}
				loading={opensPage && index < columns ? 'eager' : 'lazy'}
				class="max-h-hang max-w-full self-end justify-self-center object-contain transition-transform duration-700 ease-settle motion-safe:group-focus-within:scale-102 motion-safe:group-hover:scale-102"
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

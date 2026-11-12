<script lang="ts">
	import { goto, onNavigate } from '$app/navigation';
	import ArrowIcon from '#lib/components/arrow-icon.svelte';
	import LinkButton from '#lib/components/link-button.svelte';
	import Seo from '#lib/components/seo.svelte';
	import WorkLabel from '#lib/components/work-label.svelte';
	import WorkNeighbours from '#lib/components/work-neighbours.svelte';
	import WorkPager from '#lib/components/work-pager.svelte';
	import WorkPhotos, { WORK_PHOTO_SIZES } from '#lib/components/work-photos.svelte';
	import { ORDERED_WORKS, photosOf } from '#lib/content/images.ts';
	import type { Work } from '#lib/content/works.ts';
	import { pageHref, workHref } from '#lib/i18n/href.ts';
	import { copyFor, nameOf, workSlugFromPath, type Lang } from '#lib/i18n/index.ts';
	import { walkTowards } from '#lib/motion/page-transition.ts';
	import { transit } from '#lib/motion/transit.svelte.ts';
	import { preloadPicture } from '#lib/utils/preload-picture.ts';

	interface Props {
		lang: Lang;
		work: Work;
	}

	let { lang, work }: Props = $props();

	const copy = $derived(copyFor(lang).works);
	const name = $derived(nameOf(work, lang));
	const photos = $derived(photosOf(work));
	const position = $derived(ORDERED_WORKS.findIndex((candidate) => candidate.slug === work.slug));
	const previous = $derived(ORDERED_WORKS[position - 1]);
	const next = $derived(ORDERED_WORKS[position + 1]);

	const photoAlt = (index: number): string => copy.detail.photoAlt(name, index + 1, photos.length);

	// The left and right arrow keys walk to the works before and after.
	const walkWithArrowKeys = (event: KeyboardEvent): void => {
		if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
			return;
		const neighbour =
			event.key === 'ArrowLeft' ? previous : event.key === 'ArrowRight' ? next : undefined;
		if (neighbour) goto(workHref(lang, neighbour.slug));
	};

	// Going on to another work is a walk along the wall, to one side or the other.
	onNavigate(({ to }) => {
		const slug = workSlugFromPath(to?.url.pathname ?? '');
		const target = ORDERED_WORKS.findIndex((candidate) => candidate.slug === slug);
		if (target < 0 || target === position) return;
		return walkTowards(target > position ? 'next' : 'previous');
	});

	// The neighbours' first photos load quietly, so walking on shows them at once.
	$effect(() => {
		for (const neighbour of [previous, next]) {
			const photo = neighbour && photosOf(neighbour)[0];
			if (photo) preloadPicture(photo, WORK_PHOTO_SIZES);
		}
	});
</script>

<svelte:window onkeydown={walkWithArrowKeys} />

<Seo {lang} page="works" {work} />

<!-- The way back leads to this work's place on the wall, and the arrows to its neighbours. -->
<div
	class="mx-auto flex max-w-page items-center justify-between gap-6 px-gutter pt-4 pb-6 md:pt-8 md:pb-10"
>
	<LinkButton href={`${pageHref(lang, 'works')}#${work.slug}`} variant="text" class="group gap-3">
		<ArrowIcon
			direction="left"
			class="transition-transform duration-300 group-hover:-translate-x-1"
		/>
		{copy.title}
	</LinkButton>
	<WorkPager {lang} place={position + 1} total={ORDERED_WORKS.length} {previous} {next} />
</div>

<!--
	The photos are the page, and the words matter less. On a wide screen the photos take
	everything a slim label leaves, in a wider space than the rest of the site, and the label
	stays in view beside them. On a phone the first photo comes first, then the label, then
	the rest. Everything is made anew for each work, so it arrives again when the visitor walks on.
-->
<article
	class="mx-auto grid max-w-wide gap-x-16 gap-y-10 px-gutter pb-section lg:grid-cols-work lg:gap-y-6"
>
	{#key work.slug}
		<!-- Once pages change with a transition, it brings this photo in. Until then it arrives by itself. -->
		<WorkPhotos
			photos={photos.slice(0, 1)}
			alt={photoAlt}
			eager
			travels
			class={transit.carries ? undefined : 'motion-safe:animate-arrive'}
		/>
		<WorkLabel
			{lang}
			{work}
			class="arrive-after-1 motion-safe:animate-arrive lg:sticky lg:top-gutter lg:row-span-2 lg:self-start"
		/>
		{#if photos.length > 1}
			<WorkPhotos photos={photos.slice(1)} alt={(index) => photoAlt(index + 1)} />
		{/if}
	{/key}
</article>

<WorkNeighbours {lang} {previous} {next} class="mx-auto max-w-page px-gutter pb-section" />
